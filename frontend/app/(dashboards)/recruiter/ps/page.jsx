"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiFilePlus, FiSettings, FiPlay, FiCheck } from 'react-icons/fi';
import NeuCard from '@/components/shared/NeuCard';
import NeuButton from '@/components/shared/NeuButton';
import api from '@/lib/api';

export default function ProblemStatementGeneratorPage() {
  const [role, setRole] = useState('Frontend Developer');
  const [level, setLevel] = useState('Entry Level (L1)');
  const [techStack, setTechStack] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedPS, setGeneratedPS] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/recruiter/ps/generate', {
        role,
        level,
        techStack
      });
      setGeneratedPS(data.ps);
    } catch (error) {
      console.error("Failed to generate PS:", error);
      alert("Generation failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
          <FiFilePlus className="text-[var(--coral)]" />
          PS Generator
        </h1>
        <p className="text-gray-600">Auto-generate contextual problem statements and grading rubrics using AI.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <NeuCard className="bg-white md:col-span-1">
           <h3 className="text-xl font-bold mb-4 flex items-center gap-2 border-b-2 border-[var(--ink)] pb-2">
             <FiSettings /> Configuration
           </h3>
           <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Target Role</label>
                <select className="neu-select" value={role} onChange={e => setRole(e.target.value)}>
                  <option>Frontend Developer</option>
                  <option>Backend Developer</option>
                  <option>Data Analyst</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Difficulty Level</label>
                <select className="neu-select" value={level} onChange={e => setLevel(e.target.value)}>
                  <option>Entry Level (L1)</option>
                  <option>Mid Level (L2)</option>
                  <option>Senior (L3)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Tech Stack</label>
                <input 
                  type="text" 
                  className="neu-input" 
                  placeholder="e.g. React, Node, MongoDB" 
                  value={techStack}
                  onChange={e => setTechStack(e.target.value)}
                />
              </div>
              <NeuButton variant="primary" className="w-full mt-4" onClick={handleGenerate} disabled={loading}>
                {loading ? 'Generating...' : <><FiPlay /> Generate PS</>}
              </NeuButton>
           </div>
        </NeuCard>

        <NeuCard className="bg-white md:col-span-2 flex flex-col p-0">
          <div className="p-4 border-b-[3px] border-[var(--ink)] bg-[var(--paper)]">
             <h3 className="font-bold">Generated Output</h3>
          </div>
          <div className="p-6 flex-1 flex flex-col">
             {!generatedPS ? (
               <div className="flex-1 flex items-center justify-center text-center">
                 <div className="opacity-50 max-w-sm">
                    <FiFilePlus size={48} className="mx-auto mb-4 text-[var(--ink)]" />
                    <p className="font-semibold">Configure the parameters and click Generate to create a custom problem statement and automated rubric.</p>
                 </div>
               </div>
             ) : (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                 <div>
                   <h2 className="text-2xl font-bold mb-2">{generatedPS.title || "Generated Assessment"}</h2>
                   <p className="text-sm text-gray-600 bg-gray-100 p-3 rounded-lg border-2 border-gray-300">
                     {generatedPS.description}
                   </p>
                 </div>
                 
                 <div>
                   <h3 className="text-lg font-bold mb-3 border-b-2 border-gray-200 pb-1">Automated Rubric</h3>
                   <div className="space-y-2">
                     {generatedPS.rubric?.map((r, i) => (
                       <div key={i} className="flex gap-2 items-start p-2 bg-[var(--acid)]/20 border-2 border-[var(--acid)] rounded-lg">
                         <FiCheck className="text-[var(--ink)] mt-1 shrink-0" />
                         <div>
                           <p className="font-bold text-sm">{r.criterion}</p>
                           <p className="text-xs text-gray-600">Weight: {r.weight}%</p>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>

                 <NeuButton variant="mint" className="w-full">Publish to Command Center</NeuButton>
               </motion.div>
             )}
          </div>
        </NeuCard>
      </div>
    </div>
  );
}
