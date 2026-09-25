import React from 'react';
import { motion } from 'framer-motion';

const defaultContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.06,
    },
  },
};

const defaultItemVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.75, // 0.6-0.8s duration
      ease: [0.16, 1, 0.3, 1], // Smooth fluid easeOut curve
    },
  },
};

export default function AnimatedGroup({
  children,
  className = '',
  variants = {},
}) {
  const container = variants.container || defaultContainerVariants;
  const item = variants.item || defaultItemVariants;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {React.Children.map(children, (child, idx) => {
        if (!React.isValidElement(child)) return child;
        return (
          <motion.div key={child.key || idx} variants={item}>
            {child}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
