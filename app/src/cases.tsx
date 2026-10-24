import { useEffect, useRef, useState, type RefObject } from 'react';
import { gsap, ScrollTrigger, FULL, FULL_MOTION, GENTLE_MOTION, useIdleGSAP, PLAY_ONCE } from './motion';
import { budget, webUi, type Lang, type Stat, type Story, type WebPiece } from './content';
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
  // A browser that can decode neither file shows the still instead of an
  // empty box (a failed video drops its poster).
  const [failed, setFailed] = useState(false);
  // The still is fetched when the card comes near, like the clip itself.
  const [near, setNear] = useState(false);
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setNear(true);
        io.disconnect();
      },
      { rootMargin: '800px 0px' },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);
  const toggle = () => {
    const v = video.current;
    if (!v) return;
    v.dataset.held = held ? '0' : '1';
    if (held) void v.play().catch(() => {});
    else v.pause();
    setHeld(!held);
  };
  if (failed || !piece.video)
    return (
      <img
        src={piece.img}
        width={piece.width}
        height={piece.height}
        loading="lazy"
        decoding="async"
        alt={t(piece.alt)}
      />
    );
  return (
    <>
      <video
        ref={video}
        poster={near ? piece.img : undefined}
        width={piece.width}
        height={piece.height}
        muted
        loop
        playsInline
        preload="none"
        data-held={held ? '1' : '0'}
        aria-label={t(piece.alt)}
        onError={() => setFailed(true)}
      >
        {/* H.264 first; VP9 for browsers built without it. */}
        <source src={piece.video} type='video/mp4; codecs="avc1.64001F"' />
        <source
          src={piece.video.replace(/\.mp4$/, '.webm')}
          type='video/webm; codecs="vp9"'
          onError={() => setFailed(true)}
        />
      </video>
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

// The case as a decision: why it exists, the call, what it cost. The card
// leads with the picture and the numbers; the reasoning opens on request.
export function StoryList({ story }: { story: Story }) {
  const { t } = useLang();
  return (
    <details className="decision">
      <summary>{t(webUi.readDecision)}</summary>
      <dl className="story">
        {(['why', 'decision', 'tradeoff'] as const).map((key) => (
          <div key={key}>
            <dt>{t(webUi[key])}</dt>
            <dd>{t(story[key])}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}

// "Cheia, a flood simulator for Curitiba": the name set large, what it is
// under it. A title without a comma is all name.
function CaseTitle({ id, title }: { id: string; title: string }) {
  const [name, ...rest] = title.split(', ');
  return (
    <h3 id={id} className="case-title">
      <span className="case-name">{name}</span>
      {rest.length > 0 && (
        <>
          <span className="sr-only">, </span>
          <span className="case-kind">{rest.join(', ')}</span>
        </>
      )}
    </h3>
  );
}

export function CaseCard({ piece }: { piece: WebPiece }) {
  const { t } = useLang();
  // The big cases are laid out as spreads on the paper; the small ones are cards.
  const spread = !piece.compact && !piece.phone;
  const classes = ['case', piece.phone && 'phone', piece.compact && 'compact', spread && 'spread']
    .filter(Boolean)
    .join(' ');
  return (
    <article className={classes} aria-labelledby={`case-${piece.id}`}>
      <i className="cn cn0" aria-hidden="true" />
      <i className="cn cn1" aria-hidden="true" />
      <i className="cn cn2" aria-hidden="true" />
      <i className="cn cn3" aria-hidden="true" />
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
        <CaseTitle id={`case-${piece.id}`} title={t(piece.title)} />
        <p className="what">{t(piece.what)}</p>
        <p className="case-role">
          <strong>{t(webUi.role)}:</strong> {t(piece.role)}
        </p>
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
        {piece.story && <StoryList story={piece.story} />}
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

// Entrance and scroll drift for every .case and section label
// inside `root`. Shared by the web and the games sections.
export function useCaseMotion(root: RefObject<HTMLElement | null>, headingId: string) {
  useIdleGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(FULL_MOTION, () => {
      gsap.from(`#${headingId}`, {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 0.5,
        ease: 'power2.out',
        scrollTrigger: { trigger: `#${headingId}`, start: 'top 90%', toggleActions: PLAY_ONCE },
      });

      gsap.utils.toArray<HTMLElement>('.case').forEach((card) => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: card, start: 'top 92%', toggleActions: PLAY_ONCE },
          defaults: { ease: 'power3.out' },
        });
        // opacity, never autoAlpha: visibility:hidden takes the card's links
        // out of the Tab order until the scroll reaches them.
        tl.from(card, { y: 40, opacity: 0, duration: 0.5 });
        const shot = card.querySelector('.shot');
        if (shot) {
          tl.fromTo(
            shot,
            { clipPath: 'inset(0% 100% 0% 0%)' },
            { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.55, ease: 'power2.inOut' },
            0.05,
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
        ).from(card.querySelectorAll('.stat-num'), { '--ghost': 0, duration: 0.01 }, 0);
        // Ghosts off register, jumping a few frames after each number lands;
        // half the travel on a phone, where the digits are small.
        const g = window.innerWidth < 560 ? 0.5 : 1;
        card.querySelectorAll<HTMLElement>('.stat-num').forEach((el, i) => {
          const jumps = [
            [-6, 3],
            [5, -2],
            [-3, -3],
            [2, 1],
          ];
          jumps.forEach(([x, y], k) => {
            tl.set(el, { '--gx': `${x * g}px`, '--gy': `${y * g}px` }, 1.2 + i * 0.12 + k * 0.07);
          });
          tl.set(el, { '--gx': `${2 * g}px`, '--gy': `${g}px` }, 1.5 + i * 0.12);
        });

        // Each number rises into place already at its value: a count-up caught
        // mid-scroll would show a figure that isn't true.
        tl.fromTo(
          card.querySelectorAll('.stat-num, .stat-unit'),
          { clipPath: 'inset(100% 0% 0% 0%)', yPercent: 40 },
          { clipPath: 'inset(0% 0% 0% 0%)', yPercent: 0, duration: 0.5, stagger: 0.06, ease: 'power3.out' },
          0.35,
        );

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
        const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: PLAY_ONCE } });
        tl.from(card, { opacity: 0, duration: 0.6 }).from(
          card.querySelectorAll('.cn'),
          { opacity: 0, duration: 0.5, stagger: 0.06 },
          0.3,
        );
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

// The commercial work as a spread: no client, no screenshots, so the evidence
// is the measurement itself, drawn on the paper. Bars: the pack each player
// downloads, before (outline) and after (blue); the last row is a range.
export function BudgetCase() {
  const { t, lang } = useLang();
  const max = 80;
  const W = 520;
  const L = 86;
  const row = 46;
  const x = (mb: number) => L + (mb / max) * (W - L - 12);
  const mb = (v: number) => format(v, 1, lang);
  const span = ([a, b]: number[]) => (a === b ? mb(a) : `${mb(a)}–${mb(b)}`);
  return (
    <article className="case spread budget" aria-labelledby="case-budget">
      <figure className="chart">
        <svg viewBox={`0 0 ${W} ${budget.rows.length * row + 34}`} aria-hidden="true">
          {[0, 20, 40, 60, 80].map((v) => (
            <g key={v}>
              <line x1={x(v)} x2={x(v)} y1={4} y2={budget.rows.length * row + 6} className="grid" />
              <text x={x(v)} y={budget.rows.length * row + 24} className="tick">
                {v}
              </text>
            </g>
          ))}
          {budget.rows.map((r, i) => {
            const y = i * row + 10;
            return (
              <g key={i}>
                <text x={0} y={y + 22} className="lbl">
                  {t(r.label)}
                </text>
                {/* A range is drawn from its low end, the stretch below it faint. */}
                {r.before[0] === r.before[1] ? (
                  <rect x={L} y={y} width={x(r.before[1]) - L} height={14} className="before" />
                ) : (
                  <>
                    <rect x={L} y={y} width={x(r.before[0]) - L} height={14} className="before faint" />
                    <rect
                      x={x(r.before[0])}
                      y={y}
                      width={x(r.before[1]) - x(r.before[0])}
                      height={14}
                      className="before"
                    />
                  </>
                )}
                <rect x={L} y={y + 17} width={x(r.after[1]) - L} height={14} className="after" />
              </g>
            );
          })}
        </svg>
        <figcaption>
          {t(budget.chart)} · <span className="key-before">{t(budget.before)}</span>{' '}
          <span className="key-after">{t(budget.after)}</span>
        </figcaption>
        <table className="sr-only">
          <caption>{t(budget.chart)}</caption>
          <tbody>
            {budget.rows.map((r, i) => (
              <tr key={i}>
                <th scope="row">{t(r.label)}</th>
                <td>
                  {t(budget.before)} {span(r.before)}
                </td>
                <td>
                  {t(budget.after)} {span(r.after)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </figure>
      <div className="case-body">
        <CaseTitle id="case-budget" title={t(budget.title)} />
        <p className="what">{t(budget.what)}</p>
        <p className="case-role">
          <strong>{t(webUi.role)}:</strong> {t(budget.role)}
        </p>
        <ul className="stats">
          {budget.stats.map((stat, i) => (
            <StatLine stat={stat} key={i} />
          ))}
        </ul>
        <p className="links">
          <a className="btn" href={budget.link}>
            {t(budget.linkText)}
          </a>
        </p>
      </div>
    </article>
  );
}
