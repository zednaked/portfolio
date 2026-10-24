import { useRef } from 'react';
import { deskWork, figmaUrl, pageStats, pageStory, webUi, webWork } from './content-work';
import { useLang } from './i18n';
import { BudgetCase, CaseCard, CaseIndex, StatLine, StoryList, useCaseMotion } from './cases';
import { Flood } from './Flood';

export function WebWork() {
  const { t } = useLang();
  const root = useRef<HTMLElement>(null);
  useCaseMotion(root, 'web-h');

  return (
    <>
      {/* The act opens on a piece, full width, before the cases. */}
      <Flood />
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
          {/* Three cases in full; the rest in brief, the playable ad first. */}
          <CaseIndex pieces={[...webWork.filter((p) => p.compact), ...deskWork]} featured="playable" />

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
