import { useRef } from 'react';
import { gsap, FULL_MOTION, GENTLE_MOTION, useIdleGSAP } from './motion';
import { finaleUi, ui } from './content';
import { useLang } from './i18n';

/**
 * The end of the roll: as you reach the bottom, the signature card assembles
 * from a circle, a square and a triangle, and the name rises. All of it
 * scrubbed by the scroll.
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
      // The shapes arrive as the card comes up, not after a screen of paper.
      tl.from('.f-circle', { scale: 0, duration: 0.3, ease: 'back.out(1.7)' }, 0.05)
        .from('.f-square', { xPercent: -220, rotation: -45, duration: 0.32, ease: 'power4.out' }, 0.12)
        .from('.f-tri', { yPercent: 220, duration: 0.32, ease: 'power4.out' }, 0.2)
        .from('.f-name .lt', { yPercent: 105, stagger: 0.02, duration: 0.3, ease: 'power4.out' }, 0.2)
        .from('.f-role, .f-mail, .f-links', { opacity: 0, y: 20, stagger: 0.05, duration: 0.2 }, 0.45);
    });
    mm.add(GENTLE_MOTION, () => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom bottom', scrub: true },
      });
      tl.from('.f-circle, .f-square, .f-tri, .f-text', { opacity: 0, stagger: 0.05, duration: 0.25 }, 0.1);
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
          <p className="f-mail">
            <small>{t(finaleUi.available)}</small>
            <a href="mailto:zednaked@gmail.com">zednaked@gmail.com</a>
          </p>
          <p className="f-links">
            <a className="btn" href={`${import.meta.env.BASE_URL}cv-thiago-goncalves.pdf`}>
              {t(finaleUi.cv)}
            </a>
            <a className="btn btn-dark" href="https://github.com/zednaked">
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
      </div>
    </section>
  );
}
