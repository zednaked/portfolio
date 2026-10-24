// The CODE act's opening: Cheia's terrain (the real relief of Curitiba and
// its metro area, from the flood simulator's own data) drawn as a print —
// paper, ink contours every 20 m, rivers — while the scroll raises a water
// line over it. An illustration on the same terrain, not the simulation: the
// lowest ground simply goes under first.
//
// three.js earns its place here: a 65k-vertex mesh, a camera, a material and
// a render on demand. It loads as its own chunk, only when the act comes near
// and only on a real GPU.
import {
  Group,
  LinearFilter,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Texture,
  WebGLRenderer,
} from 'three';

const SIZE = 256;
// The relief is exaggerated so a 600 m range reads at a glance.
const RELIEF = 1.3;

const VERT = /* glsl */ `
uniform float uLo;
uniform float uSpan;
varying float vH;
varying vec3 vN;
varying vec2 vUv;
void main() {
  // Back to metres from the mesh's exaggerated height.
  vH = uLo + position.y * uSpan;
  vN = normalize(normalMatrix * normal);
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const FRAG = /* glsl */ `
uniform float uLevel;
uniform sampler2D uRiver;
varying float vH;
varying vec3 vN;
varying vec2 vUv;
void main() {
  vec3 paper = vec3(0.945, 0.918, 0.847);
  vec3 ink = vec3(0.07, 0.06, 0.06);
  vec3 blue = vec3(0.114, 0.235, 0.604);
  // Hillshade from the north-west, as on a printed map.
  float shade = 0.72 + 0.38 * max(dot(vN, normalize(vec3(-0.5, 0.75, 0.45))), 0.0);
  vec3 col = paper * shade;
  // Contours: a thin line every 20 m, a heavier one every 100 m.
  float k = vH / 20.0;
  float line = 1.0 - min(abs(fract(k - 0.5) - 0.5) / fwidth(k), 1.0);
  float k5 = vH / 100.0;
  float index = 1.0 - min(abs(fract(k5 - 0.5) - 0.5) / fwidth(k5), 1.0);
  col = mix(col, ink, max(line * 0.28, index * 0.6));
  // Rivers.
  col = mix(col, blue, texture2D(uRiver, vUv).b * 0.45);
  // The water: deeper is darker, a pale line where it meets the ground.
  float depth = uLevel - vH;
  if (depth > 0.0) {
    vec3 water = mix(vec3(0.42, 0.55, 0.88), blue * 0.75, clamp(depth / 80.0, 0.0, 1.0));
    col = mix(col, water, 0.9);
    col = mix(col, vec3(0.96, 0.97, 1.0), (1.0 - smoothstep(0.0, 2.5, depth)) * 0.7);
  }
  // The map's edges dissolve into the paper instead of ending in a cut.
  vec2 e = min(vUv, 1.0 - vUv);
  float edge = smoothstep(0.0, 0.12, min(e.x, e.y));
  gl_FragColor = vec4(col * edge, edge);
}`;

export interface FloodScene {
  /** 0–1: where the scroll is in the act's opening. */
  setProgress: (p: number) => void;
  /** Moves the water line by hand, in metres, on top of what the scroll set. */
  nudge: (metres: number) => void;
  destroy: () => void;
}

export interface FloodReadout {
  level: number;
  /** Share of the mapped area below the water line, 0–1. */
  under: number;
}

async function loadTerrain(src: string) {
  const img = new Image();
  img.src = src;
  await img.decode();
  const c = document.createElement('canvas');
  c.width = c.height = SIZE;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('no 2D context');
  ctx.drawImage(img, 0, 0);
  const px = ctx.getImageData(0, 0, SIZE, SIZE).data;
  // Height is 16 bits across red and green, scaled to the range in the meta.
  const unit = new Float32Array(SIZE * SIZE);
  for (let i = 0; i < unit.length; i++) unit[i] = (px[i * 4] * 256 + px[i * 4 + 1]) / 65535;
  return { img, unit };
}

export async function createFloodScene(
  canvas: HTMLCanvasElement,
  src: string,
  range: { lo: number; hi: number; from: number; to: number },
  onReadout: (r: FloodReadout) => void,
): Promise<FloodScene> {
  const { img, unit } = await loadTerrain(src);
  // A histogram in 1 m steps, summed once: the share under any water line is
  // a lookup (a sort of 65k heights was a long task on load).
  const span = Math.ceil(range.hi - range.lo) + 1;
  const below = new Float32Array(span + 1);
  for (const u of unit) below[Math.floor(u * (range.hi - range.lo)) + 1] += 1;
  for (let m = 1; m <= span; m++) below[m] += below[m - 1];
  const total = unit.length;

  // Transparent around the map: the page's own paper and grain show through,
  // so the act's card hands over to the terrain with no seam.
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);

  const geo = new PlaneGeometry(10, 10, SIZE - 1, SIZE - 1);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.getAttribute('position');
  for (let i = 0; i < pos.count; i++) pos.setY(i, unit[i] * RELIEF);
  geo.computeVertexNormals();

  const river = new Texture(img);
  river.minFilter = LinearFilter;
  river.magFilter = LinearFilter;
  river.needsUpdate = true;
  const mat = new ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    uniforms: {
      uLevel: { value: range.from },
      uRiver: { value: river },
      uLo: { value: range.lo },
      uSpan: { value: (range.hi - range.lo) / RELIEF },
    },
  });

  const scene = new Scene();
  const group = new Group();
  group.add(new Mesh(geo, mat));
  scene.add(group);
  const camera = new PerspectiveCamera(32, 1, 0.1, 100);

  let progress = 0;
  let offset = 0;
  let portrait = false;
  const render = () => {
    // Front-loaded: the first scroll already floods the valley floors.
    const ease = 1 - (1 - progress) ** 2;
    // The hand's offset rides on the scroll's level, kept on the map.
    const level = Math.max(range.lo + 2, Math.min(range.hi - 40, range.from + (range.to - range.from) * ease + offset));
    mat.uniforms.uLevel.value = level;
    // The camera turns a little and comes down over the city as the water rises.
    group.rotation.y = -0.6 + ease * 1.1;
    // On a tall screen the text sits low, so the map is seen from higher up
    // and fills the top of the screen.
    if (portrait) {
      camera.position.set(0, 12.5 - ease * 2, 4.5 - ease * 1.2);
      camera.lookAt(0, 0, 2.6);
    } else {
      // From the whole region down toward the valley floors as they fill.
      camera.position.set(0, 7.4 - ease * 3.6, 9.6 - ease * 4.2);
      camera.lookAt(0, 0.2 - ease * 0.3, 0.6 * ease);
    }
    renderer.render(scene, camera);
    const m = Math.max(0, Math.min(span, Math.floor(level - range.lo)));
    onReadout({ level, under: below[m] / total });
  };

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    portrait = w / h < 1;
    camera.fov = portrait ? 50 : 32;
    camera.updateProjectionMatrix();
    render();
  };
  // Shaders compile off the first frame where the driver allows it.
  await renderer.compileAsync(scene, camera);
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  return {
    setProgress: (p) => {
      progress = p;
      render();
    },
    nudge: (metres) => {
      offset = Math.max(-200, Math.min(200, offset + metres));
      render();
    },
    destroy: () => {
      ro.disconnect();
      geo.dispose();
      mat.dispose();
      river.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
