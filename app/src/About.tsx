import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, FULL_MOTION, PLAY_ONCE } from './motion';
import { ui } from './content';
import { bookImages, exhibits } from './content-work';
import { useLang } from './i18n';

export function About() {
  const { t } = useLang();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(FULL_MOTION, () => {
        const tl = gsap.timeline({
          defaults: { ease: 'power3.out' },
          scrollTrigger: { trigger: root.current, start: 'top 80%', toggleActions: PLAY_ONCE },
        });
        tl.fromTo(
          '.portrait',
          { clipPath: 'inset(0% 0% 100% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'power2.inOut' },
        )
          .from('.label', { scaleX: 0, transformOrigin: 'left center', duration: 0.45 }, 0.25)
          .from('.box', { y: 24, duration: 0.6 }, 0.4)
          // The record of exhibitions, then the book laid down page by page.
          .from('.exhibits li', { x: -20, opacity: 0, duration: 0.35, stagger: 0.05 }, 0.3)
          .from('.book img', { y: 24, rotation: -3, opacity: 0, duration: 0.5, stagger: 0.08 }, 0.5);
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
