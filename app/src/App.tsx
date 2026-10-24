import { lazy, Suspense, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, FULL_MOTION, FULL } from './motion';
import { ui } from './content';
import { useLang } from './i18n';
import { Header } from './Header';
import { Act } from './Chapter';
import { Reel } from './Reel';
import { Film, Marquee } from './Film';
import { chapters } from './content';

// Everything below the reel arrives as its own chunk, after the first paint:
// the phone parses and runs less JavaScript before it can respond.
const Gallery = lazy(() => import('./Gallery').then((m) => ({ default: m.Gallery })));
const Games = lazy(() => import('./Games').then((m) => ({ default: m.Games })));
// The GPU is probed as the CODE chunk arrives, before the terrain renders:
// the act is laid out once, live or as its still, never swapped later.
const WebWork = lazy(() =>
  Promise.all([import('./WebWork'), import('./gpu')]).then(([m, g]) => {
    if (FULL) g.hasGPU();
    return { default: m.WebWork };
  }),
);
const About = lazy(() => import('./About').then((m) => ({ default: m.About })));
const Proofs = lazy(() => import('./Proofs').then((m) => ({ default: m.Proofs })));
const Finale = lazy(() => import('./Finale').then((m) => ({ default: m.Finale })));

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
