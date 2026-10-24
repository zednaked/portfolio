import { useEffect, useRef, useState } from 'react';
import { FULL, ScrollTrigger, holdPlace, refreshSoon } from './motion';
import { floodUi } from './content-work';
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
  // Probed (and cached) when the CODE chunk arrived, so the act is laid out
  // once: live, or as its still. Only a lost context swaps it later.
  const [live, setLive] = useState(() => FULL && hasGPU());
  const [ready, setReady] = useState(false);
  // The still is much shorter than the live stage: re-measure through the one
  // refresh, so the reader's place (or a #link's) holds.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    refreshSoon();
  }, [live]);

  useEffect(() => {
    const el = root.current;
    const cv = canvas.current;
    if (!live || !el || !cv) return;
    let scene: FloodScene | null = null;
    let st: ScrollTrigger | null = null;
    let gone = false;
    let detach: () => void = () => undefined;
    // If the GPU drops the context (a driver reset), the still takes over.
    const lost = () => {
      holdPlace();
      setLive(false);
    };
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
            // Drag sideways on the map to move the water by hand: the scroll
            // sets the line, the hand plays with it. Sideways only, so a
            // phone's vertical swipe still scrolls the page.
            let lastX: number | null = null;
            const down = (e: PointerEvent) => {
              lastX = e.clientX;
              cv.setPointerCapture(e.pointerId);
            };
            const move = (e: PointerEvent) => {
              if (lastX === null) return;
              s.nudge(((e.clientX - lastX) / cv.clientWidth) * 120);
              lastX = e.clientX;
            };
            const up = () => {
              if (lastX !== null) s.release();
              lastX = null;
            };
            cv.addEventListener('pointerdown', down);
            cv.addEventListener('pointermove', move);
            cv.addEventListener('pointerup', up);
            cv.addEventListener('pointercancel', up);
            detach = () => {
              cv.removeEventListener('pointerdown', down);
              cv.removeEventListener('pointermove', move);
              cv.removeEventListener('pointerup', up);
              cv.removeEventListener('pointercancel', up);
            };
          })
          .catch(() => {
            // The probe passed but the context didn't open (a driver that
            // refuses it, a GPU reset): the still takes the stage.
            if (gone) return;
            holdPlace();
            setLive(false);
          });
      },
      { rootMargin: '150% 0px' },
    );
    io.observe(el);
    return () => {
      gone = true;
      detach();
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
            src={`${base}img/terrain-still.webp`}
            width={1280}
            height={800}
            loading="lazy"
            decoding="async"
            alt={t(floodUi.stillAlt)}
          />
        )}
        <div className="flood-text">
          <h3 id="flood-h" className="flood-h">
            {t(floodUi.kind)}
          </h3>
          <p>{t(live ? floodUi.caption : floodUi.still)}</p>
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
          {live && ready && <p className="flood-drag">{t(floodUi.drag)}</p>}
        </div>
      </div>
    </section>
  );
}
