'use client';

import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function NeuButton({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '', 
  disabled = false,
  loading = false,
  icon: Icon,
  onClick,
  type = 'button',
  ...props 
}) {
  const variants = {
    primary: 'neu-btn-primary',
    acid: 'neu-btn-acid',
    coral: 'neu-btn-coral',
    mint: 'neu-btn-mint',
    sky: 'neu-btn-sky',
    violet: 'neu-btn-violet',
    hotpink: 'neu-btn-hotpink',
    ghost: 'neu-btn-ghost',
  };

  const sizes = {
    sm: 'neu-btn-sm',
    md: '',
    lg: 'neu-btn-lg',
  };

  return (
    <motion.button
      type={type}
      className={clsx(
        'neu-btn',
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      whileHover={!disabled ? { scale: 1.05, y: -4, x: -4, boxShadow: '8px 8px 0px 0px var(--ink)' } : undefined}
      whileTap={!disabled ? { scale: 0.95, y: 0, x: 0, boxShadow: '0px 0px 0px 0px var(--ink)' } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <motion.div
          className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      ) : (
        <>
          {Icon && <Icon size={18} />}
          {children}
        </>
      )}
    </motion.button>
  );
}
