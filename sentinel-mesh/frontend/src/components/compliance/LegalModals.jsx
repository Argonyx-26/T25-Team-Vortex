import React from 'react';
import { X, Shield, Lock, FileText, CheckCircle2 } from 'lucide-react';

/**
 * LegalModals
 * Renders Terms & Conditions or Privacy Policy overlay modals.
 * Strictly adheres to no em dashes, literal technical compliance terms.
 */
export default function LegalModals({ activeModal, onClose }) {
  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="border border-cyan-500/60 bg-[#060a14] max-w-2xl w-full max-h-[85vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#080d1a]">
          <div className="flex items-center gap-2.5">
            {activeModal === 'terms' ? (
              <FileText className="w-5 h-5 text-cyan-400" />
            ) : (
              <Lock className="w-5 h-5 text-emerald-400" />
            )}
            <h2 className="font-mono text-sm font-bold text-slate-100 tracking-wider">
              {activeModal === 'terms' ? 'TERMS AND CONDITIONS // SENTINELMESH' : 'PRIVACY POLICY // TELEMETRY AUDIT'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 p-1 border border-transparent hover:border-slate-700 bg-black/40 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto font-mono text-xs text-slate-300 space-y-4 leading-relaxed">
          {activeModal === 'terms' ? (
            <>
              <div>
                <h4 className="text-cyan-400 font-bold mb-1">1. OPERATIONAL SCOPE AND USE</h4>
                <p className="text-slate-400">
                  SentinelMesh provides real-time multi-stream threat correlation across optical computer vision, physical access controls, and network traffic. Operators must utilize this software solely for authorized security monitoring and threat correlation within designated network infrastructure.
                </p>
              </div>

              <div>
                <h4 className="text-cyan-400 font-bold mb-1">2. AUTOMATED CORRELATION AND MITIGATION</h4>
                <p className="text-slate-400">
                  The correlation engine groups raw telemetry events and synthesizes recommended actions. All incident response actions (such as credential suspension or physical door lockouts) require operator confirmation or authorized automated playbook triggers.
                </p>
              </div>

              <div>
                <h4 className="text-cyan-400 font-bold mb-1">3. DATA INTEGRITY AND IMMUTABILITY</h4>
                <p className="text-slate-400">
                  Raw event streams ingested into the backend retain cryptographic timestamp verification. Operator dismissal actions and disposition updates are logged with audit trails.
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <h4 className="text-emerald-400 font-bold mb-1">1. TELEMETRY INGESTION AND RETENTION</h4>
                <p className="text-slate-400">
                  SentinelMesh ingests physical badge identifiers, optical YOLOv8 bounding telemetry, and packet flow metadata. No raw biometric video is permanently retained outside configured retention windows.
                </p>
              </div>

              <div>
                <h4 className="text-emerald-400 font-bold mb-1">2. OPERATOR ACCESS AUDIT LOGGING</h4>
                <p className="text-slate-400">
                  All incident queries, operator feedback notes, and notification acknowledgments are timestamped and attributed to active session credentials.
                </p>
              </div>

              <div>
                <h4 className="text-emerald-400 font-bold mb-1">3. ACCESS COMPLIANCE AND DATA REDACTION</h4>
                <p className="text-slate-400">
                  Sensor streams originating from public or non-restricted zones are masked by default. Only flagged high-severity sequences expose entity identifiers for incident review.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#080d1a] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-cyan-950/60 border border-cyan-600 text-cyan-300 font-mono text-xs hover:bg-cyan-900/60 cursor-pointer"
          >
            CONFIRM AND CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
