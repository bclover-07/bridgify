'use client';

import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function SkillBar({ label, score = 0, maxScore = 100, color = 'electric', showValue = true, className = '' }) {
  const colors = {
    electric: 'bg-[var(--electric)]',
    acid: 'bg-[var(--acid)]',
    coral: 'bg-[var(--coral)]',
    mint: 'bg-[var(--mint)]',
    sky: 'bg-[var(--sky)]',
    violet: 'bg-[var(--violet)]',
    hotpink: 'bg-[var(--hotpink)]',
    amber: 'bg-[var(--amber)]',
  };

  const pct = Math.min(100, Math.max(0, (score / maxScore) * 100));

  return (
    <div className={clsx('flex flex-col gap-1', className)}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold truncate">{label}</span>
        {showValue && (
          <motion.span
            className="text-sm font-mono font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={score}
          >
            {Math.round(score)}%
          </motion.span>
        )}
      </div>
      <div className="skill-bar-track">
        <motion.div
          className={clsx('skill-bar-fill', colors[color] || colors.electric)}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
        />
      </div>
    </div>
  );
}
