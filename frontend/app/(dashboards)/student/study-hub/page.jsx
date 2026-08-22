"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCode, FiVideo, FiMessageSquare, FiBookOpen } from 'react-icons/fi';
import NeuCard from '@/components/shared/NeuCard';
import api from '@/lib/api';

export default function StudyHubPage() {
  const [activeTab, setActiveTab] = useState('code');
  const [loading, setLoading] = useState(false);
  const [sessionData, setSessionData] = useState(null);

  const tabs = [
    { id: 'code', label: 'Code Compiler', icon: FiCode },
    { id: 'interview', label: 'Mock Interview', icon: FiVideo },
    { id: 'debate', label: 'AI Debate', icon: FiMessageSquare },
    { id: 'resources', label: 'Resources', icon: FiBookOpen },
  ];

  const handleStartInterview = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/student/mock-interview/start', {
        topic: 'General Placement Prep' // This could be dynamic in a full implementation
      });
      setSessionData(data);
      console.log("Interview started:", data);
      alert(`Interview session started! Agent Run ID: ${data.agentRunId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to start interview. See console.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartDebate = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/student/debate/start', {
        topic: 'AI taking over Software Engineering jobs'
      });
      setSessionData(data);
      console.log("Debate started:", data);
      alert(`Debate session started! Opponent ready.`);
    } catch (err) {
      console.error(err);
      alert("Failed to start debate. See console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
          <FiCode className="text-[var(--electric)]" />
          Study Hub
        </h1>
        <p className="text-gray-600">Practice coding, take mock interviews, and engage in AI debates to build your evidence graph.</p>
      </div>

      <NeuCard padding="p-0" className="overflow-hidden bg-white flex flex-col min-h-[600px]">
        {/* Tab Header */}
        <div className="flex border-b-[3px] border-[var(--ink)] bg-[#f8f7f4]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSessionData(null); }}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-2 font-bold transition-colors border-r-[3px] border-[var(--ink)] last:border-r-0 ${
                  isActive ? 'bg-[var(--electric)] text-white' : 'hover:bg-[rgba(75,58,255,0.08)] text-[var(--ink)]'
                }`}
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 p-6 flex flex-col relative">
          {activeTab === 'code' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center">
               <FiCode size={48} className="text-[var(--electric)] mb-4 opacity-50" />
               <h3 className="text-xl font-bold mb-2">Code Compiler</h3>
               <p className="text-gray-600 max-w-md">The Monaco Editor and Pyodide environment will load here for browser-side Python execution.</p>
               <button className="neu-btn neu-btn-primary mt-6">Start Coding Session</button>
            </motion.div>
          )}

          {activeTab === 'interview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center">
               <FiVideo size={48} className="text-[var(--coral)] mb-4 opacity-50" />
               <h3 className="text-xl font-bold mb-2">Mock Interview</h3>
               <p className="text-gray-600 max-w-md mb-6">Enable your camera to begin a MediaPipe-analyzed interview session with ElevenLabs voice synthesis.</p>
               {sessionData ? (
                 <div className="p-4 border-2 border-[var(--ink)] bg-[var(--paper)] rounded-xl text-left max-w-md w-full">
                    <p className="font-bold text-[var(--ink)] mb-2">Session Active</p>
                    <p className="text-sm text-gray-700"><strong>First Question:</strong> {sessionData.firstQuestion || sessionData.response}</p>
                 </div>
               ) : (
                 <button 
                   className="neu-btn neu-btn-coral" 
                   onClick={handleStartInterview}
                   disabled={loading}
                 >
                   {loading ? 'Connecting...' : 'Start Interview'}
                 </button>
               )}
            </motion.div>
          )}

          {activeTab === 'debate' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center">
               <FiMessageSquare size={48} className="text-[var(--hotpink)] mb-4 opacity-50" />
               <h3 className="text-xl font-bold mb-2">AI Debate Coach</h3>
               <p className="text-gray-600 max-w-md mb-6">Select a topic and debate against an AI opponent to prove your communication and reasoning skills.</p>
               {sessionData ? (
                 <div className="p-4 border-2 border-[var(--ink)] bg-[var(--paper)] rounded-xl text-left max-w-md w-full">
                    <p className="font-bold text-[var(--ink)] mb-2">Debate Started</p>
                    <p className="text-sm text-gray-700"><strong>Opening Argument:</strong> {sessionData.openingArgument || sessionData.response}</p>
                 </div>
               ) : (
                 <button 
                   className="neu-btn neu-btn-hotpink"
                   onClick={handleStartDebate}
                   disabled={loading}
                 >
                   {loading ? 'Connecting...' : 'Start Debate (AI taking over Software Engineering)'}
                 </button>
               )}
            </motion.div>
          )}

          {activeTab === 'resources' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center">
               <FiBookOpen size={48} className="text-[var(--mint)] mb-4 opacity-50" />
               <h3 className="text-xl font-bold mb-2">Learning Resources</h3>
               <p className="text-gray-600 max-w-md">Faculty-curated notes, PDFs, and videos targeted at your current skill gaps.</p>
               <button className="neu-btn neu-btn-mint mt-6">Browse Resources</button>
            </motion.div>
          )}
        </div>
      </NeuCard>
    </div>
  );
}
