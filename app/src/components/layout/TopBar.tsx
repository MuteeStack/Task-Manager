import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Menu, X, Keyboard } from 'lucide-react';
import type { UserProfile } from '@/types';

interface TopBarProps {
  user: UserProfile | null;
  title: string;
  subtitle?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onMobileMenuOpen: () => void;
  notificationCount?: number;
}

export function TopBar({
  user,
  title,
  subtitle,
  searchValue,
  onSearchChange,
  onMobileMenuOpen,
  notificationCount = 0,
}: TopBarProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setShowNotifications(false);
        setShowShortcuts(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close notifications on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#050214]/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center px-4 lg:px-6">
      <div className="flex items-center gap-3 flex-shrink-0">
        <button
          onClick={onMobileMenuOpen}
          className="lg:hidden p-2 rounded-lg hover:bg-white/[0.06] text-[#94a3b8] transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-[#f8fafc] font-semibold text-lg tracking-tight">{title}</h1>
          {subtitle && <p className="text-[#64748b] text-xs hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md mx-4 lg:mx-8 hidden sm:block">
        <div
          className={`
            relative flex items-center rounded-lg transition-all duration-200
            ${searchFocused
              ? 'bg-white/[0.06] border border-[#8b5cf6]/35 shadow-[0_0_0_3px_rgba(139,92,246,0.1)]'
              : 'bg-white/[0.03] border border-white/[0.08]'
            }
          `}
        >
          <Search className={`w-4 h-4 ml-3 flex-shrink-0 transition-colors ${searchFocused ? 'text-[#a78bfa]' : 'text-[#64748b]'}`} />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search tasks... (press /)"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full bg-transparent border-none outline-none text-[#f8fafc] text-sm placeholder:text-[#64748b] px-3 py-2.5"
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange('')}
              className="mr-2 p-1 rounded hover:bg-white/[0.06] text-[#64748b] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">
        {/* Keyboard Shortcuts */}
        <button
          onClick={() => setShowShortcuts(true)}
          className="hidden md:flex p-2 rounded-lg hover:bg-white/[0.06] text-[#94a3b8] hover:text-[#f8fafc] transition-all duration-150"
          aria-label="Keyboard shortcuts"
        >
          <Keyboard className="w-5 h-5" />
        </button>

        {/* User Avatar */}
        {user && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8b5cf6]/30 to-[#6366f1]/30 border border-[#8b5cf6]/30 flex items-center justify-center ml-1">
            <span className="text-xs font-semibold text-[#a78bfa]">{user.initials}</span>
          </div>
        )}

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-white/[0.06] text-[#94a3b8] hover:text-[#f8fafc] transition-all duration-150"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#ef4444] rounded-full text-[10px] font-medium text-white flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 bg-[#0f172a] border border-white/[0.06] rounded-xl shadow-2xl z-50 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                  <h3 className="text-[#f8fafc] font-medium text-sm">Notifications</h3>
                  <button className="text-[#64748b] text-xs hover:text-[#94a3b8] transition-colors">
                    Mark all read
                  </button>
                </div>
                <div className="py-2">
                  <div className="px-4 py-3 text-center text-[#64748b] text-sm">
                    No new notifications
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0f172a] border border-white/[0.06] rounded-xl p-6 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#f8fafc] font-semibold">Keyboard Shortcuts</h3>
                <button
                  onClick={() => setShowShortcuts(false)}
                  className="p-1 rounded-lg hover:bg-white/[0.06] text-[#64748b] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {[
                  { key: '/', action: 'Focus search' },
                  { key: 'N', action: 'New task' },
                  { key: 'Escape', action: 'Close modal / Cancel' },
                  { key: '?', action: 'Show shortcuts' },
                ].map((shortcut) => (
                  <div
                    key={shortcut.key}
                    className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0"
                  >
                    <span className="text-[#94a3b8] text-sm">{shortcut.action}</span>
                    <kbd className="px-2 py-1 rounded bg-white/[0.06] text-[#f8fafc] text-xs font-mono border border-white/[0.08]">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
