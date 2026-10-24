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
  // Once the shell's paper (its largest paint) is decoded and on screen, at
  // most a second in.
  const paper = new Image();
  paper.src = `${import.meta.env.BASE_URL}img/paper.webp`;
  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    requestAnimationFrame(() => setTimeout(mount, 0));
  };
  paper.decode().then(start, start);
  setTimeout(start, 1000);
} else mount();
