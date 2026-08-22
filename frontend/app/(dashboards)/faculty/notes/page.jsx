"use client";

import { useState, useEffect } from 'react';
import NeuCard from '@/components/shared/NeuCard';
import NeuButton from '@/components/shared/NeuButton';
import { DashboardSkeleton } from '@/components/shared/LoadingSpinner';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import { FiFileText, FiSend } from 'react-icons/fi';
import api from '@/lib/api';

export default function NotesGeneratorPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({
    sourceType: 'text',
    sourceUrl: '',
    courseId: '',
    depthLevel: 'standard',
    style: 'academic',
    language: 'en',
  });

  useEffect(() => {
    api.get('/faculty/courses')
      .then(res => setCourses(res.data.courses || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.courseId) return;
    setGenerating(true);
    setResult(null);
    try {
      const res = await api.post('/faculty/notes/generate', form);
      setResult(res.data);
    } catch (err) { console.error(err); }
    setGenerating(false);
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <PageTransition className="space-y-6">
      <StaggerItem>
        <h1 className="text-3xl md:text-4xl font-bold mb-1">📝 Notes Generator</h1>
        <p className="text-gray-500 font-medium">Generate comprehensive notes from any source material</p>
      </StaggerItem>

      <StaggerItem>
        <NeuCard className="p-6 bg-white">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Course</label>
                <select className="neu-select" value={form.courseId} onChange={e => setForm(p => ({ ...p, courseId: e.target.value }))} required>
                  <option value="">Select a course...</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.code} - {c.title}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Source Type</label>
                <select className="neu-select" value={form.sourceType} onChange={e => setForm(p => ({ ...p, sourceType: e.target.value }))}>
                  <option value="text">Text / Topic</option>
                  <option value="video">Video URL</option>
                  <option value="pdf">PDF URL</option>
                </select>
              </div>
            </div>
            {form.sourceType !== 'text' && (
              <div className="form-group">
                <label className="form-label">Source URL</label>
                <input className="neu-input" placeholder="Enter URL..." value={form.sourceUrl} onChange={e => setForm(p => ({ ...p, sourceUrl: e.target.value }))} />
              </div>
            )}
            <div className="grid grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label">Depth</label>
                <select className="neu-select" value={form.depthLevel} onChange={e => setForm(p => ({ ...p, depthLevel: e.target.value }))}>
                  <option value="overview">Overview</option>
                  <option value="standard">Standard</option>
                  <option value="deep">Deep Dive</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Style</label>
                <select className="neu-select" value={form.style} onChange={e => setForm(p => ({ ...p, style: e.target.value }))}>
                  <option value="academic">Academic</option>
                  <option value="simplified">Simplified</option>
                  <option value="visual">Visual</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Language</label>
                <select className="neu-select" value={form.language} onChange={e => setForm(p => ({ ...p, language: e.target.value }))}>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="te">Telugu</option>
                </select>
              </div>
            </div>
            <NeuButton type="submit" variant="sky" loading={generating} icon={FiSend} className="w-full md:w-auto">
              Generate Notes
            </NeuButton>
          </form>
        </NeuCard>
      </StaggerItem>

      {result && (
        <StaggerItem>
          <NeuCard className="p-6 bg-white">
            <div className="flex items-center gap-2 mb-4">
              <FiFileText size={20} className="text-[var(--sky)]" />
              <h2 className="text-xl font-bold">Generated Notes</h2>
            </div>
            <div className="p-4 bg-[var(--paper)] border-[3px] border-[var(--ink)] rounded-xl prose prose-sm max-w-none">
              <p className="font-bold">{result.resource?.title || 'Notes'}</p>
              <pre className="whitespace-pre-wrap text-sm">{result.resource?.contentMarkdown || result.message}</pre>
            </div>
          </NeuCard>
        </StaggerItem>
      )}
    </PageTransition>
  );
}
