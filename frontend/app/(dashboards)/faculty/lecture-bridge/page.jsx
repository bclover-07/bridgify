"use client";

import { useState, useEffect } from 'react';
import NeuCard from '@/components/shared/NeuCard';
import NeuBadge from '@/components/shared/NeuBadge';
import SkillBar from '@/components/shared/SkillBar';
import { DashboardSkeleton } from '@/components/shared/LoadingSpinner';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import api from '@/lib/api';

export default function LectureBridgePage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    api.get('/faculty/courses')
      .then(res => setCourses(res.data.courses || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fetchBridge = async (courseId) => {
    setSelectedCourse(courseId);
    if (!courseId) return;
    setFetching(true);
    try {
      const res = await api.post('/faculty/lecture-bridge', { courseId });
      setData(res.data);
    } catch (err) { console.error(err); }
    setFetching(false);
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <PageTransition className="space-y-6">
      <StaggerItem>
        <h1 className="text-3xl md:text-4xl font-bold mb-1">🌉 Lecture Bridge</h1>
        <p className="text-gray-500 font-medium">Find gaps between what&apos;s taught and what&apos;s tested</p>
      </StaggerItem>

      <StaggerItem>
        <NeuCard className="p-5 bg-white">
          <label className="form-label mb-2 block">Select Course</label>
          <select className="neu-select" value={selectedCourse} onChange={e => fetchBridge(e.target.value)}>
            <option value="">Choose a course...</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.code} - {c.title}</option>)}
          </select>
        </NeuCard>
      </StaggerItem>

      {fetching && <DashboardSkeleton />}

      {data && !fetching && (
        <>
          <StaggerItem>
            <NeuCard className="p-5 bg-white text-center">
              <p className="text-sm font-bold text-gray-500 mb-2">Coverage Rate</p>
              <p className="text-5xl font-bold" style={{ color: data.coverageRate >= 70 ? 'var(--mint)' : data.coverageRate >= 40 ? 'var(--amber)' : 'var(--coral)' }}>
                {data.coverageRate}%
              </p>
              <SkillBar value={data.coverageRate} color={data.coverageRate >= 70 ? 'var(--mint)' : data.coverageRate >= 40 ? 'var(--amber)' : 'var(--coral)'} className="mt-4 max-w-md mx-auto" />
            </NeuCard>
          </StaggerItem>

          <div className="grid md:grid-cols-2 gap-6">
            <StaggerItem>
              <NeuCard className="p-5 bg-white h-full">
                <div className="flex items-center gap-2 mb-4">
                  <NeuBadge variant="warning">⚠️ Taught but NOT Tested</NeuBadge>
                  <span className="text-sm font-bold text-gray-400">({data.taughtNotTested?.length || 0})</span>
                </div>
                {data.taughtNotTested?.length > 0 ? (
                  <div className="space-y-2">
                    {data.taughtNotTested.map((s, i) => (
                      <div key={i} className="p-3 border-[3px] border-[var(--amber)] rounded-xl bg-amber-50">
                        <p className="font-bold text-sm">{s.label || s.skillId}</p>
                        <p className="text-xs text-gray-500">{s.skillId}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm text-center py-4">All taught skills are tested ✓</p>
                )}
              </NeuCard>
            </StaggerItem>

            <StaggerItem>
              <NeuCard className="p-5 bg-white h-full">
                <div className="flex items-center gap-2 mb-4">
                  <NeuBadge variant="danger">🔴 Tested but NOT Taught</NeuBadge>
                  <span className="text-sm font-bold text-gray-400">({data.testedNotTaught?.length || 0})</span>
                </div>
                {data.testedNotTaught?.length > 0 ? (
                  <div className="space-y-2">
                    {data.testedNotTaught.map((s, i) => (
                      <div key={i} className="p-3 border-[3px] border-[var(--coral)] rounded-xl bg-red-50">
                        <p className="font-bold text-sm">{s.label || s.skillId}</p>
                        <p className="text-xs text-gray-500">{s.skillId}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm text-center py-4">No gaps found ✓</p>
                )}
              </NeuCard>
            </StaggerItem>
          </div>
        </>
      )}
    </PageTransition>
  );
}
