"use client";

import { useState, useEffect } from 'react';
import NeuCard from '@/components/shared/NeuCard';
import NeuButton from '@/components/shared/NeuButton';
import NeuBadge from '@/components/shared/NeuBadge';
import { DashboardSkeleton } from '@/components/shared/LoadingSpinner';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import { FiFileText, FiSend, FiUploadCloud } from 'react-icons/fi';
import api from '@/lib/api';

export default function NotesGeneratorPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('ocr'); // 'ocr' or 'standard'

  // OCR Form State
  const [ocrText, setOcrText] = useState('');
  const [ocrTitle, setOcrTitle] = useState('');

  // Standard Form State
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
      .then(res => {
        const fetched = res.data.courses || [];
        setCourses(fetched);
        if (fetched.length > 0) {
          setForm(p => ({ ...p, courseId: fetched[0]._id }));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleGenerateStandard = async (e) => {
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

  const handleGenerateOCR = async () => {
    if (!ocrText.trim()) {
      alert('Please enter or paste lecture note text!');
      return;
    }
    setGenerating(true);
    setResult(null);
    try {
      const res = await api.post('/faculty/notes/ocr-generate', {
        courseId: form.courseId,
        title: ocrTitle || 'OCR Extracted Notes',
        noteContent: ocrText,
      });
      setResult(res.data);
    } catch (err) { alert('OCR extraction failed: ' + (err.response?.data?.error || err.message)); }
    setGenerating(false);
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <PageTransition className="space-y-6">
      <StaggerItem className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-1">📝 AI Notes & OCR Lecture Reader</h1>
          <p className="text-gray-500 font-medium">Extract lecture topics from handwritten notes or generate comprehensive revision materials</p>
        </div>

        <div className="w-full sm:w-auto">
          <select
            className="neu-select bg-white"
            value={form.courseId}
            onChange={e => setForm(p => ({ ...p, courseId: e.target.value }))}
          >
            <option value="">Select Course...</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.code} - {c.title}</option>)}
          </select>
        </div>
      </StaggerItem>

      {/* Mode Toggles */}
      <StaggerItem className="flex gap-2 p-2 bg-white border-[3px] border-[var(--ink)] rounded-2xl">
        <NeuButton
          size="sm"
          variant={activeTab === 'ocr' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('ocr')}
          icon={FiUploadCloud}
        >
          📷 OCR Note Extractor
        </NeuButton>
        <NeuButton
          size="sm"
          variant={activeTab === 'standard' ? 'sky' : 'ghost'}
          onClick={() => setActiveTab('standard')}
          icon={FiFileText}
        >
          📚 AI Topic Notes Generator
        </NeuButton>
      </StaggerItem>

      {/* TAB 1: OCR NOTE EXTRACTOR */}
      {activeTab === 'ocr' && (
        <StaggerItem>
          <NeuCard className="p-6 bg-white space-y-4">
            <h2 className="text-xl font-bold">Extract Lecture Topics from Handwritten/Typed Notes</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Document Title</label>
                <input
                  type="text"
                  className="neu-input bg-white w-full"
                  placeholder="e.g. Data Structures Lecture 5 Notes"
                  value={ocrTitle}
                  onChange={e => setOcrTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Lecture Text / OCR Content</label>
                <textarea
                  rows={8}
                  className="neu-input bg-[var(--paper)] font-mono text-sm p-4 w-full"
                  placeholder="Paste OCR text or handwritten notes content here..."
                  value={ocrText}
                  onChange={e => setOcrText(e.target.value)}
                />
              </div>
            </div>

            <NeuButton variant="primary" onClick={handleGenerateOCR} loading={generating} icon={FiSend}>
              Extract Topics & Build Notes
            </NeuButton>
          </NeuCard>
        </StaggerItem>
      )}

      {/* TAB 2: STANDARD AI NOTES GENERATOR */}
      {activeTab === 'standard' && (
        <StaggerItem>
          <NeuCard className="p-6 bg-white">
            <form onSubmit={handleGenerateStandard} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Source Type</label>
                  <select className="neu-select" value={form.sourceType} onChange={e => setForm(p => ({ ...p, sourceType: e.target.value }))}>
                    <option value="text">Text / Topic</option>
                    <option value="video">Video URL</option>
                    <option value="pdf">PDF URL</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Depth Level</label>
                  <select className="neu-select" value={form.depthLevel} onChange={e => setForm(p => ({ ...p, depthLevel: e.target.value }))}>
                    <option value="overview">Overview</option>
                    <option value="standard">Standard</option>
                    <option value="deep">Deep Dive</option>
                  </select>
                </div>
              </div>

              {form.sourceType !== 'text' && (
                <div className="form-group">
                  <label className="form-label">Source URL</label>
                  <input className="neu-input" placeholder="Enter URL..." value={form.sourceUrl} onChange={e => setForm(p => ({ ...p, sourceUrl: e.target.value }))} />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
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
                Generate AI Notes
              </NeuButton>
            </form>
          </NeuCard>
        </StaggerItem>
      )}

      {/* RESULTS DISPLAY */}
      {result && (
        <StaggerItem>
          <NeuCard className="p-6 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiFileText size={20} className="text-[var(--sky)]" />
                <h2 className="text-xl font-bold">Processed Lecture Notes</h2>
              </div>
              <NeuBadge variant="success">Completed</NeuBadge>
            </div>

            {result.topics && (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl space-y-1">
                <span className="text-xs font-bold text-gray-500 block">Extracted Topics:</span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {result.topics.map((t, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-white border border-indigo-300 text-indigo-800 text-xs font-bold rounded-lg">
                      📌 {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 bg-[var(--paper)] border-[3px] border-[var(--ink)] rounded-xl prose prose-sm max-w-none">
              <p className="font-bold">{result.resource?.title || 'Notes'}</p>
              <pre className="whitespace-pre-wrap text-sm">{result.resource?.contentMarkdown || result.summary || result.message}</pre>
            </div>
          </NeuCard>
        </StaggerItem>
      )}
    </PageTransition>
  );
}
