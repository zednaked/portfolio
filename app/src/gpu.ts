// Both WebGL pieces run on a real GPU only. A software renderer (SwiftShader,
// llvmpipe: no GPU, or a blocklisted one) would draw on the CPU and block the
// page, so the pieces fall back to their stills instead.
export function isSoftware(gl: WebGLRenderingContext | WebGL2RenderingContext) {
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
  return /swiftshader|llvmpipe|software/i.test(renderer);
}

let cached: boolean | null = null;
/** Probed once per visit: a motion switch remounts the page, not the GPU. */
export function hasGPU() {
  if (cached !== null) return cached;
  const gl = document.createElement('canvas').getContext('webgl2', { failIfMajorPerformanceCaveat: true });
  cached = !!gl && !isSoftware(gl);
  gl?.getExtension('WEBGL_lose_context')?.loseContext();
  return cached;
}
