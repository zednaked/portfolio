// Every string the page shows, in both languages. English is primary.
// Texts are carried over verbatim from the static site (site/index.html).

export type Lang = 'en' | 'pt';
export type Text = Record<Lang, string>;

export interface Artwork {
  id: string;
  src: string;
  width: number;
  height: number;
  title: Text;
  caption: Text;
  alt: Text;
  pixel?: boolean;
  wide?: boolean;
}

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
  aboutLabel: { en: 'About me', pt: 'Sobre mim' },
  about: {
    en: 'I learned oil painting through the classical method, then moved to digital painting on the iPad, where most of the work below was made. This page holds illustration, character design and the art I made for games. I am also a gardener and a beekeeper.',
    pt: 'Aprendi pintura a óleo pelo método clássico e depois passei para a pintura digital no iPad, onde foi feita a maior parte do que está abaixo. Aqui ficam ilustração, character design e a arte que fiz para jogos. Também sou jardineiro e apicultor.',
  },
  portraitAlt: {
    en: 'Portrait of Thiago Gonçalves, long dark hair and beard, plaid shirt, holding paintbrushes.',
    pt: 'Retrato de Thiago Gonçalves, cabelo comprido escuro e barba, camisa xadrez, segurando pincéis.',
  },
  awardYear: { en: '2015 · Louvre, Paris', pt: '2015 · Louvre, Paris' },
  award: {
    en: 'Exhibited an oil painting at a salon at the Louvre, where it won best oil painting of the salon.',
    pt: 'Expus uma pintura a óleo num salão no Louvre, onde ela ganhou o prêmio de melhor pintura a óleo do salão.',
  },
  showYear: { en: '2021 · Curitiba', pt: '2021 · Curitiba' },
  show: {
    en: 'Kleshas, a virtual exhibition backed by Fundação Cultural de Curitiba through its arts patronage program.',
    pt: 'Kleshas, exposição virtual apoiada pela Fundação Cultural de Curitiba por meio do mecenato.',
  },
  workLabel: { en: 'Work', pt: 'Trabalhos' },
  open: { en: 'View larger', pt: 'Ver maior' },
  close: { en: 'Close', pt: 'Fechar' },
  engLabel: { en: 'Engineering', pt: 'Engenharia' },
  eng: {
    en: 'Engineering work (Godot, C++, game development and audio tools) lives on GitHub, next to the code:',
    pt: 'O trabalho de engenharia (Godot, C++, desenvolvimento de jogos e ferramentas de áudio) fica no GitHub, ao lado do código:',
  },
  colophon: {
    en: 'This page: React, TypeScript and GSAP, motion off when your system asks for reduced motion.',
    pt: 'Esta página: React, TypeScript e GSAP, sem movimento quando o sistema pede movimento reduzido.',
  },
} satisfies Record<string, Text>;

const base = import.meta.env.BASE_URL;

export const artworks: Artwork[] = [
  {
    id: 'rose',
    src: `${base}img/name-of-the-rose.webp`,
    width: 514,
    height: 723,
    title: { en: 'The Name of the Rose, movie poster', pt: 'Pôster de O Nome da Rosa' },
    caption: {
      en: 'Ensemble character composition. Digital painting, Procreate.',
      pt: 'Composição com vários personagens. Pintura digital, Procreate.',
    },
    alt: {
      en: 'Painted movie poster: hooded monks gathered in front of a stone tower at night, one holding a lantern, with the title The Name of the Rose at the bottom.',
      pt: 'Pôster pintado: monges encapuzados reunidos diante de uma torre de pedra à noite, um deles segurando uma lanterna, com o título The Name of the Rose embaixo.',
    },
  },
  {
    id: 'dishonored',
    src: `${base}img/dishonored-study.webp`,
    width: 505,
    height: 710,
    title: { en: 'Dishonored character study', pt: 'Estudo de personagem, Dishonored' },
    caption: {
      en: 'Study inspired by the game Dishonored. Digital painting, Procreate.',
      pt: 'Estudo inspirado no jogo Dishonored. Pintura digital, Procreate.',
    },
    alt: {
      en: 'Painted portrait of a woman with a shaved head in a high-collared coat crossed by a sash, in muted earth tones.',
      pt: 'Retrato pintado de uma mulher de cabeça raspada, casaco de gola alta cruzado por uma faixa, em tons terrosos apagados.',
    },
  },
  {
    id: 'hectares',
    src: `${base}img/hectares-title.webp`,
    width: 422,
    height: 720,
    pixel: true,
    title: { en: 'Hectares, title screen', pt: 'Hectares, tela de título' },
    caption: {
      en: 'Art and UI for a farming game. Procreate and Figma.',
      pt: 'Arte e UI de um jogo de fazenda. Procreate e Figma.',
    },
    alt: {
      en: 'Pixel art title screen: a wooden sign reading HECTARES with the menu options Jogue, Opções and Sair, framed by rows of tilled farmland.',
      pt: 'Tela de título em pixel art: uma placa de madeira escrita HECTARES com as opções Jogue, Opções e Sair, cercada por fileiras de terra arada.',
    },
  },
  {
    id: 'cards',
    src: `${base}img/card-game-ui.webp`,
    width: 987,
    height: 636,
    wide: true,
    title: { en: 'Card game layout', pt: 'Layout de carta para card game' },
    caption: {
      en: 'One character across three color schemes, exploring the card layout. Figma.',
      pt: 'Um personagem em três esquemas de cor, explorando o layout da carta. Figma.',
    },
    alt: {
      en: 'Three phone-sized card screens in red, dark orange and white, each showing the same bearded armored warrior with name, stats and buttons below.',
      pt: 'Três telas de carta em formato de celular, em vermelho, laranja escuro e branco, cada uma com o mesmo guerreiro barbado de armadura, com nome, atributos e botões embaixo.',
    },
  },
];

