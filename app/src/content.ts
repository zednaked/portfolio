// Every string the page shows, in both languages. English is primary.
// Texts are carried over verbatim from the static site (site/index.html).
// The copy below the fold (the work, the cases, the credits) lives in
// content-work.ts, which only the lazy sections import: the entry chunk
// carries the first screen's words, not the whole page's.

export type Lang = 'en' | 'pt';

export type Text = Record<Lang, string>;

export const ui = {
  title: {
    en: 'Thiago Gonçalves: painting and creative web',
    pt: 'Thiago Gonçalves: pintura e web criativa',
  },
  skip: { en: 'Skip to the work', pt: 'Pular para os trabalhos' },
  role: {
    en: 'PAINTER + CREATIVE DEVELOPER',
    pt: 'PINTOR + DESENVOLVEDOR CRIATIVO',
  },
  tagline: {
    en: 'I build interactive things for the browser, and I measure them.',
    pt: 'Construo coisas interativas para o navegador, e meço cada uma.',
  },
  jump: { en: 'Jump to', pt: 'Ir para' },
  jumpPaint: { en: 'Painting', pt: 'Pintura' },
  jumpPlay: { en: 'Games', pt: 'Jogos' },
  jumpCode: { en: 'Code', pt: 'Código' },
  jumpCredits: { en: 'Shipped and credited', pt: 'Entregue e creditado' },
  aboutLabel: { en: 'About me', pt: 'Sobre mim' },
  about: {
    en: 'I learned oil painting through the classical method, and the first portraits in PAINT, above, are oil on canvas. Then I moved to digital painting on the iPad, where the illustration, character design and game art after them were made. I am also a gardener and a beekeeper. To me, code is art: made with the same care as a painting.',
    pt: 'Aprendi pintura a óleo pelo método clássico, e os primeiros retratos do PAINT, acima, são óleo sobre tela. Depois passei para a pintura digital no iPad, onde foram feitos a ilustração, o character design e a arte de jogos que vêm depois deles. Também sou jardineiro e apicultor. Pra mim, código é arte: feito com o mesmo cuidado de uma pintura.',
  },
  portraitAlt: {
    en: 'Portrait of Thiago Gonçalves, long dark hair and beard, plaid shirt, holding paintbrushes.',
    pt: 'Retrato de Thiago Gonçalves, cabelo comprido escuro e barba, camisa xadrez, segurando pincéis.',
  },
  exhibitsLabel: { en: 'Exhibitions and awards', pt: 'Exposições e prêmios' },
  bookLabel: {
    en: 'In print: Artists Across Continents 2015 (Artcom Expo), pages 166 and 167.',
    pt: 'No livro: Artists Across Continents 2015 (Artcom Expo), páginas 166 e 167.',
  },
  workLabel: { en: 'Oil and digital paint', pt: 'Óleo e pintura digital' },
  swipe: { en: 'swipe for more →', pt: 'deslize para ver mais →' },
  open: { en: 'View larger', pt: 'Ver maior' },
  close: { en: 'Close', pt: 'Fechar' },
  motionDown: { en: 'Turn motion down', pt: 'Reduzir o movimento' },
  motionUp: { en: 'Turn full motion on', pt: 'Ligar o movimento completo' },
  colophon: {
    en: 'This page and the reel share one language: paint thrown on paper, Bauhaus shapes for the chapters, halftone, grain. React, TypeScript, GSAP, WebGL and three.js; gentler motion when your system asks for it, full motion one tap away.',
    pt: 'Esta página e o reel falam a mesma língua: tinta jogada no papel, formas Bauhaus nos capítulos, retícula, grão. React, TypeScript, GSAP, WebGL e three.js; movimento mais suave quando o sistema pede, o completo a um toque.',
  },
} satisfies Record<string, Text>;

// Chapters, the reel and the closing signature: the same story the reel tells.
export interface Chapter {
  id: string;
  num: string;
  word: string;
  shape: 'circle' | 'tri' | 'square';
  color: string;
  ink: string;
  bg: string;
  sub: Text;
}

export const BAUHAUS = { red: '#d7261e', yellow: '#f2b705', blue: '#1d3f9e', black: '#0b0b0b', cream: '#f1ead8' };

export const chapters: Record<'paint' | 'play' | 'code', Chapter> = {
  paint: {
    id: 'paint',
    num: 'I.',
    word: 'PAINT',
    shape: 'circle',
    color: BAUHAUS.red,
    ink: BAUHAUS.black,
    bg: BAUHAUS.cream,
    sub: { en: 'Oil on canvas, then the iPad', pt: 'Óleo sobre tela, depois o iPad' },
  },
  play: {
    id: 'play',
    num: 'II.',
    word: 'PLAY',
    shape: 'tri',
    color: BAUHAUS.yellow,
    ink: BAUHAUS.cream,
    bg: BAUHAUS.black,
    sub: { en: 'Games I made', pt: 'Jogos que fiz' },
  },
  code: {
    id: 'code',
    num: 'III.',
    word: 'CODE',
    shape: 'square',
    color: BAUHAUS.blue,
    ink: BAUHAUS.black,
    bg: BAUHAUS.cream,
    sub: { en: 'Built for the browser and the desktop', pt: 'Feito para o navegador e a área de trabalho' },
  },
};

export const reelUi = {
  label: { en: 'Reel · 62 s', pt: 'Reel · 62 s' },
  play: { en: 'Play the reel', pt: 'Ver o reel' },
  note: {
    en: 'Edited in code: HyperFrames, GSAP and a GLSL paint shader, cut to my own track at 137 BPM. Backgrounds from Caligari (1920) and Nosferatu (1922), public domain.',
    pt: 'Montado em código: HyperFrames, GSAP e um shader de tinta em GLSL, cortado numa trilha minha a 137 BPM. Fundos de Caligari (1920) e Nosferatu (1922), domínio público.',
  },
} satisfies Record<string, Text>;
