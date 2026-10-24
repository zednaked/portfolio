import { useEffect, useRef, useState, type RefObject } from 'react';
import { gsap, ScrollTrigger, FULL, FULL_MOTION, GENTLE_MOTION, useIdleGSAP } from './motion';
import { webUi, type Lang, type Stat, type Story, type WebPiece } from './content';
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
      <span
        className="stat-num"
        data-value={stat.value}
        data-decimals={decimals}
        data-txt={format(stat.value, decimals, lang)}
      >
        {format(stat.value, decimals, lang)}
      </span>
      <span className="stat-unit">{stat.unit}</span>
      <span className="stat-label">{t(stat.label)}</span>
    </li>
  );
}

// A muted loop that plays while its card is on screen, with a button to stop
// it for good (WCAG 2.2.2). Under reduced motion it starts held.
function Clip({ piece }: { piece: WebPiece }) {
  const { t } = useLang();
  const video = useRef<HTMLVideoElement>(null);
  const [held, setHeld] = useState(!FULL);
  const toggle = () => {
    const v = video.current;
    if (!v) return;
    v.dataset.held = held ? '0' : '1';
    if (held) void v.play().catch(() => {});
    else v.pause();
    setHeld(!held);
  };
  return (
    <>
      <video
        ref={video}
        src={piece.video}
        poster={piece.img}
        width={piece.width}
        height={piece.height}
        muted
        loop
        playsInline
        preload="none"
        data-held={held ? '1' : '0'}
        aria-label={t(piece.alt)}
      />
      <button type="button" className="clip-btn" aria-pressed={!held} onClick={toggle}>
        <span aria-hidden="true">{held ? '▶' : '❚❚'}</span>
        <span className="sr-only">
          {t(held ? webUi.playClip : webUi.pauseClip)}: {t(piece.title)}
        </span>
      </button>
    </>
  );
}

// Plays a case clip unless the visitor stopped it.
const playClip = (v: HTMLVideoElement) => {
  if (v.dataset.held !== '1') void v.play().catch(() => {});
};

// The case as a decision: why it exists, the call, what it cost. The numbers
// that follow are the result.
export function StoryList({ story }: { story: Story }) {
  const { t } = useLang();
  return (
    <dl className="story">
      {(['why', 'decision', 'tradeoff'] as const).map((key) => (
        <div key={key}>
          <dt>{t(webUi[key])}</dt>
          <dd>{t(story[key])}</dd>
        </div>
      ))}
    </dl>
  );
}

