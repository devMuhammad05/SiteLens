import { Bullets, Chip, DocHeader, DocSection, DocTable, Empty, Notice, TONE_BORDER, cx, severityTone, statusTone } from './ui.jsx';
import { SEVERITIES } from '../lib/gemma.js';
import { longDate } from '../lib/format.js';

const bySeverity = (a, b) => SEVERITIES.indexOf(b.severity) - SEVERITIES.indexOf(a.severity);

/* The finished daily site report, laid out as a document rather than a dashboard. */
export default function DiaryReport({ entry, result: r }) {
  const weather = r.weather.conditions || entry.weather.conditions;
  const temperature = r.weather.temperature || entry.weather.temperature;
  const actions = r.issues.filter((x) => x.action).sort(bySeverity);

  const facts = [
    [r.totals.headcount, 'Workers on site'],
    [r.totals.manHours || '—', 'Man-hours'],
    [r.weather.hoursLost, 'Hours lost to weather'],
    [r.issues.length, 'Problems raised'],
  ];

  return (
    <article className="grid gap-7" id="report">
      <DocHeader
        kind="Daily site report"
        title={entry.project || 'Untitled project'}
        cells={[
          ['Date', longDate(entry.date, true)],
          ['Prepared by', entry.preparedBy],
          ['Weather', [weather, temperature].filter(Boolean).join(', ')],
        ]}
        status={{ label: 'Site status', value: r.status, tone: statusTone(r.status) }}
      />

      {r.demo && (
        <Notice>
          <strong>This is an example report.</strong> It shows what SiteLens produces, but it was not made from your notes.
        </Notice>
      )}

      {r.missing.length > 0 && (
        <div className="no-print">
          <Notice>
            <p className="font-medium text-heading">Your notes don't mention the following. Add them and update the report if you can.</p>
            <div className="mt-1.5">
              <Bullets items={r.missing} />
            </div>
          </Notice>
        </div>
      )}

      <DocSection n={1} title="Executive summary">
        <p className="max-w-[72ch] text-[14.5px] leading-relaxed">{r.summary || 'No summary returned.'}</p>
        <dl className="grid grid-cols-4 divide-x divide-line rounded-lg border border-line max-sm:grid-cols-2 max-sm:divide-x-0">
          {facts.map(([value, label], i) => (
            <div key={label} className={cx('px-3.5 py-3', i % 2 === 1 && 'max-sm:border-l max-sm:border-line', i > 1 && 'max-sm:border-t max-sm:border-line')}>
              <dd className="text-[22px] leading-none font-semibold text-heading tabular-nums">{value}</dd>
              <dt className="mt-1.5 text-xs text-muted">{label}</dt>
            </div>
          ))}
        </dl>
      </DocSection>

      <DocSection n={2} title="Work completed" count={r.progress.length || null}>
        {r.progress.length ? (
          <DocTable head={['Activity', 'Location', 'Status', 'Complete']}>
            {r.progress.map((p, i) => (
              <tr key={i}>
                <td>
                  <span className="font-medium text-heading">{p.activity}</span>
                  {p.notes && <span className="mt-0.5 block text-[12.5px] text-muted">{p.notes}</span>}
                </td>
                <td>{p.location || '—'}</td>
                <td>
                  <Chip tone={statusTone(p.status)}>{p.status}</Chip>
                </td>
                <td className="min-w-28">
                  {p.percentComplete != null ? (
                    <span className="flex items-center gap-2 tabular-nums">
                      <span className="h-1.5 w-14 overflow-hidden rounded-full bg-line">
                        <span className="block h-full rounded-full bg-amber" style={{ width: `${p.percentComplete}%` }} />
                      </span>
                      {p.percentComplete}%
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
          </DocTable>
        ) : (
          <Empty>No progress recorded.</Empty>
        )}
      </DocSection>

      <DocSection n={3} title="Labour and equipment">
        {r.labour.length ? (
          <DocTable head={['Trade', 'Company', 'Headcount', 'Hours']}>
            {r.labour.map((l, i) => (
              <tr key={i}>
                <td className="font-medium text-heading">{l.trade}</td>
                <td>{l.company || '—'}</td>
                <td className="tabular-nums">{l.headcount}</td>
                <td className="tabular-nums">{l.hours ?? '—'}</td>
              </tr>
            ))}
            <tr className="font-semibold text-heading">
              <td colSpan={2}>Total</td>
              <td className="tabular-nums">{r.totals.headcount}</td>
              <td className="tabular-nums">{r.totals.manHours ? `${r.totals.manHours} man-hours` : '—'}</td>
            </tr>
          </DocTable>
        ) : (
          <Empty>No labour recorded.</Empty>
        )}
        {r.plant.length > 0 && (
          <DocTable head={['Plant and equipment', 'Qty', 'Status', 'Notes']}>
            {r.plant.map((p, i) => (
              <tr key={i}>
                <td className="font-medium text-heading">{p.item}</td>
                <td className="tabular-nums">{p.quantity}</td>
                <td>
                  <Chip tone={statusTone(p.status)}>{p.status}</Chip>
                </td>
                <td>{p.notes || '—'}</td>
              </tr>
            ))}
          </DocTable>
        )}
      </DocSection>

      <DocSection n={4} title="Deliveries and visitors">
        {r.deliveries.length || r.visitors.length ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid content-start gap-2">
              <h4 className="text-[13px] font-medium text-muted">Deliveries</h4>
              {r.deliveries.length ? (
                <Bullets
                  items={r.deliveries.map((d, i) => (
                    <span key={i}>
                      <span className="font-medium text-heading">{[d.quantity, d.material].filter(Boolean).join(' ')}</span>
                      {d.supplier && ` from ${d.supplier}`}
                      {d.notes && <span className="text-muted">. {d.notes}</span>}
                    </span>
                  ))}
                />
              ) : (
                <Empty>None recorded.</Empty>
              )}
            </div>
            <div className="grid content-start gap-2">
              <h4 className="text-[13px] font-medium text-muted">Visitors</h4>
              {r.visitors.length ? (
                <Bullets
                  items={r.visitors.map((v, i) => (
                    <span key={i}>
                      <span className="font-medium text-heading">{v.name || 'Visitor'}</span>
                      {v.organisation && `, ${v.organisation}`}
                      {v.purpose && <span className="text-muted">. {v.purpose}</span>}
                    </span>
                  ))}
                />
              ) : (
                <Empty>None recorded.</Empty>
              )}
            </div>
          </div>
        ) : (
          <Empty>No deliveries or visitors recorded.</Empty>
        )}
      </DocSection>

      <DocSection n={5} title="Site conditions">
        <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-[14px] [&_dt]:text-muted">
          <dt>Weather</dt>
          <dd>{weather || 'Not recorded'}</dd>
          <dt>Temperature</dt>
          <dd>{temperature || '—'}</dd>
          <dt>Impact on work</dt>
          <dd className="flex flex-wrap items-center gap-2">
            <Chip tone={statusTone(r.weather.impact)}>{r.weather.impact}</Chip>
            {r.weather.hoursLost ? <span>{r.weather.hoursLost} hours lost</span> : null}
          </dd>
          {(r.weather.notes || entry.weather.notes) && (
            <>
              <dt>Notes</dt>
              <dd>{r.weather.notes || entry.weather.notes}</dd>
            </>
          )}
        </dl>
      </DocSection>

      <DocSection n={6} title="Problems and delays" count={r.issues.length || null}>
        {r.issues.length ? (
          <ul className="grid gap-2.5">
            {[...r.issues].sort(bySeverity).map((x) => {
              const tone = severityTone(x.severity);
              return (
                <li key={x.id} className={cx('avoid-break grid gap-1.5 rounded-r-lg border-l-[3px] bg-paper-2/70 py-3 pr-4 pl-4', TONE_BORDER[tone])}>
                  <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                    <h4 className="text-[14.5px] font-semibold">{x.title}</h4>
                    <span className="flex items-center gap-2">
                      <span className="text-xs text-muted">{x.type}</span>
                      <Chip tone={tone} solid>
                        {x.severity}
                      </Chip>
                    </span>
                  </div>
                  {x.description && <p className="max-w-[72ch] text-[14px]">{x.description}</p>}
                  {x.impact && (
                    <p className="text-[13px] text-muted">
                      <span className="font-medium text-ink">Impact:</span> {x.impact}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <Empty>No problems reported.</Empty>
        )}
      </DocSection>

      <DocSection n={7} title="Safety observations">
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-[14px]">
          <span>
            <strong className={cx('text-[18px] font-semibold tabular-nums', r.safety.incidents ? 'text-critical' : 'text-heading')}>{r.safety.incidents}</strong>{' '}
            incidents
          </span>
          <span>
            <strong className={cx('text-[18px] font-semibold tabular-nums', r.safety.nearMisses ? 'text-high' : 'text-heading')}>{r.safety.nearMisses}</strong>{' '}
            near misses
          </span>
        </div>
        {r.safety.toolboxTalk && (
          <p className="text-[14px]">
            <span className="font-medium text-heading">Toolbox talk:</span> {r.safety.toolboxTalk}
          </p>
        )}
        {r.safety.notes.length > 0 && <Bullets items={r.safety.notes} />}
      </DocSection>

      <DocSection n={8} title="Recommended actions" count={actions.length || null}>
        {actions.length ? (
          <DocTable head={['Priority', 'Action', 'Who']}>
            {actions.map((x) => (
              <tr key={x.id}>
                <td>
                  <Chip tone={severityTone(x.severity)} solid>
                    {x.severity}
                  </Chip>
                </td>
                <td>
                  <span className="font-medium text-heading">{x.action}</span>
                  <span className="mt-0.5 block text-[12.5px] text-muted">For: {x.title}</span>
                </td>
                <td>{x.owner || '—'}</td>
              </tr>
            ))}
          </DocTable>
        ) : (
          <Empty>No actions needed.</Empty>
        )}
      </DocSection>

      <DocSection n={9} title="Planned activities for tomorrow">
        {r.tomorrow.length ? (
          <ol className="grid list-decimal gap-1 pl-5 text-[14px] marker:text-muted">
            {r.tomorrow.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ol>
        ) : (
          <Empty>No plan recorded.</Empty>
        )}
      </DocSection>

      <footer className="avoid-break mt-2 grid grid-cols-2 gap-8 max-sm:grid-cols-1">
        {[
          ['Prepared by', entry.preparedBy],
          ['Reviewed by (construction manager)', ''],
        ].map(([label, name]) => (
          <div key={label} className="flex flex-col-reverse gap-1">
            <span className="text-xs text-muted">{label}</span>
            <span className="min-h-[1.7em] border-b border-line-strong/60 pb-0.5 font-medium text-heading">{name || ' '}</span>
          </div>
        ))}
      </footer>
    </article>
  );
}
