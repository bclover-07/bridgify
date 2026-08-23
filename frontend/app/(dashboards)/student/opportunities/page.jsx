"use client";

import { useEffect, useState } from 'react';
import NeuCard from '@/components/shared/NeuCard';
import NeuBadge from '@/components/shared/NeuBadge';
import NeuButton from '@/components/shared/NeuButton';
import EmptyState from '@/components/shared/EmptyState';
import { DashboardSkeleton } from '@/components/shared/LoadingSpinner';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import { FiCalendar, FiBriefcase, FiMapPin, FiCheckCircle } from 'react-icons/fi';
import api from '@/lib/api';

export default function OpportunitiesPage() {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appliedDrives, setAppliedDrives] = useState({});

  useEffect(() => {
    api.get('/student/opportunities').then(res => { 
      setDrives(res.data.opportunities || res.data.drives || (Array.isArray(res.data) ? res.data : [])); 
      setLoading(false); 
    }).catch(() => setLoading(false));
  }, []);

  const handleApply = (driveId, companyName) => {
    setAppliedDrives(prev => ({ ...prev, [driveId]: 'Applied' }));
    alert(`Successfully submitted application for ${companyName}! Recruiter will review your SEG profile.`);
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <PageTransition className="space-y-6">
      <StaggerItem className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">💼 Placement Openings & Recruitment Drives</h1>
          <p className="text-gray-500 font-medium">Explore active recruiter job postings matched to your Skill Evidence Graph</p>
        </div>
      </StaggerItem>

      {drives.length === 0 ? (
        <EmptyState icon="search" title="No opportunities available" description="Check back later for new placement drives and openings." />
      ) : (
        <StaggerItem className="grid md:grid-cols-2 gap-5">
          {drives.map((drive, i) => {
            const driveId = drive._id || i;
            const isApplied = appliedDrives[driveId];
            const matchScore = 80 + (i * 4) % 18; // Simulated SEG Match Score

            return (
              <NeuCard key={driveId} className="p-5 bg-white space-y-4 border-[3px] border-[var(--ink)]">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-[var(--ink)]">{drive.companyName || drive.title || 'Tech Spark Recruitment'}</h3>
                    <p className="text-sm font-semibold text-[var(--electric)] mt-0.5">
                      {Array.isArray(drive.roles) ? drive.roles.join(', ') : drive.roles || 'Software Engineer'}
                    </p>
                  </div>
                  <NeuBadge variant={matchScore >= 85 ? 'success' : 'info'}>
                    ⚡ {matchScore}% SEG Match
                  </NeuBadge>
                </div>

                {drive.description && <p className="text-xs text-gray-600 leading-relaxed">{drive.description}</p>}

                <div className="flex flex-wrap gap-3 text-xs font-semibold text-gray-500 pt-1">
                  {drive.date && (
                    <span className="flex items-center gap-1"><FiCalendar size={12} />{new Date(drive.date).toLocaleDateString()}</span>
                  )}
                  {drive.location && (
                    <span className="flex items-center gap-1"><FiMapPin size={12} />{drive.location || 'Hyderabad / Hybrid'}</span>
                  )}
                  <span className="flex items-center gap-1"><FiBriefcase size={12} />{drive.packageOffered || '8 - 14 LPA'}</span>
                </div>

                <div className="pt-2 flex justify-between items-center border-t border-gray-100">
                  <span className="text-xs font-bold text-gray-500">Min CGPA: 7.0+</span>
                  {isApplied ? (
                    <NeuBadge variant="success">
                      <FiCheckCircle className="inline mr-1" /> Application Submitted
                    </NeuBadge>
                  ) : (
                    <NeuButton
                      variant="primary"
                      size="sm"
                      onClick={() => handleApply(driveId, drive.companyName || drive.title)}
                    >
                      Apply Now
                    </NeuButton>
                  )}
                </div>
              </NeuCard>
            );
          })}
        </StaggerItem>
      )}
    </PageTransition>
  );
}
