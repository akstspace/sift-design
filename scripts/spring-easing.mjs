#!/usr/bin/env node
// Turns a spring into a CSS `linear()` easing and a duration, so CSS-only
// components (Radix data-state keyframes, transitions) move with the same
// physics as the Motion presets in tokens/motion.ts.
//
//   node scripts/spring-easing.mjs <visualDuration seconds> <bounce 0..1>
//
// Uses the same mapping as Motion's { type: "spring", visualDuration, bounce }.

export function spring(visualDuration, bounce) {
  const root = (2 * Math.PI) / (visualDuration * 1.2);
  const stiffness = root * root;
  const damping = 2 * Math.min(1, Math.max(0.05, 1 - bounce)) * Math.sqrt(stiffness);
  const dt = 1 / 600;
  let x = 0, v = 0, t = 0;
  const samples = [];
  // Simulate until the value rests within 0.1% of the target.
  while (t < 5) {
    samples.push([t, x]);
    const a = stiffness * (1 - x) - damping * v;
    v += a * dt;
    x += v * dt;
    t += dt;
    if (t > 0.05 && Math.abs(1 - x) < 0.001 && Math.abs(v) < 0.01) break;
  }
  samples.push([t, 1]);
  const total = t;
  const points = 48;
  const stops = [];
  for (let i = 0; i <= points; i++) {
    const target = (i / points) * total;
    const s = samples.reduce((best, cur) => (Math.abs(cur[0] - target) < Math.abs(best[0] - target) ? cur : best));
    stops.push(i === points ? "1" : String(Math.round(s[1] * 1000) / 1000));
  }
  return { easing: `linear(${stops.join(", ")})`, duration: Math.round(total * 1000) };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [vd, b] = process.argv.slice(2).map(Number);
  if (!vd) {
    console.error("usage: node scripts/spring-easing.mjs <visualDuration> <bounce>");
    process.exit(2);
  }
  const { easing, duration } = spring(vd, b || 0);
  console.log(`duration: ${duration}ms\neasing: ${easing}`);
}
