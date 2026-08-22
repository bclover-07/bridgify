'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiTarget, FiSliders, FiTrendingUp, FiAward } from 'react-icons/fi';
import NeuCard from '@/components/shared/NeuCard';
import AnimatedCounter from '@/components/shared/AnimatedCounter';
import SkillBar from '@/components/shared/SkillBar';
import SkeletonLoader from '@/components/shared/SkeletonLoader';
import EmptyState from '@/components/shared/EmptyState';
import api from '@/lib/api';
import { getSocket } from '@/lib/socket';

export default function ReadinessPage() {
  const [readiness, setReadiness] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadReadiness = async () => {
    try {
      const { data } = await api.get('/student/readiness');
      setReadiness(data);
      if (data.roleBreakdown?.length > 0 && !selectedRole) {
        setSelectedRole(data.roleBreakdown[0].roleId);
      }
    } catch (err) {
      console.error('Failed to load readiness:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReadiness();

    const socket = getSocket();
    if (socket) {
      socket.on('seg:updated', () => {
        loadReadiness();
      });
      return () => socket.off('seg:updated');
    }
  }, []);

  if (loading) return <SkeletonLoader variant="card" count={4} />;
  if (!readiness) return <EmptyState title="No readiness data" description="Complete assessments to see your readiness score" />;

  const selectedRoleData = readiness.roleBreakdown?.find((r) => r.roleId === selectedRole);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
          <FiTarget style={{ color: 'var(--electric)' }} />
          Readiness Simulator
        </h1>
        <p className="text-sm opacity-60 mt-1">See how ready you are for different job roles</p>
      </motion.div>

      {/* Overall Readiness Gauge */}
      <NeuCard hoverable={false} padding="p-8">
        <div className="flex flex-col items-center">
          <div className="relative w-48 h-48 mb-4">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <circle
                cx="100" cy="100" r="85"
                fill="none"
                stroke="#e8e5dc"
                strokeWidth="14"
              />
              <motion.circle
                cx="100" cy="100" r="85"
                fill="none"
                stroke="var(--electric)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 85}
                initial={{ strokeDashoffset: 2 * Math.PI * 85 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 85 * (1 - (readiness.overallReadiness || 0) / 100) }}
                transition={{ duration: 2, ease: [0.34, 1.56, 0.64, 1] }}
                transform="rotate(-90 100 100)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <AnimatedCounter
                value={readiness.overallReadiness || 0}
                suffix="%"
                className="text-4xl font-bold font-mono"
              />
              <span className="text-xs opacity-50 font-semibold mt-1">OVERALL</span>
            </div>
          </div>
          <p className="text-sm opacity-60 text-center max-w-md">
            Your readiness is calculated from verified skill evidence across all assessments, projects, and AI evaluations.
          </p>
        </div>
      </NeuCard>

      {/* Role Selector */}
      {readiness.roleBreakdown && readiness.roleBreakdown.length > 0 && (
        <>
          <div className="flex flex-wrap gap-3">
            {readiness.roleBreakdown.map((role) => (
              <button
                key={role.roleId}
                className={`neu-btn neu-btn-sm ${selectedRole === role.roleId ? 'neu-btn-primary' : 'neu-btn-ghost'}`}
                onClick={() => setSelectedRole(role.roleId)}
              >
                {role.label}
                <span className="font-mono ml-1">{Math.round(role.readiness)}%</span>
              </button>
            ))}
          </div>

          {/* Selected Role Detail */}
          {selectedRoleData && (
            <motion.div key={selectedRole} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <NeuCard hoverable={false}>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <FiAward style={{ color: 'var(--electric)' }} />
                  {selectedRoleData.label} - Skill Breakdown
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                  {selectedRoleData.skills?.map((skill, i) => (
                    <div key={skill.skillId}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full ${
                          skill.importance === 'core' ? 'bg-[var(--coral)]' : 
                          skill.importance === 'important' ? 'bg-[var(--amber)]' : 'bg-[var(--mint)]'
                        }`} />
                        <span className="text-xs font-semibold uppercase opacity-40">{skill.importance}</span>
                      </div>
                      <SkillBar
                        label={skill.label}
                        score={skill.confidenceScore || 0}
                        color={skill.confidenceScore >= 70 ? 'mint' : skill.confidenceScore >= 40 ? 'amber' : 'coral'}
                      />
                    </div>
                  ))}
                </div>

                {selectedRoleData.gaps?.length > 0 && (
                  <div className="mt-6 pt-4 border-t-2 border-[var(--ink)]/10">
                    <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                      <FiTrendingUp style={{ color: 'var(--coral)' }} />
                      Skills to Improve
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRoleData.gaps.map((gap) => (
                        <span key={gap.skillId} className="neu-badge bg-[var(--coral)]/10 text-[var(--coral)]">
                          {gap.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </NeuCard>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
