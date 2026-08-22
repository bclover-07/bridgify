"use client";

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaBolt, FaTrophy, FaCalendarCheck, FaChartLine } from 'react-icons/fa';
import NeuCard from '@/components/shared/NeuCard';
import SkillBar from '@/components/shared/SkillBar';
import EvidenceBadge from '@/components/shared/EvidenceBadge';
import AnimatedCounter from '@/components/shared/AnimatedCounter';
import useAuthStore from '@/lib/store/authStore';
import useSegStore from '@/lib/store/segStore';

import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const { seg, fetchSeg, isLoading } = useSegStore();

  useEffect(() => {
    fetchSeg();
  }, [fetchSeg]);

  if (isLoading || !seg) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-gray-200 rounded-[24px] animate-pulse border-[4px] border-[var(--ink)]"></div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="h-64 bg-gray-200 rounded-[24px] animate-pulse border-[4px] border-[var(--ink)] col-span-2"></div>
          <div className="h-64 bg-gray-200 rounded-[24px] animate-pulse border-[4px] border-[var(--ink)]"></div>
        </div>
      </div>
    );
  }

  return (
    <PageTransition className="space-y-8">
      <StaggerItem className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name.split(' ')[0]}!</h1>
          <p className="text-gray-600 text-lg">Your Skill Evidence Graph is up to date.</p>
        </div>
        <div className="flex gap-3">
          <EvidenceBadge type="VERIFIED" text="Identity Verified" />
          <EvidenceBadge type="ASSESSMENT" text="Ready for Placements" />
        </div>
      </StaggerItem>

      {/* KPI Cards */}
      <StaggerItem className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <NeuCard className="p-6 bg-[var(--electric)] text-white relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-20 transform group-hover:scale-110 transition-transform">
            <FaBolt size={80} />
          </div>
          <p className="font-semibold opacity-90 mb-2">Overall Readiness</p>
          <div className="text-4xl font-bold flex items-baseline gap-1">
            <AnimatedCounter end={seg.readinessScore || 0} />%
          </div>
        </NeuCard>

        <NeuCard className="p-6 bg-[var(--acid)] text-[var(--ink)] relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 transform group-hover:scale-110 transition-transform">
            <FaTrophy size={80} />
          </div>
          <p className="font-semibold mb-2">Verified Skills</p>
          <div className="text-4xl font-bold">
            <AnimatedCounter end={seg.nodes?.length || 0} />
          </div>
        </NeuCard>

        <NeuCard className="p-6 bg-white relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 transform group-hover:scale-110 transition-transform text-[var(--ink)]">
            <FaCalendarCheck size={80} />
          </div>
          <p className="font-semibold text-gray-600 mb-2">Assessments Taken</p>
          <div className="text-4xl font-bold">
            <AnimatedCounter end={seg.edges?.filter(e => e.evidenceType === 'assessment').length || 0} />
          </div>
        </NeuCard>

        <NeuCard className="p-6 bg-[var(--amber)] relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 transform group-hover:scale-110 transition-transform text-[var(--ink)]">
            <FaChartLine size={80} />
          </div>
          <p className="font-semibold text-[var(--ink)] mb-2">Target Role Rank</p>
          <div className="text-4xl font-bold">
            #Top <AnimatedCounter end={15} />%
          </div>
        </NeuCard>
      </StaggerItem>

      <StaggerItem className="grid md:grid-cols-3 gap-8">
        {/* Skill Graph Summary */}
        <NeuCard className="md:col-span-2 p-0 bg-white flex flex-col">
          <div className="p-6 border-b-[4px] border-[var(--ink)] flex justify-between items-center bg-[var(--cyan)] rounded-t-[20px]">
            <h2 className="text-2xl font-bold">Top Verified Skills</h2>
          </div>
          <div className="p-6 space-y-6 flex-1">
            {seg.nodes?.slice(0, 5).map((node, i) => (
              <div key={node.skillId || i}>
                <div className="flex justify-between mb-2">
                  <span className="font-bold">{node.skillName}</span>
                  <span className="font-mono font-bold">{node.proficiencyScore}%</span>
                </div>
                <SkillBar percentage={node.proficiencyScore} color="var(--electric)" />
              </div>
            )) || <p className="text-gray-500 font-semibold">No skills verified yet.</p>}
          </div>
        </NeuCard>

        {/* Recent Evidence */}
        <NeuCard className="p-0 bg-white flex flex-col h-[500px]">
          <div className="p-6 border-b-[4px] border-[var(--ink)] bg-[var(--lime)] rounded-t-[20px]">
            <h2 className="text-xl font-bold text-[var(--ink)]">Recent Evidence</h2>
          </div>
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {seg.edges?.slice(0, 5).map((edge, i) => (
              <div key={i} className="p-4 border-[3px] border-[var(--ink)] rounded-xl bg-[var(--paper)]">
                <div className="flex justify-between items-start mb-2">
                  <EvidenceBadge type={edge.evidenceType.toUpperCase()} />
                  <span className="text-xs font-bold text-gray-500 font-mono">
                    {new Date(edge.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="font-bold text-sm mb-1">{edge.context}</p>
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--electric)]">
                  <span>+{edge.scoreContributed}pts</span>
                </div>
              </div>
            )) || <p className="text-gray-500 font-semibold text-sm">No recent evidence found.</p>}
          </div>
        </NeuCard>
      </StaggerItem>
    </PageTransition>
  );
}
