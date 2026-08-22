'use client';

import { motion } from 'framer-motion';

export default function LoadingSpinner({ text = 'Loading...', size = 'md' }) {
  const sizeMap = { sm: 'w-8 h-8', md: 'w-12 h-12', lg: 'w-16 h-16' };
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="relative">
        <motion.div
          className={`${sizeMap[size]} border-[4px] border-[var(--ink)] border-t-[var(--electric)] rounded-full`}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          style={{ boxShadow: '3px 3px 0px 0px var(--ink)' }}
        />
      </div>
      {text && <p className="font-bold text-gray-500 text-sm">{text}</p>}
    </div>
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-gray-200 rounded-[var(--radius-card)] animate-pulse border-[3px] border-gray-300 ${className}`} />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonCard className="h-20" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonCard className="h-28" />
        <SkeletonCard className="h-28" />
        <SkeletonCard className="h-28" />
        <SkeletonCard className="h-28" />
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <SkeletonCard className="h-64 md:col-span-2" />
        <SkeletonCard className="h-64" />
      </div>
    </div>
  );
}
