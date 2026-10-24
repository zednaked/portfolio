import { useRef } from 'react';
import { deskWork, figmaUrl, pageStats, pageStory, webUi, webWork } from './content';
import { useLang } from './i18n';
import { CaseCard, StatLine, StoryList, useCaseMotion } from './cases';

export function WebWork() {
  const { t } = useLang();
  const root = useRef<HTMLElement>(null);
  useCaseMotion(root, 'web-h');

  return (
    <section className="wrap web" id="web" aria-labelledby="web-h" ref={root}>
      <h2 className="label" id="web-h">
        {t(webUi.label)}
      </h2>
      <p className="intro">{t(webUi.intro)}</p>

      <div className="cases">
        {webWork
          .filter((p) => !p.compact)
          .map((piece) => (
            <CaseCard piece={piece} key={piece.id} />
          ))}
        <div className="cases-pair">
          {[...deskWork, ...webWork.filter((p) => p.compact)].map((piece) => (
            <CaseCard piece={piece} key={piece.id} />
          ))}
        </div>

        <article className="case self" aria-labelledby="case-self">
          <div className="case-body">
            <h3 id="case-self">{t(webUi.pageLabel)}</h3>
            <StoryList story={pageStory} />
            <p className="what">{t(webUi.page)}</p>
            <ul className="stats">
              {pageStats.map((stat, i) => (
                <StatLine stat={stat} key={i} />
              ))}
            </ul>
            <p className="what">{t(webUi.pageA11y)}</p>
            <p className="links">
              <a href="https://github.com/zednaked/portfolio">{t(webUi.code)}</a>
              <a href={figmaUrl}>{t(webUi.figma)}</a>
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
