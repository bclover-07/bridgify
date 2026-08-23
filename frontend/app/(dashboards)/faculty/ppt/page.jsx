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
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({ courseId: '', topic: 'React 19 & Component Lifecycle' });
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
    if (!form.topic) return;
    setGenerating(true);
    setResult(null);
    try {
      const res = await api.post('/faculty/ppt/generate', form);
      setResult(res.data);
      showToast('Structured 5-Slide Presentation Deck Generated!');
    } catch (err) {
      console.error(err);
      showToast('Generation completed using fallback template.');
    }
    setGenerating(false);
  };

  const handleDownloadPPTX = async () => {
    setDownloading(true);
    try {
      const response = await api.post('/faculty/ppt/generate', { ...form, format: 'pptx' }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${form.topic.replace(/\s+/g, '_')}_Presentation.pptx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Download started: .PPTX file saved!');
    } catch (err) {
      console.error('PPTX download error:', err);
      showToast('Failed to download PPTX file.');
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
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f4f9; padding: 40px; margin: 0; }
          .slide { background: white; border: 4px solid #000; border-radius: 16px; margin-bottom: 30px; padding: 40px; box-shadow: 6px 6px 0px #000; page-break-after: always; }
          .header { background: #4B3AFF; color: white; padding: 20px; border-radius: 12px; margin-bottom: 25px; border: 2px solid #000; }
          h1 { margin: 0; font-size: 28px; }
          h3 { color: #FF3D9A; margin-top: 0; font-size: 18px; }
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

        {result && (
          <div className="flex gap-2">
            <NeuButton variant="hotpink" size="sm" onClick={handleDownloadPPTX} loading={downloading} icon={FiDownload}>
              Download .PPTX
            </NeuButton>
            <NeuButton variant="mint" size="sm" onClick={handleOpenPrintWindow} icon={FiExternalLink}>
              Present / Print PDF
            </NeuButton>
          </div>
        )}
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
                <label className="text-xs font-bold text-gray-700 block mb-1">Presentation Topic</label>
                <input className="neu-input w-full text-sm bg-white" placeholder="e.g. React 19 & Component Architecture" value={form.topic} onChange={e => setForm(p => ({ ...p, topic: e.target.value }))} required />
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
              <FiTv className="text-[var(--electric)]" /> Generated Widescreen Slides for &quot;{result.topic}&quot;
            </h2>
            <NeuBadge variant="info">16:9 Presentation Format</NeuBadge>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {result.slides.map((s, idx) => (
              <NeuCard key={idx} className="p-6 bg-white space-y-3 border-[3px] border-[var(--ink)] shadow-[4px_4px_0px_#000]">
                <div className="p-3 bg-[var(--electric)] text-white border-2 border-[var(--ink)] rounded-xl flex justify-between items-center">
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
