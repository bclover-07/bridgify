"use client";

import { useEffect, useState } from 'react';
import NeuCard from '@/components/shared/NeuCard';
import { NeuBarChart } from '@/components/shared/NeuChart';
import NeuBadge from '@/components/shared/NeuBadge';
import SkillBar from '@/components/shared/SkillBar';
import { DashboardSkeleton } from '@/components/shared/LoadingSpinner';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import api from '@/lib/api';

export default function BenchmarksPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/benchmarks')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  const benchmarks = data?.benchmarks || [];

  const chartData = benchmarks.slice(0, 8).map(b => ({
    name: (b.skillLabel || b.skillName || 'Skill').substring(0, 12),
    'Your Score': b.myScore || b.yourScore || 0,
    'Cohort Avg': b.cohortAvg || 0,
    'Cohort Max': b.cohortMax || 0,
  }));

  const avgPercentile = benchmarks.length > 0
    ? Math.round(benchmarks.reduce((sum, b) => sum + (b.percentile || 0), 0) / benchmarks.length)
    : 0;

  return (
    <PageTransition className="space-y-6">
      <StaggerItem>
        <h1 className="text-3xl md:text-4xl font-bold mb-1">🏆 Benchmarks</h1>
        <p className="text-gray-500 font-medium">Compare your skills against your cohort</p>
      </StaggerItem>

      <StaggerItem className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <NeuCard className="p-5 bg-[var(--electric)] text-white text-center">
          <p className="text-sm font-semibold opacity-80 mb-1">Avg Percentile</p>
          <p className="text-4xl font-bold">{avgPercentile}%</p>
        </NeuCard>
        <NeuCard className="p-5 bg-[var(--mint)] text-center">
          <p className="text-sm font-semibold opacity-70 mb-1">Skills Tracked</p>
          <p className="text-4xl font-bold">{benchmarks.length}</p>
        </NeuCard>
        <NeuCard className="p-5 bg-[var(--amber)] text-center col-span-2 md:col-span-1">
          <p className="text-sm font-semibold opacity-70 mb-1">Above Average</p>
          <p className="text-4xl font-bold">
            {benchmarks.filter(b => (b.myScore || b.yourScore || 0) >= (b.cohortAvg || 0)).length}
          </p>
        </NeuCard>
      </StaggerItem>

      {chartData.length > 0 && (
        <StaggerItem>
          <NeuCard className="p-5 bg-white">
            <h2 className="text-xl font-bold mb-4">📊 Skill Comparison</h2>
            <NeuBarChart
              data={chartData}
              bars={[
                { key: 'Your Score', label: 'Your Score', color: '#4B3AFF' },
                { key: 'Cohort Avg', label: 'Cohort Avg', color: '#FFB020' },
                { key: 'Cohort Max', label: 'Cohort Max', color: '#2FE3A3' },
              ]}
              height={350}
            />
          </NeuCard>
        </StaggerItem>
      )}

      {benchmarks.length > 0 && (
        <StaggerItem>
          <NeuCard className="p-5 bg-white">
            <h2 className="text-xl font-bold mb-4">📋 Detailed Breakdown</h2>
            <div className="space-y-3">
              {benchmarks.map((b, i) => {
                const myScore = b.myScore || b.yourScore || 0;
                const isAbove = myScore >= (b.cohortAvg || 0);
                return (
                  <div key={i} className="p-4 border-[3px] border-[var(--ink)] rounded-xl bg-[var(--paper)]">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-bold text-sm">{b.skillLabel || b.skillName}</p>
                        <div className="flex gap-3 mt-1">
                          <span className="text-xs text-gray-500 font-semibold">Avg: {b.cohortAvg || 0}%</span>
                          <span className="text-xs text-gray-500 font-semibold">Max: {b.cohortMax || 0}%</span>
                          <span className="text-xs text-gray-500 font-semibold">Percentile: {b.percentile || 0}%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-2xl">{myScore}%</p>
                        <NeuBadge variant={isAbove ? 'success' : 'warning'}>
                          {isAbove ? '↑ Above Avg' : '↓ Below Avg'}
                        </NeuBadge>
                      </div>
                    </div>
                    <SkillBar value={myScore} color={isAbove ? 'var(--mint)' : 'var(--amber)'} />
                  </div>
                );
              })}
            </div>
          </NeuCard>
        </StaggerItem>
      )}
    </PageTransition>
  );
}
