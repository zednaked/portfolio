import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, FULL_MOTION, refreshSoon, useIdleGSAP } from './motion';

/**
 * Page-wide film layer, the reel's finishing pass on the web:
 * - grain and a riso halftone applied to the page, never catching clicks
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
      if (tc.current)
        tc.current.textContent = `00:${pad(Math.floor(f / 1800))}:${pad(Math.floor(f / 30) % 60)}:${pad(f % 30)}`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Positions are measured once; web fonts arriving later change line breaks
  // and push every section down. Re-measure when fonts are in and whenever
  // the page's height changes, or the last acts never reach their end.
  useEffect(() => {
    let timer = 0;
    const refresh = () => {
      clearTimeout(timer);
      timer = window.setTimeout(refreshSoon, 150);
    };
    void document.fonts.ready.then(refresh);
    window.addEventListener('load', refresh);
    let lastH = document.documentElement.scrollHeight;
    const ro = new ResizeObserver(() => {
      const h = document.documentElement.scrollHeight;
      if (Math.abs(h - lastH) > 1) {
        lastH = h;
        refresh();
      }
    });
    ro.observe(document.body);
    return () => {
      clearTimeout(timer);
      ro.disconnect();
      window.removeEventListener('load', refresh);
    };
  }, []);

  // The sections are lazy chunks that mount after this runs, so nothing here
  // holds a list of elements taken at setup: the skew targets are re-read on
  // every refresh, and the tilt finds its card from the pointer event.
  useIdleGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(FULL_MOTION, () => {
      // Velocity: drag or flick the page and the media leans with it.
      type Setter = (v: number) => void;
      let setters: Setter[] = [];
      const collect = () => {
        setters = gsap.utils
          .toArray<HTMLElement>('.shot, .reveal, .marquee-track')
          .map((el) => gsap.quickTo(el, 'skewY', { duration: 0.5, ease: 'power3' }));
      };
      collect();
      ScrollTrigger.addEventListener('refresh', collect);
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
      // Not the reel frame: its scroll tilt owns rotationX, and two tweens on
      // one property fight every frame.
      const tilts = new WeakMap<Element, [Setter, Setter]>();
      const tiltOf = (card: Element) => {
        let t = tilts.get(card);
        if (!t) {
          t = [
            gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3' }),
            gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3' }),
          ];
          tilts.set(card, t);
        }
        return t;
      };
      let current: Element | null = null;
      const release = () => {
        if (!current) return;
        const [rx, ry] = tiltOf(current);
        rx(0);
        ry(0);
        current = null;
      };
      const move = (e: PointerEvent) => {
        const card = e.target instanceof Element ? e.target.closest('.case, .piece') : null;
        if (card !== current) release();
        if (!card) return;
        current = card;
        const [rx, ry] = tiltOf(card);
        const r = card.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * 6);
        rx(-((e.clientY - r.top) / r.height - 0.5) * 6);
      };
      document.addEventListener('pointermove', move, { passive: true });
      document.documentElement.addEventListener('pointerleave', release);
      return () => {
        st.kill();
        ScrollTrigger.removeEventListener('refresh', collect);
        ScrollTrigger.removeEventListener('scrollEnd', settle);
        document.removeEventListener('pointermove', move);
        document.documentElement.removeEventListener('pointerleave', release);
      };
    });
  });

  return (
    <>
      <div className="film-grain" aria-hidden="true" />
      <div className="film-riso" aria-hidden="true" />
      <p className="film-tc" aria-hidden="true">
        TG · PORTFOLIO · <span ref={tc}>00:00:00:00</span>
      </p>
    </>
  );
}

/** A band of words that runs with the scroll and leans with its speed. */
export function Marquee({ words }: { words: string[] }) {
  const root = useRef<HTMLDivElement>(null);
  useIdleGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(FULL_MOTION, () => {
      gsap.fromTo(
        '.marquee-track',
        { xPercent: 0 },
        {
          xPercent: -30,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.4 },
        },
      );
    });
  }, root);
  const line = Array.from({ length: 6 }, () => words).flat();
  return (
    <div className="marquee" aria-hidden="true" ref={root}>
      <div className="marquee-track">
        {line.map((w, i) => (
          <span key={i} className={`mq mq${i % 3}`}>
            {w}
            <b>{['●', '▲', '■'][i % 3]}</b>
          </span>
        ))}
      </div>
    </div>
  );
}
