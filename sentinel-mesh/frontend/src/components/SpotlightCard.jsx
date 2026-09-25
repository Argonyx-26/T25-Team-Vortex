import React, { useRef, useState } from 'react';

/**
 * ReactBits SpotlightCard Component
 * Updated with subtle dark-navy styling (#0a0e1a to #000000),
 * atmospheric radial glows (10-14% opacity) behind high/medium severity cards,
 * and guaranteed z-index separation (effects at z-index: 0, content at z-index: 10).
 */
export default function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(244, 63, 94, 0.12)',
  borderColor = 'rgba(244, 63, 94, 0.35)',
  isUrgent = false,
  severity = 'high',
  borderTrail = null,
  ...props
}) {
  const divRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current || isFocused) return;
    const div = divRef.current;
    const rect = div.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  // Subtle atmospheric radial glow background (10-14% opacity)
  const atmosphericGlow =
    severity === 'high' || isUrgent
      ? 'radial-gradient(ellipse at 50% 0%, rgba(244, 63, 94, 0.14) 0%, rgba(10, 14, 26, 0) 70%)'
      : severity === 'medium'
      ? 'radial-gradient(ellipse at 50% 0%, rgba(245, 158, 11, 0.11) 0%, rgba(10, 14, 26, 0) 70%)'
      : 'radial-gradient(ellipse at 50% 0%, rgba(16, 185, 129, 0.09) 0%, rgba(10, 14, 26, 0) 70%)';

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-2xl border bg-[#0a0e1a]/95 overflow-hidden p-6 transition-all duration-300 backdrop-blur-xl ${
        isUrgent
          ? 'border-rose-500/70 shadow-[0_0_35px_rgba(244,63,94,0.18)]'
          : 'border-slate-800/80 shadow-2xl'
      } ${className}`}
      style={{ position: 'relative', overflow: 'hidden' }}
      {...props}
    >
      {/* 0. Border Trail strictly at border outline (z-index: 0) */}
      {borderTrail}

      {/* 1. Atmospheric Ambient Radial Glow behind the card (z-index: 0, 10-14% opacity) */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{ zIndex: 0, background: atmosphericGlow }}
        aria-hidden="true"
      />

      {/* 2. Dynamic Cursor Spotlight (z-index: 0) */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300"
        style={{
          zIndex: 0,
          opacity,
          background: `radial-gradient(500px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 45%)`,
        }}
        aria-hidden="true"
      />

      {/* 3. Dynamic Border Glow on Hover (z-index: 0) */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300"
        style={{
          zIndex: 0,
          opacity: opacity * 0.6,
          boxShadow: `inset 0 0 0 1px ${borderColor}`,
        }}
        aria-hidden="true"
      />

      {/* 4. Card Content: Strictly elevated to relative z-index: 10 */}
      <div className="relative" style={{ position: 'relative', zIndex: 10 }}>
        {children}
      </div>
    </div>
  );
}
