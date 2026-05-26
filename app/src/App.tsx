import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { Toaster } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { TasksPage } from '@/pages/TasksPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { HelpPage } from '@/pages/HelpPage';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050214] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#6366f1] flex items-center justify-center shadow-lg shadow-[#8b5cf6]/25">
            <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <p className="text-[#64748b] text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function NotFound() {
  return (
    <div className="min-h-screen bg-[#050214] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-[#f8fafc] text-6xl font-bold mb-4">404</h1>
        <p className="text-[#94a3b8] text-sm mb-6">Page not found</p>
        <a href="/" className="text-[#a78bfa] hover:text-[#8b5cf6] text-sm transition-colors">
          Go back home
        </a>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user, logout } = useAuth();
  const [searchValue, setSearchValue] = useState('');

  // Reset search on route change
  useEffect(() => {
    setSearchValue('');
  }, [window.location.pathname]);

  // Public routes (no auth required)
  const publicRoutes = (
    <>
      <Route path="/login" element={
        user ? <Navigate to="/" replace /> : <LoginPage />
      } />
    </>
  );

  // Protected routes (auth required)
  const protectedRoutes = (
    <Route element={
      <AuthGuard>
        <AppLayout
          user={user}
          onLogout={logout}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
        />
      </AuthGuard>
    }>
      <Route index element={<DashboardPage userId={user?.uid || ''} searchValue={searchValue} />} />
      <Route path="tasks" element={<TasksPage userId={user?.uid || ''} searchValue={searchValue} />} />
      <Route path="analytics" element={<AnalyticsPage userId={user?.uid || ''} />} />
      <Route path="calendar" element={<CalendarPage userId={user?.uid || ''} />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="help" element={<HelpPage />} />
    </Route>
  );

  return (
    <Routes>
      {publicRoutes}
      {protectedRoutes}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  const { resolvedTheme } = useTheme();

  return (
    <>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0f172a',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#f8fafc',
            fontSize: '13px',
          },
        }}
        theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      />
    </>
  );
}
