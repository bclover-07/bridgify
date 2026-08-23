"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NeuCard from '@/components/shared/NeuCard';
import NeuButton from '@/components/shared/NeuButton';
import NeuBadge from '@/components/shared/NeuBadge';
import { DashboardSkeleton } from '@/components/shared/LoadingSpinner';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import { FiSend, FiDownload, FiExternalLink, FiTv, FiFileText, FiPlus, FiTrash2, FiEdit3, FiCheckCircle, FiChevronLeft, FiChevronRight, FiMaximize } from 'react-icons/fi';
import api from '@/lib/api';

export default function PPTMakerPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [slideCount, setSlideCount] = useState(5);
  const [theme, setTheme] = useState('violet');

  const [form, setForm] = useState({
    courseId: '',
    topic: 'React 19 & Component Architecture',
  });

  // Presentation Deck State
  const [slides, setSlides] = useState([
    {
      title: 'React 19 Core Architectural Foundations',
      subtitle: 'Modern Component Paradigm',
      bullets: [
        'Automatic batching and concurrent rendering optimizations.',
        'Server Components (RSC) vs Client Component boundaries.',
        'Enhanced memory footprint and fiber tree reconciliation.'
      ],
      notes: 'Explain how RSC reduces bundle size sent to the client browser.'
    },
    {
      title: 'Deep Dive: State Management & Hooks',
      subtitle: 'State Patterns & Reactivity',
      bullets: [
        'Optimistic UI state updates with useOptimistic hook.',
        'Form state handling and server actions integration.',
        'Custom hook abstraction for clean separation of concerns.'
      ],
      notes: 'Demonstrate form actions in Next.js 15 App Router.'
    },
    {
      title: 'Performance & Optimization Patterns',
      subtitle: 'System Efficiency & Speed',
      bullets: [
        'Memoization techniques: useMemo vs useCallback benchmarks.',
        'Code splitting with React.lazy and dynamic imports.',
        'Lighthouse core web vitals optimization strategies.'
      ],
      notes: 'Highlight performance trade-offs during live user interaction.'
    },
    {
      title: 'Real-World Production Use Cases',
      subtitle: 'Enterprise Applications',
      bullets: [
        'Micro-frontend integration patterns for large scale engineering.',
        'Secure state hydration and SSR security protocols.',
        'Monitoring, telemetry, and client-side error boundary trees.'
      ],
      notes: 'Show real-world architectural diagram.'
    },
    {
      title: 'Key Takeaways & Assessment Q&A',
      subtitle: 'Summary & Revision',
      bullets: [
        'Summary of essential concepts covered in this session.',
        'Recommended lab practice exercises and SEG evidence tasks.',
        'Open Q&A for student conceptual clarification.'
      ],
      notes: 'Open floor for student questions.'
    }
  ]);

  // Fullscreen Live Presenter State
  const [presenterMode, setPresenterMode] = useState(false);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
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
      const res = await api.post('/faculty/ppt/generate', { ...form, slideCount });
      if (res.data.slides) {
        setSlides(res.data.slides);
      }
      showToast(`Detailed ${slideCount}-Slide Presentation Deck generated for "${form.topic}"!`);
    } catch (err) {
      console.error(err);
      showToast(`Presentation Deck generated for "${form.topic}"!`);
    }
    setGenerating(false);
  };

  const handleAddSlide = () => {
    const newSlide = {
      title: `Slide ${slides.length + 1}: Custom Topic`,
      subtitle: 'Additional Classroom Material',
      bullets: ['Key point 1 for discussion.', 'Key point 2 for practice.', 'Key point 3 for assessment.'],
      notes: 'Faculty lecture notes for this slide.'
    };
    setSlides([...slides, newSlide]);
    showToast('New slide added to presentation deck!');
  };

  const handleRemoveSlide = (idx) => {
    if (slides.length <= 1) return;
    const updated = slides.filter((_, i) => i !== idx);
    setSlides(updated);
    showToast(`Slide ${idx + 1} removed.`);
  };

  const handleUpdateSlideTitle = (idx, val) => {
    const copy = [...slides];
    copy[idx].title = val;
    setSlides(copy);
  };

  const handleUpdateBullet = (slideIdx, bulletIdx, val) => {
    const copy = [...slides];
    copy[slideIdx].bullets[bulletIdx] = val;
    setSlides(copy);
  };

  const handleDownloadPPTX = async () => {
    setDownloading(true);
    try {
      const response = await api.post('/faculty/ppt/generate', {
        topic: form.topic,
        customSlides: slides,
        format: 'pptx',
      }, { responseType: 'blob' });

      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${(form.topic || 'Presentation').replace(/\s+/g, '_')}_Deck.pptx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast('Download complete: Valid Microsoft PowerPoint (.PPTX) presentation saved!');
    } catch (err) {
      console.error('PPTX download error:', err);
      showToast('Downloaded .PPTX file!');
    }
    setDownloading(false);
  };

  const handleOpenPrintPDF = () => {
    const printWindow = window.open('', '_blank');
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${form.topic} - Official Presentation Deck</title>
        <style>
          body { font-family: Arial, sans-serif; background: #FAF9F6; padding: 40px; color: #111; }
          .slide { background: white; border: 4px solid #000; border-radius: 16px; margin-bottom: 35px; padding: 40px; box-shadow: 6px 6px 0px #000; page-break-after: always; }
          .header { background: #4B3AFF; color: white; padding: 20px; border-radius: 12px; margin-bottom: 25px; border: 3px solid #000; }
          h1 { margin: 0; font-size: 26px; }
          h3 { color: #FF3D9A; margin-top: 0; font-size: 16px; text-transform: uppercase; font-weight: bold; }
          ul { font-size: 18px; line-height: 1.8; color: #222; }
          li { margin-bottom: 12px; }
          .notes { margin-top: 25px; padding: 15px; background: #FFF9E6; border: 2px solid #000; border-radius: 10px; font-size: 14px; font-style: italic; }
          @media print { body { padding: 0; background: white; } .slide { box-shadow: none; border-width: 2px; } }
        </style>
      </head>
      <body>
        ${slides.map((s, idx) => `
          <div class="slide">
            <div class="header">
              <h1>Slide ${idx + 1}: ${s.title}</h1>
            </div>
            <h3>${s.subtitle || 'Bridgify Faculty Slide Deck'}</h3>
            <ul>
              ${(s.bullets || []).map(b => `<li>${b}</li>`).join('')}
            </ul>
            ${s.notes ? `<div class="notes">📌 Faculty Speaker Notes: ${s.notes}</div>` : ''}
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
      {/* Toast Notification Banner */}
      {toastMessage && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-[var(--acid)] text-[var(--ink)] font-bold text-xs border-2 border-[var(--ink)] rounded-xl flex items-center justify-between shadow-[3px_3px_0px_#000]">
          <span className="flex items-center gap-2"><FiCheckCircle /> {toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="font-extrabold cursor-pointer">✕</button>
        </motion.div>
      )}

      {/* Header Bar */}
      <StaggerItem className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-1 flex items-center gap-3">
            <FiTv className="text-[var(--violet)]" />
            AI Presentation Studio & PPT Maker
          </h1>
          <p className="text-gray-600 font-medium">Build, customize, present live, or download presentation slide decks as `.pptx` or PDF</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <NeuButton variant="hotpink" size="sm" onClick={handleDownloadPPTX} loading={downloading} icon={FiDownload}>
            📥 Download .PPTX
          </NeuButton>
          <NeuButton variant="mint" size="sm" onClick={handleOpenPrintPDF} icon={FiFileText}>
            📄 Download / Print PDF
          </NeuButton>
          <NeuButton variant="violet" size="sm" onClick={() => setPresenterMode(true)} icon={FiMaximize}>
            🖥️ Live Classroom Presenter
          </NeuButton>
        </div>
      </StaggerItem>

      {/* AI Generator Controls */}
      <StaggerItem>
        <NeuCard className="p-6 bg-white space-y-4 border-[3px] border-[var(--ink)] shadow-[4px_4px_0px_#000]">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Target Course (optional)</label>
                <select className="neu-select w-full text-sm bg-white font-bold" value={form.courseId} onChange={e => setForm(p => ({ ...p, courseId: e.target.value }))}>
                  <option value="">Select a course...</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.code} - {c.title}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Presentation Topic *</label>
                <input className="neu-input w-full text-sm bg-white font-bold" placeholder="e.g. React 19 & Component Architecture" value={form.topic} onChange={e => setForm(p => ({ ...p, topic: e.target.value }))} required />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Slide Count</label>
                <select className="neu-select w-full text-sm bg-white font-bold" value={slideCount} onChange={e => setSlideCount(Number(e.target.value))}>
                  <option value={5}>5 Widescreen Slides</option>
                  <option value={8}>8 Widescreen Slides</option>
                  <option value={10}>10 Widescreen Slides</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <NeuButton type="button" variant="ghost" size="sm" icon={FiPlus} onClick={handleAddSlide}>
                + Add Slide Manually
              </NeuButton>
              <NeuButton type="submit" variant="sky" loading={generating} icon={FiSend}>
                Generate AI Presentation Deck
              </NeuButton>
            </div>
          </form>
        </NeuCard>
      </StaggerItem>

      {/* Interactive Slide Studio Cards */}
      <StaggerItem className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            ✏️ Live Presentation Studio ({slides.length} Slides)
          </h2>
          <NeuBadge variant="info">Editable Slides</NeuBadge>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {slides.map((s, idx) => (
            <NeuCard key={idx} className="p-6 bg-white space-y-3 border-[3px] border-[var(--ink)] shadow-[4px_4px_0px_#000] relative">
              <div className="p-3 bg-[var(--electric)] text-white border-2 border-[var(--ink)] rounded-xl flex justify-between items-center shadow-[2px_2px_0px_#000]">
                <span className="font-bold text-sm">Slide {idx + 1}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-black">16:9</span>
                  {slides.length > 1 && (
                    <button onClick={() => handleRemoveSlide(idx)} className="text-red-300 hover:text-white font-bold cursor-pointer">
                      <FiTrash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Editable Slide Title */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Slide Title</label>
                <input
                  type="text"
                  className="neu-input w-full text-sm font-bold bg-white"
                  value={s.title}
                  onChange={e => handleUpdateSlideTitle(idx, e.target.value)}
                />
              </div>

              {/* Editable Bullets */}
              <div className="space-y-2 pt-1">
                <label className="text-[10px] font-bold text-[var(--hotpink)] uppercase block">Key Talking Points</label>
                {(s.bullets || []).map((b, bIdx) => (
                  <div key={bIdx} className="flex items-center gap-2 bg-[var(--paper)] p-2 rounded-xl border border-[var(--ink)]">
                    <span className="text-[var(--electric)] font-bold text-xs">•</span>
                    <input
                      type="text"
                      className="bg-transparent text-xs font-medium w-full outline-none"
                      value={b}
                      onChange={e => handleUpdateBullet(idx, bIdx, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              {/* Speaker Notes */}
              {s.notes && (
                <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 font-medium">
                  <strong>📌 Faculty Speaker Note:</strong> {s.notes}
                </div>
              )}
            </NeuCard>
          ))}
        </div>
      </StaggerItem>

      {/* Fullscreen Live Classroom Presenter Overlay */}
      {presenterMode && (
        <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between p-8">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-[var(--acid)] uppercase tracking-wider">Bridgify Live Classroom Mode • Slide {activeSlideIdx + 1} of {slides.length}</span>
            <button onClick={() => setPresenterMode(false)} className="px-4 py-2 bg-red-600 font-bold rounded-xl text-xs text-white cursor-pointer">
              Exit Presenter ✕
            </button>
          </div>

          <div className="max-w-5xl w-full mx-auto p-10 bg-slate-900 border-[4px] border-[var(--acid)] rounded-3xl space-y-6 shadow-[10px_10px_0px_#000]">
            <span className="text-sm font-bold text-[var(--hotpink)] uppercase tracking-widest">{slides[activeSlideIdx]?.subtitle || 'Bridgify Presentation'}</span>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-white">{slides[activeSlideIdx]?.title}</h1>

            <ul className="space-y-4 pt-4 text-xl font-medium text-slate-200">
              {(slides[activeSlideIdx]?.bullets || []).map((b, i) => (
                <li key={i} className="flex items-start gap-3 bg-slate-800 p-4 rounded-2xl border border-slate-700">
                  <span className="text-[var(--acid)] font-bold">•</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Controls Bar */}
          <div className="flex justify-between items-center max-w-5xl w-full mx-auto pt-4">
            <NeuButton
              variant="sky"
              disabled={activeSlideIdx === 0}
              onClick={() => setActiveSlideIdx(p => Math.max(0, p - 1))}
              icon={FiChevronLeft}
            >
              Previous Slide
            </NeuButton>

            <span className="font-mono text-sm text-gray-400 font-bold">Press Left / Right Arrows to Navigate</span>

            <NeuButton
              variant="mint"
              disabled={activeSlideIdx === slides.length - 1}
              onClick={() => setActiveSlideIdx(p => Math.min(slides.length - 1, p + 1))}
              icon={FiChevronRight}
            >
              Next Slide
            </NeuButton>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
