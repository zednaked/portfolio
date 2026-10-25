import { useRef } from 'react';
import { ciberteia, games, gamesUi } from './content-work';
import { useLang } from './i18n';
import { CaseCard, useCaseMotion } from './cases';
import { Flagship } from './Flagship';

export function Games() {
  const { t } = useLang();
  const root = useRef<HTMLElement>(null);
  useCaseMotion(root, 'games-h');

  // The order is the data's: the first game leads, the rest pair up below.
  const [featured, ...rest] = games;
  return (
    <>
      {/* The flagship, before the cases: its own band, the colours of the game. */}
      <Flagship piece={ciberteia} />
      <section className="wrap web games" id="games" aria-labelledby="games-h" ref={root}>
        <h2 className="label" id="games-h">
          {t(gamesUi.label)}
        </h2>
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
    </>
  );
}
