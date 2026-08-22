"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiUser } from 'react-icons/fi';
import NeuCard from '@/components/shared/NeuCard';
import NeuButton from '@/components/shared/NeuButton';
import EvidenceBadge from '@/components/shared/EvidenceBadge';
import SkillBar from '@/components/shared/SkillBar';
import api from '@/lib/api';

export default function SemanticSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post('/recruiter/search/semantic', { query });
      setResults(data.matches || []);
    } catch (error) {
      console.error("Semantic search failed:", error);
      alert("Search failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
          <FiSearch className="text-[var(--hotpink)]" />
          Semantic Candidate Search
        </h1>
        <p className="text-gray-600">Search for candidates using natural language. Powered by Vector DB.</p>
      </div>

      <NeuCard className="bg-white">
        <div className="flex gap-4">
          <input 
            type="text" 
            className="neu-input flex-1" 
            placeholder="e.g., 'Looking for a frontend developer who knows React and has good system design skills'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <NeuButton variant="hotpink" className="shrink-0" onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : <><FiSearch /> Search</>}
          </NeuButton>
          <NeuButton variant="ghost" className="shrink-0 border-2 border-[var(--ink)]">
            <FiFilter /> Filters
          </NeuButton>
        </div>
      </NeuCard>

      <div className="grid gap-6">
        {!loading && results.length === 0 && (
           <div className="text-center py-12 text-gray-500 font-bold bg-white border-2 border-[var(--ink)] rounded-xl">
             No candidates found. Try adjusting your query.
           </div>
        )}
        
        {results.map((match, i) => {
          const student = match.studentId;
          if (!student) return null;

          return (
            <motion.div key={student._id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <NeuCard className="bg-white p-0 flex flex-col md:flex-row overflow-hidden">
                 <div className="p-6 border-b-[3px] md:border-b-0 md:border-r-[3px] border-[var(--ink)] bg-[var(--paper)] flex flex-col items-center justify-center min-w-[200px]">
                   <div className="w-20 h-20 rounded-full border-[3px] border-[var(--ink)] bg-[var(--hotpink)] text-white flex items-center justify-center mb-3">
                     <FiUser size={32} />
                   </div>
                   <h3 className="font-bold text-lg text-center">{student.name || `Student ${student.student?.rollNo}`}</h3>
                   <p className="text-sm font-semibold opacity-60">{(match.score * 100).toFixed(1)}% Match</p>
                 </div>
                 <div className="p-6 flex-1 flex flex-col md:flex-row gap-8">
                   <div className="flex-1 space-y-4">
                     <div>
                       <h4 className="font-bold mb-2">Matched Skills Context</h4>
                       <p className="text-sm text-gray-700 italic mb-2">&quot;{match.reasoning}&quot;</p>
                       <div className="flex flex-wrap gap-2">
                         {match.matchedSkills?.map(skill => (
                           <span key={skill} className="neu-badge bg-[var(--acid)] text-[var(--ink)]">{skill}</span>
                         ))}
                       </div>
                     </div>
                     <div>
                       <h4 className="font-bold mb-2 text-sm">Evidence Backing</h4>
                       <div className="flex gap-2">
                          <EvidenceBadge type="ASSESSMENT" text="Verified" />
                       </div>
                     </div>
                   </div>
                   <div className="w-full md:w-64 space-y-3">
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span>Overall Fit</span>
                          <span>{(match.score * 100).toFixed(0)}%</span>
                        </div>
                        <SkillBar percentage={match.score * 100} color="var(--hotpink)" />
                      </div>
                      <NeuButton variant="primary" className="w-full mt-4">View Full Profile</NeuButton>
                   </div>
                 </div>
              </NeuCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
