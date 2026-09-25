import React from 'react';
import {
  ShieldAlert,
  Radio,
  Sparkles,
  Clock,
  MapPin,
  User,
  Zap,
  AlertOctagon,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import SpotlightCard from './SpotlightCard';
import ExplainWhy from './ExplainWhy';
import BorderTrail from './motion-primitives/BorderTrail';
import AnimatedNumber from './motion-primitives/AnimatedNumber';
import { exampleIncident, exampleEvents } from '../data/mockData';

// Color definitions based on severity
const SEVERITY_CONFIG = {
  critical: {
    label: 'CRITICAL SEVERITY',
    spotlight: 'rgba(239, 68, 68, 0.16)',
    border: 'rgba(239, 68, 68, 0.5)',
    badgeClass: 'bg-red-500/20 text-red-200 border-red-500/50',
    indicator: 'bg-red-500',
    trailColor: '#ef4444',
  },
  high: {
    label: 'HIGH SEVERITY',
    spotlight: 'rgba(244, 63, 94, 0.12)',
    border: 'rgba(244, 63, 94, 0.4)',
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
    indicator: 'bg-rose-500',
    trailColor: '#f43f5e',
  },
  medium: {
    label: 'MEDIUM SEVERITY',
    spotlight: 'rgba(245, 158, 11, 0.10)',
    border: 'rgba(245, 158, 11, 0.35)',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    indicator: 'bg-amber-500',
    trailColor: '#f59e0b',
  },
  low: {
    label: 'LOW SEVERITY',
    spotlight: 'rgba(16, 185, 129, 0.10)',
    border: 'rgba(16, 185, 129, 0.3)',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
    indicator: 'bg-emerald-500',
    trailColor: '#10b981',
  },
};

const formatTimeSpan = (start, end) => {
  if (!start || !end) return null;
  const dStart = new Date(start);
  const dEnd = new Date(end);
  const diffSec = Math.round((dEnd - dStart) / 1000);
  if (diffSec < 0) return null;
  const mins = Math.floor(diffSec / 60);
  const secs = diffSec % 60;
  return `${mins}m ${secs}s span`;
};

export default function IncidentView({
  incident = exampleIncident,
  events = exampleEvents,
  operatorLoad = 'normal', // 'normal' | 'high'
  showWhy = true,
  enableBorderTrail = true,
}) {
  const severityKey = incident?.severity?.toLowerCase() || 'high';
  const config = SEVERITY_CONFIG[severityKey] || SEVERITY_CONFIG.high;
  const isHighLoad = operatorLoad === 'high';
  const confidencePercent = incident.confidence != null ? Math.round(incident.confidence * 100) : 82;
  const timeSpan = incident?.time_window ? formatTimeSpan(incident.time_window.start, incident.time_window.end) : null;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {/* High Operator Load Alert Banner */}
      {isHighLoad && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/60 text-rose-200 animate-pulse shadow-lg font-mono">
          <AlertOctagon className="w-5 h-5 text-rose-400 flex-shrink-0 animate-bounce" />
          <div className="flex-1 text-xs">
            <span className="font-bold text-rose-100 uppercase tracking-wide">
              URGENT INCIDENT TRIAGE ACTIVE:
            </span>{' '}
            High operator load detected. Prioritizing primary correlation path and automated containment.
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500 text-white tracking-widest uppercase">
            PRIORITY 1
          </span>
        </div>
      )}

      {/* Main ReactBits Spotlight Card */}
      <SpotlightCard
        severity={severityKey}
        spotlightColor={isHighLoad ? 'rgba(244, 63, 94, 0.14)' : config.spotlight}
        borderColor={isHighLoad ? 'rgba(244, 63, 94, 0.5)' : config.border}
        isUrgent={isHighLoad}
        borderTrail={
          enableBorderTrail ? (
            <BorderTrail
              color={isHighLoad ? '#f43f5e' : config.trailColor}
              duration={isHighLoad ? 3 : 5}
              strokeWidth={2}
              rx={16}
            />
          ) : null
        }
        className={`relative overflow-hidden transition-all duration-300 ${
          isHighLoad ? 'ring-1 ring-rose-500/50' : ''
        }`}
      >
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <ShieldAlert
                className={`w-6 h-6 ${
                  isHighLoad || severityKey === 'high' || severityKey === 'critical' ? 'text-rose-400' : 'text-amber-400'
                }`}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-mono tracking-tight text-white">
                  INCIDENT #{incident.incident_id?.toUpperCase()}
                </h3>
                <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  incident.status === 'escalated'
                    ? 'bg-rose-950/70 text-rose-300 border border-rose-800/60'
                    : incident.status === 'reviewed'
                    ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/60'
                    : 'bg-cyan-950/70 text-cyan-300 border border-cyan-800/60'
                }`}>
                  {incident.status || 'NEW'}
                </span>
                {incident.updated_at && (
                  <span className="flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full bg-purple-950/60 text-purple-300 border border-purple-800/50">
                    <RefreshCw className="w-2.5 h-2.5 animate-spin-slow" />
                    Superset Updated
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>Detected: {incident.created_at}</span>
                </span>
                {timeSpan && (
                  <span className="text-[11px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    {timeSpan}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Severity & Confidence Badges */}
          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 font-mono text-xs text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                Confidence: <strong className="text-white"><AnimatedNumber value={confidencePercent} />%</strong>
              </span>
            </div>
            <div
              className={`px-3 py-1 rounded-lg border font-mono text-xs font-bold flex items-center gap-1.5 ${config.badgeClass} ${
                isHighLoad ? 'scale-105 ring-1 ring-rose-400' : ''
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${config.indicator} animate-ping`} />
              <span>{config.label}</span>
            </div>
          </div>
        </div>

        {/* Primary Correlation Meta Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 my-3.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs font-mono">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-500" />
            <span className="text-slate-500">Entity:</span>
            <span className="text-slate-200 font-semibold">
              {incident.primary_entity?.id} <span className="text-slate-500 text-[10px]">({incident.primary_entity?.type})</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-500" />
            <span className="text-slate-500">Locations:</span>
            <span className="text-slate-200 font-semibold">
              {incident.locations?.length ? incident.locations.join(', ') : 'server_room'}
            </span>
          </div>

          <div className="flex items-center gap-2 col-span-2 md:col-span-1">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-slate-500">Pattern:</span>
            <span className="text-amber-300 font-semibold truncate">
              {incident.matched_attack_pattern || 'recon_then_brute_force'}
            </span>
          </div>
        </div>

        {/* Narrative Text */}
        <div className="my-3.5">
          <div className="flex items-center justify-between mb-1.5">
            <h4 className="text-xs uppercase font-mono tracking-wider text-slate-400 font-semibold">
              Narrative Analysis
            </h4>
            <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-cyan-400" />
              Groq LLaMA 3.3 Engine
            </span>
          </div>
          <p
            className={`text-xs md:text-sm leading-relaxed rounded-xl p-3.5 border font-mono transition-colors ${
              isHighLoad
                ? 'bg-rose-950/15 border-rose-500/30 text-slate-100'
                : 'bg-slate-950/50 border-slate-800/80 text-slate-300'
            }`}
          >
            {incident.summary || 'Awaiting automated synthesis from backend...'}
          </p>
        </div>

        {/* Predicted Next Step Callout */}
        {incident.predicted_next_step && (
          <div className="my-3.5 p-3.5 rounded-xl bg-gradient-to-r from-purple-950/20 via-cyan-950/15 to-[#0a0e1a] border border-cyan-500/25 relative overflow-hidden font-mono">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex-shrink-0">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                    Forecast Module: Predicted Next Step
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-200 border border-cyan-800/50">
                    Pattern Matcher
                  </span>
                </div>
                <p className="text-xs md:text-sm text-slate-200 leading-normal">
                  {incident.predicted_next_step}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Collapsible Explain Why Section */}
        {showWhy && (
          <ExplainWhy incident={incident} events={events} defaultOpen={false} />
        )}
      </SpotlightCard>
    </div>
  );
}
