import React from 'react';
import { motion } from 'framer-motion';

/**
 * InView motion component:
 * Animates smoothly into view and stays permanently visible.
 * Never resets to opacity: 0 during horizontal scroll navigation.
 */
export default function InView({
  children,
  variants,
  transition = { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  className = '',
  isActive, // Kept for API compatibility, but does not hide content
}) {
  const defaultVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants || defaultVariants}
      transition={transition}
      className={className}
    >
      {children}
    </motion.div>
  );
}