export function CaseCard({ piece }: { piece: WebPiece }) {
  const { t } = useLang();
  const classes = ['case', piece.phone && 'phone', piece.compact && 'compact'].filter(Boolean).join(' ');
  return (
    <article className={classes} aria-labelledby={`case-${piece.id}`}>
      <i className="cn cn0" aria-hidden="true" />
      <i className="cn cn1" aria-hidden="true" />
      <i className="cn cn2" aria-hidden="true" />
      <i className="cn cn3" aria-hidden="true" />
      <b className="dot dot-c" aria-hidden="true" />
      <b className="dot dot-s" aria-hidden="true" />
      <b className="dot dot-t" aria-hidden="true" />
      <div className="shot" style={{ aspectRatio: `${piece.width} / ${piece.height}` }}>
        {piece.video ? (
          // Muted loop, fetched only when it plays; the poster is the still.
          <Clip piece={piece} />
        ) : (
          <img
            src={piece.img}
            width={piece.width}
            height={piece.height}
            loading="lazy"
            decoding="async"
            alt={t(piece.alt)}
          />
        )}
      </div>
      <div className="case-body">
        <h3 id={`case-${piece.id}`}>{t(piece.title)}</h3>
        <p className="what">{t(piece.what)}</p>
        <p className="case-role">
          <strong>{t(webUi.role)}:</strong> {t(piece.role)}
        </p>
        {piece.story && <StoryList story={piece.story} />}
        <ul className="chips" aria-label={t(webUi.tech)}>
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
  useEffect(() => {
    langRef.current = lang;
  }, [lang]);

  useIdleGSAP(() => {
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
        // opacity, never autoAlpha: visibility:hidden takes the card's links
        // out of the Tab order until the scroll reaches them.
        tl.from(card, { y: 70, opacity: 0, duration: 0.7 });
        const shot = card.querySelector('.shot');
        if (shot) {
          tl.fromTo(
            shot,
            { clipPath: 'inset(0% 100% 0% 0%)' },
            { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'power2.inOut' },
            0.15,
          );
        }
        tl.from(card.querySelectorAll('.chip'), { y: 10, opacity: 0, stagger: 0.05, duration: 0.35 }, 0.5);
        // The reel's micro chain: exposure kiss, viewfinder corners, three small shapes.
        const media = card.querySelector('.shot img, .shot video');
        if (media)
          tl.fromTo(
            media,
            { filter: 'brightness(1.35)' },
            { filter: 'brightness(1)', duration: 0.5, ease: 'power2.out' },
            0.2,
          );
        tl.from(
          card.querySelectorAll('.cn'),
          { scale: 1.8, opacity: 0, duration: 0.45, stagger: 0.08, ease: 'power3.out' },
          0.15,
        )
          .from(card.querySelectorAll('.dot'), { scale: 0, duration: 0.45, stagger: 0.12, ease: 'back.out(3)' }, 0.45)
          .from(card.querySelectorAll('.stat-num'), { '--ghost': 0, duration: 0.01 }, 0);
        // Ghosts off register, jumping a few frames after each number lands.
        card.querySelectorAll<HTMLElement>('.stat-num').forEach((el, i) => {
          const jumps = [
            [-6, 3],
            [5, -2],
            [-3, -3],
            [2, 1],
          ];
          jumps.forEach(([x, y], k) => {
            tl.set(el, { '--gx': `${x}px`, '--gy': `${y}px` }, 1.2 + i * 0.12 + k * 0.07);
          });
          tl.set(el, { '--gx': '2px', '--gy': '1px' }, 1.5 + i * 0.12);
        });

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
                // The off-register ghosts read data-txt: keep them on the counting
                // number, or they show the final value beside it.
                el.textContent = el.dataset.txt = format(counter.v, decimals, langRef.current);
              },
            },
            0.55 + i * 0.12,
          );
        });

        // A clip plays only while its card is on screen.
        const video = card.querySelector<HTMLVideoElement>('.shot video');
        if (video) {
          const play = () => playClip(video);
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
    mm.add(GENTLE_MOTION, () => {
      gsap.utils.toArray<HTMLElement>('.case').forEach((card) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 85%', once: true } });
        tl.from(card, { opacity: 0, duration: 0.6 }).from(
          card.querySelectorAll('.cn, .dot'),
          { opacity: 0, duration: 0.5, stagger: 0.06 },
          0.3,
        );
        card.querySelectorAll<HTMLElement>('.stat-num').forEach((el, k) => {
          const end = Number(el.dataset.value);
          const decimals = Number(el.dataset.decimals);
          const counter = { v: 0 };
          tl.to(
            counter,
            {
              v: end,
              duration: 1,
              ease: 'power2.out',
              onUpdate: () => {
                // The off-register ghosts read data-txt: keep them on the counting
                // number, or they show the final value beside it.
                el.textContent = el.dataset.txt = format(counter.v, decimals, langRef.current);
              },
            },
            0.3 + k * 0.1,
          );
        });
        // Clips start held here; once the visitor plays one, it pauses off screen.
        const video = card.querySelector<HTMLVideoElement>('.shot video');
        if (video) {
          ScrollTrigger.create({
            trigger: card,
            start: 'top 90%',
            end: 'bottom 10%',
            onEnter: () => playClip(video),
            onEnterBack: () => playClip(video),
            onLeave: () => video.pause(),
            onLeaveBack: () => video.pause(),
          });
        }
      });
    });
  }, root);
}
