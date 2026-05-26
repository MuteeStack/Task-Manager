import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Bell, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

export function SettingsPage() {
  const { user, updateUserProfile, changePassword } = useAuth();
  const toast = useToast();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
      setEmail(user.email);
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await updateUserProfile({ displayName });
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword(newPassword);
      toast.success('Password updated');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error('Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    // In a real app, this would delete the account
    toast.info('Account deletion is not available in demo mode');
    setShowDeleteConfirm(false);
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8b5cf6]/30 to-[#6366f1]/30 border border-[#8b5cf6]/30 flex items-center justify-center">
            <span className="text-xl font-semibold text-[#a78bfa]">{user.initials}</span>
          </div>
          <div>
            <h3 className="text-[#f8fafc] font-semibold">{user.displayName}</h3>
            <p className="text-[#64748b] text-sm">{user.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[#94a3b8] text-xs font-medium uppercase tracking-wider mb-1.5">
              <User className="w-3 h-3 inline mr-1" />
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg text-[#f8fafc] text-sm px-4 py-2.5 outline-none focus:border-[#8b5cf6]/35 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all"
            />
          </div>

          <div>
            <label className="block text-[#94a3b8] text-xs font-medium uppercase tracking-wider mb-1.5">
              <Mail className="w-3 h-3 inline mr-1" />
              Email
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg text-[#64748b] text-sm px-4 py-2.5 cursor-not-allowed"
            />
            <p className="text-[#64748b] text-xs mt-1">Email cannot be changed</p>
          </div>

          <motion.button
            onClick={handleSaveProfile}
            disabled={savingProfile}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] shadow-[0_4px_16px_rgba(139,92,246,0.25)] disabled:opacity-50 transition-all"
          >
            {savingProfile ? 'Saving...' : 'Save Profile'}
          </motion.button>
        </div>
      </motion.div>

      {/* Change Password */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-6"
      >
        <h3 className="text-[#f8fafc] font-semibold text-sm mb-4">Change Password</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-[#94a3b8] text-xs font-medium uppercase tracking-wider mb-1.5">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg text-[#f8fafc] text-sm placeholder:text-[#64748b] px-4 py-2.5 outline-none focus:border-[#8b5cf6]/35 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all"
            />
          </div>
          <div>
            <label className="block text-[#94a3b8] text-xs font-medium uppercase tracking-wider mb-1.5">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg text-[#f8fafc] text-sm placeholder:text-[#64748b] px-4 py-2.5 outline-none focus:border-[#8b5cf6]/35 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all"
            />
          </div>
          <motion.button
            onClick={handleChangePassword}
            disabled={savingPassword || !newPassword || !confirmPassword}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] shadow-[0_4px_16px_rgba(139,92,246,0.25)] disabled:opacity-50 transition-all"
          >
            {savingPassword ? 'Updating...' : 'Update Password'}
          </motion.button>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-[#94a3b8]" />
            <div>
              <h3 className="text-[#f8fafc] font-semibold text-sm">Notifications</h3>
              <p className="text-[#64748b] text-xs">Receive task reminders and updates</p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={notifications}
            onClick={() => setNotifications((prev) => !prev)}
            className={
              `
              relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/40
              ${notifications ? 'bg-[#8b5cf6]' : 'bg-white/[0.10]'}
            `
            }
          >
            <div
              className={
                `
              absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform
              ${notifications ? 'translate-x-5' : 'translate-x-0.5'}
            `
              }
            />
          </button>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#ef4444]/[0.04] border border-[#ef4444]/[0.15] rounded-xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-[#ef4444]" />
          <h3 className="text-[#ef4444] font-semibold text-sm">Danger Zone</h3>
        </div>
        <p className="text-[#94a3b8] text-sm mb-4">
          Once you delete your account, there is no going back. All your tasks and data will be permanently removed.
        </p>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="px-4 py-2 rounded-lg text-sm font-medium text-[#ef4444] bg-[#ef4444]/10 hover:bg-[#ef4444]/20 border border-[#ef4444]/20 transition-colors"
        >
          <Trash2 className="w-4 h-4 inline mr-1.5" />
          Delete Account
        </button>

        {showDeleteConfirm && (
          <div className="mt-4 p-4 bg-[#0f172a] rounded-lg border border-[#ef4444]/20">
            <p className="text-[#f8fafc] text-sm mb-3">Are you sure? This action cannot be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#94a3b8] hover:bg-white/[0.04] border border-white/[0.08] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-[#ef4444] to-[#dc2626] transition-colors"
              >
                Yes, Delete My Account
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