export interface Stat {
  value: number;
  decimals?: number;
  unit: string;
  label: Text;
}

export interface WebPiece {
  id: string;
  img: string;
  width: number;
  height: number;
  phone?: boolean;
  title: Text;
  what: Text;
  role: Text;
  tech: string[];
  stats: Stat[];
  note?: Text;
  alt: Text;
  live: string;
  code: string;
}

export const webUi = {
  label: { en: 'Interactive web', pt: 'Web interativa' },
  intro: {
    en: 'Three things I built for the browser, each live, each with the number I measured on it.',
    pt: 'Três coisas que construí para o navegador, todas no ar, cada uma com o número que medi nela.',
  },
  role: { en: 'My role', pt: 'Meu papel' },
  live: { en: 'Open it live', pt: 'Abrir no ar' },
  code: { en: 'Code', pt: 'Código' },
  pageLabel: { en: 'This page', pt: 'Esta página' },
  page: {
    en: 'React, TypeScript and GSAP (ScrollTrigger, Flip). Median of five loads in headless Chromium, from a local server, so network time is not in it:',
    pt: 'React, TypeScript e GSAP (ScrollTrigger, Flip). Mediana de cinco carregamentos no Chromium headless, com servidor local, então o tempo de rede não entra:',
  },
  pageA11y: {
    en: 'Every animation is off when the system asks for reduced motion. The viewer opens from the painting, closes with Escape or a click outside, and puts the focus back where it was. Alt text in both languages.',
    pt: 'Toda animação desliga quando o sistema pede movimento reduzido. O visualizador abre a partir da pintura, fecha com Esc ou com um clique fora e devolve o foco para onde estava. Texto alternativo nas duas línguas.',
  },
  proofLabel: { en: 'Shipped and credited', pt: 'Entregue e creditado' },
} satisfies Record<string, Text>;

export const pageStats: Stat[] = [
  { value: 0.18, decimals: 2, unit: ' s', label: { en: 'largest paint, desktop', pt: 'maior pintura, desktop' } },
  { value: 0.17, decimals: 2, unit: ' s', label: { en: 'largest paint, phone', pt: 'maior pintura, celular' } },
  { value: 0, unit: '', label: { en: 'layout shift', pt: 'deslocamento de layout' } },
];

