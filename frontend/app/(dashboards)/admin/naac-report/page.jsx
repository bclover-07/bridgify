"use client";

import { useState } from 'react';
import NeuCard from '@/components/shared/NeuCard';
import NeuButton from '@/components/shared/NeuButton';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import { FiFileText, FiDownload, FiCpu } from 'react-icons/fi';
import api from '@/lib/api';

export default function NAACReportPage() {
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  const generateReport = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await api.post('/admin/naac-report/generate');
      setReport(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate NAAC report');
    }
    setGenerating(false);
  };

  const handlePrint = () => {
    const printWin = window.open('', '_blank');
    printWin.document.write(`
      <html><head><title>NAAC Report - Bridgify</title>
      <style>body{font-family:system-ui;padding:40px;max-width:800px;margin:0 auto;line-height:1.6}pre{white-space:pre-wrap;font-family:inherit}</style>
      </head><body><h1>NAAC/NIRF Report</h1><pre>${typeof report?.report === 'string' ? report.report : JSON.stringify(report?.report, null, 2)}</pre></body></html>
    `);
    printWin.document.close();
    printWin.print();
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <StaggerItem>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black flex items-center gap-3">
                <span className="w-12 h-12 rounded-2xl bg-[var(--violet)] border-[4px] border-[var(--ink)] flex items-center justify-center shadow-[4px_4px_0px_0px_var(--ink)]">
                  <FiFileText className="text-white" size={22} />
                </span>
                NAAC Report Generator
              </h1>
              <p className="text-gray-500 font-semibold mt-1">Generate comprehensive NAAC/NIRF compliance reports powered by AI</p>
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <NeuCard className="p-6 md:p-8 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--violet)] to-[var(--electric)] border-[4px] border-[var(--ink)] flex items-center justify-center mx-auto mb-5 shadow-[6px_6px_0px_0px_var(--ink)]">
              <FiCpu className="text-white" size={32} />
            </div>
            <h2 className="font-bold text-2xl mb-2">AI-Powered NAAC Report</h2>
            <p className="text-gray-500 font-medium mb-6 max-w-md mx-auto">
              Our AI agent analyzes your institution&apos;s data — student performance, faculty metrics, placement stats, and skill distribution — to generate a comprehensive NAAC/NIRF report.
            </p>
            <NeuButton
              variant="primary"
              size="lg"
              onClick={generateReport}
              loading={generating}
              disabled={generating}
              className="text-lg px-8 py-3"
            >
              {generating ? '🤖 AI is analyzing data...' : '📊 Generate NAAC Report'}
            </NeuButton>
          </NeuCard>
        </StaggerItem>

        {error && (
          <StaggerItem>
            <NeuCard className="p-4 bg-red-50 border-[var(--coral)]">
              <p className="text-[var(--coral)] font-bold">⚠️ {error}</p>
            </NeuCard>
          </StaggerItem>
        )}

        {report && (
          <StaggerItem>
            <NeuCard className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                <div>
                  <h2 className="font-bold text-xl flex items-center gap-2">
                    <FiFileText className="text-[var(--electric)]" /> Generated Report
                  </h2>
                  {report.agentRunId && (
                    <p className="text-xs text-gray-400 font-mono mt-1">Agent Run: {report.agentRunId}</p>
                  )}
                </div>
                <NeuButton variant="outline" size="sm" onClick={handlePrint}>
                  <FiDownload className="mr-2" /> Print / Export
                </NeuButton>
              </div>

              {report.message && (
                <div className="p-3 mb-4 bg-[var(--acid)] border-[3px] border-[var(--ink)] rounded-xl text-sm font-bold">
                  ✅ {report.message}
                </div>
              )}

              <div className="bg-gray-50 border-[3px] border-[var(--ink)] rounded-2xl p-5 shadow-[4px_4px_0px_0px_var(--ink)] overflow-auto max-h-[60vh]">
                <pre className="whitespace-pre-wrap text-sm font-medium leading-relaxed">
                  {typeof report.report === 'string' ? report.report : JSON.stringify(report.report, null, 2)}
                </pre>
              </div>
            </NeuCard>
          </StaggerItem>
        )}
      </div>
    </PageTransition>
  );
}
