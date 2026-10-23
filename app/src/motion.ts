import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';

gsap.registerPlugin(ScrollTrigger, Flip);

// One decision for the whole page. The system's reduced-motion setting is the
// default; the Motion button overrides it and the choice is kept. Many phones
// turn reduced motion on with battery saver, so the reduced path is gentle
// (fades, no travel), not frozen.
export type MotionPref = 'full' | 'reduced';

function saved(): MotionPref | null {
  try {
    const v = localStorage.getItem('motion');
    return v === 'full' || v === 'reduced' ? v : null;
  } catch {
    return null;
  }
}

export const systemReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const motionPref: MotionPref = saved() ?? (systemReduced ? 'reduced' : 'full');
export const FULL = motionPref === 'full';

// gsap.matchMedia takes media queries: "all" always matches, "not all" never.
export const FULL_MOTION = FULL ? 'all' : 'not all';
export const GENTLE_MOTION = FULL ? 'not all' : 'all';

document.documentElement.classList.add(FULL ? 'motion-full' : 'motion-reduced');

export function prefersReducedMotion(): boolean {
  return !FULL;
}

export function setMotion(pref: MotionPref) {
  try {
    localStorage.setItem('motion', pref);
  } catch {
    // Storage blocked: the switch still applies for this visit.
  }
  location.reload();
}

export { gsap, ScrollTrigger, Flip };
