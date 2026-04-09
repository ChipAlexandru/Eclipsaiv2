import { useState, useEffect, useRef } from "react";

// Animated number counter — eases 0 → value over 1.2s when `visible` flips true.
// If `isText` is true, the value renders as a plain string (no numeric animation).
// Extracted from definitive.jsx. Behavior-preserving.
export function AnimNum({ value, unit, visible, isText }) {
  const [current, setCurrent] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (!visible || isText) return;
    let start = 0;
    const end = typeof value === "number" ? value : 0;
    if (end === 0) return;
    const duration = 1200;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(eased * end);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [visible, value, isText]);

  if (isText) return <span>{value}{unit}</span>;
  const display = unit === "×" ? current.toFixed(1) : Math.round(current);
  return <span>{display}{unit}</span>;
}
