"use client";

import { useState, useEffect } from 'react';
import NeuCard from '@/components/shared/NeuCard';
import NeuButton from '@/components/shared/NeuButton';
import { DashboardSkeleton } from '@/components/shared/LoadingSpinner';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import { FiSend } from 'react-icons/fi';
import api from '@/lib/api';

export default function PPTMakerPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({ courseId: '', topic: '' });

  useEffect(() => {
    api.get('/faculty/courses')
      .then(res => setCourses(res.data.courses || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.topic) return;
    setGenerating(true);
    try {
      const res = await api.post('/faculty/ppt/generate', form);
      setResult(res.data);
    } catch (err) { console.error(err); }
    setGenerating(false);
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <PageTransition className="space-y-6">
      <StaggerItem>
        <h1 className="text-3xl md:text-4xl font-bold mb-1">🎨 PPT Maker</h1>
        <p className="text-gray-500 font-medium">AI-powered presentation content generator</p>
      </StaggerItem>
      <StaggerItem>
        <NeuCard className="p-6 bg-white">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Course (optional)</label>
              <select className="neu-select" value={form.courseId} onChange={e => setForm(p => ({ ...p, courseId: e.target.value }))}>
                <option value="">Select a course...</option>
                {courses.map(c => <option key={c._id} value={c._id}>{c.code} - {c.title}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Topic</label>
              <input className="neu-input" placeholder="e.g. Introduction to Machine Learning" value={form.topic} onChange={e => setForm(p => ({ ...p, topic: e.target.value }))} required />
            </div>
            <NeuButton type="submit" variant="sky" loading={generating} icon={FiSend}>Generate PPT Content</NeuButton>
          </form>
        </NeuCard>
      </StaggerItem>
      {result && (
        <StaggerItem>
          <NeuCard className="p-6 bg-white">
            <h2 className="text-xl font-bold mb-4">📄 Generated Content</h2>
            <div className="p-4 bg-[var(--paper)] border-[3px] border-[var(--ink)] rounded-xl">
              <p className="font-bold mb-2">{result.topic}</p>
              <pre className="whitespace-pre-wrap text-sm">{result.resource?.contentMarkdown || result.message}</pre>
            </div>
          </NeuCard>
        </StaggerItem>
      )}
    </PageTransition>
  );
}
