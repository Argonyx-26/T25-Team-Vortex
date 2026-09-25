import React, { useState } from 'react';
import { Eye, Video, ShieldCheck, AlertCircle, Scan, Crosshair } from 'lucide-react';

/**
 * CctvSensorView
 * Displays real-time optical loitering detection feed and YOLOv8 CV telemetry.
 */
export default function CctvSensorView({ videoSrc = '/sample_restricted_zone.mp4' }) {
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <section className="my-8" id="section-cctv">
      <div className="border border-slate-800 bg-[#060a14] p-5 lg:p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-cyan-500/40 bg-cyan-950/30 flex items-center justify-center text-cyan-400">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-cyan-400 uppercase tracking-widest">[OPTICAL SENSOR FEED]</span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 bg-emerald-400 animate-ping inline-block" />
                  YOLOv8 DETECTOR ACTIVE
                </span>
              </div>
              <h3 className="font-mono text-base font-bold text-slate-100 tracking-wide mt-0.5">
                Restricted Perimeter Real-Time CCTV Stream
              </h3>
            </div>
          </div>

          <div className="font-mono text-xs text-slate-400 bg-[#080d1a] border border-slate-800 px-3 py-1.5">
            CAMERA: <span className="text-cyan-300">CAM-09 // SERVER VAULT EAST</span>
          </div>
        </div>

        {/* Video Player & Optical Telemetry */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Video Screen with HUD Reticle */}
          <div className="lg:col-span-2 relative border border-slate-800 bg-black aspect-video flex items-center justify-center overflow-hidden">
            <video
              src="/sample_restricted_zone.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover opacity-85"
            />

            {/* Tactical HUD Overlay */}
            <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
              {/* Top HUD */}
              <div className="flex items-center justify-between font-mono text-[10px] text-cyan-400 bg-black/60 px-2.5 py-1 border border-cyan-900/60 backdrop-blur-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-rose-500 animate-pulse" />
                  <span className="font-bold text-rose-400">REC [RESTRICTED ZONE]</span>
                </div>
                <div>FPS: 29.97 | RES: 1920x1080</div>
              </div>

              {/* Center Bounding Reticle */}
              <div className="relative w-44 h-56 mx-auto border-2 border-dashed border-rose-500/80 bg-rose-500/10 flex flex-col justify-between p-2">
                <div className="font-mono text-[10px] text-rose-300 font-bold bg-black/80 px-1 border border-rose-800 self-start">
                  PERSON 94.2% // DWELL: 340s
                </div>
                <div className="font-mono text-[9px] text-slate-300 bg-black/80 px-1 border border-slate-700 self-end">
                  LOITERING THRESHOLD EXCEEDED
                </div>
              </div>

              {/* Bottom HUD */}
              <div className="font-mono text-[10px] text-slate-400 flex items-center justify-between bg-black/60 px-2.5 py-1 border border-slate-800">
                <span>SENSOR: OPTICAL_YOLO_V8N</span>
                <span className="text-emerald-400">INFERENCE: 14.2ms</span>
              </div>
            </div>
          </div>

          {/* Optical Telemetry Panel */}
          <div className="border border-slate-800 bg-[#080d1a] p-4 flex flex-col justify-between font-mono text-xs">
            <div>
              <div className="text-cyan-400 font-bold text-xs uppercase tracking-wider border-b border-slate-800 pb-2 mb-3">
                CV Inference Parameters
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Model Weight:</span>
                  <span className="text-slate-200">yolov8n.pt (Nano)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Confidence Cutoff:</span>
                  <span className="text-cyan-300">0.50</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Loiter Dwell Threshold:</span>
                  <span className="text-amber-300">30.0 seconds</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Target Track ID:</span>
                  <span className="text-rose-400 font-bold">#TRK-0042</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Zone Polygon:</span>
                  <span className="text-slate-200">ZONE_SERVER_ROOM_A</span>
                </div>
              </div>

              <div className="mt-4 p-2.5 bg-rose-950/30 border border-rose-800/60 text-rose-300 text-[11px] leading-relaxed">
                <span className="font-bold">TRIGGER: </span>
                Motion sustained in non-public polygon during after-hours window. Emitted event <span className="underline">evt_00003</span> to correlation pipeline.
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <span>CAMERA HEALTH: 100%</span>
              <span className="text-emerald-400">ONLINE</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
