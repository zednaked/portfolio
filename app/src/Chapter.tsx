import { useRef, type CSSProperties, type ReactNode } from 'react';
import { gsap, FULL_MOTION, GENTLE_MOTION, useIdleGSAP, PLAY_ONCE } from './motion';
import type { Chapter as ChapterData } from './content';
import { useLang } from './i18n';

// Where each shape sits on the card, in percent, so the card can collapse into it.
const SHAPE_CLIP: Record<ChapterData['shape'], [string, string]> = {
  circle: ['circle(150% at 73% 50%)', 'circle(0% at 73% 50%)'],
  square: ['inset(0% 0% 0% 0%)', 'inset(50% 27% 50% 73%)'],
  tri: ['polygon(73% -200%, 280% 300%, -140% 300%)', 'polygon(73% 50%, 73% 50%, 73% 50%)'],
};

// The act's colour drives its accents. Yellow can't carry text on white
// (1.8:1), so it gets a dark ochre for text and black type on its buttons.
const READABLE: Partial<Record<string, { text: string; on: string }>> = {
  '#f2b705': { text: '#6e5200', on: '#0b0b0b' },
};
function actColors(color: string): CSSProperties {
  const r = READABLE[color.toLowerCase()];
  return { '--accent': color, '--accent-text': r?.text ?? color, '--accent-on': r?.on ?? '#fff' } as CSSProperties;
}

/**
 * An act of the story: a full-screen chapter card stays on screen while the
 * act's content scrolls up underneath it, and the card collapses into its own
 * shape as you scroll, the same exit the reel uses. Scroll, drag or swipe
 * drives it; reduced motion gets a still card above the content.
 */
export function Act({ chapter, children }: { chapter: ChapterData; children: ReactNode }) {
  const { t } = useLang();
  const root = useRef<HTMLDivElement>(null);
  const [start, end] = SHAPE_CLIP[chapter.shape];

  useIdleGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(FULL_MOTION, () => {
      const card = root.current?.querySelector<HTMLElement>('.ch-card');
      if (!card) return;
      // Entrance, once: letters rise one by one, the numeral slides, the shape turns in.
      const intro = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top 75%', toggleActions: PLAY_ONCE },
      });
      intro
        .from(card.querySelectorAll('.ch-word .lt'), {
          yPercent: 105,
          duration: 0.8,
          stagger: 0.07,
          ease: 'power4.out',
        })
        .from(card.querySelector('.ch-num'), { xPercent: -120, opacity: 0, duration: 0.6, ease: 'power4.out' }, 0)
        .from(card.querySelector('.ch-shape'), { scale: 0, rotation: -90, duration: 0.9, ease: 'back.out(1.6)' }, 0)
        .from(card.querySelector('.ch-frag'), { x: -80, opacity: 0, duration: 0.9, ease: 'power3.out' }, 0.25)
        .from(card.querySelector('.ch-sub'), { y: 20, opacity: 0, duration: 0.6 }, 0.4);

      // The exit, scrubbed by the scroll: collapse into the shape.
      // A steady collapse, the card always on top. The act's content, rising
      // underneath, stays invisible until the card is down to its last fifth
      // and then fades in: text set on the paper has no card of its own to
      // stand on, so it never shows through the black.
      const body = root.current?.querySelector<HTMLElement>('.act-body');
      const reveal = body ? gsap.quickSetter(body, 'opacity') : null;
      // The card's words leave in the first third of the collapse, so the
      // clip never slices them into fragments; the shape collapses alone.
      const words = card.querySelectorAll('.ch-num, .ch-word, .ch-frag, .ch-sub');
      const fadeWords = gsap.quickSetter(words, 'opacity') as (value: number) => void;
      let collapse: gsap.core.Tween | null = null;
      collapse = gsap.fromTo(
        card,
        { clipPath: start },
        {
          clipPath: end,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: '+=35%', scrub: 0.6 },
          onUpdate: () => {
            const p = collapse?.progress() ?? 0;
            reveal?.(gsap.utils.clamp(0, 1, (p - 0.8) / 0.2));
            fadeWords(gsap.utils.clamp(0, 1, 1 - p / 0.3));
          },
        },
      );
      // Hidden from the start; a refresh past the act (a link, a reload) runs
      // the update above and shows it.
      reveal?.(0);
      // While it holds, the shape keeps turning and the word drifts, so a held
      // finger still sees life.
      gsap.to(card.querySelector('.ch-shape'), {
        rotation: chapter.shape === 'circle' ? 0 : 45,
        scale: 1.08,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: '+=180%', scrub: true },
      });
      gsap.to(card.querySelector('.ch-word'), {
        xPercent: -6,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: '+=180%', scrub: true },
      });
      return () => {
        if (body) body.style.opacity = '';
        words.forEach((w) => {
          (w as HTMLElement).style.opacity = '';
        });
      };
    });
    mm.add(GENTLE_MOTION, () => {
      const card = root.current?.querySelector<HTMLElement>('.ch-card');
      if (!card) return;
      gsap.from(card.querySelectorAll('.ch-num, .ch-word, .ch-shape, .ch-frag, .ch-sub'), {
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        scrollTrigger: { trigger: root.current, start: 'top 75%', toggleActions: PLAY_ONCE },
      });
    });
  }, root);

  const shape = { circle: 'shape-circle', tri: 'shape-tri', square: 'shape-square' }[chapter.shape];
  return (
    <div className="act" id={chapter.id} ref={root} style={actColors(chapter.color)}>
      <div className="ch-hold">
        <div className="ch-card" aria-hidden="true" style={{ background: chapter.bg, color: chapter.ink }}>
          <div className="tex-paper" />
          <div className="tex-xerox" />
          <div className={`ch-shape ${shape}`} style={{ background: chapter.color }} />
          <div className="ch-num" style={{ color: chapter.color }}>
            {chapter.num}
          </div>
          <div className="ch-word">
            {[...chapter.word].map((c, i) => (
              <i className="lt" key={i}>
                {c}
              </i>
            ))}
          </div>
          <div className="ch-frag" style={{ WebkitTextStroke: `3px ${chapter.color}` }}>
            {chapter.word}
          </div>
          <p className="ch-sub">{t(chapter.sub)}</p>
        </div>
      </div>
      <div className="act-body">{children}</div>
    </div>
  );
}
