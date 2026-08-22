"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiClipboard, FiCheckCircle, FiClock, FiStar } from 'react-icons/fi';
import NeuCard from '@/components/shared/NeuCard';
import NeuButton from '@/components/shared/NeuButton';
import api from '@/lib/api';

export default function AssessmentsPage() {
  const [activeTab, setActiveTab] = useState('pending');
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAssessments() {
      try {
        const { data } = await api.get('/student/assessments');
        // The backend returns { pending: [...], completed: [...] }
        // or a flat array depending on the exact route implementation.
        // Assuming it's an array for simplicity and filtering here:
        setAssessments(data.assessments || []);
      } catch (error) {
        console.error("Failed to load assessments:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAssessments();
  }, []);

  const handleStart = async (id) => {
    try {
      // Typically starting an assessment might redirect or submit an initial state
      // For now, we will hit the start route or just show a console message if it redirects
      console.log(`Starting assessment ${id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = assessments.filter(a => activeTab === 'pending' ? !a.completed : a.completed);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
          <FiClipboard className="text-[var(--acid)] text-stroke-[var(--ink)]" style={{ strokeWidth: '2px', stroke: 'var(--ink)' }} />
          Assessments
        </h1>
        <p className="text-gray-600">Take tests designed by the AI agent based on your current skill gaps.</p>
      </div>

      <div className="flex gap-4 mb-6">
        <button 
          className={`neu-btn ${activeTab === 'pending' ? 'neu-btn-primary' : 'bg-white text-[var(--ink)]'}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending
        </button>
        <button 
          className={`neu-btn ${activeTab === 'completed' ? 'neu-btn-acid' : 'bg-white text-[var(--ink)]'}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed
        </button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-48 bg-gray-200 rounded-[20px] animate-pulse border-[3px] border-[var(--ink)]"></div>
          <div className="h-48 bg-gray-200 rounded-[20px] animate-pulse border-[3px] border-[var(--ink)]"></div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filtered.map((assessment) => (
            <motion.div key={assessment._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <NeuCard className="flex flex-col h-full bg-white relative overflow-hidden">
                <div 
                  className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-20" 
                  style={{ backgroundColor: 'var(--electric)' }}
                ></div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold">{assessment.title}</h3>
                    <span className="neu-badge bg-[var(--paper)]">
                      {assessment.topic || 'General'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-6">
                    <FiClock /> {assessment.duration || '30 mins'}
                  </div>
                </div>
                
                <div className="pt-4 border-t-[3px] border-[var(--ink)]/10 flex justify-between items-center">
                  {activeTab === 'pending' ? (
                    <NeuButton variant="primary" className="w-full" onClick={() => handleStart(assessment._id)}>
                      Start Assessment
                    </NeuButton>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 font-bold text-lg">
                        <FiStar className="text-[var(--amber)]" /> {assessment.score || 0}%
                      </div>
                      <button className="text-sm font-bold text-[var(--electric)] underline">View Report</button>
                    </>
                  )}
                </div>
              </NeuCard>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 font-bold bg-white border-2 border-[var(--ink)] rounded-xl">
              No {activeTab} assessments found in the database.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
