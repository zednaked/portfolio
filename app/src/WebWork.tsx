import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, FULL_MOTION } from './motion';
import { pageStats, proofs, webUi, webWork, type Lang, type Stat } from './content';
import { useLang } from './i18n';

function format(value: number, decimals: number, lang: Lang): string {
  return value.toLocaleString(lang === 'pt' ? 'pt-BR' : 'en', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// The final number is in the markup; motion only counts up to it.
function StatLine({ stat }: { stat: Stat }) {
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

export function WebWork() {
  const { lang, t } = useLang();
  const root = useRef<HTMLElement>(null);
  // Read by the counters, so a language switch doesn't replay the entrances.
  const langRef = useRef(lang);
  langRef.current = lang;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(FULL_MOTION, () => {
        gsap.from('#web-h', {
          scaleX: 0,
          transformOrigin: 'left center',
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: { trigger: '#web-h', start: 'top 90%', once: true },
        });

        gsap.utils.toArray<HTMLElement>('.case').forEach((card) => {
          const tl = gsap.timeline({
            scrollTrigger: { trigger: card, start: 'top 82%', once: true },
            defaults: { ease: 'power3.out' },
          });
          tl.from(card, { y: 70, autoAlpha: 0, duration: 0.7 })
            .fromTo(
              card.querySelector('.shot'),
              { clipPath: 'inset(0% 100% 0% 0%)' },
              { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'power2.inOut' },
              0.15,
            )
            .from(card.querySelectorAll('.chip'), { y: 10, autoAlpha: 0, stagger: 0.05, duration: 0.35 }, 0.5);

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

          // The screenshot drifts inside its frame while the card scrolls by.
          gsap.fromTo(
            card.querySelector('.shot img'),
            { yPercent: -4 },
            {
              yPercent: 4,
              ease: 'none',
              scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true },
            },
          );
        });
      });
    },
    { scope: root },
  );

  return (
    <section className="wrap web" id="web" aria-labelledby="web-h" ref={root}>
      <h2 className="label" id="web-h">{t(webUi.label)}</h2>
      <p className="intro">{t(webUi.intro)}</p>

      <div className="cases">
        {webWork.map((piece) => (
          <article className={piece.phone ? 'case phone' : 'case'} key={piece.id} aria-labelledby={`case-${piece.id}`}>
            <div className="shot">
              <img src={piece.img} width={piece.width} height={piece.height} loading="lazy" decoding="async" alt={t(piece.alt)} />
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
              <ul className="stats">
                {piece.stats.map((stat, i) => (
                  <StatLine stat={stat} key={i} />
                ))}
              </ul>
              {piece.note && <p className="note">{t(piece.note)}</p>}
              <p className="links">
                <a className="btn" href={piece.live}>
                  {t(webUi.live)}
                  <span className="sr-only">: {t(piece.title)}</span>
                </a>
                <a href={piece.code}>
                  {t(webUi.code)}
                  <span className="sr-only">: {t(piece.title)}</span>
                </a>
              </p>
            </div>
          </article>
        ))}

        <article className="case self" aria-labelledby="case-self">
          <div className="case-body">
            <h3 id="case-self">{t(webUi.pageLabel)}</h3>
            <p className="what">{t(webUi.page)}</p>
            <ul className="stats">
              {pageStats.map((stat, i) => (
                <StatLine stat={stat} key={i} />
              ))}
            </ul>
            <p className="what">{t(webUi.pageA11y)}</p>
            <p className="links">
              <a href="https://github.com/zednaked/portfolio">{t(webUi.code)}</a>
            </p>
          </div>
        </article>
      </div>

      <h3 className="proof-h">{t(webUi.proofLabel)}</h3>
      <ul className="proofs">
        {proofs.map((proof) => (
          <li key={proof.link}>
            {t(proof.text)} <a href={proof.link}>{proof.linkText}</a>
          </li>
        ))}
      </ul>
    </section>
  );
}
