"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiBriefcase, FiMoreHorizontal, FiCalendar } from 'react-icons/fi';
import NeuCard from '@/components/shared/NeuCard';
import NeuButton from '@/components/shared/NeuButton';
import api from '@/lib/api';

export default function PlacementCommandCenterPage() {
  const [pipeline, setPipeline] = useState([]);
  const [loading, setLoading] = useState(true);

  const columns = [
    { id: 'upcoming', title: 'Upcoming Drives', color: 'var(--sky)' },
    { id: 'active', title: 'Active Drives', color: 'var(--electric)' },
    { id: 'completed', title: 'Completed', color: 'var(--mint)' }
  ];

  useEffect(() => {
    async function fetchDrives() {
      try {
        const { data } = await api.get('/admin/placement-cc');
        setPipeline(data.drives || []);
      } catch (error) {
        console.error("Failed to fetch placement pipeline:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDrives();
  }, []);

  // Simple local categorization based on a hypothetical status field or driveDate
  // For the sake of the UI layout matching the columns
  const categorizedDrives = {
    upcoming: pipeline.filter(d => new Date(d.driveDate) > new Date()),
    active: pipeline.filter(d => new Date(d.driveDate) <= new Date() && d.status !== 'completed'),
    completed: pipeline.filter(d => d.status === 'completed')
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
            <FiBriefcase className="text-[var(--violet)]" />
            Placement Command Center
          </h1>
          <p className="text-gray-600">Orchestrate recruiting drives and track placement pipelines.</p>
        </div>
        <NeuButton variant="violet">Configure New Drive</NeuButton>
      </div>

      <div className="grid md:grid-cols-3 gap-6 overflow-x-auto pb-4">
        {loading ? (
           <>
             {[1,2,3].map(i => <div key={i} className="h-[400px] bg-gray-200 rounded-[20px] animate-pulse border-[3px] border-[var(--ink)]"></div>)}
           </>
        ) : columns.map(col => (
          <div key={col.id} className="min-w-[300px] flex flex-col gap-4">
            <div 
              className="px-4 py-3 border-[3px] border-[var(--ink)] rounded-[14px] font-bold text-[var(--ink)] shadow-[4px_4px_0px_0px_var(--ink)]"
              style={{ backgroundColor: col.color }}
            >
              {col.title} ({categorizedDrives[col.id]?.length || 0})
            </div>
            
            <div className="space-y-4">
              {categorizedDrives[col.id]?.length > 0 ? categorizedDrives[col.id].map(drive => (
                <NeuCard key={drive._id} className="bg-white p-4 cursor-pointer hover:-translate-y-1 transition-transform relative">
                  <div className="absolute top-4 right-4 text-gray-400">
                    <FiMoreHorizontal />
                  </div>
                  <div className="mb-3">
                    <h4 className="font-bold text-lg leading-tight">{drive.company}</h4>
                    <p className="text-sm font-semibold opacity-60">{drive.roles?.[0]?.title || 'Various Roles'}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                     {drive.roles?.[0]?.requiredSkills?.slice(0,2).map(skill => (
                       <span key={skill} className="neu-badge bg-[var(--paper)]">{skill}</span>
                     ))}
                  </div>
                  <div className="flex items-center justify-between text-sm font-bold pt-3 border-t-2 border-[var(--ink)]/10">
                    <span className="flex items-center gap-1 text-gray-500">
                      <FiCalendar /> {new Date(drive.driveDate).toLocaleDateString()}
                    </span>
                    <span className={col.id === 'active' ? "text-[var(--electric)]" : "text-gray-500"}>
                      {drive.registrations?.length || 0} Registrations
                    </span>
                  </div>
                </NeuCard>
              )) : (
                <div className="text-center py-8 text-gray-400 font-bold border-2 border-dashed border-gray-300 rounded-xl">
                  No {col.title.toLowerCase()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
