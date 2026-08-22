"use client";

import { useState, useEffect, useMemo } from 'react';
import NeuCard from '@/components/shared/NeuCard';
import NeuTable from '@/components/shared/NeuTable';
import { DashboardSkeleton } from '@/components/shared/LoadingSpinner';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import { FiUsers, FiMail, FiCheckCircle } from 'react-icons/fi';
import api from '@/lib/api';

export default function PipelinePage() {
  const [shortlisted, setShortlisted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Pipeline page fetches shortlisted candidates from dashboard endpoint
    api.get('/recruiter/dashboard')
      .then(res => {
        setShortlisted(res.data.shortlisted || []);
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Failed to load pipeline');
      })
      .finally(() => setLoading(false));
  }, []);

  const columns = useMemo(() => [
    {
      header: 'Candidate Name',
      accessor: 'name',
      cell: (row) => (
        <div className="font-bold text-gray-800 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--acid)] border-[2px] border-[var(--ink)] flex items-center justify-center font-black text-sm">
            {(row.name || 'U').charAt(0)}
          </div>
          {row.name}
        </div>
      )
    },
    {
      header: 'Branch & Year',
      accessor: 'branch',
      cell: (row) => (
        <div>
          <div className="font-bold text-sm text-[var(--electric)]">{row.branch || 'Unknown'}</div>
          <div className="text-xs font-semibold text-gray-500">Year: {row.year || 'N/A'}</div>
        </div>
      )
    },
    {
      header: 'CGPA',
      accessor: 'cgpa',
      cell: (row) => (
        <div className="font-bold">{row.cgpa || 'N/A'}</div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: () => (
        <span className="px-3 py-1 bg-[var(--mint)] border-[2px] border-[var(--ink)] rounded-full text-xs font-bold inline-flex items-center gap-1 shadow-[2px_2px_0px_0px_var(--ink)]">
          <FiCheckCircle /> Shortlisted
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <button 
          className="p-2 bg-gray-100 hover:bg-[var(--electric)] hover:text-white border-[2px] border-[var(--ink)] rounded-xl transition-colors shadow-[2px_2px_0px_0px_var(--ink)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
          onClick={() => window.location.href = `mailto:${row.email}`}
          title={`Email ${row.name}`}
        >
          <FiMail size={16} />
        </button>
      )
    }
  ], []);

  if (loading) return <DashboardSkeleton />;

  return (
    <PageTransition>
      <div className="space-y-6">
        <StaggerItem>
          <div>
            <h1 className="text-3xl md:text-4xl font-black flex items-center gap-3">
              <span className="w-12 h-12 rounded-2xl bg-[var(--violet)] border-[4px] border-[var(--ink)] flex items-center justify-center shadow-[4px_4px_0px_0px_var(--ink)]">
                <FiUsers className="text-white" size={22} />
              </span>
              Talent Pipeline
            </h1>
            <p className="text-gray-500 font-semibold mt-1">Manage your shortlisted candidates and hiring pipeline</p>
          </div>
        </StaggerItem>

        {error && (
          <StaggerItem>
            <NeuCard className="p-4 bg-red-50 border-[var(--coral)]">
              <p className="text-[var(--coral)] font-bold">⚠️ {error}</p>
            </NeuCard>
          </StaggerItem>
        )}

        <StaggerItem>
          <NeuCard className="p-6">
            <div className="mb-4">
              <h2 className="font-bold text-xl">Shortlisted Candidates ({shortlisted.length})</h2>
            </div>
            
            <NeuTable 
              columns={columns} 
              data={shortlisted} 
              keyField="id"
              emptyMessage={
                <div className="py-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full border-[3px] border-[var(--ink)] flex items-center justify-center">
                    <FiUsers size={24} className="text-gray-400" />
                  </div>
                  <h3 className="font-bold text-lg">Your pipeline is empty</h3>
                  <p className="text-gray-500 text-sm mt-1">Go to Talent Search to find and shortlist candidates.</p>
                </div>
              }
            />
          </NeuCard>
        </StaggerItem>
      </div>
    </PageTransition>
  );
}
