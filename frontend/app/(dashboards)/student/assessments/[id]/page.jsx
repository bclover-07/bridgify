"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import NeuCard from '@/components/shared/NeuCard';
import NeuButton from '@/components/shared/NeuButton';
import NeuBadge from '@/components/shared/NeuBadge';
import { DashboardSkeleton } from '@/components/shared/LoadingSpinner';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import { FiArrowLeft, FiSend, FiCheckCircle, FiClock } from 'react-icons/fi';
import api from '@/lib/api';

export default function AssessmentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/student/assessments/${id}`)
      .then(res => {
        setData(res.data);
        if (res.data.existingSubmission) setSubmitted(true);
      })
      .catch(err => setError(err.response?.data?.error || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAnswer = (qId, value) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = async () => {
    const assessment = data?.assessment;
    if (!assessment) return;

    const answerPayload = assessment.questions.map(q => ({
      questionId: q._id,
      response: answers[q._id] || '',
    }));

    setSubmitting(true);
    try {
      await api.post(`/student/assessments/${id}/submit`, { answers: answerPayload });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <DashboardSkeleton />;
  if (error && !data) return (
    <PageTransition className="space-y-6">
      <NeuCard className="p-8 bg-white text-center">
        <p className="text-xl font-bold text-[var(--coral)] mb-4">⚠️ {error}</p>
        <NeuButton variant="ghost" onClick={() => router.back()} icon={FiArrowLeft}>Go Back</NeuButton>
      </NeuCard>
    </PageTransition>
  );

  const assessment = data?.assessment;
  const existingSub = data?.existingSubmission;

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
          <div className="flex gap-2">
            <NeuBadge variant={assessment?.difficulty === 'hard' ? 'danger' : assessment?.difficulty === 'easy' ? 'success' : 'warning'}>
              {assessment?.difficulty || 'mixed'}
            </NeuBadge>
            {assessment?.dueDate && (
              <NeuBadge variant="default" className="flex items-center gap-1">
                <FiClock size={10} /> Due: {new Date(assessment.dueDate).toLocaleDateString()}
              </NeuBadge>
            )}
          </div>
        </div>
      </StaggerItem>

      {submitted && (
        <StaggerItem>
          <NeuCard className="p-5 bg-[var(--mint)] text-[var(--ink)]">
            <div className="flex items-center gap-3">
              <FiCheckCircle size={24} />
              <div>
                <p className="font-bold text-lg">Assessment Submitted!</p>
                <p className="text-sm font-medium opacity-80">
                  {existingSub?.gradingStatus === 'auto_graded' || existingSub?.gradingStatus === 'final'
                    ? `Score: ${existingSub.percentage}% · Status: ${existingSub.gradingStatus.replace('_', ' ')}`
                    : 'AI grading is in progress. Check back soon for your results.'}
                </p>
              </div>
            </div>
          </NeuCard>
        </StaggerItem>
      )}

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="p-3 bg-red-50 border-[3px] border-[var(--coral)] rounded-2xl text-[var(--coral)] text-sm font-bold text-center">
          ⚠️ {error}
        </motion.div>
      )}

      {assessment?.questions?.map((q, i) => (
        <StaggerItem key={q._id || i}>
          <NeuCard className="p-5 bg-white">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl border-[3px] border-[var(--ink)] bg-[var(--electric)] text-white flex items-center justify-center font-bold text-sm shadow-[3px_3px_0px_0px_var(--ink)] flex-shrink-0">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <NeuBadge variant="default">{q.maxMarks} marks</NeuBadge>
                  {q.type && <NeuBadge variant="info">{q.type}</NeuBadge>}
                </div>
                <p className="font-bold text-base mt-2">{q.text || q.question}</p>
              </div>
            </div>

            {q.type === 'mcq' && q.options?.length > 0 ? (
              <div className="space-y-2 ml-13">
                {q.options.map((opt, oi) => {
                  const selected = submitted
                    ? existingSub?.answers?.find(a => a.questionId === q._id)?.response === opt
                    : answers[q._id] === opt;
                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={submitted}
                      onClick={() => handleAnswer(q._id, opt)}
                      className={`w-full text-left p-3 rounded-xl border-[3px] border-[var(--ink)] font-medium text-sm transition-all ${
                        selected ? 'bg-[var(--electric)] text-white shadow-[3px_3px_0px_0px_var(--ink)]' : 'bg-white hover:bg-gray-50'
                      } ${submitted ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <span className="font-bold mr-2">{String.fromCharCode(65 + oi)}.</span> {opt}
                    </button>
                  );
                })}
              </div>
            ) : (
              <textarea
                className="neu-textarea mt-2"
                placeholder={submitted ? 'Your submitted answer' : 'Write your answer here...'}
                rows={4}
                disabled={submitted}
                value={submitted ? (existingSub?.answers?.find(a => a.questionId === q._id)?.response || '') : (answers[q._id] || '')}
                onChange={(e) => handleAnswer(q._id, e.target.value)}
              />
            )}

            {submitted && existingSub?.answers?.find(a => a.questionId === q._id)?.feedback && (
              <div className="mt-3 p-3 bg-blue-50 border-[2px] border-blue-200 rounded-xl">
                <p className="text-xs font-bold text-blue-600 mb-1">AI Feedback:</p>
                <p className="text-sm text-blue-800">{existingSub.answers.find(a => a.questionId === q._id).feedback}</p>
              </div>
            )}
          </NeuCard>
        </StaggerItem>
      ))}

      {!submitted && assessment?.questions?.length > 0 && (
        <StaggerItem>
          <div className="flex justify-end">
            <NeuButton
              variant="primary"
              size="lg"
              onClick={handleSubmit}
              loading={submitting}
              iconRight={FiSend}
              className="px-8"
            >
              Submit Assessment
            </NeuButton>
          </div>
        </StaggerItem>
      )}
    </PageTransition>
  );
}
