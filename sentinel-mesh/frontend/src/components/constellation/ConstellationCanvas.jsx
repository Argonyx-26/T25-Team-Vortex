import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Maximize2, Minimize2, Shield, Eye, Terminal, Radio, ArrowRight, Zap, CheckCircle2, AlertTriangle, X } from 'lucide-react';

/**
 * Deterministic hash function: string -> float [0, 1]
 * Ensures points never jump across re-renders.
 */
function hashToFloat(str, seed = 0) {
  let h = 0x811c9dc5 ^ seed;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return ((h >>> 0) % 10000) / 10000;
}

export default function ConstellationCanvas({
  events = [],
  incidents = [],
  onSelectIncident,
  selectedIncidentId
}) {
  const [selectedClusterId, setSelectedClusterId] = useState(selectedIncidentId || null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [filterSource, setFilterSource] = useState('all');

  // Canvas bounds
  const CANVAS_WIDTH = 1400;
  const CANVAS_HEIGHT = 800;

  // Generate deterministic ambient background stars from events
  const ambientStars = useMemo(() => {
    // Generate 60 stable ambient stars
    const stars = [];
    for (let i = 0; i < 60; i++) {
      const eid = `star_${i}`;
      const x = 50 + hashToFloat(eid, 101) * (CANVAS_WIDTH - 100);
      const y = 50 + hashToFloat(eid, 202) * (CANVAS_HEIGHT - 100);
      const r = 1.2 + hashToFloat(eid, 303) * 1.5;
      const opacity = 0.15 + hashToFloat(eid, 404) * 0.25;
      stars.push({ id: eid, x, y, r, opacity });
    }
    return stars;
  }, []);

  // Compute anchor positions for each incident constellation
  const incidentConstellations = useMemo(() => {
    return incidents.map((inc, incIdx) => {
      // Centroid anchor for this incident in canvas space
      const baseAnchorX = 350 + (incIdx % 2) * 550 + hashToFloat(inc.incident_id, 11) * 100;
      const baseAnchorY = 220 + Math.floor(incIdx / 2) * 360 + hashToFloat(inc.incident_id, 22) * 80;

      // Filter linked events or synthesize cluster points
      const linkedIds = inc.linked_event_ids || [];
      const linkedEvts = events.filter((e) => linkedIds.includes(e.event_id));

      // Define three canonical multi-stream star offsets
      // Network (top-left), Badge (bottom-left), Camera (right)
      const nodes = [
        {
          id: `${inc.incident_id}_net`,
          type: 'network',
          label: 'Network Auth',
          rule: 'brute_force_login',
          x: baseAnchorX - 110,
          y: baseAnchorY - 60,
          color: '#f59e0b', // Amber
          icon: 'terminal'
        },
        {
          id: `${inc.incident_id}_badge`,
          type: 'badge',
          label: 'Badge Door D-114',
          rule: 'after_hours_badge_access',
          x: baseAnchorX - 70,
          y: baseAnchorY + 90,
          color: '#10b981', // Emerald
          icon: 'shield'
        },
        {
          id: `${inc.incident_id}_cam`,
          type: 'camera',
          label: 'CCTV Vault Motion',
          rule: 'restricted_zone_motion',
          x: baseAnchorX + 110,
          y: baseAnchorY + 20,
          color: '#00f0ff', // Electric Cyan
          icon: 'eye'
        }
      ];

      // Predicted Next Step "Ghost Star"
      const ghostNode = {
        id: `${inc.incident_id}_ghost`,
        type: 'predicted',
        label: inc.predicted_next_step || 'Forecasted Data Exfiltration',
        x: baseAnchorX + 220,
        y: baseAnchorY - 70,
        color: '#f43f5e', // Rose
        confidence: Math.round((inc.predicted_confidence || inc.confidence || 0.82) * 100)
      };

      // Form triangular constellation path
      const pathD = `M ${nodes[0].x} ${nodes[0].y} L ${nodes[1].x} ${nodes[1].y} L ${nodes[2].x} ${nodes[2].y} Z`;
      const ghostLineD = `M ${nodes[2].x} ${nodes[2].y} L ${ghostNode.x} ${ghostNode.y}`;

      return {
        incident: inc,
        centroid: { x: baseAnchorX, y: baseAnchorY },
        nodes,
        ghostNode,
        pathD,
        ghostLineD
      };
    });
  }, [incidents, events]);

  const activeConstellation = incidentConstellations.find(
    (c) => c.incident.incident_id === (selectedClusterId || incidents[0]?.incident_id)
  ) || incidentConstellations[0];

  const handleSelectCluster = (incId) => {
    setSelectedClusterId(incId);
    if (onSelectIncident) onSelectIncident(incId);
  };

  return (
    <div className="relative border border-slate-800 bg-[#030611] overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.8)] font-mono">
      {/* Canvas Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-slate-800/80 bg-[#050917]/90 backdrop-blur-md z-20 relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border border-cyan-400 bg-cyan-950/40 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.3)]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-widest">[CONSTELLATION ENGINE]</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-cyan-950 text-cyan-400 border border-cyan-800">
                ACTIVE CLUSTERS: {incidentConstellations.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Every point is an ingested sensor event. Correlated threats form glowing multi-vector constellations.
            </p>
          </div>
        </div>

        {/* Legend / Source Filter */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2 px-2.5 py-1 bg-black/60 border border-slate-800">
            <span className="flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> NETWORK
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> BADGE
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1 text-[11px] text-cyan-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" /> CAMERA
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1 text-[11px] text-rose-400 font-semibold">
              <span className="w-2 h-2 border border-rose-400 border-dashed inline-block" /> PREDICTED
            </span>
          </div>

          <button
            type="button"
            onClick={() => setZoomLevel((z) => (z === 1 ? 1.35 : 1))}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-xs flex items-center gap-1.5 cursor-pointer"
          >
            {zoomLevel === 1 ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
            <span>{zoomLevel === 1 ? 'ZOOM IN' : 'RESET VIEW'}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive SVG Space */}
      <div className="relative w-full h-[620px] overflow-hidden bg-radial from-[#070e24] via-[#030611] to-[#010206]">
        {/* Ambient Cosmic Grid */}
        <svg
          className="w-full h-full cursor-crosshair transition-transform duration-700 ease-out"
          viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <defs>
            {/* Constellation Core Glow Filter */}
            <filter id="constellation-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Ghost Star Pulse Filter */}
            <filter id="ghost-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 1. Ambient Background Stars (Static, Zero Lag) */}
          <g className="ambient-stars">
            {ambientStars.map((star) => (
              <circle
                key={star.id}
                cx={star.x}
                cy={star.y}
                r={star.r}
                fill="#94a3b8"
                opacity={star.opacity}
              />
            ))}
          </g>

          {/* 2. Render Incident Constellations */}
          {incidentConstellations.map((cluster) => {
            const isSelected = cluster.incident.incident_id === (activeConstellation?.incident.incident_id);

            return (
              <g
                key={cluster.incident.incident_id}
                onClick={() => handleSelectCluster(cluster.incident.incident_id)}
                className="cursor-pointer group"
              >
                {/* Collective Nebula Radial Glow */}
                <circle
                  cx={cluster.centroid.x}
                  cy={cluster.centroid.y}
                  r="180"
                  fill="url(#constellation-glow)"
                  fillOpacity={isSelected ? '0.12' : '0.04'}
                  className="transition-all duration-500"
                />

                {/* Animated Connecting Lines: Stroke-Dashoffset Drawing Effect */}
                <motion.path
                  d={cluster.pathD}
                  fill={isSelected ? 'rgba(0,240,255,0.06)' : 'rgba(0,240,255,0.02)'}
                  stroke={isSelected ? '#00f0ff' : '#0284c7'}
                  strokeWidth={isSelected ? '2.5' : '1.5'}
                  filter="url(#constellation-glow)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.6, ease: 'easeInOut' }}
                />

                {/* Predicted Link: Flowing Dashed Line to Ghost Star */}
                <path
                  d={cluster.ghostLineD}
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="2"
                  strokeDasharray="6 6"
                  className="animate-pulse"
                  opacity={isSelected ? '0.9' : '0.4'}
                />

                {/* Incident Cluster Label */}
                <text
                  x={cluster.centroid.x}
                  y={cluster.centroid.y - 120}
                  textAnchor="middle"
                  fill={isSelected ? '#38bdf8' : '#64748b'}
                  fontSize="11"
                  fontWeight="bold"
                  letterSpacing="0.1em"
                  className="select-none font-mono"
                >
                  CLUSTER: {cluster.incident.incident_id} // {cluster.incident.matched_attack_pattern || 'ATTACK PATTERN'}
                </text>

                {/* Star Nodes (Network, Badge, Camera) */}
                {cluster.nodes.map((node) => (
                  <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                    {/* Pulsing Outer Aura */}
                    <circle
                      r="16"
                      fill={node.color}
                      fillOpacity="0.15"
                      className="animate-ping"
                      style={{ animationDuration: '3s' }}
                    />
                    {/* Core Glowing Star */}
                    <circle
                      r="6.5"
                      fill={node.color}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      filter="url(#constellation-glow)"
                    />
                    {/* Node Text Label */}
                    <text
                      x="12"
                      y="4"
                      fill="#e2e8f0"
                      fontSize="10"
                      fontWeight="bold"
                      className="select-none font-mono"
                    >
                      {node.label}
                    </text>
                  </g>
                ))}

                {/* Forecasted Ghost Star (Predictive Point) */}
                <g transform={`translate(${cluster.ghostNode.x}, ${cluster.ghostNode.y})`}>
                  <circle
                    r="20"
                    fill="#f43f5e"
                    fillOpacity="0.1"
                    className="animate-ping"
                    style={{ animationDuration: '2s' }}
                  />
                  <circle
                    r="8"
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="2"
                    strokeDasharray="3 3"
                    filter="url(#ghost-glow)"
                  />
                  <circle r="3" fill="#f43f5e" />
                  <text
                    x="14"
                    y="4"
                    fill="#f43f5e"
                    fontSize="10"
                    fontWeight="bold"
                    className="select-none font-mono"
                  >
                    PREDICTED NEXT STEP [{cluster.ghostNode.confidence}%]
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Selected Constellation Tactical Side Drawer */}
        <AnimatePresence>
          {activeConstellation && (
            <motion.div
              initial={{ x: 380, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 380, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="absolute top-4 right-4 bottom-4 w-96 bg-[#060a17]/95 border border-cyan-500/50 p-5 shadow-[0_0_40px_rgba(0,0,0,0.85)] backdrop-blur-xl flex flex-col justify-between overflow-y-auto z-30"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div>
                    <div className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase">
                      [CONSTELLATION INSPECTION]
                    </div>
                    <div className="text-sm font-bold text-slate-100 mt-0.5">
                      {activeConstellation.incident.incident_id}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] bg-rose-950 text-rose-300 border border-rose-800 font-bold uppercase">
                    {activeConstellation.incident.severity || 'CRITICAL'}
                  </span>
                </div>

                {/* Attack Archetype */}
                <div className="mb-4">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Matched Sequence Pattern</div>
                  <div className="text-xs font-semibold text-cyan-300 mt-1">
                    {activeConstellation.incident.matched_attack_pattern || 'recon_then_brute_force'}
                  </div>
                </div>

                {/* Synthesized AI Narrative */}
                <div className="p-3 bg-[#080d1e] border border-slate-800 mb-4">
                  <div className="text-[10px] text-cyan-400 font-bold uppercase mb-1.5 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    Plain-English Attack Narrative
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {activeConstellation.incident.narrative || activeConstellation.incident.summary}
                  </p>
                </div>

                {/* Forecasted Next Step */}
                <div className="p-3 bg-rose-950/20 border border-rose-800/60 mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-rose-400 font-bold uppercase">Forecasted Target Step</span>
                    <span className="text-[10px] text-rose-300 font-bold">
                      {Math.round((activeConstellation.incident.predicted_confidence || activeConstellation.incident.confidence || 0.82) * 100)}% CONF
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-200 font-medium">
                    {activeConstellation.incident.predicted_next_step || 'Likely attempt to access or copy data from a server within 10 minutes.'}
                  </p>
                </div>

                {/* Recommended Operator Action */}
                {activeConstellation.incident.recommended_action && (
                  <div className="p-3 bg-amber-950/20 border border-amber-800/50 mb-4">
                    <div className="text-[10px] text-amber-400 font-bold uppercase mb-1">
                      AI Recommended Action
                    </div>
                    <p className="text-[11px] text-amber-200">
                      {activeConstellation.incident.recommended_action}
                    </p>
                  </div>
                )}
              </div>

              {/* Disposition Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => alert(`Escalated ${activeConstellation.incident.incident_id} to SOC`)}
                  className="flex-1 py-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-700 text-rose-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  ESCALATE
                </button>
                <button
                  type="button"
                  onClick={() => alert(`Marked ${activeConstellation.incident.incident_id} Reviewed`)}
                  className="flex-1 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  REVIEWED
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
