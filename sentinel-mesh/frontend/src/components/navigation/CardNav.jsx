import React from 'react';
import { Shield, Sparkles, Eye, FileSpreadsheet, Terminal, Bell, Lock, FileText, RefreshCw, Radio, GitMerge } from 'lucide-react';

/**
 * CardNav
 * High-tech modular card navigation bar for all 6 SentinelMesh modules.
 * Clean, distinct module topics with zero overlap and high information density.
 * Includes dedicated [ FORENSIC REPORT ] button.
 */
export default function CardNav({
  activeTab,
  setActiveTab,
  onlineStatus,
  latency,
  eventCount,
  incidentCount,
  alertCount,
  flaggedCount = 0,
  onOpenLegalModal,
  onOpenReport,
  onReset,
  isResetting
}) {
  const navCards = [
    { id: 'constellation', label: '01 / CONSTELLATION', icon: Sparkles, badge: incidentCount != null ? incidentCount : null, alert: (incidentCount || 0) > 0 },
    { id: 'telemetry', label: '02 / RAW STREAM', icon: Terminal, badge: eventCount != null ? eventCount : null },
    { id: 'signals', label: '03 / FLAGGED', icon: Radio, badge: flaggedCount != null ? flaggedCount : null, alert: (flaggedCount || 0) > 0 },
    { id: 'fusion', label: '04 / FUSION ENGINE', icon: GitMerge, badge: 'CORRELATE' },
    { id: 'digital-csv', label: '05 / DIGITAL CSV', icon: FileSpreadsheet, badge: 'NSL-KDD' },
    { id: 'cctv', label: '06 / PHYSICAL CCTV', icon: Eye, badge: 'ALERT', alert: true },
    { id: 'report', label: '07 / REPORT BOX', icon: FileText, badge: 'DOSSIER', alert: true },
  ];

  const handleCardClick = (id) => {
    setActiveTab(id);
    const element = document.getElementById(`section-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#040713]/95 backdrop-blur-md border-b border-cyan-950/80 px-4 lg:px-8 py-3 font-mono">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Brand & Online Indicator */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 border border-cyan-400 bg-cyan-950/40 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.3)]">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-100 tracking-wider">
                SENTINEL<span className="text-cyan-400">MESH</span>
              </div>
              <div className="text-[9px] text-slate-500 tracking-widest uppercase">
                Threat Correlation Engine
              </div>
            </div>
          </div>

          {/* Online Status Indicator (polled from GET /) */}
          <div className="flex items-center gap-2 px-2.5 py-1 bg-black/60 border border-slate-800 text-xs">
            <span
              className={`w-2 h-2 ${
                onlineStatus ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-rose-500 shadow-[0_0_8px_#ef4444]'
              }`}
            />
            <span className={`text-[11px] font-semibold ${onlineStatus ? 'text-emerald-400' : 'text-rose-400'}`}>
              {onlineStatus ? 'ONLINE' : 'OFFLINE'}
            </span>
            {latency != null && (
              <span className="text-[10px] text-slate-500 border-l border-slate-800 pl-2">
                {latency}ms
              </span>
            )}
          </div>
        </div>

        {/* Modular Card Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {navCards.map((card) => {
            const isActive = activeTab === card.id;
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => handleCardClick(card.id)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs transition-all whitespace-nowrap cursor-pointer border ${
                  isActive
                    ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300 font-bold shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                    : 'border-slate-800/80 bg-[#070b14] text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{card.label}</span>
                {card.badge != null && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 font-bold ${
                      card.alert
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {card.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Action Controls & Legal Modals */}
        <div className="flex items-center gap-2 justify-end">
          {/* Forensic Incident Report Button */}
          {onOpenReport && (
            <button
              type="button"
              onClick={onOpenReport}
              className="flex items-center gap-1.5 px-3 py-1 bg-rose-950/80 hover:bg-rose-900 border border-rose-500 text-rose-200 text-xs font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.35)] animate-pulse"
              title="Open Classified Forensic Incident Report Box"
            >
              <FileText className="w-3.5 h-3.5 text-rose-400" />
              <span>SHOW REPORT BOX</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onOpenLegalModal && onOpenLegalModal('terms')}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-slate-400 hover:text-slate-200 border border-slate-800 bg-[#070b14] text-[11px] cursor-pointer"
            title="Terms and Conditions"
          >
            <FileText className="w-3 h-3 text-cyan-400" />
            <span>T&C</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenLegalModal && onOpenLegalModal('privacy')}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-slate-400 hover:text-slate-200 border border-slate-800 bg-[#070b14] text-[11px] cursor-pointer"
            title="Privacy Policy"
          >
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>PRIVACY</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            disabled={isResetting}
            className="flex items-center gap-1 px-2.5 py-1 text-amber-300 border border-amber-800/60 bg-amber-950/30 hover:bg-amber-950/60 text-[11px] transition-colors cursor-pointer"
            title="Reset Pipeline State"
          >
            <RefreshCw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
            <span>RESET</span>
          </button>
        </div>
      </div>
    </header>
  );
}
