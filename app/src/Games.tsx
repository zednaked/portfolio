import { useRef } from 'react';
import { ciberteia, gamesUi, reidaboca, rinha } from './content-work';
import { useLang } from './i18n';
import { useCaseMotion } from './cases';
import { Flagship } from './Flagship';

export function Games() {
  const { t } = useLang();
  const root = useRef<HTMLElement>(null);
  useCaseMotion(root, 'games-h');

  // Each game is a flagship: its own band, in the colours of the game.
  return (
    <section className="games" id="games" aria-labelledby="games-h" ref={root}>
      <div className="wrap web">
        <h2 className="label" id="games-h">
          {t(gamesUi.label)}
        </h2>
        <p className="intro">{t(gamesUi.intro)}</p>
      </div>
      {[ciberteia, rinha, reidaboca].map((piece) => (
        <Flagship piece={piece} key={piece.id} />
      ))}
    </section>
  );
}
