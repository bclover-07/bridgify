"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaChartPie, FaExclamationTriangle, FaFileAlt } from 'react-icons/fa';
import Link from 'next/link';
import NeuCard from '@/components/shared/NeuCard';
import NeuButton from '@/components/shared/NeuButton';
import AnimatedCounter from '@/components/shared/AnimatedCounter';
import useAuthStore from '@/lib/store/authStore';
import api from '@/lib/api';

export default function FacultyDashboard() {
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [dashRes, assessRes] = await Promise.all([
          api.get('/faculty/dashboard'),
          api.get('/faculty/assessments') // get recent assessments for grading queue
        ]);
        setDashboardData(dashRes.data);
        setAssessments(assessRes.data.assessments || []);
      } catch (error) {
        console.error("Failed to fetch faculty data:", error);
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
          <h1 className="text-4xl font-bold mb-2">Classroom Hub</h1>
          <p className="text-gray-600 text-lg">Prof. {user?.name?.split(' ').pop()}, here is your cohort overview.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/faculty/assessments">
            <NeuButton variant="primary">Assessment Studio</NeuButton>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <NeuCard className="p-6 bg-white relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 transform group-hover:scale-110 transition-transform text-[var(--ink)]">
            <FaUsers size={80} />
          </div>
          <p className="font-semibold text-gray-600 mb-2">My Cohort</p>
          <div className="text-4xl font-bold">
            <AnimatedCounter end={stats?.activeStudents || 0} />
          </div>
        </NeuCard>

        <NeuCard className="p-6 bg-white relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 transform group-hover:scale-110 transition-transform text-[var(--ink)]">
            <FaFileAlt size={80} />
          </div>
          <p className="font-semibold text-gray-600 mb-2">Assessments</p>
          <div className="text-4xl font-bold">
            <AnimatedCounter end={stats?.assessmentsGraded || 0} />
          </div>
        </NeuCard>

        <NeuCard className="p-6 bg-[var(--coral)] text-white relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-20 transform group-hover:scale-110 transition-transform">
            <FaExclamationTriangle size={80} />
          </div>
          <p className="font-semibold opacity-90 mb-2">Dropout Risk</p>
          <div className="text-4xl font-bold">
            <AnimatedCounter end={stats?.highRiskStudents || 0} />
          </div>
        </NeuCard>

        <NeuCard className="p-6 bg-[var(--amber)] text-[var(--ink)] relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 transform group-hover:scale-110 transition-transform">
            <FaChartPie size={80} />
          </div>
          <p className="font-semibold mb-2">Avg Performance</p>
          <div className="text-4xl font-bold">
            <AnimatedCounter end={stats?.avgPerformance || 0} />%
          </div>
        </NeuCard>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <NeuCard className="p-0 bg-white flex flex-col">
          <div className="p-6 border-b-[3px] border-[var(--ink)] bg-[var(--sky)] rounded-t-[17px]">
            <h2 className="text-2xl font-bold text-[var(--ink)]">AI Assistant Tools</h2>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4 flex-1">
            <button className="neu-card p-4 flex flex-col items-center justify-center text-center gap-3 hover:bg-[#f8f7f4]">
               <div className="w-12 h-12 rounded-full bg-[var(--sky)] flex items-center justify-center border-2 border-[var(--ink)] text-xl">📝</div>
               <span className="font-bold text-sm">Generate Rubric</span>
            </button>
            <Link href="/faculty/cohort-heatmap" className="neu-card p-4 flex flex-col items-center justify-center text-center gap-3 hover:bg-[#f8f7f4]">
               <div className="w-12 h-12 rounded-full bg-[var(--acid)] flex items-center justify-center border-2 border-[var(--ink)] text-xl">📊</div>
               <span className="font-bold text-sm">Cohort Heatmap</span>
            </Link>
            <Link href="/faculty/cohort-heatmap" className="neu-card p-4 flex flex-col items-center justify-center text-center gap-3 hover:bg-[#f8f7f4]">
               <div className="w-12 h-12 rounded-full bg-[var(--hotpink)] flex items-center justify-center border-2 border-[var(--ink)] text-xl text-white">⚠️</div>
               <span className="font-bold text-sm">Dropout Radar</span>
            </Link>
            <button className="neu-card p-4 flex flex-col items-center justify-center text-center gap-3 hover:bg-[#f8f7f4]">
               <div className="w-12 h-12 rounded-full bg-[var(--electric)] flex items-center justify-center border-2 border-[var(--ink)] text-xl text-white">🎓</div>
               <span className="font-bold text-sm">Generate Notes</span>
            </button>
          </div>
        </NeuCard>

        {/* Recent Submissions */}
        <NeuCard className="p-0 bg-white flex flex-col h-[400px]">
          <div className="p-6 border-b-[3px] border-[var(--ink)] bg-[#f8f7f4] rounded-t-[17px] flex justify-between items-center">
            <h2 className="text-xl font-bold">Recent Assessments</h2>
            <span className="bg-[var(--ink)] text-white text-xs px-2 py-1 rounded-full font-bold">{assessments.length} Active</span>
          </div>
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {assessments.length > 0 ? assessments.slice(0, 4).map((item) => (
              <div key={item._id} className="p-4 border-2 border-[var(--ink)] rounded-xl flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm">{item.title}</p>
                  <p className="text-xs text-gray-500 font-mono mt-1">{item.topic}</p>
                </div>
                <Link href="/faculty/assessments">
                  <NeuButton variant="mint" size="sm">View Submissions</NeuButton>
                </Link>
              </div>
            )) : (
               <p className="text-center text-gray-500 font-bold py-8">No assessments currently active.</p>
            )}
          </div>
        </NeuCard>
      </div>
    </div>
  );
}
