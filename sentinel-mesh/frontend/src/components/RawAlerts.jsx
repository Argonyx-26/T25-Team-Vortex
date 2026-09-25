import React, { useState } from 'react';
import { Camera, ShieldAlert, Wifi, AlertTriangle, CheckCircle2, Clock, MapPin, User, ChevronRight } from 'lucide-react';
import { exampleEvents } from '../data/mockData';

const getSourceIcon = (source) => {
  switch (source?.toLowerCase()) {
    case 'camera':
      return <Camera className="w-4 h-4 text-cyan-400" />;
    case 'badge':
      return <ShieldAlert className="w-4 h-4 text-emerald-400" />;
    case 'network':
      return <Wifi className="w-4 h-4 text-purple-400" />;
    default:
      return <AlertTriangle className="w-4 h-4 text-zinc-400" />;
  }
};

const getSeverityBadge = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'high':
      return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    case 'medium':
      return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    case 'low':
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    default:
      return 'bg-zinc-700/20 text-zinc-400 border-zinc-700/40';
  }
};

const formatTime = (isoString) => {
  if (!isoString) return '--:--:--';
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    timeZone: 'UTC',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }) + ' UTC';
};

export default function RawAlerts({ events = exampleEvents, selectedEventId, onSelectEvent }) {
  const [filterSource, setFilterSource] = useState('all');

  const filteredEvents = events.filter((evt) => {
    if (filterSource === 'all') return true;
    return evt.source === filterSource;
  });

  return (
    <div className="flex flex-col h-full bg-zinc-900/70 border border-zinc-800/80 rounded-xl overflow-hidden backdrop-blur-md shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/90">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wider uppercase text-zinc-200">Raw Stream Events</h2>
            <p className="text-xs text-zinc-400">Sensor & Telemetry Feed</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs bg-zinc-800/60 p-1 rounded-lg border border-zinc-700/50">
          {['all', 'camera', 'badge', 'network'].map((src) => (
            <button
              key={src}
              onClick={() => setFilterSource(src)}
              className={`px-2 py-0.5 rounded capitalize transition-all ${
                filterSource === src
                  ? 'bg-zinc-700 text-zinc-100 font-medium shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {src}
            </button>
          ))}
        </div>
      </div>

      {/* Scrolling List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[620px] divide-y divide-transparent">
        {filteredEvents.map((evt) => {
          const isFlagged = Boolean(evt.flagged);
          const isSelected = selectedEventId === evt.event_id;

          // Flagged events get colored left border; non-flagged stay gray/muted
          const borderStyle = isFlagged
            ? evt.severity === 'high'
              ? 'border-l-4 border-l-rose-500 bg-rose-950/10'
              : evt.severity === 'medium'
              ? 'border-l-4 border-l-amber-500 bg-amber-950/10'
              : 'border-l-4 border-l-emerald-500 bg-emerald-950/10'
            : 'border-l-4 border-l-zinc-700/50 bg-zinc-900/40 opacity-70 hover:opacity-90';

          return (
            <div
              key={evt.event_id}
              onClick={() => onSelectEvent && onSelectEvent(evt)}
              className={`p-3.5 rounded-lg border border-zinc-800/90 transition-all duration-200 cursor-pointer hover:border-zinc-700/80 hover:shadow-lg ${borderStyle} ${
                isSelected ? 'ring-1 ring-cyan-500/60 bg-zinc-800/70' : ''
              }`}
            >
              {/* Top row: Source badge, Event Type, Timestamp */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-zinc-800/90 border border-zinc-700/60">
                    {getSourceIcon(evt.source)}
                  </div>
                  <span className="font-mono text-xs font-bold text-zinc-100 uppercase tracking-wide">
                    {evt.event_type?.replace(/_/g, ' ')}
                  </span>
                  <span className={`text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded border ${getSeverityBadge(evt.severity)}`}>
                    {evt.severity}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                  <Clock className="w-3 h-3 text-zinc-500" />
                  <span>{formatTime(evt.timestamp)}</span>
                </div>
              </div>

              {/* Middle row: Location & Entity */}
              <div className="grid grid-cols-2 gap-2 text-xs text-zinc-300 py-1 font-mono">
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                  <span className="truncate">
                    {evt.location ? evt.location.replace(/_/g, ' ') : <span className="text-zinc-500 italic">Remote / Network</span>}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 truncate">
                  <User className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                  <span className="truncate text-zinc-300 font-medium">
                    {evt.entity?.id || 'Unknown'}
                  </span>
                </div>
              </div>

              {/* Bottom row: Rule triggered & flagged status */}
              <div className="mt-2 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px]">
                <div className="text-zinc-400 font-mono truncate max-w-[220px]">
                  <span className="text-zinc-500">rule:</span> {evt.rule_triggered || 'standard_telemetry'}
                </div>

                {isFlagged ? (
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] text-rose-400 font-medium bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                    <AlertTriangle className="w-2.5 h-2.5" /> Flagged
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] text-zinc-400">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Normal
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer stats */}
      <div className="p-2.5 bg-zinc-950/60 border-t border-zinc-800 text-xs font-mono text-zinc-400 flex justify-between items-center px-4">
        <span>Showing {filteredEvents.length} events</span>
        <span className="text-zinc-500 text-[11px]">Stream: active</span>
      </div>
    </div>
  );
}
