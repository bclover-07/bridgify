"use client";

import { useEffect, useState } from 'react';
import NeuCard from '@/components/shared/NeuCard';
import NeuButton from '@/components/shared/NeuButton';
import NeuBadge from '@/components/shared/NeuBadge';
import { DashboardSkeleton } from '@/components/shared/LoadingSpinner';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import NeuModal from '@/components/shared/NeuModal';
import api from '@/lib/api';

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAsgn, setSelectedAsgn] = useState(null);
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [submitted, setSubmitted] = useState({});
  const [code, setCode] = useState('');
  const [codeResult, setCodeResult] = useState(null);
  const [submittingCode, setSubmittingCode] = useState(false);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '' });

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = () => {
    setLoading(true);
    api.get('/student/assignments')
      .then(res => {
        setAssignments(res.data.assignments || []);
        if (res.data.assignments?.length > 0) {
          setSelectedAsgn(res.data.assignments[0]);
          setCode(res.data.assignments[0]?.codingChallenge?.starterCode || '');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleSelectOption = (qIdx, optIdx) => {
    setMcqAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmitMCQs = async () => {
    if (!selectedAsgn) return;
    let correctCount = 0;
    const totalQ = selectedAsgn.questions?.length || 1;
    selectedAsgn.questions.forEach((q, idx) => {
      if (mcqAnswers[idx] === q.correctIndex) correctCount++;
    });

    const score = Math.round((correctCount / totalQ) * 100);

    try {
      await api.post('/student/assignments/submit', {
        skillId: selectedAsgn.skillId || 'general.practice',
        score,
        topicName: selectedAsgn.topic,
      });

      setSubmitted(prev => ({
        ...prev,
        [selectedAsgn.id]: { score, correctCount, totalQ }
      }));
      setModalConfig({
        isOpen: true,
        title: 'Success!',
        message: `Assignment Submitted! Score: ${score}% (${correctCount}/${totalQ} correct). Readiness score boosted!`
      });
    } catch (e) {
      setModalConfig({
        isOpen: true,
        title: 'Error',
        message: 'Submission failed: ' + (e.response?.data?.error || e.message)
      });
    }
  };

  const handleRunCodeTask = async () => {
    setSubmittingCode(true);
    try {
      const res = await api.post('/student/code/ai-review', { code, language: 'javascript' });
      setCodeResult(res.data.review);
      if (!res.data.review.hasErrors) {
        await api.post('/student/assignments/submit', {
          skillId: selectedAsgn.skillId || 'coding.practice',
          score: 100,
          topicName: selectedAsgn.codingChallenge?.title || 'Coding Practice',
        });
      }
    } catch (e) {
      setModalConfig({
        isOpen: true,
        title: 'Error',
        message: 'Code review failed: ' + (e.response?.data?.error || e.message)
      });
    }
    setSubmittingCode(false);
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <PageTransition className="space-y-6">
      <StaggerItem className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">✍️ Practice Assignments & MCQs</h1>
          <p className="text-gray-500 font-medium">Complete topic challenges to boost your Readiness score & SEG profile</p>
        </div>
      </StaggerItem>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Assignment List */}
        <StaggerItem className="space-y-3">
          <h2 className="text-xl font-bold">Topics & Tasks</h2>
          {assignments.map(asgn => (
            <NeuCard
              key={asgn.id}
              onClick={() => {
                setSelectedAsgn(asgn);
                setMcqAnswers({});
                setCode(asgn.codingChallenge?.starterCode || '');
                setCodeResult(null);
              }}
              className={`p-4 cursor-pointer transition-all ${
                selectedAsgn?.id === asgn.id
                  ? 'border-[var(--ink)] bg-[var(--paper)] shadow-[4px_4px_0px_#000]'
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-extrabold text-[var(--electric)] uppercase tracking-wide bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {asgn.courseCode || 'CS301'} • {asgn.source || 'Faculty Assignment'}
                    </span>
                  </div>
                  <h3 className="font-bold text-base leading-tight mt-0.5">{asgn.title || asgn.topic}</h3>
                  {asgn.instructions && (
                    <p className="text-xs text-gray-500 line-clamp-1 mt-1 font-medium">{asgn.instructions}</p>
                  )}
                </div>
                {submitted[asgn.id] ? (
                  <NeuBadge variant="success">Completed</NeuBadge>
                ) : (
                  <NeuBadge variant="info">New Quiz</NeuBadge>
                )}
              </div>
            </NeuCard>
          ))}
        </StaggerItem>

        {/* Selected Assignment Active Area */}
        <StaggerItem className="md:col-span-2 space-y-6">
          {selectedAsgn && (
            <>
              <NeuCard className="p-6 bg-white space-y-6">
                <div className="border-b-2 border-gray-100 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--electric)] uppercase">Faculty Lecture Bridge Practice</span>
                    <NeuBadge variant="violet">{selectedAsgn.courseCode || 'CS301'}</NeuBadge>
                  </div>
                  <h2 className="text-2xl font-bold mt-1 text-gray-900">{selectedAsgn.title || selectedAsgn.topic}</h2>
                  <p className="text-xs text-gray-600 font-medium mt-1">{selectedAsgn.instructions || selectedAsgn.milestoneTitle}</p>
                </div>

                {/* MCQ Questions Section */}
                {selectedAsgn.questions && selectedAsgn.questions.length > 0 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-800">Multiple Choice Questions</h3>
                    {selectedAsgn.questions.map((q, qIdx) => (
                      <div key={qIdx} className="p-4 border-[3px] border-[var(--ink)] rounded-xl bg-[var(--paper)] space-y-3">
                        <p className="font-bold text-gray-900">Q{qIdx + 1}: {q.question}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, oIdx) => (
                            <button
                              key={oIdx}
                              onClick={() => handleSelectOption(qIdx, oIdx)}
                              className={`p-3 text-left rounded-lg font-semibold border-2 transition-all text-sm ${
                                mcqAnswers[qIdx] === oIdx
                                  ? 'border-[var(--ink)] bg-[var(--electric)] text-white shadow-[2px_2px_0px_#000]'
                                  : 'border-gray-300 bg-white text-gray-800 hover:border-gray-400'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                        {submitted[selectedAsgn.id] && (
                          <div className="mt-2 text-xs font-medium text-gray-600 bg-white p-2 rounded border">
                            💡 Explanation: {q.explanation}
                          </div>
                        )}
                      </div>
                    ))}

                    <NeuButton
                      variant="primary"
                      onClick={handleSubmitMCQs}
                      disabled={Object.keys(mcqAnswers).length === 0}
                    >
                      Submit MCQs
                    </NeuButton>
                  </div>
                )}

                {/* Coding Challenge Section */}
                {selectedAsgn.codingChallenge && (
                  <div className="pt-6 border-t-2 border-gray-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-800">💻 Coding Challenge</h3>
                      <NeuBadge variant="warning">Hands-on Code</NeuBadge>
                    </div>

                    <div className="p-4 border-[3px] border-[var(--ink)] rounded-xl bg-gray-900 text-white space-y-2">
                      <h4 className="font-bold text-yellow-400">{selectedAsgn.codingChallenge.title}</h4>
                      <p className="text-xs text-gray-300">{selectedAsgn.codingChallenge.description}</p>
                    </div>

                    <textarea
                      rows={8}
                      className="w-full font-mono text-sm p-4 border-[3px] border-[var(--ink)] rounded-xl bg-gray-950 text-emerald-400 focus:outline-none"
                      value={code}
                      onChange={e => setCode(e.target.value)}
                    />

                    <div className="flex gap-3">
                      <NeuButton
                        variant="accent"
                        onClick={handleRunCodeTask}
                        loading={submittingCode}
                      >
                        Submit & AI Review
                      </NeuButton>
                    </div>

                    {codeResult && (
                      <div className={`p-4 border-[3px] border-[var(--ink)] rounded-xl ${
                        codeResult.hasErrors ? 'bg-red-50' : 'bg-emerald-50'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm">AI Code Evaluation</span>
                          <NeuBadge variant={codeResult.hasErrors ? 'danger' : 'success'}>
                            {codeResult.hasErrors ? 'Bugs Found' : 'Pass'}
                          </NeuBadge>
                        </div>
                        <p className="text-xs font-medium text-gray-800 mb-2">{codeResult.explanation}</p>
                        <div className="flex gap-4 text-xs font-bold text-gray-600">
                          <span>Time: {codeResult.timeComplexity}</span>
                          <span>Space: {codeResult.spaceComplexity}</span>
                        </div>
                        {codeResult.correctedCode && (
                          <div className="mt-3">
                            <span className="text-xs font-bold block mb-1">Suggested Fix:</span>
                            <pre className="p-2 bg-gray-900 text-emerald-300 rounded font-mono text-xs overflow-x-auto">
                              {codeResult.correctedCode}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </NeuCard>
            </>
          )}
        </StaggerItem>
      </div>

      <NeuModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        title={modalConfig.title}
        size="sm"
      >
        <div className="space-y-6">
          <p className="text-gray-700 font-medium">{modalConfig.message}</p>
          <div className="flex justify-end">
            <NeuButton variant="primary" onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}>
              Okay
            </NeuButton>
          </div>
        </div>
      </NeuModal>
    </PageTransition>
  );
}
