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

  return (
    <Component
      className={clsx('neu-card', className)}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : undefined, ...style }}
      {...props}
    >
      {children}
    </Component>
  );
}

export function NeuCardStatic({ children, className, style }) {
  return (
    <div className={clsx('neu-card-static', className)} style={style}>
      {children}
    </div>
  );
}

export function NeuCardFlat({ children, className, style }) {
  return (
    <div className={clsx('neu-card-flat', className)} style={style}>
      {children}
    </div>
  );
}
