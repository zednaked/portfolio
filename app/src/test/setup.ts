// jsdom lacks the browser APIs the page leans on; these stand in for them.
import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => cleanup());

// GSAP's ticker keeps scheduling frames; once jsdom is torn down there is no
// requestAnimationFrame left to call. Stop it with the file's last test.
afterAll(async () => {
  // Imported here, not at the top: motion.ts reads matchMedia, mocked below.
  const { gsap, ScrollTrigger } = await import('../motion');
  ScrollTrigger.killAll();
  gsap.ticker.sleep();
});

// Node 26 defines its own global localStorage (undefined without a flag), which
// hides jsdom's. A small in-memory Storage stands in.
class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  get length() {
    return this.data.size;
  }
  clear() {
    this.data.clear();
  }
  getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  key(i: number) {
    return [...this.data.keys()][i] ?? null;
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
}
Object.defineProperty(globalThis, 'localStorage', { value: new MemoryStorage(), configurable: true });

// Reduced motion by default in tests: no scroll-driven timelines, and the
// dialog opens and closes without waiting on tweens.
window.matchMedia = vi.fn((query: string) => ({
  matches: query.includes('reduce'),
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
globalThis.IntersectionObserver = NoopObserver as unknown as typeof IntersectionObserver;
globalThis.ResizeObserver = NoopObserver;

// <dialog> in jsdom has no modal behaviour.
HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
  this.open = true;
};
HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
  this.open = false;
};

HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve());
HTMLMediaElement.prototype.pause = vi.fn();
