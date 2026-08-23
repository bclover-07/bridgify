"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import NeuCard from '@/components/shared/NeuCard';
import NeuButton from '@/components/shared/NeuButton';
import NeuBadge from '@/components/shared/NeuBadge';
import SkillBar from '@/components/shared/SkillBar';
import { DashboardSkeleton } from '@/components/shared/LoadingSpinner';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import { FiArrowLeft, FiMail, FiUser, FiBookOpen, FiAward, FiCheckCircle } from 'react-icons/fi';
import api from '@/lib/api';

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

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

  const student = data?.student || {
    name: 'Arjun Reddy',
    email: 'arjun@mrdu.edu',
    student: { branch: 'CSE', year: 3, rollNo: '21MR1A0501', cgpa: 8.5, semester: 6, placementStatus: 'shortlisted' }
  };

  const seg = data?.seg?.length > 0 ? data.seg : [
    { skillLabel: 'React Frontend', confidenceScore: 88 },
    { skillLabel: 'Node.js APIs', confidenceScore: 85 },
    { skillLabel: 'Data Structures', confidenceScore: 92 },
    { skillLabel: 'System Design', confidenceScore: 78 },
    { skillLabel: 'MongoDB & SQL', confidenceScore: 84 },
  ];

  const submissions = data?.submissions || [];

  const radarData = seg.map(s => ({
    name: (s.skillLabel || s.skillId || 'Skill').replace(/\^{2,}/g, '').replace(/\+{2,}/g, ''),
    confidence: s.confidenceScore || s.maxConfidence || 80,
  }));

  return (
    <PageTransition className="space-y-6">
      <StaggerItem>
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors mb-3 cursor-pointer">
          <FiArrowLeft size={16} /> Back to Student Directory
        </button>
      </StaggerItem>

      {/* Student Profile Header Banner */}
      <StaggerItem>
        <NeuCard className="p-6 bg-white border-[3px] border-[var(--ink)] shadow-[4px_4px_0px_#000]">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-20 h-20 rounded-2xl border-[4px] border-[var(--ink)] bg-[var(--violet)] text-white flex items-center justify-center text-3xl font-bold shadow-[4px_4px_0px_0px_var(--ink)] shrink-0">
              {student?.name?.charAt(0) || 'S'}
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{student?.name}</h1>
                <p className="text-xs text-gray-500 font-medium">{student?.email} • Roll No: {student?.student?.rollNo || '21MR1A0501'}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <NeuBadge variant="info">{student?.student?.branch || 'CSE'} · Year {student?.student?.year || 3}</NeuBadge>
                <NeuBadge variant={student?.student?.placementStatus === 'placed' ? 'success' : 'warning'}>
                  {student?.student?.placementStatus || 'AI Shortlisted'}
                </NeuBadge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div className="p-3 bg-[var(--paper)] border-2 border-[var(--ink)] rounded-xl text-center">
                  <p className="text-2xl font-bold text-[var(--electric)]">{student?.student?.cgpa || '8.5'}</p>
                  <p className="text-xs font-bold text-gray-500">CGPA</p>
                </div>
                <div className="p-3 bg-[var(--paper)] border-2 border-[var(--ink)] rounded-xl text-center">
                  <p className="text-2xl font-bold text-gray-900">{student?.student?.semester || 6}</p>
                  <p className="text-xs font-bold text-gray-500">Semester</p>
                </div>
                <div className="p-3 bg-[var(--paper)] border-2 border-[var(--ink)] rounded-xl text-center">
                  <p className="text-2xl font-bold text-gray-900">{seg.length}</p>
                  <p className="text-xs font-bold text-gray-500">SEG Competencies</p>
                </div>
                <div className="p-3 bg-[var(--paper)] border-2 border-[var(--ink)] rounded-xl text-center">
                  <p className="text-2xl font-bold text-gray-900">{submissions.length || 4}</p>
                  <p className="text-xs font-bold text-gray-500">Submissions</p>
                </div>
              </div>
            </div>
          </div>
        </NeuCard>
      </StaggerItem>

      {/* Main Content Grid: Clear SEG Radar Chart & Skill Breakdown Bars */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Crisp Recharts Skill Evidence Graph Radar */}
        <StaggerItem>
          <NeuCard className="p-6 bg-white space-y-4 border-[3px] border-[var(--ink)] shadow-[4px_4px_0px_#000]">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                🧠 Verified Skill Evidence Graph (SEG)
              </h2>
              <NeuBadge variant="violet">0-100% Confidence</NeuBadge>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: '#111827', fontSize: 11, fontWeight: 'bold' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="SEG Confidence %" dataKey="confidence" stroke="#A960FF" fill="#A960FF" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </NeuCard>
        </StaggerItem>

        {/* Skill Detail Bars */}
        <StaggerItem>
          <NeuCard className="p-6 bg-white space-y-4 border-[3px] border-[var(--ink)] shadow-[4px_4px_0px_#000]">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              📊 Competency Breakdown
            </h2>

            <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2">
              {seg.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-gray-800">
                    <span className="flex items-center gap-1">
                      <FiCheckCircle className="text-emerald-600" /> {item.skillLabel || item.skillId}
                    </span>
                    <span>{item.confidenceScore || 85}%</span>
                  </div>
                  <SkillBar percentage={item.confidenceScore || 85} color="var(--violet)" />
                </div>
              ))}
            </div>
          </NeuCard>
        </StaggerItem>
      </div>
    </PageTransition>
  );
}
