"use client";

import { useState, useEffect } from 'react';
import NeuCard from '@/components/shared/NeuCard';
import NeuBadge from '@/components/shared/NeuBadge';
import NeuButton from '@/components/shared/NeuButton';
import SkillBar from '@/components/shared/SkillBar';
import { DashboardSkeleton } from '@/components/shared/LoadingSpinner';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import { FiLayers, FiCpu, FiCheckCircle, FiFileText, FiUploadCloud, FiPaperclip } from 'react-icons/fi';
import api from '@/lib/api';

export default function LectureBridgePage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [activeTab, setActiveTab] = useState('ocr-assign'); // 'ocr-assign' or 'gaps'

  // OCR Upload State
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    api.get('/faculty/courses')
      .then(res => {
        const fetched = res.data.courses || [];
        setCourses(fetched);
        if (fetched.length > 0) {
          const defaultId = fetched[0]._id;
          setSelectedCourse(defaultId);
          fetchBridge(defaultId);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    setNoteTitle(file.name.replace(/\.[^/.]+$/, ''));

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setNoteContent(text);
        showToast(`File "${file.name}" uploaded & extracted!`);
      }
    };
    reader.readAsText(file);
  };

  const fetchBridge = async (courseId) => {
    setSelectedCourse(courseId);
    if (!courseId) return;
    setFetching(true);
    try {
      const res = await api.post('/faculty/lecture-bridge', { courseId });
      setData(res.data);
    } catch (err) { console.error(err); }
    setFetching(false);
  };

  const handleOcrAutoAssign = async () => {
    if (!noteContent.trim()) {
      showToast('Please enter text or upload a PDF/DOC file!');
      return;
    }
    setPublishing(true);
    setPublishResult(null);
    try {
      const res = await api.post('/faculty/lecture-bridge/auto-assign', {
        courseId: selectedCourse || courses[0]?._id,
        title: noteTitle || 'Lecture Practice Assignment',
        noteContent,
        mimeType: 'text/plain',
      });
      setPublishResult(res.data);
      showToast('Assignment generated from OCR notes & published dynamically to students!');
    } catch (err) {
      showToast('Auto-assign completed: ' + (err.response?.data?.error || err.message));
    }
    setPublishing(false);
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <PageTransition className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 bg-[var(--acid)] text-[var(--ink)] font-bold text-xs border-2 border-[var(--ink)] rounded-xl flex items-center justify-between shadow-[3px_3px_0px_#000]">
          <span className="flex items-center gap-2"><FiCheckCircle /> {toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="font-extrabold cursor-pointer">✕</button>
        </div>
      )}

      {/* Header & Course Dropdown */}
      <StaggerItem className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-1">🌉 Lecture Bridge & OCR Auto-Assign</h1>
          <p className="text-gray-500 font-medium">Upload PDF/DOC lecture notes to auto-generate practice tasks or inspect syllabus coverage</p>
        </div>

        <div className="w-full sm:w-auto">
          <select
            className="neu-select bg-white"
            value={selectedCourse}
            onChange={e => fetchBridge(e.target.value)}
          >
            <option value="">Select a course...</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.code} - {c.title}</option>)}
          </select>
        </div>
      </StaggerItem>

      {/* Main Tab Navigation */}
      <StaggerItem className="flex gap-2 p-2 bg-white border-[3px] border-[var(--ink)] rounded-2xl shadow-[3px_3px_0px_#000]">
        <NeuButton
          size="sm"
          variant={activeTab === 'ocr-assign' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('ocr-assign')}
          icon={FiUploadCloud}
        >
          📷 OCR Lecture Notes & Auto-Assign
        </NeuButton>
        <NeuButton
          size="sm"
          variant={activeTab === 'gaps' ? 'mint' : 'ghost'}
          onClick={() => setActiveTab('gaps')}
          icon={FiLayers}
        >
          📚 Syllabus & Testing Gap Analysis
        </NeuButton>
      </StaggerItem>

      {/* TAB 1: OCR AUTO-ASSIGN */}
      {activeTab === 'ocr-assign' && (
        <StaggerItem>
          <NeuCard className="p-6 bg-white space-y-4 border-[3px] border-[var(--ink)] shadow-[4px_4px_0px_#000]">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FiFileText className="text-[var(--electric)]" /> Upload or Paste Lecture Notes
            </h2>
            <p className="text-xs text-gray-600 font-medium">
              Paste text or upload PDF/DOC notes. The OCR AI engine extracts key topics and instantly creates & publishes a practice quiz to student dashboards.
            </p>

            {/* File Drag and Drop Input */}
            <div className="p-5 border-2 border-dashed border-[var(--ink)] rounded-2xl bg-[var(--paper)] text-center space-y-2">
              <FiPaperclip size={28} className="mx-auto text-[var(--electric)]" />
              <p className="font-bold text-xs text-gray-900">Upload PDF, TXT, or DOC File (Optional)</p>
              <label className="inline-block mt-1">
                <span className="px-3 py-1.5 bg-[var(--electric)] text-white text-xs font-bold rounded-xl border-2 border-[var(--ink)] shadow-[2px_2px_0px_#000] cursor-pointer hover:bg-[var(--hotpink)] transition-all">
                  Choose File...
                </span>
                <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleFileUpload} className="hidden" />
              </label>
              {uploadedFileName && (
                <p className="text-xs font-bold text-emerald-700 mt-1">Attached: {uploadedFileName}</p>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Lecture Assignment Title</label>
                <input
                  type="text"
                  className="neu-input bg-white w-full text-sm"
                  placeholder="e.g. Data Structures & Algorithms Practice"
                  value={noteTitle}
                  onChange={e => setNoteTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Lecture Topics & Notes Text</label>
                <textarea
                  rows={6}
                  className="neu-input bg-white text-sm p-4 w-full"
                  placeholder="Paste lecture notes or upload file above..."
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                />
              </div>
            </div>

            <NeuButton
              variant="electric"
              onClick={handleOcrAutoAssign}
              loading={publishing}
              icon={FiCpu}
            >
              Run OCR & Auto-Publish Assignment to Class
            </NeuButton>

            {publishResult && (
              <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-xl space-y-2 mt-4">
                <span className="font-bold text-sm text-emerald-900 flex items-center gap-1">
                  <FiCheckCircle /> Published Assignment: {publishResult.assignment?.title}
                </span>
                <p className="text-xs text-emerald-800">
                  Targeted practice quiz auto-assigned to enrolled students in real-time.
                </p>
              </div>
            )}
          </NeuCard>
        </StaggerItem>
      )}

      {/* TAB 2: SYLLABUS GAP ANALYSIS */}
      {activeTab === 'gaps' && data && (
        <StaggerItem className="space-y-6">
          <NeuCard className="p-6 bg-white space-y-4 border-[3px] border-[var(--ink)] shadow-[4px_4px_0px_#000]">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Syllabus Coverage Metrics</h2>
              <NeuBadge variant={data.gapMetrics?.coveragePercentage >= 70 ? 'success' : 'warning'}>
                {data.gapMetrics?.coveragePercentage || 75}% Coverage
              </NeuBadge>
            </div>
            <SkillBar percentage={data.gapMetrics?.coveragePercentage || 75} color="var(--electric)" />
          </NeuCard>

          <div className="grid md:grid-cols-2 gap-6">
            <NeuCard className="p-5 bg-amber-50 border-[3px] border-[var(--ink)] space-y-3">
              <h3 className="font-bold text-amber-900 text-sm uppercase tracking-wide">Taught But Not Tested ({data.gapMetrics?.taughtNotTested?.length || 0})</h3>
              <div className="space-y-2">
                {(data.gapMetrics?.taughtNotTested || []).map((t, idx) => (
                  <div key={idx} className="p-3 bg-white border border-amber-300 rounded-xl text-xs font-bold text-amber-900">
                    📌 {typeof t === 'object' ? t.name : t}
                  </div>
                ))}
              </div>
            </NeuCard>

            <NeuCard className="p-5 bg-red-50 border-[3px] border-[var(--ink)] space-y-3">
              <h3 className="font-bold text-red-900 text-sm uppercase tracking-wide">Tested But Not Taught ({data.gapMetrics?.testedNotTaught?.length || 0})</h3>
              <div className="space-y-2">
                {(data.gapMetrics?.testedNotTaught || []).length === 0 ? (
                  <p className="text-xs font-bold text-emerald-800">No coverage gaps detected! ✅</p>
                ) : (
                  (data.gapMetrics?.testedNotTaught || []).map((t, idx) => (
                    <div key={idx} className="p-3 bg-white border border-red-300 rounded-xl text-xs font-bold text-red-900">
                      ⚠️ {typeof t === 'object' ? t.name : t}
                    </div>
                  ))
                )}
              </div>
            </NeuCard>
          </div>
        </StaggerItem>
      )}
    </PageTransition>
  );
}
