"use client";

import { useState, useEffect } from 'react';
import NeuCard from '@/components/shared/NeuCard';
import NeuBadge from '@/components/shared/NeuBadge';
import EmptyState from '@/components/shared/EmptyState';
import { DashboardSkeleton } from '@/components/shared/LoadingSpinner';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import { FiTrendingUp } from 'react-icons/fi';
import api from '@/lib/api';

export default function LearningFeedPage() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/faculty/learning-feed')
      .then(res => setFeed(res.data.feed || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <PageTransition className="space-y-6">
      <StaggerItem>
        <h1 className="text-3xl md:text-4xl font-bold mb-1">📡 Learning Feed</h1>
        <p className="text-gray-500 font-medium">Real-time technology demands from recruiters</p>
      </StaggerItem>

      {feed.length === 0 ? (
        <EmptyState icon="search" title="No technology demands yet" description="Recruiters haven't posted any technology requirements yet." />
      ) : (
        <StaggerItem className="grid md:grid-cols-2 gap-4">
          {feed.map((item, i) => (
            <NeuCard key={item._id || i} className="p-5 bg-white">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl border-[3px] border-[var(--ink)] bg-[var(--sky)] text-white flex items-center justify-center shadow-[3px_3px_0px_0px_var(--ink)]">
                  <FiTrendingUp size={18} />
                </div>
                <NeuBadge variant={item.isActive ? 'success' : 'default'}>{item.isActive ? 'Active' : 'Inactive'}</NeuBadge>
              </div>
              <h3 className="font-bold text-lg mb-1">{item.technology || item.title || 'Technology'}</h3>
              <p className="text-sm text-gray-500 font-medium mb-2">{item.recruiterId?.recruiter?.company || item.recruiterId?.name || 'Company'}</p>
              {item.description && <p className="text-sm text-gray-600 mb-3">{item.description}</p>}
              {item.skillIds && (
                <div className="flex flex-wrap gap-1">
                  {(Array.isArray(item.skillIds) ? item.skillIds : []).map((s, si) => (
                    <NeuBadge key={si} variant="info">{s}</NeuBadge>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-3 font-semibold">
                Posted: {item.postedAt ? new Date(item.postedAt).toLocaleDateString() : 'N/A'}
              </p>
            </NeuCard>
          ))}
        </StaggerItem>
      )}
    </PageTransition>
  );
}
