import { StrictMode, useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { LangProvider } from './i18n';
import { App } from './App';
import { motionVersion, subscribeMotion } from './motion';
import './style.css';

const el = document.getElementById('root');
if (!el) throw new Error('index.html has no #root');

// A motion switch remounts the page: every timeline is reverted with its
// component and rebuilt under the new setting, with no reload.
function Root() {
  const version = useSyncExternalStore(subscribeMotion, motionVersion);
  return <App key={version} />;
}

// The prerendered shell paints first, then the app takes over: mounting after
// the shell's paper is on screen lets the shell be the largest paint on its
// own, instead of the app's re-render of it (which put the whole JS download
// and run inside the LCP).
const mount = () =>
  createRoot(el).render(
    <StrictMode>
      <LangProvider>
        <Root />
      </LangProvider>
    </StrictMode>,
  );
if (el.childElementCount > 0) {
  // Once the browser has recorded the shell's largest paint (not merely once
  // the paper image has decoded: a decoded image is not yet a painted one),
  // a second and a half at most.
  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    requestAnimationFrame(() => setTimeout(mount, 0));
  };
  try {
    new PerformanceObserver((list, obs) => {
      if (list.getEntries().length > 0) {
        obs.disconnect();
        start();
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {
    start();
  }
  setTimeout(start, 1500);
} else mount();
