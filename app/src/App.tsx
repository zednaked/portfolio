import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, FULL_MOTION } from './motion';
import { ui } from './content';
import { useLang } from './i18n';
import { Header } from './Header';
import { Gallery } from './Gallery';
import { WebWork } from './WebWork';
import { Games } from './Games';
import { Proofs } from './Proofs';
import { Act } from './Chapter';
import { Reel } from './Reel';
import { Finale } from './Finale';
import { Film, Marquee } from './Film';
import { chapters } from './content';

function About() {
  const { t } = useLang();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(FULL_MOTION, () => {
        const tl = gsap.timeline({ delay: 0.5, defaults: { ease: 'power3.out' } });
        tl.fromTo(
          '.portrait',
          { clipPath: 'inset(0% 0% 100% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'power2.inOut' },
        )
          .from('.label', { scaleX: 0, transformOrigin: 'left center', duration: 0.45 }, 0.25)
          // Only position moves on the text box: it stays visible from the
          // first frame, so it can count as the largest paint right away.
          .from('.box', { y: 24, duration: 0.6 }, 0.4)
          // The award pops in like a stamp. It grows from smaller than its
          // final size, so its first paint never outranks the text box as LCP.
          .from('.award', { scale: 0.7, rotation: -8, opacity: 0, duration: 0.5, ease: 'back.out(2.2)' }, 0.85)
          .from('.show', { x: -20, opacity: 0, duration: 0.45 }, 1.1);
      });
    },
    { scope: root },
  );

  return (
    <section className="wrap about" aria-labelledby="about-h" ref={root}>
      <img
        className="portrait"
        src={`${import.meta.env.BASE_URL}img/portrait.webp`}
        width={400}
        height={399}
        alt={t(ui.portraitAlt)}
        fetchPriority="high"
      />
      <div>
        <h2 className="label" id="about-h">
          {t(ui.aboutLabel)}
        </h2>
        <p className="box">{t(ui.about)}</p>
        <p className="award">
          <strong>{t(ui.awardYear)}</strong>
          <span>{t(ui.award)}</span>
        </p>
        <p className="show">
          <strong>{t(ui.showYear)}</strong>
          <span>{t(ui.show)}</span>
        </p>
      </div>
    </section>
  );
}

export function App() {
  const { lang, t } = useLang();
  const firstLang = useRef(true);

  // A language switch fades the new text in, so the swap reads as intended.
  useGSAP(
    () => {
      // The intro already reveals this text; only later switches fade it.
      if (firstLang.current) {
        firstLang.current = false;
        return;
      }
      if (FULL_MOTION !== 'all') return;
      gsap.fromTo(
        '.role, .box, figcaption, .label',
        { autoAlpha: 0.2 },
        { autoAlpha: 1, duration: 0.35, stagger: 0.02, overwrite: 'auto' },
      );
    },
    { dependencies: [lang], revertOnUpdate: false },
  );

  return (
    <div className="page">
      <a className="skip" href="#work">
        {t(ui.skip)}
      </a>
      <Header />
      <main>
        <Reel />
        <About />
        <Proofs />
        <Marquee words={['PAINT', 'PLAY', 'CODE']} />
        <Act chapter={chapters.paint}>
          <Gallery />
        </Act>
        <Act chapter={chapters.play}>
          <Games />
        </Act>
        <Act chapter={chapters.code}>
          <WebWork />
        </Act>
        <Finale />
      </main>
      <Film />
    </div>
  );
}
