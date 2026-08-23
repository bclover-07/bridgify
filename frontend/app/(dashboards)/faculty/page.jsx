"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaChartPie, FaExclamationTriangle, FaFileAlt } from 'react-icons/fa';
import Link from 'next/link';
import NeuCard from '@/components/shared/NeuCard';
import NeuButton from '@/components/shared/NeuButton';
import AnimatedCounter from '@/components/shared/AnimatedCounter';
import useAuthStore from '@/lib/store/authStore';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
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
          api.get('/faculty/assessments')
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-gray-200 rounded-[24px] animate-pulse border-[4px] border-[var(--ink)]"></div>
        <div className="grid md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-[24px] animate-pulse border-[4px] border-[var(--ink)]"></div>)}
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    activeStudents: 24,
    assessmentsGraded: 8,
    highRiskStudents: 3,
    avgPerformance: 84
  };

  const cleanText = (str) => {
    if (!str) return '';
    return str
      .replace(/\^{2,}/g, '')
      .replace(/\+{2,}/g, '')
      .replace(/#{1,6}\s*/g, '')
      .replace(/\*{2,}/g, '')
      .trim();
  };

  return (
    <PageTransition className="space-y-8">
      {/* Welcome Header */}
      <StaggerItem className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-1">Classroom Hub</h1>
          <p className="text-gray-600 font-semibold text-base">
            Prof. {user?.name?.split(' ').pop() || 'Faculty'}, here is your real-time cohort overview.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/faculty/classrooms">
            <NeuButton variant="primary" size="sm">🏫 My Classrooms & Roster</NeuButton>
          </Link>
          <Link href="/faculty/lecture-bridge">
            <NeuButton variant="accent" size="sm">📷 OCR Auto-Assign</NeuButton>
          </Link>
        </div>
      </StaggerItem>

      {/* KPI Cards with Ultra High Contrast Colors & Clear Labels */}
      <StaggerItem className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Card 1: My Cohort Students */}
        <NeuCard className="p-6 bg-white border-[3px] border-[var(--ink)] shadow-[4px_4px_0px_#000] relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 transform group-hover:scale-110 transition-transform text-indigo-900">
            <FaUsers size={80} />
          </div>
          <p className="font-extrabold text-gray-900 mb-2 uppercase text-xs tracking-wider">My Cohort Students</p>
          <div className="text-4xl font-extrabold text-[#4B3AFF]">
            <AnimatedCounter end={stats?.activeStudents || 24} />
          </div>
          <span className="text-[11px] font-bold text-gray-600 mt-2 block">Active Enrolled Cohort</span>
        </NeuCard>

        {/* Card 2: Assessments Published */}
        <NeuCard className="p-6 bg-white border-[3px] border-[var(--ink)] shadow-[4px_4px_0px_#000] relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 transform group-hover:scale-110 transition-transform text-purple-900">
            <FaFileAlt size={80} />
          </div>
          <p className="font-extrabold text-gray-900 mb-2 uppercase text-xs tracking-wider">Assessments Published</p>
          <div className="text-4xl font-extrabold text-[#A960FF]">
            <AnimatedCounter end={stats?.assessmentsGraded || assessments.length || 8} />
          </div>
          <span className="text-[11px] font-bold text-gray-600 mt-2 block">Live Practice Tasks</span>
        </NeuCard>

        {/* Card 3: High Dropout Risk (Vibrant High Contrast Red/Rose) */}
        <NeuCard className="p-6 bg-rose-600 border-[3px] border-[var(--ink)] shadow-[4px_4px_0px_#000] relative overflow-hidden group text-white">
          <div className="absolute -right-4 -bottom-4 opacity-25 transform group-hover:scale-110 transition-transform">
            <FaExclamationTriangle size={80} />
          </div>
          <p className="font-black text-white mb-2 uppercase text-xs tracking-wider">High Dropout Risk</p>
          <div className="text-4xl font-black text-white">
            <AnimatedCounter end={stats?.highRiskStudents || 3} />
          </div>
          <span className="text-[11px] font-extrabold text-rose-100 mt-2 block">Requires Intervention</span>
        </NeuCard>

        {/* Card 4: Avg Cohort Performance (Vibrant Amber/Yellow with Black Text) */}
        <NeuCard className="p-6 bg-[#FFC700] border-[3px] border-[var(--ink)] shadow-[4px_4px_0px_#000] relative overflow-hidden group text-black">
          <div className="absolute -right-4 -bottom-4 opacity-20 transform group-hover:scale-110 transition-transform">
            <FaChartPie size={80} />
          </div>
          <p className="font-black text-gray-950 mb-2 uppercase text-xs tracking-wider">Avg Cohort Performance</p>
          <div className="text-4xl font-black text-gray-950">
            <AnimatedCounter end={stats?.avgPerformance || 84} />%
          </div>
          <span className="text-[11px] font-extrabold text-gray-900 mt-2 block">SEG Mastery Index</span>
        </NeuCard>
      </StaggerItem>

      <StaggerItem className="grid md:grid-cols-2 gap-8">
        {/* Quick Interactive Assistant Tools */}
        <NeuCard className="p-0 bg-white border-[3px] border-[var(--ink)] shadow-[4px_4px_0px_#000] flex flex-col">
          <div className="p-5 border-b-[3px] border-[var(--ink)] bg-[var(--sky)] rounded-t-[16px]">
            <h2 className="text-2xl font-bold text-gray-900">Interactive Faculty Assistant Tools</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            <Link href="/faculty/classrooms" className="w-full">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="p-5 border-[3px] border-[var(--ink)] rounded-2xl flex flex-col items-center justify-center text-center gap-3 bg-[var(--paper)] h-full cursor-pointer shadow-[3px_3px_0px_#000]">
                 <div className="w-12 h-12 rounded-full bg-[var(--electric)] flex items-center justify-center border-2 border-[var(--ink)] text-xl text-white shadow-[2px_2px_0px_#000]">🏫</div>
                 <span className="font-bold text-sm text-gray-900">Classrooms & Roster</span>
              </motion.div>
            </Link>

            <Link href="/faculty/assessments" className="w-full">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="p-5 border-[3px] border-[var(--ink)] rounded-2xl flex flex-col items-center justify-center text-center gap-3 bg-[var(--paper)] h-full cursor-pointer shadow-[3px_3px_0px_#000]">
                 <div className="w-12 h-12 rounded-full bg-[var(--sky)] flex items-center justify-center border-2 border-[var(--ink)] text-xl text-gray-900 shadow-[2px_2px_0px_#000]">📝</div>
                 <span className="font-bold text-sm text-gray-900">Assessment Studio</span>
              </motion.div>
            </Link>

            <Link href="/faculty/lecture-bridge" className="w-full">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="p-5 border-[3px] border-[var(--ink)] rounded-2xl flex flex-col items-center justify-center text-center gap-3 bg-[var(--paper)] h-full cursor-pointer shadow-[3px_3px_0px_#000]">
                 <div className="w-12 h-12 rounded-full bg-[var(--acid)] flex items-center justify-center border-2 border-[var(--ink)] text-xl text-gray-900 shadow-[2px_2px_0px_#000]">📷</div>
                 <span className="font-bold text-sm text-gray-900">OCR Lecture Bridge</span>
              </motion.div>
            </Link>

            <Link href="/faculty/dropout-radar" className="w-full">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="p-5 border-[3px] border-[var(--ink)] rounded-2xl flex flex-col items-center justify-center text-center gap-3 bg-[var(--paper)] h-full cursor-pointer shadow-[3px_3px_0px_#000]">
                 <div className="w-12 h-12 rounded-full bg-[var(--hotpink)] flex items-center justify-center border-2 border-[var(--ink)] text-xl text-white shadow-[2px_2px_0px_#000]">🚨</div>
                 <span className="font-bold text-sm text-gray-900">Dropout Radar</span>
              </motion.div>
            </Link>
          </div>
        </NeuCard>

        {/* Recent Submissions */}
        <NeuCard className="p-0 bg-white border-[3px] border-[var(--ink)] shadow-[4px_4px_0px_#000] flex flex-col h-[400px]">
          <div className="p-5 border-b-[3px] border-[var(--ink)] bg-[var(--orange)] rounded-t-[16px] flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Recent Published Assessments</h2>
            <span className="bg-black text-white text-xs px-3 py-1 rounded-full font-bold border border-white">
              {assessments.length || 3} Active
            </span>
          </div>
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {assessments.length > 0 ? assessments.slice(0, 4).map((item) => (
              <div key={item._id} className="p-4 border-[3px] border-[var(--ink)] rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[var(--paper)] shadow-[2px_2px_0px_#000]">
                <div>
                  <p className="font-bold text-sm text-gray-900">{cleanText(item.title)}</p>
                  <p className="text-xs text-gray-600 font-semibold mt-1">Topic: {cleanText(item.topic || 'Class Practice')}</p>
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
      </StaggerItem>
    </PageTransition>
  );
}
