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
  FileSpreadsheet,
  GitMerge
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
import PanelRawStream from './panels/PanelRawStream';
import PanelFlaggedEvents from './panels/PanelFlaggedEvents';
import PanelFusionAnimation from './panels/PanelFusionAnimation';
import DigitalCsvEvidence from './evidence/DigitalCsvEvidence';
import PanelIncidentCard from './panels/PanelIncidentCard';
import CctvSensorView from './cctv/CctvSensorView';
import PanelActionFatigue from './panels/PanelActionFatigue';
import NotificationsDrawer from './triage/NotificationsDrawer';
import LegalModals from './compliance/LegalModals';
import ForensicIncidentReportModal from './reports/ForensicIncidentReportModal';
import ForensicReportBox from './reports/ForensicReportBox';

export default function LandingDashboard() {
  // Navigation & Modal State
  const [activeTab, setActiveTab] = useState('constellation');
  const [activeLegalModal, setActiveLegalModal] = useState(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [liveIntrusionAlert, setLiveIntrusionAlert] = useState(null);
  const [operatorLoad, setOperatorLoad] = useState('normal'); // 'normal' | 'high'

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

  // Status updates & incident actions
  const handleUpdateStatus = async (incidentId, newStatus) => {
    try {
      await updateIncidentStatus(incidentId, newStatus);
      setIncidents((prev) =>
        prev.map((inc) => (inc.incident_id === incidentId ? { ...inc, status: newStatus } : inc))
      );
    } catch (err) {
      console.error('Update status failed:', err);
    }
  };

  const handleDismissIncident = async (incidentId) => {
    try {
      await dismissIncident(incidentId);
      setIncidents((prev) => prev.filter((inc) => inc.incident_id !== incidentId));
    } catch (err) {
      console.error('Dismiss incident failed:', err);
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
  const activeIncident = incidents.find((i) => i.incident_id === selectedIncidentId) || incidents[0];

  // Handle immediate CCTV zone intrusion alert
  const handleCctvAlert = (alertEvent, alertNotif) => {
    setLiveIntrusionAlert(alertNotif);
    if (alertNotif) {
      setNotifications((prev) => [alertNotif, ...prev.filter((n) => n.id !== alertNotif.id)]);
    }
    if (alertEvent) {
      setEvents((prev) => [alertEvent, ...prev.filter((e) => e.event_id !== alertEvent.event_id)]);
    }
  };

  return (
    <div className="min-h-screen bg-[#030611] text-slate-100 font-mono relative selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Precision Reticle Target Cursor & Click Spark Canvas */}
      <TargetCursor />
      <ClickSpark />

      {/* Segmented Modular Card Navigation Bar for All 6 Modules */}
      <CardNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onlineStatus={isOnline}
        latency={latency}
        eventCount={events.length}
        incidentCount={incidents.length}
        alertCount={alertNotifCount}
        flaggedCount={flaggedCount}
        onOpenLegalModal={setActiveLegalModal}
        onOpenReport={() => setIsReportOpen(true)}
        onReset={handleReset}
        isResetting={isResetting}
      />

      {/* DYNAMIC INTRUSION ALERT BANNER (Shows immediately when person enters restricted area!) */}
      {liveIntrusionAlert && (
        <div className="bg-rose-950/95 border-b-2 border-rose-500 px-4 lg:px-8 py-3 text-white flex flex-wrap items-center justify-between gap-3 shadow-[0_0_35px_rgba(244,63,94,0.5)] animate-pulse z-40 relative">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-300 animate-bounce flex-shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xs sm:text-sm uppercase tracking-wider text-rose-200">
                  {liveIntrusionAlert.title || 'CRITICAL INTRUSION ALERT'}
                </span>
                <span className="text-[10px] px-2 py-0.2 bg-rose-600 text-white font-bold uppercase">
                  ZONE A BREACH
                </span>
              </div>
              <div className="text-xs text-rose-100 mt-0.5 font-mono">{liveIntrusionAlert.message}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsReportOpen(true)}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-rose-950 text-xs font-black tracking-wider uppercase cursor-pointer shadow-lg flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>VIEW FORENSIC DOSSIER</span>
            </button>
            <button
              type="button"
              onClick={() => setLiveIntrusionAlert(null)}
              className="px-2 py-1 text-xs text-rose-300 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Command Center Content (Dense, High-Tech Layout with Zero Empty Voids) */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-8">
        {/* TOP HERO & SYSTEM METRICS */}
        <section className="border border-slate-800 bg-[#050917] p-5 lg:p-7 shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-1.5 text-xs text-cyan-400 font-bold tracking-widest uppercase">
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
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80 pt-4">
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

        {/* ========================================================
            MODULE 01: THREAT CONSTELLATION CANVAS
            ======================================================== */}
        <section id="section-constellation" className="space-y-3">
          <div className="flex items-center justify-between border-b border-cyan-900/60 pb-2">
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>MODULE 01 // THREAT CONSTELLATION & PREDICTED ATTACK PATH</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">DETERMINISTIC SPATIAL CORRELATION</span>
          </div>
          <ConstellationCanvas
            events={events}
            incidents={incidents}
            selectedIncidentId={selectedIncidentId}
            onSelectIncident={(id) => setSelectedIncidentId(id)}
          />
        </section>

        {/* ========================================================
            MODULE 02: RAW ASYNCHRONOUS TELEMETRY STREAM
            ======================================================== */}
        <section id="section-telemetry" className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-xs text-slate-300 font-bold uppercase tracking-wider">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>MODULE 02 // RAW MULTI-STREAM ASYNCHRONOUS TELEMETRY INGESTION</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">CONTINUOUS /events BUFFER</span>
          </div>

          <div className="border border-slate-800 bg-[#060a14] p-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100">Live Ingestion Event Feed</h3>
                <div className="text-xs text-slate-400 mt-0.5">Real-time stream of camera, RFID badge, and network socket frames</div>
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

            {/* Ingestion Table */}
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
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredEvents.slice(0, 10).map((e) => (
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

        {/* ========================================================
            MODULE 03: RULE-BASED ANOMALY DETECTION SIGNALS
            ======================================================== */}
        <section id="section-signals" className="space-y-3">
          <div className="flex items-center justify-between border-b border-amber-900/60 pb-2">
            <div className="flex items-center gap-2 text-xs text-amber-400 font-bold uppercase tracking-wider">
              <Radio className="w-4 h-4 text-amber-400" />
              <span>MODULE 03 // RULE-BASED ANOMALY DETECTION SIGNALS</span>
            </div>
            <span className="text-[10px] text-amber-400/80 font-mono">TARGET ENTITY CORRELATION</span>
          </div>
          <div className="border border-slate-800 bg-[#060a14] p-5">
            <PanelFlaggedEvents
              isActive={true}
              events={events}
            />
          </div>
        </section>

        {/* ========================================================
            MODULE 04: MULTI-STREAM TEMPORAL FUSION ENGINE
            ======================================================== */}
        <section id="section-fusion" className="space-y-3">
          <div className="flex items-center justify-between border-b border-cyan-900/60 pb-2">
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-bold uppercase tracking-wider">
              <GitMerge className="w-4 h-4 text-cyan-400" />
              <span>MODULE 04 // MULTI-STREAM TEMPORAL FUSION ENGINE CONVERGENCE</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">SPATIOTEMPORAL GRAPH SYNTHESIS</span>
          </div>
          <div className="border border-slate-800 bg-[#060a14] p-5">
            <PanelFusionAnimation
              isActive={true}
              events={events}
              incident={activeIncident}
            />
          </div>
        </section>

        {/* ========================================================
            MODULE 05: DIGITAL CSV TELEMETRY & PACKET CAPTURE EVIDENCE
            ======================================================== */}
        <section id="section-digital-csv" className="space-y-4">
          <div className="flex items-center justify-between border-b border-amber-900/60 pb-2">
            <div className="flex items-center gap-2 text-xs text-amber-400 font-bold uppercase tracking-wider">
              <FileSpreadsheet className="w-4 h-4 text-amber-400" />
              <span>MODULE 05 // DIGITAL CSV FORENSIC EVIDENCE (NSL-KDD DATASET + PACKET FLOWS)</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">CSV ROWS VERIFIED</span>
          </div>

          {/* Full Interactive Digital CSV Evidence Table */}
          <DigitalCsvEvidence />

          {/* Synthesized Incident Dossier & Explain Why Chain */}
          <div className="border border-slate-800 bg-[#060a14] p-5">
            <PanelIncidentCard
              isActive={true}
              operatorLoad={operatorLoad}
              incident={activeIncident}
              events={events}
            />
          </div>
        </section>

        {/* ========================================================
            MODULE 06: PHYSICAL CCTV FORENSIC EVIDENCE & CONTAINMENT
            ======================================================== */}
        <section id="section-cctv" className="space-y-4">
          <div className="flex items-center justify-between border-b border-rose-900/60 pb-2">
            <div className="flex items-center gap-2 text-xs text-rose-400 font-bold uppercase tracking-wider">
              <Eye className="w-4 h-4 text-rose-400" />
              <span>MODULE 06 // PHYSICAL CCTV EVIDENCE & OPERATOR CONTAINMENT</span>
            </div>
            <span className="text-[10px] text-rose-400/80 font-mono">DYNAMIC RESTRICTED ZONE DETECTION</span>
          </div>

          {/* Physical CCTV Video Feed with Dynamic Zone Entry Alert */}
          <CctvSensorView
            onAlert={handleCctvAlert}
            onOpenReport={() => setIsReportOpen(true)}
          />

          {/* Operator Containment & Notification Triage */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            <div className="border border-slate-800 bg-[#060a14] p-5">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Operational Notifications Triage</span>
              </div>
              <NotificationsDrawer
                notifications={notifications}
                onAcknowledgeSuccess={(updatedNotif) => {
                  setNotifications((prev) =>
                    prev.map((n) => (n.id === updatedNotif.id ? { ...n, handled: true } : n))
                  );
                }}
              />
            </div>

            <div className="border border-slate-800 bg-[#060a14] p-5">
              <PanelActionFatigue
                isActive={true}
                operatorLoad={operatorLoad}
                onToggleOperatorLoad={(newLoad) => setOperatorLoad(newLoad)}
                incident={activeIncident}
                onUpdateStatus={handleUpdateStatus}
                onDismissIncident={handleDismissIncident}
              />
            </div>
          </div>
        </section>
        {/* ========================================================
            MODULE 07: CLASSIFIED FORENSIC INCIDENT REPORT BOX
            ======================================================== */}
        <section id="section-report" className="space-y-4">
          <div className="flex items-center justify-between border-b border-rose-900/60 pb-2">
            <div className="flex items-center gap-2 text-xs text-rose-400 font-bold uppercase tracking-wider">
              <FileText className="w-4 h-4 text-rose-400" />
              <span>MODULE 07 // CLASSIFIED FORENSIC INCIDENT REPORT DOSSIER BOX</span>
            </div>
            <span className="text-[10px] text-rose-400/80 font-mono">COURT-ADMISSIBLE CHAIN OF CUSTODY</span>
          </div>

          <ForensicReportBox
            incident={activeIncident}
            events={events}
            onExpandModal={() => setIsReportOpen(true)}
          />
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

      {/* Forensic Incident Report Modal (Connected to Screen) */}
      <ForensicIncidentReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        incident={activeIncident}
        events={events}
      />

      {/* Compliance Modals */}
      <LegalModals
        activeModal={activeLegalModal}
        onClose={() => setActiveLegalModal(null)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#02040a] mt-12 px-4 lg:px-8 py-8 text-slate-500 text-xs font-mono">
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
