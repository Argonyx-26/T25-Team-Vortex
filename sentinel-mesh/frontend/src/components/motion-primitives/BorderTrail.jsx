import React, { useRef, useState, useEffect, useId } from 'react';
import { motion } from 'framer-motion';

/**
 * Motion Primitives BorderTrail Component:
 * Traces a glowing beam strictly along the perimeter stroke of the card using SVG path animation.
 * Sits strictly at z-index: 0 behind content (which sits at z-index: 10) with overflow-hidden on parent.
 * Uses exact pixel bounding box from ResizeObserver to prevent distorted corners or circular artifacts.
 */
export default function BorderTrail({
  color = '#f43f5e',
  trailLength = 120,
  duration = 5,
  strokeWidth = 2,
  rx = 16,
  className = '',
}) {
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const id = useId();
  const gradientId = `trail-grad-${id.replace(/:/g, '')}`;

  useEffect(() => {
    if (!containerRef.current) return;
    const update = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        if (clientWidth > 0 && clientHeight > 0) {
          setSize({ width: clientWidth, height: clientHeight });
        }
      }
    };
    update();
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setSize({ width: Math.round(width), height: Math.round(height) });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const w = Math.max(0, size.width - strokeWidth);
  const h = Math.max(0, size.height - strokeWidth);
  // Accurate perimeter calculation for rounded rectangle
  const perimeter = w > 0 && h > 0 ? 2 * (w + h) - 8 * rx + 2 * Math.PI * rx : 1000;

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 z-0 rounded-[inherit] overflow-hidden ${className}`}
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {size.width > 0 && size.height > 0 && (
        <svg
          className="absolute inset-[1px] pointer-events-none rounded-[inherit]"
          width={w}
          height={h}
          viewBox={`0 0 ${w} ${h}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} stopOpacity="0" />
              <stop offset="60%" stopColor={color} stopOpacity="0.85" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Faint base border path */}
          <rect
            x={strokeWidth / 2}
            y={strokeWidth / 2}
            width={Math.max(0, w - strokeWidth)}
            height={Math.max(0, h - strokeWidth)}
            rx={rx}
            fill="none"
            stroke={color}
            strokeOpacity="0.12"
            strokeWidth={1}
          />

          {/* Glowing animated tracing stroke strictly along perimeter */}
          <motion.rect
            x={strokeWidth / 2}
            y={strokeWidth / 2}
            width={Math.max(0, w - strokeWidth)}
            height={Math.max(0, h - strokeWidth)}
            rx={rx}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={`${trailLength} ${Math.max(0, perimeter - trailLength)}`}
            strokeLinecap="round"
            animate={{
              strokeDashoffset: [0, -perimeter],
            }}
            transition={{
              repeat: Infinity,
              duration,
              ease: 'linear',
            }}
          />
        </svg>
      )}
    </div>
  );
}
