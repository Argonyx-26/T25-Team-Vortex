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
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  ArrowRight,
  ExternalLink,
  Play,
  RotateCcw,
  Zap,
  Lock,
  FileText
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
import ScrollExpand from './effects/ScrollExpand';
import LegalModals from './compliance/LegalModals';
import NotificationsDrawer from './triage/NotificationsDrawer';
import CctvSensorView from './cctv/CctvSensorView';

export default function LandingDashboard() {
  // Navigation & Modal State
  const [activeTab, setActiveTab] = useState('overview');
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

  // Filter States
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [selectedSource, setSelectedSource] = useState('all');

  // Incident Drilldown & "Why" Explainer State
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [incidentWhyData, setIncidentWhyData] = useState({});
  const [loadingWhyId, setLoadingWhyId] = useState(null);

  // Poll GET / for online status indicator every 5 seconds
  const pollOnlineStatus = useCallback(async () => {
    try {
      const res = await checkOnlineStatus();
      if (res && res.status === 'ok') {
        setIsOnline(true);
        setLatency(res.latency || 12);
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
      console.warn('Backend snapshot fetch notice:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [flaggedOnly, selectedIncidentId]);

  // Initial Load + 5-second polling interval
  useEffect(() => {
    pollOnlineStatus();
    fetchSnapshot();

    const onlineInterval = setInterval(pollOnlineStatus, 5000);
    const dataInterval = setInterval(fetchSnapshot, 3500);

    // Setup Socket.IO
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

  // Load "Why" linked events for an incident
  const handleLoadWhy = async (incidentId) => {
    if (incidentWhyData[incidentId]) {
      // Toggle accordion if already loaded
      return;
    }
    try {
      setLoadingWhyId(incidentId);
      const data = await getIncidentWhy(incidentId);
      if (data) {
        setIncidentWhyData((prev) => ({ ...prev, [incidentId]: data }));
      }
    } catch (err) {
      console.error(`Failed to fetch why for ${incidentId}:`, err);
    } finally {
      setLoadingWhyId(null);
    }
  };

  // Handle Incident Status Update
  const handleStatusUpdate = async (incidentId, status) => {
    try {
      const res = await updateIncidentStatus(incidentId, status);
      if (res) {
        setIncidents((prev) =>
          prev.map((i) => (i.incident_id === incidentId ? { ...i, status: res.status } : i))
        );
      }
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  // Handle Incident Dismiss
  const handleDismissIncident = async (incidentId) => {
    try {
      const res = await dismissIncident(incidentId);
      if (res) {
        setIncidents((prev) =>
          prev.map((i) => (i.incident_id === incidentId ? { ...i, status: 'dismissed' } : i))
        );
      }
    } catch (err) {
      console.error('Dismiss failed:', err);
    }
  };

  // Handle Pipeline Reset
  const handleReset = async () => {
    try {
      setIsResetting(true);
      await resetBackendPipeline();
      setIncidentWhyData({});
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
  const selectedIncident = incidents.find((i) => i.incident_id === selectedIncidentId) || incidents[0];

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 font-mono relative selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Precision Reticle Target Cursor & Click Spark Canvas */}
      <TargetCursor />
      <ClickSpark />

      {/* Segmented Card Navigation Bar */}
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
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-8">
        {/* SECTION 1: HERO & LIVE TELEMETRY STATUS */}
        <section id="section-overview" className="border border-slate-800 bg-[#070b14] p-6 lg:p-8 relative">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-2 font-mono text-xs text-cyan-400 font-semibold tracking-widest uppercase">
                <span className="w-2 h-2 bg-cyan-400" />
                <span>REAL-TIME MULTI-STREAM CORRELATION MATRIX</span>
              </div>
              <h1 className="font-mono text-2xl lg:text-3xl font-extrabold text-slate-100 tracking-tight leading-tight">
                SENTINELMESH // THREAT CORRELATION ENGINE
              </h1>
              <p className="font-mono text-xs lg:text-sm text-slate-400 mt-2 leading-relaxed">
                Autonomous temporal graph correlation fusing physical access badges, computer vision optical loitering telemetry, and NSL-KDD network flow streams to detect coordinated multi-vector intrusions.
              </p>
            </div>

            {/* Quick Simulation Trigger */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleSimulateAttackStep}
                className="flex items-center gap-2 px-4 py-2.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-600 text-rose-200 font-mono text-xs font-semibold tracking-wider transition-colors cursor-pointer"
              >
                <Zap className="w-4 h-4 text-rose-400" />
                <span>INJECT ATTACK STAGE</span>
              </button>
            </div>
          </div>

          {/* Real Metrics KPI Grid (Loading Skeletons when fetching) */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80 pt-6">
            {/* KPI 1: Ingested Events */}
            <div className="border border-slate-800/80 bg-[#090e1c] p-4">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest">INGESTED TELEMETRY</div>
              <div className="text-2xl font-bold text-slate-100 mt-1">
                {isLoading ? <div className="h-7 w-16 bg-slate-800 animate-pulse" /> : events.length}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Total raw events in buffer</div>
            </div>

            {/* KPI 2: Rule Flagged Events */}
            <div className="border border-slate-800/80 bg-[#090e1c] p-4">
              <div className="text-[10px] text-amber-500 uppercase tracking-widest">RULE FLAGGED</div>
              <div className="text-2xl font-bold text-amber-400 mt-1">
                {isLoading ? <div className="h-7 w-12 bg-slate-800 animate-pulse" /> : flaggedCount}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Anomalies triggering rules</div>
            </div>

            {/* KPI 3: Correlated Incidents */}
            <div className="border border-slate-800/80 bg-[#090e1c] p-4">
              <div className="text-[10px] text-rose-500 uppercase tracking-widest">FUSED INCIDENTS</div>
              <div className="text-2xl font-bold text-rose-400 mt-1">
                {isLoading ? <div className="h-7 w-12 bg-slate-800 animate-pulse" /> : incidents.length}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Multi-source attack clusters</div>
            </div>

            {/* KPI 4: Unhandled Alerts */}
            <div className="border border-slate-800/80 bg-[#090e1c] p-4">
              <div className="text-[10px] text-cyan-500 uppercase tracking-widest">ACTIVE ALERTS</div>
              <div className="text-2xl font-bold text-cyan-300 mt-1">
                {isLoading ? <div className="h-7 w-12 bg-slate-800 animate-pulse" /> : alertNotifCount}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Pending triage action</div>
            </div>
          </div>
        </section>

        {/* SECTION 2: EXPANDABLE CORRELATION MATRIX (SCROLL EXPAND) */}
        <ScrollExpand incidents={incidents} events={events} />

        {/* SECTION 3: INCIDENT INTELLIGENCE & FORECASTING */}
        <section id="section-incidents" className="border border-slate-800 bg-[#060a14] p-6 lg:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border border-rose-500/40 bg-rose-950/30 flex items-center justify-center text-rose-400">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-rose-400 uppercase tracking-widest">[INCIDENT INTELLIGENCE]</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                    PREDICTIVE FORECASTING
                  </span>
                </div>
                <h2 className="font-mono text-lg font-bold text-slate-100 tracking-wide mt-0.5">
                  Fused Incident Clusters & Plain-English Attack Narratives
                </h2>
              </div>
            </div>

            <div className="font-mono text-xs text-slate-400">
              CLUSTER POOL: <span className="text-cyan-300 font-bold">{incidents.length} ACTIVE</span>
            </div>
          </div>

          {/* Incidents Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Incident Selection List */}
            <div className="space-y-3 lg:col-span-1">
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                Incident Clusters ({incidents.length})
              </div>

              {incidents.length === 0 ? (
                <div className="p-6 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                  No active incidents detected. Telemetry is normal.
                </div>
              ) : (
                incidents.map((inc) => {
                  const isSelected = inc.incident_id === (selectedIncident?.incident_id);
                  const isCritical = inc.severity === 'critical' || inc.severity === 'high';
                  return (
                    <div
                      key={inc.incident_id}
                      onClick={() => setSelectedIncidentId(inc.incident_id)}
                      className={`p-4 border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                          : 'border-slate-800 bg-[#080d1a] hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-100">{inc.incident_id}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 uppercase font-bold border ${
                            isCritical
                              ? 'bg-rose-950 text-rose-300 border-rose-800'
                              : 'bg-amber-950 text-amber-300 border-amber-800'
                          }`}
                        >
                          {inc.severity}
                        </span>
                      </div>

                      <div className="text-xs text-cyan-300 font-semibold mt-2 truncate">
                        {inc.matched_attack_pattern || 'Correlated Multi-Source Anomaly'}
                      </div>

                      <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400">
                        <span>CONFIDENCE: {Math.round((inc.predicted_confidence || inc.confidence || 0.8) * 100)}%</span>
                        <span>{inc.linked_event_ids?.length || 0} events</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right: Detailed Inspection Card with "Why" Drilldown */}
            <div className="lg:col-span-2 border border-slate-800 bg-[#080d1a] p-6 flex flex-col justify-between">
              {selectedIncident ? (
                <div className="space-y-5">
                  {/* Title & Metadata */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-slate-100">{selectedIncident.incident_id}</span>
                        <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                          STATUS: {selectedIncident.status || 'new'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        PRIMARY ENTITY: <span className="text-emerald-300">{selectedIncident.primary_entity?.id} ({selectedIncident.primary_entity?.type})</span>
                      </div>
                    </div>

                    <div className="text-right text-xs text-slate-400">
                      <div>UPDATED: {selectedIncident.updated_at || selectedIncident.created_at}</div>
                      <div className="text-cyan-400">LOCATIONS: {selectedIncident.locations?.join(', ') || 'server_room'}</div>
                    </div>
                  </div>

                  {/* Plain-English AI Narrative */}
                  <div className="bg-[#050811] border border-slate-800 p-4">
                    <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5" />
                      SYNTHESIZED ATTACK NARRATIVE
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {selectedIncident.narrative || selectedIncident.summary}
                    </p>
                  </div>

                  {/* Predicted Next Step & Confidence */}
                  <div className="border border-rose-900/50 bg-[#13070b] p-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="text-[10px] text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        FORECASTED NEXT ATTACK STEP
                      </div>
                      <div className="text-xs font-bold text-rose-300">
                        CONFIDENCE: {Math.round((selectedIncident.predicted_confidence || selectedIncident.confidence || 0.8) * 100)}%
                      </div>
                    </div>
                    <p className="text-xs text-rose-200 font-semibold leading-relaxed">
                      {selectedIncident.predicted_next_step || 'Likely attempt to access or copy data from internal server vault.'}
                    </p>
                    {selectedIncident.recommended_action && (
                      <div className="mt-3 pt-2.5 border-t border-rose-900/40 text-[11px] text-slate-300">
                        <span className="text-rose-400 font-bold">RECOMMENDED ACTION: </span>
                        {selectedIncident.recommended_action}
                      </div>
                    )}
                  </div>

                  {/* "Why" Drilldown Inspector (GET /incidents/<id>/why) */}
                  <div className="border border-slate-800 bg-[#050811] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5" />
                        WHY WAS THIS CORRELATED? (LINKED EVIDENCE CHAIN)
                      </div>
                      <button
                        onClick={() => handleLoadWhy(selectedIncident.incident_id)}
                        disabled={loadingWhyId === selectedIncident.incident_id}
                        className="text-[11px] text-cyan-300 hover:text-cyan-200 border border-cyan-800/60 bg-cyan-950/40 px-2.5 py-1 cursor-pointer"
                      >
                        {loadingWhyId === selectedIncident.incident_id
                          ? 'FETCHING WHY...'
                          : incidentWhyData[selectedIncident.incident_id]
                          ? 'REFRESH EVIDENCE'
                          : 'INSPECT WHY'}
                      </button>
                    </div>

                    {incidentWhyData[selectedIncident.incident_id] ? (
                      <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
                        {incidentWhyData[selectedIncident.incident_id].map((evt) => (
                          <div key={evt.event_id} className="p-2 border border-slate-800 bg-[#080d1a] text-[11px]">
                            <div className="flex items-center justify-between text-slate-300">
                              <span className="font-bold text-cyan-300">{evt.event_id} // {evt.event_type}</span>
                              <span className="text-slate-500">{evt.source} | {evt.location || 'remote'}</span>
                            </div>
                            <div className="text-slate-400 mt-1">Rule: <span className="text-emerald-400">{evt.rule_triggered}</span></div>
                            <div className="text-slate-500 text-[10px] mt-0.5 font-mono truncate">
                              Details: {JSON.stringify(evt.raw_details)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500 italic mt-1">
                        Click "Inspect Why" to pull raw telemetry linked to this incident via endpoint GET /incidents/{selectedIncident.incident_id}/why
                      </div>
                    )}
                  </div>

                  {/* Disposition Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                    <div className="text-[11px] text-slate-500">OPERATOR DISPOSITION:</div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStatusUpdate(selectedIncident.incident_id, 'escalated')}
                        className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-700 text-rose-300 text-xs font-semibold cursor-pointer"
                      >
                        ESCALATE TO SOC
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(selectedIncident.incident_id, 'reviewed')}
                        className="px-3 py-1.5 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 text-xs font-semibold cursor-pointer"
                      >
                        MARK REVIEWED
                      </button>
                      <button
                        onClick={() => handleDismissIncident(selectedIncident.incident_id)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs cursor-pointer"
                        title="Dismiss and suppress future similar incidents"
                      >
                        DISMISS
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-500">
                  Select an incident from the left panel to inspect details.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 4: NOTIFICATIONS TRIAGE CENTER */}
        <NotificationsDrawer
          notifications={notifications}
          onAcknowledgeSuccess={(updatedNotif) => {
            setNotifications((prev) =>
              prev.map((n) => (n.id === updatedNotif.id ? { ...n, handled: true } : n))
            );
          }}
        />

        {/* SECTION 5: CCTV OPTICAL STREAM VIEW */}
        <CctvSensorView />

        {/* SECTION 6: RAW TELEMETRY EVENT STREAM */}
        <section id="section-telemetry" className="border border-slate-800 bg-[#060a14] p-6 lg:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border border-cyan-500/40 bg-cyan-950/30 flex items-center justify-center text-cyan-400">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-cyan-400 uppercase tracking-widest">[RAW TELEMETRY]</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                    ENDPOINT /events
                  </span>
                </div>
                <h2 className="font-mono text-lg font-bold text-slate-100 tracking-wide mt-0.5">
                  High-Frequency Multi-Source Event Stream
                </h2>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                onClick={() => setFlaggedOnly(!flaggedOnly)}
                className={`px-3 py-1.5 border transition-colors cursor-pointer ${
                  flaggedOnly
                    ? 'border-amber-500 bg-amber-950 text-amber-300'
                    : 'border-slate-800 bg-[#080d1a] text-slate-400 hover:text-slate-200'
                }`}
              >
                FLAGGED ONLY ({flaggedCount})
              </button>

              <div className="flex items-center bg-[#080d1a] border border-slate-800 p-0.5">
                {['all', 'network', 'badge', 'camera'].map((src) => (
                  <button
                    key={src}
                    onClick={() => setSelectedSource(src)}
                    className={`px-2.5 py-1 uppercase text-[11px] cursor-pointer ${
                      selectedSource === src
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {src}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table / Event Stream list */}
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
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
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      No raw telemetry events matching current filter.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((e) => (
                    <tr key={e.event_id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-2.5 px-3 text-cyan-300 font-semibold">{e.event_id}</td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">{e.timestamp}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 text-[10px] uppercase bg-slate-800 text-slate-300 border border-slate-700">
                          {e.source}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-200">{e.event_type}</td>
                      <td className="py-2.5 px-3 text-emerald-300">{e.entity?.id}</td>
                      <td className="py-2.5 px-3 text-slate-400">{e.location || 'remote'}</td>
                      <td className="py-2.5 px-3">
                        {e.rule_triggered ? (
                          <span className="text-amber-300 font-semibold">{e.rule_triggered}</span>
                        ) : (
                          <span className="text-slate-600">none</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Floating Scroll Telemetry Dock (ScrollFloat) */}
      <ScrollFloat
        latency={latency}
        eventCount={events.length}
        flaggedCount={flaggedCount}
        incidentCount={incidents.length}
        socketConnected={socketConnected}
      />

      {/* Legal & Compliance Modals (T&C and Privacy) */}
      <LegalModals
        activeModal={activeLegalModal}
        onClose={() => setActiveLegalModal(null)}
      />

      {/* Technical Footer */}
      <footer className="border-t border-slate-800/80 bg-[#04060c] mt-16 px-4 lg:px-8 py-8 text-slate-500 font-mono text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-slate-300 font-bold">SENTINELMESH INCIDENT CORRELATION ENGINE</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Multi-stream graph fusion architecture. Connected to backend at {API_BASE_URL}
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setActiveLegalModal('terms')}
              className="hover:text-cyan-300 cursor-pointer"
            >
              TERMS AND CONDITIONS
            </button>
            <span>/</span>
            <button
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
