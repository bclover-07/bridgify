"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import NeuCard from '@/components/shared/NeuCard';
import NeuBadge from '@/components/shared/NeuBadge';
import { NeuBarChart, NeuRadarChart } from '@/components/shared/NeuChart';
import SkillBar from '@/components/shared/SkillBar';
import { DashboardSkeleton } from '@/components/shared/LoadingSpinner';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import { FiTarget, FiBookOpen, FiAward, FiTrendingUp, FiClipboard, FiBell } from 'react-icons/fi';
import api from '@/lib/api';
import Link from 'next/link';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/dashboard')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  const stats = [
    { label: 'Total Skills', value: data?.stats?.totalSkills || 0, icon: FiTarget, color: 'var(--electric)', bg: '#4B3AFF' },
    { label: 'Evidence Points', value: data?.stats?.totalEvidence || 0, icon: FiAward, color: 'var(--mint)', bg: '#2FE3A3' },
    { label: 'Avg Confidence', value: `${data?.stats?.avgConfidence || 0}%`, icon: FiTrendingUp, color: 'var(--hotpink)', bg: '#FF3D9A' },
    { label: 'Assessments', value: data?.upcomingAssessments?.length || 0, icon: FiClipboard, color: 'var(--amber)', bg: '#FFB020' },
  ];

  const radarData = data?.segSummary?.slice(0, 6).map(s => ({
    subject: s.skillLabel?.substring(0, 12) || 'Skill',
    score: s.confidenceScore || 0,
  })) || [];

  return (
    <PageTransition className="space-y-6">
      <StaggerItem>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-1">
              Hey, {data?.profile?.name?.split(' ')[0] || 'Student'}! 🎓
            </h1>
            <p className="text-gray-500 font-medium">
              {data?.profile?.branch} · Year {data?.profile?.year} · CGPA: {data?.profile?.cgpa}
            </p>
          </div>
          {data?.notifications?.length > 0 && (
            <NeuBadge variant="warning" className="flex items-center gap-1">
              <FiBell size={12} /> {data.notifications.length} new notifications
            </NeuBadge>
          )}
        </div>
      </StaggerItem>

      <StaggerItem className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={i} whileHover={{ y: -3 }} className="transition-all">
            <NeuCard className="p-4 md:p-5 bg-white">
              <div className="w-10 h-10 rounded-xl border-[3px] border-[var(--ink)] flex items-center justify-center text-white mb-3 shadow-[3px_3px_0px_0px_var(--ink)]" style={{ background: s.bg }}>
                <s.icon size={18} />
              </div>
              <p className="text-2xl md:text-3xl font-bold">{s.value}</p>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mt-1">{s.label}</p>
            </NeuCard>
          </motion.div>
        ))}
      </StaggerItem>

      <div className="grid lg:grid-cols-2 gap-6">
        {data?.segSummary?.length > 0 && (
          <StaggerItem>
            <NeuCard className="p-5 bg-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">🧠 Skill Radar</h2>
                <Link href="/student/learning-path">
                  <NeuBadge variant="info" className="cursor-pointer hover:opacity-80">View SEG →</NeuBadge>
                </Link>
              </div>
              {radarData.length >= 3 ? (
                <NeuRadarChart data={radarData} dataKeys={[{ key: 'score', label: 'Confidence', color: '#4B3AFF' }]} height={280} />
              ) : (
                <div className="space-y-3">
                  {data.segSummary.slice(0, 6).map((s, i) => (
                    <SkillBar key={i} label={s.skillLabel} value={s.confidenceScore} color={s.confidenceScore > 70 ? 'var(--mint)' : s.confidenceScore > 40 ? 'var(--amber)' : 'var(--coral)'} />
                  ))}
                </div>
              )}
            </NeuCard>
          </StaggerItem>
        )}

        <StaggerItem>
          <NeuCard className="p-5 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">📋 Upcoming Assessments</h2>
              <Link href="/student/assessments">
                <NeuBadge variant="default" className="cursor-pointer hover:opacity-80">View All →</NeuBadge>
              </Link>
            </div>
            {data?.upcomingAssessments?.length > 0 ? (
              <div className="space-y-3">
                {data.upcomingAssessments.slice(0, 5).map((a, i) => (
                  <Link key={a._id || i} href={`/student/assessments/${a._id}`}>
                    <div className="flex items-center justify-between p-3 border-[3px] border-[var(--ink)] rounded-xl bg-[var(--paper)] hover:shadow-[4px_4px_0px_0px_var(--ink)] transition-all cursor-pointer">
                      <div>
                        <p className="font-bold text-sm">{a.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{a.topic}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-gray-500">{a.totalMarks} marks</p>
                        {a.dueDate && <p className="text-[10px] text-gray-400">{new Date(a.dueDate).toLocaleDateString()}</p>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm font-medium text-center py-8">No upcoming assessments</p>
            )}
          </NeuCard>
        </StaggerItem>
      </div>

      {data?.recentSubmissions?.length > 0 && (
        <StaggerItem>
          <NeuCard className="p-5 bg-white">
            <h2 className="text-xl font-bold mb-4">📝 Recent Submissions</h2>
            <div className="space-y-3">
              {data.recentSubmissions.map((s, i) => (
                <div key={s._id || i} className="flex items-center justify-between p-3 border-[3px] border-[var(--ink)] rounded-xl bg-[var(--paper)]">
                  <div>
                    <p className="font-bold text-sm">{s.assessmentId?.title || 'Assessment'}</p>
                    <p className="text-xs text-gray-500">{s.assessmentId?.topic}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.percentage !== undefined && (
                      <span className="font-bold text-lg">{s.percentage}%</span>
                    )}
                    <NeuBadge variant={s.gradingStatus === 'final' ? 'success' : s.gradingStatus === 'auto_graded' ? 'info' : 'warning'}>
                      {s.gradingStatus?.replace('_', ' ') || 'pending'}
                    </NeuBadge>
                  </div>
                </div>
              ))}
            </div>
          </NeuCard>
        </StaggerItem>
      )}
    </PageTransition>
  );
}
