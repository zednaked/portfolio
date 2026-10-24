import { useEffect, useRef, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
// One entrance recipe serves every card, and not every card has stats or
// chips: an empty selection is expected, not a mistake worth a console line.
gsap.config({ nullTargetWarn: false });

// One decision for the whole page. The system's reduced-motion setting is the
// default; the Motion button overrides it, applies at once and is kept. Many
// phones turn reduced motion on with battery saver, so the reduced path is gentle
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

const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
export const systemReduced = reduceQuery.matches;

// Live bindings: the whole page is remounted when they change, so every
// component reads them fresh in its own setup.
export let motionPref: MotionPref = 'full';
export let FULL = true;
// gsap.matchMedia takes media queries: "all" always matches, "not all" never.
export let FULL_MOTION = 'all';
export let GENTLE_MOTION = 'not all';
/** True once the visitor has switched motion during this visit. */
export let switched = false;

function apply(pref: MotionPref) {
  motionPref = pref;
  FULL = pref === 'full';
  FULL_MOTION = FULL ? 'all' : 'not all';
  GENTLE_MOTION = FULL ? 'not all' : 'all';
  document.documentElement.classList.toggle('motion-full', FULL);
  document.documentElement.classList.toggle('motion-reduced', !FULL);
}
apply(saved() ?? (systemReduced ? 'reduced' : 'full'));

// The page re-renders from a version number: a switch bumps it, and main.tsx
// keys the app on it.
let version = 0;
const listeners = new Set<() => void>();
export function subscribeMotion(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
export const motionVersion = () => version;

// What the reader was looking at, so the switch doesn't move them: the card or
// section under the upper third of the screen and how far into it they were;
// inside a pinned section (the painting strip), how far along the pin, and
// which painting is in the middle, for the layout that has no pin.
const BLOCKS = 'article, section, header';
const pinOf = (el: Element) =>
  ScrollTrigger.getAll().find((t) => t.pin && (t.pin === el || t.pin.contains(el) || el.contains(t.pin)));

function anchor() {
  const hit = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 3);
  const el = hit?.closest(BLOCKS);
  if (!el) return null;
  const all = [...document.querySelectorAll(BLOCKS)];
  const r = el.getBoundingClientRect();
  const pin = pinOf(el);
  const middle = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2)?.closest('.piece');
  return {
    index: all.indexOf(el),
    into: (window.innerHeight / 3 - r.top) / Math.max(1, r.height),
    pin: pin?.isActive ? pin.progress : null,
    piece: middle ? [...document.querySelectorAll('.piece')].indexOf(middle) : -1,
  };
}
function restore(a: ReturnType<typeof anchor>) {
  if (!a) return;
  const all = document.querySelectorAll(BLOCKS);
  if (a.index < 0 || a.index >= all.length) return;
  const el = all[a.index];
  const pin = pinOf(el);
  const pieces = document.querySelectorAll('.piece');
  if (pin && a.pin !== null) {
    window.scrollTo(0, pin.start + a.pin * (pin.end - pin.start));
    return;
  }
  if (pin && a.piece >= 0) {
    window.scrollTo(0, pin.start + (a.piece / Math.max(1, pieces.length - 1)) * (pin.end - pin.start));
    return;
  }
  if (a.piece >= 0 && a.piece < pieces.length) {
    pieces[a.piece].scrollIntoView({ block: 'center' });
    return;
  }
  const r = el.getBoundingClientRect();
  window.scrollTo(0, window.scrollY + r.top + a.into * r.height - window.innerHeight / 3);
}

