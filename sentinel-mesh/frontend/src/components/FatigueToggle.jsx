import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Flame, Shield, AlertTriangle } from 'lucide-react';

/**
 * Skiper UI-adapted theme-toggle-animations component,
 * re-skinned for "Operator load: Normal / High".
 */
export default function FatigueToggle({
  operatorLoad = 'normal', // 'normal' | 'high'
  onChange,
}) {
  const isHigh = operatorLoad === 'high';

  const handleToggle = (mode) => {
    if (onChange && mode !== operatorLoad) {
      onChange(mode);
    }
  };

  return (
    <div className="flex items-center gap-3 bg-zinc-900/90 border border-zinc-800 p-1.5 px-3 rounded-full backdrop-blur-md shadow-lg">
      <span className="text-xs font-mono font-medium text-zinc-400 select-none hidden sm:inline-block">
        Operator load:
      </span>

      <div className="relative flex items-center bg-zinc-950/80 p-1 rounded-full border border-zinc-800/80">
        {/* Normal Option */}
        <button
          type="button"
          onClick={() => handleToggle('normal')}
          className={`relative z-10 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold transition-colors duration-200 select-none ${
            !isHigh ? 'text-emerald-300' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <motion.div
            animate={{ rotate: !isHigh ? 0 : -20, scale: !isHigh ? 1 : 0.85 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Shield className="w-3.5 h-3.5" />
          </motion.div>
          <span>Normal</span>
        </button>

        {/* High Option */}
        <button
          type="button"
          onClick={() => handleToggle('high')}
          className={`relative z-10 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold transition-colors duration-200 select-none ${
            isHigh ? 'text-rose-200' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <motion.div
            animate={{
              rotate: isHigh ? [0, -10, 10, -10, 0] : 0,
              scale: isHigh ? 1.1 : 0.85,
            }}
            transition={{
              rotate: { repeat: isHigh ? Infinity : 0, duration: 2, ease: 'easeInOut' },
              scale: { type: 'spring', stiffness: 300, damping: 20 },
            }}
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
          </motion.div>
          <span>High</span>
        </button>

        {/* Animated Sliding Capsule Thumb (Skiper UI style) */}
        <motion.div
          layout
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
          }}
          className={`absolute top-1 bottom-1 rounded-full shadow-md ${
            isHigh
              ? 'right-1 w-[82px] bg-gradient-to-r from-rose-950 to-rose-900 border border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
              : 'left-1 w-[92px] bg-gradient-to-r from-zinc-800 to-zinc-700/80 border border-zinc-600/50 shadow-sm'
          }`}
        />
      </div>

      {/* Pulse Beacon Indicator */}
      <div className="flex items-center pl-1">
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isHigh ? 'bg-rose-400' : 'bg-emerald-400'
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isHigh ? 'bg-rose-500' : 'bg-emerald-500'
            }`}
          />
        </span>
      </div>
    </div>
  );
}
