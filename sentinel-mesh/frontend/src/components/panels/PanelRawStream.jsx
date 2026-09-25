import React, { useState } from 'react';
import { Camera, ShieldAlert, Wifi, AlertTriangle, CheckCircle2, Clock, MapPin, User, Filter } from 'lucide-react';
import AnimatedGroup from '../motion-primitives/AnimatedGroup';
import InView from '../motion-primitives/InView';
import { exampleEvents } from '../../data/mockData';

// Simulated benign background events fallback
const defaultNoisyEvents = [
  ...exampleEvents,
  {
    event_id: 'evt_00000',
    source: 'badge',
    event_type: 'badge_scan',
    entity: { id: 'employee_19', type: 'employee' },
    location: 'cafeteria',
    timestamp: '2026-09-26T02:08:12Z',
    severity: 'low',
    flagged: false,
    rule_triggered: null,
  },
  {
    event_id: 'evt_00004',
    source: 'camera',
    event_type: 'motion_detected',
    entity: { id: 'cleaner_03', type: 'employee' },
    location: 'hallway_east',
    timestamp: '2026-09-26T02:16:45Z',
    severity: 'low',
    flagged: false,
    rule_triggered: null,
  },
  {
    event_id: 'evt_00005',
    source: 'network',
    event_type: 'health_ping',
    entity: { id: 'gateway_core', type: 'device' },
    location: null,
    timestamp: '2026-09-26T02:17:00Z',
    severity: 'low',
    flagged: false,
    rule_triggered: null,
  },
];

const getSourceIcon = (source) => {
  switch (source?.toLowerCase()) {
    case 'camera':
      return <Camera className="w-3.5 h-3.5 text-cyan-400" />;
    case 'badge':
      return <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />;
    case 'network':
      return <Wifi className="w-3.5 h-3.5 text-purple-400" />;
    default:
      return <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />;
  }
};

const formatTime = (isoString) => {
  if (!isoString) return '--:--:--';
  const d = new Date(isoString);
  return d.toLocaleTimeString('en-US', {
    timeZone: 'UTC',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }) + ' UTC';
};

export default function PanelRawStream({
  isActive = true,
  events = defaultNoisyEvents,
}) {
  const [filter, setFilter] = useState('all');
  const sourceEvents = events && events.length > 0 ? events : defaultNoisyEvents;

  const filtered = sourceEvents.filter((evt) => {
    if (filter === 'all') return true;
    return evt.source === filter;
  });

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col justify-center px-4 py-8">
      <InView>
        {/* Panel Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Panel 02 • Stream Ingestion</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-mono text-white">
              Raw Event Stream Feed <span className="text-slate-500 text-lg font-normal font-mono">({sourceEvents.length} Events)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1">
              Disparate events stream from camera, badge, and network logs. Uncorrelated signals create cognitive alert fatigue.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-[#0a0e1a]/95 p-1.5 rounded-xl border border-slate-800 text-xs font-mono">
            <Filter className="w-3.5 h-3.5 text-slate-500 ml-1 mr-0.5" />
            {['all', 'camera', 'badge', 'network'].map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => setFilter(src)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-all ${
                  filter === src
                    ? 'bg-slate-800 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {src}
              </button>
            ))}
          </div>
        </div>
      </InView>

      {/* Raw Event Cards Feed - Always rendered and visible */}
      <div className="max-h-[520px] overflow-y-auto pr-2">
        <AnimatedGroup
          key={filter}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5"
          variants={{
            container: {
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.05,
                  delayChildren: 0.05,
                },
              },
            },
            item: {
              hidden: { opacity: 0, y: 15, scale: 0.98 },
              visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1],
                },
              },
            },
          }}
        >
          {filtered.map((evt) => {
            const isFlagged = evt.flagged;
            return (
              <div
                key={evt.event_id}
                className={`p-3.5 rounded-xl border font-mono transition-all ${
                  isFlagged
                    ? 'bg-[#0a0e1a]/95 border-l-4 border-l-rose-500 border-slate-800 shadow-md ring-1 ring-rose-500/30'
                    : 'bg-slate-950/60 border-l-4 border-l-slate-700/40 border-slate-800/80 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-slate-800/80 border border-slate-700/60">
                      {getSourceIcon(evt.source)}
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-200 uppercase truncate max-w-[120px]">
                      {evt.event_type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500">
                    {formatTime(evt.timestamp)}
                  </span>
                </div>

                <div className="text-xs text-slate-400 space-y-1 py-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                    <span className="truncate">{evt.location ? evt.location.replace(/_/g, ' ') : 'Remote / Network'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <User className="w-3 h-3 text-slate-500 flex-shrink-0" />
                    <span className="truncate text-slate-200 font-semibold">{evt.entity?.id}</span>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 truncate max-w-[140px]">
                    {evt.rule_triggered || 'routine_traffic'}
                  </span>
                  {isFlagged ? (
                    <span className="text-rose-300 font-bold flex items-center gap-1 text-[10px] bg-rose-500/15 px-1.5 py-0.5 rounded border border-rose-500/30">
                      <AlertTriangle className="w-2.5 h-2.5 text-rose-400" /> Flagged
                    </span>
                  ) : (
                    <span className="text-slate-500 flex items-center gap-1 text-[10px]">
                      <CheckCircle2 className="w-2.5 h-2.5 text-slate-600" /> Normal
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </AnimatedGroup>
      </div>
    </div>
  );
}
