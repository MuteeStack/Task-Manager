import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ListTodo } from 'lucide-react';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { CreateTaskModal } from '@/components/modals/CreateTaskModal';
import { EditTaskModal } from '@/components/modals/EditTaskModal';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import { useTasks } from '@/hooks/useTasks';
import { useToast } from '@/hooks/useToast';
import type { Task, FilterType, Priority, CreateTaskInput } from '@/types';

interface TasksPageProps {
  userId: string;
  searchValue: string;
}

export function TasksPage({ userId, searchValue }: TasksPageProps) {
  const { tasks, loading, createTask, updateTask, deleteTask, toggleTaskComplete } = useTasks(userId);
  const toast = useToast();

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState('order');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    if (activeFilter === 'today') {
      result = result.filter((t) => t.dueDate && new Date(t.dueDate).toDateString() === new Date().toDateString());
    } else if (activeFilter === 'upcoming') {
      result = result.filter((t) => t.dueDate && new Date(t.dueDate) > new Date() && t.status !== 'completed');
    } else if (activeFilter === 'completed') {
      result = result.filter((t) => t.status === 'completed');
    }

    if (priorityFilter !== 'all') {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    if (searchValue.trim()) {
      const query = searchValue.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query)
      );
    }

    switch (sortBy) {
      case 'dueDate':
        result.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.getTime() - b.dueDate.getTime();
        });
        break;
      case 'priority':
        const order = { high: 0, medium: 1, low: 2 };
        result.sort((a, b) => order[a.priority] - order[b.priority]);
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
      toast.success('Task created');
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

  return (
    <div className="max-w-4xl space-y-6">
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] shadow-[0_4px_16px_rgba(139,92,246,0.25)] transition-all"
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

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <motion.div key={`skeleton-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-20 rounded-[10px] bg-white/[0.03] border border-white/[0.05] animate-pulse" />
            ))
          ) : filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} onToggle={handleToggleTask} onEdit={handleEditTask} onDelete={handleDeleteTask} />
            ))
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8b5cf6]/20 to-[#6366f1]/20 flex items-center justify-center mx-auto mb-4">
                <ListTodo className="w-8 h-8 text-[#8b5cf6]/50" />
              </div>
              <h3 className="text-[#f8fafc] font-medium mb-1">
                {searchValue ? 'No tasks found' : 'No tasks yet'}
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

      <CreateTaskModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} onSubmit={handleCreateTask} />
      <EditTaskModal open={editModalOpen} task={editingTask} onClose={() => { setEditModalOpen(false); setEditingTask(null); }} onSubmit={handleUpdateTask} />
      <DeleteConfirmModal open={deleteModalOpen} taskTitle={deletingTask?.title || ''} onClose={() => { setDeleteModalOpen(false); setDeletingTask(null); }} onConfirm={handleConfirmDelete} />
    </div>
  );
}
