"use client";

import { useEffect, useState } from 'react';
import NeuCard from '@/components/shared/NeuCard';
import NeuBadge from '@/components/shared/NeuBadge';
import { DashboardSkeleton } from '@/components/shared/LoadingSpinner';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import api from '@/lib/api';

export default function StudentProfilePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/profile/academics')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <DashboardSkeleton />;

  const { profile, enrolledCourses = [], recentGrades = [] } = data || {};

  return (
    <PageTransition className="space-y-6">
      {/* Profile Banner */}
      <StaggerItem>
        <NeuCard className="p-6 bg-[var(--ink)] text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[var(--electric)] flex items-center justify-center text-2xl font-bold border-2 border-white shadow-[2px_2px_0px_#fff]">
              {profile?.name?.charAt(0) || 'S'}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{profile?.name}</h1>
              <p className="text-sm opacity-80">{profile?.email} • Roll: {profile?.rollNo}</p>
              <div className="flex gap-2 mt-2">
                <NeuBadge variant="info">{profile?.branch}</NeuBadge>
                <NeuBadge variant="warning">Year {profile?.year} • Sem {profile?.semester}</NeuBadge>
              </div>
            </div>
          </div>

          <div className="flex gap-4 text-center">
            <div className="p-3 bg-white/10 rounded-xl border border-white/20">
              <span className="text-xs font-bold block opacity-75">Cumulative CGPA</span>
              <span className="text-3xl font-extrabold text-[var(--mint)]">{profile?.cgpa || '8.8'}</span>
            </div>
            <div className="p-3 bg-white/10 rounded-xl border border-white/20">
              <span className="text-xs font-bold block opacity-75">Attendance</span>
              <span className="text-3xl font-extrabold text-white">{profile?.attendancePercentage || 88}%</span>
            </div>
          </div>
        </NeuCard>
      </StaggerItem>

      {/* Academic Courses Progress */}
      <StaggerItem>
        <NeuCard className="p-6 bg-white space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            📚 Enrolled Academic Subjects & Lesson Progress
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {enrolledCourses.map(course => (
              <div key={course.id} className="p-4 border-[3px] border-[var(--ink)] rounded-xl bg-[var(--paper)] space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-[var(--electric)] uppercase">{course.code}</span>
                    <h3 className="font-bold text-base mt-0.5">{course.title}</h3>
                    <p className="text-xs text-gray-500">Faculty: {course.faculty}</p>
                  </div>
                  <NeuBadge variant="success">Internal Score: {course.internalScore}%</NeuBadge>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-gray-600">
                    <span>Lessons Completed</span>
                    <span>{course.lessonsCompleted} / {course.totalLessons}</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden border border-[var(--ink)]">
                    <div
                      className="h-full bg-[var(--electric)]"
                      style={{ width: `${Math.round((course.lessonsCompleted / course.totalLessons) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </NeuCard>
      </StaggerItem>

      {/* Marks & Submission Grades */}
      <StaggerItem>
        <NeuCard className="p-6 bg-white space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            📝 Faculty Assessment & Internal Marks Transcript
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200 text-xs text-gray-500 uppercase">
                  <th className="p-3">Assessment Title</th>
                  <th className="p-3">Score Achieved</th>
                  <th className="p-3">Total Marks</th>
                  <th className="p-3">Grading Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-semibold">
                {recentGrades.map(g => (
                  <tr key={g.id} className="hover:bg-gray-50">
                    <td className="p-3 font-bold text-gray-900">{g.assessmentTitle}</td>
                    <td className="p-3 text-[var(--electric)] font-bold">{g.score}</td>
                    <td className="p-3 text-gray-600">{g.totalMarks}</td>
                    <td className="p-3">
                      <NeuBadge variant={g.status === 'graded' ? 'success' : 'info'}>
                        {g.status || 'Graded'}
                      </NeuBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </NeuCard>
      </StaggerItem>
    </PageTransition>
  );
}
