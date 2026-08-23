'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import {
  FiHome, FiTarget, FiTrendingUp, FiBookOpen, FiMessageSquare,
  FiShield, FiSearch, FiAward, FiClipboard, FiMenu, FiX,
  FiUsers, FiBarChart2, FiFileText, FiAlertTriangle, FiGrid,
  FiBriefcase, FiActivity, FiLayers,
  FiDatabase, FiCpu, FiEdit3, FiPackage, FiHeart,
  FiStar, FiLogOut, FiMap, FiUser
} from 'react-icons/fi';
import useAuthStore from '@/lib/store/authStore';

const roleConfigs = {
  student: {
    title: 'Learner Portal',
    accent: 'var(--electric)',
    accentBg: '#4B3AFF',
    basePath: '/student',
    links: [
      { href: '/student', label: 'Dashboard', icon: FiHome },
      { href: '/student/profile', label: 'Profile, Skills & Wallet', icon: FiUser },
      { href: '/student/readiness', label: 'Career Path & Study Tracker', icon: FiTarget },
      { href: '/student/assignments', label: 'Assignments & ML Practice', icon: FiEdit3 },
      { href: '/student/study-hub', label: 'Study Hub & AI Guardian', icon: FiBookOpen },
      { href: '/student/feed', label: 'Tech & Industry Feed', icon: FiTrendingUp },
      { href: '/student/opportunities', label: 'Opportunities & Matches', icon: FiSearch },
      { href: '/student/benchmarks', label: 'Benchmarks & Leaderboard', icon: FiAward },
    ],
  },
  faculty: {
    title: 'Classroom Hub',
    accent: 'var(--sky)',
    accentBg: '#3AC1FF',
    basePath: '/faculty',
    links: [
      { href: '/faculty', label: 'Dashboard', icon: FiHome },
      { href: '/faculty/classrooms', label: 'My Classrooms & Students', icon: FiUsers },
      { href: '/faculty/feed', label: 'Academic Feed', icon: FiTrendingUp },
      { href: '/faculty/assessments', label: 'Assessments', icon: FiClipboard },
      { href: '/faculty/lecture-bridge', label: 'Lecture Bridge & OCR', icon: FiLayers },
      { href: '/faculty/notes', label: 'Notes Generator', icon: FiEdit3 },
      { href: '/faculty/ppt', label: 'PPT Maker', icon: FiFileText },
      { href: '/faculty/dropout-radar', label: 'Dropout Radar', icon: FiAlertTriangle },
      { href: '/faculty/cohort-heatmap', label: 'Cohort Heatmap', icon: FiGrid },
      { href: '/faculty/mentorship', label: 'Mentorship', icon: FiUsers },
    ],
  },
  admin: {
    title: 'Command Center',
    accent: 'var(--violet)',
    accentBg: '#A960FF',
    basePath: '/admin',
    links: [
      { href: '/admin', label: 'Dashboard', icon: FiHome },
      { href: '/admin/students', label: 'Student Directory', icon: FiUsers },
      { href: '/admin/placement-cc', label: 'Placement CC', icon: FiBriefcase },
      { href: '/admin/naac-report', label: 'NAAC Report', icon: FiFileText },
      { href: '/admin/skill-ledger', label: 'Skill Ledger', icon: FiDatabase },
      { href: '/admin/analytics', label: 'Analytics', icon: FiBarChart2 },
    ],
  },
  recruiter: {
    title: 'Talent Exchange',
    accent: 'var(--hotpink)',
    accentBg: '#FF3D9A',
    basePath: '/recruiter',
    links: [
      { href: '/recruiter', label: 'Dashboard', icon: FiHome },
      { href: '/recruiter/search', label: 'Candidate Search', icon: FiSearch },
      { href: '/recruiter/postings', label: 'Job Postings', icon: FiBriefcase },
      { href: '/recruiter/internships', label: 'Unpaid Internships', icon: FiBookOpen },
      { href: '/recruiter/ps', label: 'PS Generator', icon: FiEdit3 },
      { href: '/recruiter/pipeline', label: 'Hiring Pipelines', icon: FiActivity },
      { href: '/recruiter/feed', label: 'Industry Feed', icon: FiTrendingUp },
    ],
  },
};

export default function Sidebar({ role }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout } = useAuthStore();
  const router = useRouter();
  const config = roleConfigs[role];

  if (!config) return null;

  const isActive = (href) => {
    if (href === config.basePath) return pathname === href;
    return pathname.startsWith(href);
  };

  const navContent = (
    <nav className="flex flex-col h-full">
      <div className="px-5 pt-16 lg:pt-5 pb-4">
        <Link href="/" className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-full border-[3px] border-[var(--ink)] flex items-center justify-center" style={{ background: config.accentBg }}>
            <div className="w-3 h-3 bg-white rounded-full" />
          </div>
          <span className="font-bold text-lg tracking-tight">Bridgify</span>
        </Link>
        <p className="text-sm font-bold mt-2 px-1" style={{ color: config.accentBg }}>
          {config.title}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 space-y-1 pb-4">
        {config.links.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx('sidebar-link', active && 'sidebar-link-active')}
              style={active ? { background: config.accentBg, color: 'white', borderColor: 'var(--ink)' } : undefined}
              onClick={() => setMobileOpen(false)}
            >
              <link.icon size={18} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="px-3 pb-4 border-t-[3px] border-[var(--ink)] pt-3 mt-auto">
        <button
          onClick={async () => { await logout(); setMobileOpen(false); router.push('/login'); }}
          className="sidebar-link w-full text-[var(--coral)] hover:bg-red-50"
        >
          <FiLogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );

  const mobileBottomLinks = config.links.slice(0, 5);

  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white fixed left-0 top-0 z-40 overflow-hidden border-r-[3px] border-[var(--ink)]">
        {navContent}
      </aside>

      <button
        className="lg:hidden fixed top-4 left-4 z-[60] neu-btn neu-btn-white p-2 !shadow-[3px_3px_0px_0px_var(--ink)]"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-[45] lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 h-full w-72 bg-white border-r-[3px] border-[var(--ink)] z-[55] lg:hidden overflow-y-auto"
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {navContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t-[3px] border-[var(--ink)] z-50 flex items-center justify-around px-2 safe-area-bottom">
        {mobileBottomLinks.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                'flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-xl transition-all min-w-[56px]',
                active ? 'text-white' : 'text-gray-500'
              )}
              style={active ? { background: config.accentBg } : undefined}
            >
              <link.icon size={20} />
              <span className="text-[10px] font-bold leading-tight truncate max-w-[56px]">
                {link.label.split(' ')[0]}
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
