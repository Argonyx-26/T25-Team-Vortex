import React, { useEffect, useState } from 'react';
import { Activity, Radio, Shield, Zap } from 'lucide-react';

/**
 * ScrollFloat
 * Floating HUD telemetry status dock that adapts position and values based on scroll depth.
 * Shows real backend ping latency, buffer status, and socket link status.
 */
export default function ScrollFloat({ latency, eventCount, flaggedCount, incidentCount, socketConnected }) {
  const [scrollY, setScrollY] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Float calculations
  const isScrolled = scrollY > 120;

  return (
    <div
      className={`fixed bottom-6 right-6 z-40 transition-all duration-300 ${
        isScrolled ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-2 opacity-90 scale-95'
      }`}
    >
      <div className="border border-cyan-900/60 bg-[#070b14]/90 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.6)] px-3 py-2 text-xs font-mono text-slate-300 flex items-center gap-3">
        {/* Socket Link Status */}
        <div className="flex items-center gap-1.5 border-r border-slate-800 pr-3">
          <span
            className={`w-2 h-2 ${
              socketConnected ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-amber-400'
            }`}
          />
          <span className="text-[11px] text-slate-400 tracking-wider">
            {socketConnected ? 'WS:LIVE' : 'WS:POLL'}
          </span>
        </div>

        {/* Latency metric */}
        <div className="flex items-center gap-1 border-r border-slate-800 pr-3">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-cyan-300 font-semibold">{latency != null ? `${latency}ms` : '--'}</span>
        </div>

        {/* Quick telemetry counter */}
        <div className="hidden sm:flex items-center gap-3 border-r border-slate-800 pr-3">
          <div>
            <span className="text-slate-500 text-[10px]">EVT:</span>
            <span className="text-slate-200 ml-1 font-semibold">{eventCount ?? 0}</span>
          </div>
          <div>
            <span className="text-amber-500 text-[10px]">FLG:</span>
            <span className="text-amber-300 ml-1 font-semibold">{flaggedCount ?? 0}</span>
          </div>
          <div>
            <span className="text-rose-500 text-[10px]">INC:</span>
            <span className="text-rose-400 ml-1 font-semibold">{incidentCount ?? 0}</span>
          </div>
        </div>

        {/* Mini Trigger button */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="px-2 py-1 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-700/50 text-cyan-300 text-[10px] tracking-wider transition-colors cursor-pointer"
          title="Scroll to Top"
        >
          TOP ^
        </button>
      </div>
    </div>
  );
}
