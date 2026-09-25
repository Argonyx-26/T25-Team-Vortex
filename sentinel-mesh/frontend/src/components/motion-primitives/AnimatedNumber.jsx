import { useEffect, useState, useRef } from 'react';
import { animate } from 'framer-motion';

/**
 * AnimatedNumber Motion Primitive:
 * Smooth 0.75s count-up transition with easeOut curve.
 * Counts feel natural and fluid rather than mechanical.
 */
export default function AnimatedNumber({
  value,
  className = '',
  duration = 0.75,
  ease = [0.16, 1, 0.3, 1], // Fluid easeOut curve
  decimalPlaces = 0,
}) {
  const [display, setDisplay] = useState(
    typeof value === 'number' ? value.toFixed(decimalPlaces) : '0'
  );
  const prevVal = useRef(typeof value === 'number' ? value : 0);

  useEffect(() => {
    const startVal = prevVal.current;
    const targetVal = typeof value === 'number' ? value : 0;

    const controls = animate(startVal, targetVal, {
      duration,
      ease,
      onUpdate: (latest) => {
        setDisplay(Number(latest).toFixed(decimalPlaces));
      },
      onComplete: () => {
        prevVal.current = targetVal;
      },
    });

    return () => controls.stop();
  }, [value, duration, ease, decimalPlaces]);

  return <span className={className}>{display}</span>;
}
