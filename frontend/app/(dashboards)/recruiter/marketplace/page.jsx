"use client";

import { useState, useEffect } from 'react';
import NeuCard from '@/components/shared/NeuCard';
import NeuButton from '@/components/shared/NeuButton';
import NeuBadge from '@/components/shared/NeuBadge';
import { DashboardSkeleton } from '@/components/shared/LoadingSpinner';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import { FiGlobe, FiCode, FiEye } from 'react-icons/fi';
import api from '@/lib/api';

export default function MarketplacePage() {
  const [problemStatements, setProblemStatements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/recruiter/marketplace')
      .then(res => {
        setProblemStatements(res.data.problemStatements || []);
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Failed to load marketplace');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <PageTransition>
      <div className="space-y-6">
        <StaggerItem>
          <div>
            <h1 className="text-3xl md:text-4xl font-black flex items-center gap-3">
              <span className="w-12 h-12 rounded-2xl bg-[var(--electric)] border-[4px] border-[var(--ink)] flex items-center justify-center shadow-[4px_4px_0px_0px_var(--ink)]">
                <FiGlobe className="text-white" size={22} />
              </span>
              Problem Statement Marketplace
            </h1>
            <p className="text-gray-500 font-semibold mt-1">Discover published problem statements from recruiters across the platform</p>
          </div>
        </StaggerItem>

        {error && (
          <StaggerItem>
            <NeuCard className="p-4 bg-red-50 border-[var(--coral)]">
              <p className="text-[var(--coral)] font-bold">⚠️ {error}</p>
            </NeuCard>
          </StaggerItem>
        )}

        <StaggerItem>
          {problemStatements.length === 0 ? (
            <NeuCard className="p-10 text-center flex flex-col items-center justify-center">
              <div className="w-24 h-24 mb-4 rounded-full bg-gray-100 border-[3px] border-[var(--ink)] flex items-center justify-center shadow-[4px_4px_0px_0px_var(--ink)]">
                <FiGlobe size={40} className="text-gray-400" />
              </div>
              <h2 className="text-2xl font-black mb-2">Marketplace is Empty</h2>
              <p className="text-gray-500 font-medium">No published problem statements available at the moment.</p>
            </NeuCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {problemStatements.map((ps, index) => (
                <NeuCard key={ps.id || index} className="p-5 flex flex-col h-full group hover:-translate-y-2 transition-transform duration-300">
                  <div className="flex justify-between items-start mb-3">
                    <NeuBadge variant="success" className="text-xs py-1">
                      Published
                    </NeuBadge>
                    {ps.company && (
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{ps.company}</span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-[var(--electric)] transition-colors">{ps.title}</h3>
                  <p className="text-sm text-gray-600 font-medium line-clamp-3 mb-4 flex-grow">
                    {ps.description}
                  </p>
                  
                  {ps.skills && ps.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {ps.skills.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="text-xs font-bold px-2 py-1 bg-gray-100 border-[2px] border-[var(--ink)] rounded-lg">
                          {typeof skill === 'string' ? skill : skill.label || skill.name}
                        </span>
                      ))}
                      {ps.skills.length > 3 && (
                        <span className="text-xs font-bold px-2 py-1 bg-gray-100 border-[2px] border-[var(--ink)] rounded-lg">
                          +{ps.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="pt-4 border-t-2 border-dashed border-gray-200 mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-bold text-[var(--electric)]">
                      <FiCode /> {ps.difficulty || 'Intermediate'}
                    </div>
                    <NeuButton variant="ghost" size="sm" className="px-2 py-1 h-auto text-xs">
                      <FiEye className="mr-1" /> View Details
                    </NeuButton>
                  </div>
                </NeuCard>
              ))}
            </div>
          )}
        </StaggerItem>
      </div>
    </PageTransition>
  );
}
