'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiBookOpen, FiShield, FiBriefcase } from 'react-icons/fi';
import NeuButton from './NeuButton';
import clsx from 'clsx';

const DEMO_ACCOUNTS = [
  {
    role: 'student',
    name: 'Arjun Reddy',
    email: 'arjun@mrdu.edu',
    password: 'test123',
    icon: FiUser,
    accent: 'var(--electric)',
    accentBg: 'bg-[var(--electric)]',
    label: 'Student',
    dashboard: 'Learner Portal',
  },
  {
    role: 'faculty',
    name: 'Prof. Lakshmi Naidu',
    email: 'lakshmi.naidu@mrdu.edu',
    password: 'faculty123',
    icon: FiBookOpen,
    accent: 'var(--sky)',
    accentBg: 'bg-[var(--sky)]',
    label: 'Faculty',
    dashboard: 'Classroom Intelligence Hub',
  },
  {
    role: 'admin',
    name: 'Dr. Srinivas Rao',
    email: 'admin@mrdu.edu',
    password: 'admin123',
    icon: FiShield,
    accent: 'var(--violet)',
    accentBg: 'bg-[var(--violet)]',
    label: 'Admin',
    dashboard: 'Institutional Command Center',
  },
  {
    role: 'recruiter',
    name: 'Ravi Menon',
    email: 'ravi@techspark.com',
    password: 'recruiter123',
    icon: FiBriefcase,
    accent: 'var(--hotpink)',
    accentBg: 'bg-[var(--hotpink)]',
    label: 'Recruiter',
    dashboard: 'Talent Exchange',
  },
];

export default function DemoLoginToggle({ onDemoLogin, loading = false }) {
  const [selectedRole, setSelectedRole] = useState(null);

  const handleSelectRole = (account) => {
    setSelectedRole(account.role);
  };

  const selectedAccount = DEMO_ACCOUNTS.find((a) => a.role === selectedRole);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-bold mb-1">Choose a Demo Role</h3>
        <p className="text-sm opacity-60">Experience Bridgify as any role instantly</p>
      </div>

      {/* Role tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {DEMO_ACCOUNTS.map((account) => {
          const Icon = account.icon;
          const isSelected = selectedRole === account.role;
          return (
            <motion.button
              type="button"
              key={account.role}
              className={clsx(
                'neu-card-static p-4 flex flex-col items-center gap-2 cursor-pointer transition-all',
                isSelected && 'ring-4 ring-offset-2'
              )}
              style={isSelected ? { 
                borderColor: account.accent, 
                ringColor: account.accent,
                background: `color-mix(in srgb, ${account.accent} 10%, var(--paper))` 
              } : undefined}
              whileHover={{ y: -3, x: -3 }}
              whileTap={{ y: 1, x: 1 }}
              onClick={() => handleSelectRole(account)}
            >
              <div
                className="w-12 h-12 rounded-2xl border-[3px] border-[var(--ink)] flex items-center justify-center text-white"
                style={{ background: account.accent, boxShadow: 'var(--shadow-brutal-sm)' }}
              >
                <Icon size={22} />
              </div>
              <span className="font-bold text-sm">{account.label}</span>
              <span className="text-[11px] opacity-50 leading-tight text-center">{account.dashboard}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Selected account card */}
      <AnimatePresence mode="wait">
        {selectedAccount && (
          <motion.div
            key={selectedAccount.role}
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="overflow-hidden"
          >
            <div className="neu-card-static p-4 space-y-3" style={{ borderColor: selectedAccount.accent }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl border-2 border-[var(--ink)] flex items-center justify-center text-white font-bold"
                  style={{ background: selectedAccount.accent }}
                >
                  {selectedAccount.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-sm">{selectedAccount.name}</p>
                  <p className="text-xs font-mono opacity-60">{selectedAccount.email}</p>
                </div>
              </div>
              <NeuButton
                variant={selectedAccount.role === 'student' ? 'primary' : selectedAccount.role === 'faculty' ? 'sky' : selectedAccount.role === 'admin' ? 'violet' : 'hotpink'}
                className="w-full"
                loading={loading}
                onClick={() => onDemoLogin(selectedAccount.email, selectedAccount.password)}
              >
                Enter as Demo {selectedAccount.label}
              </NeuButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { DEMO_ACCOUNTS };
