"use client";

import { motion } from 'framer-motion';
import { FiPieChart } from 'react-icons/fi';
import NeuCard from '@/components/shared/NeuCard';

export default function InstitutionalAnalyticsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
          <FiPieChart className="text-[var(--mint)]" />
          Institutional Analytics
        </h1>
        <p className="text-gray-600">Cross-department skill metrics and placement predictability graphs.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <NeuCard className="bg-white min-h-[400px] flex flex-col justify-center items-center text-center p-8">
          <FiPieChart size={64} className="text-gray-200 mb-4" />
          <h3 className="text-xl font-bold mb-2">Department Readiness Comparison</h3>
          <p className="text-gray-500">Recharts Radar Chart integrating real-time SEG averages will load here.</p>
        </NeuCard>
        
        <NeuCard className="bg-white min-h-[400px] flex flex-col justify-center items-center text-center p-8">
           <FiPieChart size={64} className="text-gray-200 mb-4" />
           <h3 className="text-xl font-bold mb-2">Skill Gap Analysis</h3>
           <p className="text-gray-500">Recharts Bar Chart mapping institutional gaps vs industry demand.</p>
        </NeuCard>
      </div>
    </div>
  );
}
