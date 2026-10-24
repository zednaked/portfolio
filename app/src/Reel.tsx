import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, FULL_MOTION, PLAY_ONCE } from './motion';
import { reelUi } from './content';
import { useLang } from './i18n';

const base = import.meta.env.BASE_URL;

// The reel sits right under the name. Nothing downloads until play is pressed.
export function Reel() {
  const { t } = useLang();
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(FULL_MOTION, () => {
        // The poster paints at once (it is the largest thing above the fold);
        // only the play button and the tag arrive.
        gsap.from('.reel-tag', { clipPath: 'inset(0 100% 0 0)', duration: 0.6, delay: 0.3, ease: 'power3.out' });
        gsap.from('.reel-play', {
          // Never zero size: below the fold it can take keyboard focus before
          // the scroll plays this, and a zero-size button is nowhere to be seen.
          scale: 0.35,
          opacity: 0,
          rotation: -90,
          duration: 0.8,
          delay: 0.5,
          ease: 'back.out(2)',
          scrollTrigger: { trigger: root.current, start: 'top 85%', toggleActions: PLAY_ONCE },
        });
        // The frame leans back a little as it leaves, like a screen on a table.
        gsap.to('.reel-frame', {
          rotationX: 8,
          scale: 0.94,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'center center', end: 'bottom top', scrub: true },
        });
      });
    },
    { scope: root },
  );

  // The play button unmounts once the reel starts, so the focus moves to the
  // video (now with controls) instead of falling back to <body>.
  const play = () => {
    setPlaying(true);
    requestAnimationFrame(() => {
      void video.current?.play();
      video.current?.focus();
    });
  };

  return (
    <section className="wrap reel" aria-label={t(reelUi.label)} ref={root}>
      <div className="reel-frame">
        {/* The still is an <img> with srcset (preloaded the same way in
            index.html and identical in the prerendered shell), so the browser
            fetches one size of it, once. It leaves when the reel plays. */}
        {!playing && (
          <img
            className="reel-shell-poster"
            src={`${base}img/reel-poster.webp`}
            srcSet={`${base}img/reel-poster-640.webp 640w, ${base}img/reel-poster-960.webp 960w, ${base}img/reel-poster.webp 1280w`}
            sizes="(max-width: 760px) 100vw, 1088px"
            width={1280}
            height={720}
            alt=""
            fetchPriority="high"
          />
        )}
        <video
          ref={video}
          width={1280}
          height={720}
          preload="none"
          playsInline
          controls={playing}
          aria-label={t(reelUi.label)}
        >
          {/* H.264 first; VP9 for browsers built without it. */}
          <source src={`${base}video/reel.mp4`} type='video/mp4; codecs="avc1.64001F, mp4a.40.2"' />
          <source src={`${base}video/reel.webm`} type='video/webm; codecs="vp9, opus"' />
          {/* No speech: the tracks give the music and the words on screen, off
              until the viewer turns them on, so the edit plays as cut. */}
          <track kind="captions" src={`${base}video/reel.en.vtt`} srcLang="en" label="English" />
          <track kind="captions" src={`${base}video/reel.pt.vtt`} srcLang="pt-BR" label="Português" />
        </video>
        {!playing && (
          <button type="button" className="reel-play" onClick={play}>
            <span className="sr-only">{t(reelUi.play)}</span>
            <svg viewBox="0 0 100 100" aria-hidden="true">
              <path d="M38 28 L74 50 L38 72 Z" />
            </svg>
          </button>
        )}
        <span className="reel-tag">{t(reelUi.label)}</span>
      </div>
      <p className="reel-note">{t(reelUi.note)}</p>
    </section>
  );
}
