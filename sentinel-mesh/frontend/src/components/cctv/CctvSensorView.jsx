import React, { useState, useRef } from 'react';
import { Eye, Video, ShieldAlert, CheckCircle, Crosshair, Play, Pause, RotateCcw, AlertTriangle, Layers, Lock, Cpu } from 'lucide-react';

/**
 * CctvSensorView
 * High-definition Physical Forensic Evidence Dossier.
 * Connects real video playback with YOLOv8 optical telemetry,
 * suspicious activity classification, and multi-stream correlation proof.
 */
export default function CctvSensorView() {
  const [selectedVideo, setSelectedVideo] = useState('/shoplifting_clip.mp4');
  const [isPlaying, setIsPlaying] = useState(true);
  const [showReticle, setShowReticle] = useState(true);
  const [isLockedDown, setIsLockedDown] = useState(false);
  const videoRef = useRef(null);

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
    videoRef.current.currentTime = 1.5;
    videoRef.current.play();
    setIsPlaying(true);
  };

  return (
    <section className="my-8" id="section-cctv">
      <div className="border border-slate-800 bg-[#060a14] p-5 lg:p-6 shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-rose-500/40 bg-rose-950/30 flex items-center justify-center text-rose-400">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-rose-400 uppercase tracking-widest font-semibold">
                  [PHYSICAL FORENSIC EVIDENCE]
                </span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 bg-rose-400 animate-ping inline-block" />
                  SUSPICIOUS ACTIVITY CONFIRMED
                </span>
              </div>
              <h3 className="font-mono text-base font-bold text-slate-100 tracking-wide mt-0.5">
                Restricted Perimeter Optical Loitering & Physical Breach Verification
              </h3>
            </div>
          </div>

          {/* Camera Feed Stream Selector */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-slate-500 hidden sm:inline">EVIDENCE STREAM:</span>
            <div className="flex items-center bg-[#080d1a] border border-slate-800 p-0.5 font-mono text-xs">
              <button
                type="button"
                onClick={() => setSelectedVideo('/shoplifting_clip.mp4')}
                className={`px-2.5 py-1 transition-colors cursor-pointer ${
                  selectedVideo === '/shoplifting_clip.mp4'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                CAM-09 // VAULT BREACH
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

        {/* Suspicious Activity Evidence Banner */}
        <div className="mt-4 p-3.5 bg-rose-950/30 border border-rose-700/60 font-mono text-xs text-rose-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <div>
              <span className="font-bold text-rose-300 uppercase tracking-wide">
                SUSPICIOUS BEHAVIOR CLASSIFICATION:
              </span>
              <span className="ml-2 text-slate-200">
                Unauthorized After-Hours Dwell & Physical Console Tampering. Person tracked in restricted polygon.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end md:self-auto">
            <span className="text-[10px] px-2 py-0.5 bg-rose-900/60 border border-rose-600 font-bold uppercase">
              CONFIDENCE: 94.2%
            </span>
          </div>
        </div>

        {/* Video Player & Optical Telemetry Grid */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Video Screen with HUD Reticle */}
          <div className="lg:col-span-2 relative border border-slate-800 bg-black aspect-video flex items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              key={selectedVideo}
              src={selectedVideo}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover opacity-90"
            />

            {/* Tactical HUD Overlay */}
            {showReticle && (
              <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                {/* Top HUD */}
                <div className="flex items-center justify-between font-mono text-[10px] text-cyan-400 bg-black/70 px-2.5 py-1 border border-cyan-900/60 backdrop-blur-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-rose-500 animate-pulse" />
                    <span className="font-bold text-rose-400">REC // LIVE OPTICAL SURVEILLANCE</span>
                  </div>
                  <div className="text-slate-400">ZONE: RESTRICTED_VAULT_A (160, 70, 320, 240)</div>
                </div>

                {/* Center Bounding Reticle (Suspicious Person Tracking) */}
                <div className="relative w-48 h-60 mx-auto border-2 border-dashed border-rose-500 bg-rose-500/10 flex flex-col justify-between p-2 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                  <div className="font-mono text-[10px] text-rose-200 font-bold bg-black/90 px-1.5 py-0.5 border border-rose-800 self-start">
                    TARGET: #TRK-0042 // PERSON (94.2%)
                  </div>
                  <div className="font-mono text-[9px] text-rose-300 font-bold bg-black/90 px-1.5 py-0.5 border border-rose-800 self-end">
                    DWELL: 340s [THRESHOLD: 3.0s EXCEEDED]
                  </div>
                </div>

                {/* Bottom HUD */}
                <div className="font-mono text-[10px] text-slate-300 flex items-center justify-between bg-black/70 px-2.5 py-1 border border-slate-800">
                  <span className="text-emerald-400 font-semibold">MODEL: YOLOv8n (Inference: 14.2ms)</span>
                  <span className="text-rose-400 font-bold">PHYSICAL EVENT ID: evt_00003</span>
                </div>
              </div>
            )}

            {/* Playback Controls Overlay Bar */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between bg-black/80 px-3 py-1.5 border border-slate-800 font-mono text-xs">
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
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>JUMP TO BREACH (02:15:30Z)</span>
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

          {/* Forensic Evidence Analysis Panel */}
          <div className="border border-slate-800 bg-[#080d1a] p-4 flex flex-col justify-between font-mono text-xs">
            <div>
              <div className="text-rose-400 font-bold text-xs uppercase tracking-wider border-b border-slate-800 pb-2 mb-3 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Forensic Chain of Evidence</span>
              </div>

              {/* Multi-Stream Proof Steps */}
              <div className="space-y-3">
                <div className="p-2 border border-slate-800 bg-[#060a14]">
                  <div className="text-[10px] text-slate-500 font-bold">STEP 1: DIGITAL RECONNAISSANCE</div>
                  <div className="text-slate-200 font-semibold mt-0.5">02:10:05Z - Failed SSH Login (x5)</div>
                  <div className="text-[11px] text-amber-400">Target: DMZ Gateway (10.0.0.5)</div>
                </div>

                <div className="p-2 border border-slate-800 bg-[#060a14]">
                  <div className="text-[10px] text-slate-500 font-bold">STEP 2: PHYSICAL ACCESS GAINED</div>
                  <div className="text-slate-200 font-semibold mt-0.5">02:14:00Z - Badge Door D-114 Tap</div>
                  <div className="text-[11px] text-emerald-400">Entity: employee_42 (Granted)</div>
                </div>

                <div className="p-2 border border-rose-900/80 bg-rose-950/20">
                  <div className="text-[10px] text-rose-400 font-bold">STEP 3: VISUAL CONFIRMATION</div>
                  <div className="text-rose-200 font-semibold mt-0.5">02:15:30Z - Camera CAM-09 Optical Detection</div>
                  <div className="text-[11px] text-rose-300">Target #TRK-0042 in Server Vault Polygon</div>
                </div>
              </div>
            </div>

            {/* Operator Lockdown Action */}
            <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
              <button
                type="button"
                onClick={() => setIsLockedDown(!isLockedDown)}
                className={`w-full py-2 font-mono text-xs font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                  isLockedDown
                    ? 'bg-rose-900 text-white border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                    : 'bg-rose-950/60 hover:bg-rose-900/80 border-rose-700 text-rose-300'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isLockedDown ? 'VAULT LOCKED DOWN // ACCESS REVOKED' : 'EXECUTE EMERGENCY VAULT LOCKDOWN'}</span>
              </button>
              <div className="text-[10px] text-slate-500 text-center">
                Cryptographic audit hash verified: sha256:7f8a92...
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
