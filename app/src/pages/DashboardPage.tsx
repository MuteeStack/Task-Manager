import { useState, useMemo, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, CheckCircle2, Clock, AlertTriangle, Plus, ListTodo, TrendingUp } from 'lucide-react';
import { isToday, isFuture, subDays } from 'date-fns';
import { HeroSection } from '@/components/dashboard/HeroSection';
import { StatCard } from '@/components/dashboard/StatCard';
import { AnalyticsPanel } from '@/components/dashboard/AnalyticsPanel';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { CreateTaskModal } from '@/components/modals/CreateTaskModal';
import { EditTaskModal } from '@/components/modals/EditTaskModal';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import { useTasks } from '@/hooks/useTasks';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useToast } from '@/hooks/useToast';
import type { Task, FilterType, Priority, CreateTaskInput, ActivityItem } from '@/types';

interface DashboardPageProps {
  userId: string;
  searchValue: string;
}

function generateMockActivities(tasks: Task[]): ActivityItem[] {
  const types = ['created', 'completed', 'updated'] as const;
  const recentTasks = tasks.slice(0, 5);
  return recentTasks.map((task, i) => ({
    id: `activity-${i}`,
    userId: task.userId,
    taskId: task.id,
    type: types[i % types.length],
    description: `${types[i % types.length] === 'created' ? 'Created' : types[i % types.length] === 'completed' ? 'Completed' : 'Updated'} task "${task.title}"`,
    timestamp: subDays(new Date(), i * 0.5),
  }));
}

