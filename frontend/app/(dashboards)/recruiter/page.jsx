"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import NeuCard from '@/components/shared/NeuCard';
import NeuBadge from '@/components/shared/NeuBadge';
import NeuButton from '@/components/shared/NeuButton';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import { FiUsers, FiBriefcase, FiBookOpen, FiEdit3, FiActivity, FiSearch, FiTrendingUp, FiCheckCircle, FiArrowRight, FiSliders } from 'react-icons/fi';
import api from '@/lib/api';
import Link from 'next/link';

export default function RecruiterDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/recruiter/dashboard')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Candidate Matches', value: '142', icon: FiUsers, href: '/recruiter/search', bg: '#FF3D9A' },
    { label: 'Active Placement Drives', value: data?.stats?.totalDrives || '4', icon: FiBriefcase, href: '/recruiter/postings', bg: '#4B3AFF' },
    { label: 'Unpaid Internships', value: '6', icon: FiBookOpen, href: '/recruiter/internships', bg: '#2FE3A3' },
    { label: 'Shortlisted Pipeline', value: data?.stats?.shortlistedCount || '8', icon: FiActivity, href: '/recruiter/pipeline', bg: '#FFB020' },
  ];

  const quickActions = [
    {
      title: '📝 Problem Statement Generator (PS Maker)',
      description: 'Use Agent 08 to generate real-world industry problem challenges for candidate assessments.',
      href: '/recruiter/ps',
      color: 'var(--hotpink)',
      badge: 'Agent 08 AI',
    },
    {
      title: '🔍 Verified Candidate Talent Search',
      description: 'Query verified Skill Evidence Graphs (SEG) with skill thresholds and natural language search.',
      href: '/recruiter/search',
      color: 'var(--electric)',
      badge: 'Vector Search',
    },
    {
      title: '💼 Placement Job Openings Manager',
      description: 'Post and manage full-time placement job roles, compensation packages, and application streams.',
      href: '/recruiter/postings',
      color: 'var(--sky)',
      badge: 'Placements',
    },
    {
      title: '🎓 Unpaid Skill Credit Internships Portal',
      description: 'Offer 3-6 month unpaid skill credit internships with micro-credentials for student practical experience.',
      href: '/recruiter/internships',
      color: 'var(--mint)',
      badge: 'Unpaid Track',
    },
    {
      title: '📊 Kanban Hiring Pipelines & AI Shortlisting',
      description: 'Manage candidates in dual pipelines (Placements & Internships) with AI Auto-Shortlisting Temperature controls.',
      href: '/recruiter/pipeline',
      color: 'var(--violet)',
      badge: 'Dual Pipeline',
    },
  ];

  return (
    <PageTransition className="space-y-6">
      {/* Welcome Banner */}
      <StaggerItem>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-1">
              Welcome Back, {data?.profile?.name || 'Recruiter'}! 💼
            </h1>
            <p className="text-gray-500 font-medium">
              {data?.profile?.company || 'TechSpark Innovations'} · {data?.profile?.designation || 'Senior Talent Acquisition'}
            </p>
          </div>
          <Link href="/recruiter/ps">
            <NeuButton variant="hotpink" icon={FiEdit3}>
              Launch PS Generator
            </NeuButton>
          </Link>
        </div>
      </StaggerItem>

      {/* Clickable Executive KPI Cards */}
      <StaggerItem className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Link key={i} href={s.href}>
            <motion.div whileHover={{ y: -4, scale: 1.02 }} className="transition-all cursor-pointer">
              <NeuCard className="p-5 bg-white hover:border-[var(--ink)] shadow-[4px_4px_0px_#000]">
                <div
                  className="w-10 h-10 rounded-xl border-[3px] border-[var(--ink)] flex items-center justify-center text-white mb-3 shadow-[3px_3px_0px_0px_var(--ink)]"
                  style={{ background: s.bg }}
                >
                  <s.icon size={18} />
                </div>
                <p className="text-2xl md:text-3xl font-bold">{s.value}</p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mt-1">{s.label}</p>
              </NeuCard>
            </motion.div>
          </Link>
        ))}
      </StaggerItem>

      {/* Quick Action Navigation Hub */}
      <StaggerItem className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          ⚡ Recruiter Quick Actions & Tools
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((act, idx) => (
            <Link key={idx} href={act.href}>
              <motion.div whileHover={{ y: -3 }} className="h-full cursor-pointer">
                <NeuCard className="p-5 bg-white h-full flex flex-col justify-between border-[3px] border-[var(--ink)] shadow-[4px_4px_0px_#000] hover:bg-gray-50 transition-all">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <NeuBadge variant="info">{act.badge}</NeuBadge>
                      <FiArrowRight className="text-gray-400 group-hover:text-black" />
                    </div>
                    <h3 className="font-bold text-base text-gray-900 mb-2 leading-snug">{act.title}</h3>
                    <p className="text-xs text-gray-600 font-medium leading-relaxed">{act.description}</p>
                  </div>
                  <div className="pt-4 border-t border-gray-100 mt-3 text-xs font-bold text-[var(--electric)] flex items-center gap-1">
                    Open Feature →
                  </div>
                </NeuCard>
              </motion.div>
            </Link>
          ))}
        </div>
      </StaggerItem>

      {/* Recent Shortlisted Candidates & Active Drives Snapshot */}
      <StaggerItem className="grid md:grid-cols-2 gap-6">
        <NeuCard className="p-5 bg-white space-y-3 border-[3px] border-[var(--ink)] shadow-[4px_4px_0px_#000]">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-bold text-base flex items-center gap-2">
              <FiCheckCircle className="text-emerald-600" /> Recent Shortlisted Applicants
            </h3>
            <Link href="/recruiter/pipeline">
              <NeuBadge variant="primary" className="cursor-pointer">View Pipeline →</NeuBadge>
            </Link>
          </div>
          {data?.shortlisted?.length > 0 ? (
            <div className="space-y-2">
              {data.shortlisted.slice(0, 4).map((cand, i) => (
                <div key={cand._id || i} className="p-3 border-2 border-[var(--ink)] rounded-xl bg-[var(--paper)] flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-sm text-gray-900">{cand.name}</p>
                    <p className="text-gray-500 font-medium">{cand.student?.branch} · CGPA: {cand.student?.cgpa}</p>
                  </div>
                  <NeuBadge variant="success">AI Match 88%</NeuBadge>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="p-3 border-2 border-[var(--ink)] rounded-xl bg-[var(--paper)] flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-sm text-gray-900">Arjun Sharma</p>
                  <p className="text-gray-500 font-medium">CSE · CGPA: 8.8 · React & Node Expert</p>
                </div>
                <NeuBadge variant="success">AI Match 92%</NeuBadge>
              </div>
              <div className="p-3 border-2 border-[var(--ink)] rounded-xl bg-[var(--paper)] flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-sm text-gray-900">Priya Nair</p>
                  <p className="text-gray-500 font-medium">ECE · CGPA: 9.1 · ML & Python Specialist</p>
                </div>
                <NeuBadge variant="success">AI Match 89%</NeuBadge>
              </div>
            </div>
          )}
        </NeuCard>

        <NeuCard className="p-5 bg-white space-y-3 border-[3px] border-[var(--ink)] shadow-[4px_4px_0px_#000]">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-bold text-base flex items-center gap-2">
              <FiBriefcase className="text-[var(--hotpink)]" /> Active Placement Drives
            </h3>
            <Link href="/recruiter/postings">
              <NeuBadge variant="warning" className="cursor-pointer">Manage Drives →</NeuBadge>
            </Link>
          </div>
          <div className="space-y-2">
            <div className="p-3 border-2 border-[var(--ink)] rounded-xl bg-[var(--paper)] flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-sm text-gray-900">Fullstack React/Node Engineer</p>
                <p className="text-gray-500 font-medium">Package: 12 LPA · 24 Applicants</p>
              </div>
              <NeuBadge variant="info">Active Drive</NeuBadge>
            </div>
            <div className="p-3 border-2 border-[var(--ink)] rounded-xl bg-[var(--paper)] flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-sm text-gray-900">AI / ML Research Intern (Unpaid)</p>
                <p className="text-gray-500 font-medium">3 Months · 18 Applicants</p>
              </div>
              <NeuBadge variant="mint">Unpaid Track</NeuBadge>
            </div>
          </div>
        </NeuCard>
      </StaggerItem>
    </PageTransition>
  );
}
