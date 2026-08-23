"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import NeuCard from '@/components/shared/NeuCard';
import NeuButton from '@/components/shared/NeuButton';
import NeuBadge from '@/components/shared/NeuBadge';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import { FiActivity, FiCpu, FiSliders, FiUser, FiArrowRight, FiArrowLeft, FiCheckCircle, FiBriefcase, FiBookOpen } from 'react-icons/fi';

export default function PipelinePage() {
  const [pipelineType, setPipelineType] = useState('placement'); // 'placement' | 'internship'

  // AI Shortlisting Engine Controls
  const [autoShortlistEnabled, setAutoShortlistEnabled] = useState(true);
  const [cutoffScore, setCutoffScore] = useState(80);
  const [aiTemperature, setAiTemperature] = useState(0.3);
  const [shortlistingLoading, setShortlistingLoading] = useState(false);

  // Placements Candidates Kanban
  const [placementBoard, setPlacementBoard] = useState({
    applied: [
      { id: 'p1', name: 'Arjun Sharma', branch: 'CSE', cgpa: 8.8, score: 92, skills: ['React', 'Node.js', 'DSA'] },
      { id: 'p2', name: 'Rohit Verma', branch: 'IT', cgpa: 8.2, score: 76, skills: ['Java', 'Spring Boot'] },
      { id: 'p3', name: 'Sneha Patel', branch: 'CSE', cgpa: 8.5, score: 84, skills: ['React', 'MongoDB'] },
    ],
    ai_shortlisted: [
      { id: 'p4', name: 'Priya Nair', branch: 'ECE', cgpa: 9.1, score: 89, skills: ['Python', 'PyTorch', 'ML'] },
      { id: 'p5', name: 'Karan Mehta', branch: 'CSE', cgpa: 8.7, score: 88, skills: ['React', 'TypeScript', 'Node'] },
    ],
    interview: [
      { id: 'p6', name: 'Ananya Deshmukh', branch: 'CSE', cgpa: 9.3, score: 95, skills: ['Fullstack', 'System Design'] },
    ],
    offered: [],
    hired: [],
  });

  // Unpaid Internships Candidates Kanban
  const [internshipBoard, setInternshipBoard] = useState({
    applied: [
      { id: 'i1', name: 'Vikram Rao', branch: 'CSE', year: 3, cgpa: 8.1, score: 82, skills: ['React', 'HTML/CSS'] },
      { id: 'i2', name: 'Divya Iyer', branch: 'IT', year: 3, cgpa: 7.9, score: 72, skills: ['Figma', 'UI/UX'] },
    ],
    ai_shortlisted: [
      { id: 'i3', name: 'Rahul Sen', branch: 'ECE', year: 3, cgpa: 8.6, score: 85, skills: ['Python', 'OpenAI APIs'] },
    ],
    interview: [],
    offered: [],
    hired: [],
  });

  const columns = [
    { id: 'applied', label: 'Applied', color: 'border-blue-400 bg-blue-50/50' },
    { id: 'ai_shortlisted', label: 'AI Shortlisted', color: 'border-amber-400 bg-amber-50/50' },
    { id: 'interview', label: 'Technical Interview', color: 'border-purple-400 bg-purple-50/50' },
    { id: 'offered', label: 'Offer Extended', color: 'border-teal-400 bg-teal-50/50' },
    { id: 'hired', label: 'Hired / Accepted', color: 'border-emerald-500 bg-emerald-50/50' },
  ];

  const currentBoard = pipelineType === 'placement' ? placementBoard : internshipBoard;
  const setCurrentBoard = pipelineType === 'placement' ? setPlacementBoard : setInternshipBoard;

  // Move candidate between stages
  const moveCandidate = (candidateId, fromCol, toCol) => {
    const updated = { ...currentBoard };
    const candIndex = updated[fromCol].findIndex(c => c.id === candidateId);
    if (candIndex !== -1) {
      const [movedCand] = updated[fromCol].splice(candIndex, 1);
      updated[toCol].push(movedCand);
      setCurrentBoard({ ...updated });
    }
  };

  // Run AI Agent Auto-Shortlist
  const handleRunAiAutoShortlist = () => {
    setShortlistingLoading(true);
    setTimeout(() => {
      const updated = { ...currentBoard };
      const remainingApplied = [];
      
      updated.applied.forEach(cand => {
        if (cand.score >= cutoffScore) {
          updated.ai_shortlisted.push(cand);
        } else {
          remainingApplied.push(cand);
        }
      });

      updated.applied = remainingApplied;
      setCurrentBoard({ ...updated });
      setShortlistingLoading(false);
      alert(`AI Agent evaluated candidates with threshold >= ${cutoffScore}% and Temp ${aiTemperature}. Auto-shortlisted matching candidates!`);
    }, 600);
  };

  return (
    <PageTransition className="space-y-6">
      {/* Header & Pipeline Switcher */}
      <StaggerItem className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-1">
            <FiActivity className="text-[var(--hotpink)]" />
            Interactive Kanban Hiring Pipeline
          </h1>
          <p className="text-gray-600 font-medium">Dual hiring pipelines for Full-Time Placements & Unpaid Skill Credit Internships</p>
        </div>

        <div className="flex gap-2 bg-white p-1.5 border-[3px] border-[var(--ink)] rounded-2xl shadow-[3px_3px_0px_#000]">
          <NeuButton
            variant={pipelineType === 'placement' ? 'hotpink' : 'ghost'}
            size="sm"
            onClick={() => setPipelineType('placement')}
            icon={FiBriefcase}
          >
            Full-time Placements
          </NeuButton>
          <NeuButton
            variant={pipelineType === 'internship' ? 'mint' : 'ghost'}
            size="sm"
            onClick={() => setPipelineType('internship')}
            icon={FiBookOpen}
          >
            Unpaid Internships
          </NeuButton>
        </div>
      </StaggerItem>

      {/* AI Shortlisting Engine Control Panel */}
      <StaggerItem>
        <NeuCard className="p-5 bg-white space-y-4 border-[3px] border-[var(--ink)] shadow-[4px_4px_0px_#000]">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FiCpu className="text-[var(--electric)]" /> AI Agent Auto-Shortlisting Control Engine
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold">Automation Mode:</span>
              <button
                onClick={() => setAutoShortlistEnabled(!autoShortlistEnabled)}
                className={`px-3 py-1 text-xs font-bold rounded-full border-2 border-[var(--ink)] cursor-pointer ${
                  autoShortlistEnabled ? 'bg-emerald-400 text-black' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {autoShortlistEnabled ? 'ON ✅' : 'OFF ❌'}
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-center text-sm">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Threshold Cutoff Match Score ({cutoffScore}%)
              </label>
              <input
                type="range"
                min="60"
                max="95"
                value={cutoffScore}
                onChange={e => setCutoffScore(Number(e.target.value))}
                className="w-full cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                AI Agent Temperature ({aiTemperature})
              </label>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.1"
                value={aiTemperature}
                onChange={e => setAiTemperature(Number(e.target.value))}
                className="w-full cursor-pointer"
              />
              <span className="text-[10px] text-gray-400 block mt-0.5">0.0 = Strict Skill Match | 1.0 = Creative Domain Match</span>
            </div>

            <div className="flex items-end">
              <NeuButton
                variant="electric"
                className="w-full py-2.5"
                onClick={handleRunAiAutoShortlist}
                loading={shortlistingLoading}
                icon={FiCpu}
              >
                Run Agent Auto-Shortlist
              </NeuButton>
            </div>
          </div>
        </NeuCard>
      </StaggerItem>

      {/* Kanban Board Columns */}
      <StaggerItem>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {columns.map((col, cIdx) => {
            const candidateList = currentBoard[col.id] || [];
            return (
              <div key={col.id} className={`p-4 rounded-2xl border-[3px] border-[var(--ink)] ${col.color} space-y-3 min-h-[480px]`}>
                <div className="flex justify-between items-center pb-2 border-b-2 border-[var(--ink)]">
                  <h3 className="font-bold text-sm text-gray-900">{col.label}</h3>
                  <NeuBadge variant="primary">{candidateList.length}</NeuBadge>
                </div>

                <div className="space-y-3">
                  {candidateList.length === 0 ? (
                    <p className="text-xs text-gray-400 font-medium text-center py-8">No candidates</p>
                  ) : (
                    candidateList.map((cand) => (
                      <motion.div key={cand.id} whileHover={{ scale: 1.02 }}>
                        <NeuCard className="p-4 bg-white space-y-2 border-[2px] border-[var(--ink)] shadow-[3px_3px_0px_#000]">
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-sm text-gray-900">{cand.name}</span>
                            <NeuBadge variant={cand.score >= 85 ? 'success' : 'info'}>{cand.score}% Match</NeuBadge>
                          </div>

                          <p className="text-xs text-gray-500 font-medium">
                            {cand.branch} · CGPA: {cand.cgpa}
                          </p>

                          <div className="flex flex-wrap gap-1 pt-1">
                            {cand.skills.map((sk, sIdx) => (
                              <span key={sIdx} className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 border border-gray-300">
                                {sk}
                              </span>
                            ))}
                          </div>

                          {/* Move Left / Right Controls */}
                          <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-xs">
                            {cIdx > 0 ? (
                              <button
                                onClick={() => moveCandidate(cand.id, col.id, columns[cIdx - 1].id)}
                                className="font-bold text-gray-600 hover:text-black flex items-center gap-0.5 cursor-pointer"
                              >
                                <FiArrowLeft /> Back
                              </button>
                            ) : <span />}

                            {cIdx < columns.length - 1 ? (
                              <button
                                onClick={() => moveCandidate(cand.id, col.id, columns[cIdx + 1].id)}
                                className="font-bold text-[var(--electric)] hover:underline flex items-center gap-0.5 cursor-pointer"
                              >
                                Next <FiArrowRight />
                              </button>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                                <FiCheckCircle /> Hired
                              </span>
                            )}
                          </div>
                        </NeuCard>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </StaggerItem>
    </PageTransition>
  );
}
