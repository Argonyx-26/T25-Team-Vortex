import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export default function ScrollProgress({
  progress = 0, // 0 to 1
  totalPanels = 6,
  activePanel = 0,
  onSelectPanel,
  className = '',
}) {
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2.5 ${className}`}>
      {/* Progress pill container */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-950/80 border border-zinc-800/90 backdrop-blur-xl shadow-2xl">
        {/* Step dots */}
        {Array.from({ length: totalPanels }).map((_, idx) => {
          const isActive = idx === activePanel;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPanel && onSelectPanel(idx)}
              className="group relative flex items-center justify-center p-1 cursor-pointer transition-transform"
              title={`Jump to Panel ${idx + 1}`}
            >
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'w-7 bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]'
                    : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                }`}
              />
            </button>
          );
        })}

        {/* Panel number indicator */}
        <span className="ml-2 pl-2 border-l border-zinc-800 text-[11px] font-mono text-zinc-400">
          <strong className="text-cyan-400">{activePanel + 1}</strong>
          <span className="text-zinc-600"> / </span>
          {totalPanels}
        </span>
      </div>

      {/* Thin overall progress bar across bottom */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-zinc-900/60 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-rose-500"
          style={{
            width: `${Math.min(Math.max(progress * 100, 0), 100)}%`,
          }}
          transition={{ ease: 'easeOut', duration: 0.1 }}
        />
      </div>
    </div>
  );
}
