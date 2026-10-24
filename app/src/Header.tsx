import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, FULL, FULL_MOTION, GENTLE_MOTION, setMotion } from './motion';
import { ui } from './content';
import { useLang } from './i18n';

const NAME = 'THIAGO GONÇALVES';

export function Header() {
  const { lang, setLang, t } = useLang();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(FULL_MOTION, () => {
        // The splash is painted in with a diagonal brush sweep, then the name
        // rises letter by letter out of its own line box.
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.fromTo(
          '.splash',
          { clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)' },
          { clipPath: 'polygon(0% 0%, 130% 0%, 100% 100%, 0% 100%)', duration: 1.1, ease: 'power2.inOut' },
          0,
        )
          .from('.name .char', { yPercent: 110, duration: 0.7, stagger: 0.025 }, 0.35)
          .from('.role, .tagline', { y: 16, autoAlpha: 0, duration: 0.6, stagger: 0.1 }, 0.8)
          .from(
            '.lang button, .motion-btn',
            { scale: 0.6, autoAlpha: 0, duration: 0.4, stagger: 0.08, ease: 'back.out(2)' },
            0.85,
          );

        // While the page scrolls, the paint drifts slower than the type.
        gsap.to('.splash', {
          yPercent: 12,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
        });
      });
      mm.add(GENTLE_MOTION, () => {
        gsap.from('.splash, .name, .role, .tagline, .lang', { opacity: 0, duration: 0.8, stagger: 0.12 });
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
          MOTION {FULL ? 'ON' : 'OFF'}
        </button>
      </div>
    </header>
  );
}
