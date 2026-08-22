"use client";

import { useState, useEffect } from 'react';
import NeuCard from '@/components/shared/NeuCard';
import NeuButton from '@/components/shared/NeuButton';
import NeuInput from '@/components/shared/NeuInput';
import NeuSelect from '@/components/shared/NeuSelect';
import { DashboardSkeleton } from '@/components/shared/LoadingSpinner';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import { FiMessageSquare, FiSend, FiStar, FiPlus, FiTrash2 } from 'react-icons/fi';
import api from '@/lib/api';

export default function FeedbackPage() {
  const [drives, setDrives] = useState([]);
  const [students, setStudents] = useState([]);
  
  const [selectedDrive, setSelectedDrive] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [feedback, setFeedback] = useState('');
  const [skillSignals, setSkillSignals] = useState([{ skillId: '', score: 50 }]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch drives and students (shortlisted candidates as proxy)
    api.get('/recruiter/dashboard')
      .then(res => {
        setDrives(res.data.recentDrives || []);
        setStudents(res.data.shortlisted || []);
        
        if (res.data.recentDrives?.length > 0) setSelectedDrive(res.data.recentDrives[0].id);
        if (res.data.shortlisted?.length > 0) setSelectedStudent(res.data.shortlisted[0].id);
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Failed to load initial data');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAddSkill = () => {
    setSkillSignals([...skillSignals, { skillId: '', score: 50 }]);
  };

  const handleRemoveSkill = (index) => {
    setSkillSignals(skillSignals.filter((_, i) => i !== index));
  };

  const handleSkillChange = (index, field, value) => {
    const updated = [...skillSignals];
    updated[index][field] = field === 'score' ? Number(value) : value;
    setSkillSignals(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDrive || !selectedStudent || !feedback) {
      setError("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess('');

    try {
      const validSignals = skillSignals.filter(s => s.skillId && s.score);
      const res = await api.post(`/recruiter/drives/${selectedDrive}/feedback`, {
        studentId: selectedStudent,
        feedback,
        skillSignals: validSignals
      });
      
      setSuccess(res.data.message || 'Feedback submitted successfully to SEG');
      setFeedback('');
      setSkillSignals([{ skillId: '', score: 50 }]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit feedback');
    }
    setSubmitting(false);
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <PageTransition>
      <div className="space-y-6 max-w-4xl mx-auto">
        <StaggerItem>
          <div>
            <h1 className="text-3xl md:text-4xl font-black flex items-center gap-3">
              <span className="w-12 h-12 rounded-2xl bg-[var(--hotpink)] border-[4px] border-[var(--ink)] flex items-center justify-center shadow-[4px_4px_0px_0px_var(--ink)]">
                <FiMessageSquare className="text-white" size={22} />
              </span>
              Interview Feedback
            </h1>
            <p className="text-gray-500 font-semibold mt-1">Submit skill signals directly to the Student Evidence Graph (SEG)</p>
          </div>
        </StaggerItem>

        {error && (
          <StaggerItem>
            <NeuCard className="p-4 bg-red-50 border-[var(--coral)]">
              <p className="text-[var(--coral)] font-bold">⚠️ {error}</p>
            </NeuCard>
          </StaggerItem>
        )}

        {success && (
          <StaggerItem>
            <NeuCard className="p-4 bg-green-50 border-[var(--mint)]">
              <p className="text-green-800 font-bold flex items-center gap-2">✅ {success}</p>
            </NeuCard>
          </StaggerItem>
        )}

        <StaggerItem>
          <NeuCard className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <NeuSelect 
                  label="Placement Drive"
                  value={selectedDrive}
                  onChange={(e) => setSelectedDrive(e.target.value)}
                  options={drives.map(d => ({ value: d.id, label: d.company || `Drive ${d.id}` }))}
                  required
                />
                <NeuSelect 
                  label="Candidate"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  options={students.map(s => ({ value: s.id, label: s.name }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Overall Feedback (Text)</label>
                <textarea 
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Describe the candidate's performance, strengths, and areas for improvement..."
                  className="w-full p-4 rounded-xl border-[3px] border-[var(--ink)] bg-white font-medium focus:outline-none focus:ring-[4px] focus:ring-[var(--electric)] transition-all min-h-[120px]"
                  required
                />
              </div>

              <div className="p-5 bg-gray-50 border-[3px] border-[var(--ink)] rounded-xl relative">
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[var(--electric)] border-[2px] border-[var(--ink)] flex items-center justify-center text-white">
                  <FiStar size={14} />
                </div>
                <h3 className="font-bold text-lg mb-4">Skill Signals</h3>
                <p className="text-sm text-gray-500 font-medium mb-4">
                  Add specific skills demonstrated during the interview. This feeds directly into the candidate's SEG as validated evidence.
                </p>

                <div className="space-y-4">
                  {skillSignals.map((signal, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-3 items-end p-4 bg-white border-[2px] border-dashed border-gray-300 rounded-xl">
                      <div className="w-full sm:flex-1">
                        <NeuInput 
                          label="Skill (e.g. React, System Design)"
                          value={signal.skillId}
                          onChange={(e) => handleSkillChange(index, 'skillId', e.target.value)}
                          placeholder="Skill name"
                        />
                      </div>
                      <div className="w-full sm:w-32">
                        <NeuInput 
                          type="number"
                          min="0"
                          max="100"
                          label="Score (0-100)"
                          value={signal.score}
                          onChange={(e) => handleSkillChange(index, 'score', e.target.value)}
                        />
                      </div>
                      <div className="pb-2">
                        <button 
                          type="button"
                          onClick={() => handleRemoveSkill(index)}
                          className="w-10 h-10 rounded-xl bg-red-100 text-red-600 border-[2px] border-[var(--ink)] flex items-center justify-center hover:bg-red-200 transition-colors"
                          disabled={skillSignals.length === 1}
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <NeuButton type="button" variant="outline" size="sm" onClick={handleAddSkill}>
                    <FiPlus className="mr-1" /> Add Another Skill
                  </NeuButton>
                </div>
              </div>

              <div className="pt-4 border-t-2 border-dashed border-gray-200 flex justify-end">
                <NeuButton type="submit" variant="primary" loading={submitting} disabled={submitting}>
                  <FiSend className="mr-2" /> Submit Evidence to SEG
                </NeuButton>
              </div>
            </form>
          </NeuCard>
        </StaggerItem>
      </div>
    </PageTransition>
  );
}
