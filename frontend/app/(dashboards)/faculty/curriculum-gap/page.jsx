"use client";

import { useState, useEffect } from 'react';
import NeuCard from '@/components/shared/NeuCard';
import NeuButton from '@/components/shared/NeuButton';
import { DashboardSkeleton } from '@/components/shared/LoadingSpinner';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import { FiSearch, FiAlertCircle, FiCheckCircle, FiBookOpen } from 'react-icons/fi';
import api from '@/lib/api';

export default function CurriculumGapPage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/faculty/courses')
      .then(res => setCourses(res.data.courses || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const analyzeGap = async () => {
    if (!selectedCourse) return;
    setAnalyzing(true);
    setError(null);
    try {
      const res = await api.post('/faculty/curriculum-gap', { courseId: selectedCourse });
      setReport(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze curriculum gap');
    }
    setAnalyzing(false);
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <PageTransition>
      <div className="space-y-6">
        <StaggerItem>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black flex items-center gap-3">
                <span className="w-12 h-12 rounded-2xl bg-[var(--amber)] border-[4px] border-[var(--ink)] flex items-center justify-center shadow-[4px_4px_0px_0px_var(--ink)]">
                  <FiSearch className="text-white" size={22} />
                </span>
                Curriculum Gap Analysis
              </h1>
              <p className="text-gray-500 font-semibold mt-1">Identify gaps between curriculum and industry demands</p>
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <NeuCard className="p-6">
            <h2 className="font-bold text-lg mb-4">Select Course</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="neu-input flex-1"
              >
                <option value="">Choose a course...</option>
                {courses.map(c => (
                  <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
                ))}
              </select>
              <NeuButton
                variant="primary"
                onClick={analyzeGap}
                loading={analyzing}
                disabled={!selectedCourse || analyzing}
              >
                <FiSearch className="mr-2" /> Analyze Gaps
              </NeuButton>
            </div>
          </NeuCard>
        </StaggerItem>

        {error && (
          <StaggerItem>
            <NeuCard className="p-4 bg-red-50 border-[var(--coral)]">
              <p className="text-[var(--coral)] font-bold flex items-center gap-2">
                <FiAlertCircle /> {error}
              </p>
            </NeuCard>
          </StaggerItem>
        )}

        {report && (
          <StaggerItem>
            <NeuCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <FiBookOpen size={24} className="text-[var(--electric)]" />
                <div>
                  <h2 className="font-bold text-xl">{report.courseName || 'Course'} — Gap Report</h2>
                  <p className="text-sm text-gray-500 font-semibold">Course ID: {report.courseId}</p>
                </div>
              </div>

              {typeof report.report === 'string' ? (
                <div className="prose max-w-none">
                  <div className="bg-gray-50 border-[3px] border-[var(--ink)] rounded-2xl p-5 shadow-[4px_4px_0px_0px_var(--ink)]">
                    <pre className="whitespace-pre-wrap text-sm font-medium leading-relaxed">{report.report}</pre>
                  </div>
                </div>
              ) : report.report ? (
                <div className="space-y-4">
                  {report.report.missingSkills && report.report.missingSkills.length > 0 && (
                    <div>
                      <h3 className="font-bold text-base mb-2 flex items-center gap-2">
                        <FiAlertCircle className="text-[var(--coral)]" /> Missing Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {report.report.missingSkills.map((skill, i) => (
                          <span key={i} className="px-3 py-1.5 bg-red-50 border-[3px] border-[var(--coral)] rounded-xl text-sm font-bold text-[var(--coral)] shadow-[2px_2px_0px_0px_var(--coral)]">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {report.report.coveredSkills && report.report.coveredSkills.length > 0 && (
                    <div>
                      <h3 className="font-bold text-base mb-2 flex items-center gap-2">
                        <FiCheckCircle className="text-[var(--mint)]" /> Covered Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {report.report.coveredSkills.map((skill, i) => (
                          <span key={i} className="px-3 py-1.5 bg-green-50 border-[3px] border-[var(--mint)] rounded-xl text-sm font-bold text-green-700 shadow-[2px_2px_0px_0px_var(--mint)]">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {report.report.recommendations && (
                    <div>
                      <h3 className="font-bold text-base mb-2">💡 Recommendations</h3>
                      <div className="bg-[var(--acid)] border-[3px] border-[var(--ink)] rounded-2xl p-4 shadow-[3px_3px_0px_0px_var(--ink)]">
                        <pre className="whitespace-pre-wrap text-sm font-medium">{
                          typeof report.report.recommendations === 'string'
                            ? report.report.recommendations
                            : JSON.stringify(report.report.recommendations, null, 2)
                        }</pre>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 font-bold">
                  <FiBookOpen size={40} className="mx-auto mb-2 opacity-50" />
                  No report data available
                </div>
              )}
            </NeuCard>
          </StaggerItem>
        )}

        {!report && !analyzing && (
          <StaggerItem>
            <NeuCard className="p-12 text-center">
              <FiSearch size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="font-bold text-xl text-gray-400">Select a course to analyze</h3>
              <p className="text-gray-400 font-medium mt-1">We&apos;ll identify gaps between your curriculum and industry needs</p>
            </NeuCard>
          </StaggerItem>
        )}
      </div>
    </PageTransition>
  );
}
