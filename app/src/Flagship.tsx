import { useRef } from 'react';
import { gsap, FULL_MOTION, PLAY_ONCE, useIdleGSAP } from './motion';
import { webUi, type Flagship as Piece } from './content-work';
import { StatLine } from './cases';
import { useLang } from './i18n';

const base = import.meta.env.BASE_URL;

/**
 * A flagship, set apart from its chapter's cases: a dark band in the colours
 * of the work itself, the screenshot at full width, the numbers that matter.
 */
export function Flagship({ piece }: { piece: Piece }) {
  const { t } = useLang();
  const root = useRef<HTMLElement>(null);
  const heading = `${piece.id}-h`;

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
    <section className={`flagship ${piece.id}`} aria-labelledby={heading} ref={root}>
      <div className="wrap">
        <p className="nb-kicker">{t(piece.kicker)}</p>
        <h3 id={heading} className="nb-title">
          <span className="nb-name">{piece.name}</span>
          <span className="sr-only">, </span>
          <span className="nb-kind">{t(piece.kind)}</span>
        </h3>
      </div>
      <img
        className="nb-shot"
        src={`${base}img/${piece.id}-1600.webp`}
        srcSet={`${base}img/${piece.id}-900.webp 900w, ${base}img/${piece.id}-1600.webp 1600w`}
        sizes="(max-width: 1700px) 100vw, 1600px"
        width={piece.width}
        height={piece.height}
        loading="lazy"
        decoding="async"
        alt={t(piece.alt)}
      />
      <div className="wrap nb-body">
        <p className="nb-lead">{t(piece.what)}</p>
        <ul className="stats">
          {piece.stats.map((stat, i) => (
            <StatLine stat={stat} key={i} />
          ))}
        </ul>
        {piece.more.map((text, i) => (
          <p key={i}>{t(text)}</p>
        ))}
        <p className="case-role">
          <strong>{t(webUi.role)}:</strong> {t(piece.role)}
        </p>
        {piece.note && <p className="case-role">{t(piece.note)}</p>}
        <p className="links">
          {piece.links.map((link) => (
            <a className={link.btn ? 'btn' : undefined} href={link.href} key={link.href}>
              {t(link.label)}
              <span className="sr-only">: {piece.name}</span>
            </a>
          ))}
        </p>
      </div>
    </section>
  );
}
