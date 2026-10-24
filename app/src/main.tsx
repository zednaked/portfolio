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

createRoot(el).render(
  <StrictMode>
    <LangProvider>
      <Root />
    </LangProvider>
  </StrictMode>,
);
