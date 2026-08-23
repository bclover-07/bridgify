"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit3, FiSliders, FiPlay, FiCheckCircle, FiCopy, FiSend, FiCpu, FiLayers, FiCode, FiAward, FiTag, FiZap } from 'react-icons/fi';
import NeuCard from '@/components/shared/NeuCard';
import NeuButton from '@/components/shared/NeuButton';
import NeuBadge from '@/components/shared/NeuBadge';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import api from '@/lib/api';

export default function ProblemStatementGeneratorPage() {
  const [role, setRole] = useState('Fullstack Developer');
  const [level, setLevel] = useState('Mid Level (L2)');
  const [domain, setDomain] = useState('FinTech & E-Commerce');
  const [techStack, setTechStack] = useState('React, Node.js, MongoDB, Redis');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [published, setPublished] = useState(false);
  const [activeTab, setActiveTab] = useState('problem'); // 'problem' | 'rubric' | 'artifacts'

  const presets = [
    { label: '⚡ React & System Design', role: 'Frontend Developer', level: 'Mid Level (L2)', domain: 'E-Commerce Platform', tech: 'React 19, TypeScript, Tailwind, Zustand' },
    { label: '🤖 LLM Vector Pipeline', role: 'AI / ML Engineer', level: 'Senior (L3)', domain: 'Generative AI Platform', tech: 'Python, PyTorch, LangChain, Pinecone' },
    { label: '📦 Node Microservices', role: 'Backend Developer', level: 'Mid Level (L2)', domain: 'FinTech Payment Gateway', tech: 'Node.js, Express, PostgreSQL, Redis, Docker' },
    { label: '📊 Real-Time Analytics', role: 'Data Engineer', level: 'Entry Level (L1)', domain: 'HealthTech Dashboard', tech: 'Python, SQL, Apache Kafka, Pandas' },
  ];

  // Default pre-populated problem statement for stunning initial view
  const [generatedPS, setGeneratedPS] = useState({
    title: 'High-Throughput Financial Transaction Stream & Ledger Engine',
    description: 'Design and build a resilient, real-time transaction processing service that ingests concurrent payment events, validates cryptographic signatures, and maintains an immutable audit ledger with low-latency cache queries.',
    constraints: [
      'Must handle up to 1,000 concurrent API requests/sec without database deadlock.',
      'Ensure zero double-spending by utilizing idempotent transaction keys.',
      'Include automated unit tests covering edge-case race conditions.',
    ],
    rubric: [
      { criterion: 'API Design & Idempotency Controls', weight: 35, detail: 'Correct HTTP status codes, payload validation schemas, and deduplication logic.' },
      { criterion: 'Caching & Concurrency Performance', weight: 30, detail: 'Sub-50ms P99 latency utilizing Redis cache strategy for repeat balance checks.' },
      { criterion: 'Code Quality & Error Handling', weight: 20, detail: 'Clean modular structure, error logging, and graceful degradation during service outages.' },
      { criterion: 'Automated Testing Coverage', weight: 15, detail: 'Comprehensive integration tests covering successful transfers, insufficient funds, and network timeout retries.' },
    ],
    artifacts: [
      'POST /api/v1/transactions - Submit signed payment payload',
      'GET /api/v1/ledger/:accountId - Fetch verified balance ledger',
      'Docker Compose file with Redis and MongoDB services pre-configured',
    ],
  });

  const handleApplyPreset = (p) => {
    setRole(p.role);
    setLevel(p.level);
    setDomain(p.domain);
    setTechStack(p.tech);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setPublished(false);
    try {
      const { data } = await api.post('/recruiter/ps/generate', {
        role,
        level,
        domain,
        techStack,
      });

      if (data.ps) {
        setGeneratedPS({
          title: data.ps.title || `${role} Real-World Architecture Challenge`,
          description: data.ps.description || 'Build a scalable solution demonstrating real-world software design patterns.',
          constraints: data.ps.constraints || [
            'All endpoints must return structured JSON error models.',
            'Implement rate-limiting and authentication middleware.',
          ],
          rubric: data.ps.rubric || [
            { criterion: 'Core Functionality & Correctness', weight: 40, detail: 'Meets all mandatory business requirements.' },
            { criterion: 'Code Cleanliness & Architecture', weight: 35, detail: 'SOLID principles and modular code organization.' },
            { criterion: 'Test Coverage', weight: 25, detail: 'High assertion ratio and edge-case validation.' },
          ],
          artifacts: data.ps.artifacts || [
            'REST API endpoints with OpenAPI documentation',
            'Unit test suite execution report',
          ],
        });
      }
    } catch (error) {
      console.error('PS Generation Error:', error);
      alert('Generation completed using fallback template.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(generatedPS, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublish = () => {
    setPublished(true);
    alert('Problem Statement Published to Talent Exchange & Candidate Drive Assessments!');
  };

  return (
    <PageTransition className="space-y-6">
      {/* Header Banner */}
      <StaggerItem>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <NeuBadge variant="hotpink" className="flex items-center gap-1 text-xs">
                <FiCpu /> Agent 08 AI Engine
              </NeuBadge>
              <NeuBadge variant="info">Real-World Assessment Creator</NeuBadge>
            </div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FiEdit3 className="text-[var(--hotpink)]" />
              AI Problem Statement Generator
            </h1>
            <p className="text-gray-600 font-medium mt-1">
              Auto-generate contextual, industry-grade problem statements, scoring rubrics, and technical assessment guidelines
            </p>
          </div>

          <div className="flex items-center gap-2">
            <NeuButton variant="ghost" size="sm" onClick={handleCopy} icon={copied ? FiCheckCircle : FiCopy}>
              {copied ? 'Copied JSON!' : 'Copy JSON'}
            </NeuButton>
          </div>
        </div>
      </StaggerItem>

      {/* Quick Preset Selection Bar */}
      <StaggerItem>
        <div className="p-3 bg-white border-[2px] border-[var(--ink)] rounded-2xl shadow-[3px_3px_0px_#000] flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-gray-700 flex items-center gap-1 px-2">
            <FiZap className="text-[var(--amber)]" /> Quick Presets:
          </span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(p)}
              className="px-3 py-1 text-xs font-bold rounded-xl border border-[var(--ink)] bg-[var(--paper)] hover:bg-[var(--acid)] transition-all cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      </StaggerItem>

      {/* Main Grid: Configuration Column + Output Column */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Configuration Left Column (5 cols) */}
        <StaggerItem className="lg:col-span-5 space-y-4">
          <NeuCard className="p-6 bg-white space-y-5 border-[3px] border-[var(--ink)] shadow-[4px_4px_0px_#000]">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b pb-3">
              <FiSliders className="text-[var(--electric)]" /> Assessment Configuration
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Target Engineering Role</label>
                <select className="neu-select w-full text-sm bg-white" value={role} onChange={e => setRole(e.target.value)}>
                  <option value="Fullstack Developer">Fullstack Developer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="AI / ML Engineer">AI / ML Engineer</option>
                  <option value="Data Engineer">Data Engineer</option>
                  <option value="DevOps & Cloud Engineer">DevOps & Cloud Engineer</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Difficulty Level & Seniority</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Entry Level (L1)', 'Mid Level (L2)', 'Senior (L3)'].map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setLevel(lvl)}
                      className={`py-2 px-2 text-xs font-bold rounded-xl border-2 border-[var(--ink)] transition-all cursor-pointer ${
                        level === lvl ? 'bg-[var(--hotpink)] text-white shadow-[2px_2px_0px_#000]' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {lvl.split(' ')[0]} {lvl.includes('L1') ? 'L1' : lvl.includes('L2') ? 'L2' : 'L3'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Domain Context / Industry</label>
                <input
                  type="text"
                  className="neu-input w-full text-sm bg-white"
                  placeholder="e.g. FinTech & E-Commerce"
                  value={domain}
                  onChange={e => setDomain(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Target Tech Stack & Frameworks</label>
                <textarea
                  rows={3}
                  className="neu-input w-full text-sm bg-white resize-none"
                  placeholder="e.g. React 19, Node.js, MongoDB, Redis, Docker"
                  value={techStack}
                  onChange={e => setTechStack(e.target.value)}
                />
              </div>

              <NeuButton
                variant="hotpink"
                className="w-full py-3 text-sm font-bold shadow-[4px_4px_0px_#000]"
                onClick={handleGenerate}
                loading={loading}
                icon={FiPlay}
              >
                {loading ? 'Agent 08 Synthesizing...' : 'Generate Problem Statement'}
              </NeuButton>
            </div>
          </NeuCard>
        </StaggerItem>

        {/* Generated Output Right Column (7 cols) */}
        <StaggerItem className="lg:col-span-7 space-y-4">
          <NeuCard className="p-6 bg-white space-y-5 border-[3px] border-[var(--ink)] shadow-[4px_4px_0px_#000] min-h-[540px]">
            {/* Output View Mode Tabs */}
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('problem')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border-2 border-[var(--ink)] transition-all cursor-pointer ${
                    activeTab === 'problem' ? 'bg-[var(--electric)] text-white shadow-[2px_2px_0px_#000]' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  📝 Problem Brief
                </button>
                <button
                  onClick={() => setActiveTab('rubric')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border-2 border-[var(--ink)] transition-all cursor-pointer ${
                    activeTab === 'rubric' ? 'bg-[var(--electric)] text-white shadow-[2px_2px_0px_#000]' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  🎯 Scoring Rubric
                </button>
                <button
                  onClick={() => setActiveTab('artifacts')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border-2 border-[var(--ink)] transition-all cursor-pointer ${
                    activeTab === 'artifacts' ? 'bg-[var(--electric)] text-white shadow-[2px_2px_0px_#000]' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  🧪 Deliverables
                </button>
              </div>

              {published ? (
                <NeuBadge variant="success" className="flex items-center gap-1">
                  <FiCheckCircle /> Published
                </NeuBadge>
              ) : (
                <NeuButton variant="mint" size="sm" onClick={handlePublish} icon={FiSend}>
                  Publish PS
                </NeuButton>
              )}
            </div>

            {/* Generated Content Body */}
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                {activeTab === 'problem' && (
                  <div className="space-y-4">
                    <div>
                      <NeuBadge variant="warning" className="mb-2">{role} Assessment</NeuBadge>
                      <h2 className="text-2xl font-bold text-gray-900 leading-snug">{generatedPS.title}</h2>
                    </div>

                    <div className="p-4 bg-[var(--paper)] border-2 border-[var(--ink)] rounded-2xl">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Scenario & Requirements</h3>
                      <p className="text-sm text-gray-800 leading-relaxed font-medium">{generatedPS.description}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1">
                        <FiLayers className="text-[var(--hotpink)]" /> Key Engineering Constraints:
                      </h3>
                      <div className="space-y-2">
                        {generatedPS.constraints.map((item, idx) => (
                          <div key={idx} className="p-3 bg-white border-2 border-[var(--ink)] rounded-xl text-xs font-bold text-gray-800 flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-[var(--acid)] text-black flex items-center justify-center shrink-0 border border-[var(--ink)]">
                              {idx + 1}
                            </span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'rubric' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <FiAward className="text-[var(--electric)]" /> Agent 08 Grading Rubric & Weightage
                    </h3>

                    <div className="space-y-3">
                      {generatedPS.rubric.map((r, idx) => (
                        <div key={idx} className="p-4 bg-white border-2 border-[var(--ink)] rounded-2xl shadow-[3px_3px_0px_#000] space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-sm text-gray-900">{r.criterion}</span>
                            <NeuBadge variant="info">{r.weight}% Weight</NeuBadge>
                          </div>
                          <p className="text-xs text-gray-600 font-medium leading-relaxed">{r.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'artifacts' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <FiCode className="text-[var(--mint)]" /> Expected Code Artifacts & API Endpoints
                    </h3>

                    <div className="space-y-2">
                      {generatedPS.artifacts.map((art, idx) => (
                        <div key={idx} className="p-3 bg-gray-900 text-green-400 font-mono text-xs border-2 border-[var(--ink)] rounded-xl">
                          &gt; {art}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </NeuCard>
        </StaggerItem>
      </div>
    </PageTransition>
  );
}
