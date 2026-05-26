import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Tag, Flag } from 'lucide-react';
import { format } from 'date-fns';
import type { Priority, CreateTaskInput } from '@/types';

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (task: CreateTaskInput) => Promise<void>;
}

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/20' },
  { value: 'medium', label: 'Medium', color: 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/20' },
  { value: 'high', label: 'High', color: 'text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/20' },
];

export function CreateTaskModal({ open, onClose, onSubmit }: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('general');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});
  const [submitting, setSubmitting] = useState(false);

  const categories = ['general', 'work', 'personal', 'urgent', 'health', 'learning'];

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = 'Title is required';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        category,
      });
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setCategory('general');
      onClose();
    } catch {
      setFieldErrors({ submit: 'Failed to create task' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[480px] bg-[#0f172a] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h2 className="text-[#f8fafc] font-semibold text-lg">Create Task</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#64748b] hover:text-[#94a3b8] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[#94a3b8] text-xs font-medium uppercase tracking-wider mb-1.5">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setFieldErrors((p) => ({ ...p, title: undefined })); }}
                  placeholder="What needs to be done?"
                  className={`w-full bg-white/[0.03] border rounded-lg text-[#f8fafc] text-sm placeholder:text-[#64748b] px-4 py-2.5 outline-none transition-all focus:border-[#8b5cf6]/35 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] ${fieldErrors.title ? 'border-[#ef4444]/50' : 'border-white/[0.08]'}`}
                />
                {fieldErrors.title && <p className="text-[#ef4444] text-xs mt-1">{fieldErrors.title}</p>}
              </div>

              <div>
                <label className="block text-[#94a3b8] text-xs font-medium uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add details (optional)"
                  rows={3}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg text-[#f8fafc] text-sm placeholder:text-[#64748b] px-4 py-2.5 outline-none transition-all focus:border-[#8b5cf6]/35 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] resize-y"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-[#94a3b8] text-xs font-medium uppercase tracking-wider mb-1.5">
                  <Flag className="w-3 h-3 inline mr-1" />
                  Priority
                </label>
                <div className="flex gap-2">
                  {priorities.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPriority(p.value)}
                      className={`
                        flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-all
                        ${priority === p.value ? p.color : 'text-[#64748b] border-white/[0.08] hover:bg-white/[0.03]'}
                      `}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[#94a3b8] text-xs font-medium uppercase tracking-wider mb-1.5">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg text-[#f8fafc] text-sm px-4 py-2.5 outline-none transition-all focus:border-[#8b5cf6]/35 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] [color-scheme:dark]"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[#94a3b8] text-xs font-medium uppercase tracking-wider mb-1.5">
                    <Tag className="w-3 h-3 inline mr-1" />
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg text-[#f8fafc] text-sm px-4 py-2.5 outline-none focus:border-[#8b5cf6]/35 transition-all cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c} className="bg-[#0f172a]">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {fieldErrors.submit && (
                <p className="text-[#ef4444] text-xs">{fieldErrors.submit}</p>
              )}

              {/* Footer */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-[#94a3b8] hover:bg-white/[0.04] border border-white/[0.08] transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] shadow-[0_4px_16px_rgba(139,92,246,0.25)] disabled:opacity-50 transition-all"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Create Task'
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
