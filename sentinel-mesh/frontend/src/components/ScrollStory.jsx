import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import PanelHeader from './panels/PanelHeader';
import PanelRawStream from './panels/PanelRawStream';
import PanelFlaggedEvents from './panels/PanelFlaggedEvents';
import PanelFusionAnimation from './panels/PanelFusionAnimation';
import PanelIncidentCard from './panels/PanelIncidentCard';
import PanelActionFatigue from './panels/PanelActionFatigue';
import ScrollProgress from './motion-primitives/ScrollProgress';
import FatigueToggle from './FatigueToggle';

import { Radar, LayoutGrid, Sliders, Activity, Server, Radio, ShieldAlert } from 'lucide-react';
import { getHealth, getEvents, getIncidents, updateIncidentStatus } from '../api';
import { exampleEvents, exampleIncident } from '../data/mockData';

gsap.registerPlugin(ScrollTrigger);

const TOTAL_PANELS = 6;

export default function ScrollStory() {
  const [activePanel, setActivePanel] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [operatorLoad, setOperatorLoad] = useState('normal'); // 'normal' | 'high'
  const [viewMode, setViewMode] = useState('story'); // 'story' | 'command_hud'

  // Live backend data state with graceful mock fallback
  const [events, setEvents] = useState(exampleEvents);
  const [incidents, setIncidents] = useState([exampleIncident]);
  const [isLiveBackend, setIsLiveBackend] = useState(false);

  const scrollContainerRef = useRef(null);
  const pinnedViewportRef = useRef(null);
  const panelsRowRef = useRef(null);

  // Poll FastAPI backend (/health, /events, /incidents)
  useEffect(() => {
    let isMounted = true;

    async function poll() {
      try {
        const health = await getHealth();
        if (!isMounted) return;

        if (health) {
          setIsLiveBackend(true);
          const liveEvents = await getEvents();
          const liveIncidents = await getIncidents();

          if (isMounted) {
            if (liveEvents && Array.isArray(liveEvents) && liveEvents.length > 0) {
              setEvents(liveEvents);
            }
            if (liveIncidents && Array.isArray(liveIncidents) && liveIncidents.length > 0) {
              setIncidents(liveIncidents);
            }
          }
        } else {
          setIsLiveBackend(false);
        }
      } catch (err) {
        if (isMounted) setIsLiveBackend(false);
      }
    }

    poll();
    const timer = setInterval(poll, 2500);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  // Update incident status (e.g., 'escalated' | 'reviewed' | 'dismissed')
  const handleUpdateStatus = async (incidentId, newStatus) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.incident_id === incidentId
          ? {
              ...inc,
              status: newStatus,
              operator_feedback:
                newStatus === 'dismissed'
                  ? {
                      dismissed_at: new Date().toISOString(),
                      reason: 'operator dismissed via dashboard',
                    }
                  : inc.operator_feedback,
            }
          : inc
      )
    );
    await updateIncidentStatus(incidentId, newStatus);
  };

  const activeIncident = incidents[0] || exampleIncident;

  // Initialize GSAP horizontal ScrollTrigger ONCE
  useEffect(() => {
    if (viewMode !== 'story') return;

    const ctx = gsap.context(() => {
      if (!panelsRowRef.current || !scrollContainerRef.current) return;

      gsap.to(panelsRowRef.current, {
        x: () => -(TOTAL_PANELS - 1) * window.innerWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: scrollContainerRef.current,
          pin: pinnedViewportRef.current,
          start: 'top top',
          end: () => `+=${(TOTAL_PANELS - 1) * window.innerHeight}`,
          scrub: 1, // Smooth 1-second lag tied to scroll speed
          snap: {
            snapTo: 1 / (TOTAL_PANELS - 1),
            duration: { min: 0.25, max: 0.6 },
            delay: 0.1,
            ease: 'power2.out',
          },
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
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        goToPanel(activePanel + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToPanel(activePanel - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      ctx.revert();
    };
  }, [viewMode]);

  const goToPanel = (index) => {
    const targetIdx = Math.min(TOTAL_PANELS - 1, Math.max(0, index));
    if (!scrollContainerRef.current) return;
    const totalDist = (TOTAL_PANELS - 1) * window.innerHeight;
    const targetY = scrollContainerRef.current.offsetTop + (targetIdx / (TOTAL_PANELS - 1)) * totalDist;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
    setActivePanel(targetIdx);
  };

  return (
    <div
      ref={scrollContainerRef}
      className="relative bg-gradient-to-b from-[#0a0e1a] via-[#05070e] to-[#000000] text-slate-100 selection:bg-cyan-500/20 selection:text-cyan-200"
      style={{ height: viewMode === 'story' ? `${TOTAL_PANELS * 100}vh` : 'auto' }}
    >
      {/* Pinned Outer Viewport */}
      <div
        ref={pinnedViewportRef}
        className={`${viewMode === 'story' ? 'w-screen h-screen overflow-hidden sticky top-0' : 'min-h-screen'} flex flex-col bg-gradient-to-b from-[#0a0e1a] via-[#05070e] to-[#000000]`}
      >
        {/* Subtle Ambient Background Mesh / Radial Glows */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -top-40 left-1/3 w-[600px] h-[600px] bg-cyan-950/15 rounded-full blur-[140px]" />
          <div className="absolute -bottom-40 right-1/4 w-[500px] h-[500px] bg-indigo-950/15 rounded-full blur-[120px]" />
        </div>

        {/* Persistent Top Navigation Bar */}
        <header className="relative z-40 border-b border-slate-800/80 bg-[#0a0e1a]/95 backdrop-blur-xl px-4 lg:px-8 py-3 flex-shrink-0">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            {/* Branding */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600/80 to-blue-700/80 shadow-[0_0_20px_rgba(6,182,212,0.25)] border border-cyan-400/30">
                <Radar className="w-5 h-5 text-white animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold tracking-wider text-base uppercase bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    SENTINEL<span className="text-cyan-400">MESH</span>
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-cyan-950/70 text-cyan-300 border border-cyan-800/50">
                    SOC v2.4
                  </span>
                  <span className={`hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                    isLiveBackend ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60' : 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                  }`}>
                    <Server className="w-2.5 h-2.5" />
                    {isLiveBackend ? 'LIVE API (PORT 8000)' : 'DEMO MODE'}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-500 hidden sm:block">
                  Threat Correlation Command Center • Autonomous Fusion Engine
                </p>
              </div>
            </div>

            {/* Quick Panel Navigation Tags (when in Story mode) */}
            {viewMode === 'story' && (
              <div className="hidden lg:flex items-center gap-1 text-[11px] font-mono text-slate-400">
                {[
                  'Overview',
                  'Raw Telemetry',
                  'Flagged Signals',
                  'Fusion Convergence',
                  'Incident Dossier',
                  'Operator Command',
                ].map((label, idx) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => goToPanel(idx)}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      activePanel === idx
                        ? 'bg-slate-800 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {idx + 1}. {label}
                  </button>
                ))}
              </div>
            )}

            {/* Controls: View Switcher + Fatigue Toggle */}
            <div className="flex items-center gap-3">
              {/* View Switcher Button */}
              <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-1 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setViewMode('story')}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                    viewMode === 'story'
                      ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800/70 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Cinematic horizontal presentation"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Storyline</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('command_hud')}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                    viewMode === 'command_hud'
                      ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800/70 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Multi-pane Command HUD"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Command HUD</span>
                </button>
              </div>

              {/* Operator Fatigue Toggle */}
              <FatigueToggle
                operatorLoad={operatorLoad}
                onChange={(mode) => setOperatorLoad(mode)}
              />
            </div>
          </div>
        </header>

        {/* MODE 1: Horizontal Storyline Carousel with GSAP ScrollTrigger */}
        {viewMode === 'story' && (
          <>
            <div
              ref={panelsRowRef}
              className="relative z-10 flex-1 flex flex-row w-[600vw] h-full"
            >
              {/* Panel 1: Header/status bar */}
              <section className="scroll-story-panel w-screen h-full flex-shrink-0 flex items-center justify-center relative overflow-hidden px-4">
                <PanelHeader
                  isActive={activePanel === 0}
                  onNext={() => goToPanel(1)}
                  eventsCount={events.length}
                  incidentsCount={incidents.length}
                  isLiveBackend={isLiveBackend}
                />
              </section>

              {/* Panel 2: Raw event stream feed */}
              <section className="scroll-story-panel w-screen h-full flex-shrink-0 flex items-center justify-center relative overflow-hidden px-4">
                <PanelRawStream isActive={activePanel === 1} events={events} />
              </section>

              {/* Panel 3: Flagged events */}
              <section className="scroll-story-panel w-screen h-full flex-shrink-0 flex items-center justify-center relative overflow-hidden px-4">
                <PanelFlaggedEvents isActive={activePanel === 2} events={events} />
              </section>

              {/* Panel 4: Fusion animation */}
              <section className="scroll-story-panel w-screen h-full flex-shrink-0 flex items-center justify-center relative overflow-hidden px-4">
                <PanelFusionAnimation
                  isActive={activePanel === 3}
                  events={events}
                  incident={activeIncident}
                />
              </section>

              {/* Panel 5: Full incident card */}
              <section className="scroll-story-panel w-screen h-full flex-shrink-0 flex items-center justify-center relative overflow-hidden px-4">
                <PanelIncidentCard
                  isActive={activePanel === 4}
                  operatorLoad={operatorLoad}
                  incident={activeIncident}
                  events={events}
                />
              </section>

              {/* Panel 6: Recommended action + operator fatigue toggle */}
              <section className="scroll-story-panel w-screen h-full flex-shrink-0 flex items-center justify-center relative overflow-hidden px-4">
                <PanelActionFatigue
                  isActive={activePanel === 5}
                  operatorLoad={operatorLoad}
                  onToggleOperatorLoad={(mode) => setOperatorLoad(mode)}
                  incident={activeIncident}
                  onUpdateStatus={handleUpdateStatus}
                />
              </section>
            </div>

            {/* Motion Primitives Scroll Progress Component */}
            <ScrollProgress
              progress={scrollProgress}
              totalPanels={TOTAL_PANELS}
              activePanel={activePanel}
              onSelectPanel={goToPanel}
            />
          </>
        )}

        {/* MODE 2: Multi-Pane Command HUD Mode */}
        {viewMode === 'command_hud' && (
          <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 py-6 space-y-6">
            {/* Top Metrics Strip */}
            <PanelHeader
              isActive={true}
              onNext={() => {}}
              eventsCount={events.length}
              incidentsCount={incidents.length}
              isLiveBackend={isLiveBackend}
            />

            {/* 2-Column Split: Telemetry Stream & Fusion Core */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-5 bg-[#0a0e1a]/95 rounded-2xl border border-slate-800 p-4 shadow-xl">
                <PanelRawStream isActive={true} events={events} />
              </div>

              <div className="lg:col-span-7 bg-[#0a0e1a]/95 rounded-2xl border border-slate-800 p-4 shadow-xl">
                <PanelFusionAnimation isActive={true} events={events} incident={activeIncident} />
              </div>
            </div>

            {/* Bottom Row: Incident Dossier & Operator Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 bg-[#0a0e1a]/95 rounded-2xl border border-slate-800 p-4 shadow-xl">
                <PanelIncidentCard
                  isActive={true}
                  operatorLoad={operatorLoad}
                  incident={activeIncident}
                  events={events}
                />
              </div>

              <div className="lg:col-span-5 bg-[#0a0e1a]/95 rounded-2xl border border-slate-800 p-4 shadow-xl">
                <PanelActionFatigue
                  isActive={true}
                  operatorLoad={operatorLoad}
                  onToggleOperatorLoad={(mode) => setOperatorLoad(mode)}
                  incident={activeIncident}
                  onUpdateStatus={handleUpdateStatus}
                />
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
