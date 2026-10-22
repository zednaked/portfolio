import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';

gsap.registerPlugin(ScrollTrigger, Flip);

// One switch for the whole page: every timeline is built inside this
// condition, so a reduced-motion system gets the final state with no tweening.
export const FULL_MOTION = '(prefers-reduced-motion: no-preference)';

export function prefersReducedMotion(): boolean {
  return !window.matchMedia(FULL_MOTION).matches;
}

export { gsap, ScrollTrigger, Flip };
