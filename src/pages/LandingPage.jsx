import ThemeToggle from '../components/ThemeToggle.jsx';
import Showcase, { InspectionOutput } from '../components/Showcase.jsx';
import { Brand, WORKFLOWS } from '../components/Brand.jsx';
import { Chip, Icon, cx } from '../components/ui.jsx';
import { Link } from '../lib/router.jsx';

const pill = 'inline-flex h-12 items-center justify-center gap-2.5 rounded-full px-6 text-[15px] font-medium no-underline transition-colors';
const pillPrimary = cx(pill, 'bg-amber text-amber-ink hover:bg-[#dba020]');
const pillOutline = cx(pill, 'border border-line-strong/25 text-heading hover:bg-paper');

const FEATURES = [
  ['download', 'Works offline', 'Install SiteLens on your phone. Keep writing notes and open past reports with no signal on site.'],
  ['share', 'Share in one tap', 'Download a clean PDF, or copy the report straight into WhatsApp or email.'],
  ['check', 'Rated by severity', 'Every hazard, defect and delay gets a severity and a practical next step, most urgent first.'],
  ['history', 'Every report saved', 'Reports are kept on your device, so you can reopen any past day in seconds.'],
];

export default function LandingPage() {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-5 lg:px-8">
          <Brand />
          <div className="flex items-center gap-7">
            <nav className="flex items-center gap-7 text-[14px] text-muted max-md:hidden" aria-label="Main">
              <a href="#features" className="hover:text-heading">
                Features
              </a>
              <a href="#photo-inspection" className="hover:text-heading">
                Photo inspection
              </a>
              <a href="#daily-report" className="hover:text-heading">
                Daily report
              </a>
            </nav>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link to="/app" className={cx(pillPrimary, 'h-10 px-5 text-[14px] whitespace-nowrap max-sm:px-4')}>
                <span className="max-sm:hidden">Open workspace</span>
                <span className="sm:hidden">Open app</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        <Hero />
        <FeatureSection
          id="photo-inspection"
          title="Point, shoot and know what needs fixing."
          text="Upload a photo of the area you're checking. SiteLens marks the visible safety hazards, defects and quality issues, rates each one, and tells you what to do about it, most urgent first."
          tags={['Safety hazards', 'Defects and quality', 'Severity ratings', 'Recommended actions']}
          cta={WORKFLOWS[0]}
          visual={<InspectionOutput />}
        />
        <FeatureSection
          id="daily-report"
          reverse
          title="Your rough notes, turned into a proper daily report."
          text="Jot down the day the way you'd say it: workers, progress, weather, deliveries, problems. Watch the report take shape as you type, then let SiteLens write it up for your construction manager."
          tags={['Live preview', 'Labour and progress tables', 'Problems and delays', 'PDF and sharing']}
          cta={WORKFLOWS[1]}
          visual={<DiaryVisual />}
        />
        <Features />
        <ClosingCta />
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-5 py-8 text-[13px] text-muted lg:px-8">
          <Brand />
          <span>Findings are a first look. Always confirm them on site.</span>
        </div>
      </footer>
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="bg-dots absolute inset-x-0 top-0 h-[560px] [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden="true" />
      {/* Warm band the product showcase sits on. */}
      <div className="absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-b from-transparent via-amber/25 to-amber/55 opacity-(--band-opacity)" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-[1200px] justify-items-center gap-7 px-5 pt-20 text-center lg:px-8 lg:pt-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3.5 py-1.5 text-[13px] text-muted">
          <span className="size-1.5 rounded-full bg-amber" aria-hidden="true" />
          <span className="max-sm:hidden">For site engineers, supervisors and construction managers</span>
          <span className="sm:hidden">For site engineers and supervisors</span>
        </span>
        <h1 className="max-w-[19ch] font-display text-[68px] text-balance leading-[1.02] font-semibold tracking-[-0.025em] text-heading max-lg:text-[56px] max-sm:text-[40px]">
          Site inspections and daily reports, done on site.
        </h1>
        <p className="max-w-[60ch] text-[18px] leading-relaxed text-muted max-sm:text-[16px]">
          SiteLens spots visible hazards and defects in your site photos, and turns your rough daily notes into a structured
          report. It works on your phone, even offline.
        </p>
        <div className="flex flex-wrap justify-center gap-3 max-sm:w-full max-sm:flex-col">
          <Link to="/app#inspect" className={pillPrimary}>
            <Icon name="camera" />
            Inspect a site photo
          </Link>
          <Link to="/app#diary" className={pillOutline}>
            <Icon name="clipboard" />
            Create a daily report
          </Link>
        </div>
      </div>

      <div className="relative mx-auto max-w-[1200px] px-5 pt-16 pb-24 lg:px-8 lg:pb-28">
        <Showcase />
      </div>
    </section>
  );
}

