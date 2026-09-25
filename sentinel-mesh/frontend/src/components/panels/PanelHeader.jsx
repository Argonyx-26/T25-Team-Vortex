import React from 'react';
import { Camera, ShieldCheck, Wifi, Activity, Zap, ChevronRight, Server, CheckCircle2 } from 'lucide-react';
import AnimatedNumber from '../motion-primitives/AnimatedNumber';
import InView from '../motion-primitives/InView';

export default function PanelHeader({
  isActive = true,
  onNext,
  eventsCount = 3,
  incidentsCount = 1,
  isLiveBackend = false,
}) {
  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center text-center space-y-8 px-4">
      <InView isActive={isActive}>
        {/* System Sub-badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-xs font-mono mb-4 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>SENTINELMESH AUTONOMOUS FUSION ENGINE • v2.4 ONLINE</span>
          <span className="mx-1 text-slate-600">|</span>
          <span className={`flex items-center gap-1 font-bold ${isLiveBackend ? 'text-emerald-400' : 'text-amber-400'}`}>
            <Server className="w-3 h-3" />
            {isLiveBackend ? 'FASTAPI BACKEND: CONNECTED' : 'DEMO MODE: ACTIVE'}
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-black font-mono tracking-tight text-white uppercase">
          Autonomous <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">Multi-Stream</span> Threat Correlation
        </h1>

        <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto font-mono leading-relaxed">
          Ingesting continuous asynchronous telemetry streams across physical and digital perimeters, synthesizing fragmented signals into actionable threat intelligence.
        </p>
      </InView>

      {/* Metrics & Stream Status Grid */}
      <InView isActive={isActive} transition={{ delay: 0.15, duration: 0.6 }}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl mt-4">
          {/* Metric 1: Stream Telemetry Status */}
          <div className="p-5 rounded-2xl bg-[#0a0e1a]/95 border border-slate-800/80 backdrop-blur-xl flex flex-col items-center justify-center space-y-2 hover:border-slate-700 transition-all shadow-xl">
            <div className="flex items-center gap-2 text-emerald-400">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs font-mono font-bold tracking-widest uppercase">Streams Online</span>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <span className="p-1.5 rounded bg-slate-900 border border-slate-800 text-cyan-400" title="Camera"><Camera className="w-4 h-4" /></span>
              <span className="p-1.5 rounded bg-slate-900 border border-slate-800 text-emerald-400" title="Badge"><ShieldCheck className="w-4 h-4" /></span>
              <span className="p-1.5 rounded bg-slate-900 border border-slate-800 text-purple-400" title="Network"><Wifi className="w-4 h-4" /></span>
            </div>
            <span className="text-2xl font-mono font-bold text-white">3 / 3 Active</span>
          </div>

          {/* Metric 2: Correlation Rate (Animated Number 99.4%) */}
          <div className="p-5 rounded-2xl bg-[#0a0e1a]/95 border border-cyan-500/30 backdrop-blur-xl flex flex-col items-center justify-center space-y-2 hover:border-cyan-500/50 transition-all shadow-[0_0_25px_rgba(6,182,212,0.12)]">
            <div className="flex items-center gap-2 text-cyan-400">
              <Activity className="w-4 h-4 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-widest uppercase">Correlation Rate</span>
            </div>
            <div className="text-4xl font-mono font-black text-cyan-300 flex items-center">
              {isActive ? (
                <AnimatedNumber value={99.4} decimalPlaces={1} />
              ) : (
                '0.0'
              )}
              <span>%</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Deterministic + Heuristic Fusion</span>
          </div>

          {/* Metric 3: Active Incident Alert */}
          <div className="p-5 rounded-2xl bg-[#0a0e1a]/95 border border-rose-500/30 backdrop-blur-xl flex flex-col items-center justify-center space-y-2 hover:border-rose-500/50 transition-all shadow-[0_0_25px_rgba(244,63,94,0.12)]">
            <div className="flex items-center gap-2 text-rose-400">
              <Zap className="w-4 h-4 animate-bounce" />
              <span className="text-xs font-mono font-bold tracking-widest uppercase">Threat Ingestion</span>
            </div>
            <div className="text-4xl font-mono font-black text-rose-300">
              {isActive ? (
                <AnimatedNumber value={incidentsCount || 1} decimalPlaces={0} />
              ) : (
                '0'
              )}
              <span className="text-sm font-mono text-slate-400 font-normal ml-1">
                {incidentsCount > 1 ? 'Incidents Fused' : 'Incident Fused'}
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Pattern: recon_then_brute_force</span>
          </div>
        </div>
      </InView>

      {/* Guide prompt */}
      <InView isActive={isActive} transition={{ delay: 0.3, duration: 0.5 }}>
        <div className="pt-6 flex flex-col items-center gap-2 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span>Scroll vertically or use keyboard/dots to traverse story</span>
            <ChevronRight className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          </div>
          <div className="w-6 h-10 rounded-full border-2 border-slate-700 flex justify-center pt-2 mt-1">
            <span className="w-1 h-2 rounded-full bg-cyan-400 animate-bounce" />
          </div>
        </div>
      </InView>
    </div>
  );
}
