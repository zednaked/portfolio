import { useRef } from 'react';
import { deskWork, figmaUrl, mamulengo, nirbija, pageStats, pageStory, webUi, webWork } from './content-work';
import { useLang } from './i18n';
import { BudgetCase, CaseCard, CaseIndex, StatLine, StoryList, useCaseMotion } from './cases';
import { Flood } from './Flood';
import { Flagship } from './Flagship';

export function WebWork() {
  const { t } = useLang();
  const root = useRef<HTMLElement>(null);
  useCaseMotion(root, 'web-h');

  return (
    <>
      {/* The act opens on a piece, full width, before the cases. */}
      <Flood />
      {/* The flagship, before the cases: its own band, the colour of the app. */}
      <Flagship piece={mamulengo} />
      <Flagship piece={nirbija} />
      <section className="wrap web" id="web" aria-labelledby="web-h" ref={root}>
        <h2 className="label" id="web-h">
          {t(webUi.label)}
        </h2>
        <p className="intro">{t(webUi.intro)}</p>

        <div className="cases">
          <BudgetCase />
          {webWork
            .filter((p) => !p.compact)
            .map((piece) => (
              <CaseCard piece={piece} key={piece.id} />
            ))}
          {/* Three cases in full; the playable ad in brief. */}
          <CaseIndex piece={webWork[2]} />
          {/* The desktop pieces, each with its clip: two cards side by side. */}
          <section className="desk" aria-labelledby="desk-h">
            <h3 id="desk-h" className="index-h">
              {t(webUi.deskLabel)}
            </h3>
            <div className="cases-pair">
              {deskWork.map((piece) => (
                <CaseCard piece={piece} key={piece.id} />
              ))}
            </div>
          </section>

          <article className="case self" aria-labelledby="case-self">
            <div className="case-body">
              <h3 id="case-self">{t(webUi.pageLabel)}</h3>
              <p className="what">{t(webUi.page)}</p>
              <ul className="stats">
                {pageStats.map((stat, i) => (
                  <StatLine stat={stat} key={i} />
                ))}
              </ul>
              <StoryList story={pageStory} />
              <p className="what">{t(webUi.pageA11y)}</p>
              <p className="links">
                <a href="https://github.com/zednaked/portfolio">{t(webUi.code)}</a>
                <a href={figmaUrl}>{t(webUi.figma)}</a>
              </p>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
