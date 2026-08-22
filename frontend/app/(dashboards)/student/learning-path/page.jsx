"use client";

import { useEffect, useState } from 'react';
import NeuCard from '@/components/shared/NeuCard';
import SkillBar from '@/components/shared/SkillBar';
import NeuBadge from '@/components/shared/NeuBadge';
import EvidenceBadge from '@/components/shared/EvidenceBadge';
import { DashboardSkeleton } from '@/components/shared/LoadingSpinner';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import api from '@/lib/api';

export default function LearningPathPage() {
  const [seg, setSeg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [evLoading, setEvLoading] = useState(false);

  useEffect(() => {
    api.get('/student/seg').then(res => {
      setSeg({ nodes: res.data.nodes || [], edges: res.data.edges || [], aggregate: res.data.aggregate });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const fetchEvidence = async (skillId) => {
    setSelectedSkill(skillId);
    setEvLoading(true);
    try {
      const res = await api.get(`/student/seg/${skillId}/evidence`);
      setEvidence(res.data.evidence || res.data || []);
    } catch (e) { setEvidence([]); }
    setEvLoading(false);
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <PageTransition className="space-y-6">
      <StaggerItem>
        <h1 className="text-3xl font-bold mb-1">🗺️ Skill Evidence Graph</h1>
        <p className="text-gray-500 font-medium">Your complete verified skill map</p>
      </StaggerItem>

      <StaggerItem className="grid md:grid-cols-3 gap-4">
        <NeuCard className="p-5 bg-[var(--electric)] text-white text-center">
          <p className="text-sm font-semibold opacity-80 mb-1">Total Skills</p>
          <p className="text-4xl font-bold">{seg?.nodes?.length || 0}</p>
        </NeuCard>
        <NeuCard className="p-5 bg-[var(--mint)] text-center">
          <p className="text-sm font-semibold opacity-80 mb-1">Evidence Entries</p>
          <p className="text-4xl font-bold">{seg?.edges?.length || 0}</p>
        </NeuCard>
        <NeuCard className="p-5 bg-[var(--amber)] text-center">
          <p className="text-sm font-semibold opacity-80 mb-1">Readiness Score</p>
          <p className="text-4xl font-bold">{seg?.aggregate?.totalReadinessScore || 0}%</p>
        </NeuCard>
      </StaggerItem>

      <StaggerItem className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          <h2 className="text-xl font-bold">Skill Nodes</h2>
          {seg?.nodes?.length === 0 && <p className="text-gray-500 font-medium">No skills verified yet. Take an assessment to start building your graph.</p>}
          {seg?.nodes?.map((node, i) => (
            <NeuCard
              key={node.skillId || i}
              className={`p-4 bg-white cursor-pointer ${selectedSkill === node.skillId ? 'ring-2 ring-[var(--electric)]' : ''}`}
              onClick={() => fetchEvidence(node.skillId)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold">{node.skillName}</h3>
                  {node.category && <NeuBadge variant="info" className="mt-1">{node.category}</NeuBadge>}
                </div>
                <span className="font-mono font-bold text-lg">{node.proficiencyScore}%</span>
              </div>
              <SkillBar percentage={node.proficiencyScore} color="var(--electric)" />
              <div className="flex gap-2 mt-2">
                <span className="text-xs font-semibold text-gray-400">Confidence: {node.confidenceLevel || 'N/A'}</span>
                <span className="text-xs font-semibold text-gray-400">Evidence: {node.evidenceCount || 0}</span>
              </div>
            </NeuCard>
          ))}
        </div>

        <div>
          <h2 className="text-xl font-bold mb-3">Evidence Trail</h2>
          <NeuCard className="p-4 bg-white min-h-[300px]">
            {!selectedSkill && <p className="text-gray-400 font-medium text-sm text-center py-8">Click a skill to see its evidence</p>}
            {evLoading && <p className="text-gray-400 font-medium text-sm text-center py-8">Loading...</p>}
            {selectedSkill && !evLoading && evidence.length === 0 && <p className="text-gray-400 font-medium text-sm text-center py-8">No evidence found</p>}
            <div className="space-y-3">
              {evidence.map((ev, i) => (
                <div key={i} className="p-3 border-[3px] border-[var(--ink)] rounded-xl bg-[var(--paper)]">
                  <div className="flex justify-between mb-1">
                    <EvidenceBadge type={ev.evidenceType?.toUpperCase() || 'ASSESSMENT'} />
                    <span className="text-[10px] font-bold text-gray-400">{ev.timestamp ? new Date(ev.timestamp).toLocaleDateString() : ''}</span>
                  </div>
                  <p className="font-bold text-xs">{ev.context || ev.description || 'Evidence entry'}</p>
                  {ev.scoreContributed && <span className="text-xs font-bold text-[var(--electric)]">+{ev.scoreContributed}pts</span>}
                </div>
              ))}
            </div>
          </NeuCard>
        </div>
      </StaggerItem>
    </PageTransition>
  );
}
