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

`CHROMIUM_PATH=/usr/bin/chromium` makes the build's prerender step and the
end-to-end tests use a system Chromium instead of Playwright's download.

## How it is put together

| Layer | Where | What it does |
|---|---|---|
| Content | `src/content.ts` | Every string and number, in both languages, typed with `satisfies Record<string, Text>`; the components never hold copy. |
| Language | `src/i18n.tsx` | `?lang=` beats the saved choice; switching updates `<html lang>` and the title. |
| Motion policy | `src/motion.ts` | One decision for the page: the system's reduced-motion setting is the default (and followed live), the MOTION button overrides it and is remembered. A switch remounts the app under a new key: every GSAP context reverts with its component and rebuilds, no reload, and the reader stays on the card they were reading. Reduced is gentle (fades, no travel), not frozen. |
| Sections | `src/*.tsx` | One component per section; each owns its timelines inside a GSAP context, so unmounting reverts them. |
| Film layer | `src/Film.tsx`, `style.css` | Grain and halftone applied to the document (they scroll with the page), timecode, scroll-velocity lean, pointer tilt. |

### Motion decisions worth knowing

- **The CODE act opens on Cheia's terrain, in three.js** (`src/flood-scene.ts`,
  `src/Flood.tsx`): the real relief of Curitiba from the flood simulator's own
  data, baked to a 256 × 256 heightmap (`scripts/bake-cheia.mjs`), drawn as a
  print (paper, ink contours every 20 m and 100 m, rivers) while the scroll
  raises a water line and turns the camera. The readout (height of the line,
  share of the map below it) is a binary search over the sorted heights. It is
  an illustration on the same terrain, and says so; the simulator runs the
  physics. three.js loads as its own chunk with its own budget, only when the
  act comes near and only on a real GPU; it renders on demand, and a lost
  context hands over to the still.

- **The opening splash is wet paint in plain WebGL** (`src/splash-gl.ts`, ~3 KB):
  one quad, one texture, one fragment shader. The paint is thrown from the
  corner with a noisy front and a wet rim; it is lit as paint, its relief
  taken from the image itself (edges and drops are ridges) with brush marks
  radiating from the corner; drips run from paint with body; a glint follows
  the pointer and the pointer drags the paint. The canvas never has more
  pixels than the image. three.js
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

The build prerenders the first screen (`scripts/prerender.mjs`): the production
page is rendered in Chromium and the header and reel are written into
`index.html`, so the paper and the reel poster paint before any JavaScript
runs. The WebGL splash runs only on a real GPU (a software renderer would draw
on the CPU and block the page) and stops drawing once nothing on it moves.

Measured on the live site with Lighthouse 13.5 (median of three runs):
desktop 100; phone (Moto G profile, slow 4G) 88, LCP 3.0 s, TBT 290 ms;
accessibility 100; CLS 0 in both. After every deploy, CI runs the same
measurement (`scripts/lighthouse.mjs`) and fails if the phone falls under 80,
LCP passes 3.5 s or TBT 400 ms. The paper, the largest paint, is preloaded;
Roboto loads without blocking the first paint; videos and paintings off
screen are fetched only when they come near, paintings at the size the frame
needs (srcset).

## Tests

- **Unit** (`src/test`, Vitest + Testing Library + jsdom): language selection
  and persistence, deferred ScrollTriggers removed on unmount, number formatting per locale, the gallery viewer (opens,
  focuses Close, closes on Esc, returns focus), the clip pause control.
- **GPU** (`e2e/gpu.spec.ts`, opt-in with `GPU=1`): CI runners have no GPU and
  the splash refuses software GL, so the WebGL path is tested on a machine
  with one: paint coverage measured on a real screenshot, before and after a
  resize once the canvas has gone idle.
- **End to end** (`e2e`, Playwright + axe): no console errors, no WCAG
  violations in either language, language switch, every strip painting on
  screen when focused, finale links visible on focus, reel play moves focus to
  the video. Several of these pin regressions found in an audit.

## Repository

- `app/` — the site. `app/public/flutter_service_worker.js` stays on purpose:
  it unregisters the service worker of the old Flutter build for returning
  visitors.
- The previous static and Flutter versions live in the git history.
