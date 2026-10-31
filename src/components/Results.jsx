import { SEVERITIES } from '../lib/analyse.js';
import { longDate } from '../lib/format.js';
import { Bullets, Chip, DocHeader, DocSection, DocTable, Notice, TONE_BORDER, cx, severityTone } from './ui.jsx';

const bySeverity = (a, b) => SEVERITIES.indexOf(b.severity) - SEVERITIES.indexOf(a.severity);

const CATEGORY_SECTIONS = [
  { key: 'safety', title: 'Safety hazards' },
  { key: 'workmanship', title: 'Defects and quality issues' },
  { key: 'site', title: 'Site conditions and activities' },
];

function Confidence({ value }) {
  return (
    <span className="inline-flex items-center gap-1.5 tabular-nums" title={`How sure SiteLens is: ${value}%`}>
      <span className="h-1.5 w-12 overflow-hidden rounded-full bg-line">
        <span className="block h-full rounded-full bg-line-strong/60" style={{ width: `${value}%` }} />
      </span>
      {value}%
    </span>
  );
}

function Finding({ f }) {
  const tone = severityTone(f.severity);
  return (
    <li className={cx('avoid-break grid gap-1.5 rounded-r-lg border-l-[3px] bg-paper-2/70 py-3 pr-4 pl-4', TONE_BORDER[tone])}>
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-[14.5px] font-semibold">{f.title}</h4>
        <Chip tone={tone} solid>
          {f.severity}
        </Chip>
      </div>
      <p className="max-w-[72ch] text-[14px]">{f.description}</p>
      <dl className="flex flex-wrap gap-x-6 gap-y-1 text-[12.5px] text-muted">
        {f.location && (
          <div className="flex gap-1.5">
            <dt>Location:</dt>
            <dd className="text-ink">{f.location}</dd>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <dt>How sure:</dt>
          <dd>
            <Confidence value={f.confidence} />
          </dd>
        </div>
      </dl>
    </li>
  );
}

/* The finished photo inspection report, laid out as a numbered document. */
export default function Results({ result, meta, previewUrl }) {
  const counts = Object.fromEntries(SEVERITIES.map((s) => [s, 0]));
  result.findings.forEach((f) => counts[f.severity]++);
  const actions = result.findings.filter((f) => f.recommendation).sort(bySeverity);

  // Number only the sections that have content, the way a real report would.
  let n = 0;
  const next = () => ++n;

  return (
    <article className="grid gap-7" id="report">
      <DocHeader
        kind="Site inspection report"
        title={meta.site || 'Untitled site'}
        cells={[
          ['Date', longDate(meta.date)],
          ['Inspected by', meta.inspector],
          ['Findings', String(result.findings.length)],
        ]}
        status={{ label: 'Overall risk', value: result.overallRisk, tone: severityTone(result.overallRisk) }}
      />

      {result.demo && (
        <Notice>
          <strong>This is an example report.</strong> It shows what SiteLens produces, but it was not made from your photo.
        </Notice>
      )}

      <DocSection n={next()} title="Summary">
        <div className={cx('grid gap-5', previewUrl && 'sm:grid-cols-[minmax(0,220px)_1fr]')}>
          {previewUrl && <img className="aspect-[4/3] w-full rounded-lg object-cover" src={previewUrl} alt="Inspected site" />}
          <div className="grid content-start gap-4">
            <p className="max-w-[72ch] text-[14.5px] leading-relaxed">{result.summary || 'No summary returned.'}</p>
            <dl className="grid grid-cols-4 divide-x divide-line rounded-lg border border-line">
              {[...SEVERITIES].reverse().map((s) => (
                <div key={s} className="grid justify-items-start gap-1.5 px-3 py-2.5">
                  <dd className="text-[20px] leading-none font-semibold text-heading tabular-nums">{counts[s]}</dd>
                  <dt>
                    <Chip tone={severityTone(s)}>{s}</Chip>
                  </dt>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </DocSection>

      {result.elements.length > 0 && (
        <DocSection n={next()} title="What's in the photo">
          <DocTable head={['Element', 'Description']}>
            {result.elements.map((e, i) => (
              <tr key={i}>
                <td className="font-medium whitespace-nowrap text-heading">{e.name}</td>
                <td>{e.description || '—'}</td>
              </tr>
            ))}
          </DocTable>
        </DocSection>
      )}

      {result.findings.length === 0 && (
        <p className="rounded-lg border border-low/30 bg-low/8 px-4 py-3 font-medium text-low">No hazards or defects were spotted in this photo.</p>
      )}

      {CATEGORY_SECTIONS.map(({ key, title }) => {
        const items = result.findings.filter((f) => f.category === key).sort(bySeverity);
        if (!items.length) return null;
        return (
          <DocSection key={key} n={next()} title={title} count={items.length}>
            <ul className="grid gap-2.5">
              {items.map((f) => (
                <Finding key={f.id} f={f} />
              ))}
            </ul>
          </DocSection>
        );
      })}

      {result.observations.length > 0 && (
        <DocSection n={next()} title="Other observations">
          <Bullets items={result.observations} />
        </DocSection>
      )}

      {actions.length > 0 && (
        <DocSection n={next()} title="Recommended actions" count={actions.length}>
          <DocTable head={['Priority', 'Action', 'For']}>
            {actions.map((f) => (
              <tr key={f.id}>
                <td>
                  <Chip tone={severityTone(f.severity)} solid>
                    {f.severity}
                  </Chip>
                </td>
                <td className="font-medium text-heading">{f.recommendation}</td>
                <td className="text-muted">{f.title}</td>
              </tr>
            ))}
          </DocTable>
        </DocSection>
      )}

      <p className="border-t border-line pt-4 text-xs text-muted">
        This report was produced by AI from a single photo. It is a first look only, so confirm every finding on site. It does not
        replace a professional engineer's judgement.
      </p>
    </article>
  );
}
