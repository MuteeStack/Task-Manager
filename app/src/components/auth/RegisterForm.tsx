import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, CheckCircle2 } from 'lucide-react';

interface RegisterFormProps {
  onSubmit: (email: string, password: string, displayName: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function RegisterForm({ onSubmit, loading, error }: RegisterFormProps) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});

  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getPasswordStrength();
  const strengthColors = ['bg-[#ef4444]', 'bg-[#f59e0b]', 'bg-[#f59e0b]', 'bg-[#22c55e]', 'bg-[#22c55e]'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!displayName.trim()) errors.displayName = 'Name is required';
    if (!email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email address';
    if (!password) errors.password = 'Password is required';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (!agreed) errors.agreed = 'You must agree to the terms';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(email, password, displayName);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-[#94a3b8] text-xs font-medium uppercase tracking-wider mb-1.5">Full Name</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
          <input
            type="text"
            value={displayName}
            onChange={(e) => { setDisplayName(e.target.value); setFieldErrors((p) => ({ ...p, displayName: undefined })); }}
            placeholder="John Doe"
            className={`w-full bg-white/[0.03] border rounded-lg text-[#f8fafc] text-sm placeholder:text-[#64748b] pl-10 pr-4 py-2.5 outline-none transition-all focus:border-[#8b5cf6]/35 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] ${fieldErrors.displayName ? 'border-[#ef4444]/50' : 'border-white/[0.08]'}`}
          />
        </div>
        {fieldErrors.displayName && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#ef4444] text-xs mt-1">{fieldErrors.displayName}</motion.p>}
      </div>

      <div>
        <label className="block text-[#94a3b8] text-xs font-medium uppercase tracking-wider mb-1.5">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: undefined })); }}
            placeholder="you@example.com"
            className={`w-full bg-white/[0.03] border rounded-lg text-[#f8fafc] text-sm placeholder:text-[#64748b] pl-10 pr-4 py-2.5 outline-none transition-all focus:border-[#8b5cf6]/35 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] ${fieldErrors.email ? 'border-[#ef4444]/50' : 'border-white/[0.08]'}`}
          />
        </div>
        {fieldErrors.email && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#ef4444] text-xs mt-1">{fieldErrors.email}</motion.p>}
      </div>

      <div>
        <label className="block text-[#94a3b8] text-xs font-medium uppercase tracking-wider mb-1.5">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: undefined })); }}
            placeholder="Create a password"
            className={`w-full bg-white/[0.03] border rounded-lg text-[#f8fafc] text-sm placeholder:text-[#64748b] pl-10 pr-10 py-2.5 outline-none transition-all focus:border-[#8b5cf6]/35 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] ${fieldErrors.password ? 'border-[#ef4444]/50' : 'border-white/[0.08]'}`}
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#94a3b8]" tabIndex={-1}>
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {password && (
          <div className="mt-2">
            <div className="flex gap-1 h-1">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`flex-1 rounded-full transition-colors ${i < strength ? strengthColors[strength] : 'bg-white/[0.06]'}`} />
              ))}
            </div>
            <p className="text-xs mt-1 text-[#64748b]">{strengthLabels[strength]}</p>
          </div>
        )}
        {fieldErrors.password && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#ef4444] text-xs mt-1">{fieldErrors.password}</motion.p>}
      </div>

      <div>
        <label className="block text-[#94a3b8] text-xs font-medium uppercase tracking-wider mb-1.5">Confirm Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors((p) => ({ ...p, confirmPassword: undefined })); }}
            placeholder="Confirm your password"
            className={`w-full bg-white/[0.03] border rounded-lg text-[#f8fafc] text-sm placeholder:text-[#64748b] pl-10 pr-4 py-2.5 outline-none transition-all focus:border-[#8b5cf6]/35 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] ${fieldErrors.confirmPassword ? 'border-[#ef4444]/50' : 'border-white/[0.08]'}`}
          />
        </div>
        {fieldErrors.confirmPassword && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#ef4444] text-xs mt-1">{fieldErrors.confirmPassword}</motion.p>}
      </div>

      <label className="flex items-start gap-2.5 cursor-pointer group">
        <div className={`
          w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all
          ${agreed ? 'bg-[#8b5cf6] border-[#8b5cf6]' : 'border-white/[0.15] group-hover:border-white/25'}
        `}>
          {agreed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
        </div>
        <input type="checkbox" checked={agreed} onChange={(e) => { setAgreed(e.target.checked); setFieldErrors((p) => ({ ...p, agreed: undefined })); }} className="sr-only" />
        <span className="text-[#94a3b8] text-xs leading-relaxed">
          I agree to the Terms of Service and Privacy Policy
        </span>
      </label>
      {fieldErrors.agreed && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#ef4444] text-xs -mt-2">{fieldErrors.agreed}</motion.p>}

      {error && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-sm">
          {error}
        </motion.div>
      )}

      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] text-white font-medium text-sm shadow-[0_4px_16px_rgba(139,92,246,0.25)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.35)] disabled:opacity-50 transition-all"
      >
        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
      </motion.button>
    </form>
  );
}
