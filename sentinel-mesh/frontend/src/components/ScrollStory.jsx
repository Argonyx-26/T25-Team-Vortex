import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import PanelHeader from './panels/PanelHeader';
import PanelRawStream from './panels/PanelRawStream';
import PanelFlaggedEvents from './panels/PanelFlaggedEvents';
import PanelFusionAnimation from './panels/PanelFusionAnimation';
import PanelIncidentCard from './panels/PanelIncidentCard';
import PanelActionFatigue from './panels/PanelActionFatigue';
import ScrollProgress from './motion-primitives/ScrollProgress';
import TargetCursor from './effects/TargetCursor';
import ClickSpark from './effects/ClickSpark';
import ScrollFloat from './effects/ScrollFloat';
import LegalModals from './compliance/LegalModals';
import CardNav from './navigation/CardNav';

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

gsap.registerPlugin(ScrollTrigger);

const TOTAL_PANELS = 6;

export default function ScrollStory() {
  const [activePanel, setActivePanel] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
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

  // GSAP animation refs & active panel ref
  const scrollContainerRef = useRef(null);
  const pinnedViewportRef = useRef(null);
  const panelsRowRef = useRef(null);
  const activePanelRef = useRef(0);

  useEffect(() => {
    activePanelRef.current = activePanel;
  }, [activePanel]);

  // Poll GET / for online indicator every 5 seconds
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
        getEvents(false),
        getIncidents(),
        getNotifications()
      ]);
      if (eventsData) setEvents(eventsData);
      if (incidentsData) setIncidents(incidentsData);
      if (notifsData) setNotifications(notifsData);
    } catch (err) {
      console.warn('Backend snapshot notice:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  // Smooth jump to panel index with exact ScrollTrigger calculation
  const goToPanel = useCallback((index) => {
    const targetIdx = Math.min(TOTAL_PANELS - 1, Math.max(0, index));
    const st = ScrollTrigger.getById('storyTrigger');

    if (st && scrollContainerRef.current) {
      const targetScroll = st.start + (targetIdx / (TOTAL_PANELS - 1)) * (st.end - st.start);
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    } else if (scrollContainerRef.current) {
      const totalDist = (TOTAL_PANELS - 1) * window.innerHeight * 1.3;
      const targetY = scrollContainerRef.current.offsetTop + (targetIdx / (TOTAL_PANELS - 1)) * totalDist;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }
    setActivePanel(targetIdx);
  }, []);

  // Ultra-Smooth GSAP Horizontal Scroll Setup (Mounted ONCE)
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!panelsRowRef.current || !scrollContainerRef.current || !pinnedViewportRef.current) return;

      const totalWidth = (TOTAL_PANELS - 1) * window.innerWidth;

      gsap.to(panelsRowRef.current, {
        x: () => -totalWidth,
        ease: 'none',
        scrollTrigger: {
          id: 'storyTrigger',
          trigger: scrollContainerRef.current,
          pin: pinnedViewportRef.current,
          start: 'top top',
          end: () => `+=${(TOTAL_PANELS - 1) * window.innerHeight * 1.3}`,
          scrub: 1.0, // Responsive, buttery smooth 1.0s scrub
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setScrollProgress(self.progress);
            const rawIdx = Math.round(self.progress * (TOTAL_PANELS - 1));
            const clampedIdx = Math.min(TOTAL_PANELS - 1, Math.max(0, rawIdx));
            setActivePanel(clampedIdx);
          },
        },
      });
    }, scrollContainerRef);

    // Keyboard navigation (Arrow keys / PageUp / PageDown)
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        goToPanel(activePanelRef.current + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToPanel(activePanelRef.current - 1);
      }
    };

    // Horizontal wheel / trackpad support
    const handleWheel = (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 10) {
        window.scrollBy({ top: e.deltaX * 1.2, behavior: 'auto' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
      ctx.revert();
    };
  }, [goToPanel]);

  // Actions
  const handleUpdateStatus = async (incidentId, newStatus) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.incident_id === incidentId ? { ...inc, status: newStatus } : inc
      )
    );
    await updateIncidentStatus(incidentId, newStatus);
  };

  const handleDismissIncident = async (incidentId) => {
    await dismissIncident(incidentId);
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.incident_id === incidentId ? { ...inc, status: 'dismissed' } : inc
      )
    );
  };

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

  const flaggedEvents = events.filter((e) => e.flagged);
  const activeIncident = incidents[0] || null;
  const alertNotifCount = notifications.filter((n) => n.type === 'alert' && !n.handled).length;

  const panelNames = [
    '01 / OVERVIEW',
    '02 / RAW STREAM',
    '03 / FLAGGED RULES',
    '04 / FUSION MATRIX',
    '05 / INCIDENT DOSSIER',
    '06 / ACTION & CCTV'
  ];

  return (
    <div
      ref={scrollContainerRef}
      className="relative bg-[#050811] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200"
      style={{ height: `${TOTAL_PANELS * 130}vh` }}
    >
      {/* Tactical Reticle Target Cursor & Click Spark Canvas */}
      <TargetCursor />
      <ClickSpark />

      {/* Pinned Outer Viewport */}
      <div
        ref={pinnedViewportRef}
        className="w-screen h-screen overflow-hidden sticky top-0 flex flex-col bg-gradient-to-b from-[#070b14] via-[#050811] to-[#02040a]"
      >
        {/* Ambient Glows */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] bg-cyan-950/15 rounded-full blur-[140px]" />
          <div className="absolute -bottom-40 right-1/4 w-[500px] h-[500px] bg-indigo-950/15 rounded-full blur-[140px]" />
        </div>

        {/* Top Navigation Bar with Real Online Indicator */}
        <CardNav
          activeTab={activePanel === 0 ? 'overview' : activePanel === 1 ? 'telemetry' : activePanel === 3 ? 'fusion' : activePanel === 4 ? 'incidents' : activePanel === 5 ? 'notifications' : 'overview'}
          setActiveTab={(tabId) => {
            const map = { overview: 0, telemetry: 1, fusion: 3, incidents: 4, notifications: 5, cctv: 5 };
            if (map[tabId] !== undefined) goToPanel(map[tabId]);
          }}
          onlineStatus={isOnline}
          latency={latency}
          eventCount={events.length}
          incidentCount={incidents.length}
          alertCount={alertNotifCount}
          onOpenLegalModal={setActiveLegalModal}
          onReset={handleReset}
          isResetting={isResetting}
        />

        {/* Global Progress Bar */}
        <ScrollProgress progress={scrollProgress} />

        {/* Sub-Header Horizontal Panel Track Navigation */}
        <div className="relative z-30 bg-[#060a14]/90 border-b border-slate-800/80 px-4 lg:px-8 py-2 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            {panelNames.map((name, idx) => (
              <button
                key={name}
                type="button"
                onClick={() => goToPanel(idx)}
                className={`px-3 py-1 border transition-all cursor-pointer whitespace-nowrap select-none ${
                  activePanel === idx
                    ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300 font-bold shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                    : 'border-slate-800 bg-[#070b14] text-slate-500 hover:text-slate-300 hover:border-slate-700'
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-500 font-mono select-none">
            <span>SCROLL / CLICK TABS / ARROW KEYS</span>
            <span className="text-cyan-400 font-bold">PANEL {activePanel + 1} / {TOTAL_PANELS}</span>
          </div>
        </div>

        {/* Horizontal Sliding Panels Container */}
        <div className="relative flex-1 w-full overflow-hidden">
          <div
            ref={panelsRowRef}
            className="flex flex-nowrap h-full items-stretch will-change-transform"
            style={{ width: `${TOTAL_PANELS * 100}vw` }}
          >
            {/* PANEL 0: SYSTEM OVERVIEW */}
            <div className="w-screen h-full flex-shrink-0 flex items-center justify-center p-4 lg:p-8 overflow-y-auto">
              <PanelHeader
                isActive={activePanel === 0}
                onNext={() => goToPanel(1)}
                eventsCount={events.length}
                incidentsCount={incidents.length}
                isLiveBackend={isOnline}
              />
            </div>

            {/* PANEL 1: RAW ASYNCHRONOUS TELEMETRY STREAM */}
            <div className="w-screen h-full flex-shrink-0 flex items-center justify-center p-4 lg:p-8 overflow-y-auto">
              <PanelRawStream
                isActive={activePanel === 1}
                onNext={() => goToPanel(2)}
                events={events}
              />
            </div>

            {/* PANEL 2: RULE FLAGGED SIGNALS */}
            <div className="w-screen h-full flex-shrink-0 flex items-center justify-center p-4 lg:p-8 overflow-y-auto">
              <PanelFlaggedEvents
                isActive={activePanel === 2}
                onNext={() => goToPanel(3)}
                events={events}
                flaggedEvents={flaggedEvents}
              />
            </div>

            {/* PANEL 3: TEMPORAL FUSION CONVERGENCE */}
            <div className="w-screen h-full flex-shrink-0 flex items-center justify-center p-4 lg:p-8 overflow-y-auto">
              <PanelFusionAnimation
                isActive={activePanel === 3}
                onNext={() => goToPanel(4)}
                flaggedEvents={flaggedEvents}
                incident={activeIncident}
              />
            </div>

            {/* PANEL 4: INCIDENT INTELLIGENCE & WHY EXPLAINER */}
            <div className="w-screen h-full flex-shrink-0 flex items-center justify-center p-4 lg:p-8 overflow-y-auto">
              <PanelIncidentCard
                isActive={activePanel === 4}
                onNext={() => goToPanel(5)}
                incident={activeIncident}
                events={events}
              />
            </div>

            {/* PANEL 5: OPERATOR ACTION, NOTIFICATIONS TRIAGE & LIVE CCTV */}
            <div className="w-screen h-full flex-shrink-0 flex items-center justify-center p-4 lg:p-8 overflow-y-auto">
              <div className="w-full max-w-6xl mx-auto space-y-8 py-6">
                {/* Physical Forensic Evidence Video Dossier */}
                <CctvSensorView />

                <PanelActionFatigue
                  isActive={activePanel === 5}
                  incident={activeIncident}
                  onUpdateStatus={handleUpdateStatus}
                  onDismissIncident={handleDismissIncident}
                  operatorLoad="normal"
                  allIncidents={incidents}
                  allEvents={events}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Telemetry Dock (ScrollFloat) */}
      <ScrollFloat
        latency={latency}
        eventCount={events.length}
        flaggedCount={flaggedEvents.length}
        incidentCount={incidents.length}
        socketConnected={socketConnected}
      />

      {/* Compliance Modals */}
      <LegalModals
        activeModal={activeLegalModal}
        onClose={() => setActiveLegalModal(null)}
      />
    </div>
  );
}
