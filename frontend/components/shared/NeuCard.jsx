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
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={hoverable ? { scale: 1.02, y: -4, x: -4, boxShadow: '8px 8px 0px 0px var(--ink)' } : undefined}
      whileTap={onClick ? { scale: 0.98, y: 0, x: 0, boxShadow: '0px 0px 0px 0px var(--ink)' } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
}