function FeatureSection({ id, title, text, tags, cta, visual, reverse }) {
  return (
    <section id={id} className="scroll-mt-20 border-b border-line">
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:gap-20 lg:px-8 lg:py-24">
        <div className={cx('grid content-start gap-6', reverse && 'lg:order-2')}>
          <span className="grid size-11 place-items-center rounded-xl bg-amber-soft text-amber-deep">
            <Icon name={cta.icon} className="size-5" />
          </span>
          <h2 className="max-w-[20ch] font-display text-[40px] leading-[1.08] font-semibold tracking-tight max-sm:text-[30px]">{title}</h2>
          <p className="max-w-[52ch] text-[16.5px] leading-relaxed text-muted">{text}</p>
          <ul className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <li key={t} className="rounded-full border border-line bg-paper px-3 py-1 text-[13px] text-heading">
                {t}
              </li>
            ))}
          </ul>
          <div>
            <Link to={`/app#${cta.id}`} className={pillPrimary}>
              {cta.cta}
            </Link>
          </div>
        </div>
        <div className={cx('rounded-2xl bg-paper-2 p-8 max-sm:p-4', reverse && 'lg:order-1')}>{visual}</div>
      </div>
    </section>
  );
}

// A compact view of a finished daily report for the feature section.
function DiaryVisual() {
  return (
    <div className="mx-auto grid max-w-[460px] gap-4 rounded-xl border border-line bg-paper p-5 shadow-[0_30px_60px_-35px_rgb(18_28_43/0.4)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11.5px] text-muted">Daily site report · Saturday, 31 October</p>
          <p className="font-display text-[22px] leading-tight font-semibold text-heading">Lekki Residences, Block B</p>
        </div>
        <Chip tone="medium">Minor delays</Chip>
      </div>
      <dl className="grid grid-cols-3 divide-x divide-line rounded-lg border border-line">
        {[
          ['17', 'Workers'],
          ['132', 'Man-hours'],
          ['3', 'Problems'],
        ].map(([v, k]) => (
          <div key={k} className="px-3 py-2.5">
            <dd className="text-[20px] leading-none font-semibold text-heading tabular-nums">{v}</dd>
            <dt className="mt-1 text-[11px] text-muted">{k}</dt>
          </div>
        ))}
      </dl>
      <table className="w-full text-[12.5px]">
        <thead>
          <tr className="border-b border-line text-left text-[11px] text-muted">
            <th className="py-1.5 font-medium">Activity</th>
            <th className="py-1.5 font-medium">Status</th>
            <th className="py-1.5 text-right font-medium">Done</th>
          </tr>
        </thead>
        <tbody className="[&_td]:py-2 [&_tr]:border-b [&_tr]:border-line [&_tr:last-child]:border-0">
          <tr>
            <td className="font-medium text-heading">Slab rebar, gridline 1–6</td>
            <td>
              <Chip tone="medium">In progress</Chip>
            </td>
            <td className="text-right tabular-nums">80%</td>
          </tr>
          <tr>
            <td className="font-medium text-heading">Column formwork C1–C6</td>
            <td>
              <Chip tone="low">Completed</Chip>
            </td>
            <td className="text-right tabular-nums">100%</td>
          </tr>
        </tbody>
      </table>
      <div className="flex items-center justify-between gap-3 rounded-r-md border-l-[3px] border-l-high bg-paper-2 py-2 pr-2 pl-3">
        <span className="text-[12.5px] font-medium text-heading">Slab rebar inspection not booked</span>
        <Chip tone="high" solid>
          High
        </Chip>
      </div>
    </div>
  );
}

function Features() {
  return (
    <section id="features" className="scroll-mt-20">
      <div className="mx-auto grid max-w-[1200px] gap-12 px-5 py-20 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-[640px] gap-4 text-center">
          <h2 className="font-display text-[40px] leading-[1.08] font-semibold tracking-tight max-sm:text-[30px]">Built for the way sites actually work.</h2>
          <p className="text-[16.5px] text-muted">Patchy signal, busy days and a manager waiting for the report. SiteLens is made for all three.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(([icon, title, text]) => (
            <article key={title} className="grid content-start gap-3 rounded-2xl border border-line bg-paper p-6">
              <span className="grid size-10 place-items-center rounded-xl bg-[#17263d] text-amber">
                <Icon name={icon} className="size-[18px]" />
              </span>
              <h3 className="text-[16px] font-semibold">{title}</h3>
              <p className="text-[14px] leading-relaxed text-muted">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section className="px-5 pb-20 lg:px-8">
      <div className="relative mx-auto grid max-w-[1200px] justify-items-center gap-5 overflow-hidden rounded-3xl bg-[#17263d] px-6 py-16 text-center">
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-amber/35 to-transparent" aria-hidden="true" />
        <h2 className="relative max-w-[22ch] font-display text-[40px] leading-[1.08] font-semibold text-white max-sm:text-[30px]">
          Finish the report before you leave the site.
        </h2>
        <p className="relative max-w-[52ch] text-[16px] text-white/75">Open SiteLens in your browser, or install it on your phone for site visits.</p>
        <div className="relative flex flex-wrap justify-center gap-3">
          <Link to="/app" className={pillPrimary}>
            Open workspace
          </Link>
        </div>
      </div>
    </section>
  );
}
