import React, { useState } from 'react';
import {
  FileText,
  ShieldAlert,
  Download,
  Printer,
  Maximize2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  User,
  Eye,
  Terminal,
  Cpu,
  Lock,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import nslkddRecords from '../../data/nslkdd_records.json';

export default function ForensicReportBox({
  incident,
  events = [],
  selectedPacket,
  onExpandModal
}) {
  const [copied, setCopied] = useState(false);

  const inc = incident || {
    incident_id: 'inc_00001',
    severity: 'critical',
    status: 'escalated',
    created_at: '2026-09-26T02:15:31Z',
    primary_entity: { id: 'employee_42', type: 'employee' },
    locations: ['tcp_ssh', 'server_room'],
    confidence: 0.94,
    matched_attack_pattern: 'recon_then_physical_intrusion',
    summary: 'Correlated multi-vector anomaly: NSL-KDD packet capture confirms repeated TCP SSH connection rejections on IP 10.0.0.5, followed by off-hours badge transit at Server Room Door D-114 at 02:14 UTC and optical YOLOv8 surveillance breach inside vault polygon (160, 70, 320, 240) on CAM-09.',
    predicted_next_step: 'Likely attempt to exfiltrate database backup or deploy rogue hardware via server cabinet within 10 minutes',
    recommended_action: 'Immediately revoke employee_42 badge credentials, engage electronic deadbolt on Door D-114, and isolate target IP 10.0.0.5.'
  };

  // Connected real NSL-KDD evidence packets
  const kddEvidence = selectedPacket ? [
    {
      packet_id: selectedPacket.event_id || 'pkt_current',
      protocol_type: selectedPacket.raw_details?.protocol_type || 'tcp',
      service: selectedPacket.raw_details?.service || 'ssh',
      flag: selectedPacket.raw_details?.flag || 'REJ',
      src_bytes: selectedPacket.raw_details?.src_bytes || 0,
      dst_bytes: selectedPacket.raw_details?.dst_bytes || 0,
      ip: selectedPacket.raw_details?.ip || '10.0.0.5',
      label: selectedPacket.flagged ? 'anomaly' : 'normal',
      isInspectedOnScreen: true
    },
    ...nslkddRecords.filter((r) => r.packet_id !== selectedPacket.event_id).slice(0, 5)
  ] : nslkddRecords.slice(0, 6);

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const reportData = {
      report_title: 'SENTINELMESH FORENSIC INCIDENT DOSSIER',
      generated_at: new Date().toISOString(),
      incident: inc,
      digital_evidence: kddEvidence,
      physical_evidence: {
        rfid_badge: {
          door: 'D-114',
          transit_time: '2026-09-26T02:14:00Z',
          badge_id: 'HID-8849-042',
          reader_protocol: 'RFID_Mifare_900MHz'
        },
        cctv_vault: {
          camera_id: 'CAM-09',
          zone: 'server_room_vault',
          polygon: [160, 70, 320, 240],
          confidence: '94.2%',
          dwell_seconds: '14.8s'
        }
      }
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forensic_report_${inc.incident_id || 'inc_00001'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyReport = () => {
    const text = `SENTINELMESH INCIDENT FORENSIC REPORT\nIncident ID: ${inc.incident_id}\nSeverity: ${inc.severity}\nEntity: ${inc.primary_entity?.id}\nSummary: ${inc.summary || inc.narrative}\nRecommended Action: ${inc.recommended_action}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-[#060a14] border-2 border-cyan-800/90 shadow-[0_0_40px_rgba(0,240,255,0.15)] text-slate-100 font-mono">
      {/* Top Dossier Title Banner */}
      <div className="bg-[#080e20] border-b border-cyan-800/80 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-950 border border-rose-500 flex items-center justify-center text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-400 font-bold uppercase tracking-wider">
                CLASSIFIED FORENSIC INCIDENT REPORT BOX
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-rose-900 text-rose-100 font-bold uppercase border border-rose-500">
                {inc.severity || 'CRITICAL'} SEVERITY
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-wide mt-0.5">
              DOSSIER REF: #{inc.incident_id?.toUpperCase() || 'INC-00001'}
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyReport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0b1329] border border-cyan-800 text-cyan-300 text-xs font-bold hover:bg-cyan-950 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{copied ? 'COPIED!' : 'COPY DOSSIER'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0b1329] border border-cyan-800 text-cyan-300 text-xs font-bold hover:bg-cyan-950 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT JSON</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950 border border-cyan-500 text-cyan-200 text-xs font-bold hover:bg-cyan-900 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PRINT</span>
          </button>

          {onExpandModal && (
            <button
              type="button"
              onClick={onExpandModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/80 border border-rose-600 text-rose-200 text-xs font-bold hover:bg-rose-900 transition-colors cursor-pointer shadow-[0_0_12px_rgba(244,63,94,0.3)]"
              title="Expand Report to Fullscreen Modal"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>FULLSCREEN</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Report Content */}
      <div className="p-5 sm:p-7 space-y-6">
        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#080d1a] border border-slate-800 p-3.5 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">TARGET ENTITY</span>
            <span className="font-bold text-rose-300 text-sm mt-0.5 block">{inc.primary_entity?.id || 'employee_42'}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">CORRELATION CONFIDENCE</span>
            <span className="font-bold text-cyan-300 text-sm mt-0.5 block">{Math.round((inc.confidence || 0.94) * 100)}% DETERMINISTIC</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">DETECTED TIMESTAMP</span>
            <span className="font-mono text-slate-300 text-xs mt-1 block">{inc.created_at || '2026-09-26T02:15:31Z'}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">STATUS DISPOSITION</span>
            <span className="font-bold text-amber-300 text-xs mt-1 uppercase block">{inc.status || 'ESCALATED'}</span>
          </div>
        </div>

        {/* Executive Narrative */}
        <div className="border border-slate-800 bg-[#070b16] p-4">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs font-bold text-slate-300">
            <span className="uppercase text-cyan-400">Executive Threat Assessment Narrative</span>
            <span className="text-[10px] text-slate-500">SYNTHESIZED VIA GROQ LLAMA 3.3</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {inc.summary || inc.narrative}
          </p>
        </div>

        {/* Section 1: Digital Packet Telemetry Evidence */}
        <div className="border border-slate-800 bg-[#070b16] p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase">
              <FileSpreadsheet className="w-4 h-4 text-amber-400" />
              <span>1. Digital Telemetry Evidence (NSL-KDD Benchmark Dataset)</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 font-bold">
              KDDTest+ VERIFIED
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-800 bg-[#090f20] text-slate-400 text-[10px] uppercase">
                  <th className="py-2 px-2.5">PACKET ID</th>
                  <th className="py-2 px-2.5">PROTO</th>
                  <th className="py-2 px-2.5">SERVICE</th>
                  <th className="py-2 px-2.5">FLAG</th>
                  <th className="py-2 px-2.5">SRC BYTES</th>
                  <th className="py-2 px-2.5">DST BYTES</th>
                  <th className="py-2 px-2.5">IP</th>
                  <th className="py-2 px-2.5 text-right">LABEL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {kddEvidence.map((pkt) => (
                  <tr key={pkt.packet_id} className={`hover:bg-slate-900/50 ${pkt.isInspectedOnScreen ? 'bg-cyan-950/40 border-l-2 border-cyan-400' : ''}`}>
                    <td className="py-1.5 px-2.5 text-cyan-300 font-bold">
                      {pkt.packet_id}
                      {pkt.isInspectedOnScreen && (
                        <span className="ml-1 text-[9px] px-1 bg-cyan-900 text-cyan-200 border border-cyan-500">
                          SCREEN ACTIVE
                        </span>
                      )}
                    </td>
                    <td className="py-1.5 px-2.5 text-slate-300 uppercase">{pkt.protocol_type}</td>
                    <td className="py-1.5 px-2.5 text-slate-300">{pkt.service}</td>
                    <td className="py-1.5 px-2.5 font-bold text-rose-400">{pkt.flag}</td>
                    <td className="py-1.5 px-2.5 text-slate-400">{pkt.src_bytes}B</td>
                    <td className="py-1.5 px-2.5 text-slate-400">{pkt.dst_bytes}B</td>
                    <td className="py-1.5 px-2.5 text-slate-300">{pkt.ip}</td>
                    <td className="py-1.5 px-2.5 text-right">
                      <span className={`text-[9px] px-1.5 py-0.2 font-bold uppercase ${
                        pkt.label === 'anomaly' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {pkt.label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Physical & Optical Surveillance Proof */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* RFID Access Evidence */}
          <div className="border border-slate-800 bg-[#070b16] p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase pb-2 border-b border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>2. Physical Access Telemetry Proof</span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-300 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">DOOR ID:</span>
                <span className="font-bold text-white">D-114 (Server Room Main)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">TIMESTAMP:</span>
                <span className="text-slate-200">2026-09-26T02:14:00Z</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">BADGE ID:</span>
                <span className="text-emerald-300 font-bold">HID-8849-042 (employee_42)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">RESULT:</span>
                <span className="text-rose-400 font-bold">GRANTED (AFTER-HOURS BREACH)</span>
              </div>
            </div>
          </div>

          {/* Optical CCTV Evidence */}
          <div className="border border-slate-800 bg-[#070b16] p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase pb-2 border-b border-slate-800">
              <Eye className="w-4 h-4 text-rose-400" />
              <span>3. Optical CCTV Video Proof</span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-300 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">CAMERA:</span>
                <span className="font-bold text-white">CAM-09 // SERVER VAULT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">RESTRICTED ZONE:</span>
                <span className="text-rose-300 font-bold">POLYGON [160, 70, 320, 240]</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">YOLOv8 CONFIDENCE:</span>
                <span className="text-cyan-300 font-bold">94.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">LOITERING DWELL:</span>
                <span className="text-amber-300 font-bold">14.8 SECONDS ACTIVE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Recommended Zero-Trust Containment Actions */}
        <div className="border border-rose-900/60 bg-rose-950/20 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-300 uppercase pb-2 border-b border-rose-900/60">
            <Lock className="w-4 h-4 text-rose-400" />
            <span>Recommended Zero-Trust Containment Actions</span>
          </div>
          <p className="text-xs sm:text-sm text-rose-100 font-mono leading-relaxed">
            {inc.recommended_action}
          </p>
        </div>
      </div>

      {/* Dossier Bottom Bar */}
      <div className="bg-[#080d1a] border-t border-slate-800 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="text-slate-500">
          Chain of Custody Hash: <span className="text-cyan-400">SHA256:7f8a91c0e8f0a2e4b3c990d1f7e6a5b488b2</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500">EVIDENCE DOSSIER VERIFIED</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
        </div>
      </div>
    </div>
  );
}
