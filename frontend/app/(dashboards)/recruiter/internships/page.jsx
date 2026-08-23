"use client";

import { useState } from 'react';
import NeuCard from '@/components/shared/NeuCard';
import NeuButton from '@/components/shared/NeuButton';
import NeuBadge from '@/components/shared/NeuBadge';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import { FiBookOpen, FiPlusCircle, FiClock, FiAward, FiCheckCircle } from 'react-icons/fi';

export default function UnpaidInternshipsPage() {
  const [internships, setInternships] = useState([
    {
      id: 'intern-1',
      title: 'Frontend React & UI/UX Developer Intern',
      track: 'Frontend Web Engineering',
      duration: '3 Months',
      stipend: 'Unpaid (Verified Skill Credits + Certificate)',
      skills: ['React', 'Tailwind CSS', 'Figma', 'JavaScript'],
      applicantsCount: 19,
      status: 'Accepting Applicants',
    },
    {
      id: 'intern-2',
      title: 'AI / LLM Agent Research Intern',
      track: 'Artificial Intelligence & Agents',
      duration: '6 Months',
      stipend: 'Unpaid (Verified Skill Credits + Academic Letter)',
      skills: ['Python', 'LangChain', 'OpenAI / Gemini APIs', 'Prompt Design'],
      applicantsCount: 28,
      status: 'Accepting Applicants',
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [track, setTrack] = useState('Frontend Web Engineering');
  const [duration, setDuration] = useState('3 Months');
  const [skills, setSkills] = useState('React, JavaScript, HTML/CSS');

  const handleCreateInternship = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newIntern = {
      id: `intern-${Date.now()}`,
      title,
      track,
      duration,
      stipend: 'Unpaid (Verified Skill Credits + Certificate)',
      skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      applicantsCount: 0,
      status: 'Accepting Applicants',
    };

    setInternships([newIntern, ...internships]);
    setTitle('');
    setShowCreateModal(false);
    alert('Unpaid Skill Credit Internship Published Successfully!');
  };

  return (
    <PageTransition className="space-y-6">
      <StaggerItem className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-1">
            <FiBookOpen className="text-[var(--mint)]" />
            Unpaid Skill Credit Internships Portal
          </h1>
          <p className="text-gray-600 font-medium">Post unpaid 3–6 month internships for students to gain verified W3C skill badges and real-world project credits</p>
        </div>

        <NeuButton variant="mint" icon={FiPlusCircle} onClick={() => setShowCreateModal(!showCreateModal)}>
          {showCreateModal ? 'Cancel Posting' : 'Post Unpaid Internship'}
        </NeuButton>
      </StaggerItem>

      {/* Create Internship Form */}
      {showCreateModal && (
        <StaggerItem>
          <NeuCard className="p-6 bg-white space-y-4 border-[3px] border-[var(--ink)] shadow-[4px_4px_0px_#000]">
            <h2 className="text-xl font-bold text-gray-900">🎓 Create New Unpaid Internship Opportunity</h2>
            <form onSubmit={handleCreateInternship} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Internship Title</label>
                  <input
                    type="text"
                    required
                    className="neu-input w-full text-sm bg-white"
                    placeholder="e.g. React Frontend Development Intern"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Domain Track</label>
                  <select className="neu-select w-full text-sm" value={track} onChange={e => setTrack(e.target.value)}>
                    <option value="Frontend Web Engineering">Frontend Web Engineering</option>
                    <option value="Backend Node APIs">Backend Node APIs</option>
                    <option value="Artificial Intelligence & Agents">Artificial Intelligence & Agents</option>
                    <option value="Data Engineering & Analytics">Data Engineering & Analytics</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Duration</label>
                  <select className="neu-select w-full text-sm" value={duration} onChange={e => setDuration(e.target.value)}>
                    <option value="3 Months">3 Months</option>
                    <option value="6 Months">6 Months</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Required Prerequisites (Comma-separated)</label>
                  <input
                    type="text"
                    required
                    className="neu-input w-full text-sm bg-white"
                    placeholder="e.g. React, JavaScript, Git"
                    value={skills}
                    onChange={e => setSkills(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-3 bg-[var(--paper)] border-2 border-[var(--ink)] rounded-xl text-xs font-bold text-gray-700">
                💡 Note: All internships in this portal are strictly Unpaid. Students receive verified W3C skill badges, SEG points, and institutional academic credits upon completion.
              </div>

              <div className="flex justify-end pt-2">
                <NeuButton variant="primary" type="submit" icon={FiPlusCircle}>
                  Publish Unpaid Internship
                </NeuButton>
              </div>
            </form>
          </NeuCard>
        </StaggerItem>
      )}

      {/* Active Internship Postings */}
      <StaggerItem className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Active Unpaid Internships ({internships.length})</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {internships.map((item) => (
            <NeuCard key={item.id} className="p-6 bg-white space-y-4 border-[3px] border-[var(--ink)] shadow-[4px_4px_0px_#000]">
              <div className="flex justify-between items-start">
                <div>
                  <NeuBadge variant="mint" className="mb-1">{item.track}</NeuBadge>
                  <h3 className="font-bold text-lg text-gray-900 mt-1">{item.title}</h3>
                </div>
                <NeuBadge variant="warning">{item.duration}</NeuBadge>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs font-bold text-amber-900 flex justify-between items-center">
                <span>Stipend Status:</span>
                <span>{item.stipend}</span>
              </div>

              <div>
                <span className="text-xs font-bold text-gray-600 block mb-1">Target Prerequisite Competencies:</span>
                <div className="flex flex-wrap gap-2">
                  {item.skills.map((sk, idx) => (
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
