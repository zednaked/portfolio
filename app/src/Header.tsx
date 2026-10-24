import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, FULL, FULL_MOTION, GENTLE_MOTION, setMotion, switched } from './motion';
import { ui } from './content';
import type { SplashGL } from './splash-gl';
import { hasGPU } from './gpu';
import { useLang } from './i18n';

const NAME = 'THIAGO GONÇALVES';

export function Header() {
  const { lang, setLang, t } = useLang();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(FULL_MOTION, () => {
        // The splash is thrown onto the paper as wet paint (WebGL), then the
        // name rises letter by letter out of its own line box. Without WebGL,
        // the same image is painted in with a diagonal sweep.
        const splash = root.current?.querySelector<HTMLElement>('.splash');
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        const sweep = () =>
          gsap.fromTo(
            '.splash',
            { clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)' },
            { clipPath: 'polygon(0% 0%, 130% 0%, 100% 100%, 0% 100%)', duration: 1.1, ease: 'power2.inOut' },
          );
        // The image stays hidden until the shader can draw it (or fails and
        // the sweep paints it instead).
        gsap.set('.splash', { clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)' });
        // The shader is its own small chunk, fetched at once: it waits for the
        // image anyway, and the entry chunk stays lean.
        let paint: SplashGL | null = null;
        let gone = false;
        const fail = () => {
          splash?.classList.remove('gl-on');
          sweep();
          tl.play();
        };
        if (splash && hasGPU()) {
          tl.pause();
          // If the image is slow, the name doesn't wait forever.
          gsap.delayedCall(2.5, () => tl.play());
          import('./splash-gl')
            .then(({ createSplashGL }) => {
              if (gone) return;
              paint = createSplashGL(
                splash,
                `${import.meta.env.BASE_URL}img/splash.webp`,
                () => {
                  splash.classList.add('gl-on');
                  gsap.set(splash, { clipPath: 'none' });
                  // After a motion switch the opening has been seen: no replay.
                  if (switched) {
                    if (paint) paint.reveal.value = 1;
                    return;
                  }
                  // Thrown fast and settling slow, from the moment the image is
                  // in (started earlier, a slow connection would miss the throw).
                  gsap.to(paint?.reveal ?? {}, { value: 1, duration: 1.9, ease: 'power2.out' });
                  // White type needs paint under it: the name waits for the throw.
                  gsap.delayedCall(0.55, () => tl.play());
                },
                fail,
              );
              if (!paint) fail();
            })
            .catch(fail);
        } else tl.add(sweep(), 0);
        tl.from('.name .char', { yPercent: 110, duration: 0.7, stagger: 0.025 }, 0.35)
          .from('.role, .tagline, .jump', { y: 16, opacity: 0, duration: 0.6, stagger: 0.1 }, 0.8)
          .from(
            '.lang button, .motion-btn',
            { scale: 0.6, opacity: 0, duration: 0.4, stagger: 0.08, ease: 'back.out(2)' },
            0.85,
          );
        if (switched) tl.progress(1);

        // While the page scrolls, the paint drifts slower than the type.
        gsap.to('.splash', {
          yPercent: 12,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
        });
        return () => {
          gone = true;
          paint?.destroy();
        };
      });
      mm.add(GENTLE_MOTION, () => {
        if (switched) return;
        // White type needs the paint under it: hold the fade until the splash
        // image is in (3 s at most), or slow connections get white on paper.
        const tl = gsap.timeline({ paused: true });
        // Controls (shortcuts, language) are there at once; only the paint and
        // the words fade, so nothing a reader can press is ever half-visible.
        tl.from('.splash, .name, .role, .tagline', { opacity: 0, duration: 0.8, stagger: 0.12 });
        const img = new Image();
        img.src = `${import.meta.env.BASE_URL}img/splash.webp`;
        const go = () => tl.play();
        void img.decode().then(go, go);
        const late = window.setTimeout(go, 3000);
        return () => window.clearTimeout(late);
      });
    },
    { scope: root },
  );

  return (
    <header className="top" ref={root}>
      <div className="tex-paper" aria-hidden="true" />
      <div className="splash" aria-hidden="true" />
      <div className="wrap hero-text">
        <h1 className="name">
          <span className="sr-only">{NAME}</span>
          {/* One clipping box per word, so a narrow screen can still wrap. */}
          {NAME.split(' ').map((word, w) => (
            <span key={w}>
              {w > 0 && ' '}
              <span className="line" aria-hidden="true">
                {[...word].map((c, i) => (
                  <span className="char" key={i}>
                    {c}
                  </span>
                ))}
              </span>
            </span>
          ))}
        </h1>
        <p className="role">{t(ui.role)}</p>
        <p className="tagline">{t(ui.tagline)}</p>
        {/* Straight to a chapter: the acts take several screens to scroll through. */}
        <nav className="jump" aria-label={t(ui.jump)}>
          <a href="#paint">{t(ui.jumpPaint)}</a>
          <a href="#play">{t(ui.jumpPlay)}</a>
          <a href="#code">{t(ui.jumpCode)}</a>
          <a href="#credits">{t(ui.jumpCredits)}</a>
        </nav>
        <div className="lang" role="group" aria-label="Language / Idioma">
          {(['en', 'pt'] as const).map((code) => (
            <button key={code} type="button" aria-pressed={lang === code} onClick={() => setLang(code)}>
              {code.toUpperCase()}
            </button>
          ))}
        </div>
        {/* The motion switch sits with the other reader settings, not over the text. */}
        <button
          type="button"
          className="motion-btn"
          aria-pressed={FULL}
          onClick={() => setMotion(FULL ? 'reduced' : 'full')}
          title={t(FULL ? ui.motionDown : ui.motionUp)}
        >
          <i aria-hidden="true" />
          {/* The pressed state carries on/off for screen readers. */}
          MOTION <span aria-hidden="true">{FULL ? 'ON' : 'OFF'}</span>
        </button>
      </div>
    </header>
  );
}
