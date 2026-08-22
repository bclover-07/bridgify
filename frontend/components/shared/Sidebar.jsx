'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { 
  FiHome, FiTarget, FiTrendingUp, FiBookOpen, FiMessageSquare,
  FiShield, FiSearch, FiAward, FiClipboard, FiMenu, FiX,
  FiUsers, FiBarChart2, FiFileText, FiAlertTriangle, FiGrid,
  FiBriefcase, FiActivity, FiSettings, FiLayers, FiStar,
  FiDatabase, FiCpu, FiEdit3, FiPackage, FiPieChart, FiHeart,
  FiMapPin, FiCompass
} from 'react-icons/fi';

const roleConfigs = {
  student: {
    title: 'Learner Portal',
    accent: 'var(--electric)',
    basePath: '/student',
    links: [
      { href: '/student', label: 'Dashboard', icon: FiHome },
      { href: '/student/readiness', label: 'Readiness Simulator', icon: FiTarget },
      { href: '/student/learning-path', label: 'Learning Path', icon: FiTrendingUp },
      { href: '/student/study-hub', label: 'Study Hub', icon: FiBookOpen },
      { href: '/student/soft-skills', label: 'Soft Skills Coach', icon: FiMessageSquare },
      { href: '/student/wallet', label: 'Skill Wallet', icon: FiShield },
      { href: '/student/opportunities', label: 'Opportunities', icon: FiSearch },
      { href: '/student/benchmarks', label: 'Benchmarks', icon: FiAward },
      { href: '/student/assessments', label: 'Assessments', icon: FiClipboard },
    ],
  },
  faculty: {
    title: 'Classroom Intelligence Hub',
    accent: 'var(--sky)',
    basePath: '/faculty',
    links: [
      { href: '/faculty', label: 'Dashboard', icon: FiHome },
      { href: '/faculty/learning-feed', label: 'Learning Feed', icon: FiTrendingUp },
      { href: '/faculty/assessments', label: 'Assessments', icon: FiClipboard },
      { href: '/faculty/notes', label: 'Notes Generator', icon: FiEdit3 },
      { href: '/faculty/ppt', label: 'PPT Maker', icon: FiFileText },
      { href: '/faculty/dropout-radar', label: 'Dropout Radar', icon: FiAlertTriangle },
      { href: '/faculty/cohort-heatmap', label: 'Cohort Heatmap', icon: FiGrid },
      { href: '/faculty/lecture-bridge', label: 'Lecture Bridge', icon: FiLayers },
      { href: '/faculty/mentorship', label: 'Mentorship', icon: FiUsers },
    ],
  },
  admin: {
    title: 'Institutional Command Center',
    accent: 'var(--violet)',
    basePath: '/admin',
    links: [
      { href: '/admin', label: 'Dashboard', icon: FiHome },
      { href: '/admin/students', label: 'Student Directory', icon: FiUsers },
      { href: '/admin/placement-cc', label: 'Placement CC', icon: FiBriefcase },
      { href: '/admin/naac-report', label: 'NAAC/NIRF Report', icon: FiFileText },
      { href: '/admin/skill-ledger', label: 'Skill Ledger', icon: FiDatabase },
      { href: '/admin/analytics', label: 'Analytics', icon: FiBarChart2 },
      { href: '/admin/agent-status', label: 'Agent Status', icon: FiCpu },
    ],
  },
  recruiter: {
    title: 'Talent Exchange',
    accent: 'var(--hotpink)',
    basePath: '/recruiter',
    links: [
      { href: '/recruiter', label: 'Dashboard', icon: FiHome },
      { href: '/recruiter/ps', label: 'PS Generator', icon: FiEdit3 },
      { href: '/recruiter/search', label: 'Candidate Search', icon: FiSearch },
      { href: '/recruiter/marketplace', label: 'Marketplace', icon: FiPackage },
      { href: '/recruiter/pipeline', label: 'Pipeline', icon: FiActivity },
      { href: '/recruiter/fair-hiring', label: 'Fair Hiring', icon: FiHeart },
      { href: '/recruiter/feedback', label: 'Feedback', icon: FiStar },
    ],
  },
};

export default function Sidebar({ role }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const config = roleConfigs[role];

  if (!config) return null;

  const isActive = (href) => {
    if (href === config.basePath) return pathname === href;
    return pathname.startsWith(href);
  };

  const nav = (
    <nav className="flex flex-col gap-1 px-3 py-4">
      <div className="px-3 mb-4">
        <Link href="/" className="text-sm font-bold opacity-50 hover:opacity-100 transition-opacity">
          Bridgify
        </Link>
        <h2 className="text-lg font-bold mt-1" style={{ color: config.accent }}>
          {config.title}
        </h2>
      </div>

      {config.links.map((link) => {
        const active = isActive(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              'sidebar-link',
              active && 'sidebar-link-active'
            )}
            style={active ? { background: config.accent, color: 'white' } : undefined}
            onClick={() => setMobileOpen(false)}
          >
            <link.icon size={18} />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen border-r-[3px] border-[var(--ink)] bg-[var(--paper)] fixed left-0 top-0 z-40 overflow-y-auto">
        {nav}
      </aside>

      {/* Mobile hamburger */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 neu-btn neu-btn-ghost p-2"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/30 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 h-full w-72 bg-[var(--paper)] border-r-[3px] border-[var(--ink)] z-50 lg:hidden overflow-y-auto"
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {nav}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
