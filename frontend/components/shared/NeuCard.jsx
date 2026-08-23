'use client';

import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function NeuCard({ children, className, hover = true, onClick, style }) {
  const Component = hover ? motion.div : 'div';
  const props = hover
    ? {
        whileHover: { y: -3, x: -3 },
        whileTap: onClick ? { y: 1, x: 1 } : undefined,
        transition: { type: 'spring', stiffness: 400, damping: 25 },
      }
    : {};

  const hasBg = className && className.includes('bg-');
  return (
    <Component
      className={clsx('neu-card', !hasBg && 'bg-[var(--paper)]', className)}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : undefined, ...style }}
      {...props}
    >
      {children}
    </Component>
  );
}

export function NeuCardStatic({ children, className, style }) {
  const hasBg = className && className.includes('bg-');
  return (
    <div className={clsx('neu-card-static', !hasBg && 'bg-[var(--paper)]', className)} style={style}>
      {children}
    </div>
  );
}

export function NeuCardFlat({ children, className, style }) {
  const hasBg = className && className.includes('bg-');
  return (
    <div className={clsx('neu-card-flat', !hasBg && 'bg-white', className)} style={style}>
      {children}
    </div>
  );
}
