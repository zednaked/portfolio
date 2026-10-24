// The opening's wet paint, back on the paintings: under the pointer, light
// catches the relief of the canvas itself. Height comes from the painting's
// own light and dark (impasto reads as brightness), the light sits where the
// pointer is, and only the highlight is drawn, screened over the image.
//
// One small canvas, moved into whichever painting is under the pointer; plain
// WebGL like the splash. Loaded on the first hover, desktop only.
import { isSoftware } from './gpu';

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec4 uMap;      // where the image sits in the canvas: x, y, w, h (0-1)
uniform vec2 uPointer;  // canvas space, 0-1
uniform vec2 uTexel;
uniform float uAspect, uOn;

float lum(vec2 uv) { return dot(texture2D(uTex, uv).rgb, vec3(0.299, 0.587, 0.114)); }

void main() {
  vec2 uv = (vUv - uMap.xy) / uMap.zw;
  if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) { gl_FragColor = vec4(0.0); return; }
  float h = lum(uv);
  vec2 g = vec2(lum(uv + vec2(uTexel.x, 0.0)) - h, lum(uv + vec2(0.0, uTexel.y)) - h);
  vec3 n = normalize(vec3(-g * 6.0, 1.0));
  vec2 lp = (uPointer - vUv) * vec2(uAspect, 1.0);
  vec3 l = normalize(vec3(lp, 0.22));
  float spec = pow(max(dot(reflect(-l, n), vec3(0.0, 0.0, 1.0)), 0.0), 32.0);
  float near = exp(-dot(lp, lp) / 0.035);
  float a = spec * near * 0.32 * uOn;
  gl_FragColor = vec4(vec3(1.0, 0.97, 0.9) * a, a);
}`;

export interface Glint {
  destroy: () => void;
}

export function createGlint(strip: HTMLElement): Glint | null {
  const canvas = document.createElement('canvas');
  canvas.className = 'paint-glint';
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, failIfMajorPerformanceCaveat: true });
  if (!gl) return null;
  const release = () => {
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return null;
  };
  if (isSoftware(gl)) return release();
  const make = (type: number, src: string) => {
    const s = gl.createShader(type);
    if (!s) return null;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };
  const vs = make(gl.VERTEX_SHADER, VERT);
  const fs = make(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return release();
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
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
  const u = (n: string) => gl.getUniformLocation(prog, n);
  const uMap = u('uMap');
  const uPointer = u('uPointer');
  const uTexel = u('uTexel');
  const uAspect = u('uAspect');
  const uOn = u('uOn');
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  let frame: HTMLElement | null = null;
  let img: HTMLImageElement | null = null;
  const pointer = { x: 0.5, y: 0.5 };
  let on = 0;
  let target = 0;
  let raf = 0;

  const draw = () => {
    raf = 0;
    if (!frame || !img) return;
    on += (target - on) * 0.15;
    const f = frame.getBoundingClientRect();
    const r = img.getBoundingClientRect();
    const scale = Math.min(1.5, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.round(f.width * scale));
    const h = Math.max(1, Math.round(f.height * scale));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    // The image drifts and scales inside its frame: map it where it is now.
    gl.uniform4f(uMap, (r.left - f.left) / f.width, (r.top - f.top) / f.height, r.width / f.width, r.height / f.height);
    gl.uniform2f(uPointer, pointer.x, pointer.y);
    gl.uniform2f(uTexel, 2 / Math.max(1, img.naturalWidth), 2 / Math.max(1, img.naturalHeight));
    gl.uniform1f(uAspect, f.width / Math.max(1, f.height));
    gl.uniform1f(uOn, on);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (Math.abs(target - on) > 0.01 || target > 0) raf = requestAnimationFrame(draw);
    else canvas.remove();
  };
  const loop = () => {
    if (!raf) raf = requestAnimationFrame(draw);
  };

  const enter = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const button = e.target instanceof Element ? e.target.closest<HTMLElement>('.reveal') : null;
    const image = button?.querySelector('img');
    if (!button || !image?.complete || !image.naturalWidth) return;
    if (button !== frame) {
      frame = button;
      img = image;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      button.append(canvas);
      on = 0;
    }
    target = 1;
    loop();
  };
  const move = (e: PointerEvent) => {
    if (!frame || e.pointerType !== 'mouse') return;
    const f = frame.getBoundingClientRect();
    pointer.x = (e.clientX - f.left) / f.width;
    pointer.y = (e.clientY - f.top) / f.height;
    loop();
  };
  const leave = (e: PointerEvent) => {
    // Out of the painting, not just from the frame into its own image.
    const to = e.relatedTarget instanceof Node ? e.relatedTarget : null;
    if (frame && !(to && frame.contains(to))) {
      target = 0;
      loop();
    }
  };
  strip.addEventListener('pointerover', enter);
  strip.addEventListener('pointermove', move, { passive: true });
  strip.addEventListener('pointerout', leave);

  return {
    destroy: () => {
      cancelAnimationFrame(raf);
      strip.removeEventListener('pointerover', enter);
      strip.removeEventListener('pointermove', move);
      strip.removeEventListener('pointerout', leave);
      canvas.remove();
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      release();
    },
  };
}
