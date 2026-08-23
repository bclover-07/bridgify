"use client";

import { useState, useEffect } from 'react';
import NeuCard from '@/components/shared/NeuCard';
import NeuBadge from '@/components/shared/NeuBadge';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import { FiBarChart2, FiPieChart } from 'react-icons/fi';
import api from '@/lib/api';

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function AnalyticsPage() {
  const [departmentData, setDepartmentData] = useState([
    { department: 'CSE', score: 88, target: 90 },
    { department: 'IT', score: 78, target: 85 },
    { department: 'ECE', score: 89, target: 88 },
    { department: 'EEE', score: 75, target: 80 },
    { department: 'MECH', score: 70, target: 75 },
  ]);

  const [gapData, setGapData] = useState([
    { skill: 'React Frontend', studentAverage: 86, industryDemand: 92 },
    { skill: 'Node.js APIs', studentAverage: 82, industryDemand: 90 },
    { skill: 'System Design', studentAverage: 74, industryDemand: 88 },
    { skill: 'Python AI/ML', studentAverage: 89, industryDemand: 85 },
    { skill: 'Data Structures', studentAverage: 85, industryDemand: 95 },
  ]);

  useEffect(() => {
    api.get('/admin/analytics')
      .then(res => {
        if (res.data.departmentReadiness) setDepartmentData(res.data.departmentReadiness);
        if (res.data.skillGaps) setGapData(res.data.skillGaps);
      })
      .catch(console.error);
  }, []);

  return (
    <PageTransition className="space-y-6">
      <StaggerItem className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-1">
            <FiBarChart2 className="text-[var(--violet)]" />
            Institutional Analytics & Skill Predictability
          </h1>
          <p className="text-gray-600 font-medium">Cross-department SEG readiness radar metrics and industry skill gap predictability</p>
        </div>

        <NeuBadge variant="violet">Real-Time Data Feed</NeuBadge>
      </StaggerItem>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Radar Chart Card */}
        <StaggerItem>
          <NeuCard className="p-6 bg-white space-y-4 border-[3px] border-[var(--ink)] shadow-[4px_4px_0px_#000]">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FiPieChart className="text-[var(--electric)]" /> Department Readiness Comparison
            </h2>
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={departmentData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="department" tick={{ fill: '#111827', fontSize: 12, fontWeight: 'bold' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Student Readiness Score" dataKey="score" stroke="#4B3AFF" fill="#4B3AFF" fillOpacity={0.5} />
                  <Radar name="Target Benchmark" dataKey="target" stroke="#FF3D9A" fill="#FF3D9A" fillOpacity={0.2} />
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </NeuCard>
        </StaggerItem>

        {/* Bar Chart Card */}
        <StaggerItem>
          <NeuCard className="p-6 bg-white space-y-4 border-[3px] border-[var(--ink)] shadow-[4px_4px_0px_#000]">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FiBarChart2 className="text-[var(--hotpink)]" /> Industry Skill Gap Analysis
            </h2>
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gapData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="skill" tick={{ fill: '#111827', fontSize: 10, fontWeight: 'bold' }} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="studentAverage" name="Student Avg %" fill="#4B3AFF" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="industryDemand" name="Industry Demand %" fill="#2FE3A3" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </NeuCard>
        </StaggerItem>
      </div>
    </PageTransition>
  );
}