// Deep links and reloads: the browser jumps to #credits (or back to where a
// reload left off) before the lazy sections and their pins exist, and lands
// short. The page does it itself once the sections are built, unless the
// reader has started scrolling by then.
// One place the page owes the reader, kept until the deferred sections have
// built (each refresh puts it back; it is settled once the refreshes stop) or
// until the reader scrolls on their own. 8 s at most.
let owed: (() => boolean) | null = null;
let owedTimer = 0;
function owe(place: () => boolean, ms = 8000) {
  owed = place;
  clearTimeout(owedTimer);
  owedTimer = window.setTimeout(() => (owed = null), ms);
}
(['wheel', 'touchstart', 'keydown'] as const).forEach((type) => {
  window.addEventListener(type, () => (owed = null), { passive: true });
});
// Scrolls to a section if it exists yet; says whether it did.
function land(id: string) {
  const el = document.getElementById(id);
  el?.scrollIntoView();
  return !!el;
}
// A link to a section clicked before the section exists (the lazy chunks are
// still arriving) is kept as a debt too.
document.addEventListener('click', (e) => {
  const a = e.target instanceof Element ? e.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
  const id = a ? decodeURIComponent(a.hash.slice(1)) : '';
  if (id && !document.getElementById(id)) owe(() => land(id));
});

try {
  history.scrollRestoration = 'manual';
  const key = `scrollY:${location.pathname}${location.search}`;
  const target = decodeURIComponent(location.hash.slice(1));
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  // Reload and Back return to where the reader was, before any #link: the
  // place they left is the one they meant.
  const back = nav?.type === 'reload' || nav?.type === 'back_forward';
  const left = back ? sessionStorage.getItem(key) : null;
  // A saved 0 counts: the reader was at the top.
  if (left !== null)
    owe(() => {
      window.scrollTo(0, Number(left));
      return document.documentElement.scrollHeight > Number(left) + window.innerHeight;
    });
  else if (target) owe(() => land(target));
  window.addEventListener('pagehide', () => {
    sessionStorage.setItem(key, String(Math.round(window.scrollY)));
  });
} catch {
  // Storage or history blocked: the browser's own behaviour stands.
}

function switchTo(pref: MotionPref) {
  if (pref === motionPref) return;
  const a = anchor();
  // The remount replaces the button too: keep keyboard users on it.
  const refocus = document.activeElement?.classList.contains('motion-btn') ?? false;
  apply(pref);
  switched = true;
  version++;
  listeners.forEach((fn) => {
    fn();
  });
  // The place is put back each time the remounted sections finish building
  // their triggers (pins add height), not on a guess of how long that takes.
  owe(() => {
    restore(a);
    return true;
  });
  requestAnimationFrame(() => {
    if (refocus) document.querySelector<HTMLElement>('.motion-btn')?.focus({ preventScroll: true });
  });
}

/** The Motion button: applies at once, and the choice is kept. */
export function setMotion(pref: MotionPref) {
  try {
    localStorage.setItem('motion', pref);
  } catch {
    // Storage blocked: the switch still applies for this visit.
  }
  switchTo(pref);
}

// Without a saved choice, the page follows the system setting as it changes.
reduceQuery.addEventListener('change', (e) => {
  if (!saved()) switchTo(e.matches ? 'reduced' : 'full');
});

// Below-the-fold motion is built when the main thread is free, not in the
// first render: two dozen ScrollTriggers measured at once were a 1 s task on a
// phone. Each component gets its own idle slot, so no single task is long, and
// one refresh at the end puts the triggers back in page order (the gallery's
// pin moves everything after it).
let refreshTimer = 0;
let settledTimer = 0;
/** The one way the page re-measures its triggers, so the reader's place
    (or the place owed to them) is kept through every change of height. */
export function refreshSoon() {
  clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(() => {
    // Whatever the reader is looking at stays put while a pin built late adds
    // height above it, unless the page owes them another place.
    const here = owed || window.scrollY < 1 ? null : anchor();
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    // The debt is settled once it has landed and the refreshes have stopped;
    // one that can't land yet (its section isn't built) waits for the next.
    clearTimeout(settledTimer);
    if (owed) {
      if (owed()) settledTimer = window.setTimeout(() => (owed = null), 1500);
    } else if (here) restore(here);
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

// Entrances play once and stay. Not `once: true`: a trigger that kills itself
// while ScrollTrigger is refreshing (a motion switch near the bottom) crashed
// the refresh; playing and never reversing does the same without dying.
export const PLAY_ONCE = 'play none none none';

export { gsap, ScrollTrigger };
