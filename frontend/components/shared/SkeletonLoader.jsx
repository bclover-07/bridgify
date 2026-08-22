'use client';

export default function SkeletonLoader({ variant = 'card', count = 1, className = '' }) {
  const variants = {
    card: (
      <div className="neu-card-static p-6 space-y-4">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-5/6 rounded" />
        <div className="flex gap-2 mt-4">
          <div className="skeleton h-8 w-20 rounded" />
          <div className="skeleton h-8 w-16 rounded" />
        </div>
      </div>
    ),
    stat: (
      <div className="neu-card-static p-4 space-y-2">
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-8 w-3/4 rounded" />
      </div>
    ),
    table: (
      <div className="space-y-3">
        <div className="skeleton h-10 w-full rounded" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton h-8 w-full rounded" />
        ))}
      </div>
    ),
    text: (
      <div className="space-y-2">
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-5/6 rounded" />
        <div className="skeleton h-4 w-4/6 rounded" />
      </div>
    ),
    avatar: (
      <div className="flex items-center gap-3">
        <div className="skeleton h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <div className="skeleton h-4 w-1/3 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
        </div>
      </div>
    ),
  };

  return (
    <div className={className}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className={count > 1 ? 'mb-4' : ''}>
          {variants[variant] || variants.card}
        </div>
      ))}
    </div>
  );
}
