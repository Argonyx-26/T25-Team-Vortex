import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Activity,
  Radio,
  Eye,
  Terminal,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Cpu,
  Layers,
  ArrowRight,
  Sparkles,
  Zap,
  Lock,
  FileText,
  FileSpreadsheet
} from 'lucide-react';

import {
  checkOnlineStatus,
  getEvents,
  getIncidents,
  getIncidentWhy,
  getNotifications,
  updateIncidentStatus,
  dismissIncident,
  acknowledgeNotification,
  resetBackendPipeline,
  createSocketConnection,
  API_BASE_URL
} from '../api';

import CardNav from './navigation/CardNav';
import TargetCursor from './effects/TargetCursor';
import ClickSpark from './effects/ClickSpark';
import ScrollFloat from './effects/ScrollFloat';
import ConstellationCanvas from './constellation/ConstellationCanvas';
import CctvSensorView from './cctv/CctvSensorView';
import DigitalCsvEvidence from './evidence/DigitalCsvEvidence';
import NotificationsDrawer from './triage/NotificationsDrawer';
import LegalModals from './compliance/LegalModals';

export default function LandingDashboard() {
  // Navigation & Modal State
  const [activeTab, setActiveTab] = useState('constellation');
  const [activeLegalModal, setActiveLegalModal] = useState(null);

  // Live Backend Data States
  const [isOnline, setIsOnline] = useState(false);
  const [latency, setLatency] = useState(null);
  const [events, setEvents] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);

  // Filter States for Raw Telemetry
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [selectedSource, setSelectedSource] = useState('all');

  // Selected incident for constellation / detail view
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);

  // Poll GET / for online status indicator every 5 seconds
  const pollOnlineStatus = useCallback(async () => {
    try {
      const res = await checkOnlineStatus();
      if (res && res.status === 'ok') {
        setIsOnline(true);
        setLatency(res.latency || 10);
      } else {
        setIsOnline(false);
        setLatency(null);
      }
    } catch {
      setIsOnline(false);
      setLatency(null);
    }
  }, []);

  // Fetch full data snapshot
  const fetchSnapshot = useCallback(async () => {
    try {
      const [eventsData, incidentsData, notifsData] = await Promise.all([
        getEvents(flaggedOnly),
        getIncidents(),
        getNotifications()
      ]);
      if (eventsData) setEvents(eventsData);
      if (incidentsData) {
        setIncidents(incidentsData);
        if (incidentsData.length > 0 && !selectedIncidentId) {
          setSelectedIncidentId(incidentsData[0].incident_id);
        }
      }
      if (notifsData) setNotifications(notifsData);
    } catch (err) {
      console.warn('Backend snapshot notice:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [flaggedOnly, selectedIncidentId]);

  // Initial Load + Intervals + Socket.IO
  useEffect(() => {
    pollOnlineStatus();
    fetchSnapshot();

    const onlineInterval = setInterval(pollOnlineStatus, 5000);
    const dataInterval = setInterval(fetchSnapshot, 3500);

    const socket = createSocketConnection({
      onConnect: () => setSocketConnected(true),
      onDisconnect: () => setSocketConnected(false),
      onEvent: (newEvent) => {
        setEvents((prev) => {
          if (prev.some((e) => e.event_id === newEvent.event_id)) return prev;
          return [newEvent, ...prev];
        });
      },
      onIncident: (newInc) => {
        setIncidents((prev) => {
          const filtered = prev.filter((i) => i.incident_id !== newInc.incident_id);
          return [newInc, ...filtered];
        });
      },
      onNotification: (newNotif) => {
        setNotifications((prev) => {
          const filtered = prev.filter((n) => n.id !== newNotif.id);
          return [newNotif, ...filtered];
        });
      }
    });

    return () => {
      clearInterval(onlineInterval);
      clearInterval(dataInterval);
      if (socket) socket.disconnect();
    };
  }, [pollOnlineStatus, fetchSnapshot]);

  // Handle Pipeline Reset
  const handleReset = async () => {
    try {
      setIsResetting(true);
      await resetBackendPipeline();
      await fetchSnapshot();
    } catch (err) {
      console.error('Reset failed:', err);
    } finally {
      setIsResetting(false);
    }
  };

  // Trigger simulated multi-step attack event
  const handleSimulateAttackStep = async () => {
    const timestamp = new Date().toISOString();
    const mockStep = {
      event_id: `evt_sim_${Date.now().toString().slice(-5)}`,
      source: 'network',
      event_type: 'data_transfer_spike',
      entity: { id: 'employee_42', type: 'employee' },
      location: 'dmz_gateway',
      timestamp: timestamp,
      severity: 'high',
      flagged: true,
      rule_triggered: 'data_transfer_spike',
      raw_details: { bytes_outbound: 104857600, target_ip: '198.51.100.42', protocol: 'https' }
    };

    try {
      await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockStep)
      });
      await fetchSnapshot();
    } catch (err) {
      console.error('Simulate step failed:', err);
    }
  };

  // Filtered Events List
  const filteredEvents = events.filter((e) => {
    if (flaggedOnly && !e.flagged) return false;
    if (selectedSource !== 'all' && e.source !== selectedSource) return false;
    return true;
  });

  const flaggedCount = events.filter((e) => e.flagged).length;
  const alertNotifCount = notifications.filter((n) => n.type === 'alert' && !n.handled).length;

  return (
    <div className="min-h-screen bg-[#030611] text-slate-100 font-mono relative selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Precision Reticle Target Cursor & Click Spark Canvas */}
      <TargetCursor />
      <ClickSpark />

      {/* Segmented Modular Card Navigation Bar */}
      <CardNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onlineStatus={isOnline}
        latency={latency}
        eventCount={events.length}
        incidentCount={incidents.length}
        alertCount={alertNotifCount}
        onOpenLegalModal={setActiveLegalModal}
        onReset={handleReset}
        isResetting={isResetting}
      />

      {/* Main Command Center Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-12">
        {/* TOP HERO & SYSTEM METRICS */}
        <section className="border border-slate-800 bg-[#050917] p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-2 text-xs text-cyan-400 font-bold tracking-widest uppercase">
                <span className="w-2 h-2 bg-cyan-400 animate-ping inline-block" />
                <span>SENTINELMESH MULTI-VECTOR THREAT ENGINE</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-100 tracking-tight leading-tight">
                Physical Video Proof & Digital Telemetry Convergence
              </h1>
              <p className="text-xs lg:text-sm text-slate-400 mt-2 leading-relaxed">
                Autonomous real-time correlation fusing optical YOLOv8 loitering detection, physical RFID badge access, and NSL-KDD packet flow streams into a unified threat constellation.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSimulateAttackStep}
                className="flex items-center gap-2 px-4 py-2 bg-rose-950/60 hover:bg-rose-900 border border-rose-600 text-rose-200 text-xs font-bold tracking-wider transition-colors cursor-pointer"
              >
                <Zap className="w-4 h-4 text-rose-400" />
                <span>INJECT ATTACK STAGE</span>
              </button>
            </div>
          </div>

          {/* KPI Metrics */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80 pt-5">
            <div className="border border-slate-800 bg-[#080d1a] p-3.5">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest">INGESTED TELEMETRY</div>
              <div className="text-xl font-bold text-slate-100 mt-1">
                {isLoading ? <div className="h-6 w-16 bg-slate-800 animate-pulse" /> : events.length}
              </div>
            </div>

            <div className="border border-slate-800 bg-[#080d1a] p-3.5">
              <div className="text-[10px] text-amber-500 uppercase tracking-widest">RULE FLAGGED</div>
              <div className="text-xl font-bold text-amber-400 mt-1">
                {isLoading ? <div className="h-6 w-12 bg-slate-800 animate-pulse" /> : flaggedCount}
              </div>
            </div>

            <div className="border border-slate-800 bg-[#080d1a] p-3.5">
              <div className="text-[10px] text-rose-500 uppercase tracking-widest">FUSED CONSTELLATIONS</div>
              <div className="text-xl font-bold text-rose-400 mt-1">
                {isLoading ? <div className="h-6 w-12 bg-slate-800 animate-pulse" /> : incidents.length}
              </div>
            </div>

            <div className="border border-slate-800 bg-[#080d1a] p-3.5">
              <div className="text-[10px] text-cyan-500 uppercase tracking-widest">PENDING ALERTS</div>
              <div className="text-xl font-bold text-cyan-300 mt-1">
                {isLoading ? <div className="h-6 w-12 bg-slate-800 animate-pulse" /> : alertNotifCount}
              </div>
            </div>
          </div>
        </section>

        {/* MODULE 1: THREAT CONSTELLATION CANVAS */}
        <section id="section-constellation" className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>MODULE 01 // THREAT CONSTELLATION CANVAS</span>
          </div>
          <ConstellationCanvas
            events={events}
            incidents={incidents}
            selectedIncidentId={selectedIncidentId}
            onSelectIncident={(id) => setSelectedIncidentId(id)}
          />
        </section>

        {/* MODULE 2: PHYSICAL CCTV FORENSIC EVIDENCE */}
        <section id="section-cctv" className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-rose-400 font-bold uppercase tracking-wider">
            <Eye className="w-4 h-4 text-rose-400" />
            <span>MODULE 02 // PHYSICAL FORENSIC VIDEO EVIDENCE</span>
          </div>
          <CctvSensorView />
        </section>

        {/* MODULE 3: DIGITAL CSV TELEMETRY & PACKET EVIDENCE */}
        <section id="section-digital-csv" className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-amber-400 font-bold uppercase tracking-wider">
            <FileSpreadsheet className="w-4 h-4 text-amber-400" />
            <span>MODULE 03 // DIGITAL CSV TELEMETRY EVIDENCE (NSL-KDD + ACCESS LOGS)</span>
          </div>
          <DigitalCsvEvidence />
        </section>

        {/* MODULE 4: OPERATIONAL NOTIFICATIONS TRIAGE */}
        <section id="section-notifications" className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-cyan-400" />
            <span>MODULE 04 // OPERATIONAL NOTIFICATIONS TRIAGE</span>
          </div>
          <NotificationsDrawer
            notifications={notifications}
            onAcknowledgeSuccess={(updatedNotif) => {
              setNotifications((prev) =>
                prev.map((n) => (n.id === updatedNotif.id ? { ...n, handled: true } : n))
              );
            }}
          />
        </section>

        {/* MODULE 5: RAW MULTI-STREAM TELEMETRY INGESTION */}
        <section id="section-telemetry" className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-wider">
            <Terminal className="w-4 h-4 text-slate-400" />
            <span>MODULE 05 // RAW TELEMETRY INGESTION BUFFER (/events)</span>
          </div>
          <div className="border border-slate-800 bg-[#060a14] p-5 lg:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100">Live Telemetry Ingestion Log</h3>
                <div className="text-xs text-slate-400 mt-0.5">Continuous stream of camera, badge, and network events</div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setFlaggedOnly(!flaggedOnly)}
                  className={`px-3 py-1 border transition-colors cursor-pointer ${
                    flaggedOnly
                      ? 'border-amber-500 bg-amber-950 text-amber-300 font-bold'
                      : 'border-slate-800 bg-[#080d1a] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  FLAGGED ONLY ({flaggedCount})
                </button>

                <div className="flex items-center bg-[#080d1a] border border-slate-800 p-0.5">
                  {['all', 'network', 'badge', 'camera'].map((src) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setSelectedSource(src)}
                      className={`px-2.5 py-1 uppercase text-[11px] cursor-pointer ${
                        selectedSource === src
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {src}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#080d1a] text-slate-400 text-[10px] uppercase">
                    <th className="py-2.5 px-3">EVENT ID</th>
                    <th className="py-2.5 px-3">TIMESTAMP</th>
                    <th className="py-2.5 px-3">SOURCE</th>
                    <th className="py-2.5 px-3">TYPE</th>
                    <th className="py-2.5 px-3">ENTITY</th>
                    <th className="py-2.5 px-3">LOCATION</th>
                    <th className="py-2.5 px-3">RULE TRIGGERED</th>
                    <th className="py-2.5 px-3 text-right">SEVERITY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredEvents.map((e) => (
                    <tr key={e.event_id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-2 px-3 text-cyan-300 font-semibold">{e.event_id}</td>
                      <td className="py-2 px-3 text-slate-400 text-[11px]">{e.timestamp}</td>
                      <td className="py-2 px-3">
                        <span className="px-1.5 py-0.5 text-[10px] uppercase bg-slate-800 text-slate-300 border border-slate-700">
                          {e.source}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-200">{e.event_type}</td>
                      <td className="py-2 px-3 text-emerald-300">{e.entity?.id}</td>
                      <td className="py-2 px-3 text-slate-400">{e.location || 'remote'}</td>
                      <td className="py-2 px-3">
                        {e.rule_triggered ? (
                          <span className="text-amber-300 font-semibold">{e.rule_triggered}</span>
                        ) : (
                          <span className="text-slate-600">none</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span
                          className={`text-[10px] px-1.5 py-0.2 uppercase font-bold ${
                            e.severity === 'high' || e.severity === 'critical'
                              ? 'text-rose-400 bg-rose-950/60 border border-rose-800'
                              : e.severity === 'medium'
                              ? 'text-amber-400 bg-amber-950/60 border border-amber-800'
                              : 'text-slate-400'
                          }`}
                        >
                          {e.severity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Telemetry Status (ScrollFloat) */}
      <ScrollFloat
        latency={latency}
        eventCount={events.length}
        flaggedCount={flaggedCount}
        incidentCount={incidents.length}
        socketConnected={socketConnected}
      />

      {/* Compliance Modals */}
      <LegalModals
        activeModal={activeLegalModal}
        onClose={() => setActiveLegalModal(null)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#02040a] mt-16 px-4 lg:px-8 py-8 text-slate-500 text-xs font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-slate-300 font-bold">SENTINELMESH CORRELATION ENGINE</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Pitch Ready • Multi-Vector Physical and Digital Telemetry Convergence
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              type="button"
              onClick={() => setActiveLegalModal('terms')}
              className="hover:text-cyan-300 cursor-pointer"
            >
              TERMS AND CONDITIONS
            </button>
            <span>/</span>
            <button
              type="button"
              onClick={() => setActiveLegalModal('privacy')}
              className="hover:text-emerald-300 cursor-pointer"
            >
              PRIVACY POLICY
            </button>
            <span>/</span>
            <span className="text-slate-400">PORT 5000 LIVE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
