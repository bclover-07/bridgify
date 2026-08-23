"use client";

import { useState, useEffect } from 'react';
import NeuCard from '@/components/shared/NeuCard';
import NeuBadge from '@/components/shared/NeuBadge';
import NeuButton from '@/components/shared/NeuButton';
import SkillBar from '@/components/shared/SkillBar';
import { DashboardSkeleton } from '@/components/shared/LoadingSpinner';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import { FiLayers, FiCpu, FiCheckCircle, FiFileText, FiUploadCloud } from 'react-icons/fi';
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
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState(null);

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
      alert('Please enter or paste lecture notes content!');
      return;
    }
    setPublishing(true);
    setPublishResult(null);
    try {
      const res = await api.post('/faculty/lecture-bridge/auto-assign', {
        courseId: selectedCourse,
        title: noteTitle || 'Lecture Practice Assignment',
        noteContent,
        mimeType: 'text/plain',
      });
      setPublishResult(res.data);
      alert('Assignment generated from OCR notes & published dynamically to students!');
    } catch (err) {
      alert('Auto-assign failed: ' + (err.response?.data?.error || err.message));
    }
    setPublishing(false);
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <PageTransition className="space-y-6">
      {/* Header & Course Dropdown */}
      <StaggerItem className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-1">🌉 Lecture Bridge & OCR Auto-Assign</h1>
          <p className="text-gray-500 font-medium">Upload lecture notes to auto-generate & publish student practice tasks, or inspect syllabus coverage</p>
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
      <StaggerItem className="flex gap-2 p-2 bg-white border-[3px] border-[var(--ink)] rounded-2xl">
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
          variant={activeTab === 'gaps' ? 'accent' : 'ghost'}
          onClick={() => setActiveTab('gaps')}
          icon={FiLayers}
        >
          📊 Syllabus & Testing Gap Analysis
        </NeuButton>
      </StaggerItem>

      {/* TAB 1: OCR NOTES & AUTO ASSIGNMENT GENERATOR */}
      {activeTab === 'ocr-assign' && (
        <StaggerItem className="space-y-6">
          <NeuCard className="p-6 bg-white space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FiFileText className="text-[var(--electric)]" /> Upload or Paste Lecture Notes
            </h2>
            <p className="text-xs text-gray-600 font-medium">
              Paste or type your handwritten/printed lecture notes. The OCR AI engine extracts key topics and instantly creates & publishes a practice quiz to student dashboards.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Lecture Assignment Title</label>
                <input
                  type="text"
                  className="neu-input bg-white w-full"
                  placeholder="e.g. Week 4: Tree Traversal & Recursion Lecture Practice"
                  value={noteTitle}
                  onChange={e => setNoteTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Lecture Topics & Notes Text (or OCR scan)</label>
                <textarea
                  rows={8}
                  className="neu-input bg-[var(--paper)] font-mono text-sm p-4 w-full"
                  placeholder="Paste lecture text or notes here... e.g. Topic 1: Binary Search Tree Inorder & Preorder. Definition: Left subtree values are smaller, right subtree values are larger."
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                />
              </div>
            </div>

            <NeuButton
              variant="primary"
              onClick={handleOcrAutoAssign}
              loading={publishing}
              icon={FiCpu}
              className="w-full sm:w-auto"
            >
              Run OCR & Auto-Publish Assignment to Class
            </NeuButton>

            {publishResult && (
              <div className="p-5 border-[3px] border-[var(--ink)] bg-emerald-50 rounded-2xl space-y-3 mt-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-base text-emerald-900 flex items-center gap-2">
                    <FiCheckCircle /> Assignment Successfully Published!
                  </h3>
                  <NeuBadge variant="success">Live on Student Portal</NeuBadge>
                </div>
                <p className="text-xs text-emerald-800 font-medium">{publishResult.message}</p>

                <div className="bg-white p-3 rounded-xl border border-emerald-200 space-y-1">
                  <span className="text-xs font-bold text-gray-500 block">Extracted Topics:</span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {publishResult.extractedTopics?.map((t, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs rounded-lg">
                        📌 {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </NeuCard>
        </StaggerItem>
      )}

      {/* TAB 2: SYLLABUS GAPS ANALYSIS */}
      {activeTab === 'gaps' && (
        <>
          {fetching && <DashboardSkeleton />}

          {data && !fetching && (
            <>
              <StaggerItem>
                <NeuCard className="p-5 bg-white text-center">
                  <p className="text-sm font-bold text-gray-500 mb-2">Coverage Rate</p>
                  <p className="text-5xl font-bold" style={{ color: data.coverageRate >= 70 ? 'var(--mint)' : data.coverageRate >= 40 ? 'var(--amber)' : 'var(--coral)' }}>
                    {data.coverageRate}%
                  </p>
                  <SkillBar value={data.coverageRate} color={data.coverageRate >= 70 ? 'var(--mint)' : data.coverageRate >= 40 ? 'var(--amber)' : 'var(--coral)'} className="mt-4 max-w-md mx-auto" />
                </NeuCard>
              </StaggerItem>

              <div className="grid md:grid-cols-2 gap-6">
                <StaggerItem>
                  <NeuCard className="p-5 bg-white h-full">
                    <div className="flex items-center gap-2 mb-4">
                      <NeuBadge variant="warning">⚠️ Taught but NOT Tested</NeuBadge>
                      <span className="text-sm font-bold text-gray-400">({data.taughtNotTested?.length || 0})</span>
                    </div>
                    {data.taughtNotTested?.length > 0 ? (
                      <div className="space-y-2">
                        {data.taughtNotTested.map((s, i) => (
                          <div key={i} className="p-3 border-[3px] border-[var(--amber)] rounded-xl bg-amber-50">
                            <p className="font-bold text-sm">{s.label || s.skillId}</p>
                            <p className="text-xs text-gray-500">{s.skillId}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm text-center py-4">All taught skills are tested ✓</p>
                    )}
                  </NeuCard>
                </StaggerItem>

                <StaggerItem>
                  <NeuCard className="p-5 bg-white h-full">
                    <div className="flex items-center gap-2 mb-4">
                      <NeuBadge variant="danger">🔴 Tested but NOT Taught</NeuBadge>
                      <span className="text-sm font-bold text-gray-400">({data.testedNotTaught?.length || 0})</span>
                    </div>
                    {data.testedNotTaught?.length > 0 ? (
                      <div className="space-y-2">
                        {data.testedNotTaught.map((s, i) => (
                          <div key={i} className="p-3 border-[3px] border-[var(--coral)] rounded-xl bg-red-50">
                            <p className="font-bold text-sm">{s.label || s.skillId}</p>
                            <p className="text-xs text-gray-500">{s.skillId}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm text-center py-4">No gaps found ✓</p>
                    )}
                  </NeuCard>
                </StaggerItem>
              </div>
            </>
          )}
        </>
      )}
    </PageTransition>
  );
}
