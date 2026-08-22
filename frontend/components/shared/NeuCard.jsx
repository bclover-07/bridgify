'use client';

import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function NeuCard({ 
  children, 
  className = '', 
  accent,
  hoverable = true,
  padding = 'p-6',
  onClick,
  ...props 
}) {
  const accentBg = {
    electric: 'bg-[var(--electric)]',
    acid: 'bg-[var(--acid)]',
    coral: 'bg-[var(--coral)]',
    mint: 'bg-[var(--mint)]',
    sky: 'bg-[var(--sky)]',
    violet: 'bg-[var(--violet)]',
    hotpink: 'bg-[var(--hotpink)]',
    amber: 'bg-[var(--amber)]',
  };

  return (
    <motion.div
      className={clsx(
        hoverable ? 'neu-card' : 'neu-card-static',
        padding,
        accent && accentBg[accent],
        onClick && 'cursor-pointer',
        className
      )}
      whileHover={hoverable ? { y: -2, x: -2 } : undefined}
      whileTap={onClick ? { y: 2, x: 2 } : undefined}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
}
