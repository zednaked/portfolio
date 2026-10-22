import { useLayoutEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, Flip, FULL_MOTION, prefersReducedMotion } from './motion';
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
        // Each piece is uncovered by a brush stroke that runs bottom to top,
        // while the painting settles from a slight zoom. Plays once.
        gsap.utils.toArray<HTMLElement>('.piece').forEach((piece) => {
          const tl = gsap.timeline({
            scrollTrigger: { trigger: piece, start: 'top 85%', once: true },
            defaults: { ease: 'power3.out' },
          });
          tl.from(piece, { y: 60, autoAlpha: 0, duration: 0.6 })
            .fromTo(
              piece.querySelector('.reveal'),
              { clipPath: 'inset(100% 0% 0% 0%)' },
              { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'power2.inOut' },
              0.1,
            )
            .from(piece.querySelector('.reveal img'), { scale: 1.25, duration: 1.3 }, 0.1)
            .from(piece.querySelectorAll('figcaption > *'), { x: -24, autoAlpha: 0, stagger: 0.08, duration: 0.5 }, 0.6);
        });

        gsap.from('#work-h', {
          scaleX: 0,
          transformOrigin: 'left center',
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: { trigger: '#work-h', start: 'top 90%', once: true },
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
      gsap.from(d.querySelectorAll('.dialog-text > *, .close'), { autoAlpha: 0, y: 12, stagger: 0.06, delay: 0.35 });
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
    <section className="wrap" id="work" aria-labelledby="work-h" tabIndex={-1} ref={root}>
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
          if (e.target === e.currentTarget) hide();
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
