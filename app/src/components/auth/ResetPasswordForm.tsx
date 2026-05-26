import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface ResetPasswordFormProps {
  onSubmit: (email: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  onBack: () => void;
}

export function ResetPasswordForm({ onSubmit, loading, error, onBack }: ResetPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [fieldError, setFieldError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setFieldError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError('Invalid email address');
      return;
    }
    setFieldError('');
    await onSubmit(email);
    setSent(true);
  };

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center py-6"
          >
            <div className="w-16 h-16 rounded-full bg-[#22c55e]/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-[#22c55e]" />
            </div>
            <h3 className="text-[#f8fafc] font-semibold mb-2">Check your email</h3>
            <p className="text-[#94a3b8] text-sm mb-6">
              We&apos;ve sent password reset instructions to<br />
              <span className="text-[#a78bfa]">{email}</span>
            </p>
            <button
              onClick={onBack}
              className="text-sm text-[#94a3b8] hover:text-[#f8fafc] transition-colors"
            >
              Back to sign in
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label className="block text-[#94a3b8] text-xs font-medium uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFieldError(''); }}
                  placeholder="you@example.com"
                  className={`w-full bg-white/[0.03] border rounded-lg text-[#f8fafc] text-sm placeholder:text-[#64748b] pl-10 pr-4 py-2.5 outline-none transition-all focus:border-[#8b5cf6]/35 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] ${fieldError ? 'border-[#ef4444]/50' : 'border-white/[0.08]'}`}
                />
              </div>
              {fieldError && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#ef4444] text-xs mt-1">
                  {fieldError}
                </motion.p>
              )}
            </div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-sm">
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] text-white font-medium text-sm shadow-[0_4px_16px_rgba(139,92,246,0.25)] disabled:opacity-50 transition-all"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Send Reset Link'
              )}
            </motion.button>

            <button
              type="button"
              onClick={onBack}
              className="w-full flex items-center justify-center gap-1.5 text-sm text-[#94a3b8] hover:text-[#f8fafc] transition-colors py-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
