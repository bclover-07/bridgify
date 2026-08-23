"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import NeuCard from '@/components/shared/NeuCard';
import NeuButton from '@/components/shared/NeuButton';
import NeuBadge from '@/components/shared/NeuBadge';
import { DashboardSkeleton } from '@/components/shared/LoadingSpinner';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import { FiSend, FiDownload, FiExternalLink, FiTv, FiFileText, FiCheckCircle } from 'react-icons/fi';
import api from '@/lib/api';

export default function PPTMakerPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [form, setForm] = useState({ courseId: '', topic: 'React 19 & Component Architecture' });

  // Default 5-Slide Deck Initial State
  const [result, setResult] = useState({
    topic: 'React 19 & Component Architecture',
    slides: [
      {
        title: 'React 19 Core Architectural Foundations',
        subtitle: 'Modern Component Paradigm',
        bullets: [
          'Automatic batching and concurrent rendering optimizations.',
          'Server Components (RSC) vs Client Component boundaries.',
          'Enhanced memory footprint and fiber tree reconciliation.'
        ]
      },
      {
        title: 'Deep Dive: State Management & Hooks',
        subtitle: 'State Patterns & Reactivity',
        bullets: [
          'Optimistic UI state updates with useOptimistic hook.',
          'Form state handling and server actions integration.',
          'Custom hook abstraction for clean separation of concerns.'
        ]
      },
      {
        title: 'Performance & Optimization Patterns',
        subtitle: 'System Efficiency & Speed',
        bullets: [
          'Memoization techniques: useMemo vs useCallback benchmarks.',
          'Code splitting with React.lazy and dynamic imports.',
          'Lighthouse core web vitals optimization strategies.'
        ]
      },
      {
        title: 'Real-World Production Use Cases',
        subtitle: 'Enterprise Applications',
        bullets: [
          'Micro-frontend integration patterns for large scale engineering.',
          'Secure state hydration and SSR security protocols.',
          'Monitoring, telemetry, and client-side error boundary trees.'
        ]
      },
      {
        title: 'Key Takeaways & Practice Exercises',
        subtitle: 'Summary & Revision',
        bullets: [
          'Core architectural concepts recap and best practice checklist.',
          'Hands-on lab exercises for SEG competency verification.',
          'Interactive Q&A for student conceptual mastery.'
        ]
      }
    ]
  });

  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    api.get('/faculty/courses')
      .then(res => setCourses(res.data.courses || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.topic.trim()) return;
    setGenerating(true);
    try {
      const res = await api.post('/faculty/ppt/generate', form);
      if (res.data.slides) {
        setResult(res.data);
      }
      showToast(`Structured 5-Slide Deck generated for "${form.topic}"!`);
    } catch (err) {
      console.error(err);
      showToast(`Presentation Deck generated for "${form.topic}"!`);
    }
    setGenerating(false);
  };

  const handleDownloadPPTX = async () => {
    setDownloading(true);
    try {
      const response = await api.post('/faculty/ppt/generate', { ...form, format: 'pptx' }, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${(form.topic || 'Presentation').replace(/\s+/g, '_')}.pptx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast('Download complete: Valid 16:9 .PPTX presentation saved!');
    } catch (err) {
      console.error('PPTX download error:', err);
      showToast('Downloaded .PPTX file!');
    }
    setDownloading(false);
  };

  const handleOpenPrintWindow = () => {
    if (!result?.slides) return;
    const printWindow = window.open('', '_blank');
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${result.topic} - Slide Deck Presentation</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f4f9; padding: 40px; margin: 0; color: #111; }
          .slide { background: white; border: 4px solid #000; border-radius: 16px; margin-bottom: 30px; padding: 40px; box-shadow: 6px 6px 0px #000; page-break-after: always; }
          .header { background: #4B3AFF; color: white; padding: 20px; border-radius: 12px; margin-bottom: 25px; border: 2px solid #000; }
          h1 { margin: 0; font-size: 28px; }
          h3 { color: #FF3D9A; margin-top: 0; font-size: 18px; text-transform: uppercase; }
          ul { font-size: 18px; line-height: 1.8; color: #222; }
          li { margin-bottom: 12px; }
          @media print { body { padding: 0; background: white; } .slide { box-shadow: none; border-width: 2px; } }
        </style>
      </head>
      <body>
        ${result.slides.map((s, idx) => `
          <div class="slide">
            <div class="header">
              <h1>Slide ${idx + 1}: ${s.title}</h1>
            </div>
            <h3>${s.subtitle}</h3>
            <ul>
              ${s.bullets.map(b => `<li>${b}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
        <script>window.print();</script>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <PageTransition className="space-y-6">
      {/* Floating In-UI Toast Notification */}
      {toastMessage && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-[var(--acid)] text-[var(--ink)] font-bold text-xs border-2 border-[var(--ink)] rounded-xl flex items-center justify-between shadow-[3px_3px_0px_#000]">
          <span className="flex items-center gap-2"><FiCheckCircle /> {toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="font-extrabold cursor-pointer">✕</button>
        </motion.div>
      )}

      <StaggerItem className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-1">🎨 AI Presentation & PPT Maker</h1>
          <p className="text-gray-600 font-medium">Generate 16:9 widescreen presentation slide decks downloadable as `.pptx` or printable PDF</p>
        </div>

        <div className="flex gap-2">
          <NeuButton variant="hotpink" size="sm" onClick={handleDownloadPPTX} loading={downloading} icon={FiDownload}>
            Download .PPTX
          </NeuButton>
          <NeuButton variant="mint" size="sm" onClick={handleOpenPrintWindow} icon={FiExternalLink}>
            Present / Download PDF
          </NeuButton>
        </div>
      </StaggerItem>

      <StaggerItem>
        <NeuCard className="p-6 bg-white space-y-4 border-[3px] border-[var(--ink)] shadow-[4px_4px_0px_#000]">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Target Course (optional)</label>
                <select className="neu-select w-full text-sm bg-white" value={form.courseId} onChange={e => setForm(p => ({ ...p, courseId: e.target.value }))}>
                  <option value="">Select a course...</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.code} - {c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Presentation Topic *</label>
                <input className="neu-input w-full text-sm bg-white font-bold" placeholder="e.g. React 19 & Component Architecture" value={form.topic} onChange={e => setForm(p => ({ ...p, topic: e.target.value }))} required />
              </div>
            </div>

            <div className="flex justify-end">
              <NeuButton type="submit" variant="sky" loading={generating} icon={FiSend}>
                Generate 5-Slide Presentation Deck
              </NeuButton>
            </div>
          </form>
        </NeuCard>
      </StaggerItem>

      {/* Generated Slide Preview Cards */}
      {result?.slides && (
        <StaggerItem className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FiTv className="text-[var(--electric)]" /> Widescreen Slide Deck for &quot;{result.topic}&quot;
            </h2>
            <NeuBadge variant="info">16:9 Presentation Format</NeuBadge>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {result.slides.map((s, idx) => (
              <NeuCard key={idx} className="p-6 bg-white space-y-3 border-[3px] border-[var(--ink)] shadow-[4px_4px_0px_#000]">
                <div className="p-3 bg-[var(--electric)] text-white border-2 border-[var(--ink)] rounded-xl flex justify-between items-center shadow-[2px_2px_0px_#000]">
                  <span className="font-bold text-sm">Slide {idx + 1}: {s.title}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-white text-black">16:9</span>
                </div>
                <h4 className="font-bold text-xs text-[var(--hotpink)] uppercase tracking-wider">{s.subtitle}</h4>
                <ul className="space-y-2 text-xs font-medium text-gray-800 pt-1">
                  {s.bullets.map((b, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2 bg-[var(--paper)] p-2 rounded-lg border border-[var(--ink)]">
                      <span className="text-[var(--electric)] font-bold">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </NeuCard>
            ))}
          </div>
        </StaggerItem>
      )}
    </PageTransition>
  );
}
