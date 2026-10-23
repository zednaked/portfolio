import { useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger, FULL_MOTION } from './motion';

/**
 * Page-wide film layer, the reel's finishing pass on the web:
 * - grain and a riso halftone, fixed over everything, never catching clicks
 * - a timecode that runs with the scroll, one frame per 4 px
 * - scroll velocity bends the media and speeds the marquee, then lets go
 * - cards lean toward the pointer
 */
export function Film() {
  const tc = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const pad = (n: number) => String(n).padStart(2, '0');
    let raf = 0;
    const draw = () => {
      raf = 0;
      const f = Math.round(window.scrollY / 4);
      if (tc.current) tc.current.textContent = `00:${pad(Math.floor(f / 1800))}:${pad(Math.floor(f / 30) % 60)}:${pad(f % 30)}`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(draw); };
    draw();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  // Positions are measured once; web fonts arriving later change line breaks
  // and push every section down. Re-measure when fonts are in and whenever
  // the page's height changes, or the last acts never reach their end.
  useEffect(() => {
    let timer = 0;
    const refresh = () => { clearTimeout(timer); timer = window.setTimeout(() => ScrollTrigger.refresh(), 150); };
    document.fonts?.ready.then(refresh);
    window.addEventListener('load', refresh);
    let lastH = document.documentElement.scrollHeight;
    const ro = new ResizeObserver(() => {
      const h = document.documentElement.scrollHeight;
      if (Math.abs(h - lastH) > 1) { lastH = h; refresh(); }
    });
    ro.observe(document.body);
    return () => { clearTimeout(timer); ro.disconnect(); window.removeEventListener('load', refresh); };
  }, []);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(FULL_MOTION, () => {
      // Velocity: drag or flick the page and the media leans with it.
      const skewTargets = gsap.utils.toArray<HTMLElement>('.shot, .reveal, .marquee-track');
      const setters = skewTargets.map((el) => gsap.quickTo(el, 'skewY', { duration: 0.5, ease: 'power3' }));
      const st = ScrollTrigger.create({
        onUpdate: (self) => {
          const v = gsap.utils.clamp(-5, 5, self.getVelocity() / -400);
          setters.forEach((s) => s(v));
        },
      });
      // onUpdate stops with the scroll, so the last lean would stay frozen:
      // let go explicitly when the scroll ends.
      const settle = () => setters.forEach((s) => s(0));
      ScrollTrigger.addEventListener('scrollEnd', settle);

      // Tilt toward the pointer (mouse, pen, or a finger dragging a card).
      const cards = gsap.utils.toArray<HTMLElement>('.case, .piece, .reel-frame');
      const cleanups = cards.map((card) => {
        const rx = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3' });
        const ry = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3' });
        const move = (e: PointerEvent) => {
          const r = card.getBoundingClientRect();
          ry(((e.clientX - r.left) / r.width - 0.5) * 6);
          rx(-((e.clientY - r.top) / r.height - 0.5) * 6);
        };
        const leave = () => { rx(0); ry(0); };
        card.addEventListener('pointermove', move);
        card.addEventListener('pointerleave', leave);
        return () => { card.removeEventListener('pointermove', move); card.removeEventListener('pointerleave', leave); };
      });
      return () => { st.kill(); ScrollTrigger.removeEventListener('scrollEnd', settle); cleanups.forEach((c) => c()); };
    });
  });

  return (
    <>
      <div className="film-grain" aria-hidden="true" />
      <div className="film-riso" aria-hidden="true" />
      <p className="film-tc" aria-hidden="true">TG · PORTFOLIO · <span ref={tc}>00:00:00:00</span></p>
    </>
  );
}

/** A band of words that runs with the scroll and leans with its speed. */
export function Marquee({ words }: { words: string[] }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(FULL_MOTION, () => {
        gsap.fromTo('.marquee-track', { xPercent: 0 }, {
          xPercent: -30,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.4 },
        });
      });
    },
    { scope: root },
  );
  const line = Array.from({ length: 6 }, () => words).flat();
  return (
    <div className="marquee" aria-hidden="true" ref={root}>
      <div className="marquee-track">
        {line.map((w, i) => (
          <span key={i} className={`mq mq${i % 3}`}>{w}<b>{['●', '■', '▲'][i % 3]}</b></span>
        ))}
      </div>
    </div>
  );
}
