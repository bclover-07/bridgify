"use client";

import { useEffect, useState } from 'react';
import NeuCard from '@/components/shared/NeuCard';
import NeuButton from '@/components/shared/NeuButton';
import { NeuRadarChart, NeuBarChart } from '@/components/shared/NeuChart';
import NeuBadge from '@/components/shared/NeuBadge';
import { DashboardSkeleton } from '@/components/shared/LoadingSpinner';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import api from '@/lib/api';

export default function ReadinessPage() {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('frontend-developer');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [targetRole, setTargetRole] = useState('');
  const [whatIfResult, setWhatIfResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  // Fetch available roles on mount
  useEffect(() => {
    api.get('/student/readiness').then(res => {
      if (res.data.roles) {
        setRoles(res.data.roles);
        if (res.data.roles.length > 0 && !selectedRole) {
          setSelectedRole(res.data.roles[0].roleId);
        }
      }
    }).catch(console.error);
  }, []);

  // Fetch readiness data when selectedRole changes
  useEffect(() => {
    if (!selectedRole) return;
    setLoading(true);
    api.get(`/student/readiness?targetRole=${selectedRole}`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, [selectedRole]);

  const handleWhatIf = async () => {
    if (!targetRole) return;
    setSimulating(true);
    try {
      const res = await api.post('/student/readiness/what-if', { targetRole });
      setWhatIfResult(res.data);
    } catch (e) {
      console.error(e);
      alert('Failed to simulate: ' + (e.response?.data?.error || e.message));
    }
    setSimulating(false);
  };

  if (loading && !data) return <DashboardSkeleton />;

  const radarData = data?.skillBreakdown?.slice(0, 8).map(s => ({
    name: s.label?.substring(0, 12) || 'Skill',
    score: s.currentScore || 0,
    required: 60, // Default target score
  })) || [];

  return (
    <PageTransition className="space-y-6">
      <StaggerItem className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">🎯 Readiness Simulator</h1>
          <p className="text-gray-500 font-medium">See how ready you are for your target role</p>
        </div>
        <select 
          className="neu-input bg-white w-full sm:w-auto"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          {roles.map(r => (
            <option key={r.roleId} value={r.roleId}>{r.label}</option>
          ))}
        </select>
      </StaggerItem>

      <StaggerItem className="grid md:grid-cols-3 gap-4">
        <NeuCard className="p-5 bg-[var(--electric)] text-white text-center">
          <p className="text-sm font-semibold opacity-80 mb-1">Overall Readiness</p>
          <p className="text-5xl font-bold">{data?.overallReadiness || 0}%</p>
        </NeuCard>
        <NeuCard className="p-5 bg-[var(--mint)] text-center">
          <p className="text-sm font-semibold opacity-80 mb-1">Skills Covered</p>
          <p className="text-5xl font-bold">{data?.skillBreakdown?.length || 0}</p>
        </NeuCard>
        <NeuCard className="p-5 bg-[var(--amber)] text-center">
          <p className="text-sm font-semibold opacity-80 mb-1">Gaps Found</p>
          <p className="text-5xl font-bold">{data?.skillBreakdown?.filter(s => s.gap > 0).length || 0}</p>
        </NeuCard>
      </StaggerItem>

      {radarData.length > 0 && (
        <StaggerItem>
          <NeuCard className="p-5 bg-white">
            <h2 className="text-xl font-bold mb-4">Skill Radar</h2>
            <NeuRadarChart data={radarData} dataKeys={[
              { key: 'score', label: 'Your Score', color: '#4B3AFF' },
              { key: 'required', label: 'Required', color: '#FF3D9A' },
            ]} height={350} />
          </NeuCard>
        </StaggerItem>
      )}

      <StaggerItem>
        <NeuCard className="p-5 bg-white">
          <h2 className="text-xl font-bold mb-4">What-If Simulator</h2>
          <p className="text-gray-500 text-sm font-medium mb-4">Select a target role to see what skills you need to improve</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              className="neu-input flex-1 bg-white"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            >
              <option value="">Select a role...</option>
              {roles.map(r => (
                <option key={r.roleId} value={r.roleId}>{r.label}</option>
              ))}
            </select>
            <NeuButton variant="primary" onClick={handleWhatIf} loading={simulating}>
              Simulate
            </NeuButton>
          </div>

          {whatIfResult && (
            <div className="mt-6 p-4 border-[3px] border-[var(--ink)] rounded-2xl bg-[var(--paper)]">
              <h3 className="font-bold mb-3">Simulation Result for {roles.find(r => r.roleId === targetRole)?.label}</h3>
              <div className="flex gap-3 mb-4">
                <NeuBadge variant={whatIfResult.whatIfReadiness >= 70 ? 'success' : 'warning'}>
                  Target Readiness: {whatIfResult.whatIfReadiness || 0}%
                </NeuBadge>
                <NeuBadge variant="info">
                  Improvement: +{whatIfResult.improvement || 0}%
                </NeuBadge>
              </div>
            </div>
          )}
        </NeuCard>
      </StaggerItem>

      {data?.recommendations?.length > 0 && (
        <StaggerItem>
          <NeuCard className="p-5 bg-white">
            <h2 className="text-xl font-bold mb-4">Skill Recommendations</h2>
            <div className="space-y-3">
              {data.recommendations.map((rec, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border-[3px] border-[var(--ink)] rounded-xl bg-[var(--paper)] gap-2">
                  <div>
                    <span className="font-bold text-sm block">{rec.label}</span>
                    <span className="text-xs text-gray-500">Current: {rec.currentScore}% • Target: {rec.targetScore}%</span>
                  </div>
                  <NeuBadge variant="danger">High Impact Gap</NeuBadge>
                </div>
              ))}
            </div>
          </NeuCard>
        </StaggerItem>
      )}
    </PageTransition>
  );
}
