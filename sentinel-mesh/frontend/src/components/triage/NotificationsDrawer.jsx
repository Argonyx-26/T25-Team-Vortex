import React, { useState } from 'react';
import { Bell, AlertTriangle, CheckCircle, Clock, ShieldAlert, Check, Filter } from 'lucide-react';
import { acknowledgeNotification } from '../../api';

/**
 * NotificationsDrawer
 * Live notifications triage center.
 * Filters between:
 * - GET /notifications?type=alert
 * - GET /notifications?type=normal
 * Supports POST /notifications/<id>/acknowledge
 */
export default function NotificationsDrawer({ notifications = [], onAcknowledgeSuccess }) {
  const [filterType, setFilterType] = useState('all'); // 'all' | 'alert' | 'normal' | 'unhandled'
  const [ackingId, setAckingId] = useState(null);

  const handleAcknowledge = async (notifId) => {
    try {
      setAckingId(notifId);
      const res = await acknowledgeNotification(notifId);
      if (res && onAcknowledgeSuccess) {
        onAcknowledgeSuccess(res.notification || { id: notifId, handled: true });
      }
    } catch (err) {
      console.error('Failed to acknowledge notification:', err);
    } finally {
      setAckingId(null);
    }
  };

  const filtered = notifications.filter((n) => {
    if (filterType === 'alert') return n.type === 'alert';
    if (filterType === 'normal') return n.type === 'normal';
    if (filterType === 'unhandled') return !n.handled;
    return true;
  });

  const unhandledCount = notifications.filter((n) => !n.handled).length;
  const alertCount = notifications.filter((n) => n.type === 'alert').length;

  return (
    <section className="my-8" id="section-notifications">
      <div className="border border-slate-800 bg-[#060a14] p-5 lg:p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-rose-500/40 bg-rose-950/30 flex items-center justify-center text-rose-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-rose-400 uppercase tracking-widest">[NOTIFICATIONS TRIAGE]</span>
                {unhandledCount > 0 && (
                  <span className="font-mono text-[10px] px-1.5 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                    {unhandledCount} UNHANDLED
                  </span>
                )}
              </div>
              <h3 className="font-mono text-base font-bold text-slate-100 tracking-wide mt-0.5">
                Forecast Predictions & System Operational Alerts
              </h3>
            </div>
          </div>

          {/* Filter Segmented Controls */}
          <div className="flex items-center gap-1 bg-[#080d1a] border border-slate-800 p-1 font-mono text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 transition-colors cursor-pointer ${
                filterType === 'all'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ALL ({notifications.length})
            </button>
            <button
              onClick={() => setFilterType('alert')}
              className={`px-2.5 py-1 transition-colors cursor-pointer ${
                filterType === 'alert'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ALERTS ({alertCount})
            </button>
            <button
              onClick={() => setFilterType('normal')}
              className={`px-2.5 py-1 transition-colors cursor-pointer ${
                filterType === 'normal'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              NORMAL ({notifications.length - alertCount})
            </button>
            <button
              onClick={() => setFilterType('unhandled')}
              className={`px-2.5 py-1 transition-colors cursor-pointer ${
                filterType === 'unhandled'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              UNHANDLED ({unhandledCount})
            </button>
          </div>
        </div>

        {/* List of Notifications */}
        <div className="mt-4 space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-800 font-mono text-xs text-slate-500">
              No notifications matching the selected filter.
            </div>
          ) : (
            filtered.map((notif) => {
              const isAlert = notif.type === 'alert';
              return (
                <div
                  key={notif.id}
                  className={`p-3.5 border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    notif.handled
                      ? 'border-slate-800/60 bg-[#070b14]/50 opacity-60'
                      : isAlert
                      ? 'border-rose-900/60 bg-[#14080d] shadow-[0_0_15px_rgba(244,63,94,0.08)]'
                      : 'border-slate-800 bg-[#080d1a]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 flex-shrink-0 flex items-center justify-center border mt-0.5 ${
                        isAlert
                          ? 'border-rose-700 bg-rose-950 text-rose-400'
                          : 'border-emerald-700 bg-emerald-950 text-emerald-400'
                      }`}
                    >
                      {isAlert ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono text-[10px] px-1.5 py-0.2 border uppercase font-semibold ${
                            isAlert
                              ? 'border-rose-800 text-rose-300 bg-rose-950/80'
                              : 'border-emerald-800 text-emerald-300 bg-emerald-950/80'
                          }`}
                        >
                          {notif.type}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-200">
                          {notif.title}
                        </span>
                        {notif.handled && (
                          <span className="font-mono text-[10px] text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3" /> HANDLED
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-xs text-slate-400 mt-1 leading-normal">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-4 mt-2 font-mono text-[10px] text-slate-500">
                        <span>ID: {notif.id}</span>
                        {notif.incident_id && <span>LINKED: {notif.incident_id}</span>}
                        <span>TIME: {notif.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  {/* Acknowledge Button */}
                  {!notif.handled && (
                    <button
                      onClick={() => handleAcknowledge(notif.id)}
                      disabled={ackingId === notif.id}
                      className="px-3 py-1.5 font-mono text-xs text-cyan-300 border border-cyan-700/60 bg-cyan-950/40 hover:bg-cyan-900/60 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer self-end sm:self-center"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{ackingId === notif.id ? 'ACKING...' : 'ACKNOWLEDGE'}</span>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
