import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  ShieldAlert,
  Clock,
  MapPin,
  UserCheck,
  Terminal,
  Activity,
  Cpu,
  Layers,
  FileText,
  Copy,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  Eye,
  Wifi,
  Radio,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function FlaggedEventDetailModal({
  isOpen,
  onClose,
  event,
  allFlaggedEvents = [],
  onSelectEvent,
  onOpenReport
}) {
  if (!isOpen || !event) return null;

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'payload' | 'correlation' | 'containment'
  const [copied, setCopied] = useState(false);
  const [containmentExecuted, setContainmentExecuted] = useState(false);

  // Find index in flagged list for prev/next
  const currentIndex = allFlaggedEvents.findIndex((e) => e.event_id === event.event_id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < allFlaggedEvents.length - 1;

  const handlePrev = () => {
    if (hasPrev && onSelectEvent) {
      onSelectEvent(allFlaggedEvents[currentIndex - 1]);
      setContainmentExecuted(false);
    }
  };

  const handleNext = () => {
    if (hasNext && onSelectEvent) {
      onSelectEvent(allFlaggedEvents[currentIndex + 1]);
      setContainmentExecuted(false);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(event, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecuteContainment = () => {
    setContainmentExecuted(true);
  };

  // Source styling
  const sourceConfig = {
    network: {
      label: 'NETWORK TELEMETRY',
      icon: Wifi,
      color: 'text-purple-400',
      border: 'border-purple-600',
      badge: 'bg-purple-950/70 text-purple-300 border-purple-800'
    },
    badge: {
      label: 'PHYSICAL RFID ACCESS',
      icon: Lock,
      color: 'text-emerald-400',
      border: 'border-emerald-600',
      badge: 'bg-emerald-950/70 text-emerald-300 border-emerald-800'
    },
    camera: {
      label: 'OPTICAL CCTV SURVEILLANCE',
      icon: Eye,
      color: 'text-cyan-400',
      border: 'border-cyan-600',
      badge: 'bg-cyan-950/70 text-cyan-300 border-cyan-800'
    }
  }[event.source?.toLowerCase()] || {
    label: 'SECURITY SIGNAL',
    icon: Radio,
    color: 'text-rose-400',
    border: 'border-rose-600',
    badge: 'bg-rose-950/70 text-rose-300 border-rose-800'
  };

  const SourceIcon = sourceConfig.icon;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto font-mono">
      <div className="relative w-full max-w-4xl bg-[#060a14] border-2 border-cyan-700/80 shadow-[0_0_50px_rgba(0,240,255,0.25)] text-slate-100 my-6">
        {/* Top Header Bar */}
        <div className="bg-[#080e20] border-b border-cyan-800/80 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 border ${sourceConfig.border} bg-black/60 flex items-center justify-center ${sourceConfig.color} shadow-[0_0_15px_rgba(0,240,255,0.2)]`}>
              <SourceIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${sourceConfig.color}`}>
                  {sourceConfig.label}
                </span>
                <span className="text-[10px] px-2 py-0.2 bg-rose-950 text-rose-300 border border-rose-800 font-bold uppercase">
                  {event.severity || 'HIGH'} SEVERITY
                </span>
                <span className="text-[10px] px-1.5 py-0.2 bg-slate-900 text-slate-300 border border-slate-700">
                  FLAGGED
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-wide mt-0.5 uppercase">
                {event.event_type?.replace(/_/g, ' ') || 'SECURITY ANOMALY'} • REF: {event.event_id}
              </h2>
            </div>
          </div>

          {/* Quick Nav & Close Controls */}
          <div className="flex items-center gap-2">
            {allFlaggedEvents.length > 1 && (
              <div className="flex items-center bg-[#070b16] border border-slate-800 p-0.5 text-xs mr-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={!hasPrev}
                  className={`px-2 py-1 flex items-center gap-1 cursor-pointer transition-colors ${
                    hasPrev ? 'text-cyan-300 hover:bg-cyan-950' : 'text-slate-600 cursor-not-allowed'
                  }`}
                  title="Previous Signal"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">PREV</span>
                </button>
                <span className="text-slate-600 px-1.5 text-[10px]">
                  {currentIndex + 1}/{allFlaggedEvents.length}
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!hasNext}
                  className={`px-2 py-1 flex items-center gap-1 cursor-pointer transition-colors ${
                    hasNext ? 'text-cyan-300 hover:bg-cyan-950' : 'text-slate-600 cursor-not-allowed'
                  }`}
                  title="Next Signal"
                >
                  <span className="hidden sm:inline">NEXT</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleCopyJson}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0b1329] border border-cyan-800 text-cyan-300 text-xs font-bold hover:bg-cyan-950 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'COPIED!' : 'COPY JSON'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
              title="Close Dossier"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-[#050914] border-b border-slate-800 px-4 sm:px-6 flex items-center gap-2 overflow-x-auto text-xs">
          {[
            { id: 'overview', label: '1. OVERVIEW & RULE' },
            { id: 'payload', label: '2. RAW TELEMETRY & PAYLOAD' },
            { id: 'correlation', label: '3. KILL CHAIN & CORRELATION' },
            { id: 'containment', label: '4. SOC CONTAINMENT ACTION' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`py-2.5 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap font-bold ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 space-y-6 max-h-[68vh] overflow-y-auto">
          {/* TAB 1: OVERVIEW & RULE */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* High-Level Signal Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#080d1a] border border-slate-800 p-3.5 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">TARGET ENTITY</span>
                  <span className="font-bold text-rose-300 text-sm mt-0.5 block flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-rose-400" />
                    {event.entity?.id || 'employee_42'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">LOCATION / SENSOR</span>
                  <span className="font-bold text-white text-xs mt-1 block flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    {event.location || 'Remote (10.0.0.5)'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">TIMESTAMP (UTC)</span>
                  <span className="font-mono text-slate-300 text-xs mt-1 block flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {event.timestamp || '2026-09-26T02:10:05Z'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">RULE TRIGGERED</span>
                  <span className="font-bold text-amber-300 text-xs mt-1 block">
                    {event.rule_triggered || 'anomaly_detected'}
                  </span>
                </div>
              </div>

              {/* Anomaly Signature Description */}
              <div className="border border-slate-800 bg-[#070b16] p-4 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-300">
                  <span className="text-cyan-400 uppercase flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    Anomaly Signature & Rule Logic
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">DETERMINISTIC HEURISTIC v2.4</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-mono">
                  {event.source === 'network' &&
                    'Repetitive connection rejections on TCP Port 22 (SSH) originating from internal host 10.0.0.5. Exceeded failed attempt threshold (count: 4) within a 60-second window, matching known brute-force reconnaissance patterns.'}
                  {event.source === 'badge' &&
                    'Off-hours physical card scan recorded at Turnstile D-114 (Server Room Main Entrance). Badge serial HID-8849-042 authenticated employee_42 at 02:14:00 UTC, violating standard facility operational window (09:00 - 18:00 UTC).'}
                  {event.source === 'camera' &&
                    'Optical sensor CAM-09 YOLOv8 target tracker identified an intruder crossing the restricted server room vault perimeter polygon (160, 70, 320, 240). Active dwell duration exceeded safety boundary with 94.2% neural confidence.'}
                  {!['network', 'badge', 'camera'].includes(event.source) &&
                    `Heuristic rule '${event.rule_triggered}' flagged abnormal parameter distribution for entity '${event.entity?.id}' with elevated threat rating.`}
                </p>
              </div>

              {/* Target Entity Dossier Card */}
              <div className="border border-slate-800 bg-[#070b16] p-4">
                <div className="text-xs font-bold text-slate-300 uppercase pb-2 mb-3 border-b border-slate-800 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-rose-400" />
                  <span>Target Entity Profile: {event.entity?.id || 'employee_42'}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-[#090f20] p-2.5 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">ROLE / CLEARANCE</span>
                    <span className="text-slate-200 font-bold mt-0.5 block">Infrastructure Engineer (Level 3)</span>
                  </div>
                  <div className="bg-[#090f20] p-2.5 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">ASSIGNED WORKSTATION</span>
                    <span className="text-cyan-300 font-bold mt-0.5 block">WS-CORP-42 (IP: 10.0.0.5)</span>
                  </div>
                  <div className="bg-[#090f20] p-2.5 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">CURRENT THREAT DISPOSITION</span>
                    <span className="text-rose-400 font-bold mt-0.5 block">Active Insider Threat Suspect</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RAW TELEMETRY & PAYLOAD */}
          {activeTab === 'payload' && (
            <div className="space-y-6">
              {/* Formatted Key-Value Parameters */}
              <div className="border border-slate-800 bg-[#070b16] p-4">
                <div className="text-xs font-bold text-amber-400 uppercase pb-2 mb-3 border-b border-slate-800 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  <span>Decoded Telemetry Parameters</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse font-mono">
                    <thead>
                      <tr className="border-b border-slate-800 bg-[#090f20] text-slate-400 text-[10px] uppercase">
                        <th className="py-2 px-3">PARAMETER</th>
                        <th className="py-2 px-3">CAPTURED VALUE</th>
                        <th className="py-2 px-3">DIAGNOSTIC STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      <tr className="hover:bg-slate-900/50">
                        <td className="py-2 px-3 text-slate-400">event_id</td>
                        <td className="py-2 px-3 text-cyan-300 font-bold">{event.event_id}</td>
                        <td className="py-2 px-3 text-emerald-400 text-[11px]">VERIFIED UNIQUE</td>
                      </tr>
                      <tr className="hover:bg-slate-900/50">
                        <td className="py-2 px-3 text-slate-400">source_domain</td>
                        <td className="py-2 px-3 text-white uppercase">{event.source}</td>
                        <td className="py-2 px-3 text-slate-400 text-[11px]">ACTIVE STREAM</td>
                      </tr>
                      {event.raw_details &&
                        Object.entries(event.raw_details).map(([key, val]) => (
                          <tr key={key} className="hover:bg-slate-900/50">
                            <td className="py-2 px-3 text-slate-400">{key}</td>
                            <td className="py-2 px-3 text-amber-200 font-semibold">
                              {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                            </td>
                            <td className="py-2 px-3 text-rose-400 text-[11px]">ANOMALY CRITERIA</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Raw JSON Code Block */}
              <div className="border border-slate-800 bg-[#040711] p-4">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
                  <span className="text-slate-400 font-bold">RAW JSON TELEMETRY FRAME</span>
                  <button
                    type="button"
                    onClick={handleCopyJson}
                    className="text-cyan-400 hover:text-cyan-300 text-[11px] cursor-pointer"
                  >
                    {copied ? '✓ COPIED' : 'COPY'}
                  </button>
                </div>
                <pre className="text-xs text-cyan-300 font-mono bg-black/70 p-3 overflow-x-auto max-h-56 border border-slate-900 leading-relaxed">
                  {JSON.stringify(event, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: KILL CHAIN & CORRELATION */}
          {activeTab === 'correlation' && (
            <div className="space-y-6">
              <div className="border border-slate-800 bg-[#070b16] p-4">
                <div className="text-xs font-bold text-cyan-400 uppercase pb-2 mb-3 border-b border-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    Multi-Vector Attack Progression Sequence
                  </span>
                  <span className="text-[10px] text-slate-500">INCIDENT REF: INC-00001</span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  {/* Step 1 */}
                  <div className={`p-3 border rounded-none flex items-start gap-3 ${
                    event.source === 'network'
                      ? 'border-cyan-400 bg-cyan-950/30'
                      : 'border-slate-800 bg-[#090f20]'
                  }`}>
                    <span className="px-2 py-0.5 bg-slate-900 border border-slate-700 text-cyan-300 font-bold text-[10px]">
                      STAGE 1
                    </span>
                    <div className="flex-1">
                      <div className="font-bold text-white flex items-center justify-between">
                        <span>Digital Network Reconnaissance (NSL-KDD SSH Brute Force)</span>
                        <span className="text-slate-400 text-[11px]">02:10:05 UTC</span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-1">
                        Repeated failed authentication attempts against SSH server from IP 10.0.0.5.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className={`p-3 border rounded-none flex items-start gap-3 ${
                    event.source === 'badge'
                      ? 'border-emerald-400 bg-emerald-950/30'
                      : 'border-slate-800 bg-[#090f20]'
                  }`}>
                    <span className="px-2 py-0.5 bg-slate-900 border border-slate-700 text-emerald-300 font-bold text-[10px]">
                      STAGE 2
                    </span>
                    <div className="flex-1">
                      <div className="font-bold text-white flex items-center justify-between">
                        <span>Physical RFID Turnstile Breach (Door D-114 Server Room)</span>
                        <span className="text-slate-400 text-[11px]">02:14:00 UTC</span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-1">
                        Employee badge HID-8849-042 scans into restricted server room during unauthorized after-hours window.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className={`p-3 border rounded-none flex items-start gap-3 ${
                    event.source === 'camera'
                      ? 'border-rose-400 bg-rose-950/30'
                      : 'border-slate-800 bg-[#090f20]'
                  }`}>
                    <span className="px-2 py-0.5 bg-slate-900 border border-slate-700 text-rose-300 font-bold text-[10px]">
                      STAGE 3
                    </span>
                    <div className="flex-1">
                      <div className="font-bold text-white flex items-center justify-between">
                        <span>Optical Video Surveillance Perimeter Breach (CAM-09 Vault)</span>
                        <span className="text-slate-400 text-[11px]">02:15:30 UTC</span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-1">
                        Physical intruder enters restricted server vault polygon (160, 70, 320, 240) with prolonged dwell time.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {onOpenReport && (
                <div className="bg-rose-950/30 border border-rose-800/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-rose-300 uppercase block">
                      Fully Correlated Threat Dossier Available
                    </span>
                    <span className="text-xs text-slate-400 mt-0.5 block">
                      All 3 stages are fused into a court-admissible forensic incident report.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenReport();
                    }}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold tracking-wider uppercase cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>VIEW INCIDENT DOSSIER</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SOC CONTAINMENT ACTION */}
          {activeTab === 'containment' && (
            <div className="space-y-5">
              <div className="border border-slate-800 bg-[#070b16] p-4 space-y-3">
                <div className="text-xs font-bold text-rose-400 uppercase pb-2 border-b border-slate-800 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-rose-400" />
                  <span>Immediate Zero-Trust Containment Playbook</span>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2 p-2 bg-[#090f20] border border-slate-800">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span>1. Instantly revoke employee_42 badge credentials at HID central turnstile controller</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-[#090f20] border border-slate-800">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span>2. Engage fail-secure electronic deadbolt locks on Server Room Door D-114</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-[#090f20] border border-slate-800">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span>3. Apply null-route firewall rule on upstream DMZ switch for IP 10.0.0.5</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleExecuteContainment}
                    disabled={containmentExecuted}
                    className={`w-full py-2.5 text-xs font-bold tracking-wider uppercase cursor-pointer flex items-center justify-center gap-2 border transition-all ${
                      containmentExecuted
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                        : 'bg-rose-950/80 hover:bg-rose-900 border-rose-500 text-rose-100 shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                    }`}
                  >
                    {containmentExecuted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>CONTAINMENT ACTIVE // ENTITY 42 CREDENTIALS REVOKED</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-rose-400 animate-bounce" />
                        <span>EXECUTE EMERGENCY CONTAINMENT PLAYBOOK</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#080d1a] border-t border-slate-800 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-500">
            Signal Verified: <span className="text-cyan-400">SHA256:3d9f...8a12</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenReport && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenReport();
                }}
                className="px-3 py-1.5 bg-[#0b1329] border border-cyan-800 text-cyan-300 font-bold hover:bg-cyan-950 cursor-pointer flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>INCIDENT REPORT</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold cursor-pointer"
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
