"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import NeuCard from '@/components/shared/NeuCard';
import NeuButton from '@/components/shared/NeuButton';
import NeuBadge from '@/components/shared/NeuBadge';
import { DashboardSkeleton } from '@/components/shared/LoadingSpinner';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import { FiArrowLeft, FiCheck, FiUpload, FiEdit, FiSave } from 'react-icons/fi';
import api from '@/lib/api';

export default function FacultyAssessmentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [assessment, setAssessment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [pushingSEG, setPushingSEG] = useState(false);
  const [gradingId, setGradingId] = useState(null);
  const [gradeData, setGradeData] = useState({});
  const [tab, setTab] = useState('details');

  useEffect(() => {
    Promise.all([
      api.get(`/faculty/assessments/${id}`),
      api.get(`/faculty/assessments/${id}/submissions`).catch(() => ({ data: { submissions: [] } })),
    ]).then(([aRes, sRes]) => {
      setAssessment(aRes.data.assessment);
      setSubmissions(sRes.data.submissions || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await api.patch(`/faculty/assessments/${id}`, { status: 'published' });
      setAssessment(res.data.assessment);
    } catch (err) { console.error(err); }
    setPublishing(false);
  };

  const handlePushToSEG = async () => {
    setPushingSEG(true);
    try {
      await api.post(`/faculty/assessments/${id}/push-to-seg`);
      alert('Pushed to SEG successfully!');
    } catch (err) { console.error(err); }
    setPushingSEG(false);
  };

  const handleGrade = async (submissionId) => {
    const data = gradeData[submissionId];
    if (!data) return;
    try {
      await api.patch(`/faculty/submissions/${submissionId}/grade`, { answers: data });
      const sRes = await api.get(`/faculty/assessments/${id}/submissions`);
      setSubmissions(sRes.data.submissions || []);
      setGradingId(null);
    } catch (err) { console.error(err); }
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <PageTransition className="space-y-6">
      <StaggerItem>
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors mb-3">
          <FiArrowLeft size={16} /> Back to Assessments
        </button>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">📝 {assessment?.title}</h1>
            <p className="text-gray-500 font-medium">{assessment?.topic} · {assessment?.questions?.length} questions · {assessment?.totalMarks} marks</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <NeuBadge variant={assessment?.status === 'published' ? 'success' : 'warning'}>
              {assessment?.status || 'draft'}
            </NeuBadge>
            {assessment?.status === 'draft' && (
              <NeuButton variant="mint" size="sm" onClick={handlePublish} loading={publishing} icon={FiCheck}>
                Publish
              </NeuButton>
            )}
            <NeuButton variant="violet" size="sm" onClick={handlePushToSEG} loading={pushingSEG} icon={FiUpload}>
              Push to SEG
            </NeuButton>
          </div>
        </div>
      </StaggerItem>

      <StaggerItem>
        <div className="flex gap-0 border-[4px] border-[var(--ink)] rounded-2xl overflow-hidden">
          {['details', 'submissions'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-3 px-4 font-bold text-sm capitalize transition-colors ${tab === t ? 'bg-[var(--sky)] text-white' : 'bg-white hover:bg-gray-50'} ${t === 'details' ? 'border-r-[4px] border-[var(--ink)]' : ''}`}>
              {t} {t === 'submissions' ? `(${submissions.length})` : ''}
            </button>
          ))}
        </div>
      </StaggerItem>

      {tab === 'details' && assessment?.questions?.map((q, i) => (
        <StaggerItem key={q._id || i}>
          <NeuCard className="p-5 bg-white">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl border-[3px] border-[var(--ink)] bg-[var(--sky)] text-white flex items-center justify-center font-bold text-sm shadow-[3px_3px_0px_0px_var(--ink)] flex-shrink-0">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <NeuBadge variant="default">{q.maxMarks} marks</NeuBadge>
                  {q.type && <NeuBadge variant="info">{q.type}</NeuBadge>}
                  {q.skillId && <NeuBadge variant="success">{q.skillId}</NeuBadge>}
                  {q.difficulty && <NeuBadge variant={q.difficulty === 'hard' ? 'danger' : 'warning'}>{q.difficulty}</NeuBadge>}
                </div>
                <p className="font-bold">{q.text || q.question}</p>
                {q.options?.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {q.options.map((opt, oi) => (
                      <p key={oi} className={`text-sm pl-4 ${q.correctAnswer === opt ? 'font-bold text-[var(--mint)]' : 'text-gray-600'}`}>
                        {String.fromCharCode(65 + oi)}. {opt} {q.correctAnswer === opt && '✓'}
                      </p>
                    ))}
                  </div>
                )}
                {q.rubric && <p className="text-xs text-gray-400 mt-2 italic">Rubric: {q.rubric}</p>}
              </div>
            </div>
          </NeuCard>
        </StaggerItem>
      ))}

      {tab === 'submissions' && (
        <StaggerItem>
          {submissions.length === 0 ? (
            <NeuCard className="p-8 bg-white text-center">
              <p className="text-gray-400 font-bold">No submissions yet</p>
            </NeuCard>
          ) : (
            <div className="space-y-4">
              {submissions.map((sub) => (
                <NeuCard key={sub._id} className="p-5 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold">{sub.studentId?.name || 'Student'}</p>
                      <p className="text-xs text-gray-500">{sub.studentId?.email} · {sub.studentId?.student?.rollNo} · {sub.studentId?.student?.branch}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {sub.percentage !== undefined && <span className="font-bold text-xl">{sub.percentage}%</span>}
                      <NeuBadge variant={sub.gradingStatus === 'final' ? 'success' : sub.gradingStatus === 'auto_graded' ? 'info' : 'warning'}>
                        {sub.gradingStatus?.replace('_', ' ')}
                      </NeuBadge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <NeuButton size="xs" variant="sky" icon={FiEdit}
                      onClick={() => setGradingId(gradingId === sub._id ? null : sub._id)}>
                      {gradingId === sub._id ? 'Cancel' : 'Grade'}
                    </NeuButton>
                  </div>
                  {gradingId === sub._id && (
                    <div className="mt-4 space-y-3 border-t-[3px] border-[var(--ink)] pt-4">
                      {sub.answers?.map((a, ai) => {
                        const question = assessment?.questions?.find(q => q._id === a.questionId);
                        return (
                          <div key={ai} className="p-3 bg-[var(--paper)] border-[2px] border-[var(--ink)] rounded-xl">
                            <p className="text-xs font-bold text-gray-500 mb-1">Q{ai + 1}: {question?.text?.substring(0, 60) || 'Question'}...</p>
                            <p className="text-sm font-medium mb-2">Answer: {a.response?.substring(0, 200)}</p>
                            <div className="flex gap-2 items-center">
                              <input type="number" min="0" max={question?.maxMarks || 10}
                                placeholder="Score"
                                className="neu-input w-24 text-sm py-1"
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setGradeData(prev => ({
                                    ...prev,
                                    [sub._id]: [
                                      ...(prev[sub._id] || []).filter(g => g.questionId !== a.questionId),
                                      { questionId: a.questionId, score: val, feedback: '' }
                                    ]
                                  }));
                                }} />
                              <span className="text-xs text-gray-400">/ {question?.maxMarks || '?'}</span>
                            </div>
                          </div>
                        );
                      })}
                      <NeuButton variant="primary" size="sm" icon={FiSave}
                        onClick={() => handleGrade(sub._id)}>
                        Save Grades
                      </NeuButton>
                    </div>
                  )}
                </NeuCard>
              ))}
            </div>
          )}
        </StaggerItem>
      )}
    </PageTransition>
  );
}
