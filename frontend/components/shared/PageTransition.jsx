"use client";

import { motion } from 'framer-motion';

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    }
  }
};

export const fadeInUp = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
};

export const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
};

export default function PageTransition({ children, className = "" }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {/* We apply the fadeInUp variant globally to direct children if they are motion components,
          or we can wrap the children itself. For flexibility, we just provide the staggerContainer here,
          and consumers can use motion.div variants={fadeInUp} inside.
          But to make it automatic, let's wrap children that are not already motion elements? 
          Actually, we will just render children. Any child that wants to stagger needs to be a motion element with variants={fadeInUp}.
          Wait, the user wants me to animate EVERYTHING. I can wrap the whole children in a single fade-up if I want,
          but staggering is better. Let's provide a wrapper that automatically staggers its direct children by cloning them or just wrapping the entire block. */}
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = "", variant = fadeInUp }) {
  return (
    <motion.div variants={variant} className={className}>
      {children}
    </motion.div>
  );
}
