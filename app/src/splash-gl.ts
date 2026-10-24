// The opening splash as wet paint, in plain WebGL: one quad, one texture, one
// fragment shader. three.js would be ~120 KB gzip for a single quad, so the
// scene graph stays where it earns its weight (the flood simulator).
//
// - Reveal: the paint is thrown from the top-left corner, its front broken by
//   noise, with a darker wet rim where it lands.
// - Sheen: a faint glint over the paint that follows the pointer (and drifts
//   on its own on touch screens), so the paint reads as still wet.
// - Drips: thin runs creep down from the edges over the first seconds.
// - Smear: moving the pointer drags the paint a little; it settles back.
//
// Returns null when WebGL isn't there; the CSS splash stays in that case.

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
  float cols = uAspect * 260.0;
  float cx = floor(uv.x * cols);
  float run = step(0.9, hash(vec2(cx, 3.1))) * (0.012 + 0.045 * hash(vec2(cx, 8.7))) * smoothstep(1.2, 14.0, uTime);
  if (run > 0.0) {
    float w = 1.0 - smoothstep(0.12, 0.38, abs(fract(uv.x * cols) - 0.5));
    for (int k = 1; k <= 4; k++) {
      float s = float(k) / 4.0;
      vec4 up = texture2D(uTex, uv - vec2(0.0, run * s));
      float da = up.a * w * (1.0 - 0.55 * s);
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

  // Wet sheen: bristle marks along the throw (fine streaks on the diagonal),
  // caught by a small light that follows the pointer.
  vec2 dir = normalize(vec2(1.0, 0.6));
  vec2 q = vec2(dot(uv * vec2(uAspect, 1.0), dir), dot(uv * vec2(uAspect, 1.0), vec2(-dir.y, dir.x))) * vec2(5.0, 140.0);
  float h = noise(q) + 0.5 * noise(q * 2.1 + 5.0);
  float e = 0.08;
  vec2 g = vec2(noise(q + vec2(e, 0.0)) - noise(q), noise(q + vec2(0.0, e)) - noise(q)) / e;
  vec3 n = normalize(vec3(-g * 0.035, 1.0));
  vec2 lp = (uLight - uv) * vec2(uAspect, 1.0);
  vec3 l = normalize(vec3(lp, 0.25));
  float spec = pow(max(dot(reflect(-l, n), vec3(0.0, 0.0, 1.0)), 0.0), 60.0);
  float near = exp(-dot(lp, lp) / 0.02);
  c.rgb += spec * near * 0.14 * (0.6 + 0.4 * h);

  float a = c.a * m;
  gl_FragColor = vec4(c.rgb * a, a);
}`;

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
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
  if (/swiftshader|llvmpipe|software/i.test(renderer)) return null;
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  const prog = gl.createProgram();
  if (!vs || !fs) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
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

  // Drawn at CSS pixels at most (the paint is soft; a 2× buffer of a canvas
  // taller than the screen would cost far more than it shows).
  const resize = () => {
    const r = host.getBoundingClientRect();
    const scale = Math.min(1, window.devicePixelRatio || 1) * (matchMedia('(pointer: coarse)').matches ? 0.75 : 1);
    canvas.width = Math.max(1, Math.round(r.width * scale));
    canvas.height = Math.max(1, Math.round(r.height * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform1f(uAspect, r.width / Math.max(1, r.height));
  };
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

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

  const onLost = (e: Event) => {
    e.preventDefault();
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
    if (reveal.value < 1 || t < 15 || now - lastMove < 1500) loop();
  };
  const loop = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };

  return {
    reveal,
    destroy: () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVis);
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.remove();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
