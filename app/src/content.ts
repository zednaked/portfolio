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
  tagline: {
    en: 'I build interactive things for the browser, and I measure them.',
    pt: 'Construo coisas interativas para o navegador, e meço cada uma.',
  },
  jump: { en: 'Jump to', pt: 'Ir para' },
  jumpPaint: { en: 'Painting', pt: 'Pintura' },
  jumpPlay: { en: 'Games', pt: 'Jogos' },
  jumpCode: { en: 'Code', pt: 'Código' },
  jumpCredits: { en: 'Credited by other projects', pt: 'Creditado por outros projetos' },
  aboutLabel: { en: 'About me', pt: 'Sobre mim' },
  about: {
    en: 'I learned oil painting through the classical method, and the first portraits below are oil on canvas. Then I moved to digital painting on the iPad, where the illustration, character design and game art that follow were made. I am also a gardener and a beekeeper.',
    pt: 'Aprendi pintura a óleo pelo método clássico, e os primeiros retratos abaixo são óleo sobre tela. Depois passei para a pintura digital no iPad, onde foram feitos a ilustração, o character design e a arte de jogos que vêm em seguida. Também sou jardineiro e apicultor.',
  },
  portraitAlt: {
    en: 'Portrait of Thiago Gonçalves, long dark hair and beard, plaid shirt, holding paintbrushes.',
    pt: 'Retrato de Thiago Gonçalves, cabelo comprido escuro e barba, camisa xadrez, segurando pincéis.',
  },
  awardYear: { en: '2015 · Carrousel du Louvre, Paris', pt: '2015 · Carrousel du Louvre, Paris' },
  award: {
    en: 'Gold medal for an oil painting at the Artcom Expo International exhibition, Carrousel du Louvre, October 2015.',
    pt: 'Medalha de ouro com uma pintura a óleo na exposição Artcom Expo International, no Carrousel du Louvre, em outubro de 2015.',
  },
  showYear: { en: '2021 · Curitiba', pt: '2021 · Curitiba' },
  show: {
    en: 'Kleshas, a virtual exhibition backed by Fundação Cultural de Curitiba through its arts patronage program.',
    pt: 'Kleshas, exposição virtual apoiada pela Fundação Cultural de Curitiba por meio do mecenato.',
  },
  workLabel: { en: 'Work', pt: 'Trabalhos' },
  open: { en: 'View larger', pt: 'Ver maior' },
  close: { en: 'Close', pt: 'Fechar' },
  motionDown: { en: 'Turn motion down', pt: 'Reduzir o movimento' },
  motionUp: { en: 'Turn full motion on', pt: 'Ligar o movimento completo' },
  colophon: {
    en: 'This page and the reel share one language: Bauhaus shapes, paper, halftone, grain. React, TypeScript and GSAP; gentler motion when your system asks for it, full motion one tap away.',
    pt: 'Esta página e o reel falam a mesma língua: formas Bauhaus, papel, retícula, grão. React, TypeScript e GSAP; movimento mais suave quando o sistema pede, o completo a um toque.',
  },
} satisfies Record<string, Text>;

const base = import.meta.env.BASE_URL;

