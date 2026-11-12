import { proofs, webUi } from './content-work';
import { useLang } from './i18n';

// The project's name is the credit's title, so the sentence under it doesn't
// say it twice: "Felucca, firmware for…" reads "Firmware for…".
function lead(text: string, name: string): string {
  if (!text.startsWith(name)) return text;
  const rest = text.slice(name.length).replace(/^,? /, '');
  return rest[0].toUpperCase() + rest.slice(1);
}

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
            <h3 className="proof-name">{proof.name}</h3>
            <p>
              {lead(t(proof.text), proof.name)} <a href={proof.link}>{proof.linkText}</a>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
