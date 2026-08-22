'use client';

import clsx from 'clsx';

const variantStyles = {
  default: 'bg-gray-100 text-gray-700',
  primary: 'bg-[var(--electric)] text-white',
  success: 'bg-[var(--mint)] text-[var(--ink)]',
  warning: 'bg-[var(--amber)] text-[var(--ink)]',
  danger: 'bg-[var(--coral)] text-white',
  info: 'bg-[var(--sky)] text-[var(--ink)]',
  purple: 'bg-[var(--violet)] text-white',
  pink: 'bg-[var(--hotpink)] text-white',
  acid: 'bg-[var(--acid)] text-[var(--ink)]',
};

export default function NeuBadge({ children, variant = 'default', dot = false, pulse = false, className }) {
  return (
    <span className={clsx('neu-badge', variantStyles[variant], className)}>
      {dot && (
        <span className="relative flex h-2 w-2">
          {pulse && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />}
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
        </span>
      )}
      {children}
    </span>
  );
}
