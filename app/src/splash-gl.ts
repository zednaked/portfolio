// The opening splash as wet paint, in plain WebGL: one quad, one texture, one
// fragment shader. three.js would be ~120 KB gzip for a single quad, so the
// scene graph stays where it earns its weight (the flood simulator).
//
// - Reveal: the paint is thrown from the top-left corner, its front broken by
//   noise, with a darker wet rim where it lands.
// - Body: the paint is lit as paint: its edges and drops are ridges (taken
//   from the image itself), brush marks radiate from the corner it was thrown
//   from, and a glint follows the pointer (drifting on touch screens).
// - Drips: thin runs creep down from the edges over the first seconds.
// - Smear: moving the pointer drags the paint a little; it settles back.
//
// Returns null when WebGL isn't there; the CSS splash stays in that case.

import { isSoftware } from './gpu';

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform float uAspect, uTime, uReveal, uSmear;
uniform vec2 uPointer, uVel, uLight;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  return 0.5 * noise(p) + 0.3 * noise(p * 2.03 + 11.0) + 0.2 * noise(p * 4.01 + 23.0);
}

void main() {
  vec2 uv = vUv;

  // Smear: the paint under the pointer is dragged along its motion.
  vec2 d = (uv - uPointer) * vec2(uAspect, 1.0);
  uv -= uVel * exp(-dot(d, d) / 0.006) * uSmear;
  // A slow flow, so the paint never sits perfectly still.
  uv += (vec2(fbm(uv * 4.0 + uTime * 0.04), fbm(uv * 4.0 + 7.0 - uTime * 0.03)) - 0.5) * 0.004;

  vec4 c = texture2D(uTex, uv);

  // Drips: in a few thin columns, paint creeps down from every edge over the
  // first seconds, thinning as it runs.
  float cols = uAspect * 120.0;
  float cx = floor(uv.x * cols);
  float run = step(0.92, hash(vec2(cx, 3.1))) * (0.012 + 0.035 * hash(vec2(cx, 8.7))) * smoothstep(1.2, 7.0, uTime);
  if (run > 0.0) {
    float off = abs(fract(uv.x * cols) - 0.5);
    // Twelve steps: fewer leave a run dashed or stepped instead of smooth.
    for (int k = 1; k <= 12; k++) {
      float s = float(k) / 12.0;
      // Solid paint that narrows as it runs (thinning by transparency would
      // band at each step).
      float w = 1.0 - smoothstep(0.08 + 0.22 * (1.0 - s), 0.14 + 0.24 * (1.0 - s), off);
      vec4 up = texture2D(uTex, uv - vec2(0.0, run * s));
      // Only paint with some body runs: solid, and solid a little higher up
      // too, so specks and small drops stay put.
      float body = texture2D(uTex, uv - vec2(0.0, run * s + 0.012)).a;
      float da = smoothstep(0.6, 0.95, up.a) * smoothstep(0.6, 0.95, body) * w;
      if (da > c.a) c = vec4(up.rgb, da);
    }
  }

  // Reveal from the top-left corner, the front broken by noise.
  float r = length(vUv * vec2(uAspect, 1.0)) / length(vec2(uAspect, 1.0));
  r += (fbm(vUv * 7.0) - 0.5) * 0.22;
  float front = uReveal * 1.3 - 0.1;
  float m = smoothstep(front, front - 0.015, r);
  float rim = smoothstep(front - 0.07, front - 0.01, r) * m * (1.0 - smoothstep(0.95, 1.0, uReveal));
  c.rgb *= 1.0 - rim * 0.4;

  // Body: the paint's thickness comes from the image itself (where there is
  // paint, softened, so every edge and drop is a ridge) plus brush marks
  // radiating from the corner it was thrown from. A fixed key light from the
  // top-left models it; a small glint follows the pointer.
  vec2 tx = vec2(2.0 / 1200.0, 2.0 / 1417.0);
  float hc = texture2D(uTex, uv).a;
  float hx = texture2D(uTex, uv + vec2(tx.x, 0.0)).a;
  float hy = texture2D(uTex, uv + vec2(0.0, tx.y)).a;
  vec2 p = uv * vec2(uAspect, 1.0);
  vec2 polar = vec2(length(p) * 9.0, atan(p.y, p.x) * 160.0);
  float b0 = noise(polar);
  vec2 bg = vec2(noise(polar + vec2(0.0, 0.6)) - b0, noise(polar + vec2(0.6, 0.0)) - b0);
  vec2 g = vec2(hx - hc, hy - hc) * 5.0 + bg * 0.5 * hc;
  vec3 n = normalize(vec3(-g, 1.0));
  c.rgb *= 0.9 + 0.22 * dot(n, normalize(vec3(-0.5, -0.6, 0.65)));
  vec2 lp = (uLight - uv) * vec2(uAspect, 1.0);
  vec3 l = normalize(vec3(lp, 0.3));
  float spec = pow(max(dot(reflect(-l, n), vec3(0.0, 0.0, 1.0)), 0.0), 40.0);
  c.rgb += spec * exp(-dot(lp, lp) / 0.03) * 0.3 * hc;

  float a = c.a * m;
  gl_FragColor = vec4(c.rgb * a, a);
}`;

const TEX_WIDTH = 1200;

export interface SplashGL {
  /** 0 → nothing painted, 1 → the whole splash. */
  reveal: { value: number };
  destroy: () => void;
}

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
}

export function createSplashGL(
  host: HTMLElement,
  src: string,
  onReady: () => void,
  onFail: () => void,
): SplashGL | null {
  const canvas = document.createElement('canvas');
  canvas.className = 'splash-gl';
  canvas.setAttribute('aria-hidden', 'true');
  // No GPU, no shader: a software renderer would draw this on the CPU and
  // block the page, so it keeps the CSS splash instead.
  const gl = canvas.getContext('webgl', {
    premultipliedAlpha: true,
    antialias: false,
    alpha: true,
    failIfMajorPerformanceCaveat: true,
  });
  if (!gl) return null;
  // Every way out gives the context back, so a refused GPU isn't held.
  const release = () => {
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return null;
  };
  if (isSoftware(gl)) return release();
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return release();
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  // The program keeps what it needs; the shader objects can go.
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return release();
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  const u = (name: string) => gl.getUniformLocation(prog, name);
  const uAspect = u('uAspect');
  const uTime = u('uTime');
  const uReveal = u('uReveal');
  const uSmear = u('uSmear');
  const uPointer = u('uPointer');
  const uVel = u('uVel');
  const uLight = u('uLight');

  const reveal = { value: 0 };
  // Pointer state in the canvas's own 0–1 space; the velocity decays so the
  // smear settles once the pointer stops.
  const pointer = { x: 0.3, y: 0.3, vx: 0, vy: 0 };
  const light = { x: 0.3, y: 0.2 };
  let pointerSeen = false;
  let lastMove = 0;
  let texReady = false;
  let visible = true;
  let raf = 0;
  const start = performance.now();

  const tex = gl.createTexture();
  const img = new Image();
  img.decoding = 'async';
  img.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    texReady = true;
    host.appendChild(canvas);
    onReady();
    loop();
  };
  img.onerror = onFail;
  img.src = src;

  // Never more pixels than the image has: the splash is 1200 px wide, so a
  // wider canvas would shade pixels that hold no new detail (on a 2560 px
  // screen that is four times the work for nothing). Phones draw at 3/4.
  const resize = () => {
    const r = host.getBoundingClientRect();
    const scale = Math.min(1, TEX_WIDTH / Math.max(1, r.width)) * (matchMedia('(pointer: coarse)').matches ? 0.75 : 1);
    canvas.width = Math.max(1, Math.round(r.width * scale));
    canvas.height = Math.max(1, Math.round(r.height * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform1f(uAspect, r.width / Math.max(1, r.height));
    // Resizing clears the buffer: draw again, even if everything was still.
    loop();
  };
  const ro = new ResizeObserver(resize);

  const onMove = (e: PointerEvent) => {
    const r = host.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    if (pointerSeen) {
      pointer.vx += (x - pointer.x) * 0.6;
      pointer.vy += (y - pointer.y) * 0.6;
    }
    pointer.x = x;
    pointer.y = y;
    pointerSeen = true;
    lastMove = performance.now();
    loop();
  };
  window.addEventListener('pointermove', onMove, { passive: true });

  // Only draw while the header is on screen and the tab is visible.
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) loop();
  });
  io.observe(host);
  const onVis = () => {
    if (!document.hidden) loop();
  };
  document.addEventListener('visibilitychange', onVis);

  // No restore: if the GPU drops the context, the CSS splash takes over.
  const onLost = () => {
    cancelAnimationFrame(raf);
    canvas.remove();
    onFail();
  };
  canvas.addEventListener('webglcontextlost', onLost);

  const frame = (now: number) => {
    raf = 0;
    if (!texReady || !visible || document.hidden) return;
    const t = (now - start) / 1000;
    // Without a pointer (touch screens), the light drifts across the paint.
    const tx = pointerSeen ? pointer.x : 0.35 + Math.cos(t * 0.35) * 0.25;
    const ty = pointerSeen ? pointer.y : 0.3 + Math.sin(t * 0.5) * 0.15;
    light.x += (tx - light.x) * 0.06;
    light.y += (ty - light.y) * 0.06;
    pointer.vx *= 0.9;
    pointer.vy *= 0.9;
    gl.uniform1f(uTime, t);
    gl.uniform1f(uReveal, reveal.value);
    gl.uniform1f(uSmear, 1);
    gl.uniform2f(uPointer, pointer.x, pointer.y);
    gl.uniform2f(uVel, Math.max(-0.08, Math.min(0.08, pointer.vx)), Math.max(-0.08, Math.min(0.08, pointer.vy)));
    gl.uniform2f(uLight, light.x, light.y);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    // Draw while something moves: the throw, the drips (first seconds), or
    // the pointer just now. Then the canvas holds its last frame for free.
    if (reveal.value < 1 || t < 8 || now - lastMove < 1500) loop();
  };
  const loop = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };
  ro.observe(host);
  resize();

  return {
    reveal,
    destroy: () => {
      img.onload = null;
      img.onerror = null;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVis);
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.remove();
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      release();
    },
  };
}
