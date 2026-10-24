# Thiago Gonçalves — painting, games and code

A portfolio told in three chapters, PAINT · PLAY · CODE, with a 62-second reel.
Live at **https://zednaked.github.io/portfolio/** (English and Portuguese).

React 19 · TypeScript (strict) · GSAP (ScrollTrigger, Flip) · Vite.
Every push runs lint, formatting, types, unit tests and end-to-end tests
(keyboard, axe, language switch) before GitHub Pages deploys it.

## Run it

```sh
cd app
npm ci
npm run dev          # http://localhost:5173/portfolio/
npm run check        # eslint + prettier + tsc + vitest
npm run build && npm run test:e2e   # Playwright against the production build
```

`CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e` uses a system Chromium
instead of Playwright's download.

## How it is put together

| Layer | Where | What it does |
|---|---|---|
| Content | `src/content.ts` | Every string and number, in both languages, typed with `satisfies Record<string, Text>`; the components never hold copy. |
| Language | `src/i18n.tsx` | `?lang=` beats the saved choice; switching updates `<html lang>` and the title. |
| Motion policy | `src/motion.ts` | One decision for the page: the system's reduced-motion setting is the default (and followed live), the MOTION button overrides it and is remembered. A switch remounts the app under a new key: every GSAP context reverts with its component and rebuilds, no reload, and the reader stays on the card they were reading. Reduced is gentle (fades, no travel), not frozen. |
| Sections | `src/*.tsx` | One component per section; each owns its timelines inside a GSAP context, so unmounting reverts them. |
| Film layer | `src/Film.tsx`, `style.css` | Grain and halftone applied to the document (they scroll with the page), timecode, scroll-velocity lean, pointer tilt. |

### Motion decisions worth knowing

- **The opening splash is wet paint in plain WebGL** (`src/splash-gl.ts`, ~3 KB):
  one quad, one texture, one fragment shader. The paint is thrown from the
  corner with a noisy front and a wet rim, thin drips creep down its edges, a
  faint glint follows the pointer and the pointer drags the paint. three.js
  would be ~120 KB gzip for one quad; it stays where the scene graph earns it
  (the flood simulator). The white name waits for the paint under it; the
  canvas draws only while the header is on screen; without WebGL, or under
  reduced motion, the same image is painted in by CSS.

- **Below-the-fold motion is built at idle time** (`useIdleGSAP`). On a phone the
  first render plus two dozen ScrollTriggers was a single 1.1 s task; each
  section now sets up in its own idle slot, and one `ScrollTrigger.sort()` +
  `refresh()` restores page order around the gallery pin.
- **Chapter cards collapse into their own shape** while the act's content rises
  underneath: the content starts in the lower part of the screen and the card
  collapses at a steady rate over 55% of a screen, so the shape uncovers the
  first lines and is gone before they reach the top.
- **The painting strip is pinned and moves by transform**, which the browser
  can't scroll into view: a `focusin` handler scrolls the page to the point
  where the strip shows the focused painting. Each painting is sized from its
  aspect ratio to the height left on screen, in `rem`, so it holds at any zoom.
- **Positions are re-measured** after web fonts load and whenever the page
  height changes (debounced), so late layout never leaves a trigger stale.
- **One property, one owner:** the reel frame's scroll tilt and the pointer tilt
  never animate the same `rotationX`.

### Accessibility

WCAG 2.2 AA, checked with axe in CI in three profiles (desktop, phone, reduced
motion) and both languages. Skip link; keyboard-reachable everything, with
visible focus even on elements an animation hasn't revealed yet; the viewer is
a native `<dialog>` that returns focus to the painting that opened it; case
clips have a pause button and start held under reduced motion; the reel has
English and Portuguese caption tracks (music and on-screen text; there is no
speech); the yellow accent never carries text on white.

### Performance

Measured on the live site with Lighthouse 13.5 (median of three runs):
desktop 100, LCP 0.67 s; phone (Moto G profile, slow 4G) 83, LCP 2.6 s;
CLS 0 in both. The reel poster, the largest paint, is preloaded at the size the
screen needs; Roboto loads without blocking the first paint; videos and
paintings off screen are fetched only when they come near.

## Tests

- **Unit** (`src/test`, Vitest + Testing Library + jsdom): language selection
  and persistence, number formatting per locale, the gallery viewer (opens,
  focuses Close, closes on Esc, returns focus), the clip pause control.
- **End to end** (`e2e`, Playwright + axe): no console errors, no WCAG
  violations in either language, language switch, every strip painting on
  screen when focused, finale links visible on focus, reel play moves focus to
  the video. Several of these pin regressions found in an audit.

## Repository

- `app/` — the site. `app/public/flutter_service_worker.js` stays on purpose:
  it unregisters the service worker of the old Flutter build for returning
  visitors.
- The previous static and Flutter versions live in the git history.
