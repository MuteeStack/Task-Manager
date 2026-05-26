import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function LoginForm({ onSubmit, loading, error }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email address';
    if (!password) errors.password = 'Password is required';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-[#94a3b8] text-xs font-medium uppercase tracking-wider mb-1.5">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: undefined })); }}
            placeholder="you@example.com"
            className={`
              w-full bg-white/[0.03] border rounded-lg text-[#f8fafc] text-sm placeholder:text-[#64748b]
              pl-10 pr-4 py-2.5 outline-none transition-all duration-200
              focus:border-[#8b5cf6]/35 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)]
              ${fieldErrors.email ? 'border-[#ef4444]/50' : 'border-white/[0.08]'}
            `}
          />
        </div>
        {fieldErrors.email && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[#ef4444] text-xs mt-1">
            {fieldErrors.email}
          </motion.p>
        )}
      </div>

      <div>
        <label className="block text-[#94a3b8] text-xs font-medium uppercase tracking-wider mb-1.5">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: undefined })); }}
            placeholder="Enter your password"
            className={`
              w-full bg-white/[0.03] border rounded-lg text-[#f8fafc] text-sm placeholder:text-[#64748b]
              pl-10 pr-10 py-2.5 outline-none transition-all duration-200
              focus:border-[#8b5cf6]/35 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)]
              ${fieldErrors.password ? 'border-[#ef4444]/50' : 'border-white/[0.08]'}
            `}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#94a3b8] transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {fieldErrors.password && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[#ef4444] text-xs mt-1">
            {fieldErrors.password}
          </motion.p>
        )}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-sm"
        >
          {error}
        </motion.div>
      )}

      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        className="
          w-full flex items-center justify-center gap-2 py-2.5 rounded-lg
          bg-gradient-to-r from-[#8b5cf6] to-[#6366f1]
          text-white font-medium text-sm
          shadow-[0_4px_16px_rgba(139,92,246,0.25)]
          hover:shadow-[0_6px_20px_rgba(139,92,246,0.35)]
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-150
        "
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            Sign In
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </motion.button>
    </form>
  );
}
