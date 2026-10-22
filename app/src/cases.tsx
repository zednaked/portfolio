import { useRef, type RefObject } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger, FULL_MOTION } from './motion';
import { webUi, type Lang, type Stat, type WebPiece } from './content';
import { useLang } from './i18n';

export function format(value: number, decimals: number, lang: Lang): string {
  return value.toLocaleString(lang === 'pt' ? 'pt-BR' : 'en', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// The final number is in the markup; motion only counts up to it.
export function StatLine({ stat }: { stat: Stat }) {
  const { lang, t } = useLang();
  const decimals = stat.decimals ?? 0;
  return (
    <li className="stat">
      <span className="stat-num" data-value={stat.value} data-decimals={decimals}>
        {format(stat.value, decimals, lang)}
      </span>
      <span className="stat-unit">{stat.unit}</span>
      <span className="stat-label">{t(stat.label)}</span>
    </li>
  );
}

export function CaseCard({ piece }: { piece: WebPiece }) {
  const { t } = useLang();
  const classes = ['case', piece.phone && 'phone', piece.compact && 'compact'].filter(Boolean).join(' ');
  return (
    <article className={classes} aria-labelledby={`case-${piece.id}`}>
      <div className="shot" style={{ aspectRatio: `${piece.width} / ${piece.height}` }}>
        {piece.video ? (
          // Muted loop, fetched only when it plays; the poster is the still.
          <video
            src={piece.video}
            poster={piece.img}
            width={piece.width}
            height={piece.height}
            muted
            loop
            playsInline
            preload="none"
            aria-label={t(piece.alt)}
          />
        ) : (
          <img src={piece.img} width={piece.width} height={piece.height} loading="lazy" decoding="async" alt={t(piece.alt)} />
        )}
      </div>
      <div className="case-body">
        <h3 id={`case-${piece.id}`}>{t(piece.title)}</h3>
        <p className="what">{t(piece.what)}</p>
        <p className="case-role">
          <strong>{t(webUi.role)}:</strong> {t(piece.role)}
        </p>
        <ul className="chips" aria-label="Technologies">
          {piece.tech.map((tech) => (
            <li className="chip" key={tech}>
              {tech}
            </li>
          ))}
        </ul>
        {piece.stats.length > 0 && (
          <ul className="stats">
            {piece.stats.map((stat, i) => (
              <StatLine stat={stat} key={i} />
            ))}
          </ul>
        )}
        {piece.note && <p className="note">{t(piece.note)}</p>}
        <p className="links">
          <a className="btn" href={piece.live}>
            {t(piece.liveLabel ?? webUi.live)}
            <span className="sr-only">: {t(piece.title)}</span>
          </a>
          {piece.code && (
            <a href={piece.code}>
              {t(webUi.code)}
              <span className="sr-only">: {t(piece.title)}</span>
            </a>
          )}
        </p>
      </div>
    </article>
  );
}

// Entrance, count-up and scroll drift for every .case and section label
// inside `root`. Shared by the web and the games sections.
export function useCaseMotion(root: RefObject<HTMLElement | null>, headingId: string) {
  const { lang } = useLang();
  // Read by the counters, so a language switch doesn't replay the entrances.
  const langRef = useRef(lang);
  langRef.current = lang;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(FULL_MOTION, () => {
        gsap.from(`#${headingId}`, {
          scaleX: 0,
          transformOrigin: 'left center',
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: { trigger: `#${headingId}`, start: 'top 90%', once: true },
        });

        gsap.utils.toArray<HTMLElement>('.case').forEach((card) => {
          const tl = gsap.timeline({
            scrollTrigger: { trigger: card, start: 'top 82%', once: true },
            defaults: { ease: 'power3.out' },
          });
          tl.from(card, { y: 70, autoAlpha: 0, duration: 0.7 });
          const shot = card.querySelector('.shot');
          if (shot) {
            tl.fromTo(
              shot,
              { clipPath: 'inset(0% 100% 0% 0%)' },
              { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'power2.inOut' },
              0.15,
            );
          }
          tl.from(card.querySelectorAll('.chip'), { y: 10, autoAlpha: 0, stagger: 0.05, duration: 0.35 }, 0.5);

          // Numbers count up from zero to the value already in the text.
          card.querySelectorAll<HTMLElement>('.stat-num').forEach((el, i) => {
            const end = Number(el.dataset.value);
            const decimals = Number(el.dataset.decimals);
            const counter = { v: 0 };
            tl.to(
              counter,
              {
                v: end,
                duration: 1.1,
                ease: 'power2.out',
                onUpdate: () => {
                  el.textContent = format(counter.v, decimals, langRef.current);
                },
              },
              0.55 + i * 0.12,
            );
          });

          // A clip plays only while its card is on screen.
          const video = card.querySelector<HTMLVideoElement>('.shot video');
          if (video) {
            const play = () => void video.play().catch(() => {});
            const pause = () => video.pause();
            ScrollTrigger.create({
              trigger: card,
              start: 'top 90%',
              end: 'bottom 10%',
              onEnter: play,
              onEnterBack: play,
              onLeave: pause,
              onLeaveBack: pause,
            });
          }

          // The screenshot drifts inside its frame while the card scrolls by.
          const img = card.querySelector('.shot img, .shot video');
          if (img) {
            gsap.fromTo(
              img,
              { yPercent: -4 },
              {
                yPercent: 4,
                ease: 'none',
                scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true },
              },
            );
          }
        });
      });
    },
    { scope: root },
  );
}
