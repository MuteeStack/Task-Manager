import { useState, useCallback, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import type { UserProfile } from '@/types';

interface AppLayoutProps {
  user: UserProfile | null;
  onLogout: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Overview of your tasks and productivity' },
  '/tasks': { title: 'My Tasks', subtitle: 'Manage and organize your tasks' },
  '/analytics': { title: 'Analytics', subtitle: 'Insights into your productivity' },
  '/calendar': { title: 'Calendar', subtitle: 'View tasks by due date' },
  '/settings': { title: 'Settings', subtitle: 'Manage your account preferences' },
};

export function AppLayout({ user, onLogout, searchValue, onSearchChange }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleToggleCollapse = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const handleMobileMenuOpen = useCallback(() => {
    setMobileMenuOpen(true);
  }, []);

  const handleMobileClose = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const pageInfo = pageTitles[location.pathname] || { title: 'TaskFlow' };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const isTypingTarget = e.target instanceof HTMLElement
        && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable);

      if (isTypingTarget) return;

      if (e.key.toLowerCase() === 'n' && location.pathname !== '/') {
        e.preventDefault();
        navigate('/', { state: { openCreateTask: true } });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-[#050214]">
      <Sidebar
        user={user}
        onLogout={onLogout}
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
        mobileOpen={mobileMenuOpen}
        onMobileClose={handleMobileClose}
      />

      <div
        className={`
          transition-all duration-300 ease-in-out
          lg:ml-[280px]
          ${sidebarCollapsed ? 'lg:!ml-[72px]' : ''}
        `}
      >
        <TopBar
          user={user}
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          onMobileMenuOpen={handleMobileMenuOpen}
        />

        <main className="p-4 lg:p-8 min-h-[calc(100vh-64px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
