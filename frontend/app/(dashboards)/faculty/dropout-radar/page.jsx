"use client";

import { useState, useEffect } from 'react';
import NeuCard from '@/components/shared/NeuCard';
import NeuButton from '@/components/shared/NeuButton';
import NeuBadge from '@/components/shared/NeuBadge';
import { DashboardSkeleton } from '@/components/shared/LoadingSpinner';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import { FiAlertTriangle, FiSend, FiUserCheck, FiActivity } from 'react-icons/fi';
import api from '@/lib/api';

export default function DropoutRadarPage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);
  const [radarData, setRadarData] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [nudging, setNudging] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'high', 'medium', 'readiness'

  useEffect(() => {
    // Initial fetch of courses and default dropout radar data
    api.get('/faculty/courses')
      .then(res => {
        const fetchedCourses = res.data.courses || [];
        setCourses(fetchedCourses);
        const defaultId = fetchedCourses[0]?._id || '';
        if (defaultId) setSelectedCourse(defaultId);
        return api.get(`/faculty/dropout-radar/${defaultId}`);
      })
      .then(res => {
        setRadarData(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fetchRadar = async (courseId) => {
    setSelectedCourse(courseId);
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
      await api.post(`/faculty/students/${studentId}/nudge`, {
        message: 'Your professor would like to check in on your course progress & SEG readiness. Please reach out.',
        type: 'nudge'
      });
      alert('Real-time Socket nudge sent to student!');
    } catch (err) { console.error(err); }
    setNudging(null);
  };

  if (loading) return <DashboardSkeleton />;

  const studentsList = radarData?.students || radarData?.risks || [];
  const filteredStudents = studentsList.filter(s => {
    if (activeTab === 'high') return s.riskLevel === 'HIGH';
    if (activeTab === 'medium') return s.riskLevel === 'MEDIUM';
    if (activeTab === 'readiness') return (s.placementReadinessScore || s.avgConfidence || 0) < 60;
    return true;
  });

  const riskColor = (level) => level === 'HIGH' ? 'danger' : level === 'MEDIUM' ? 'warning' : 'success';

  return (
    <PageTransition className="space-y-6">
      {/* Header */}
      <StaggerItem className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-1">🚨 Real-time Student Dropout Radar & Early Warnings</h1>
          <p className="text-gray-500 font-medium">Multidimensional risk tracking: Attendance, Platform Activity, Internal Scores & Placement Readiness</p>
        </div>

        <div className="w-full sm:w-auto">
          <select
            className="neu-select bg-white"
            value={selectedCourse}
            onChange={e => fetchRadar(e.target.value)}
          >
            <option value="">All Cohorts & Courses...</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.code} - {c.title}</option>)}
          </select>
        </div>
      </StaggerItem>

      {fetching && <DashboardSkeleton />}

      {radarData && !fetching && (
        <>
          {/* Top KPI Summary Cards */}
          <StaggerItem className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <NeuCard className="p-4 bg-white text-center">
              <p className="text-xs font-extrabold text-gray-400 uppercase mb-1">Total Enrolled</p>
              <p className="text-4xl font-extrabold">{radarData.totalStudents || studentsList.length}</p>
            </NeuCard>
            <NeuCard className="p-4 bg-[var(--coral)] text-white text-center">
              <p className="text-xs font-extrabold opacity-80 uppercase mb-1">High Risk Students</p>
              <p className="text-4xl font-extrabold">{radarData.highRiskCount || 0}</p>
            </NeuCard>
            <NeuCard className="p-4 bg-[var(--amber)] text-center">
              <p className="text-xs font-extrabold opacity-75 uppercase mb-1">Medium Risk</p>
              <p className="text-4xl font-extrabold">{radarData.mediumRiskCount || 0}</p>
            </NeuCard>
            <NeuCard className="p-4 bg-[var(--mint)] text-center">
              <p className="text-xs font-extrabold opacity-75 uppercase mb-1">Low Risk / On Track</p>
              <p className="text-4xl font-extrabold">{radarData.lowRiskCount || 0}</p>
            </NeuCard>
          </StaggerItem>

          {/* Filter Toggles */}
          <StaggerItem className="flex flex-wrap gap-2 p-2 bg-white border-[3px] border-[var(--ink)] rounded-2xl">
            <NeuButton
              size="sm"
              variant={activeTab === 'all' ? 'primary' : 'ghost'}
              onClick={() => setActiveTab('all')}
            >
              All Students ({studentsList.length})
            </NeuButton>
            <NeuButton
              size="sm"
              variant={activeTab === 'high' ? 'coral' : 'ghost'}
              onClick={() => setActiveTab('high')}
            >
              ⚠️ High Risk ({radarData.highRiskCount || 0})
            </NeuButton>
            <NeuButton
              size="sm"
              variant={activeTab === 'medium' ? 'warning' : 'ghost'}
              onClick={() => setActiveTab('medium')}
            >
              ⚡ Medium Risk ({radarData.mediumRiskCount || 0})
            </NeuButton>
            <NeuButton
              size="sm"
              variant={activeTab === 'readiness' ? 'accent' : 'ghost'}
              onClick={() => setActiveTab('readiness')}
            >
              🎯 Readiness Warning (&lt; 60%)
            </NeuButton>
          </StaggerItem>

          {/* Student Risk List */}
          <StaggerItem>
            <NeuCard className="p-6 bg-white space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FiActivity className="text-[var(--coral)]" /> Multidimensional Student Risk Profiles
              </h2>

              <div className="space-y-4">
                {filteredStudents.length > 0 ? filteredStudents.map((s, i) => (
                  <div
                    key={s.studentId || i}
                    className="p-5 border-[3px] border-[var(--ink)] rounded-2xl bg-[var(--paper)] space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg text-gray-900">{s.name || 'Student'}</h3>
                          <span className="text-xs font-mono text-gray-500">({s.rollNo || '21MR1A0501'})</span>
                        </div>
                        <p className="text-xs text-gray-600 font-medium">
                          {s.branch || 'CSE'} • Email: {s.email}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-xs font-bold text-gray-400 block">Risk Score</span>
                          <span className="text-xl font-extrabold">{s.riskPercentage || s.riskScore || 20}%</span>
                        </div>
                        <NeuBadge variant={riskColor(s.riskLevel)}>
                          <FiAlertTriangle size={12} className="inline mr-1" /> {s.riskLevel}
                        </NeuBadge>
                        <NeuButton
                          size="sm"
                          variant="primary"
                          onClick={() => handleNudge(s.studentId || s._id)}
                          loading={nudging === (s.studentId || s._id)}
                          icon={FiSend}
                        >
                          Nudge
                        </NeuButton>
                      </div>
                    </div>

                    {/* Breakdown Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-bold text-gray-700 bg-white p-3 rounded-xl border-2 border-gray-200">
                      <div>
                        <span className="text-gray-400 block font-semibold">Attendance Rate</span>
                        <span className={s.attendanceRate < 75 ? 'text-red-600 font-extrabold' : 'text-emerald-600'}>
                          {s.attendanceRate || 85}%
                        </span>
                      </div>

                      <div>
                        <span className="text-gray-400 block font-semibold">Internal Avg Score</span>
                        <span className={s.recentAvgScore < 50 ? 'text-red-600 font-extrabold' : 'text-blue-600'}>
                          {s.recentAvgScore || 75}%
                        </span>
                      </div>

                      <div>
                        <span className="text-gray-400 block font-semibold">SEG Placement Readiness</span>
                        <span className={(s.placementReadinessScore || 70) < 60 ? 'text-amber-600 font-extrabold' : 'text-emerald-600'}>
                          {s.placementReadinessScore || 70}%
                        </span>
                      </div>

                      <div>
                        <span className="text-gray-400 block font-semibold">CGPA</span>
                        <span>{s.cgpa || '8.5'}</span>
                      </div>
                    </div>

                    {/* Early Warning Badges */}
                    {s.earlyWarningFlags && s.earlyWarningFlags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {s.earlyWarningFlags.map((flag, fIdx) => (
                          <span key={fIdx} className="px-2.5 py-1 bg-red-100 border border-red-300 text-red-700 text-xs font-bold rounded-lg">
                            ⚠️ {flag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="p-8 text-center text-gray-500 font-bold bg-white border-[2px] border-dashed border-gray-300 rounded-xl">
                    No students match the selected risk filter criteria.
                  </div>
                )}
              </div>
            </NeuCard>
          </StaggerItem>
        </>
      )}
    </PageTransition>
  );
}
