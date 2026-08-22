"use client";

import { useEffect, useState } from 'react';
import NeuCard from '@/components/shared/NeuCard';
import NeuButton from '@/components/shared/NeuButton';
import NeuSelect from '@/components/shared/NeuSelect';
import { NeuRadarChart, NeuBarChart } from '@/components/shared/NeuChart';
import NeuBadge from '@/components/shared/NeuBadge';
import { DashboardSkeleton } from '@/components/shared/LoadingSpinner';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import api from '@/lib/api';

export default function ReadinessPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [targetRole, setTargetRole] = useState('');
  const [whatIfResult, setWhatIfResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    api.get('/student/readiness').then(res => { setData(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleWhatIf = async () => {
    if (!targetRole) return;
    setSimulating(true);
    try {
      const res = await api.post('/student/readiness/what-if', { targetRole });
      setWhatIfResult(res.data);
    } catch (e) { console.error(e); }
    setSimulating(false);
  };

  if (loading) return <DashboardSkeleton />;

  const radarData = data?.skillBreakdown?.slice(0, 8).map(s => ({
    name: s.skillName?.substring(0, 12) || 'Skill',
    score: s.score || 0,
    required: s.requiredScore || 80,
  })) || [];

  return (
    <PageTransition className="space-y-6">
      <StaggerItem>
        <h1 className="text-3xl font-bold mb-1">🎯 Readiness Simulator</h1>
        <p className="text-gray-500 font-medium">See how ready you are for your target role</p>
      </StaggerItem>

      <StaggerItem className="grid md:grid-cols-3 gap-4">
        <NeuCard className="p-5 bg-[var(--electric)] text-white text-center">
          <p className="text-sm font-semibold opacity-80 mb-1">Overall Readiness</p>
          <p className="text-5xl font-bold">{data?.overallScore || 0}%</p>
        </NeuCard>
        <NeuCard className="p-5 bg-[var(--mint)] text-center">
          <p className="text-sm font-semibold opacity-80 mb-1">Skills Covered</p>
          <p className="text-5xl font-bold">{data?.skillBreakdown?.length || 0}</p>
        </NeuCard>
        <NeuCard className="p-5 bg-[var(--amber)] text-center">
          <p className="text-sm font-semibold opacity-80 mb-1">Gaps Found</p>
          <p className="text-5xl font-bold">{data?.gaps?.length || 0}</p>
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
          <p className="text-gray-500 text-sm font-medium mb-4">Enter a target role to see what skills you need to improve</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              className="neu-input flex-1"
              placeholder="e.g. Frontend Developer, Data Scientist"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            />
            <NeuButton variant="primary" onClick={handleWhatIf} loading={simulating}>
              Simulate
            </NeuButton>
          </div>

          {whatIfResult && (
            <div className="mt-6 p-4 border-[3px] border-[var(--ink)] rounded-2xl bg-[var(--paper)]">
              <h3 className="font-bold mb-3">Simulation Result for &quot;{targetRole}&quot;</h3>
              <div className="flex gap-3 mb-4">
                <NeuBadge variant={whatIfResult.readinessScore >= 70 ? 'success' : 'warning'}>
                  Readiness: {whatIfResult.readinessScore || 0}%
                </NeuBadge>
              </div>
              {whatIfResult.recommendations && (
                <div className="space-y-2">
                  <p className="font-bold text-sm">Recommendations:</p>
                  {(Array.isArray(whatIfResult.recommendations) ? whatIfResult.recommendations : [whatIfResult.recommendations]).map((rec, i) => (
                    <div key={i} className="text-sm text-gray-600 flex gap-2">
                      <span className="text-[var(--electric)]">→</span> {typeof rec === 'string' ? rec : rec.suggestion || JSON.stringify(rec)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </NeuCard>
      </StaggerItem>

      {data?.gaps?.length > 0 && (
        <StaggerItem>
          <NeuCard className="p-5 bg-white">
            <h2 className="text-xl font-bold mb-4">Skill Gaps</h2>
            <div className="space-y-3">
              {data.gaps.map((gap, i) => (
                <div key={i} className="flex items-center justify-between p-3 border-[3px] border-[var(--ink)] rounded-xl bg-[var(--paper)]">
                  <span className="font-bold text-sm">{gap.skillName || gap}</span>
                  <NeuBadge variant="danger">Gap</NeuBadge>
                </div>
              ))}
            </div>
          </NeuCard>
        </StaggerItem>
      )}
    </PageTransition>
  );
}
