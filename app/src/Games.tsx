import { useRef } from 'react';
import { games, gamesUi } from './content';
import { useLang } from './i18n';
import { CaseCard, useCaseMotion } from './cases';

export function Games() {
  const { t } = useLang();
  const root = useRef<HTMLElement>(null);
  useCaseMotion(root, 'games-h');

  const [featured, ...rest] = games;
  return (
    <section className="wrap web games" id="games" aria-labelledby="games-h" ref={root}>
      <h2 className="label" id="games-h">{t(gamesUi.label)}</h2>
      <p className="intro">{t(gamesUi.intro)}</p>
      <div className="cases">
        <CaseCard piece={featured} />
        <div className="cases-pair">
          {rest.map((piece) => (
            <CaseCard piece={piece} key={piece.id} />
          ))}
        </div>
      </div>
    </section>
  );
}
