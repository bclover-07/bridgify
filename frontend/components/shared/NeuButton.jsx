'use client';

import { motion } from 'framer-motion';
import clsx from 'clsx';

const variantMap = {
  primary: 'neu-btn-primary',
  acid: 'neu-btn-acid',
  coral: 'neu-btn-coral',
  mint: 'neu-btn-mint',
  sky: 'neu-btn-sky',
  violet: 'neu-btn-violet',
  hotpink: 'neu-btn-hotpink',
  amber: 'neu-btn-amber',
  ghost: 'neu-btn-ghost',
  white: 'neu-btn-white',
  danger: 'neu-btn-danger',
};

const sizeMap = {
  xs: 'neu-btn-xs',
  sm: 'neu-btn-sm',
  md: '',
  lg: 'neu-btn-lg',
  icon: 'neu-btn-icon',
};

export default function NeuButton({
  children,
  variant = 'primary',
  size = 'md',
  className,
  loading = false,
  disabled = false,
  icon: Icon,
  iconRight: IconRight,
  type = 'button',
  onClick,
  ...props
}) {
  return (
    <motion.button
      type={type}
      className={clsx(
        'neu-btn',
        variantMap[variant],
        sizeMap[size],
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
      whileTap={!disabled && !loading ? { scale: 0.95 } : undefined}
      {...props}
    >
      {loading ? (
        <>
          <span className="inline-block w-4 h-4 border-3 border-current border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && <Icon size={size === 'xs' ? 14 : size === 'sm' ? 16 : 18} />}
          {children}
          {IconRight && <IconRight size={size === 'xs' ? 14 : size === 'sm' ? 16 : 18} />}
        </>
      )}
    </motion.button>
  );
}
