import React from 'react';
import { motion } from 'framer-motion';
import { GitMerge, ShieldAlert, Cpu, ArrowRight, CheckCircle2, Zap, Radio } from 'lucide-react';
import InView from '../motion-primitives/InView';
import BorderTrail from '../motion-primitives/BorderTrail';
import { exampleEvents, exampleIncident } from '../../data/mockData';

export default function PanelFusionAnimation({
  isActive = true,
  events = exampleEvents,
  incident = exampleIncident,
}) {
  const currentIncident = incident || exampleIncident;
  const linkedEventIds = currentIncident?.linked_event_ids || [];
  const candidateEvents = (events || []).filter((e) =>
    linkedEventIds.length > 0 ? linkedEventIds.includes(e.event_id) : e.flagged
  );
  const displayEvents = candidateEvents.length > 0 ? candidateEvents.slice(0, 3) : exampleEvents.filter(e => e.flagged).slice(0, 3);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col justify-center px-4 py-8">
      <InView>
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/50 text-cyan-300 font-mono text-xs mb-2">
            <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
            <span>Panel 04 • Autonomous Synthesis Arena</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold font-mono text-white">
            Multi-Stream Fusion Engine <span className="text-cyan-400">Convergence</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-mono max-w-2xl mx-auto mt-1">
            Independent telemetry streams converge across identity and spatiotemporal axes into a unified incident.
          </p>
        </div>
      </InView>

      {/* Interactive Visual Convergence Arena */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Source Stream Signals (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            Disparate Raw Streams ({displayEvents.length} Signals)
          </span>

          {displayEvents.map((evt, idx) => (
            <motion.div
              key={evt.event_id}
              initial={{ x: -15, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 * (idx + 1), duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="p-3.5 rounded-xl bg-[#0a0e1a]/95 border border-slate-800 text-xs font-mono shadow-lg flex items-center justify-between group hover:border-cyan-500/40 transition-all hover:scale-[1.01]"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                    {evt.source.toUpperCase()}
                  </span>
                  <span className="font-semibold text-slate-200">
                    {evt.event_type.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Entity: <span className="text-rose-300 font-bold">{evt.entity?.id}</span> • {evt.location || 'Remote'}
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-slate-800/70 border border-slate-700/60 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-950 group-hover:border-cyan-500 transition-colors">
                <ArrowRight className="w-4 h-4 animate-pulse" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Center: Fusion Engine Synthesis Hub (3 cols) with orbital animations */}
        <div className="lg:col-span-3 flex flex-col items-center justify-center p-4">
          <div className="relative flex items-center justify-center w-40 h-40">
            {/* Outer Orbit Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 16, ease: 'linear' }}
              className="absolute inset-0 rounded-full border border-dashed border-cyan-500/30"
            />
            {/* Inner Counter Orbit Ring */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
              className="absolute inset-3 rounded-full border border-dotted border-purple-500/30"
            />
            {/* Pulsing Core Aura */}
            <div className="absolute inset-6 rounded-full bg-cyan-950/40 border border-cyan-500/40 animate-pulse shadow-[0_0_30px_rgba(6,182,212,0.25)]" />

            <div className="relative z-10 flex flex-col items-center justify-center text-center">
              <GitMerge className="w-8 h-8 text-cyan-300 animate-bounce" />
              <span className="text-[10px] font-mono font-black text-cyan-200 tracking-wider uppercase mt-1">
                FUSION CORE
              </span>
              <span className="text-[8px] font-mono text-cyan-400/80">
                TEMPORAL CORRELATION
              </span>
            </div>
          </div>

          <div className="mt-3 text-center space-y-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/70 text-cyan-300 border border-cyan-800/60 text-[10px] font-mono font-bold inline-flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              MATCH: {currentIncident?.correlation_reason?.replace(/_/g, ' ').toUpperCase() || 'SAME ENTITY + LOCATION'}
            </span>
            <p className="text-[11px] font-mono text-slate-400">
              Correlating {currentIncident?.linked_event_ids?.length || 3} signals into 1 threat
            </p>
          </div>
        </div>

        {/* Right Column: Fused Incident Output with Border Trail (5 cols) */}
        <div className="lg:col-span-5">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5 px-1 mb-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            Fused Output Incident
          </span>

          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative p-5 rounded-2xl bg-[#0a0e1a]/95 border border-slate-800/90 shadow-2xl overflow-hidden backdrop-blur-xl"
            style={{ position: 'relative', overflow: 'hidden' }}
          >
            {/* 1. Atmospheric Ambient Radial Glow behind the card (z-index: 0, ~13% opacity) */}
            <div
              className="pointer-events-none absolute inset-0 transition-opacity duration-500"
              style={{
                zIndex: 0,
                background: 'radial-gradient(ellipse at 50% 0%, rgba(244, 63, 94, 0.13) 0%, rgba(10, 14, 26, 0) 70%)',
              }}
              aria-hidden="true"
            />

            {/* 2. Motion Primitives Border Trail strictly along border outline at z-index: 0 */}
            <BorderTrail color="#f43f5e" duration={4} strokeWidth={2} rx={16} />

            {/* 3. Card Content: Strictly elevated to relative z-index: 10 */}
            <div className="relative" style={{ position: 'relative', zIndex: 10 }}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  <span className="font-mono text-sm font-bold text-white uppercase">
                    {currentIncident.incident_id}
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/15 text-rose-300 border border-rose-500/40">
                  {currentIncident.severity?.toUpperCase() || 'CRITICAL'} FUSION
                </span>
              </div>

              <div className="py-3 text-xs font-mono text-slate-300 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Correlation Reason:</span>
                  <span className="text-cyan-300 font-bold">{currentIncident.correlation_reason}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Primary Entity:</span>
                  <span className="text-white font-bold">{currentIncident.primary_entity?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Matched Pattern:</span>
                  <span className="text-amber-300 font-bold">{currentIncident.matched_attack_pattern || 'recon_then_brute_force'}</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 font-mono border-t border-slate-800/80 pt-2.5 line-clamp-3 leading-relaxed">
                {currentIncident.summary || 'Awaiting automated synthesis from backend...'}
              </p>

              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {currentIncident.linked_event_ids?.length || 3} Events Linked
                </span>
                <span className="text-slate-500">
                  Confidence: {currentIncident.confidence != null ? Math.round(currentIncident.confidence * 100) : 82}%
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
