'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiBell, FiLogOut, FiUser, FiGlobe } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '@/lib/store/authStore';
import api from '@/lib/api';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: 'EN' },
  { code: 'hi', label: 'Hindi', flag: 'HI' },
  { code: 'mr', label: 'Marathi', flag: 'MR' },
  { code: 'te', label: 'Telugu', flag: 'TE' },
  { code: 'ta', label: 'Tamil', flag: 'TA' },
];

export default function Navbar({ accent = 'var(--electric)' }) {
  const router = useRouter();
  const { user, clearUser } = useAuthStore();
  const [langOpen, setLangOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const saved = document.cookie.match(/lang=(\w+)/);
    if (saved) setCurrentLang(saved[1]);
  }, []);

  const switchLang = (code) => {
    setCurrentLang(code);
    document.cookie = `lang=${code};path=/;max-age=${365 * 24 * 60 * 60}`;
    setLangOpen(false);
    window.location.reload();
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch { /* ignore */ }
    clearUser();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-[var(--paper)] border-b-[3px] border-[var(--ink)] px-4 lg:px-6">
      <div className="flex items-center justify-between h-16 lg:pl-64">
        <div className="lg:hidden w-10" />
        
        <div className="flex-1" />

        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="relative">
            <button
              className="neu-btn neu-btn-ghost neu-btn-sm gap-1"
              onClick={() => { setLangOpen(!langOpen); setNotifOpen(false); }}
            >
              <FiGlobe size={16} />
              <span className="text-xs font-bold">{currentLang.toUpperCase()}</span>
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  className="absolute right-0 top-full mt-2 neu-card-static p-2 min-w-[160px] z-50"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[var(--acid)] transition-colors ${
                        currentLang === lang.code ? 'bg-[var(--acid)]' : ''
                      }`}
                      onClick={() => switchLang(lang.code)}
                    >
                      <span className="font-mono mr-2">{lang.flag}</span>
                      {lang.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              className="neu-btn neu-btn-ghost neu-btn-sm relative"
              onClick={() => { setNotifOpen(!notifOpen); setLangOpen(false); }}
            >
              <FiBell size={18} />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--coral)] text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-[var(--ink)]">
                  {notifications.length}
                </span>
              )}
            </button>
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  className="absolute right-0 top-full mt-2 neu-card-static p-4 w-80 max-h-96 overflow-y-auto z-50"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <h4 className="font-bold mb-3">Notifications</h4>
                  {notifications.length === 0 ? (
                    <p className="text-sm opacity-50">No new notifications</p>
                  ) : (
                    notifications.map((n, i) => (
                      <div key={i} className="py-2 border-b border-[var(--ink)]/10 last:border-0">
                        <p className="text-sm font-semibold">{n.title}</p>
                        <p className="text-xs opacity-60">{n.body}</p>
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User info */}
          {user && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl border-2 border-[var(--ink)]">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white" style={{ background: accent }}>
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-semibold max-w-[120px] truncate">{user.name}</span>
            </div>
          )}

          {/* Logout */}
          <button
            className="neu-btn neu-btn-ghost neu-btn-sm"
            onClick={handleLogout}
            title="Logout"
          >
            <FiLogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
