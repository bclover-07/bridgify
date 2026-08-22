"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaBuilding, FaUsers, FaChartBar, FaFileSignature } from 'react-icons/fa';
import { FiMoreHorizontal, FiCalendar } from 'react-icons/fi';
import NeuCard from '@/components/shared/NeuCard';
import NeuButton from '@/components/shared/NeuButton';
import AnimatedCounter from '@/components/shared/AnimatedCounter';
import useAuthStore from '@/lib/store/authStore';
import api from '@/lib/api';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState(null);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [dashRes, driveRes] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/admin/placement-cc')
        ]);
        setDashboardData(dashRes.data);
        setDrives(driveRes.data.drives || []);
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !dashboardData) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-gray-200 rounded-[20px] animate-pulse border-[3px] border-[var(--ink)]"></div>
        <div className="grid md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-[20px] animate-pulse border-[3px] border-[var(--ink)]"></div>)}
        </div>
      </div>
    );
  }

  const { stats } = dashboardData;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Command Center</h1>
          <p className="text-gray-600 text-lg">Institution-wide skill analytics and placement orchestration.</p>
        </div>
        <div className="flex gap-3">
          <NeuButton variant="violet">Generate NAAC Report</NeuButton>
          <NeuButton variant="primary">New Drive</NeuButton>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <NeuCard className="p-6 bg-[var(--violet)] text-white relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-20 transform group-hover:scale-110 transition-transform">
            <FaBuilding size={80} />
          </div>
          <p className="font-semibold opacity-90 mb-2">Active Drives</p>
          <div className="text-4xl font-bold">
            <AnimatedCounter end={stats.driveCount || 0} />
          </div>
        </NeuCard>

        <NeuCard className="p-6 bg-white relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 transform group-hover:scale-110 transition-transform text-[var(--ink)]">
            <FaUsers size={80} />
          </div>
          <p className="font-semibold text-gray-600 mb-2">Total Students</p>
          <div className="text-4xl font-bold">
            <AnimatedCounter end={stats.studentCount || 0} />
          </div>
        </NeuCard>

        <NeuCard className="p-6 bg-[var(--electric)] text-white relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-20 transform group-hover:scale-110 transition-transform">
            <FaChartBar size={80} />
          </div>
          <p className="font-semibold opacity-90 mb-2">Assessments</p>
          <div className="text-4xl font-bold">
            <AnimatedCounter end={stats.assessmentCount || 0} />
          </div>
        </NeuCard>

        <NeuCard className="p-6 bg-[var(--acid)] text-[var(--ink)] relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 transform group-hover:scale-110 transition-transform">
            <FaFileSignature size={80} />
          </div>
          <p className="font-semibold mb-2">Verified Skill Nodes</p>
          <div className="text-4xl font-bold">
            <AnimatedCounter end={stats.segCount || 0} />
          </div>
        </NeuCard>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Placement Pipeline */}
        <NeuCard className="md:col-span-2 p-0 bg-white flex flex-col">
          <div className="p-6 border-b-[3px] border-[var(--ink)] flex justify-between items-center bg-[#f8f7f4] rounded-t-[17px]">
            <h2 className="text-2xl font-bold">Active Placement Drives</h2>
          </div>
          <div className="p-6 flex-1">
            <div className="space-y-4">
              {drives.length > 0 ? drives.map((drive, i) => (
                <div key={drive._id || i} className="p-4 border-2 border-[var(--ink)] rounded-xl flex items-center justify-between hover:shadow-[4px_4px_0px_0px_var(--ink)] transition-shadow">
                  <div>
                    <h4 className="font-bold text-lg">{drive.company}</h4>
                    <p className="text-sm text-gray-600">{drive.roles?.[0]?.title || 'Multiple Roles'}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-[var(--acid)] border-2 border-[var(--ink)] rounded-full text-xs font-bold mb-1">
                      Live
                    </span>
                    <p className="text-sm font-bold">{drive.registrations?.length || 0} Students</p>
                  </div>
                </div>
              )) : (
                <p className="text-gray-500 font-bold text-center py-8">No active drives found. Create one to get started.</p>
              )}
            </div>
          </div>
        </NeuCard>

        {/* System Health */}
        <NeuCard className="p-0 bg-white flex flex-col h-[500px]">
          <div className="p-6 border-b-[3px] border-[var(--ink)] bg-[var(--ink)] text-white rounded-t-[17px]">
            <h2 className="text-xl font-bold">Agent Health</h2>
          </div>
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
             <div className="p-3 border-l-4 border-[var(--mint)] bg-[var(--paper)]">
               <p className="font-bold text-sm">Agent 14: SEG Consistency</p>
               <p className="text-xs text-gray-500 mt-1">Status: OK (Last run: 2:00 AM)</p>
             </div>
             <div className="p-3 border-l-4 border-[var(--mint)] bg-[var(--paper)]">
               <p className="font-bold text-sm">Agent 10: Vector Search</p>
               <p className="text-xs text-gray-500 mt-1">Status: OK (98% cache hit rate)</p>
             </div>
             <div className="p-3 border-l-4 border-[var(--amber)] bg-[var(--paper)]">
               <p className="font-bold text-sm">Agent 04: Interview AI</p>
               <p className="text-xs text-gray-500 mt-1">Status: High Latency (Otari fallback active)</p>
             </div>
          </div>
        </NeuCard>
      </div>
    </div>
  );
}
