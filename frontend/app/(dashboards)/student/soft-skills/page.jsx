"use client";

import { useState } from 'react';
import NeuCard from '@/components/shared/NeuCard';
import NeuButton from '@/components/shared/NeuButton';
import NeuTabs from '@/components/shared/NeuTabs';
import NeuBadge from '@/components/shared/NeuBadge';
import { DashboardSkeleton } from '@/components/shared/LoadingSpinner';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import { FiMic, FiMessageCircle } from 'react-icons/fi';
import api from '@/lib/api';

export default function SoftSkillsPage() {
  const [tab, setTab] = useState('interview');
  const [targetRole, setTargetRole] = useState('');
  const [interviewResult, setInterviewResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [debateTopic, setDebateTopic] = useState('');
  const [debateSide, setDebateSide] = useState('for');
  const [debateResult, setDebateResult] = useState(null);

  const startInterview = async () => {
    if (!targetRole) return;
    setLoading(true);
    try {
      const res = await api.post('/student/mock-interview/start', { targetRole });
      setInterviewResult(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get('/student/mock-interview/history');
      setHistory(res.data.sessions || res.data.interviews || res.data || []);
    } catch (e) { console.error(e); }
  };

  const startDebate = async () => {
    if (!debateTopic) return;
    setLoading(true);
    try {
      const res = await api.post('/student/debate/start', { topic: debateTopic, side: debateSide });
      setDebateResult(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <PageTransition className="space-y-6">
      <StaggerItem>
        <h1 className="text-3xl font-bold mb-1">🎤 Soft Skills Coach</h1>
        <p className="text-gray-500 font-medium">Practice interviews and debates with AI</p>
      </StaggerItem>

      <StaggerItem>
        <NeuTabs
          tabs={[
            { key: 'interview', label: 'Mock Interview', icon: FiMic },
            { key: 'debate', label: 'AI Debate', icon: FiMessageCircle },
          ]}
          activeTab={tab}
          onChange={(t) => { setTab(t); if (t === 'interview') fetchHistory(); }}
        />
      </StaggerItem>

      {tab === 'interview' && (
        <StaggerItem className="space-y-5">
          <NeuCard className="p-5 bg-white">
            <h2 className="text-xl font-bold mb-4">Start a Mock Interview</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                className="neu-input flex-1"
                placeholder="Target role e.g. Software Engineer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
              <NeuButton variant="primary" onClick={startInterview} loading={loading} icon={FiMic}>
                Start Interview
              </NeuButton>
            </div>
          </NeuCard>

          {interviewResult && (
            <NeuCard className="p-5 bg-white">
              <h2 className="text-xl font-bold mb-3">Interview Session</h2>
              <div className="space-y-4">
                {(interviewResult.questions || [interviewResult]).map((q, i) => (
                  <div key={i} className="p-4 border-[3px] border-[var(--ink)] rounded-xl bg-[var(--paper)]">
                    <p className="font-bold text-sm">{q.question || q.content || JSON.stringify(q)}</p>
                    {q.tip && <p className="text-xs text-gray-500 mt-2">💡 {q.tip}</p>}
                  </div>
                ))}
              </div>
              {interviewResult.overallScore && (
                <div className="mt-4 flex gap-3">
                  <NeuBadge variant="primary">Score: {interviewResult.overallScore}</NeuBadge>
                </div>
              )}
            </NeuCard>
          )}

          {history.length > 0 && (
            <NeuCard className="p-5 bg-white">
              <h2 className="text-xl font-bold mb-4">Past Interviews</h2>
              <div className="space-y-3">
                {history.slice(0, 5).map((h, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border-[3px] border-[var(--ink)] rounded-xl bg-[var(--paper)]">
                    <div>
                      <p className="font-bold text-sm">{h.targetRole || 'Interview'}</p>
                      <p className="text-xs text-gray-400">{h.createdAt ? new Date(h.createdAt).toLocaleDateString() : ''}</p>
                    </div>
                    {h.overallScore && <NeuBadge variant="success">Score: {h.overallScore}</NeuBadge>}
                  </div>
                ))}
              </div>
            </NeuCard>
          )}
        </StaggerItem>
      )}

      {tab === 'debate' && (
        <StaggerItem className="space-y-5">
          <NeuCard className="p-5 bg-white">
            <h2 className="text-xl font-bold mb-4">Start an AI Debate</h2>
            <div className="space-y-3">
              <input
                className="neu-input"
                placeholder="Debate topic e.g. AI will replace software engineers"
                value={debateTopic}
                onChange={(e) => setDebateTopic(e.target.value)}
              />
              <div className="flex gap-3">
                <NeuButton
                  variant={debateSide === 'for' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setDebateSide('for')}
                >
                  For ✅
                </NeuButton>
                <NeuButton
                  variant={debateSide === 'against' ? 'coral' : 'ghost'}
                  size="sm"
                  onClick={() => setDebateSide('against')}
                >
                  Against ❌
                </NeuButton>
              </div>
              <NeuButton variant="primary" onClick={startDebate} loading={loading} icon={FiMessageCircle}>
                Start Debate
              </NeuButton>
            </div>
          </NeuCard>

          {debateResult && (
            <NeuCard className="p-5 bg-white">
              <h2 className="text-xl font-bold mb-3">Debate Response</h2>
              <div className="p-4 border-[3px] border-[var(--ink)] rounded-xl bg-[var(--paper)]">
                <p className="text-sm font-medium whitespace-pre-wrap">
                  {debateResult.response || debateResult.content || JSON.stringify(debateResult, null, 2)}
                </p>
              </div>
            </NeuCard>
          )}
        </StaggerItem>
      )}
    </PageTransition>
  );
}
