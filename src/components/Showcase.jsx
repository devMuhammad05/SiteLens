import HeroDemo from './HeroDemo.jsx';
import { Chip, Icon, TONE_TEXT, cx } from './ui.jsx';

/* Product showcase for the landing page: the workspace in a browser window, and an example photo inspection output.
   Everything here is illustrative example content, drawn with real SiteLens components where possible. */

const NOTE_SECTIONS = [
  ['Project information', true],
  ['Weather and site conditions', true],
  ['Work progress', true],
  ['Labour and equipment', true],
  ['Problems and delays', true],
  ['Health and safety', false],
];

export function BrowserFrame({ children, className }) {
  return (
    <div className={cx('overflow-hidden rounded-xl border border-line bg-paper shadow-[0_40px_80px_-40px_rgb(15_23_42/0.45)]', className)}>
      <div className="flex items-center gap-3 border-b border-line bg-paper-2 px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-line" />
          <span className="size-2.5 rounded-full bg-line" />
          <span className="size-2.5 rounded-full bg-line" />
        </span>
        <span className="mx-auto rounded-md bg-paper px-10 py-1 text-[11px] text-muted max-sm:px-4">sitelens.app/app</span>
        <span className="w-10" aria-hidden="true" />
      </div>
      {children}
    </div>
  );
}

function WorkspaceMock() {
  return (
    <div className="grid gap-4 p-4 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:p-5">
      <div className="overflow-hidden rounded-lg border border-line bg-paper max-md:hidden">
        <div className="border-b border-line px-4 py-3">
          <p className="text-[13px] font-semibold text-heading">Today's site notes</p>
          <p className="text-[11px] text-muted">5 of 8 sections filled in</p>
        </div>
        {NOTE_SECTIONS.map(([title, done]) => (
          <div key={title} className="flex items-center gap-2.5 border-b border-line px-4 py-2.5 last:border-b-0">
            <span className={cx('grid size-4 place-items-center rounded-full border', done ? 'border-low bg-low text-white' : 'border-line')}>
              {done && <Icon name="check" className="size-2.5" />}
            </span>
            <span className="text-[12px] text-heading">{title}</span>
          </div>
        ))}
        <div className="p-3">
          <div className="grid h-8 place-items-center rounded-md bg-amber text-[12px] font-medium text-amber-ink">Create report</div>
        </div>
      </div>
      <HeroDemo />
    </div>
  );
}

// What a photo inspection returns, using the same structure as the real report.
const FINDINGS = [
  ['Safety hazard', 'Unprotected slab edge', 'Critical', 'critical', 'Install guardrails and toe boards before more work at height.', 88],
  ['Safety hazard', 'Exposed starter bars without caps', 'High', 'high', 'Fit rebar safety caps or bend-over protection.', 86],
  ['Defect', 'Honeycombing at column base', 'High', 'high', 'Have the engineer assess the depth before repair.', 74],
];

const TALLY = [
  ['Critical', 'critical', 1],
  ['High', 'high', 2],
  ['Medium', 'medium', 2],
  ['Low', 'low', 1],
];

export function InspectionOutput() {
  return (
    <div className="mx-auto grid max-w-[480px] gap-4 rounded-xl border border-line bg-paper p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11.5px] text-muted">Site inspection report, 6 findings</p>
          <p className="font-display text-[22px] leading-tight font-semibold text-heading">Block B, first floor</p>
        </div>
        <span className="text-[12.5px] whitespace-nowrap text-muted">
          Overall risk <strong className="font-semibold text-critical">High</strong>
        </span>
      </div>
      <dl className="grid grid-cols-4 overflow-hidden rounded-lg border border-line max-[460px]:grid-cols-2">
        {TALLY.map(([label, tone, n], i) => (
          <div
            key={label}
            className={cx('border-line px-3 py-2.5', i > 0 && 'min-[461px]:border-l', i % 2 === 1 && 'max-[460px]:border-l', i > 1 && 'max-[460px]:border-t')}
          >
            <dd className="text-[19px] leading-none font-semibold text-heading tabular-nums">{n}</dd>
            <dt className={cx('mt-1 text-[11.5px]', TONE_TEXT[tone])}>{label}</dt>
          </div>
        ))}
      </dl>
      <ul className="grid gap-4 border-t border-line pt-4">
        {FINDINGS.map(([category, title, sev, tone, action, sure]) => (
          <li key={title} className={cx('grid gap-1.5 border-l-2 py-1 pl-3.5', tone === 'critical' ? 'border-l-critical' : 'border-l-high')}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10.5px] text-muted">{category}</p>
                <p className="text-[13.5px] leading-snug font-semibold text-heading">{title}</p>
              </div>
              <Chip tone={tone}>{sev}</Chip>
            </div>
            <p className="text-[12.5px] text-ink">
              <span className="font-medium text-heading">What to do:</span> {action}
            </p>
            <span className="flex items-center gap-1.5 text-[11px] text-muted tabular-nums">
              How sure
              <span className="h-1 w-12 overflow-hidden rounded-full bg-line">
                <span className="block h-full rounded-full bg-line-strong/60" style={{ width: `${sure}%` }} />
              </span>
              {sure}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Showcase() {
  return (
    <div className="relative mx-auto max-w-[1100px]">
      <BrowserFrame>
        <WorkspaceMock />
      </BrowserFrame>
    </div>
  );
}
