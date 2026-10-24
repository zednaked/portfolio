import { useEffect, useRef, useState } from 'react';
import { FULL, ScrollTrigger } from './motion';
import { floodUi } from './content';
import { useLang } from './i18n';
import type { FloodScene } from './flood-scene';
import { hasGPU } from './gpu';

const base = import.meta.env.BASE_URL;
// Heights of the baked terrain (scripts/bake-cheia.mjs), and the water line's
// travel: from the valley floors to about a third of the map under.
const TERRAIN = { lo: 666, hi: 1292, from: 860, to: 905 };

/**
 * Cheia, live: the terrain as a print with a water line the scroll raises.
 * The 3D chunk (three.js) loads when the act comes near; without a GPU, or
 * under reduced motion, the still of the simulator stands in.
 */
export function Flood() {
  const { lang, t } = useLang();
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const level = useRef<HTMLElement>(null);
  const under = useRef<HTMLElement>(null);
  // Read by the readout, which the scroll drives outside React.
  const langRef = useRef(lang);
  useEffect(() => {
    langRef.current = lang;
  }, [lang]);
  const [live, setLive] = useState(() => FULL && hasGPU());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = root.current;
    const cv = canvas.current;
    if (!live || !el || !cv) return;
    let scene: FloodScene | null = null;
    let st: ScrollTrigger | null = null;
    let gone = false;
    // If the GPU drops the context (a driver reset), the still takes over.
    const lost = () => setLive(false);
    cv.addEventListener('webglcontextlost', lost);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        import('./flood-scene')
          .then(({ createFloodScene }) =>
            createFloodScene(cv, `${base}data/cheia-terrain.png`, TERRAIN, (r) => {
              const locale = langRef.current === 'pt' ? 'pt-BR' : 'en';
              if (level.current) level.current.textContent = `${Math.round(r.level)} m`;
              if (under.current)
                under.current.textContent = r.under.toLocaleString(locale, {
                  style: 'percent',
                  maximumFractionDigits: 0,
                });
            }),
          )
          .then((s) => {
            if (gone) {
              s.destroy();
              return;
            }
            scene = s;
            st = ScrollTrigger.create({
              trigger: el,
              start: 'top top',
              end: 'bottom bottom',
              onUpdate: (self) => {
                s.setProgress(self.progress);
              },
            });
            s.setProgress(st.progress);
            setReady(true);
          })
          .catch(() => {
            // The canvas stays empty and hidden; the caption still reads.
          });
      },
      { rootMargin: '150% 0px' },
    );
    io.observe(el);
    return () => {
      gone = true;
      cv.removeEventListener('webglcontextlost', lost);
      io.disconnect();
      st?.kill();
      scene?.destroy();
    };
  }, [live]);

  return (
    <section className={live ? 'flood is-live' : 'flood'} aria-labelledby="flood-h" ref={root}>
      <div className="flood-stage">
        {live ? (
          <canvas ref={canvas} className={ready ? 'flood-canvas on' : 'flood-canvas'} aria-hidden="true" />
        ) : (
          <img
            className="flood-still"
            src={`${base}img/web-cheia.webp`}
            width={800}
            height={500}
            loading="lazy"
            decoding="async"
            alt={t(floodUi.alt)}
          />
        )}
        <div className="flood-text">
          <h3 id="flood-h" className="flood-h">
            {t(floodUi.kind)}
          </h3>
          <p>{t(floodUi.caption)}</p>
          {live && (
            <p className="flood-readout" aria-hidden="true">
              <span>
                <b ref={level}>{TERRAIN.from} m</b>
                <small>{t(floodUi.level)}</small>
              </span>
              <span>
                <b ref={under}>0%</b>
                <small>{t(floodUi.under)}</small>
              </span>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
