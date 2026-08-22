"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaFilter, FaUserCheck, FaBriefcase, FaMagic } from 'react-icons/fa';
import NeuCard from '@/components/shared/NeuCard';
import NeuButton from '@/components/shared/NeuButton';
import useAuthStore from '@/lib/store/authStore';

import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';

export default function RecruiterDashboard() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [blindMode, setBlindMode] = useState(true);

  return (
    <PageTransition className="space-y-8">
      <StaggerItem className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Talent Exchange</h1>
          <p className="text-gray-600 text-lg">Search the verified Skill Evidence Graph for exact matches.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <label className="flex items-center gap-2 cursor-pointer font-bold text-sm bg-white p-2 rounded-xl border-[3px] border-[var(--ink)] shadow-[4px_4px_0px_var(--ink)]">
            <input 
              type="checkbox" 
              checked={blindMode} 
              onChange={(e) => setBlindMode(e.target.checked)} 
              className="w-4 h-4 accent-[var(--electric)]"
            />
            Bias-Free Mode (Hide PII)
          </label>
          <NeuButton variant="hotpink">Generate Problem Statement</NeuButton>
        </div>
      </StaggerItem>

      {/* Search Bar */}
      <StaggerItem>
        <NeuCard className="p-4 bg-[var(--electric)] flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <FaSearch />
            </div>
            <input 
              type="text" 
              className="neu-input pl-11 py-4 text-lg w-full" 
              placeholder="Describe the candidate you need (e.g., 'React developer with system design skills')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="neu-card bg-[var(--acid)] py-4 px-8 text-lg flex items-center justify-center gap-2 font-bold whitespace-nowrap"
          >
            <FaMagic /> AI Search
          </motion.button>
        </NeuCard>
      </StaggerItem>

      <StaggerItem className="grid md:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="space-y-6">
          <NeuCard className="p-6 bg-white">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 border-b-[4px] border-[var(--ink)] pb-2"><FaFilter /> Filters</h3>
            
            <div className="space-y-4">
              <div>
                <label className="font-bold text-sm block mb-2">Target Role</label>
                <select className="neu-select w-full">
                  <option>Software Engineer</option>
                  <option>Data Scientist</option>
                  <option>Product Manager</option>
                  <option>UI/UX Designer</option>
                </select>
              </div>
              
              <div>
                <label className="font-bold text-sm block mb-2">Minimum Readiness</label>
                <input type="range" className="w-full accent-[var(--electric)]" min="0" max="100" defaultValue="75" />
                <div className="flex justify-between text-xs font-mono font-bold mt-1">
                  <span>0%</span><span>75%</span><span>100%</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-sm block mb-2">Required Skills</label>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-bold bg-[var(--acid)] border-[3px] border-[var(--ink)] px-2 py-1 rounded-full">React</span>
                  <span className="text-xs font-bold bg-[var(--mint)] border-[3px] border-[var(--ink)] px-2 py-1 rounded-full">Node.js</span>
                  <span className="text-xs font-bold bg-[var(--sky)] border-[3px] border-[var(--ink)] px-2 py-1 rounded-full">MongoDB</span>
                </div>
              </div>
            </div>
          </NeuCard>
        </div>

        {/* Results */}
        <div className="md:col-span-3 space-y-4">
          <div className="flex justify-between items-center bg-[#f8f7f4] p-4 rounded-xl border-[4px] border-[var(--ink)] shadow-[6px_6px_0px_var(--ink)]">
            <span className="font-bold">3 Top Matches Found</span>
            <select className="neu-select py-1 px-3 w-auto text-sm border-[3px] border-[var(--ink)]">
              <option>Sort by: Match %</option>
              <option>Sort by: Readiness</option>
            </select>
          </div>

          {/* Result Cards */}
          {[
            { match: 96, readiness: 92, skills: ['React', 'Next.js', 'System Design'] },
            { match: 89, readiness: 88, skills: ['React', 'Node.js', 'Algorithms'] },
            { match: 85, readiness: 81, skills: ['React', 'Tailwind', 'Figma'] }
          ].map((candidate, i) => (
            <motion.div whileHover={{ scale: 1.01, x: 4 }} key={i}>
              <NeuCard className="p-6 bg-white hover:border-[var(--electric)] transition-colors cursor-pointer">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-xl">
                        {blindMode ? `Candidate ID: #${Math.floor(1000 + Math.random() * 9000)}` : `Student Name ${i+1}`}
                      </h3>
                      {candidate.match > 90 && (
                        <span className="bg-[var(--electric)] text-white text-xs px-2 py-1 rounded-full font-bold">Top Match</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-4 font-mono">B.Tech Computer Science • Class of 2026</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {candidate.skills.map(s => (
                        <span key={s} className="bg-[var(--paper)] border-[2px] border-[var(--ink)] px-2 py-1 rounded-md text-xs font-bold">{s}</span>
                      ))}
                      <span className="bg-gray-100 border-[2px] border-[var(--ink)] text-gray-700 px-2 py-1 rounded-md text-xs font-bold">+12 more</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end justify-between min-w-[120px]">
                    <div className="text-right mb-4">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Semantic Match</p>
                      <p className="text-4xl font-bold text-[var(--electric)]">{candidate.match}%</p>
                    </div>
                    <NeuButton variant="ghost" size="sm" className="w-full">View SEG</NeuButton>
                  </div>
                </div>
              </NeuCard>
            </motion.div>
          ))}
        </div>
      </StaggerItem>
    </PageTransition>
  );
}
