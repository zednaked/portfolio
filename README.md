# Portfolio: painting and illustration

Painting, illustration, character design and game art by Thiago Gonçalves.
Live at https://zednaked.github.io/portfolio/

Engineering work lives on [github.com/zednaked](https://github.com/zednaked).

## Layout

- `site/` is the whole page: plain HTML, CSS, a small language switcher
  (`lang.js`) and WebP images. No framework, no build step. GitHub Pages
  serves this folder (`.github/workflows/static.yml`).
- `legacy/` holds the previous Flutter Web version (`legacy/website`) and its
  last build (`legacy/build`). It is kept for history and is not served.

## Adding a piece

1. Export the image as WebP, no wider than twice its displayed size.
2. Add a `<figure>` to `site/index.html` with `width`, `height`,
   `loading="lazy"`, an `alt` that describes the work, and a `data-alt-pt`
   and `data-pt` for the Portuguese text. English is the primary version.
