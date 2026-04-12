// Shared scale + axis helpers for all chart types.
// Pure functions — no React dependency.

// Linear scale: maps [domainMin, domainMax] → [rangeMin, rangeMax].
export function linearScale(domainMin, domainMax, rangeMin, rangeMax) {
  const span = domainMax - domainMin || 1;
  return (v) => rangeMin + ((v - domainMin) / span) * (rangeMax - rangeMin);
}

// Auto-generate nice Y ticks if none provided.
export function autoTicks(max, count = 5) {
  const raw = max / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const nice = [1, 2, 2.5, 5, 10].find((n) => n * mag >= raw) * mag;
  const ticks = [];
  for (let v = 0; v <= max; v += nice) ticks.push(Math.round(v * 1e6) / 1e6);
  return ticks;
}

// Format a Y-axis value using a template like "${}B" or "{}%".
export function formatValue(template, value) {
  if (!template) return String(value);
  return template.replace("{}", value === 0 ? "0" : String(value));
}
