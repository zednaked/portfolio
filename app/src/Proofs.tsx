import { proofs, webUi } from './content-work';
import { useLang } from './i18n';

export function Proofs() {
  const { t } = useLang();
  return (
    <section className="wrap credits" id="credits" aria-labelledby="proof-h">
      <h2 className="label" id="proof-h">
        {t(webUi.proofLabel)}
      </h2>
      <ul className="proofs">
        {proofs.map((proof) => (
          <li key={proof.link}>
            {t(proof.text)} <a href={proof.link}>{proof.linkText}</a>
          </li>
        ))}
      </ul>
    </section>
  );
}
