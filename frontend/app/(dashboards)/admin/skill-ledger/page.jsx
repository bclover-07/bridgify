"use client";

import { useState, useEffect, useMemo } from 'react';
import NeuCard from '@/components/shared/NeuCard';
import NeuTable from '@/components/shared/NeuTable';
import { DashboardSkeleton } from '@/components/shared/LoadingSpinner';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import { FiDatabase, FiTrendingUp, FiUsers, FiAward } from 'react-icons/fi';
import api from '@/lib/api';

export default function SkillLedgerPage() {
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/admin/skill-ledger')
      .then(res => {
        setLedger(res.data.ledger || []);
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Failed to load skill ledger');
      })
      .finally(() => setLoading(false));
  }, []);

  const columns = useMemo(() => [
    {
      header: 'Skill Name',
      accessor: 'skillLabel',
      cell: (row) => (
        <div className="font-bold text-gray-800">{row.skillLabel}</div>
      )
    },
    {
      header: 'Avg Confidence',
      accessor: 'avgConfidence',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden border border-gray-400">
            <div 
              className="h-full bg-[var(--electric)]" 
              style={{ width: `${Math.min(100, Math.max(0, row.avgConfidence || 0))}%` }}
            />
          </div>
          <span className="font-bold text-sm">{Math.round(row.avgConfidence || 0)}%</span>
        </div>
      )
    },
    {
      header: 'Max Confidence',
      accessor: 'maxConfidence',
      cell: (row) => (
        <div className="font-bold text-[var(--mint)]">{Math.round(row.maxConfidence || 0)}%</div>
      )
    },
    {
      header: 'Evidences',
      accessor: 'evidenceCount',
      cell: (row) => (
        <div className="flex items-center gap-1.5 font-bold text-[var(--violet)]">
          <FiDatabase /> {row.evidenceCount || 0}
        </div>
      )
    },
    {
      header: 'Students',
      accessor: 'studentCount',
      cell: (row) => (
        <div className="flex items-center gap-1.5 font-bold text-[var(--hotpink)]">
          <FiUsers /> {row.studentCount || 0}
        </div>
      )
    }
  ], []);

  if (loading) return <DashboardSkeleton />;

  // Calculate summary stats
  const totalSkills = ledger.length;
  const totalEvidences = ledger.reduce((acc, curr) => acc + (curr.evidenceCount || 0), 0);
  const topSkill = ledger.length > 0 ? ledger.reduce((prev, current) => (prev.avgConfidence > current.avgConfidence) ? prev : current) : null;

  return (
    <PageTransition>
      <div className="space-y-6">
        <StaggerItem>
          <div>
            <h1 className="text-3xl md:text-4xl font-black flex items-center gap-3">
              <span className="w-12 h-12 rounded-2xl bg-[var(--electric)] border-[4px] border-[var(--ink)] flex items-center justify-center shadow-[4px_4px_0px_0px_var(--ink)]">
                <FiDatabase className="text-white" size={22} />
              </span>
              Skill Ledger
            </h1>
            <p className="text-gray-500 font-semibold mt-1">Institution-wide aggregate of verified skills and confidence levels</p>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <NeuCard className="p-5 flex items-center gap-4 bg-[var(--acid)]">
              <div className="w-14 h-14 rounded-2xl bg-white border-[3px] border-[var(--ink)] flex items-center justify-center shadow-[3px_3px_0px_0px_var(--ink)]">
                <FiTrendingUp size={24} className="text-[var(--ink)]" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-700">Tracked Skills</p>
                <p className="text-3xl font-black">{totalSkills}</p>
              </div>
            </NeuCard>
            
            <NeuCard className="p-5 flex items-center gap-4 bg-purple-100">
              <div className="w-14 h-14 rounded-2xl bg-white border-[3px] border-[var(--ink)] flex items-center justify-center shadow-[3px_3px_0px_0px_var(--ink)]">
                <FiDatabase size={24} className="text-[var(--violet)]" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-700">Total Evidences</p>
                <p className="text-3xl font-black">{totalEvidences}</p>
              </div>
            </NeuCard>
            
            <NeuCard className="p-5 flex items-center gap-4 bg-green-100">
              <div className="w-14 h-14 rounded-2xl bg-white border-[3px] border-[var(--ink)] flex items-center justify-center shadow-[3px_3px_0px_0px_var(--ink)]">
                <FiAward size={24} className="text-[var(--mint)]" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-700">Top Skill</p>
                <p className="text-xl font-black truncate max-w-[120px]">{topSkill ? topSkill.skillLabel : '-'}</p>
              </div>
            </NeuCard>
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
            <h2 className="font-bold text-xl mb-4">Institution Skill Matrix</h2>
            <NeuTable 
              columns={columns} 
              data={ledger} 
              keyField="skillId"
              emptyMessage="No skills tracked yet."
            />
          </NeuCard>
        </StaggerItem>
      </div>
    </PageTransition>
  );
}
