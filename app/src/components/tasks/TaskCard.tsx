import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GripVertical, MoreVertical, Calendar, Tag, Check, Pencil, Trash2, Flag,
} from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import type { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  dragHandleProps?: Record<string, unknown>;
}

const priorityConfig = {
  high: { color: 'text-[#ef4444]', bgColor: 'bg-[#ef4444]/10', borderColor: 'border-[#ef4444]/20', label: 'High' },
  medium: { color: 'text-[#f59e0b]', bgColor: 'bg-[#f59e0b]/10', borderColor: 'border-[#f59e0b]/20', label: 'Medium' },
  low: { color: 'text-[#22c55e]', bgColor: 'bg-[#22c55e]/10', borderColor: 'border-[#22c55e]/20', label: 'Low' },
};

const categoryColors: Record<string, string> = {
  general: 'bg-[#64748b]/10 text-[#94a3b8]',
  work: 'bg-[#3b82f6]/10 text-[#60a5fa]',
  personal: 'bg-[#8b5cf6]/10 text-[#a78bfa]',
  urgent: 'bg-[#ef4444]/10 text-[#f87171]',
  health: 'bg-[#22c55e]/10 text-[#4ade80]',
  learning: 'bg-[#f59e0b]/10 text-[#fbbf24]',
};

export function TaskCard({ task, onToggle, onEdit, onDelete, dragHandleProps }: TaskCardProps) {
  const [checked, setChecked] = useState(task.status === 'completed');
  const [showMenu, setShowMenu] = useState(false);
  const [exiting, setExiting] = useState(false);

  const priority = priorityConfig[task.priority];
  const isCompleted = task.status === 'completed';
  const isOverdue = task.dueDate && !isCompleted && isPast(task.dueDate) && !isToday(task.dueDate);

  const handleToggle = () => {
    setChecked(!checked);
    if (!isCompleted) {
      setExiting(true);
      setTimeout(() => onToggle(task.id), 1600);
    } else {
      onToggle(task.id);
    }
  };

  const handleDelete = () => {
    setExiting(true);
    setTimeout(() => onDelete(task.id), 400);
  };

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          layout
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{
            opacity: 0,
            height: 0,
            marginBottom: 0,
            paddingTop: 0,
            paddingBottom: 0,
            transition: {
              opacity: { delay: 0.6, duration: 0.4 },
              height: { delay: 0.6, duration: 0.5, type: 'spring', stiffness: 300, damping: 30 },
            },
          }}
          whileHover={{ y: -1 }}
          className={`
            group relative flex items-start gap-3 p-4 rounded-[10px]
            bg-white/[0.03] border border-white/[0.05]
            shadow-[0_2px_8px_rgba(0,0,0,0.15)]
            hover:bg-white/[0.06] hover:border-white/[0.10]
            transition-all duration-150 cursor-pointer
            ${isCompleted ? 'opacity-60' : ''}
          `}
        >
          {/* Drag Handle */}
          {dragHandleProps && (
            <div {...dragHandleProps} className="mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
              <GripVertical className="w-4 h-4 text-[#64748b]" />
            </div>
          )}

          {/* Custom Checkbox */}
          <motion.button
            onClick={(e) => { e.stopPropagation(); handleToggle(); }}
            whileTap={{ scale: 1.2 }}
            className={`
              mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200
              ${isCompleted
                ? 'bg-[#22c55e] border-[#22c55e]'
                : 'border-white/[0.20] hover:border-[#8b5cf6]/50'
              }
            `}
          >
            <AnimatePresence>
              {isCompleted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Content */}
          <div className="flex-1 min-w-0" onClick={() => onEdit(task)}>
            <div className="relative">
              <h4 className={`text-sm font-medium truncate ${isCompleted ? 'line-through text-[#64748b]' : 'text-[#f8fafc]'}`}>
                {task.title}
              </h4>
              {isCompleted && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="absolute top-1/2 left-0 right-0 h-[2px] bg-[#f8fafc]/30 origin-left"
                />
              )}
            </div>

            {task.description && (
              <p className="text-[#64748b] text-xs mt-0.5 line-clamp-1">{task.description}</p>
            )}

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {/* Category badge */}
              {task.category && task.category !== 'general' && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${categoryColors[task.category] || categoryColors.general}`}>
                  <Tag className="w-2.5 h-2.5" />
                  {task.category}
                </span>
              )}

              {/* Priority badge */}
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${priority.bgColor} ${priority.color} ${priority.borderColor}`}>
                <Flag className="w-2.5 h-2.5" />
                {priority.label}
              </span>

              {/* Due date */}
              {task.dueDate && (
                <span className={`inline-flex items-center gap-1 text-[10px] ${isOverdue ? 'text-[#ef4444]' : 'text-[#64748b]'}`}>
                  <Calendar className="w-2.5 h-2.5" />
                  {isToday(task.dueDate) ? 'Today' : format(task.dueDate, 'MMM d')}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="relative flex-shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#64748b] hover:text-[#94a3b8] transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-full mt-1 w-36 bg-[#0f172a] border border-white/[0.08] rounded-lg shadow-xl z-20 overflow-hidden"
                  >
                    <button
                      onClick={() => { setShowMenu(false); onEdit(task); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#94a3b8] hover:bg-white/[0.04] hover:text-[#f8fafc] transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => { setShowMenu(false); handleDelete(); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#ef4444] hover:bg-[#ef4444]/5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
