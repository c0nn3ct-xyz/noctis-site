// Shared motion rules for every live figure on the site — the popup mock today,
// the landing page's bands next. Two things every one of them needs, kept here
// rather than copied into each: a deterministic PRNG for the opening frame, and
// one answer to whether the figure should move at all.

/**
 * Deterministic PRNG, so a seeded frame is identical on the server and on the
 * client. The page is prerendered, so the opening client render has to match
 * the captured markup or React throws that markup away as a hydration mismatch.
 */
export function mulberry32(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Whether a figure should animate at all.
 *
 * Two reasons not to, and both apply to every live figure on the site, which is
 * why they live here rather than in one component: the prerender pass drives a
 * real browser and its captured DOM has to equal the visitor's first render, and
 * ambient movement with no informational content has to be stoppable (WCAG
 * 2.2.2) — the honest way to stop it is not to start.
 */
export function motionAllowed(): boolean {
  if (navigator.webdriver) return false;
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
