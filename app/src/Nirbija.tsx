import { useRef } from 'react';
import { gsap, FULL_MOTION, PLAY_ONCE, useIdleGSAP } from './motion';
import { nirbija, webUi } from './content-work';
import { StatLine } from './cases';
import { useLang } from './i18n';

const base = import.meta.env.BASE_URL;

/**
 * The flagship, set apart from the cases: a dark band the colour of the app
 * itself, the screenshot at full width, the numbers that matter for audio.
 */
export function Nirbija() {
  const { t } = useLang();
  const root = useRef<HTMLElement>(null);

  useIdleGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(FULL_MOTION, () => {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: { trigger: root.current, start: 'top 75%', toggleActions: PLAY_ONCE },
      });
      tl.from('.nb-kicker, .nb-name, .nb-kind', { y: 30, opacity: 0, duration: 0.6, stagger: 0.08 })
        .fromTo(
          '.nb-shot',
          { clipPath: 'inset(0% 0% 100% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'power2.inOut' },
          0.2,
        )
        .from('.nb-body > *', { y: 20, opacity: 0, duration: 0.5, stagger: 0.06 }, 0.5);
    });
  }, root);

  return (
    <section className="nirbija" aria-labelledby="nirbija-h" ref={root}>
      <div className="wrap">
        <p className="nb-kicker">{t(nirbija.kicker)}</p>
        <h3 id="nirbija-h" className="nb-title">
          <span className="nb-name">Nirbija</span>
          <span className="sr-only">, </span>
          <span className="nb-kind">{t(nirbija.kind)}</span>
        </h3>
      </div>
      <img
        className="nb-shot"
        src={`${base}img/nirbija-1600.webp`}
        srcSet={`${base}img/nirbija-900.webp 900w, ${base}img/nirbija-1600.webp 1600w`}
        sizes="(max-width: 1700px) 100vw, 1600px"
        width={1600}
        height={881}
        loading="lazy"
        decoding="async"
        alt={t(nirbija.alt)}
      />
      <div className="wrap nb-body">
        <p className="nb-lead">{t(nirbija.what)}</p>
        <ul className="stats">
          {nirbija.stats.map((stat, i) => (
            <StatLine stat={stat} key={i} />
          ))}
        </ul>
        <p>{t(nirbija.rule)}</p>
        <p>{t(nirbija.fm1)}</p>
        <p className="case-role">
          <strong>{t(webUi.role)}:</strong> {t(nirbija.role)}
        </p>
        <p className="links">
          <a className="btn" href={nirbija.site}>
            {t(nirbija.siteLabel)}
            <span className="sr-only">: Nirbija</span>
          </a>
          <a href={nirbija.code}>
            {t(webUi.code)}
            <span className="sr-only">: Nirbija</span>
          </a>
          <a href={nirbija.download}>
            {t(nirbija.downloadLabel)}
            <span className="sr-only">: Nirbija</span>
          </a>
        </p>
      </div>
    </section>
  );
}
