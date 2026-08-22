'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useRef } from 'react';

export default function AnimatedCounter({ value = 0, suffix = '', prefix = '', duration = 1.5, className = '' }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const displayRef = useRef(null);

  useEffect(() => {
    const controls = animate(count, value, {
      duration,
      ease: [0.34, 1.56, 0.64, 1],
    });

    const unsubscribe = rounded.on('change', (v) => {
      if (displayRef.current) {
        displayRef.current.textContent = `${prefix}${v}${suffix}`;
      }
    });

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value, count, rounded, duration, prefix, suffix]);

  return (
    <motion.span
      ref={displayRef}
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {prefix}0{suffix}
    </motion.span>
  );
}
