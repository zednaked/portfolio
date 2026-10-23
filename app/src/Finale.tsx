import { useRef } from 'react';
import { gsap, FULL_MOTION, GENTLE_MOTION, useIdleGSAP } from './motion';
import { finaleUi, ui } from './content';
import { useLang } from './i18n';

/**
 * The end of the roll: as you reach the bottom, a film burn opens from three
 * points, flashes, and leaves the signature card, assembled from a circle,
 * a square and a triangle. All of it scrubbed by the scroll.
 */
export function Finale() {
  const { t } = useLang();
  const root = useRef<HTMLElement>(null);

  useIdleGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(FULL_MOTION, () => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom bottom', scrub: 0.5 },
      });
      tl.fromTo(
        '.burn',
        { scale: 0.1, opacity: 0 },
        { scale: 2.4, opacity: 1, stagger: 0.06, duration: 0.35, ease: 'power2.in' },
        0,
      )
        .to('.burn', { scale: 4, opacity: 0, stagger: 0.05, duration: 0.3, ease: 'power2.out' }, 0.38)
        .from('.f-circle', { scale: 0, duration: 0.2, ease: 'back.out(1.7)' }, 0.42)
        .from('.f-square', { xPercent: -220, rotation: -45, duration: 0.22, ease: 'power4.out' }, 0.5)
        .from('.f-tri', { yPercent: 220, duration: 0.22, ease: 'power4.out' }, 0.56)
        .from('.f-name .lt', { yPercent: 105, stagger: 0.02, duration: 0.2, ease: 'power4.out' }, 0.5)
        .from('.f-role, .f-links', { opacity: 0, y: 20, stagger: 0.05, duration: 0.15 }, 0.7);
    });
    mm.add(GENTLE_MOTION, () => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom bottom', scrub: true },
      });
      tl.fromTo('.b3', { opacity: 0 }, { opacity: 0.9, duration: 0.3 }, 0)
        .to('.b3', { opacity: 0, duration: 0.3 }, 0.32)
        .from('.f-circle, .f-square, .f-tri, .f-text', { opacity: 0, stagger: 0.05, duration: 0.25 }, 0.4);
    });
  }, root);

  const word = (w: string) =>
    [...w].map((c, i) => (
      <i className="lt" key={i}>
        {c}
      </i>
    ));
  return (
    <section className="finale" ref={root} aria-labelledby="finale-name">
      <div className="finale-card">
        <div className="tex-paper" />
        <div className="tex-xerox" />
        <div className="f-circle" aria-hidden="true" />
        <div className="f-square" aria-hidden="true" />
        <div className="f-tri" aria-hidden="true" />
        <div className="f-text">
          <h2 className="f-name" id="finale-name">
            <span className="sr-only">Thiago Gonçalves</span>
            <span aria-hidden="true">
              <span>{word('THIAGO')}</span>
              <span>{word('GONÇALVES')}</span>
            </span>
          </h2>
          <p className="f-role">
            {t(finaleUi.role)}
            <br />
            <small>{t(finaleUi.remote)}</small>
          </p>
          <p className="f-links">
            <a className="btn" href="https://github.com/zednaked">
              GitHub
            </a>
            <a className="btn btn-dark" href="https://www.linkedin.com/in/thiago-g/">
              LinkedIn
            </a>
          </p>
        </div>
        {/* The footer lives on the last card, so the card ends the page whole. */}
        <footer className="f-foot">
          <p>
            Thiago Gonçalves · <a href="https://github.com/zednaked">GitHub</a> · {t(ui.colophon)}
          </p>
        </footer>
        <div className="burn b1" aria-hidden="true" />
        <div className="burn b2" aria-hidden="true" />
        <div className="burn b3" aria-hidden="true" />
      </div>
    </section>
  );
}
