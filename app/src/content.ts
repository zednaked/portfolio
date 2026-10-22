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
    en: 'Thiago Gonçalves: painting and illustration',
    pt: 'Thiago Gonçalves: pintura e ilustração',
  },
  skip: { en: 'Skip to the work', pt: 'Pular para os trabalhos' },
  role: {
    en: '2D ARTIST + 2D ANIMATOR + GAMEDEV + SOUND DESIGNER',
    pt: 'ARTISTA 2D + ANIMADOR 2D + GAMEDEV + SOUND DESIGNER',
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
