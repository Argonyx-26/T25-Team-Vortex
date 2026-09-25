import React, { useEffect, useState, useRef } from 'react';

/**
 * TargetCursor
 * Precision tactical crosshair reticle cursor.
 * Features:
 * - Corner reticle brackets
 * - Center micro-pip
 * - Real-time screen coordinate HUD [X, Y]
 * - Lock-on reticle state when hovering interactive elements
 */
export default function TargetCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isLocked, setIsLocked] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const rafId = useRef(null);
  const mousePos = useRef({ x: -100, y: -100 });
  const curPos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    // Only enable on pointer-fine devices (desktop)
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      // Check if target is interactive
      const target = e.target;
      const interactive = target.closest('button, a, input, select, [role="button"], .interactive-card');
      setIsLocked(!!interactive);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Smooth lerp loop
    const render = () => {
      curPos.current.x += (mousePos.current.x - curPos.current.x) * 0.28;
      curPos.current.y += (mousePos.current.y - curPos.current.y) * 0.28;
      setPos({
        x: Math.round(curPos.current.x),
        y: Math.round(curPos.current.y)
      });
      rafId.current = requestAnimationFrame(render);
    };
    rafId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isVisible]);

  if (!isVisible || pos.x < 0) return null;

  return (
    <div
      className="fixed pointer-events-none z-[9999] transition-transform duration-75 ease-out"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Reticle Container */}
      <div
        className={`relative flex items-center justify-center transition-all duration-150 ${
          isLocked
            ? 'w-10 h-10 border border-cyan-400/80 bg-cyan-500/10 scale-110 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
            : isClicking
            ? 'w-7 h-7 border border-emerald-400 bg-emerald-500/20 scale-90'
            : 'w-8 h-8'
        }`}
      >
        {/* Corner Reticle Brackets */}
        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-cyan-400" />
        <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-cyan-400" />
        <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-cyan-400" />
        <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-cyan-400" />

        {/* Center Pip */}
        <div
          className={`rounded-none transition-all duration-100 ${
            isLocked
              ? 'w-1.5 h-1.5 bg-cyan-400 shadow-[0_0_8px_#00f0ff]'
              : isClicking
              ? 'w-2 h-2 bg-emerald-400'
              : 'w-1 h-1 bg-cyan-300/80'
          }`}
        />

        {/* Coordinate Readout HUD */}
        <div className="absolute top-5 left-5 whitespace-nowrap bg-black/80 px-1 py-0.5 border border-cyan-900/60 font-mono text-[9px] tracking-widest text-cyan-400 backdrop-blur-xs select-none">
          {isLocked ? (
            <span className="text-emerald-400 font-bold">LOCK: TRG-OK</span>
          ) : (
            <span>X:{pos.x} Y:{pos.y}</span>
          )}
        </div>
      </div>
    </div>
  );
}
