import { CATEGORIES, SEVERITIES } from '../lib/analyse.js';

const sevClass = (s) => `sev sev-${s.toLowerCase()}`;

function Confidence({ value }) {
  return (
    <span className="confidence" title={`Model confidence ${value}%`}>
      <span className="conf-track">
        <span className="conf-fill" style={{ width: `${value}%` }} />
      </span>
      {value}%
    </span>
  );
}

function FindingCard({ f }) {
  return (
    <article className={`finding border-${f.severity.toLowerCase()}`}>
      <header>
        <h4>{f.title}</h4>
        <span className={sevClass(f.severity)}>{f.severity}</span>
      </header>
      <p>{f.description}</p>
      <dl>
        {f.location && (
          <>
            <dt>Location</dt>
            <dd>{f.location}</dd>
          </>
        )}
        <dt>Confidence</dt>
        <dd>
          <Confidence value={f.confidence} />
        </dd>
      </dl>
      {f.recommendation && (
        <p className="recommendation">
          <strong>Recommended action:</strong> {f.recommendation}
        </p>
      )}
    </article>
  );
}

export default function Results({ result, meta, previewUrl }) {
  const counts = Object.fromEntries(SEVERITIES.map((s) => [s, 0]));
  result.findings.forEach((f) => counts[f.severity]++);
  const actions = result.findings.filter((f) => f.recommendation);

  return (
    <section className="report" id="report">
      <header className="report-head">
        <div>
          <p className="eyebrow">Inspection report</p>
          <h2>{meta.site || 'Untitled site'}</h2>
          <p className="muted">
            {meta.inspector ? `Inspector: ${meta.inspector} · ` : ''}
            {meta.date} · Model: {result.model}
          </p>
        </div>
        <div className={`risk risk-${result.overallRisk.toLowerCase()}`}>
          <span>Overall risk</span>
          <strong>{result.overallRisk}</strong>
        </div>
      </header>

      {result.demo && (
        <p className="notice">
          Demo mode: these are sample results, not an analysis of your photo. Add
          <code>VITE_GEMINI_API_KEY</code> to <code>.env</code> to enable Gemma analysis.
        </p>
      )}

      <div className="report-top">
        {previewUrl && <img className="report-img" src={previewUrl} alt="Inspected site" />}
        <div>
          <h3>Summary</h3>
          <p>{result.summary || 'No summary returned.'}</p>
          <div className="counts">
            {[...SEVERITIES].reverse().map((s) => (
              <div key={s} className="count">
                <strong>{counts[s]}</strong>
                <span className={sevClass(s)}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {result.elements.length > 0 && (
        <>
          <h3>Construction elements identified</h3>
          <ul className="elements">
            {result.elements.map((e, i) => (
              <li key={i}>
                <div>
                  <strong>{e.name}</strong>
                  {e.description && <span className="muted"> — {e.description}</span>}
                </div>
                <Confidence value={e.confidence} />
              </li>
            ))}
          </ul>
        </>
      )}

      {Object.entries(CATEGORIES).map(([key, label]) => {
        const items = result.findings.filter((f) => f.category === key);
        return (
          <div key={key} className="category">
            <h3>
              {label}s <span className="badge">{items.length}</span>
            </h3>
            {items.length ? (
              <div className="findings">
                {items.map((f) => (
                  <FindingCard key={f.id} f={f} />
                ))}
              </div>
            ) : (
              <p className="muted">None visibly identified.</p>
            )}
          </div>
        );
      })}

      {result.observations.length > 0 && (
        <>
          <h3>General observations</h3>
          <ul className="observations">
            {result.observations.map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
        </>
      )}

      {actions.length > 0 && (
        <>
          <h3>Prioritised action plan</h3>
          <table className="actions">
            <thead>
              <tr>
                <th>#</th>
                <th>Priority</th>
                <th>Issue</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {actions.map((f, i) => (
                <tr key={f.id}>
                  <td>{i + 1}</td>
                  <td>
                    <span className={sevClass(f.severity)}>{f.severity}</span>
                  </td>
                  <td>{f.title}</td>
                  <td>{f.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <p className="disclaimer">
        SiteLens supports preliminary visual inspections only. Findings are AI-generated from a single photograph
        and must be verified on site. They do not replace professional engineering judgement or physical site
        assessments.
      </p>
    </section>
  );
}
