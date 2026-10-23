import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, FULL_MOTION } from './motion';
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
        gsap.from('.reel-play', { scale: 0, rotation: -90, duration: 0.8, delay: 0.5, ease: 'back.out(2)', scrollTrigger: { trigger: root.current, start: 'top 85%', once: true } });
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

  const play = () => {
    setPlaying(true);
    requestAnimationFrame(() => void video.current?.play());
  };

  return (
    <section className="wrap reel" aria-label={t(reelUi.label)} ref={root}>
      <div className="reel-frame">
        <video
          ref={video}
          src={`${base}video/reel.mp4`}
          poster={`${base}img/reel-poster.webp`}
          width={1280}
          height={720}
          preload="none"
          playsInline
          controls={playing}
          aria-label={t(reelUi.label)}
        />
        {!playing && (
          <button type="button" className="reel-play" onClick={play}>
            <span className="sr-only">{t(reelUi.play)}</span>
            <svg viewBox="0 0 100 100" aria-hidden="true"><path d="M38 28 L74 50 L38 72 Z" /></svg>
          </button>
        )}
        <span className="reel-tag">{t(reelUi.label)}</span>
      </div>
      <p className="reel-note">{t(reelUi.note)}</p>
    </section>
  );
}
