'use client';

import { FiInbox } from 'react-icons/fi';
import clsx from 'clsx';

export default function EmptyState({ 
  icon: Icon = FiInbox, 
  title = 'No data yet', 
  description = 'Data will appear here once available.',
  action,
  className = '' 
}) {
  return (
    <div className={clsx(
      'flex flex-col items-center justify-center py-16 px-6 text-center',
      className
    )}>
      <div className="w-16 h-16 rounded-full bg-[var(--acid)] border-[3px] border-[var(--ink)] flex items-center justify-center mb-4" style={{ boxShadow: 'var(--shadow-brutal-sm)' }}>
        <Icon size={28} className="text-[var(--ink)]" />
      </div>
      <h3 className="text-lg font-bold mb-1">{title}</h3>
      <p className="text-sm opacity-60 max-w-sm mb-4">{description}</p>
      {action && action}
    </div>
  );
}
