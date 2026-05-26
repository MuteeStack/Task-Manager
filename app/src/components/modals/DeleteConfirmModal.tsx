import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  open: boolean;
  taskTitle: string;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function DeleteConfirmModal({ open, taskTitle, onClose, onConfirm, loading }: DeleteConfirmModalProps) {
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
            className="w-full max-w-[360px] bg-[#0f172a] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-[#f59e0b]/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-[#f59e0b]" />
              </div>

              <h3 className="text-[#f8fafc] font-semibold text-lg mb-2">Delete this task?</h3>
              <p className="text-[#94a3b8] text-sm mb-1">
                &ldquo;{taskTitle.length > 40 ? taskTitle.slice(0, 40) + '...' : taskTitle}&rdquo;
              </p>
              <p className="text-[#64748b] text-xs">This action cannot be undone.</p>
            </div>

            <div className="flex gap-2 px-6 pb-6">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-[#94a3b8] hover:bg-white/[0.04] border border-white/[0.08] transition-colors"
              >
                Cancel
              </button>
              <motion.button
                onClick={onConfirm}
                disabled={loading}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#ef4444] to-[#dc2626] hover:from-[#dc2626] hover:to-[#b91c1c] shadow-[0_4px_16px_rgba(239,68,68,0.25)] disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                ) : (
                  'Delete'
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
