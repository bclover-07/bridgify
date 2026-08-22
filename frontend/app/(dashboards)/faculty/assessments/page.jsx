"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiFileText, FiPlus, FiSettings, FiCheck } from 'react-icons/fi';
import NeuCard from '@/components/shared/NeuCard';
import NeuButton from '@/components/shared/NeuButton';
import api from '@/lib/api';

export default function FacultyAssessmentsPage() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAssessments() {
      try {
        const { data } = await api.get('/faculty/assessments');
        setAssessments(data.assessments || []);
      } catch (error) {
        console.error("Failed to load assessments:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAssessments();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
            <FiFileText className="text-[var(--sky)]" />
            Assessment Studio
          </h1>
          <p className="text-gray-600">Review, grade, and monitor AI-generated formative assessments.</p>
        </div>
        <NeuButton variant="sky">
          <FiPlus /> New Assessment
        </NeuButton>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <NeuCard className="md:col-span-2 bg-white p-0 flex flex-col min-h-[400px]">
          <div className="p-6 border-b-[3px] border-[var(--ink)] bg-[var(--paper)]">
            <h2 className="text-xl font-bold">Recent Assessments & Submissions</h2>
          </div>
          <div className="flex-1 p-6 space-y-4">
            {loading ? (
               <div className="font-bold text-gray-500 animate-pulse">Loading assessments...</div>
            ) : assessments.length > 0 ? assessments.map((assessment, i) => (
              <div key={assessment._id || i} className="p-4 border-2 border-[var(--ink)] rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white hover:bg-[var(--paper)] transition-colors">
                <div>
                  <h4 className="font-bold text-lg">{assessment.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">Topic: {assessment.topic || 'General'} • Difficulty: {assessment.difficulty || 'Medium'}</p>
                </div>
                <div className="flex gap-2">
                  <NeuButton variant="electric" className="shrink-0">
                    View Grades
                  </NeuButton>
                </div>
              </div>
            )) : (
               <div className="text-center py-12 text-gray-500 font-bold border-2 border-dashed border-gray-300 rounded-xl">
                 No assessments found. Create one to get started.
               </div>
            )}
          </div>
        </NeuCard>

        <NeuCard className="bg-[var(--sky)] text-[var(--ink)] flex flex-col justify-between">
          <div>
             <h3 className="text-xl font-bold mb-4">Auto-Grading AI</h3>
             <p className="font-semibold opacity-90 text-sm">
               The Assessment Evaluator (Agent 1) processes subjective answers based on your generated rubrics.
             </p>
          </div>
          <div className="mt-8 p-4 bg-white border-[3px] border-[var(--ink)] rounded-xl flex items-center gap-3 shadow-[4px_4px_0px_0px_var(--ink)]">
             <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--ink)]"></div>
             <span className="font-bold">Listening for submissions...</span>
          </div>
        </NeuCard>
      </div>
    </div>
  );
}
