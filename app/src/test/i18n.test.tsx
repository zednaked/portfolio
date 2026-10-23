import { describe, expect, it, beforeEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { LangProvider, useLang } from '../i18n';
import { ui } from '../content';

function Probe() {
  const { lang, setLang, t } = useLang();
  return (
    <>
      <p data-testid="lang">{lang}</p>
      <p data-testid="text">{t(ui.close)}</p>
      <button type="button" onClick={() => setLang('pt')}>
        pt
      </button>
    </>
  );
}

describe('LangProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    history.replaceState(null, '', '/');
  });

  it('starts in English', () => {
    render(
      <LangProvider>
        <Probe />
      </LangProvider>,
    );
    expect(screen.getByTestId('lang')).toHaveTextContent('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('takes ?lang= over the saved choice', () => {
    localStorage.setItem('lang', 'en');
    history.replaceState(null, '', '/?lang=pt');
    render(
      <LangProvider>
        <Probe />
      </LangProvider>,
    );
    expect(screen.getByTestId('text')).toHaveTextContent('Fechar');
  });

  it('switches, sets the document language and remembers the choice', () => {
    render(
      <LangProvider>
        <Probe />
      </LangProvider>,
    );
    act(() => screen.getByRole('button', { name: 'pt' }).click());
    expect(screen.getByTestId('lang')).toHaveTextContent('pt');
    expect(document.documentElement.lang).toBe('pt-BR');
    expect(document.title).toBe(ui.title.pt);
    expect(localStorage.getItem('lang')).toBe('pt');
  });
});
