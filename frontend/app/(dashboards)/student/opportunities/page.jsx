"use client";

import { useEffect, useState } from 'react';
import NeuCard from '@/components/shared/NeuCard';
import NeuBadge from '@/components/shared/NeuBadge';
import EmptyState from '@/components/shared/EmptyState';
import { DashboardSkeleton } from '@/components/shared/LoadingSpinner';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import { FiCalendar, FiBriefcase, FiMapPin } from 'react-icons/fi';
import api from '@/lib/api';

export default function OpportunitiesPage() {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/opportunities').then(res => { 
      setDrives(res.data.opportunities || res.data.drives || (Array.isArray(res.data) ? res.data : [])); 
      setLoading(false); 
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <PageTransition className="space-y-6">
      <StaggerItem>
        <h1 className="text-3xl font-bold mb-1">🔍 Opportunities</h1>
        <p className="text-gray-500 font-medium">Upcoming placement drives and openings</p>
      </StaggerItem>

      {drives.length === 0 ? (
        <EmptyState icon="search" title="No opportunities available" description="Check back later for new placement drives and openings." />
      ) : (
        <StaggerItem className="grid md:grid-cols-2 gap-5">
          {drives.map((drive, i) => (
            <NeuCard key={drive._id || i} className="p-5 bg-white group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold">{drive.companyName || drive.title || 'Placement Drive'}</h3>
                  {drive.roles && <p className="text-sm text-gray-500 font-medium mt-1">{Array.isArray(drive.roles) ? drive.roles.join(', ') : drive.roles}</p>}
                </div>
                <NeuBadge variant={drive.status === 'active' ? 'success' : drive.status === 'upcoming' ? 'info' : 'default'}>
                  {drive.status || 'Open'}
                </NeuBadge>
              </div>
              {drive.description && <p className="text-sm text-gray-600 mb-3">{drive.description}</p>}
              <div className="flex flex-wrap gap-3 text-xs font-semibold text-gray-500">
                {drive.date && (
                  <span className="flex items-center gap-1"><FiCalendar size={12} />{new Date(drive.date).toLocaleDateString()}</span>
                )}
                {drive.location && (
                  <span className="flex items-center gap-1"><FiMapPin size={12} />{drive.location}</span>
                )}
                {drive.packageOffered && (
                  <span className="flex items-center gap-1"><FiBriefcase size={12} />{drive.packageOffered}</span>
                )}
              </div>
            </NeuCard>
          ))}
        </StaggerItem>
      )}
    </PageTransition>
  );
}
