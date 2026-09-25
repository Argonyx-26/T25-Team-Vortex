import React, { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DisclosureContext = createContext(null);

export function Disclosure({
  children,
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  className = '',
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const toggle = () => {
    const next = !isOpen;
    if (!isControlled) setUncontrolledOpen(next);
    if (onOpenChange) onOpenChange(next);
  };

  return (
    <DisclosureContext.Provider value={{ isOpen, toggle }}>
      <div className={className}>{children}</div>
    </DisclosureContext.Provider>
  );
}

export function DisclosureTrigger({ children, className = '' }) {
  const { toggle, isOpen } = useContext(DisclosureContext);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      }}
      className={`cursor-pointer select-none ${className}`}
      aria-expanded={isOpen}
    >
      {typeof children === 'function' ? children({ isOpen }) : children}
    </div>
  );
}

export function DisclosureContent({
  children,
  className = '',
  transition = { duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] },
}) {
  const { isOpen } = useContext(DisclosureContext);

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={transition}
          className={`overflow-hidden ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
