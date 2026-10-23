import { useLayoutEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, Flip, FULL_MOTION, GENTLE_MOTION, prefersReducedMotion } from './motion';
import { artworks, ui, type Artwork } from './content';
import { useLang } from './i18n';

export function Gallery() {
  const { t } = useLang();
  const root = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<Artwork | null>(null);
  const flipState = useRef<Flip.FlipState | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(FULL_MOTION, () => {
        // The paintings run sideways while you scroll down: the section pins,
        // the strip moves, each painting is uncovered as it comes in.
        const track = root.current!.querySelector<HTMLElement>('.gallery')!;
        const dist = () => Math.max(0, track.scrollWidth - window.innerWidth + 96);
        const run = gsap.to(track, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => `+=${dist()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
        // The strip moves by transform, so the browser can't scroll a focused
        // painting into view by itself: Tab onto one and the page scrolls to
        // the point where the strip shows it.
        const st = run.scrollTrigger;
        const onFocus = (e: FocusEvent) => {
          const piece = e.target instanceof Element ? e.target.closest<HTMLElement>('.piece') : null;
          const d = dist();
          if (!piece || !st || !d) return;
          const p = gsap.utils.clamp(0, 1, (piece.offsetLeft - 48) / d);
          window.scrollTo(0, st.start + p * (st.end - st.start));
        };
        track.addEventListener('focusin', onFocus);

        gsap.utils.toArray<HTMLElement>('.piece').forEach((piece) => {
          gsap.fromTo(
            piece.querySelector('.reveal'),
            { clipPath: 'inset(100% 0% 0% 0%)' },
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              duration: 0.9,
              ease: 'power2.inOut',
              scrollTrigger: { trigger: piece, containerAnimation: run, start: 'left 95%', toggleActions: 'play none none reverse' },
            },
          );
          // The painting drifts inside its frame against the strip's motion.
          gsap.fromTo(
            piece.querySelector('.reveal img'),
            { xPercent: -6, scale: 1.14 },
            { xPercent: 6, scale: 1.14, ease: 'none', scrollTrigger: { trigger: piece, containerAnimation: run, start: 'left right', end: 'right left', scrub: true } },
          );
        });
        return () => track.removeEventListener('focusin', onFocus);
      });
      mm.add(GENTLE_MOTION, () => {
        gsap.utils.toArray<HTMLElement>('.piece').forEach((piece) => {
          gsap.from(piece, { opacity: 0, duration: 0.7, scrollTrigger: { trigger: piece, start: 'top 88%', once: true } });
        });
      });
    },
    { scope: root },
  );

  // The enlarged image takes over from the thumbnail: Flip measures the
  // thumbnail, the dialog renders, and the big image animates out of it.
  const show = (art: Artwork, button: HTMLButtonElement) => {
    opener.current = button;
    flipState.current = Flip.getState(button.querySelector('img'));
    setOpen(art);
  };

  useLayoutEffect(() => {
    const d = dialog.current;
    if (!open || !d) return;
    d.showModal();
    // showModal focuses the first focusable child only on some engines;
    // put keyboard users on Close explicitly.
    d.querySelector<HTMLButtonElement>('.close')?.focus();
    const state = flipState.current;
    if (state && !prefersReducedMotion()) {
      Flip.from(state, {
        targets: d.querySelector('img'),
        duration: 0.6,
        ease: 'power3.inOut',
        absolute: true,
        scale: true,
      });
      // opacity, not autoAlpha: visibility:hidden would drop the focus just
      // placed on Close.
      gsap.from(d.querySelectorAll('.dialog-text > *, .close'), { opacity: 0, y: 12, stagger: 0.06, delay: 0.35 });
    }
  }, [open]);

  const hide = () => {
    const d = dialog.current;
    const back = opener.current;
    if (!d || !open) return;
    const finish = () => {
      d.close();
      setOpen(null);
      back?.focus();
    };
    if (prefersReducedMotion()) return finish();
    gsap.to(d, { autoAlpha: 0, duration: 0.25, onComplete: () => { gsap.set(d, { clearProps: 'all' }); finish(); } });
  };

  return (
    <section className="wrap paint-strip" id="work" aria-labelledby="work-h" tabIndex={-1} ref={root}>
      <h2 className="label" id="work-h">{t(ui.workLabel)}</h2>
      <div className="gallery">
        {artworks.map((art) => (
          <figure className={art.wide ? 'piece wide' : 'piece'} key={art.id}>
            <button
              type="button"
              className="reveal"
              aria-label={`${t(art.title)}. ${t(ui.open)}`}
              onClick={(e) => show(art, e.currentTarget)}
            >
              <img
                src={art.src}
                width={art.width}
                height={art.height}
                loading="lazy"
                decoding="async"
                alt={t(art.alt)}
                className={art.pixel ? 'pixel' : undefined}
                data-flip-id={art.id}
              />
            </button>
            <figcaption>
              <strong>{t(art.title)}</strong>
              <span>{t(art.caption)}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      <dialog
        ref={dialog}
        className="viewer"
        aria-labelledby="viewer-title"
        onCancel={(e) => {
          e.preventDefault();
          hide();
        }}
        onClick={(e) => {
          // Anywhere but the painting closes, including the empty space
          // around it inside the dialog box. Close has its own handler.
          const target = e.target as HTMLElement;
          if (!target.closest('.viewer img, .close')) hide();
        }}
      >
        {open && (
          <div className="viewer-inner">
            <img
              src={open.src}
              width={open.width}
              height={open.height}
              alt={t(open.alt)}
              className={open.pixel ? 'pixel' : undefined}
              data-flip-id={open.id}
            />
            <div className="dialog-text">
              <h3 id="viewer-title">{t(open.title)}</h3>
              <p>{t(open.caption)}</p>
            </div>
            <button type="button" className="close" onClick={hide}>
              {t(ui.close)}
            </button>
          </div>
        )}
      </dialog>
    </section>
  );
}
