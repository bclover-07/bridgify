"use client";

import { useState, useEffect } from 'react';
import NeuCard from '@/components/shared/NeuCard';
import NeuSelect from '@/components/shared/NeuSelect';
import { NeuPieChart, NeuBarChart } from '@/components/shared/NeuChart';
import { DashboardSkeleton } from '@/components/shared/LoadingSpinner';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import { FiPieChart, FiBarChart2 } from 'react-icons/fi';
import api from '@/lib/api';

export default function FairHiringPage() {
  const [drives, setDrives] = useState([]);
  const [selectedDrive, setSelectedDrive] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchingData, setFetchingData] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch drives for dropdown
    api.get('/recruiter/dashboard')
      .then(res => {
        const recentDrives = res.data.recentDrives || [];
        setDrives(recentDrives);
        if (recentDrives.length > 0) {
          setSelectedDrive(recentDrives[0].id);
        }
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Failed to load drives');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedDrive) return;
    
    setFetchingData(true);
    api.get(`/recruiter/fair-hiring/${selectedDrive}`)
      .then(res => {
        setAnalytics(res.data);
        setError(null);
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Failed to load fair hiring data');
        setAnalytics(null);
      })
      .finally(() => setFetchingData(false));
  }, [selectedDrive]);

  if (loading) return <DashboardSkeleton />;

  // Transform data for charts
  const branchData = analytics?.branchDistribution ? Object.entries(analytics.branchDistribution).map(([name, value]) => ({
    name,
    value
  })) : [];

  const stageData = analytics?.stageDistribution ? Object.entries(analytics.stageDistribution).map(([name, value]) => ({
    name,
    value
  })) : [];

  return (
    <PageTransition>
      <div className="space-y-6">
        <StaggerItem>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black flex items-center gap-3">
                <span className="w-12 h-12 rounded-2xl bg-[var(--electric)] border-[4px] border-[var(--ink)] flex items-center justify-center shadow-[4px_4px_0px_0px_var(--ink)]">
                  <FiPieChart className="text-white" size={22} />
                </span>
                Fair Hiring Analytics
              </h1>
              <p className="text-gray-500 font-semibold mt-1">Analyze demographic and stage distributions for your placement drives</p>
            </div>
            
            <div className="w-full md:w-64">
              <NeuSelect 
                value={selectedDrive}
                onChange={(e) => setSelectedDrive(e.target.value)}
                options={drives.map(d => ({ value: d.id, label: d.company || `Drive ${d.id}` }))}
                placeholder="Select a Drive"
              />
            </div>
          </div>
        </StaggerItem>

        {error && (
          <StaggerItem>
            <NeuCard className="p-4 bg-red-50 border-[var(--coral)]">
              <p className="text-[var(--coral)] font-bold">⚠️ {error}</p>
            </NeuCard>
          </StaggerItem>
        )}

        {fetchingData ? (
          <DashboardSkeleton />
        ) : !analytics ? (
          <StaggerItem>
            <NeuCard className="p-10 text-center flex flex-col items-center">
              <FiBarChart2 size={40} className="text-gray-300 mb-4" />
              <h2 className="text-xl font-bold mb-2">No Data Available</h2>
              <p className="text-gray-500">Please select a valid drive to view fair hiring analytics.</p>
            </NeuCard>
          </StaggerItem>
        ) : (
          <>
            <StaggerItem>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <NeuCard className="p-6">
                  <h2 className="font-bold text-xl mb-6">Branch Distribution</h2>
                  {branchData.length > 0 ? (
                    <div className="h-64">
                      <NeuPieChart data={branchData} />
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-400 font-bold border-2 border-dashed border-gray-200 rounded-xl">
                      No branch data
                    </div>
                  )}
                </NeuCard>
                
                <NeuCard className="p-6">
                  <h2 className="font-bold text-xl mb-6">Pipeline Stages</h2>
                  {stageData.length > 0 ? (
                    <div className="h-64">
                      <NeuBarChart data={stageData} bars={[{ key: 'value', label: 'Candidates' }]} />
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-400 font-bold border-2 border-dashed border-gray-200 rounded-xl">
                      No stage data
                    </div>
                  )}
                </NeuCard>
              </div>
            </StaggerItem>
            
            <StaggerItem>
              <NeuCard className="p-6 bg-[var(--acid)]">
                <h2 className="font-bold text-xl mb-2">Summary Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-white p-4 rounded-xl border-[3px] border-[var(--ink)] shadow-[3px_3px_0px_0px_var(--ink)]">
                    <p className="text-sm font-bold text-gray-600">Company</p>
                    <p className="text-2xl font-black">{analytics.company || 'N/A'}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border-[3px] border-[var(--ink)] shadow-[3px_3px_0px_0px_var(--ink)]">
                    <p className="text-sm font-bold text-gray-600">Total Registrations</p>
                    <p className="text-2xl font-black text-[var(--electric)]">{analytics.totalRegistrations || 0}</p>
                  </div>
                </div>
              </NeuCard>
            </StaggerItem>
          </>
        )}
      </div>
    </PageTransition>
  );
}
