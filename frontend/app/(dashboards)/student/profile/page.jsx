"use client";

import { useEffect, useState } from 'react';
import NeuCard from '@/components/shared/NeuCard';
import NeuButton from '@/components/shared/NeuButton';
import NeuBadge from '@/components/shared/NeuBadge';
import { DashboardSkeleton } from '@/components/shared/LoadingSpinner';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import { FiUser, FiMap, FiShield, FiCheckCircle, FiShare2, FiDownload, FiAward, FiExternalLink } from 'react-icons/fi';
import api from '@/lib/api';

export default function StudentProfilePage() {
  const [activeTab, setActiveTab] = useState('academics');
  const [loading, setLoading] = useState(true);
  const [academicsData, setAcademicsData] = useState(null);
  const [segData, setSegData] = useState(null);
  const [walletData, setWalletData] = useState(null);

  useEffect(() => {
    async function loadAllProfileData() {
      setLoading(true);
      try {
        const [acadRes, segRes, walletRes] = await Promise.all([
          api.get('/student/profile/academics').catch(() => ({ data: {} })),
          api.get('/student/seg').catch(() => ({ data: {} })),
          api.get('/student/wallet').catch(() => ({ data: {} })),
        ]);
        setAcademicsData(acadRes.data || {});
        setSegData(segRes.data || {});
        setWalletData(walletRes.data || {});
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAllProfileData();
  }, []);

  if (loading) return <DashboardSkeleton />;

  const { profile = {}, enrolledCourses = [], recentGrades = [] } = academicsData;
  const segNodes = segData?.nodes || [
    { skillId: 'react.core', label: 'React & State Management', score: 85, verifiedCount: 6, level: 'Advanced' },
    { skillId: 'node.express', label: 'Node.js & Express REST APIs', score: 78, verifiedCount: 4, level: 'Intermediate' },
    { skillId: 'dsa.trees', label: 'DSA & Tree Traversals', score: 92, verifiedCount: 8, level: 'Master' },
    { skillId: 'db.mongo', label: 'MongoDB & Mongoose Schemas', score: 74, verifiedCount: 3, level: 'Intermediate' },
    { skillId: 'python.ml', label: 'Python & Machine Learning', score: 65, verifiedCount: 2, level: 'Practitioner' },
  ];

  const walletCredentials = walletData?.credentials || [
    { id: 'cred-1', title: 'Fullstack React & Node Specialist', issuer: 'Bridgify Verification Engine', issuedAt: '2026-08-15', level: 'Master' },
    { id: 'cred-2', title: 'Data Structures & Algorithms Certification', issuer: 'MRDU Computer Science Dept', issuedAt: '2026-08-10', level: 'Advanced' },
  ];

  return (
    <PageTransition className="space-y-6">
      {/* Profile Header Banner */}
      <StaggerItem>
        <NeuCard className="p-6 bg-[var(--ink)] text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[var(--electric)] flex items-center justify-center text-2xl font-bold border-2 border-white shadow-[2px_2px_0px_#fff]">
              {profile?.name?.charAt(0) || 'S'}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{profile?.name || 'Arjun Sharma'}</h1>
              <p className="text-sm opacity-80">{profile?.email || 'arjun@mrdu.edu'} • Roll: {profile?.rollNo || '21MR1A0501'}</p>
              <div className="flex gap-2 mt-2">
                <NeuBadge variant="info">{profile?.branch || 'Computer Science'}</NeuBadge>
                <NeuBadge variant="warning">Year {profile?.year || 4} • Sem {profile?.semester || 7}</NeuBadge>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-center">
            <div className="p-3 bg-white/10 rounded-xl border border-white/20">
              <span className="text-xs font-bold block opacity-75">Target Role Readiness</span>
              <span className="text-3xl font-extrabold text-amber-300">{segData?.aggregate?.totalReadinessScore || 82}%</span>
            </div>
            <div className="p-3 bg-white/10 rounded-xl border border-white/20">
              <span className="text-xs font-bold block opacity-75">CGPA</span>
              <span className="text-3xl font-extrabold text-[var(--mint)]">{profile?.cgpa || '8.8'}</span>
            </div>
            <div className="p-3 bg-white/10 rounded-xl border border-white/20">
              <span className="text-xs font-bold block opacity-75">Attendance</span>
              <span className="text-3xl font-extrabold text-white">{profile?.attendancePercentage || 88}%</span>
            </div>
          </div>
        </NeuCard>
      </StaggerItem>

      {/* Unified Hub Navigation Tabs */}
      <StaggerItem className="flex border-[3px] border-[var(--ink)] rounded-2xl bg-white overflow-hidden shadow-[4px_4px_0px_#000]">
        <button
          onClick={() => setActiveTab('academics')}
          className={`flex-1 py-3.5 px-4 font-bold text-sm flex items-center justify-center gap-2 border-r-[3px] border-[var(--ink)] ${
            activeTab === 'academics' ? 'bg-[var(--electric)] text-white' : 'hover:bg-gray-100 text-gray-800'
          }`}
        >
          <FiUser size={18} />
          <span>🎓 Academic Profile & Transcripts</span>
        </button>

        <button
          onClick={() => setActiveTab('seg')}
          className={`flex-1 py-3.5 px-4 font-bold text-sm flex items-center justify-center gap-2 border-r-[3px] border-[var(--ink)] ${
            activeTab === 'seg' ? 'bg-[var(--electric)] text-white' : 'hover:bg-gray-100 text-gray-800'
          }`}
        >
          <FiMap size={18} />
          <span>🕸️ Skill Evidence Graph (SEG)</span>
        </button>

        <button
          onClick={() => setActiveTab('wallet')}
          className={`flex-1 py-3.5 px-4 font-bold text-sm flex items-center justify-center gap-2 ${
            activeTab === 'wallet' ? 'bg-[var(--electric)] text-white' : 'hover:bg-gray-100 text-gray-800'
          }`}
        >
          <FiShield size={18} />
          <span>🛡️ Verified Skill Wallet</span>
        </button>
      </StaggerItem>

      {/* TAB 1: ACADEMIC PROFILE & TRANSCRIPTS */}
      {activeTab === 'academics' && (
        <StaggerItem className="space-y-6">
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
      )}

      {/* TAB 2: SKILL EVIDENCE GRAPH (SEG) */}
      {activeTab === 'seg' && (
        <StaggerItem className="space-y-6">
          <NeuCard className="p-6 bg-white space-y-6">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                🕸️ Verified Skill Evidence Graph (SEG)
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-1">
                Every assignment submitted, code review passed, and test completed auto-pushes verified skill nodes to your graph.
              </p>
            </div>

            <div className="space-y-4">
              {segNodes.map((node, i) => (
                <div key={node.skillId || i} className="p-4 border-[3px] border-[var(--ink)] rounded-2xl bg-[var(--paper)] space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <span className="text-xs font-bold text-[var(--electric)] uppercase font-mono">{node.skillId}</span>
                      <h3 className="font-bold text-lg">{node.label}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <NeuBadge variant="info">{node.level || 'Verified'}</NeuBadge>
                      <NeuBadge variant="success">{node.verifiedCount || 3} Evidence Nodes</NeuBadge>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span>Verified Skill Confidence Score</span>
                      <span className="text-[var(--electric)] font-extrabold">{node.score}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden border border-[var(--ink)]">
                      <div
                        className="h-full bg-gradient-to-r from-[var(--electric)] to-[var(--mint)]"
                        style={{ width: `${node.score}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </NeuCard>
        </StaggerItem>
      )}

      {/* TAB 3: VERIFIED SKILL WALLET */}
      {activeTab === 'wallet' && (
        <StaggerItem className="space-y-6">
          <NeuCard className="p-6 bg-white space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  🛡️ W3C Verifiable Credentials & Skill Wallet
                </h2>
                <p className="text-xs text-gray-500 font-medium mt-1">
                  Cryptographically signed skill credentials ready for recruiter sharing.
                </p>
              </div>
              <NeuButton variant="primary" icon={FiShare2} onClick={() => alert('Shareable Skill Wallet Link Copied!')}>
                Share Public Wallet
              </NeuButton>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {walletCredentials.map((cred, i) => (
                <div key={cred.id || i} className="p-5 border-[3px] border-[var(--ink)] rounded-2xl bg-[var(--paper)] space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--electric)] text-white flex items-center justify-center text-xl font-bold border-2 border-[var(--ink)]">
                      <FiAward />
                    </div>
                    <NeuBadge variant="success">W3C Verified</NeuBadge>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg">{cred.title}</h3>
                    <p className="text-xs text-gray-500 font-medium">Issued by: {cred.issuer}</p>
                    <p className="text-xs text-gray-400">Date: {cred.issuedAt}</p>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <NeuButton size="xs" variant="ghost" icon={FiDownload} onClick={() => alert('Downloading credential PDF certificate...')}>
                      Download Certificate
                    </NeuButton>
                    <NeuButton size="xs" variant="accent" icon={FiExternalLink} onClick={() => alert('Viewing W3C cryptographic proof...')}>
                      View Proof
                    </NeuButton>
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