export function DashboardPage({ userId, searchValue }: DashboardPageProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { tasks, loading, createTask, updateTask, deleteTask, toggleTaskComplete } = useTasks(userId);
  const { stats, priorityData, completionData } = useAnalytics(tasks);
  const toast = useToast();

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState('order');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    const state = location.state as { openCreateTask?: boolean } | null;
    if (state?.openCreateTask) {
      setCreateModalOpen(true);
      navigate('.', { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isTypingTarget = e.target instanceof HTMLElement
        && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable);

      if (e.key.toLowerCase() === 'n' && !e.ctrlKey && !e.metaKey && !e.altKey && !isTypingTarget) {
        e.preventDefault();
        setCreateModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activities = useMemo(() => generateMockActivities(tasks), [tasks]);

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Filter by status
    if (activeFilter === 'today') {
      result = result.filter((t) => t.dueDate && isToday(t.dueDate));
    } else if (activeFilter === 'upcoming') {
      result = result.filter((t) => t.dueDate && isFuture(t.dueDate) && !isToday(t.dueDate) && t.status !== 'completed');
    } else if (activeFilter === 'completed') {
      result = result.filter((t) => t.status === 'completed');
    }

    // Filter by priority
    if (priorityFilter !== 'all') {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    // Search
    if (searchValue.trim()) {
      const query = searchValue.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case 'dueDate':
        result.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.getTime() - b.dueDate.getTime();
        });
        break;
      case 'priority':
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        result.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        break;
      case 'created':
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      default:
        result.sort((a, b) => a.order - b.order);
    }

    return result;
  }, [tasks, activeFilter, priorityFilter, searchValue, sortBy]);

  const handleCreateTask = useCallback(
    async (input: CreateTaskInput) => {
      await createTask(input);
      toast.success('Task created successfully');
    },
    [createTask, toast]
  );

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setEditModalOpen(true);
  }, []);

  const handleUpdateTask = useCallback(
    async (taskId: string, updates: Parameters<typeof updateTask>[1]) => {
      await updateTask(taskId, updates);
      toast.success('Task updated');
    },
    [updateTask, toast]
  );

  const handleDeleteTask = useCallback((taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setDeletingTask(task);
      setDeleteModalOpen(true);
    }
  }, [tasks]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingTask) return;
    await deleteTask(deletingTask.id);
    toast.success('Task deleted');
    setDeleteModalOpen(false);
    setDeletingTask(null);
  }, [deletingTask, deleteTask, toast]);

  const handleToggleTask = useCallback(
    async (taskId: string) => {
      await toggleTaskComplete(taskId);
      const task = tasks.find((t) => t.id === taskId);
      if (task && task.status !== 'completed') {
        toast.success('Task completed!');
      }
    },
    [toggleTaskComplete, tasks, toast]
  );

  const pendingTasksToday = tasks.filter((t) => t.dueDate && isToday(t.dueDate) && t.status !== 'completed').length;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <HeroSection
        userName="there"
        taskCount={pendingTasksToday}
        onNewTask={() => setCreateModalOpen(true)}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Tasks"
          value={stats.totalTasks}
          icon={Layers}
          iconColor="text-[#a78bfa]"
          iconBg="bg-[rgba(139,92,246,0.15)]"
          trend={12}
          delay={0}
        />
        <StatCard
          label="Completed"
          value={stats.completedTasks}
          icon={CheckCircle2}
          iconColor="text-[#22c55e]"
          iconBg="bg-[rgba(34,197,94,0.15)]"
          trend={8}
          delay={0.1}
        />
        <StatCard
          label="In Progress"
          value={stats.inProgressTasks}
          icon={Clock}
          iconColor="text-[#f59e0b]"
          iconBg="bg-[rgba(245,158,11,0.15)]"
          delay={0.2}
        />
        <StatCard
          label="Overdue"
          value={stats.overdueTasks}
          icon={AlertTriangle}
          iconColor="text-[#ef4444]"
          iconBg="bg-[rgba(239,68,68,0.15)]"
          trend={-5}
          delay={0.3}
        />
      </div>

      {/* Main Content: Tasks + Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-[#a78bfa]" />
              <h2 className="text-[#f8fafc] font-semibold text-lg">My Tasks</h2>
              <span className="text-[#64748b] text-sm">({filteredTasks.length})</span>
            </div>
            <motion.button
              onClick={() => setCreateModalOpen(true)}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] shadow-[0_4px_16px_rgba(139,92,246,0.25)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.35)] transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              New Task
            </motion.button>
          </div>

          <TaskFilters
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            searchValue={searchValue}
            onSearchChange={() => {}}
            sortBy={sortBy}
            onSortChange={setSortBy}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={setPriorityFilter}
          />

          {/* Tasks */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {loading ? (
                // Skeleton loading
                Array.from({ length: 3 }).map((_, i) => (
                  <motion.div
                    key={`skeleton-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-20 rounded-[10px] bg-white/[0.03] border border-white/[0.05] animate-pulse"
                  />
                ))
              ) : filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={handleToggleTask}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                  />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8b5cf6]/20 to-[#6366f1]/20 flex items-center justify-center mx-auto mb-4">
                    <ListTodo className="w-8 h-8 text-[#8b5cf6]/50" />
                  </div>
                  <h3 className="text-[#f8fafc] font-medium mb-1">
                    {searchValue ? 'No tasks found' : activeFilter !== 'all' ? 'No tasks in this filter' : 'No tasks yet'}
                  </h3>
                  <p className="text-[#64748b] text-sm mb-4">
                    {searchValue ? 'Try a different search term' : 'Create your first task to get started'}
                  </p>
                  {!searchValue && (
                    <motion.button
                      onClick={() => setCreateModalOpen(true)}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] shadow-[0_4px_16px_rgba(139,92,246,0.25)] transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Create Task
                    </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Analytics Sidebar */}
        <div className="space-y-6">
          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-5"
          >
            <h3 className="text-[#f8fafc] font-semibold text-sm mb-3">Completion Rate</h3>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.completionRate}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#6366f1]"
                />
              </div>
              <span className="text-[#f8fafc] font-semibold text-sm">{stats.completionRate}%</span>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 text-[#22c55e]" />
              <span className="text-[#22c55e] text-xs">{stats.completedTasks} of {stats.totalTasks} tasks done</span>
            </div>
          </motion.div>

          <AnalyticsPanel stats={stats} priorityData={priorityData} completionData={completionData} />
          <ActivityTimeline activities={activities} />
        </div>
      </div>

      {/* Modals */}
      <CreateTaskModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} onSubmit={handleCreateTask} />
      <EditTaskModal open={editModalOpen} task={editingTask} onClose={() => { setEditModalOpen(false); setEditingTask(null); }} onSubmit={handleUpdateTask} />
      <DeleteConfirmModal
        open={deleteModalOpen}
        taskTitle={deletingTask?.title || ''}
        onClose={() => { setDeleteModalOpen(false); setDeletingTask(null); }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
