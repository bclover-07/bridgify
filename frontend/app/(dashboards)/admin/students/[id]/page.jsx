"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import NeuCard from '@/components/shared/NeuCard';
import NeuButton from '@/components/shared/NeuButton';
import NeuBadge from '@/components/shared/NeuBadge';
import SkillBar from '@/components/shared/SkillBar';
import { NeuRadarChart } from '@/components/shared/NeuChart';
import { DashboardSkeleton } from '@/components/shared/LoadingSpinner';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import { FiArrowLeft, FiMail, FiUser, FiBookOpen } from 'react-icons/fi';
import api from '@/lib/api';

export default function AdminStudentProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/admin/students/${id}/full-profile`)
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <DashboardSkeleton />;
  if (!data) return <div className="text-center py-20 font-bold text-gray-400">Student not found</div>;

  const student = data.student;
  const seg = data.seg || [];
  const submissions = data.submissions || [];

  const radarData = seg.slice(0, 8).map(s => ({
    subject: (s.skillLabel || s.skillId || '').substring(0, 10),
    score: s.confidenceScore || s.maxConfidence || 0,
  }));

  return (
    <PageTransition className="space-y-6">
      <StaggerItem>
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors mb-3">
          <FiArrowLeft size={16} /> Back to Directory
        </button>
      </StaggerItem>

      <StaggerItem>
        <NeuCard className="p-6 bg-white">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-20 h-20 rounded-2xl border-[4px] border-[var(--ink)] bg-[var(--violet)] text-white flex items-center justify-center text-2xl font-bold shadow-[5px_5px_0px_0px_var(--ink)]">
              {student?.name?.charAt(0) || '?'}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-1">{student?.name}</h1>
              <div className="flex flex-wrap gap-2 mb-3">
                <NeuBadge variant="info">{student?.student?.branch} · Year {student?.student?.year}</NeuBadge>
                <NeuBadge variant="default">Roll: {student?.student?.rollNo}</NeuBadge>
                <NeuBadge variant={student?.student?.placementStatus === 'placed' ? 'success' : 'warning'}>
                  {student?.student?.placementStatus?.replace('_', ' ')}
                </NeuBadge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-[var(--paper)] border-[2px] border-[var(--ink)] rounded-xl text-center">
                  <p className="text-2xl font-bold">{student?.student?.cgpa || 'N/A'}</p>
                  <p className="text-xs font-bold text-gray-500">CGPA</p>
                </div>
                <div className="p-3 bg-[var(--paper)] border-[2px] border-[var(--ink)] rounded-xl text-center">
                  <p className="text-2xl font-bold">{student?.student?.semester || 'N/A'}</p>
                  <p className="text-xs font-bold text-gray-500">Semester</p>
                </div>
                <div className="p-3 bg-[var(--paper)] border-[2px] border-[var(--ink)] rounded-xl text-center">
                  <p className="text-2xl font-bold">{seg.length}</p>
                  <p className="text-xs font-bold text-gray-500">Skills</p>
                </div>
                <div className="p-3 bg-[var(--paper)] border-[2px] border-[var(--ink)] rounded-xl text-center">
                  <p className="text-2xl font-bold">{submissions.length}</p>
                  <p className="text-xs font-bold text-gray-500">Submissions</p>
                </div>
              </div>
            </div>
          </div>
        </NeuCard>
      </StaggerItem>

      <div className="grid lg:grid-cols-2 gap-6">
        {radarData.length >= 3 && (
          <StaggerItem>
            <NeuCard className="p-5 bg-white">
              <h2 className="text-xl font-bold mb-4">🧠 Skill Evidence Graph</h2>
              <NeuRadarChart data={radarData} dataKeys={[{ key: 'score', label: 'Confidence', color: '#A960FF' }]} height={280} />
            </NeuCard>
          </StaggerItem>
        )}

        {seg.length > 0 && (
          <StaggerItem>
            <NeuCard className="p-5 bg-white">
              <h2 className="text-xl font-bold mb-4">📊 Skills Detail</h2>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {seg.map((s, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-bold">{s.skillLabel || s.skillId}</span>
                      <span className="text-sm font-bold">{s.confidenceScore || s.maxConfidence || 0}%</span>
                    </div>
                    <SkillBar value={s.confidenceScore || s.maxConfidence || 0} color="var(--violet)" />
                  </div>
                ))}
              </div>
            </NeuCard>
          </StaggerItem>
        )}
      </div>

      {submissions.length > 0 && (
        <StaggerItem>
          <NeuCard className="p-5 bg-white">
            <h2 className="text-xl font-bold mb-4">📝 Assessment Submissions</h2>
            <div className="space-y-3">
              {submissions.slice(0, 10).map((sub, i) => (
                <div key={sub._id || i} className="flex items-center justify-between p-3 border-[3px] border-[var(--ink)] rounded-xl bg-[var(--paper)]">
                  <div>
                    <p className="font-bold text-sm">{sub.assessmentId?.title || 'Assessment'}</p>
                    <p className="text-xs text-gray-500">{sub.assessmentId?.topic}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {sub.percentage !== undefined && <span className="font-bold">{sub.percentage}%</span>}
                    <NeuBadge variant={sub.gradingStatus === 'final' ? 'success' : 'warning'}>
                      {sub.gradingStatus?.replace('_', ' ')}
                    </NeuBadge>
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
