import { useEffect, useState } from 'react';
import { Chip, cx } from './ui.jsx';

// A looping, illustrative demo of the daily report workflow: rough notes in, a structured report out.
const NOTE = '6 steel fixers 8hrs, crane all day. rain 10-12 stopped work. mixer broke down pm. slab rebar inspection not booked, pour is thurs!!';

const FACTS = [
  ['17', 'Workers'],
  ['132', 'Man-hours'],
  ['2 h', 'Lost to rain'],
];

const ISSUES = [
  ['Slab rebar inspection not booked', 'High', 'high'],
  ['Concrete mixer broken down', 'Medium', 'medium'],
];

const TYPE_MS = 24;
const STAGES = 5; // header, summary, facts, issue 1, issue 2

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function HeroDemo() {
  const still = prefersReducedMotion();
  const [typed, setTyped] = useState(still ? NOTE.length : 0);
  const [stage, setStage] = useState(still ? STAGES : 0);

  useEffect(() => {
    if (still) return;
    let t;
    if (typed < NOTE.length) t = setTimeout(() => setTyped((n) => Math.min(n + 2, NOTE.length)), TYPE_MS);
    else if (stage < STAGES) t = setTimeout(() => setStage((s) => s + 1), stage === 0 ? 500 : 420);
    else
      t = setTimeout(() => {
        setTyped(0);
        setStage(0);
      }, 4200);
    return () => clearTimeout(t);
  }, [typed, stage, still]);

  const writing = typed < NOTE.length || stage < STAGES;

  return (
    <figure
      className="overflow-hidden rounded-lg border border-line bg-paper"
      aria-label="Example: rough site notes turned into a daily report"
    >
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5 text-[12.5px] text-muted">
        <span className="font-medium text-heading">Daily report</span>
        <span className="flex items-center gap-1.5">
          <span className={cx('size-1.5 rounded-full', writing ? 'bg-amber' : 'bg-low')} />
          {writing ? 'Writing' : 'Ready'}
        </span>
      </div>

      <div className="border-b border-line bg-canvas px-4 py-3 text-[13px] leading-relaxed text-ink">
        <span className="text-muted">Notes: </span>
        {NOTE.slice(0, typed)}
        {typed < NOTE.length && <span className="caret ml-px inline-block h-[1.05em] w-[2px] translate-y-[2px] bg-heading" />}
      </div>

      <div className="min-h-[300px] p-5 sm:min-h-[330px]">
        <div className="grid gap-4">
          {stage >= 1 && (
            <div className="rise flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] text-muted">Saturday 31 October 2026, A. Okafor</p>
                <p className="font-display text-[22px] leading-tight font-semibold text-heading">Lekki Residences, Block B</p>
              </div>
              <Chip tone="medium">Minor delays</Chip>
            </div>
          )}
          {stage >= 2 && (
            <p className="rise text-[13px] leading-relaxed text-ink">
              Rebar fixing continued with the crane all day. Two hours were lost to rain, and Thursday&rsquo;s pour is at risk
              until the slab inspection is booked.
            </p>
          )}
          {stage >= 3 && (
            <dl className="rise grid grid-cols-3 divide-x divide-line border-y border-line">
              {FACTS.map(([v, k]) => (
                <div key={k} className="px-3 py-2 first:pl-0">
                  <dd className="text-[19px] leading-none font-semibold text-heading tabular-nums">{v}</dd>
                  <dt className="mt-1 text-[11px] text-muted">{k}</dt>
                </div>
              ))}
            </dl>
          )}
          {ISSUES.map(([title, sev, tone], i) =>
            stage >= 4 + i ? (
              <div key={title} className={cx('rise flex items-center justify-between gap-3 border-l-2 py-1 pl-3', tone === 'high' ? 'border-l-high' : 'border-l-medium')}>
                <span className="text-[13px] font-medium text-heading">{title}</span>
                <Chip tone={tone}>{sev}</Chip>
              </div>
            ) : null,
          )}
          {stage === 0 && <p className="text-[13px] text-muted">Waiting for notes…</p>}
        </div>
      </div>
    </figure>
  );
}