export const artworks: Artwork[] = [
  {
    id: 'pirate',
    src: `${base}img/oil-pirate-medal.webp`,
    width: 900,
    height: 1011,
    title: { en: 'Portrait of a pirate, gold medal', pt: 'Retrato de um pirata, medalha de ouro' },
    caption: {
      en: 'Oil on canvas. Gold medal at the Artcom Expo International exhibition, Carrousel du Louvre, Paris, 2015.',
      pt: 'Óleo sobre tela. Medalha de ouro na exposição Artcom Expo International, Carrousel du Louvre, Paris, 2015.',
    },
    alt: {
      en: 'Oil portrait of a pirate in a wide hat, red coat and long braided beard, in an ornate gilded frame with a gold medal hanging from a red and blue ribbon.',
      pt: 'Retrato a óleo de um pirata de chapéu largo, casaco vermelho e barba longa trançada, numa moldura dourada ornamentada, com uma medalha de ouro pendurada numa fita vermelha e azul.',
    },
  },
  {
    id: 'elder',
    src: `${base}img/oil-elder.webp`,
    width: 760,
    height: 1081,
    title: { en: 'Old man in a turban', pt: 'Ancião de turbante' },
    caption: { en: 'Oil on canvas.', pt: 'Óleo sobre tela.' },
    alt: {
      en: 'Oil portrait of an old man with a long white beard and a striped turban, looking straight ahead, his shoulders left in loose red strokes that run down the canvas.',
      pt: 'Retrato a óleo de um ancião de longa barba branca e turbante listrado, olhando de frente, com os ombros em pinceladas soltas de vermelho que escorrem pela tela.',
    },
  },
  {
    id: 'headscarf',
    src: `${base}img/oil-headscarf.webp`,
    width: 760,
    height: 1135,
    title: { en: 'Man in a white headscarf', pt: 'Homem de lenço branco' },
    caption: { en: 'Oil on canvas.', pt: 'Óleo sobre tela.' },
    alt: {
      en: 'Oil portrait of a bearded man in three-quarter view wearing a white headscarf held by an orange band, against loose green brushwork.',
      pt: 'Retrato a óleo de um homem barbado em três quartos, com lenço branco preso por uma faixa laranja, sobre pinceladas soltas de verde.',
    },
  },
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
  compact?: boolean;
  liveLabel?: Text;
  /** A short muted loop; `img` is its poster and the reduced-motion still. */
  video?: string;
  title: Text;
  what: Text;
  role: Text;
  tech: string[];
  stats: Stat[];
  note?: Text;
  alt: Text;
  live: string;
  code?: string;
  /** The case told as a decision: why it exists, the call made, what it cost. */
  story?: Story;
}

export interface Story {
  why: Text;
  decision: Text;
  tradeoff: Text;
}

export const webUi = {
  label: { en: 'Interactive web', pt: 'Web interativa' },
  intro: {
    en: 'Things I built for the browser and the desktop, each with the number I measured on it.',
    pt: 'Coisas que construí para o navegador e para a área de trabalho, cada uma com o número que medi nela.',
  },
  role: { en: 'My role', pt: 'Meu papel' },
  live: { en: 'Open it live', pt: 'Abrir no ar' },
  code: { en: 'Code', pt: 'Código' },
  tech: { en: 'Technologies', pt: 'Tecnologias' },
  pauseClip: { en: 'Pause clip', pt: 'Pausar vídeo' },
  playClip: { en: 'Play clip', pt: 'Tocar vídeo' },
  why: { en: 'Why', pt: 'Por quê' },
  decision: { en: 'The call', pt: 'A decisão' },
  tradeoff: { en: 'What it cost', pt: 'O custo' },
  figma: { en: 'Layout in Figma', pt: 'Layout no Figma' },
  pageLabel: { en: 'This page', pt: 'Esta página' },
  page: {
    en: 'React, TypeScript and GSAP (ScrollTrigger, Flip): chapter cards that collapse into their shape as you scroll, a strip that runs sideways, media that lean with your scroll speed. Every push runs lint, types, unit tests and end-to-end tests with axe before it deploys. Lighthouse on the live site, median of three runs:',
    pt: 'React, TypeScript e GSAP (ScrollTrigger, Flip): cartelas que encolhem na própria forma conforme a rolagem, uma tira que corre de lado, imagens que inclinam com a velocidade. Cada envio passa por lint, tipos, testes de unidade e de ponta a ponta com axe antes de publicar. Lighthouse no site no ar, mediana de três rodadas:',
  },
  pageA11y: {
    en: 'When the system asks for reduced motion, which many phones do in battery saver, the page switches to fades with no travel; the Motion button at the top, next to the language, turns the full version back on, and remembers. The viewer opens from the painting, closes with Escape or a click outside, and puts the focus back where it was. Alt text in both languages.',
    pt: 'Quando o sistema pede movimento reduzido, como muitos celulares fazem na economia de bateria, a página passa a usar fades, sem deslocamento; o botão Motion no topo, ao lado do idioma, liga a versão completa de novo, e lembra. O visualizador abre a partir da pintura, fecha com Esc ou com um clique fora e devolve o foco para onde estava. Texto alternativo nas duas línguas.',
  },
  proofLabel: { en: 'Shipped and credited', pt: 'Entregue e creditado' },
} satisfies Record<string, Text>;

