'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FiBell, FiUser, FiLogOut, FiChevronDown } from 'react-icons/fi';
import useAuthStore from '@/lib/store/authStore';
import { useNotificationStore } from '@/lib/store/segStore';
import NeuBadge from './NeuBadge';

const roleColors = {
  student: { bg: 'var(--electric)', label: 'Student' },
  faculty: { bg: 'var(--sky)', label: 'Faculty' },
  admin: { bg: 'var(--violet)', label: 'Admin' },
  recruiter: { bg: 'var(--hotpink)', label: 'Recruiter' },
};

export default function Navbar({ user }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { logout } = useAuthStore();
  const router = useRouter();
  const { notifications, unreadCount } = useNotificationStore();
  const roleInfo = roleColors[user?.role] || roleColors.student;

  return (
    <header className="h-16 bg-white border-b-[3px] border-[var(--ink)] flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3 lg:gap-4">
        <div className="lg:hidden w-10" />
        <div className="hidden md:block">
          <h2 className="text-lg font-bold capitalize">{user?.role} Dashboard</h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            className="relative p-2 rounded-xl border-[3px] border-[var(--ink)] bg-white hover:bg-gray-50 transition-colors shadow-[3px_3px_0px_0px_var(--ink)] active:shadow-[1px_1px_0px_0px_var(--ink)] active:translate-x-[2px] active:translate-y-[2px]"
            onClick={() => { setShowNotifications(!showNotifications); setShowDropdown(false); }}
            aria-label="Notifications"
          >
            <FiBell size={20} />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--coral)] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[var(--ink)]"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 top-14 w-80 max-h-96 bg-white border-[3px] border-[var(--ink)] rounded-2xl shadow-[6px_6px_0px_0px_var(--ink)] overflow-hidden z-50"
              >
                <div className="p-4 border-b-[3px] border-[var(--ink)] bg-[var(--paper)] flex justify-between items-center">
                  <h3 className="font-bold text-sm">Notifications</h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="w-6 h-6 rounded-full border-2 border-[var(--ink)] bg-gray-100 flex items-center justify-center font-bold text-xs hover:bg-gray-200 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="overflow-y-auto max-h-72">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-sm font-medium">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.slice(0, 8).map((n, i) => (
                      <div key={n._id || i} className={`p-3 border-b border-gray-200 last:border-b-0 ${!n.isRead ? 'bg-blue-50/50' : ''}`}>
                        <p className="font-bold text-sm">{n.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{n.body}</p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <button
            className="flex items-center gap-2 p-1.5 pr-3 rounded-xl border-[3px] border-[var(--ink)] bg-white hover:bg-gray-50 transition-colors shadow-[3px_3px_0px_0px_var(--ink)] active:shadow-[1px_1px_0px_0px_var(--ink)] active:translate-x-[2px] active:translate-y-[2px]"
            onClick={() => { setShowDropdown(!showDropdown); setShowNotifications(false); }}
          >
            <div
              className="w-8 h-8 rounded-lg border-[2px] border-[var(--ink)] flex items-center justify-center text-white font-bold text-sm"
              style={{ background: roleInfo.bg }}
            >
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="hidden sm:block text-sm font-bold max-w-[100px] truncate">
              {user?.name?.split(' ')[0]}
            </span>
            <FiChevronDown size={14} className="hidden sm:block text-gray-400" />
          </button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 top-14 w-56 bg-white border-[3px] border-[var(--ink)] rounded-2xl shadow-[6px_6px_0px_0px_var(--ink)] overflow-hidden z-50"
              >
                <div className="p-4 border-b-[3px] border-[var(--ink)] bg-[var(--paper)]">
                  <p className="font-bold text-sm">{user?.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                  <NeuBadge variant="primary" className="mt-2">{roleInfo.label}</NeuBadge>
                </div>
                <div className="p-2">
                  <button
                    onClick={async () => { await logout(); router.push('/login'); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[var(--coral)] font-bold text-sm hover:bg-red-50 transition-colors"
                  >
                    <FiLogOut size={16} />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
