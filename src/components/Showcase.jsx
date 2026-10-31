import HeroDemo from './HeroDemo.jsx';
import { Chip, Icon, cx } from './ui.jsx';

/* Product showcase for the landing page: the workspace in a browser window and a photo inspection on a phone.
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
    <div className={cx('overflow-hidden rounded-xl border border-line bg-paper shadow-[0_40px_80px_-40px_rgb(18_28_43/0.45)]', className)}>
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

// A simple line drawing of a building frame under construction, with hazard callouts.
function SiteSketch() {
  return (
    <svg viewBox="0 0 240 160" className="block w-full" role="img" aria-label="Sketch of a concrete frame with two hazards marked">
      <rect width="240" height="160" fill="#dfe4ea" />
      <rect y="128" width="240" height="32" fill="#c9cfd6" />
      <g stroke="#17263d" strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M30 128V58M90 128V58M150 128V58M210 128V58" />
        <path d="M22 58h196M22 92h196" />
      </g>
      <g stroke="#17263d" strokeWidth="1.4" opacity="0.55">
        <path d="M30 58V36M90 58V36M150 58V36M210 58V36" />
        <path d="M24 36l6-4 6 4M84 36l6-4 6 4M144 36l6-4 6 4M204 36l6-4 6 4" />
      </g>
      <g fontFamily="Inter, sans-serif" fontSize="9" fontWeight="600">
        <circle cx="210" cy="40" r="11" fill="none" stroke="#c9541a" strokeWidth="2.2" />
        <circle cx="210" cy="22" r="7" fill="#c9541a" />
        <text x="210" y="25" textAnchor="middle" fill="#fff">1</text>
        <circle cx="52" cy="58" r="11" fill="none" stroke="#b81f36" strokeWidth="2.2" />
        <circle cx="52" cy="40" r="7" fill="#b81f36" />
        <text x="52" y="43" textAnchor="middle" fill="#fff">2</text>
      </g>
    </svg>
  );
}

export function PhoneFrame({ className }) {
  return (
    <div className={cx('w-[250px] rounded-[34px] border-[7px] border-[#121c2b] bg-[#121c2b] shadow-[0_40px_80px_-30px_rgb(18_28_43/0.6)]', className)}>
      <div className="overflow-hidden rounded-[27px] bg-paper">
        <div className="flex justify-center pt-2 pb-1" aria-hidden="true">
          <span className="h-4 w-20 rounded-full bg-[#121c2b]" />
        </div>
        <div className="grid gap-3 px-3.5 pb-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted">Site inspection report</span>
            <Chip tone="critical">High risk</Chip>
          </div>
          <p className="font-display text-[17px] leading-tight font-semibold text-heading">Block B, first floor</p>
          <div className="overflow-hidden rounded-lg">
            <SiteSketch />
          </div>
          {[
            ['1', 'Exposed starter bars without caps', 'High', 'high'],
            ['2', 'Unprotected slab edge', 'Critical', 'critical'],
          ].map(([n, title, sev, tone]) => (
            <div key={n} className={cx('grid gap-1 rounded-r-md border-l-[3px] bg-paper-2 py-2 pr-2 pl-2.5', tone === 'high' ? 'border-l-high' : 'border-l-critical')}>
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11.5px] leading-snug font-semibold text-heading">
                  {n}. {title}
                </span>
                <Chip tone={tone} solid>
                  {sev}
                </Chip>
              </div>
              <span className="text-[10.5px] text-muted">What to do: {tone === 'high' ? 'fit rebar safety caps' : 'install guardrails and toe boards'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Showcase() {
  return (
    <div className="relative mx-auto max-w-[1100px]">
      <BrowserFrame>
        <WorkspaceMock />
      </BrowserFrame>
      <PhoneFrame className="absolute -right-6 -bottom-14 max-lg:hidden" />
    </div>
  );
}
