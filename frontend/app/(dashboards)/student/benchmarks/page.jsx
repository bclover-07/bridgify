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
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/student/benchmarks'),
      api.get('/student/leaderboard'),
    ])
      .then(([bRes, lRes]) => {
        setData(bRes.data);
        setLeaderboardData(lRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  const benchmarks = data?.benchmarks || [];
  const leaderboard = leaderboardData?.leaderboard || [];

  const chartData = benchmarks.slice(0, 8).map(b => ({
    name: (b.skillLabel || b.skillName || 'Skill').substring(0, 12),
    'Your Score': b.myScore || b.yourScore || 0,
    'Cohort Avg': b.cohortAvg || 0,
    'Cohort Max': b.cohortMax || 0,
  }));

  return (
    <PageTransition className="space-y-6">
      <StaggerItem>
        <h1 className="text-3xl md:text-4xl font-bold mb-1">🏆 Benchmarks & Leaderboard</h1>
        <p className="text-gray-500 font-medium">Compare your skills against your cohort and view your institutional rank</p>
      </StaggerItem>

      <StaggerItem className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <NeuCard className="p-5 bg-[var(--electric)] text-white text-center">
          <p className="text-sm font-semibold opacity-80 mb-1">Your Rank</p>
          <p className="text-4xl font-bold">#{leaderboardData?.myRank || 1}</p>
        </NeuCard>

        <NeuCard className="p-5 bg-[var(--mint)] text-center">
          <p className="text-sm font-semibold opacity-70 mb-1">Readiness Score</p>
          <p className="text-4xl font-bold">{leaderboardData?.myScore || 85}%</p>
        </NeuCard>

        <NeuCard className="p-5 bg-[var(--amber)] text-center">
          <p className="text-sm font-semibold opacity-70 mb-1">Skills Tracked</p>
          <p className="text-4xl font-bold">{benchmarks.length}</p>
        </NeuCard>

        <NeuCard className="p-5 bg-[var(--paper)] text-center border-[3px] border-[var(--ink)]">
          <p className="text-sm font-semibold opacity-70 mb-1">Cohort Total</p>
          <p className="text-4xl font-bold">{leaderboardData?.totalStudents || leaderboard.length}</p>
        </NeuCard>
      </StaggerItem>

      {/* Gamified Institutional Student Leaderboard */}
      <StaggerItem>
        <NeuCard className="p-6 bg-white space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            🥇 Institutional Student Leaderboard
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200 text-xs text-gray-500 uppercase">
                  <th className="p-3">Rank</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Branch & Year</th>
                  <th className="p-3">Readiness Score</th>
                  <th className="p-3">Badge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-semibold">
                {leaderboard.map(st => (
                  <tr
                    key={st.id}
                    className={`hover:bg-gray-50 ${
                      st.isCurrent ? 'bg-indigo-50 border-l-4 border-[var(--electric)] font-bold' : ''
                    }`}
                  >
                    <td className="p-3 font-extrabold text-base">
                      {st.rank === 1 ? '🥇 #1' : st.rank === 2 ? '🥈 #2' : st.rank === 3 ? '🥉 #3' : `#${st.rank}`}
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-gray-900 block">{st.name}</span>
                      <span className="text-xs text-gray-500 font-normal">{st.email}</span>
                    </td>
                    <td className="p-3 text-gray-600">
                      {st.branch} • Year {st.year}
                    </td>
                    <td className="p-3 text-xl font-extrabold text-[var(--electric)]">
                      {st.readinessScore}%
                    </td>
                    <td className="p-3">
                      <NeuBadge variant={st.badge === 'Gold' ? 'warning' : st.badge === 'Silver' ? 'info' : 'default'}>
                        {st.badge} Tier
                      </NeuBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </NeuCard>
      </StaggerItem>

      {/* Cohort Skill Bar Chart */}
      {chartData.length > 0 && (
        <StaggerItem>
          <NeuCard className="p-5 bg-white">
            <h2 className="text-xl font-bold mb-4">📊 Skill Comparison Against Cohort</h2>
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

      {/* Detailed Skill Breakdown */}
      {benchmarks.length > 0 && (
        <StaggerItem>
          <NeuCard className="p-5 bg-white">
            <h2 className="text-xl font-bold mb-4">📋 Skill Breakdown</h2>
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
