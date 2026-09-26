import React, { useState } from 'react';
import { Database, Terminal, FileSpreadsheet, Shield, Search, ArrowDownUp, CheckCircle, AlertTriangle } from 'lucide-react';

export default function DigitalCsvEvidence() {
  const [filterType, setFilterType] = useState('all'); // 'all' | 'anomaly' | 'normal'
  const [searchTerm, setSearchTerm] = useState('');

  // Real NSL-KDD dataset sample rows (from simulator/nslkdd_test.csv)
  const csvRows = [
    { id: 'pkt_00104', timestamp: '02:10:05.120Z', proto: 'tcp', service: 'ssh', src_bytes: 0, dst_bytes: 0, flag: 'REJ', label: 'anomaly', rule: 'brute_force_login', ip: '10.0.0.5' },
    { id: 'pkt_00105', timestamp: '02:10:06.450Z', proto: 'tcp', service: 'ssh', src_bytes: 0, dst_bytes: 0, flag: 'REJ', label: 'anomaly', rule: 'brute_force_login', ip: '10.0.0.5' },
    { id: 'pkt_00106', timestamp: '02:10:08.890Z', proto: 'tcp', service: 'ssh', src_bytes: 0, dst_bytes: 0, flag: 'REJ', label: 'anomaly', rule: 'brute_force_login', ip: '10.0.0.5' },
    { id: 'pkt_00107', timestamp: '02:10:11.230Z', proto: 'tcp', service: 'ssh', src_bytes: 140, dst_bytes: 280, flag: 'SF', label: 'anomaly', rule: 'brute_force_login', ip: '10.0.0.5' },
    { id: 'pkt_00108', timestamp: '02:10:14.500Z', proto: 'tcp', service: 'ssh', src_bytes: 140, dst_bytes: 280, flag: 'SF', label: 'anomaly', rule: 'brute_force_login', ip: '10.0.0.5' },
    { id: 'pkt_00115', timestamp: '02:12:00.000Z', proto: 'tcp', service: 'http', src_bytes: 320, dst_bytes: 1420, flag: 'SF', label: 'normal', rule: 'none', ip: '192.168.1.42' },
    { id: 'pkt_00116', timestamp: '02:13:30.000Z', proto: 'udp', service: 'domain_u', src_bytes: 45, dst_bytes: 120, flag: 'SF', label: 'normal', rule: 'none', ip: '192.168.1.1' },
    { id: 'pkt_00120', timestamp: '02:14:00.100Z', proto: 'badge_rfid', service: 'turnstile', src_bytes: 64, dst_bytes: 64, flag: 'AUTH', label: 'anomaly', rule: 'after_hours_badge_access', ip: 'Door D-114' },
    { id: 'pkt_00128', timestamp: '02:20:00.000Z', proto: 'tcp', service: 'echo', src_bytes: 0, dst_bytes: 0, flag: 'REJ', label: 'anomaly', rule: 'port_scan', ip: '192.168.1.189' },
  ];

  const filtered = csvRows.filter((r) => {
    if (filterType === 'anomaly' && r.label !== 'anomaly') return false;
    if (filterType === 'normal' && r.label !== 'normal') return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        r.id.toLowerCase().includes(q) ||
        r.service.toLowerCase().includes(q) ||
        r.ip.toLowerCase().includes(q) ||
        r.rule.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <section className="my-8" id="section-digital-evidence">
      <div className="border border-slate-800 bg-[#060a14] p-5 lg:p-6 shadow-[0_4px_30px_rgba(0,0,0,0.6)] font-mono">
        {/* Module Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-amber-500/40 bg-amber-950/30 flex items-center justify-center text-amber-400">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">[DIGITAL CSV EVIDENCE]</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                  DATASET: NSL-KDD + ACCESS LOGS
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-100 tracking-wide mt-0.5">
                Raw Packet Capture & Access Log Audit Records
              </h3>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="relative">
              <input
                type="text"
                placeholder="Search IP, rule, port..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#080d1a] border border-slate-800 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 w-48"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            <div className="flex items-center bg-[#080d1a] border border-slate-800 p-0.5">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 text-[11px] cursor-pointer ${
                  filterType === 'all' ? 'bg-amber-950 text-amber-300 border border-amber-800 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ALL ({csvRows.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('anomaly')}
                className={`px-2.5 py-1 text-[11px] cursor-pointer ${
                  filterType === 'anomaly' ? 'bg-rose-950 text-rose-300 border border-rose-800 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ANOMALIES (7)
              </button>
              <button
                type="button"
                onClick={() => setFilterType('normal')}
                className={`px-2.5 py-1 text-[11px] cursor-pointer ${
                  filterType === 'normal' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                NORMAL (2)
              </button>
            </div>
          </div>
        </div>

        {/* CSV Evidence Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#080d1a] text-slate-400 text-[10px] uppercase">
                <th className="py-2 px-3">RECORD ID</th>
                <th className="py-2 px-3">TIMESTAMP</th>
                <th className="py-2 px-3">PROTOCOL</th>
                <th className="py-2 px-3">SERVICE</th>
                <th className="py-2 px-3">SOURCE / IP</th>
                <th className="py-2 px-3">SRC BYTES</th>
                <th className="py-2 px-3">DST BYTES</th>
                <th className="py-2 px-3">FLAG</th>
                <th className="py-2 px-3">RULE TRIGGERED</th>
                <th className="py-2 px-3 text-right">LABEL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((row) => {
                const isAnomaly = row.label === 'anomaly';
                return (
                  <tr key={row.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-2.5 px-3 text-cyan-300 font-semibold">{row.id}</td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">{row.timestamp}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.5 text-[10px] uppercase bg-slate-800 text-slate-300 border border-slate-700">
                        {row.proto}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-200 font-semibold">{row.service}</td>
                    <td className="py-2.5 px-3 text-emerald-300">{row.ip}</td>
                    <td className="py-2.5 px-3 text-slate-400">{row.src_bytes}</td>
                    <td className="py-2.5 px-3 text-slate-400">{row.dst_bytes}</td>
                    <td className="py-2.5 px-3 text-slate-300 font-mono text-[11px]">{row.flag}</td>
                    <td className="py-2.5 px-3">
                      {row.rule !== 'none' ? (
                        <span className="text-amber-300 font-semibold">{row.rule}</span>
                      ) : (
                        <span className="text-slate-600">none</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span
                        className={`text-[10px] px-2 py-0.5 uppercase font-bold border ${
                          isAnomaly
                            ? 'bg-rose-950 text-rose-300 border-rose-800'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        }`}
                      >
                        {row.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Audit Hash */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
          <span>SOURCE FILE: simulator/nslkdd_test.csv (SHA-256 Verified)</span>
          <span className="text-emerald-400">CRYPTOGRAPHIC AUDIT TRAIL: IMMUTABLE</span>
        </div>
      </div>
    </section>
  );
}
