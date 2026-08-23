"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiTrendingDown, FiAlertCircle, FiMap } from 'react-icons/fi';
import NeuCard from '@/components/shared/NeuCard';
import api from '@/lib/api';

export default function CohortHeatmapPage() {
  const [department, setDepartment] = useState('CS');
  const [semester, setSemester] = useState('6');
  const [riskData, setRiskData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRadar() {
      setLoading(true);
      try {
        const { data } = await api.get('/faculty/dropout-radar');
        const list = data.risks || (data.students || []).map(s => ({
          ...s,
          riskScore: s.riskScore || (s.riskLevel === 'HIGH' ? 85 : s.riskLevel === 'MEDIUM' ? 55 : 20)
        }));
        setRiskData(list);
      } catch (error) {
        console.error("Failed to load dropout radar:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRadar();
  }, [department, semester]); // Re-fetch if backend supports filtering by these

  const highRiskStudents = riskData.filter(r => r.riskScore > 75).slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
            <FiMap className="text-[var(--coral)]" />
            Dropout Radar (Cohort Heatmap)
          </h1>
          <p className="text-gray-600">Identify at-risk students through multi-modal progression tracking.</p>
        </div>
        <div className="flex gap-3">
          <select 
            className="neu-select w-32"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="CS">Computer Science</option>
            <option value="IT">Information Tech</option>
            <option value="EC">Electronics</option>
          </select>
          <select 
            className="neu-select w-32"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          >
            <option value="5">Semester 5</option>
            <option value="6">Semester 6</option>
            <option value="7">Semester 7</option>
          </select>
        </div>
      </div>

      <NeuCard className="p-0 bg-white">
        <div className="p-6 border-b-[3px] border-[var(--ink)] bg-[var(--paper)]">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Predictive Risk Matrix</h2>
            <div className="flex gap-4 text-sm font-bold">
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[var(--mint)] border-2 border-[var(--ink)]"></span> Low Risk</span>
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[var(--amber)] border-2 border-[var(--ink)]"></span> Medium Risk</span>
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[var(--coral)] border-2 border-[var(--ink)]"></span> High Risk</span>
            </div>
          </div>
        </div>
        <div className="p-8 flex items-center justify-center min-h-[400px] relative">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
          {loading ? (
             <div className="z-10 font-bold text-xl animate-pulse">Loading predictive models...</div>
          ) : (
            <div className="text-center z-10 w-full max-w-4xl">
              {riskData.length > 0 ? (
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                   {riskData.map(student => (
                     <div 
                       key={student.studentId}
                       className="p-3 border-2 border-[var(--ink)] rounded-xl bg-white shadow-[2px_2px_0px_0px_var(--ink)] flex flex-col items-center justify-center gap-2"
                       style={{
                         backgroundColor: student.riskScore > 75 ? 'var(--coral)' : (student.riskScore > 40 ? 'var(--amber)' : 'var(--mint)'),
                         color: student.riskScore > 75 ? 'white' : 'var(--ink)'
                       }}
                     >
                        <span className="font-bold text-xs truncate w-full text-center">{student.name || 'Student'}</span>
                        <span className="font-mono text-sm">{student.riskScore.toFixed(0)}%</span>
                     </div>
                   ))}
                 </div>
              ) : (
                <>
                  <FiAlertCircle size={48} className="mx-auto text-[var(--amber)] mb-4" />
                  <h3 className="text-xl font-bold mb-2">No Risk Data Found</h3>
                  <p className="text-gray-600 max-w-sm mx-auto">The dropout radar has not identified any students matching this criteria yet.</p>
                </>
              )}
            </div>
          )}
        </div>
      </NeuCard>

      <div className="grid md:grid-cols-2 gap-6">
        <NeuCard className="bg-[var(--coral)] text-white">
          <h3 className="text-xl font-bold mb-4">High Risk Cohort (Top 5)</h3>
          {highRiskStudents.length > 0 ? (
            <ul className="space-y-3">
              {highRiskStudents.map(student => (
                <li key={student.studentId} className="flex justify-between items-center bg-white/10 p-3 border-2 border-[var(--ink)] rounded-xl">
                  <span className="font-bold truncate max-w-[200px]">{student.name || `Student ID: ${student.studentId}`}</span>
                  <span className="font-mono bg-[var(--ink)] text-[var(--coral)] px-2 py-1 rounded-md text-sm">{student.riskScore.toFixed(0)}% Risk</span>
                </li>
              ))}
            </ul>
          ) : (
             <p className="font-semibold italic opacity-80">No students are currently classified as high risk.</p>
          )}
        </NeuCard>
        
        <NeuCard className="bg-[var(--mint)] text-[var(--ink)]">
          <h3 className="text-xl font-bold mb-4">Intervention Success</h3>
          <div className="flex items-end gap-2 text-5xl font-bold font-mono">
            +14%
            <span className="text-sm font-sans mb-1">Retention</span>
          </div>
          <p className="mt-4 font-semibold opacity-80">Since last semester following AI-guided remediation paths.</p>
        </NeuCard>
      </div>
    </div>
  );
}
