import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { motion } from 'framer-motion';
import { ListTodo, ArrowLeft, Sparkles } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

type AuthMode = 'login' | 'register' | 'reset';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, login, register, resetPassword } = useAuth();
  const toast = useToast();
  const [mode, setMode] = useState<AuthMode>('login');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      const returnUrl = searchParams.get('returnUrl') || '/';
      navigate(returnUrl, { replace: true });
    }
  }, [user, loading, navigate, searchParams]);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mode !== 'login') {
        setMode('login');
        setError(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode]);

  const handleLogin = async (email: string, password: string) => {
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (email: string, password: string, displayName: string) => {
    setError(null);
    setSubmitting(true);
    try {
      await register(email, password, displayName);
      toast.success('Account created! Please check your email to verify.');
      setMode('login');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      await resetPassword(email);
      toast.success('Password reset email sent!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send reset email';
      setError(message);
      throw err;
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050214] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-[#8b5cf6]/30 border-t-[#8b5cf6] rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050214] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[#8b5cf6]/8 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[#6366f1]/8 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[420px] relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#6366f1] flex items-center justify-center mx-auto mb-4 shadow-xl shadow-[#8b5cf6]/25">
            <ListTodo className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-[#f8fafc] text-2xl font-bold tracking-tight flex items-center justify-center gap-2">
            TaskFlow
            <Sparkles className="w-5 h-5 text-[#a78bfa]" />
          </h1>
          <p className="text-[#64748b] text-sm mt-1">Organize your tasks with elegance</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)] p-6 lg:p-8">
          {/* Title */}
          <div className="mb-6">
            {mode === 'login' && (
              <div>
                <h2 className="text-[#f8fafc] font-semibold text-lg">Welcome back</h2>
                <p className="text-[#64748b] text-sm mt-0.5">Sign in to your account</p>
              </div>
            )}
            {mode === 'register' && (
              <div className="flex items-center gap-2">
                <button onClick={() => switchMode('login')} className="p-1 rounded-lg hover:bg-white/[0.06] text-[#64748b] transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-[#f8fafc] font-semibold text-lg">Create account</h2>
                  <p className="text-[#64748b] text-sm mt-0.5">Start managing your tasks</p>
                </div>
              </div>
            )}
            {mode === 'reset' && (
              <div>
                <h2 className="text-[#f8fafc] font-semibold text-lg">Reset password</h2>
                <p className="text-[#64748b] text-sm mt-0.5">We&apos;ll send you a reset link</p>
              </div>
            )}
          </div>

          {/* Forms */}
          {mode === 'login' && (
            <LoginForm onSubmit={handleLogin} loading={submitting} error={error} />
          )}
          {mode === 'register' && (
            <RegisterForm onSubmit={handleRegister} loading={submitting} error={error} />
          )}
          {mode === 'reset' && (
            <ResetPasswordForm onSubmit={handleResetPassword} loading={submitting} error={error} onBack={() => switchMode('login')} />
          )}

          {/* Footer links */}
          {mode === 'login' && (
            <div className="mt-6 text-center space-y-3">
              <p className="text-[#64748b] text-sm">
                Don&apos;t have an account?{' '}
                <button onClick={() => switchMode('register')} className="text-[#a78bfa] hover:text-[#8b5cf6] font-medium transition-colors">
                  Create one
                </button>
              </p>
              <button onClick={() => switchMode('reset')} className="text-[#64748b] hover:text-[#94a3b8] text-xs transition-colors">
                Forgot password?
              </button>
            </div>
          )}
          {mode === 'register' && (
            <div className="mt-6 text-center">
              <p className="text-[#64748b] text-sm">
                Already have an account?{' '}
                <button onClick={() => switchMode('login')} className="text-[#a78bfa] hover:text-[#8b5cf6] font-medium transition-colors">
                  Sign in
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-[#64748b] text-xs mt-6">
          By using TaskFlow, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
