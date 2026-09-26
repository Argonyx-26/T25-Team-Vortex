import React, { useState } from 'react';
import { Camera, ShieldAlert, Wifi, AlertTriangle, Clock, ArrowRight, UserCheck, MapPin, ExternalLink, Eye, Lock } from 'lucide-react';
import InView from '../motion-primitives/InView';
import FlaggedEventDetailModal from '../events/FlaggedEventDetailModal';
import { exampleEvents } from '../../data/mockData';

export default function PanelFlaggedEvents({
  isActive = true,
  events = exampleEvents,
  onOpenReport,
}) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const flaggedEvents = (events || []).filter((e) => e.flagged);
  const displayEvents = flaggedEvents.length > 0 ? flaggedEvents : exampleEvents.filter((e) => e.flagged);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col justify-center px-4 py-8">
      <InView>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-rose-400 font-mono text-xs uppercase tracking-wider mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              <span>Module 03 • Rule-Based Anomaly Detection Signals</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-mono text-white">
              Flagged Suspicious Events <span className="text-rose-400 text-lg font-normal font-mono">({displayEvents.length} Target Signals)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1">
              Touch or click any card below to open its classified forensic dossier, decoded payload, and containment controls.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 font-mono text-xs shadow-[0_0_15px_rgba(244,63,94,0.2)]">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Target Entity: <strong className="text-white">{displayEvents[0]?.entity?.id || 'employee_42'}</strong></span>
          </div>
        </div>
      </InView>

      {/* Prominent Interactive Flagged Event Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-2">
        {displayEvents.map((evt, idx) => {
          const colors = [
            { border: 'border-purple-500/60', hoverBorder: 'hover:border-purple-400', glow: 'shadow-[0_0_20px_rgba(168,85,247,0.18)]', iconBg: 'bg-purple-950/60 text-purple-400' },
            { border: 'border-emerald-500/60', hoverBorder: 'hover:border-emerald-400', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.18)]', iconBg: 'bg-emerald-950/60 text-emerald-400' },
            { border: 'border-cyan-500/60', hoverBorder: 'hover:border-cyan-400', glow: 'shadow-[0_0_20px_rgba(6,182,212,0.18)]', iconBg: 'bg-cyan-950/60 text-cyan-400' },
          ][idx % 3];

          return (
            <InView
              key={evt.event_id || idx}
              transition={{ delay: 0.1 * (idx + 1), duration: 0.5 }}
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => setSelectedEvent(evt)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedEvent(evt);
                  }
                }}
                className={`p-5 rounded-2xl bg-[#0a0e1a]/95 border ${colors.border} ${colors.hoverBorder} ${colors.glow} flex flex-col justify-between h-full relative overflow-hidden backdrop-blur-xl group hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,240,255,0.25)] transition-all cursor-pointer text-left select-none`}
              >
                {/* Step badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                      SIGNAL #{idx + 1}
                    </span>
                    <span className="font-mono text-xs text-rose-400 uppercase font-semibold">
                      [{evt.source}]
                    </span>
                  </div>
                  <span className="font-mono text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {evt.timestamp?.split('T')[1]?.replace('Z', '') || '--:--:--'} UTC
                  </span>
                </div>

                {/* Event Title */}
                <div>
                  <h3 className="text-base font-bold font-mono text-white uppercase tracking-wide group-hover:text-cyan-300 transition-colors flex items-center justify-between">
                    <span>{evt.event_type.replace(/_/g, ' ')}</span>
                    <ExternalLink className="w-4 h-4 text-cyan-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </h3>
                  <div className="mt-2 text-xs font-mono text-slate-300 space-y-1.5 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                      <span>Entity: <strong className="text-white">{evt.entity?.id}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span>Location: <span className="text-slate-300">{evt.location || 'Remote (10.0.0.5)'}</span></span>
                    </div>
                    <div className="pt-1 text-[11px] text-slate-400 border-t border-slate-800/80 flex items-center justify-between">
                      <span>Rule: <span className="text-cyan-400 font-semibold">{evt.rule_triggered || 'anomaly_detected'}</span></span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-rose-950 text-rose-300 border border-rose-800 uppercase font-bold">
                        {evt.severity || 'HIGH'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Touch / Click Prompt Button Bar */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-[11px] text-cyan-300 font-semibold group-hover:underline flex items-center gap-1">
                    TOUCH TO INSPECT DOSSIER
                  </span>
                  <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            </InView>
          );
        })}
      </div>

      {/* Detailed Forensic Event Dossier Modal */}
      <FlaggedEventDetailModal
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        event={selectedEvent}
        allFlaggedEvents={displayEvents}
        onSelectEvent={(e) => setSelectedEvent(e)}
        onOpenReport={onOpenReport}
      />
    </div>
  );
}
