import { lazy, Suspense, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, FULL_MOTION } from './motion';
import { ui } from './content';
import { useLang } from './i18n';
import { Header } from './Header';
import { Act } from './Chapter';
import { Reel } from './Reel';
import { Film, Marquee } from './Film';
import { bookImages, chapters, exhibits } from './content';

// Everything below the reel arrives as its own chunk, after the first paint:
// the phone parses and runs less JavaScript before it can respond.
const Gallery = lazy(() => import('./Gallery').then((m) => ({ default: m.Gallery })));
const Games = lazy(() => import('./Games').then((m) => ({ default: m.Games })));
const WebWork = lazy(() => import('./WebWork').then((m) => ({ default: m.WebWork })));
const Proofs = lazy(() => import('./Proofs').then((m) => ({ default: m.Proofs })));
const Finale = lazy(() => import('./Finale').then((m) => ({ default: m.Finale })));

function About() {
  const { t } = useLang();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(FULL_MOTION, () => {
        const tl = gsap.timeline({
          defaults: { ease: 'power3.out' },
          scrollTrigger: { trigger: root.current, start: 'top 80%', once: true },
        });
        tl.fromTo(
          '.portrait',
          { clipPath: 'inset(0% 0% 100% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'power2.inOut' },
        )
          .from('.label', { scaleX: 0, transformOrigin: 'left center', duration: 0.45 }, 0.25)
          .from('.box', { y: 24, duration: 0.6 }, 0.4)
          // The record of exhibitions, then the book laid down page by page.
          .from('.exhibits li', { x: -20, opacity: 0, duration: 0.45, stagger: 0.08 }, 0.7)
          .from('.book img', { y: 24, rotation: -3, opacity: 0, duration: 0.6, stagger: 0.1 }, 1.0);
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
        <h3 className="exhibits-h">{t(ui.exhibitsLabel)}</h3>
        <ul className="exhibits">
          {exhibits.map((ex) => (
            <li key={ex.when.en}>
              <strong>{t(ex.when)}</strong>
              <span>{t(ex.what)}</span>
            </li>
          ))}
        </ul>
      </div>
      {/* The book runs the full width, under the portrait and the record. */}
      <figure className="book">
        <div className="book-row">
          {bookImages.map((img) => (
            <img
              key={img.src}
              src={img.src}
              width={img.width}
              height={img.height}
              alt={t(img.alt)}
              loading="lazy"
              decoding="async"
            />
          ))}
        </div>
        <figcaption>{t(ui.bookLabel)}</figcaption>
      </figure>
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
        {/* The work comes first; who made it and who credited it, after. */}
        <Marquee words={['PAINT', 'PLAY', 'CODE']} />
        <Suspense fallback={null}>
          <Act chapter={chapters.paint}>
            <Gallery />
          </Act>
          <Act chapter={chapters.play}>
            <Games />
          </Act>
          <Act chapter={chapters.code}>
            <WebWork />
          </Act>
          <About />
          <Proofs />
          <Finale />
        </Suspense>
      </main>
      <Film />
    </div>
  );
}
