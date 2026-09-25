import React from 'react';
import { motion } from 'framer-motion';
import { Network, ShieldCheck, Video, GitMerge, Clock, AlertCircle } from 'lucide-react';
import { Disclosure, DisclosureTrigger, DisclosureContent } from './motion-primitives/Disclosure';
import { exampleEvents } from '../data/mockData';

const getSourceIcon = (source) => {
  switch (source?.toLowerCase()) {
    case 'camera':
      return <Video className="w-3.5 h-3.5 text-cyan-400" />;
    case 'badge':
      return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
    case 'network':
      return <Network className="w-3.5 h-3.5 text-purple-400" />;
    default:
      return <GitMerge className="w-3.5 h-3.5 text-slate-400" />;
  }
};

const formatTime = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleTimeString('en-US', {
    timeZone: 'UTC',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export default function ExplainWhy({
  incident,
  events = exampleEvents,
  defaultOpen = false,
}) {
  const linkedEvents = (incident?.linked_event_ids || [])
    .map((id) => events.find((e) => e.event_id === id))
    .filter(Boolean);

  const correlationLabel = incident?.correlation_reason
    ? incident.correlation_reason.replace(/_/g, ' ').toUpperCase()
    : 'SAME ENTITY AND LOCATION';

  return (
    <div className="mt-4 border-t border-slate-800/80 pt-3">
      {/* Motion Primitives Disclosure */}
      <Disclosure defaultOpen={defaultOpen}>
        <DisclosureTrigger className="w-full">
          {({ isOpen }) => (
            <div className="w-full flex items-center justify-between py-2 text-xs font-mono font-semibold tracking-wider text-cyan-400 hover:text-cyan-300 transition-colors group">
              <div className="flex items-center gap-2">
                <GitMerge className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span>WHY THESE EVENTS LINKED ({linkedEvents.length} RAW EVENTS)</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="text-[11px] font-mono text-slate-500">
                  {isOpen ? 'Collapse Proof' : 'Explain Why (Proof Chain)'}
                </span>
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="inline-block text-cyan-400 text-sm"
                >
                  ▼
                </motion.span>
              </div>
            </div>
          )}
        </DisclosureTrigger>

        <DisclosureContent>
          <div className="pt-3 pb-2 space-y-3 font-mono">
            {/* Correlation reason banner */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">CORRELATION REASON:</span>
                <span className="px-2 py-0.5 rounded bg-cyan-950/50 text-cyan-300 border border-cyan-800/60 font-bold">
                  {correlationLabel}
                </span>
              </div>
              {incident?.time_window && (
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    Window: {formatTime(incident.time_window.start)} → {formatTime(incident.time_window.end)} UTC
                  </span>
                </div>
              )}
            </div>

            {/* Chronological Event Chain */}
            <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-purple-500 before:to-rose-500">
              {linkedEvents.map((evt, idx) => (
                <div
                  key={evt.event_id}
                  className="relative bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 hover:border-slate-700 transition-colors"
                >
                  {/* Node Dot on Timeline */}
                  <div className="absolute -left-[23px] top-4 w-3.5 h-3.5 rounded-full bg-slate-950 border-2 border-cyan-400 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  </div>

                  {/* Event Step Header */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        #{idx + 1}
                      </span>
                      <div className="p-1 rounded bg-slate-900 border border-slate-800">
                        {getSourceIcon(evt.source)}
                      </div>
                      <span className="text-xs font-semibold text-slate-200 uppercase">
                        {evt.event_type.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      {formatTime(evt.timestamp)} UTC
                    </div>
                  </div>

                  {/* Event Core Details */}
                  <div className="text-xs text-slate-400 grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/40">
                    <div>
                      <span className="text-slate-500">Location: </span>
                      <span className="text-slate-200">
                        {evt.location ? evt.location.replace(/_/g, ' ') : 'Remote / Network'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Entity: </span>
                      <span className="text-slate-200 font-semibold">{evt.entity?.id} ({evt.entity?.type})</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-500">Rule Triggered: </span>
                      <span className="text-cyan-300 font-bold">{evt.rule_triggered || 'None'}</span>
                    </div>

                    {/* Source-specific Raw Details from Simulator */}
                    {evt.raw_details && Object.keys(evt.raw_details).length > 0 && (
                      <div className="sm:col-span-2 pt-1.5 mt-1 border-t border-slate-800/60 flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="text-slate-500">Raw Details:</span>
                        {Object.entries(evt.raw_details).map(([k, v]) => (
                          <span
                            key={k}
                            className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300"
                          >
                            <span className="text-slate-500">{k}:</span> <strong className="text-cyan-300">{String(v)}</strong>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Fusion Insight Note */}
            <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/70 text-[11px] text-slate-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-slate-200">Fusion Insight:</strong> Linked via <span className="text-cyan-300 font-bold">{correlationLabel}</span>. Shared entity <span className="text-rose-300 font-bold">[{incident?.primary_entity?.id}]</span> across {incident?.locations?.join(', ') || 'server_room'}.
              </p>
            </div>
          </div>
        </DisclosureContent>
      </Disclosure>
    </div>
  );
}
