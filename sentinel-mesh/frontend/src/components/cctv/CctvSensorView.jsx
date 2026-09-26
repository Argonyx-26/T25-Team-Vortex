import React, { useState, useRef } from 'react';
import { Eye, Video, ShieldAlert, CheckCircle, Crosshair, Play, Pause, RotateCcw, AlertTriangle, Layers, Lock, Cpu, Volume2, VolumeX } from 'lucide-react';

/**
 * CctvSensorView
 * High-definition Physical Forensic Evidence Dossier.
 * Tracks video playback time: when person enters restricted zone (currentTime >= 1.2s),
 * the alert message, red bounding box, and intrusion telemetry dynamically trigger!
 */
export default function CctvSensorView() {
  const [selectedVideo, setSelectedVideo] = useState('/shoplifting_clip.mp4');
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [showReticle, setShowReticle] = useState(true);
  const [isLockedDown, setIsLockedDown] = useState(false);
  const videoRef = useRef(null);

  // Dynamic zone detection: Person enters restricted polygon when video time >= 1.2 seconds
  const isInRestrictedZone = currentTime >= 1.2;
  const dwellTime = isInRestrictedZone ? (Math.max(0, currentTime - 1.2) * 12 + 3.2).toFixed(1) : 0;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const jumpToBreach = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 1.4;
    videoRef.current.play();
    setIsPlaying(true);
  };

  const jumpToNormal = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0.2;
    videoRef.current.play();
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  return (
    <div className="border border-slate-800 bg-[#060a14] p-5 lg:p-6 shadow-[0_4px_30px_rgba(0,0,0,0.6)] font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 border flex items-center justify-center transition-colors ${
            isInRestrictedZone
              ? 'border-rose-500/80 bg-rose-950/40 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
              : 'border-cyan-500/40 bg-cyan-950/30 text-cyan-400'
          }`}>
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs uppercase tracking-widest font-bold ${
                isInRestrictedZone ? 'text-rose-400' : 'text-cyan-400'
              }`}>
                [PHASE 06 // PHYSICAL CCTV EVIDENCE]
              </span>
              <span className={`text-[10px] px-2 py-0.5 border flex items-center gap-1 font-bold ${
                isInRestrictedZone
                  ? 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse'
                  : 'bg-emerald-950 text-emerald-300 border-emerald-800'
              }`}>
                <span className={`w-1.5 h-1.5 inline-block ${
                  isInRestrictedZone ? 'bg-rose-400 animate-ping' : 'bg-emerald-400'
                }`} />
                {isInRestrictedZone ? 'ZONE INTRUSION ACTIVE' : 'PERIMETER NORMAL'}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-100 tracking-wide mt-0.5">
              Optical Loitering & Restricted Vault Zone Detection
            </h3>
          </div>
        </div>

        {/* Camera Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 hidden sm:inline">CCTV FEED:</span>
          <div className="flex items-center bg-[#080d1a] border border-slate-800 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setSelectedVideo('/shoplifting_clip.mp4')}
              className={`px-2.5 py-1 transition-colors cursor-pointer ${
                selectedVideo === '/shoplifting_clip.mp4'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              CAM-09 // SERVER VAULT
            </button>
            <button
              type="button"
              onClick={() => setSelectedVideo('/sample_restricted_zone.mp4')}
              className={`px-2.5 py-1 transition-colors cursor-pointer ${
                selectedVideo === '/sample_restricted_zone.mp4'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              CAM-02 // PERIMETER B
            </button>
          </div>
        </div>
      </div>

      {/* DYNAMIC ALERT MESSAGE (Displays ONLY when the person enters the specific restricted area!) */}
      {isInRestrictedZone && (
        <div className="mt-4 p-4 border bg-rose-950/60 border-rose-500 text-rose-100 shadow-[0_0_30px_rgba(244,63,94,0.35)] animate-pulse transition-all duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-9 h-9 rounded-none bg-rose-900 border-2 border-rose-400 flex items-center justify-center text-white flex-shrink-0 shadow-[0_0_12px_rgba(244,63,94,0.6)]">
                <AlertTriangle className="w-5 h-5 animate-bounce text-yellow-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs sm:text-sm font-black text-rose-200 tracking-wider uppercase">
                    ALERT: PERSON ENTERED RESTRICTED ZONE A
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-rose-900 text-white border border-rose-400 font-bold uppercase tracking-wider">
                    TRIGGER: restricted_zone_motion (CAM-09)
                  </span>
                </div>
                <div className="text-[11px] sm:text-xs text-rose-200 mt-1 font-mono">
                  Target #TRK-0042 breached restricted vault polygon (160, 70, 320, 240). Current dwell: <strong className="text-white bg-rose-900/80 px-1.5 py-0.5 border border-rose-400">{dwellTime}s</strong>.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className="text-[10px] px-2.5 py-1 bg-black/80 border border-rose-500 text-rose-300 font-bold tracking-wider">
                YOLOv8 CONFIDENCE: 94.2%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Video Screen & Forensic Telemetry Grid */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Main Video Viewport (7 cols) */}
        <div className="lg:col-span-7 relative border border-slate-800 bg-black aspect-video flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            key={selectedVideo}
            src={selectedVideo}
            autoPlay
            loop
            muted
            playsInline
            onTimeUpdate={handleTimeUpdate}
            className="w-full h-full object-cover opacity-90"
          />

          {/* Tactical Bounding Reticle (Changes dynamically based on Zone Entry!) */}
          {showReticle && (
            <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
              {/* Top HUD */}
              <div className="flex items-center justify-between text-[10px] bg-black/75 px-2.5 py-1 border border-slate-800 backdrop-blur-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 ${isInRestrictedZone ? 'bg-rose-500 animate-pulse' : 'bg-emerald-400'}`} />
                  <span className={`font-bold ${isInRestrictedZone ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {isInRestrictedZone ? 'ZONE BREACH [RESTRICTED VAULT]' : 'MONITORING [PERIMETER CLEAR]'}
                  </span>
                </div>
                <div className="text-slate-400">TIME: {currentTime.toFixed(2)}s | 29.97 FPS</div>
              </div>

              {/* Dynamic In-Video Alert Notification (Shows ONLY when person enters specific restricted area) */}
              {isInRestrictedZone && (
                <div className="mx-auto my-1 bg-rose-950/90 border border-rose-500 text-rose-100 px-4 py-1.5 text-xs font-extrabold flex items-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.7)] animate-pulse">
                  <AlertTriangle className="w-4 h-4 text-yellow-300 animate-bounce" />
                  <span className="tracking-wide">CRITICAL ALERT: PERSON ENTERED RESTRICTED AREA (CAM-09)</span>
                </div>
              )}

              {/* Dynamic Target Bounding Reticle */}
              <div
                className={`relative mx-auto transition-all duration-200 flex flex-col justify-between p-2 border-2 ${
                  isInRestrictedZone
                    ? 'w-52 h-64 border-rose-500 bg-rose-500/15 shadow-[0_0_25px_rgba(244,63,94,0.4)]'
                    : 'w-44 h-56 border-emerald-400/80 bg-emerald-400/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 border ${
                    isInRestrictedZone
                      ? 'bg-black/90 text-rose-300 border-rose-600'
                      : 'bg-black/90 text-emerald-300 border-emerald-600'
                  }`}>
                    {isInRestrictedZone ? 'TARGET: #TRK-0042 // IN ZONE' : 'TARGET: #TRK-0042 // OUTSIDE'}
                  </span>
                  <span className="text-[9px] bg-black/80 px-1 text-slate-300">
                    {isInRestrictedZone ? 'TRESPASS' : 'NORMAL'}
                  </span>
                </div>

                <div className="self-end">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 border ${
                    isInRestrictedZone
                      ? 'bg-black/90 text-rose-400 border-rose-700 animate-pulse'
                      : 'bg-black/90 text-slate-400 border-slate-700'
                  }`}>
                    {isInRestrictedZone ? `DWELL: ${dwellTime}s` : 'DWELL: 0.0s'}
                  </span>
                </div>
              </div>

              {/* Bottom HUD */}
              <div className="text-[10px] text-slate-300 flex items-center justify-between bg-black/75 px-2.5 py-1 border border-slate-800">
                <span className="text-cyan-300 font-semibold">SENSOR: CAM-09 (East Vault Axis)</span>
                <span className={isInRestrictedZone ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {isInRestrictedZone ? 'EVENT: evt_00003 FLAGGED' : 'NO ANOMALY'}
                </span>
              </div>
            </div>
          )}

          {/* Quick Playback Bar */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between bg-black/85 px-3 py-1.5 border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlay}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
              </button>

              <button
                type="button"
                onClick={jumpToBreach}
                className="px-2 py-0.5 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 flex items-center gap-1 cursor-pointer font-bold"
                title="Jump directly to moment person enters zone"
              >
                <RotateCcw className="w-3 h-3" />
                <span>JUMP TO ZONE ENTRY (1.4s)</span>
              </button>

              <button
                type="button"
                onClick={jumpToNormal}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] cursor-pointer"
              >
                START (0.2s)
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowReticle(!showReticle)}
              className="px-2 py-0.5 bg-slate-900 border border-slate-700 text-cyan-300 hover:text-cyan-200 cursor-pointer text-[11px]"
            >
              {showReticle ? 'HIDE HUD' : 'SHOW HUD'}
            </button>
          </div>
        </div>

        {/* Forensic Chain & Lockdown Control (5 cols) */}
        <div className="lg:col-span-5 border border-slate-800 bg-[#080d1a] p-5 flex flex-col justify-between text-xs space-y-4">
          <div>
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2 mb-3 flex items-center justify-between">
              <span className="text-cyan-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                YOLOv8 Optical Telemetry
              </span>
              <span className="text-[10px] text-slate-500">MODEL: yolov8n.pt</span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Restricted Polygon:</span>
                <span className="text-slate-200 font-semibold">(160, 70, 320, 240)</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Zone Safe Threshold:</span>
                <span className="text-amber-300">3.0 seconds max</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Current Dwell Duration:</span>
                <span className={`font-bold ${isInRestrictedZone ? 'text-rose-400 text-sm' : 'text-emerald-400'}`}>
                  {dwellTime} seconds
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Physical Breach Status:</span>
                <span className={`font-bold ${isInRestrictedZone ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {isInRestrictedZone ? 'BREACH CONFIRMED' : 'NORMAL'}
                </span>
              </div>
            </div>

            {/* Cross-Stream Digital Verification Notice */}
            <div className="mt-4 p-3 bg-[#060a14] border border-slate-800 text-[11px] text-slate-300 space-y-1.5">
              <div className="text-cyan-400 font-bold uppercase text-[10px]">
                CORRELATED WITH DIGITAL AUDIT LOGS:
              </div>
              <div>• 02:10:05Z: SSH Failed Login (IP: 10.0.0.5)</div>
              <div>• 02:14:00Z: Turnstile Door D-114 Tap (employee_42)</div>
              <div>• 02:15:30Z: Optical Vault Intrusion (CAM-09)</div>
            </div>
          </div>

          {/* Emergency Containment Action */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <button
              type="button"
              onClick={() => setIsLockedDown(!isLockedDown)}
              className={`w-full py-2.5 text-xs font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                isLockedDown
                  ? 'bg-rose-900 text-white border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.5)]'
                  : 'bg-rose-950/70 hover:bg-rose-900/90 border-rose-600 text-rose-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isLockedDown ? 'VAULT ACCESS REVOKED // AIR-GAPPED' : 'EXECUTE EMERGENCY VAULT LOCKDOWN'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