export const webWork: WebPiece[] = [
  {
    id: 'cheia',
    img: `${base}img/web-cheia.webp`,
    width: 800,
    height: 500,
    title: { en: 'Cheia, a flood simulator for Curitiba', pt: 'Cheia, simulador de enchentes de Curitiba' },
    what: {
      en: 'Rain falls on the real terrain of a metropolitan region and the water runs downhill in a browser tab. Search a street and it tells you at what time the water passes 30 cm there.',
      pt: 'A chuva cai no relevo real de uma região metropolitana e a água desce morro abaixo numa aba do navegador. Busque uma rua e ele diz a que horas a água passa de 30 cm ali.',
    },
    role: { en: 'Alone: data pipeline, simulation, interface.', pt: 'Sozinho: dados, simulação, interface.' },
    tech: ['three.js', 'GLSL', 'Vite', 'Service Worker'],
    stats: [
      { value: 2.4, decimals: 1, unit: ' M', label: { en: 'water cells, one shader pass per step', pt: 'células de água, uma passada de shader por passo' } },
      { value: 81, unit: ' fps', label: { en: 'on an integrated laptop GPU', pt: 'numa GPU integrada de notebook' } },
      { value: 5.9, decimals: 1, unit: ' ms', label: { en: 'per simulation step', pt: 'por passo de simulação' } },
    ],
    note: { en: 'The interface is in Portuguese.', pt: 'A interface é em português.' },
    alt: {
      en: 'Cheia in the browser: a 3D satellite map of Curitiba with rivers in blue, a control panel for rain intensity and duration on the left, and a water depth legend.',
      pt: 'O Cheia no navegador: um mapa 3D de satélite de Curitiba com os rios em azul, um painel de controle de intensidade e duração da chuva à esquerda e a legenda de profundidade da água.',
    },
    live: 'https://zednaked.github.io/cheia/',
    code: 'https://github.com/zednaked/cheia',
  },
  {
    id: 'jangada',
    img: `${base}img/web-jangada.webp`,
    width: 800,
    height: 500,
    title: { en: 'Jangada Studio, a synth in the browser', pt: 'Jangada Studio, um sintetizador no navegador' },
    what: {
      en: 'The firmware of a pocket synth, compiled to WebAssembly and running in an AudioWorklet, played from the computer keyboard or any MIDI keyboard.',
      pt: 'O firmware de um sintetizador de bolso, compilado para WebAssembly e rodando num AudioWorklet, tocado pelo teclado do computador ou por qualquer teclado MIDI.',
    },
    role: { en: 'Author of the firmware fork and of the web studio.', pt: 'Autor do fork do firmware e do estúdio web.' },
    tech: ['WebAssembly', 'AudioWorklet', 'Web MIDI', 'Canvas'],
    stats: [
      { value: 13, unit: '', label: { en: 'synth engines, the same code as the hardware', pt: 'motores de síntese, o mesmo código do hardware' } },
      { value: 4, unit: '', label: { en: 'tracks with a step sequencer', pt: 'trilhas com sequenciador' } },
    ],
    alt: {
      en: 'Jangada Studio: a white page with a magenta title, four track tabs, filter sliders and a drone section.',
      pt: 'Jangada Studio: uma página branca com título magenta, quatro abas de trilha, sliders de filtro e uma seção de drone.',
    },
    live: 'https://zednaked.github.io/jangada/webapp/studio/',
    code: 'https://github.com/zednaked/jangada',
  },
  {
    id: 'playable',
    img: `${base}img/web-playable.webp`,
    width: 360,
    height: 480,
    phone: true,
    title: { en: 'A playable ad under the network cap', pt: 'Um anúncio jogável abaixo do teto da rede' },
    what: {
      en: 'One mechanic as a single self-contained HTML file, with every byte accounted for. Stubbing the WebGPU and Canvas renderers out of the bundle cut 66 KB with no change to the game.',
      pt: 'Uma mecânica num único arquivo HTML autocontido, com cada byte contabilizado. Tirar os renderizadores WebGPU e Canvas do bundle cortou 66 KB sem mudar nada no jogo.',
    },
    role: { en: 'Alone: game, build tooling, measurement.', pt: 'Sozinho: jogo, ferramenta de build, medição.' },
    tech: ['PixiJS v8', 'WebGL', 'esbuild'],
    stats: [
      { value: 630, unit: ' KB', label: { en: 'the whole ad, one file', pt: 'o anúncio inteiro, um arquivo' } },
      { value: 30.8, decimals: 1, unit: '%', label: { en: 'of the 2 MB cap Meta allows', pt: 'do teto de 2 MB da Meta' } },
    ],
    alt: {
      en: 'The playable ad mid-game: a brown bunny between floating grass platforms, gold coins, a 4 of 5 coin counter and the hint Hold left or right to steer.',
      pt: 'O anúncio jogável no meio da partida: um coelho marrom entre plataformas de grama flutuantes, moedas douradas, o contador 4 de 5 e a dica Hold left or right to steer.',
    },
    live: 'https://zednaked.github.io/playable-budget/',
    code: 'https://github.com/zednaked/playable-budget',
  },
];

export interface Proof {
  text: Text;
  link: string;
  linkText: string;
}

export const proofs: Proof[] = [
  {
    text: {
      en: 'Sole front-end engineer on a catalogue of 20+ commercial titles shipped to the browser (client work under NDA). Sixteen production builds cut 23% to 76% with no assets deleted, the method written up step by step:',
      pt: 'Único engenheiro de front-end num catálogo de mais de 20 títulos comerciais publicados para o navegador (trabalho sob NDA). Dezesseis builds de produção cortados de 23% a 76% sem apagar nenhum asset, com o método escrito passo a passo:',
    },
    link: 'https://github.com/zednaked/godot-web-build-budget',
    linkText: 'godot-web-build-budget',
  },
  {
    text: {
      en: 'Felucca, firmware for a pocket synth: my ratchets shipped in release 1.0.5, credited in the notes.',
      pt: 'Felucca, firmware de um sintetizador de bolso: meus ratchets saíram na versão 1.0.5, com crédito nas notas.',
    },
    link: 'https://github.com/hugelton/Felucca/pull/100',
    linkText: 'hugelton/Felucca #100',
  },
  {
    text: {
      en: 'Sonix, a Linux DAW in Rust: reading the code, I found an unrouted plugin output growing about 384 KB a second. Fixed and credited in the commit the same day:',
      pt: 'Sonix, uma DAW de Linux em Rust: lendo o código, achei uma saída de plugin sem rota crescendo cerca de 384 KB por segundo. Corrigido e creditado no commit no mesmo dia:',
    },
    link: 'https://github.com/alexwest1981/sonix/commit/cdb2447',
    linkText: 'sonix cdb2447',
  },
];
