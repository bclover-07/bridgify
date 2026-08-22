"use client";

import { useState, useEffect } from 'react';
import NeuCard from '@/components/shared/NeuCard';
import NeuButton from '@/components/shared/NeuButton';
import NeuBadge from '@/components/shared/NeuBadge';
import { DashboardSkeleton } from '@/components/shared/LoadingSpinner';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import { FiAlertTriangle, FiSend } from 'react-icons/fi';
import api from '@/lib/api';

export default function DropoutRadarPage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);
  const [radarData, setRadarData] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [nudging, setNudging] = useState(null);

  useEffect(() => {
    api.get('/faculty/courses')
      .then(res => setCourses(res.data.courses || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fetchRadar = async (courseId) => {
    setSelectedCourse(courseId);
    if (!courseId) return;
    setFetching(true);
    try {
      const res = await api.get(`/faculty/dropout-radar/${courseId}`);
      setRadarData(res.data);
    } catch (err) { console.error(err); }
    setFetching(false);
  };

  const handleNudge = async (studentId) => {
    setNudging(studentId);
    try {
      await api.post(`/faculty/students/${studentId}/nudge`, { message: 'Your professor would like to check in. Please reach out.', type: 'nudge' });
      alert('Nudge sent successfully!');
    } catch (err) { console.error(err); }
    setNudging(null);
  };

  if (loading) return <DashboardSkeleton />;

  const riskColor = (level) => level === 'HIGH' ? 'danger' : level === 'MEDIUM' ? 'warning' : 'success';

  return (
    <PageTransition className="space-y-6">
      <StaggerItem>
        <h1 className="text-3xl md:text-4xl font-bold mb-1">🚨 Dropout Radar</h1>
        <p className="text-gray-500 font-medium">Identify at-risk students and take proactive action</p>
      </StaggerItem>

      <StaggerItem>
        <NeuCard className="p-5 bg-white">
          <label className="form-label mb-2 block">Select Course</label>
          <select className="neu-select" value={selectedCourse} onChange={e => fetchRadar(e.target.value)}>
            <option value="">Choose a course...</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.code} - {c.title}</option>)}
          </select>
        </NeuCard>
      </StaggerItem>

      {fetching && <DashboardSkeleton />}

      {radarData && !fetching && (
        <>
          <StaggerItem className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <NeuCard className="p-4 bg-white text-center">
              <p className="text-sm font-bold text-gray-500">Total</p>
              <p className="text-3xl font-bold">{radarData.totalStudents}</p>
            </NeuCard>
            <NeuCard className="p-4 bg-[var(--coral)] text-white text-center">
              <p className="text-sm font-bold opacity-80">High Risk</p>
              <p className="text-3xl font-bold">{radarData.highRiskCount}</p>
            </NeuCard>
            <NeuCard className="p-4 bg-[var(--amber)] text-center">
              <p className="text-sm font-bold opacity-70">Medium Risk</p>
              <p className="text-3xl font-bold">{radarData.mediumRiskCount}</p>
            </NeuCard>
            <NeuCard className="p-4 bg-[var(--mint)] text-center">
              <p className="text-sm font-bold opacity-70">Low Risk</p>
              <p className="text-3xl font-bold">{radarData.lowRiskCount}</p>
            </NeuCard>
          </StaggerItem>

          <StaggerItem>
            <NeuCard className="p-5 bg-white">
              <h2 className="text-xl font-bold mb-4">Student Risk Analysis</h2>
              <div className="space-y-3">
                {radarData.students?.map((s, i) => (
                  <div key={s.studentId || i} className="flex items-center justify-between p-4 border-[3px] border-[var(--ink)] rounded-xl bg-[var(--paper)]">
                    <div>
                      <p className="font-bold">{s.name || 'Student'}</p>
                      <p className="text-xs text-gray-500">{s.rollNo} · CGPA: {s.cgpa} · Attendance: {s.attendanceRate || 'N/A'}%</p>
                      {s.riskFactors && <p className="text-xs text-gray-400 mt-1">{Array.isArray(s.riskFactors) ? s.riskFactors.join(', ') : s.riskFactors}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <NeuBadge variant={riskColor(s.riskLevel)} className={s.riskLevel === 'HIGH' ? 'pulse-risk' : ''}>
                        <FiAlertTriangle size={10} /> {s.riskLevel}
                      </NeuBadge>
                      <NeuButton size="xs" variant="primary"
                        onClick={() => handleNudge(s.studentId)}
                        loading={nudging === s.studentId}
                        icon={FiSend}>
                        Nudge
                      </NeuButton>
                    </div>
                  </div>
                ))}
              </div>
            </NeuCard>
          </StaggerItem>
        </>
      )}
    </PageTransition>
  );
}
