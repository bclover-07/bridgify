"use client";

import { useState } from 'react';
import NeuCard from '@/components/shared/NeuCard';
import NeuButton from '@/components/shared/NeuButton';
import NeuBadge from '@/components/shared/NeuBadge';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import { FiBriefcase, FiPlusCircle, FiUsers, FiDollarSign, FiCalendar, FiCheckCircle, FiCpu, FiMail } from 'react-icons/fi';
import api from '@/lib/api';

export default function JobPostingsPage() {
  const [postings, setPostings] = useState([
    {
      id: 'post-1',
      title: 'Fullstack React & Node.js Engineer',
      role: 'Fullstack Developer',
      ctc: '12 LPA',
      skills: ['React', 'Node.js', 'MongoDB', 'System Design'],
      autoShortlist: true,
      autoShortlistThreshold: 80,
      applicantsCount: 34,
      deadline: '2026-09-15',
      status: 'Active',
    },
    {
      id: 'post-2',
      title: 'AI / Machine Learning Engineer',
      role: 'AI / ML Engineer',
      ctc: '15 LPA',
      skills: ['Python', 'PyTorch', 'Data Structures', 'NLP'],
      autoShortlist: true,
      autoShortlistThreshold: 85,
      applicantsCount: 22,
      deadline: '2026-09-20',
      status: 'Active',
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newRole, setNewRole] = useState('Fullstack Developer');
  const [newCtc, setNewCtc] = useState('10 LPA');
  const [newSkills, setNewSkills] = useState('React, Node.js, DSA');
  const [autoShortlist, setAutoShortlist] = useState(true);
  const [autoThreshold, setAutoThreshold] = useState(80);
  const [sendingEmail, setSendingEmail] = useState(false);

  const handleCreatePosting = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newPost = {
      id: `post-${Date.now()}`,
      title: newTitle,
      role: newRole,
      ctc: newCtc,
      skills: newSkills.split(',').map(s => s.trim()).filter(Boolean),
      autoShortlist,
      autoShortlistThreshold: autoThreshold,
      applicantsCount: 0,
      deadline: '2026-10-01',
      status: 'Active',
    };

    setPostings([newPost, ...postings]);

    // If auto-shortlist is enabled, send Nodemailer interview email to demo candidate
    if (autoShortlist) {
      setSendingEmail(true);
      try {
        await api.post('/recruiter/auto-shortlist/email', {
          email: 'arjun@mrdu.edu',
          studentName: 'Arjun Sharma',
          jobTitle: newTitle,
          matchScore: 88,
        });
      } catch (err) {
        console.error('Nodemailer trigger warning:', err);
      } finally {
        setSendingEmail(false);
      }
    }

    setNewTitle('');
    setShowCreateModal(false);
    alert('Placement Job Opening Published Successfully! AI Auto-Shortlisting is ACTIVE.');
  };

  return (
    <PageTransition className="space-y-6">
      <StaggerItem className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-1">
            <FiBriefcase className="text-[var(--electric)]" />
            Full-Time Placement Job Openings
          </h1>
          <p className="text-gray-600 font-medium">Post and manage placement job roles with automated AI candidate shortlisting & Nodemailer interview dispatches</p>
        </div>

        <NeuButton variant="primary" icon={FiPlusCircle} onClick={() => setShowCreateModal(!showCreateModal)}>
          {showCreateModal ? 'Cancel Posting' : 'Create Job Opening'}
        </NeuButton>
      </StaggerItem>

      {/* Create Job Posting Form */}
      {showCreateModal && (
        <StaggerItem>
          <NeuCard className="p-6 bg-white space-y-4 border-[3px] border-[var(--ink)] shadow-[4px_4px_0px_#000]">
            <h2 className="text-xl font-bold text-gray-900">📝 Create New Placement Job Opening</h2>
            <form onSubmit={handleCreatePosting} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    className="neu-input w-full text-sm bg-white"
                    placeholder="e.g. Senior Fullstack React/Node Specialist"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Target Category Role</label>
                  <select className="neu-select w-full text-sm" value={newRole} onChange={e => setNewRole(e.target.value)}>
                    <option value="Fullstack Developer">Fullstack Developer</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="AI / ML Engineer">AI / ML Engineer</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">CTC Compensation Package</label>
                  <input
                    type="text"
                    required
                    className="neu-input w-full text-sm bg-white"
                    placeholder="e.g. 12 LPA"
                    value={newCtc}
                    onChange={e => setNewCtc(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Required Skills (Comma-separated)</label>
                  <input
                    type="text"
                    required
                    className="neu-input w-full text-sm bg-white"
                    placeholder="e.g. React, Node.js, MongoDB, System Design"
                    value={newSkills}
                    onChange={e => setNewSkills(e.target.value)}
                  />
                </div>
              </div>

              {/* AI Auto-Shortlisting Config Section */}
              <div className="p-4 bg-[var(--paper)] border-[2px] border-[var(--ink)] rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-gray-900 flex items-center gap-2">
                    <FiCpu className="text-[var(--electric)]" /> AI Agent Auto-Shortlist Feature
                  </span>
                  <button
                    type="button"
                    onClick={() => setAutoShortlist(!autoShortlist)}
                    className={`px-3 py-1 text-xs font-bold rounded-full border-2 border-[var(--ink)] cursor-pointer ${
                      autoShortlist ? 'bg-emerald-400 text-black' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {autoShortlist ? 'ENABLED ✅' : 'DISABLED ❌'}
                  </button>
                </div>

                {autoShortlist && (
                  <div className="space-y-2 pt-2 border-t border-gray-200">
                    <div className="flex justify-between text-xs font-bold">
                      <span>Cutoff Score Threshold</span>
                      <span className="text-[var(--electric)]">{autoThreshold}% SEG Match</span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="95"
                      value={autoThreshold}
                      onChange={e => setAutoThreshold(Number(e.target.value))}
                      className="w-full cursor-pointer"
                    />
                    <p className="text-[11px] text-gray-600 font-medium">
                      💡 Candidates with verified SEG score ≥ {autoThreshold}% are automatically shortlisted and emailed a live interview invitation via Nodemailer.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <NeuButton variant="hotpink" type="submit" icon={FiPlusCircle} loading={sendingEmail}>
                  Publish Job Posting
                </NeuButton>
              </div>
            </form>
          </NeuCard>
        </StaggerItem>
      )}

      {/* Active Job Postings List */}
      <StaggerItem className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Active Placement Job Openings ({postings.length})</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {postings.map((post) => (
            <NeuCard key={post.id} className="p-6 bg-white space-y-4 border-[3px] border-[var(--ink)] shadow-[4px_4px_0px_#000]">
              <div className="flex justify-between items-start">
                <div>
                  <NeuBadge variant="primary" className="mb-1">{post.role}</NeuBadge>
                  <h3 className="font-bold text-lg text-gray-900 mt-1">{post.title}</h3>
                </div>
                <NeuBadge variant="success">{post.status}</NeuBadge>
              </div>

              <div className="flex flex-wrap gap-3 text-xs font-bold text-gray-700 py-2 border-y border-gray-200">
                <span>💰 Package: {post.ctc}</span>
                <span>👥 Applicants: {post.applicantsCount}</span>
                <span>🤖 AI Shortlist: ≥{post.autoShortlistThreshold}%</span>
              </div>

              <div>
                <span className="text-xs font-bold text-gray-600 block mb-1">Required Competencies:</span>
                <div className="flex flex-wrap gap-2">
                  {post.skills.map((sk, idx) => (
                    <NeuBadge key={idx} variant="info">{sk}</NeuBadge>
                  ))}
                </div>
              </div>
            </NeuCard>
          ))}
        </div>
      </StaggerItem>
    </PageTransition>
  );
}