export const pageStory: Story = {
  why: {
    en: 'To show painting, games and code as one practice, not three CVs.',
    pt: 'Mostrar pintura, jogos e código como uma prática só, não três currículos.',
  },
  decision: {
    en: 'The layout and its system were designed in Figma; the motion language (Bauhaus shapes, grain, chapter cards) was designed in code for the reel, frame by frame, then brought here. The magenta of the first layout became the accent of the second.',
    pt: 'O layout e o sistema foram desenhados no Figma; a linguagem de movimento (formas Bauhaus, grão, cartelas) nasceu em código para o reel, quadro a quadro, e depois veio para cá. O magenta do primeiro layout virou o acento do segundo.',
  },
  tradeoff: {
    en: 'Motion against reading. The chapter card collapses while the act rises under it, paced so the shape uncovers the first lines and is gone before they reach the top; below the fold, motion is built when the main thread is free, so it never delays the first paint.',
    pt: 'Movimento contra leitura. A cartela encolhe enquanto o ato sobe por baixo, no ritmo certo para a forma descobrir as primeiras linhas e sumir antes de elas chegarem ao topo; abaixo da dobra, o movimento é montado quando a thread principal está livre, então nunca atrasa a primeira pintura.',
  },
};

export const figmaUrl = 'https://www.figma.com/design/cEitlqrX5FkFCsqS7GZ4G0/Portfolio';

export const pageStats: Stat[] = [
  { value: 100, unit: '', label: { en: 'Lighthouse performance, desktop', pt: 'Lighthouse performance, desktop' } },
  { value: 0.67, decimals: 2, unit: ' s', label: { en: 'largest paint, desktop', pt: 'maior pintura, desktop' } },
  {
    value: 0,
    unit: '',
    label: { en: 'layout shift, desktop and phone', pt: 'deslocamento de layout, desktop e celular' },
  },
  {
    value: 26,
    unit: '',
    label: { en: 'unit and end-to-end tests, axe included', pt: 'testes de unidade e de ponta a ponta, com axe' },
  },
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
      {
        value: 2.4,
        decimals: 1,
        unit: ' M',
        label: { en: 'water cells, one shader pass per step', pt: 'células de água, uma passada de shader por passo' },
      },
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
    story: {
      why: {
        en: 'To help people here: when heavy rain comes, see where the water goes and when it passes 30 cm on your street.',
        pt: 'Ajudar quem mora aqui: quando vem chuva forte, ver para onde a água vai e quando passa de 30 cm na sua rua.',
      },
      decision: {
        en: 'Open data and a research-grade model, all in the tab: SRTM terrain, OpenStreetMap rivers and streets, and the local inertial shallow-water scheme used in LISFLOOD-FP, one fragment shader per step. No server, no account.',
        pt: 'Dados abertos e um modelo de pesquisa, tudo na aba: relevo SRTM, rios e ruas do OpenStreetMap e o esquema de água rasa inercial usado no LISFLOOD-FP, um fragment shader por passo. Sem servidor, sem conta.',
      },
      tradeoff: {
        en: 'SRTM measures treetops and roofs, so the terrain was full of false dams. I burned the OpenStreetMap rivers into it, breached the false dams and filled the rest with priority-flood, so the water goes where water goes. 30 m terrain still can’t see a culvert, and the page says so.',
        pt: 'O SRTM mede copa de árvore e telhado, então o relevo estava cheio de barragens falsas. Queimei os rios do OpenStreetMap nele, rompi as barragens falsas e preenchi o resto com priority-flood, para a água ir aonde a água vai. Um relevo de 30 m ainda não enxerga um bueiro, e a página diz isso.',
      },
    },
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
    role: {
      en: 'Author of the firmware fork and of the web studio.',
      pt: 'Autor do fork do firmware e do estúdio web.',
    },
    tech: ['WebAssembly', 'AudioWorklet', 'Web MIDI', 'Canvas'],
    stats: [
      {
        value: 13,
        unit: '',
        label: {
          en: 'synth engines, the same code as the hardware',
          pt: 'motores de síntese, o mesmo código do hardware',
        },
      },
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
    compact: true,
    title: { en: 'A playable ad under the network cap', pt: 'Um anúncio jogável abaixo do teto da rede' },
    what: {
      en: 'One mechanic as a single self-contained HTML file, with every byte accounted for. Stubbing the WebGPU and Canvas renderers out of the bundle cut 66 KB with no change to the game.',
      pt: 'Uma mecânica num único arquivo HTML autocontido, com cada byte contabilizado. Tirar os renderizadores WebGPU e Canvas do bundle cortou 66 KB sem mudar nada no jogo.',
    },
    role: { en: 'Alone: game, build tooling, measurement.', pt: 'Sozinho: jogo, ferramenta de build, medição.' },
    tech: ['PixiJS v8', 'WebGL', 'esbuild'],
    stats: [
      { value: 630, unit: ' KB', label: { en: 'the whole ad, one file', pt: 'o anúncio inteiro, um arquivo' } },
      {
        value: 30.8,
        decimals: 1,
        unit: '%',
        label: { en: 'of the 2 MB cap Meta allows', pt: 'do teto de 2 MB da Meta' },
      },
    ],
    alt: {
      en: 'The playable ad mid-game: a brown bunny between floating grass platforms, gold coins, a 4 of 5 coin counter and the hint Hold left or right to steer.',
      pt: 'O anúncio jogável no meio da partida: um coelho marrom entre plataformas de grama flutuantes, moedas douradas, o contador 4 de 5 e a dica Hold left or right to steer.',
    },
    live: 'https://zednaked.github.io/playable-budget/',
    code: 'https://github.com/zednaked/playable-budget',
  },
];

