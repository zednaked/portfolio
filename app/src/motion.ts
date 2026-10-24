import { useEffect, useRef, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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

export function setMotion(pref: MotionPref) {
  try {
    localStorage.setItem('motion', pref);
  } catch {
    // Storage blocked: the switch still applies for this visit.
  }
  location.reload();
}

// Below-the-fold motion is built when the main thread is free, not in the
// first render: two dozen ScrollTriggers measured at once were a 1 s task on a
// phone. Each component gets its own idle slot, so no single task is long, and
// one refresh at the end puts the triggers back in page order (the gallery's
// pin moves everything after it).
let refreshTimer = 0;
function refreshSoon() {
  clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(() => {
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  }, 120);
}

export function useIdleGSAP(setup: () => void, scope?: RefObject<Element | null>) {
  // setup runs once, like useGSAP without dependencies.
  const first = useRef(setup);
  useEffect(() => {
    let ctx: gsap.Context | null = null;
    const run = () => {
      ctx = gsap.context(first.current, scope?.current ?? undefined);
      refreshSoon();
    };
    const idle = 'requestIdleCallback' in window;
    const id = idle ? window.requestIdleCallback(run, { timeout: 1000 }) : window.setTimeout(run, 100);
    return () => {
      if (idle) window.cancelIdleCallback(id);
      else clearTimeout(id);
      ctx?.revert();
    };
  }, [scope]);
}

export { gsap, ScrollTrigger };
