import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type UIEvent } from 'react';
import { Flip } from 'gsap/Flip';
import { gsap, FULL, FULL_MOTION, GENTLE_MOTION, useIdleGSAP, PLAY_ONCE } from './motion';

// Flip is only the viewer's, so it ships in this chunk, not the first one.
gsap.registerPlugin(Flip);
import { ui } from './content';
import { artworks, type Artwork } from './content-work';
import { useLang } from './i18n';

export function Gallery() {
  const { t } = useLang();
  const root = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<Artwork | null>(null);
  const flipState = useRef<Flip.FlipState | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);

  // Native lazy loading looks at vertical distance only, and the strip sits
  // pinned: every painting "to the side" was fetched on the first load. Each
  // one is fetched when it comes within two screens of view, in either axis;
  // until it lands, its frame holds the painting's average colour.
  useEffect(() => {
    const imgs = root.current?.querySelectorAll<HTMLImageElement>('.gallery img[data-src]');
    if (!imgs) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting || !(e.target instanceof HTMLImageElement)) continue;
          if (e.target.dataset.srcset) e.target.srcset = e.target.dataset.srcset;
          e.target.src = e.target.dataset.src ?? '';
          io.unobserve(e.target);
        }
      },
      { rootMargin: '1200px 200%' },
    );
    imgs.forEach((img) => io.observe(img));
    return () => io.disconnect();
  }, []);

  useIdleGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(FULL_MOTION, () => {
      // The paintings run sideways while you scroll down: the section pins,
      // the strip moves, each painting is uncovered as it comes in.
      const track = root.current?.querySelector<HTMLElement>('.gallery');
      if (!track) return;
      // On a phone the strip is a native, swipeable row (scroll-snap in the
      // CSS): pinning a sideways track under a vertical swipe fights the thumb.
      if (window.matchMedia('(max-width: 760px)').matches) return;
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
        // The paintings already on screen when the strip pins are uncovered
        // as the section rises, with the frames, not after: an empty white
        // frame showed through the chapter card otherwise.
        const onScreen = piece.offsetLeft < window.innerWidth;
        gsap.fromTo(
          piece.querySelector('.reveal'),
          { clipPath: 'inset(100% 0% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 0.9,
            ease: 'power2.inOut',
            scrollTrigger: onScreen
              ? { trigger: piece, start: 'top 95%', toggleActions: 'play none none reverse' }
              : { trigger: piece, containerAnimation: run, start: 'left 95%', toggleActions: 'play none none reverse' },
          },
        );
        // The painting drifts inside its frame against the strip's motion.
        gsap.fromTo(
          piece.querySelector('.reveal img'),
          { xPercent: -6, scale: 1.14 },
          {
            xPercent: 6,
            scale: 1.14,
            ease: 'none',
            scrollTrigger: {
              trigger: piece,
              containerAnimation: run,
              start: 'left right',
              end: 'right left',
              scrub: true,
            },
          },
        );
      });
      return () => track.removeEventListener('focusin', onFocus);
    });
    mm.add(GENTLE_MOTION, () => {
      gsap.utils.toArray<HTMLElement>('.piece').forEach((piece) => {
        gsap.from(piece, {
          opacity: 0,
          duration: 0.7,
          scrollTrigger: { trigger: piece, start: 'top 88%', toggleActions: PLAY_ONCE },
        });
      });
    });
  }, root);

  // The enlarged image takes over from the thumbnail: Flip measures the
  // thumbnail, the dialog renders, and the big image animates out of it.
  // The opening's wet paint, back on the paintings: a glint that follows the
  // mouse over the canvas's relief. Fetched on the first hover, desktop with
  // full motion only.
  useEffect(() => {
    const el = root.current;
    if (!el || !FULL || !window.matchMedia('(pointer: fine)').matches) return;
    let glint: { destroy: () => void } | null = null;
    let gone = false;
    const start = () => {
      el.removeEventListener('pointerover', start);
      void import('./paint-glint').then(({ createGlint }) => {
        if (!gone) glint = createGlint(el);
      });
    };
    el.addEventListener('pointerover', start);
    return () => {
      gone = true;
      el.removeEventListener('pointerover', start);
      glint?.destroy();
    };
  }, []);

  // Which painting a phone's swipe row is on, for the counter under it.
  const [current, setCurrent] = useState(0);
  const onStripScroll = (e: UIEvent<HTMLDivElement>) => {
    const row = e.currentTarget;
    const pieces = [...row.querySelectorAll<HTMLElement>('.piece')];
    const left = row.scrollLeft + row.clientWidth * 0.3;
    const i = pieces.findIndex((p) => p.offsetLeft + p.offsetWidth > left);
    setCurrent(i < 0 ? pieces.length - 1 : i);
  };

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
    if (!state || !FULL) return;
    // In a context, so closing the viewer mid-flight reverts what it started.
    const ctx = gsap.context(() => {
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
    }, d);
    return () => ctx.revert();
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
    if (!FULL) {
      finish();
      return;
    }
    gsap.to(d, {
      autoAlpha: 0,
      duration: 0.25,
      onComplete: () => {
        gsap.set(d, { clearProps: 'all' });
        finish();
      },
    });
  };

  return (
    <section className="wrap paint-strip" id="work" aria-labelledby="work-h" tabIndex={-1} ref={root}>
      <h2 className="label" id="work-h">
        {t(ui.workLabel)}
      </h2>
      <div className="gallery" onScroll={onStripScroll}>
        {artworks.map((art) => (
          <figure className={art.wide ? 'piece wide' : 'piece'} key={art.id}>
            <button
              type="button"
              className="reveal"
              aria-label={`${t(art.title)}. ${t(ui.open)}`}
              onClick={(e) => show(art, e.currentTarget)}
            >
              <img
                data-src={art.src}
                data-srcset={
                  art.small
                    ? `${art.small} 480w, ${art.small.replace('-480', '-640')} 640w, ${art.src} ${art.width}w`
                    : undefined
                }
                sizes="(max-width: 760px) 84vw, 600px"
                width={art.width}
                height={art.height}
                style={{ '--r': art.height / art.width, backgroundColor: art.tone } as CSSProperties}
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
      {/* Phones swipe the strip: where you are in it, and that there is more. */}
      <p className="strip-count" aria-hidden="true">
        <span>
          {current + 1} / {artworks.length}
        </span>
        <span>{current + 1 < artworks.length ? t(ui.swipe) : ''}</span>
      </p>

      {/* A click on the backdrop closes, as in any lightbox; the keyboard has
          Esc (onCancel) and the Close button, so no key handler is missing. */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
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