// Small worlds that live in the Omarchy desktop shell: QML, JavaScript, GLSL.
export const deskWork: WebPiece[] = [
  {
    id: 'shanshui',
    img: `${base}img/desk-shanshui.webp`,
    video: `${base}video/shanshui.mp4`,
    width: 640,
    height: 360,
    compact: true,
    title: {
      en: 'Shan Shui, a landscape painted on the desktop',
      pt: 'Shan Shui, uma paisagem pintada na área de trabalho',
    },
    what: {
      en: "An endless Chinese landscape scroll, painted stroke by stroke across the desktop in the colours of the active theme. The mountains are LingDong-'s Shan Shui; the painting front, the shader and the shell plugin are mine.",
      pt: 'Um rolo de paisagem chinesa sem fim, pintado traço a traço pela área de trabalho nas cores do tema ativo. As montanhas são o Shan Shui de LingDong-; a frente de pintura, o shader e o plugin do shell são meus.',
    },
    role: { en: 'Author of the plugin.', pt: 'Autor do plugin.' },
    tech: ['QML', 'JavaScript', 'GLSL'],
    stats: [
      {
        value: 1,
        unit: '',
        label: {
          en: 'small shader on screen, two numbers compared per pixel',
          pt: 'shader pequeno na tela, dois números comparados por pixel',
        },
      },
      {
        value: 0,
        unit: ' CPU',
        label: { en: 'when paused or under a fullscreen window', pt: 'pausado ou sob janela em tela cheia' },
      },
    ],
    alt: {
      en: 'Shan Shui on a dark desktop: crimson ink mountains, trees and a pagoda drawn in fine strokes under the system bar.',
      pt: 'Shan Shui numa área de trabalho escura: montanhas, árvores e um pagode em traços finos de tinta carmim, sob a barra do sistema.',
    },
    live: 'https://github.com/zednaked/omarchy-shanshui',
    liveLabel: { en: 'See it on GitHub', pt: 'Ver no GitHub' },
  },
  {
    id: 'omahold',
    img: `${base}img/desk-omahold.webp`,
    video: `${base}video/omahold.mp4`,
    width: 500,
    height: 300,
    compact: true,
    title: { en: 'Omahold, a dwarven hold inside the shell', pt: 'Omahold, um forte de anões dentro do shell' },
    what: {
      en: 'Seven dwarves with hunger, thirst, sleep, mood and trades dig, farm and brew in a world that keeps ticking while you work, drawn in the colours of the active theme.',
      pt: 'Sete anões com fome, sede, sono, humor e ofícios cavam, plantam e fermentam num mundo que continua andando enquanto você trabalha, desenhado nas cores do tema ativo.',
    },
    role: { en: 'Alone: simulation and interface.', pt: 'Sozinho: simulação e interface.' },
    tech: ['QML', 'JavaScript'],
    stats: [
      { value: 48, unit: '×30', label: { en: 'cells, 8 levels of depth', pt: 'células, 8 níveis de profundidade' } },
      {
        value: 4,
        unit: '/s',
        label: {
          en: 'ticks with the panel open; nothing drawn when it is not visible',
          pt: 'ticks com o painel aberto; nada desenhado quando não está visível',
        },
      },
    ],
    alt: {
      en: 'Omahold: a top-down pixel map of rooms carved out of rose-coloured rock, with dwarves as letters and a log of events below.',
      pt: 'Omahold: um mapa em pixel visto de cima, com salas escavadas em rocha cor-de-rosa, anões como letras e um registro de eventos embaixo.',
    },
    live: 'https://github.com/zednaked/omahold',
    liveLabel: { en: 'See it on GitHub', pt: 'Ver no GitHub' },
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
      en: 'Felucca 1.6.1 runs on both cores of the synth: the split between cores, the measurements and the hardening come from my Jangada firmware, credited in the release and in the code.',
      pt: 'O Felucca 1.6.1 roda nos dois núcleos do sintetizador: a divisão entre os núcleos, as medições e o reforço vêm do meu firmware Jangada, com crédito no release e no código.',
    },
    link: 'https://github.com/hugelton/Felucca/releases/tag/v1.6.1',
    linkText: 'Felucca v1.6.1',
  },
  {
    text: {
      en: 'X0X, another firmware for the same synth: my measurements of units whose second core misreads memory, and three fixes, shipped in releases 1.0.4 and 1.0.7, thanked by name.',
      pt: 'X0X, outro firmware para o mesmo sintetizador: minhas medições de unidades em que o segundo núcleo lê a memória errado, e três correções, saíram nas versões 1.0.4 e 1.0.7, com agradecimento pelo nome.',
    },
    link: 'https://github.com/charlesvestal/fm1-x0x/issues/10',
    linkText: 'charlesvestal/fm1-x0x #10',
  },
  {
    text: {
      en: 'Audible Field, a web audio piece: after my measurement the author moved its audio to mono Opus, about 90% less audio transferred (32.6 to 1.86 MB), and wrote it up crediting me by name.',
      pt: 'Audible Field, uma obra de áudio na web: depois da minha medição o autor passou o áudio para Opus mono, cerca de 90% menos áudio transferido (32,6 para 1,86 MB), e publicou o resultado com o meu nome.',
    },
    link: 'https://www.linkedin.com/feed/update/urn:li:activity:7515588700316110848/',
    linkText: 'Gary Boodhoo on LinkedIn',
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

const play: Text = { en: 'Play it', pt: 'Jogar' };

export const gamesUi = {
  label: { en: 'Games', pt: 'Jogos' },
  intro: {
    en: 'Games I made on my own. Most of my game work is client work under NDA; these are the ones I can show.',
    pt: 'Jogos que fiz por conta própria. A maior parte do meu trabalho com jogos é para cliente, sob NDA; estes são os que posso mostrar.',
  },
} satisfies Record<string, Text>;

export const games: WebPiece[] = [
  {
    id: 'ciberteia',
    img: `${base}img/game-ciberteia.webp`,
    width: 800,
    height: 450,
    liveLabel: play,
    title: {
      en: 'Ciberteia, a multiplayer cyberpunk text RPG',
      pt: 'Ciberteia, um RPG de texto cyberpunk multiplayer',
    },
    what: {
      en: 'Explore districts, jack into cyberspace, steal credits from other players. When someone takes down the Chrome Dragon, everyone goes back to level 1. Every rule runs on the server; the Godot client only draws the state and sends what the player wants to do.',
      pt: 'Explore distritos, invada o ciberespaço, roube créditos de outros jogadores. Quando alguém derruba o Chrome Dragon, todos voltam ao nível 1. Toda regra roda no servidor; o cliente Godot só desenha o estado e envia o que o jogador quer fazer.',
    },
    role: {
      en: 'Alone: design, writing, the Godot client, the Cloudflare server, the synthesized audio.',
      pt: 'Sozinho: design, texto, o cliente Godot, o servidor na Cloudflare, o áudio sintetizado.',
    },
    tech: ['Godot 4.7 web', 'Shaders', 'TypeScript', 'Cloudflare Workers', 'Durable Objects', 'D1', 'WebSocket'],
    stats: [
      {
        value: 0,
        unit: '',
        label: {
          en: 'art files: every visual is shaders, type and text',
          pt: 'arquivos de arte: todo o visual é shader, tipografia e texto',
        },
      },
      {
        value: 14,
        unit: '',
        label: { en: 'sounds, all synthesized by a script', pt: 'sons, todos sintetizados por script' },
      },
      {
        value: 720,
        unit: ' → 1',
        label: {
          en: 'requests per player-hour: polling every 5 s vs a hibernating WebSocket',
          pt: 'requisições por jogador por hora: polling a cada 5 s contra WebSocket com hibernação',
        },
      },
      {
        value: 0,
        unit: ' USD',
        label: { en: 'a month, on the Cloudflare free tier', pt: 'por mês, no plano gratuito da Cloudflare' },
      },
    ],
    note: { en: 'In Portuguese. The source is private.', pt: 'Em português. O código é privado.' },
    alt: {
      en: "Ciberteia in play: a green-on-black terminal interface with a CRT glow and colour fringing over a neon grid, showing the district Arcologia Flutuante, its locations and the player's health and experience bars.",
      pt: 'Ciberteia em jogo: uma interface de terminal verde sobre preto, com brilho de CRT e franjas de cor sobre uma grade neon, mostrando o distrito Arcologia Flutuante, seus locais e as barras de vida e experiência do jogador.',
    },
    live: 'https://ciberteia-api.zednaked.workers.dev/',
    story: {
      why: { en: 'A game I always wanted to make.', pt: 'Um jogo que eu sempre quis fazer.' },
      decision: {
        en: 'The roguelike tradition, worlds made of type: every visual is shaders and typography, no art files at all, and every rule runs on the server.',
        pt: 'A tradição roguelike, mundos feitos de tipografia: todo o visual é shader e tipografia, nenhum arquivo de arte, e toda regra roda no servidor.',
      },
      tradeoff: {
        en: 'With no images, every beat (danger, reward, a city changing) has to land through words, rhythm and effects alone, so the story is told several ways at once.',
        pt: 'Sem imagens, cada momento (perigo, recompensa, uma cidade mudando) tem que acontecer só com palavras, ritmo e efeitos, então a história é contada de vários jeitos ao mesmo tempo.',
      },
    },
  },
  {
    id: 'reidaboca',
    img: `${base}img/game-reidaboca.webp`,
    video: `${base}video/game-reidaboca.mp4`,
    width: 800,
    height: 450,
    compact: true,
    liveLabel: { en: 'See it on itch', pt: 'Ver no itch' },
    title: { en: 'O Rei da Boca, a tactical FPS', pt: 'O Rei da Boca, um FPS tático' },
    what: {
      en: 'First-person base defence with a day and night cycle: by day you tend the crops, repair the base and hire guards; by night the waves come. Destroy the rival base before it destroys yours.',
      pt: 'Defesa de base em primeira pessoa com ciclo de dia e noite: de dia você cuida das plantas, repara a base e contrata seguranças; de noite vêm as ondas. Destrua a base rival antes que ela destrua a sua.',
    },
    role: { en: 'My own game: design and code.', pt: 'Jogo meu: design e código.' },
    tech: ['Godot 4', '3D', 'FPS'],
    stats: [],
    alt: {
      en: 'O Rei da Boca in first person: a hand holding a pistol in a sunlit courtyard, with the base menu open over a workbench.',
      pt: 'O Rei da Boca em primeira pessoa: uma mão segurando uma pistola num pátio ensolarado, com o menu da base aberto sobre uma bancada.',
    },
    live: 'https://zedcave.itch.io/o-rei-da-boca',
  },
  {
    id: 'rinha',
    img: `${base}img/game-rinha.webp`,
    video: `${base}video/game-rinha.mp4`,
    width: 800,
    height: 450,
    compact: true,
    liveLabel: play,
    title: { en: 'Rinha, a tactical RTS', pt: 'Rinha, um RTS tático' },
    what: {
      en: 'Real-time strategy in the browser. Here, four AI players on Hard, watched in spectator mode.',
      pt: 'Estratégia em tempo real no navegador. Aqui, quatro IAs no modo difícil, vistas no modo espectador.',
    },
    role: { en: 'My own game: design and code.', pt: 'Jogo meu: design e código.' },
    tech: ['Godot 4', 'HTML5'],
    stats: [],
    alt: {
      en: 'Rinha in spectator mode: a top-down map with a base, units in blue, a minimap in the corner and a score panel for four AI players.',
      pt: 'Rinha no modo espectador: um mapa visto de cima com uma base, unidades em azul, um minimapa no canto e o placar de quatro IAs.',
    },
    live: 'https://zedcave.itch.io/rinha',
  },
];

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

export const finaleUi = {
  role: { en: 'PAINTER + CREATIVE DEVELOPER', pt: 'PINTOR + DESENVOLVEDOR CRIATIVO' },
  remote: { en: 'Curitiba, Brazil · remote, any time zone', pt: 'Curitiba, Brasil · remoto, qualquer fuso' },
  available: { en: 'Open to remote work. Write to me:', pt: 'Disponível para trabalho remoto. Escreva:' },
  cv: { en: 'CV (PDF)', pt: 'Currículo (PDF, em inglês)' },
} satisfies Record<string, Text>;
