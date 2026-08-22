"use client";

import { useState, useEffect } from 'react';
import NeuCard from '@/components/shared/NeuCard';
import NeuBadge from '@/components/shared/NeuBadge';
import { DashboardSkeleton } from '@/components/shared/LoadingSpinner';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import { FiUsers, FiArrowRight } from 'react-icons/fi';
import api from '@/lib/api';

export default function MentorshipPage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);
  const [pairs, setPairs] = useState([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    api.get('/faculty/courses')
      .then(res => setCourses(res.data.courses || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fetchPairs = async (courseId) => {
    setSelectedCourse(courseId);
    if (!courseId) return;
    setFetching(true);
    try {
      const res = await api.post('/faculty/mentorship/match', { courseId });
      setPairs(res.data.pairs || []);
    } catch (err) { console.error(err); }
    setFetching(false);
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <PageTransition className="space-y-6">
      <StaggerItem>
        <h1 className="text-3xl md:text-4xl font-bold mb-1">🤝 Mentorship Matching</h1>
        <p className="text-gray-500 font-medium">Auto-generate mentor-mentee pairs based on skill levels</p>
      </StaggerItem>

      <StaggerItem>
        <NeuCard className="p-5 bg-white">
          <label className="form-label mb-2 block">Select Course</label>
          <select className="neu-select" value={selectedCourse} onChange={e => fetchPairs(e.target.value)}>
            <option value="">Choose a course...</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.code} - {c.title}</option>)}
          </select>
        </NeuCard>
      </StaggerItem>

      {fetching && <DashboardSkeleton />}

      {pairs.length > 0 && !fetching && (
        <StaggerItem>
          <NeuCard className="p-5 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Mentor-Mentee Pairs</h2>
              <NeuBadge variant="success">{pairs.length} pairs</NeuBadge>
            </div>
            <div className="space-y-3">
              {pairs.map((pair, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border-[3px] border-[var(--ink)] rounded-xl bg-[var(--paper)]">
                  <div className="flex-1 text-right">
                    <div className="w-10 h-10 rounded-full border-[3px] border-[var(--ink)] bg-[var(--mint)] flex items-center justify-center font-bold text-sm shadow-[2px_2px_0px_0px_var(--ink)] ml-auto mb-1">
                      M
                    </div>
                    <p className="font-bold text-sm">{pair.mentor?.name}</p>
                    <p className="text-xs text-gray-500">Mentor</p>
                  </div>
                  <div className="flex items-center gap-1 text-[var(--electric)]">
                    <FiArrowRight size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="w-10 h-10 rounded-full border-[3px] border-[var(--ink)] bg-[var(--sky)] flex items-center justify-center font-bold text-sm shadow-[2px_2px_0px_0px_var(--ink)] mb-1">
                      S
                    </div>
                    <p className="font-bold text-sm">{pair.mentee?.name}</p>
                    <p className="text-xs text-gray-500">Mentee</p>
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
