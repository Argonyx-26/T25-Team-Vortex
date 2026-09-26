import React, { useState } from 'react';
import { Database, Terminal, FileSpreadsheet, Shield, Search, ArrowDownUp, CheckCircle, AlertTriangle, Eye, Zap, Download, Layers } from 'lucide-react';
import nslkddRecords from '../../data/nslkdd_records.json';
import { API_BASE_URL } from '../../api';

export default function DigitalCsvEvidence() {
  const [filterType, setFilterType] = useState('all'); // 'all' | 'anomaly' | 'normal' | 'tcp' | 'icmp'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPacket, setSelectedPacket] = useState(nslkddRecords[0] || null);
  const [replayingPacketId, setReplayingPacketId] = useState(null);
  const [replayedStatus, setReplayedStatus] = useState(null);

  const filtered = nslkddRecords.filter((r) => {
    if (filterType === 'anomaly' && r.label !== 'anomaly') return false;
    if (filterType === 'normal' && r.label !== 'normal') return false;
    if (filterType === 'tcp' && r.protocol_type !== 'tcp') return false;
    if (filterType === 'icmp' && r.protocol_type !== 'icmp') return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        r.packet_id.toLowerCase().includes(q) ||
        r.service.toLowerCase().includes(q) ||
        r.ip.toLowerCase().includes(q) ||
        r.rule.toLowerCase().includes(q) ||
        r.protocol_type.toLowerCase().includes(q) ||
        r.flag.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const anomalyCount = nslkddRecords.filter((r) => r.label === 'anomaly').length;
  const normalCount = nslkddRecords.filter((r) => r.label === 'normal').length;

  // Handle replaying a real NSL-KDD packet into the live backend pipeline
  const handleReplayPacket = async (pkt) => {
    try {
      setReplayingPacketId(pkt.packet_id);
      setReplayedStatus(null);

      const payload = {
        event_id: `evt_kdd_${pkt.packet_id}_${Date.now().toString().slice(-4)}`,
        source: 'network',
        event_type: pkt.rule === 'brute_force_login' ? 'failed_login' : 'packet_anomaly',
        entity: { id: pkt.entity_id || 'employee_42', type: 'employee' },
        location: `${pkt.protocol_type}_${pkt.service}`,
        timestamp: new Date().toISOString(),
        severity: pkt.severity || 'medium',
        flagged: pkt.label === 'anomaly',
        rule_triggered: pkt.rule !== 'none' ? pkt.rule : null,
        raw_details: {
          protocol_type: pkt.protocol_type,
          service: pkt.service,
          flag: pkt.flag,
          src_bytes: pkt.src_bytes,
          dst_bytes: pkt.dst_bytes,
          dataset: 'NSL-KDD KDDTest+',
          num_failed_logins: pkt.num_failed_logins,
          count: pkt.count,
          ip: pkt.ip
        }
      };

      const res = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setReplayedStatus(`Packet ${pkt.packet_id} successfully injected into live correlation pipeline (HTTP 200)`);
      } else {
        setReplayedStatus(`Ingestion returned status ${res.status}`);
      }
    } catch (err) {
      setReplayedStatus(`Injection failed: ${err.message}`);
    } finally {
      setReplayingPacketId(null);
    }
  };

  const handleExportCsv = () => {
    const headers = ['packet_id', 'timestamp', 'protocol_type', 'service', 'flag', 'src_bytes', 'dst_bytes', 'num_failed_logins', 'count', 'label', 'rule', 'severity', 'ip'];
    const rows = filtered.map((r) => headers.map((h) => JSON.stringify(r[h] ?? '')).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'sentinel_mesh_nslkdd_evidence.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleJumpToCctv = () => {
    const el = document.getElementById('section-cctv');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="space-y-4 font-mono" id="section-digital-evidence">
      <div className="border border-slate-800 bg-[#060a14] p-5 lg:p-6 shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
        {/* Module Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-amber-500/40 bg-amber-950/30 flex items-center justify-center text-amber-400">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">[PHASE 05 // DIGITAL EVIDENCE]</span>
                <span className="text-[10px] px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                  REAL NSL-KDD BENCHMARK DATASET
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-100 tracking-wide mt-0.5">
                NSL-KDD Packet Capture Telemetry & Access Log Evidence
              </h3>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#080d1a] hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              title="Download real NSL-KDD dataset as CSV"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>EXPORT CSV</span>
            </button>

            <button
              type="button"
              onClick={handleJumpToCctv}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-600 text-rose-200 text-xs font-bold transition-colors cursor-pointer"
              title="Correlate with Physical CCTV Video Proof"
            >
              <Eye className="w-3.5 h-3.5 text-rose-400" />
              <span>CORRELATE CCTV</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pb-3 border-b border-slate-800/60">
          <div className="flex items-center bg-[#080d1a] border border-slate-800 p-0.5 text-xs flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 text-[11px] cursor-pointer ${
                filterType === 'all' ? 'bg-amber-950 text-amber-300 border border-amber-800 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ALL ({nslkddRecords.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('anomaly')}
              className={`px-2.5 py-1 text-[11px] cursor-pointer ${
                filterType === 'anomaly' ? 'bg-rose-950 text-rose-300 border border-rose-800 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ANOMALIES ({anomalyCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('normal')}
              className={`px-2.5 py-1 text-[11px] cursor-pointer ${
                filterType === 'normal' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              NORMAL ({normalCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('tcp')}
              className={`px-2.5 py-1 text-[11px] cursor-pointer ${
                filterType === 'tcp' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              TCP ONLY
            </button>
            <button
              type="button"
              onClick={() => setFilterType('icmp')}
              className={`px-2.5 py-1 text-[11px] cursor-pointer ${
                filterType === 'icmp' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ICMP ONLY
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search service, IP, rule..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#080d1a] border border-slate-800 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 w-56"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Live Replay Notice */}
        {replayedStatus && (
          <div className="mt-3 p-2.5 bg-emerald-950/40 border border-emerald-600 text-emerald-200 text-xs flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{replayedStatus}</span>
            </div>
            <button
              type="button"
              onClick={() => setReplayedStatus(null)}
              className="text-slate-400 hover:text-white text-[11px]"
            >
              ✕
            </button>
          </div>
        )}

        {/* Interactive Layout: Packet Table (Left) + Detailed Packet Inspector (Right) */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Table Container (8 cols) */}
          <div className="lg:col-span-8 border border-slate-800 bg-[#080d1a] overflow-x-auto max-h-[460px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-[#040814] border-b border-slate-800 text-slate-400 text-[10px] uppercase z-10">
                <tr>
                  <th className="py-2.5 px-3">PACKET ID</th>
                  <th className="py-2.5 px-3">PROTO</th>
                  <th className="py-2.5 px-3">SERVICE</th>
                  <th className="py-2.5 px-3">FLAG</th>
                  <th className="py-2.5 px-3">SRC / DST BYTES</th>
                  <th className="py-2.5 px-3">SOURCE IP</th>
                  <th className="py-2.5 px-3">RULE TRIGGER</th>
                  <th className="py-2.5 px-3 text-right">CLASS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.slice(0, 50).map((r) => {
                  const isSelected = selectedPacket?.packet_id === r.packet_id;
                  const isAnomaly = r.label === 'anomaly';
                  return (
                    <tr
                      key={r.packet_id}
                      onClick={() => setSelectedPacket(r)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-cyan-950/40 border-l-2 border-l-cyan-400'
                          : 'hover:bg-slate-900/50'
                      }`}
                    >
                      <td className="py-2 px-3 font-semibold text-cyan-300 whitespace-nowrap">
                        {r.packet_id}
                      </td>
                      <td className="py-2 px-3 uppercase text-slate-400 font-bold">{r.protocol_type}</td>
                      <td className="py-2 px-3 text-slate-200">{r.service}</td>
                      <td className="py-2 px-3 font-mono">
                        <span className={`px-1 py-0.2 text-[10px] border ${
                          r.flag === 'REJ'
                            ? 'bg-rose-950/70 border-rose-800 text-rose-300'
                            : r.flag === 'SF'
                            ? 'bg-emerald-950/70 border-emerald-800 text-emerald-300'
                            : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}>
                          {r.flag}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">
                        {r.src_bytes}B / {r.dst_bytes}B
                      </td>
                      <td className="py-2 px-3 text-slate-300 font-mono text-[11px]">{r.ip}</td>
                      <td className="py-2 px-3">
                        {r.rule !== 'none' ? (
                          <span className="text-amber-300 font-semibold">{r.rule}</span>
                        ) : (
                          <span className="text-slate-600">benign</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span
                          className={`text-[10px] px-1.5 py-0.2 uppercase font-bold border ${
                            isAnomaly
                              ? 'text-rose-300 bg-rose-950 border-rose-800'
                              : 'text-emerald-300 bg-emerald-950 border-emerald-800'
                          }`}
                        >
                          {r.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Packet Forensic Inspector Panel (4 cols) */}
          <div className="lg:col-span-4 border border-slate-800 bg-[#080d1a] p-4 text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                Packet Inspector
              </span>
              <span className="text-[10px] font-mono text-cyan-400">
                {selectedPacket?.packet_id || 'SELECT ROW'}
              </span>
            </div>

            {selectedPacket ? (
              <div className="space-y-3">
                <div className="p-3 bg-[#050914] border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Source IP:</span>
                    <span className="text-slate-100 font-bold">{selectedPacket.ip}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Protocol / Service:</span>
                    <span className="text-cyan-300 font-bold uppercase">{selectedPacket.protocol_type} / {selectedPacket.service}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">TCP Flag State:</span>
                    <span className="text-amber-300 font-mono font-bold">{selectedPacket.flag}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Payload Bytes:</span>
                    <span className="text-slate-300 font-mono">Src: {selectedPacket.src_bytes}B | Dst: {selectedPacket.dst_bytes}B</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Failed Logins:</span>
                    <span className="text-rose-400 font-bold">{selectedPacket.num_failed_logins}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Traffic Count:</span>
                    <span className="text-slate-300">{selectedPacket.count} connections</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800">
                    <span className="text-slate-400">Rule Triggered:</span>
                    <span className={`font-bold ${selectedPacket.rule !== 'none' ? 'text-rose-400' : 'text-slate-500'}`}>
                      {selectedPacket.rule}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Correlated Entity:</span>
                    <span className="text-emerald-400 font-bold">{selectedPacket.entity_id}</span>
                  </div>
                </div>

                {/* Inject into Pipeline Action */}
                <button
                  type="button"
                  onClick={() => handleReplayPacket(selectedPacket)}
                  disabled={replayingPacketId === selectedPacket.packet_id}
                  className="w-full py-2 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700 text-cyan-200 text-xs font-bold tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    {replayingPacketId === selectedPacket.packet_id ? 'INJECTING...' : 'INJECT PACKET INTO LIVE PIPELINE'}
                  </span>
                </button>
              </div>
            ) : (
              <div className="text-slate-500 text-center py-8">Select any packet row to inspect decoded fields.</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
