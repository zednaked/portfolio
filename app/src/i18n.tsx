import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { ui, type Lang, type Text } from './content';

interface LangState {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (text: Text) => string;
}

const LangContext = createContext<LangState | null>(null);

function initialLang(): Lang {
  const param = new URLSearchParams(location.search).get('lang');
  if (param === 'pt' || param === 'en') return param;
  try {
    return localStorage.getItem('lang') === 'pt' ? 'pt' : 'en';
  } catch {
    return 'en';
  }
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
    document.title = ui.title[lang];
  }, [lang]);

  const setLang = (next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem('lang', next);
    } catch {
      // Storage can be blocked; the choice just won't persist.
    }
  };

  return <LangContext.Provider value={{ lang, setLang, t: (text) => text[lang] }}>{children}</LangContext.Provider>;
}

export function useLang(): LangState {
  const state = useContext(LangContext);
  if (!state) throw new Error('useLang outside LangProvider');
  return state;
}
