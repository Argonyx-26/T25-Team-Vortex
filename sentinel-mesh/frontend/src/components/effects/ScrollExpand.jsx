import React, { useState, useEffect, useRef } from 'react';
import { Maximize2, Minimize2, Cpu, Eye, Shield, Terminal, ArrowRight, Network } from 'lucide-react';

/**
 * ScrollExpand
 * Container that expands smoothly as it is scrolled into view or toggled.
 * Visualizes the 3-tier correlation matrix: Camera optical -> Physical badge -> Network telemetry.
 */
export default function ScrollExpand({ incidents = [], events = [] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef(null);

  const activeIncident = incidents[0] || null;

  return (
    <section ref={containerRef} className="my-8 transition-all duration-500 ease-out" id="section-fusion">
      <div
        className={`border border-cyan-900/60 bg-[#060a14] transition-all duration-500 relative overflow-hidden ${
          isExpanded
            ? 'p-6 lg:p-8 shadow-[0_0_40px_rgba(0,240,255,0.15)] border-cyan-500/60'
            : 'p-5 shadow-[0_4px_24px_rgba(0,0,0,0.5)]'
        }`}
      >
        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-cyan-500/40 bg-cyan-950/30 flex items-center justify-center text-cyan-400">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-cyan-400 uppercase tracking-widest">[EXPANDABLE MATRIX]</span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
                  3-SOURCE CONVERGENCE
                </span>
              </div>
              <h3 className="font-mono text-base font-bold text-slate-100 tracking-wide mt-0.5">
                Multi-Stream Graph Correlation & Convergence
              </h3>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-3 py-1.5 font-mono text-xs text-cyan-300 border border-cyan-700/60 bg-cyan-950/40 hover:bg-cyan-900/60 transition-colors cursor-pointer"
          >
            {isExpanded ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>COMPACT VIEW</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>EXPAND FULL MATRIX</span>
              </>
            )}
          </button>
        </div>

        {/* Dynamic content */}
        <div className="mt-5">
          {/* Streams Architecture Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Stream 1: Physical Badge */}
            <div className="border border-slate-800 bg-[#080d1a] p-4 relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 font-semibold">
                  <Shield className="w-4 h-4" />
                  <span>01 / PHYSICAL BADGE</span>
                </div>
                <span className="font-mono text-[10px] text-slate-500">RFID / NFC</span>
              </div>
              <p className="font-mono text-xs text-slate-400 leading-relaxed">
                Ingests turnstile and secure door badge swipes. Detects after-hours access, unauthorized zones, and tailgating sequences.
              </p>
              <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between font-mono text-[11px]">
                <span className="text-slate-500">Matched Rule:</span>
                <span className="text-emerald-300 font-medium">after_hours_badge_access</span>
              </div>
            </div>

            {/* Stream 2: CCTV Optical */}
            <div className="border border-slate-800 bg-[#080d1a] p-4 relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 font-mono text-xs text-cyan-400 font-semibold">
                  <Eye className="w-4 h-4" />
                  <span>02 / CCTV OPTICAL AI</span>
                </div>
                <span className="font-mono text-[10px] text-slate-500">YOLOv8 CV</span>
              </div>
              <p className="font-mono text-xs text-slate-400 leading-relaxed">
                Processes real-time camera frames for bounding-box loitering, restricted perimeter trespass, and person dwell duration.
              </p>
              <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between font-mono text-[11px]">
                <span className="text-slate-500">Matched Rule:</span>
                <span className="text-cyan-300 font-medium">restricted_zone_motion</span>
              </div>
            </div>

            {/* Stream 3: Network Telemetry */}
            <div className="border border-slate-800 bg-[#080d1a] p-4 relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 font-mono text-xs text-amber-400 font-semibold">
                  <Terminal className="w-4 h-4" />
                  <span>03 / NETWORK FLOW</span>
                </div>
                <span className="font-mono text-[10px] text-slate-500">NSL-KDD PCAP</span>
              </div>
              <p className="font-mono text-xs text-slate-400 leading-relaxed">
                Inspects packet headers, auth failures, port probes, and unusual outbound transfer spikes against baseline traffic.
              </p>
              <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between font-mono text-[11px]">
                <span className="text-slate-500">Matched Rule:</span>
                <span className="text-amber-300 font-medium">brute_force_login</span>
              </div>
            </div>
          </div>

          {/* Expanded Convergence Canvas */}
          {isExpanded && (
            <div className="mt-6 border border-cyan-900/60 bg-[#040711] p-5">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-2">
                <span className="font-mono text-xs text-cyan-400 uppercase tracking-widest font-semibold">
                  [TEMPORAL CONVERGENCE TIMELINE]
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  Correlation Window: 15 minutes | Entity Key: {activeIncident?.primary_entity?.id || 'employee_42'}
                </span>
              </div>

              {/* Graphical Fusion Flow */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                <div className="border border-slate-800 p-3 bg-[#080d1a]">
                  <div className="font-mono text-[10px] text-slate-500">T0: 02:10:05Z</div>
                  <div className="font-mono text-xs text-slate-200 font-semibold mt-1">Network Failed Logins</div>
                  <div className="font-mono text-[11px] text-amber-400 mt-1">Target: SSH 10.0.0.5</div>
                </div>

                <div className="text-center font-mono text-xs text-cyan-500 hidden md:block">
                  <ArrowRight className="w-5 h-5 mx-auto animate-pulse" />
                  <span className="text-[10px]">4m later</span>
                </div>

                <div className="border border-slate-800 p-3 bg-[#080d1a]">
                  <div className="font-mono text-[10px] text-slate-500">T1: 02:14:00Z</div>
                  <div className="font-mono text-xs text-slate-200 font-semibold mt-1">Server Room Badge Scan</div>
                  <div className="font-mono text-[11px] text-emerald-400 mt-1">Door: D-114 (Granted)</div>
                </div>

                <div className="border border-rose-900/60 p-3 bg-[#13070b]">
                  <div className="font-mono text-[10px] text-rose-400">T2: 02:15:30Z (FUSED)</div>
                  <div className="font-mono text-xs text-rose-200 font-semibold mt-1">Restricted Zone Motion</div>
                  <div className="font-mono text-[11px] text-rose-300 mt-1">Camera: CAM-09 (340s dwell)</div>
                </div>
              </div>

              {/* Active Incident Summary if available */}
              {activeIncident && (
                <div className="mt-4 p-3 bg-cyan-950/20 border border-cyan-800/40 font-mono text-xs text-slate-300">
                  <span className="text-cyan-400 font-bold">SYNTHESIZED NARRATIVE: </span>
                  {activeIncident.narrative || activeIncident.summary}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
