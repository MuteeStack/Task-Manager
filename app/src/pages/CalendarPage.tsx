import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addMonths, subMonths, isSameMonth, isSameDay, isToday, addDays,
} from 'date-fns';
import { useTasks } from '@/hooks/useTasks';
import { TaskCard } from '@/components/tasks/TaskCard';
import { CreateTaskModal } from '@/components/modals/CreateTaskModal';
import { useToast } from '@/hooks/useToast';
import type { Task, CreateTaskInput } from '@/types';

interface CalendarPageProps {
  userId: string;
}

export function CalendarPage({ userId }: CalendarPageProps) {
  const { tasks, createTask, deleteTask, toggleTaskComplete } = useTasks(userId);
  const toast = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const selectedDateTasks = useMemo(() => {
    return tasks.filter((t) => t.dueDate && isSameDay(t.dueDate, selectedDate));
  }, [tasks, selectedDate]);

  const getTasksForDate = useCallback(
    (date: Date) => tasks.filter((t) => t.dueDate && isSameDay(t.dueDate, date)),
    [tasks]
  );

  const handleCreateTask = useCallback(
    async (input: CreateTaskInput) => {
      await createTask({ ...input, dueDate: selectedDate });
      toast.success('Task created');
    },
    [createTask, selectedDate, toast]
  );

  const handleEditTask = useCallback((_task: Task) => {
    // Edit via dashboard
  }, []);

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      await deleteTask(taskId);
      toast.success('Task deleted');
    },
    [deleteTask, toast]
  );

  const handleToggleTask = useCallback(
    async (taskId: string) => {
      await toggleTaskComplete(taskId);
    },
    [toggleTaskComplete]
  );

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 rounded-lg hover:bg-white/[0.06] text-[#94a3b8] hover:text-[#f8fafc] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-[#f8fafc] font-semibold text-lg min-w-[160px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 rounded-lg hover:bg-white/[0.06] text-[#94a3b8] hover:text-[#f8fafc] transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => { setCurrentMonth(new Date()); setSelectedDate(new Date()); }}
            className="ml-2 px-3 py-1.5 rounded-lg text-xs font-medium text-[#94a3b8] hover:bg-white/[0.04] border border-white/[0.08] transition-colors"
          >
            Today
          </button>
        </div>
        <motion.button
          onClick={() => setCreateModalOpen(true)}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] shadow-[0_4px_16px_rgba(139,92,246,0.25)] transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Task
        </motion.button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl overflow-hidden">
        {/* Week day headers */}
        <div className="grid grid-cols-7 border-b border-white/[0.06]">
          {weekDays.map((d) => (
            <div key={d} className="px-3 py-3 text-center">
              <span className="text-[#64748b] text-xs font-medium uppercase tracking-wider">{d}</span>
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {days.map((d, i) => {
            const isCurrentMonth = isSameMonth(d, currentMonth);
            const isSelected = isSameDay(d, selectedDate);
            const isTodayDate = isToday(d);
            const dateTasks = getTasksForDate(d);
            const completedCount = dateTasks.filter((t) => t.status === 'completed').length;

            return (
              <motion.button
                key={i}
                onClick={() => setSelectedDate(d)}
                className={`
                  relative min-h-[80px] lg:min-h-[100px] p-2 border-b border-r border-white/[0.04]
                  text-left transition-colors
                  ${isCurrentMonth ? 'hover:bg-white/[0.03]' : 'bg-white/[0.01]'}
                  ${isSelected ? 'bg-[rgba(139,92,246,0.08)]' : ''}
                `}
              >
                <span className={`
                  text-xs font-medium w-6 h-6 rounded-full flex items-center justify-center
                  ${isTodayDate ? 'bg-[#8b5cf6] text-white' : isCurrentMonth ? 'text-[#94a3b8]' : 'text-[#64748b]/50'}
                  ${isSelected && !isTodayDate ? 'text-[#a78bfa]' : ''}
                `}>
                  {format(d, 'd')}
                </span>

                {/* Task indicators */}
                {dateTasks.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {dateTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        className={`
                          h-1.5 rounded-full
                          ${task.status === 'completed' ? 'bg-[#22c55e]/60' :
                            task.priority === 'high' ? 'bg-[#ef4444]/60' :
                            task.priority === 'medium' ? 'bg-[#f59e0b]/60' :
                            'bg-[#3b82f6]/60'}
                        `}
                      />
                    ))}
                    {dateTasks.length > 3 && (
                      <span className="text-[#64748b] text-[9px]">+{dateTasks.length - 3}</span>
                    )}
                  </div>
                )}

                {completedCount > 0 && dateTasks.length > 0 && (
                  <div className="absolute bottom-1 right-1">
                    <span className="text-[9px] text-[#22c55e]">{completedCount}/{dateTasks.length}</span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Tasks */}
      <div>
        <h3 className="text-[#f8fafc] font-semibold text-sm mb-3">
          Tasks for {format(selectedDate, 'EEEE, MMMM d')}
        </h3>
        <AnimatePresence mode="popLayout">
          {selectedDateTasks.length > 0 ? (
            <div className="space-y-3">
              {selectedDateTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={handleToggleTask}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-[#64748b] text-sm"
            >
              No tasks scheduled for this date
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <CreateTaskModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} onSubmit={handleCreateTask} />
    </div>
  );
}
