import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, Lock, UserX, Siren, XCircle, ArrowUpRight } from 'lucide-react';
import FatigueToggle from '../FatigueToggle';
import InView from '../motion-primitives/InView';
import { exampleIncident } from '../../data/mockData';

export default function PanelActionFatigue({
  isActive = true,
  operatorLoad = 'normal',
  onToggleOperatorLoad,
  incident = exampleIncident,
  onUpdateStatus,
}) {
  const [executedActions, setExecutedActions] = useState([]);
  const [localStatus, setLocalStatus] = useState(incident?.status || 'new');

  const handleAction = (id) => {
    setExecutedActions((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleStatusChange = async (newStatus) => {
    setLocalStatus(newStatus);
    if (onUpdateStatus && incident?.incident_id) {
      onUpdateStatus(incident.incident_id, newStatus);
    }
  };

  const isHighLoad = operatorLoad === 'high';
  const effectiveStatus = incident?.status || localStatus;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col justify-center px-4 py-8">
      <InView isActive={isActive}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Panel 06 • Operator Command & Containment</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-mono text-white flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-amber-400" />
              Recommended Action & Load Control
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1">
              Execute immediate zero-trust containment plays and modulate operator cognitive load.
            </p>
          </div>

          {/* Fatigue Toggle */}
          <div className="flex items-center gap-3">
            <FatigueToggle
              operatorLoad={operatorLoad}
              onChange={onToggleOperatorLoad}
            />
          </div>
        </div>
      </InView>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start font-mono">
        {/* Recommended Action Box (7 cols) with subtle atmospheric radial glow (10-15%) */}
        <InView isActive={isActive} transition={{ delay: 0.15, duration: 0.6 }} className="md:col-span-7 space-y-4">
          <div className={`relative p-5 rounded-2xl border transition-all overflow-hidden backdrop-blur-xl ${
            isHighLoad
              ? 'bg-[#0a0e1a]/95 border-rose-500/60 shadow-[0_0_35px_rgba(244,63,94,0.18)]'
              : 'bg-[#0a0e1a]/90 border-slate-800/90 shadow-2xl'
          }`} style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Subtle atmospheric glow behind the card (z-0, 10-14% opacity) */}
            <div
              className="pointer-events-none absolute inset-0 z-0"
              style={{
                background: isHighLoad
                  ? 'radial-gradient(ellipse at 50% 0%, rgba(244, 63, 94, 0.14) 0%, rgba(10, 14, 26, 0) 70%)'
                  : 'radial-gradient(ellipse at 50% 0%, rgba(245, 158, 11, 0.12) 0%, rgba(10, 14, 26, 0) 70%)',
              }}
            />

            <div className="relative" style={{ position: 'relative', zIndex: 10 }}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>AI Recommended Operator Action</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30">
                  HIGH PRIORITY
                </span>
              </div>

              <p className="mt-3 text-xs sm:text-sm text-slate-200 leading-relaxed font-mono">
                "{incident?.recommended_action || exampleIncident.recommended_action}"
              </p>

              {/* Quick Action One-Click Buttons */}
              <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-2.5">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                  Automated Containment Plays:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleAction('lock_doors')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                      executedActions.includes('lock_doors')
                        ? 'bg-emerald-950/70 border-emerald-500/70 text-emerald-300'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{executedActions.includes('lock_doors') ? '✓ Door D-114 Locked' : 'Lock Door D-114'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAction('suspend_creds')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                      executedActions.includes('suspend_creds')
                        ? 'bg-emerald-950/70 border-emerald-500/70 text-emerald-300'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <UserX className="w-3.5 h-3.5 text-rose-400" />
                    <span>{executedActions.includes('suspend_creds') ? '✓ Credentials Revoked' : `Suspend ${incident?.primary_entity?.id || 'employee_42'}`}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </InView>

        {/* Load Status & Workflow Disposition (5 cols) */}
        <InView isActive={isActive} transition={{ delay: 0.25, duration: 0.6 }} className="md:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-[#0a0e1a]/90 border border-slate-800/90 space-y-4 shadow-xl">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">
                Cognitive Load State
              </span>
              <div className={`p-3 rounded-xl border text-xs transition-colors ${
                isHighLoad
                  ? 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                  : 'bg-slate-950/50 border-slate-800 text-emerald-300'
              }`}>
                {isHighLoad ? (
                  <div className="flex items-start gap-2">
                    <Siren className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5 animate-bounce" />
                    <span><strong>High Load Active:</strong> UI streamlined to high-contrast alert hierarchy. Visual noise suppressed.</span>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Normal Load:</strong> Full analytical telemetry and contextual investigation paths visible.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Workflow status triage calling backend PATCH /incidents/{id}/status */}
            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 uppercase tracking-wider">
                  Incident Disposition
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  effectiveStatus === 'escalated'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : effectiveStatus === 'reviewed'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : effectiveStatus === 'dismissed'
                    ? 'bg-slate-800 text-slate-400 border border-slate-700'
                    : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                }`}>
                  Status: {effectiveStatus}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleStatusChange('escalated')}
                  className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-all ${
                    effectiveStatus === 'escalated'
                      ? 'bg-rose-500/20 text-rose-200 border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                      : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Escalate Incident
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange('reviewed')}
                  className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-all ${
                    effectiveStatus === 'reviewed'
                      ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/60'
                      : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mark Reviewed
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange('dismissed')}
                  className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-all ${
                    effectiveStatus === 'dismissed'
                      ? 'bg-slate-800 text-slate-300 border-slate-600'
                      : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Dismiss
                </button>
              </div>

              {incident?.operator_feedback && (
                <div className="mt-2.5 p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400">
                  <span className="text-slate-500">Dismissed:</span> {incident.operator_feedback.reason} ({incident.operator_feedback.dismissed_at})
                </div>
              )}
            </div>
          </div>
        </InView>
      </div>
    </div>
  );
}
