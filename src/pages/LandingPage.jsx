import ThemeToggle from '../components/ThemeToggle.jsx';
import HeroDemo from '../components/HeroDemo.jsx';
import { Brand, WORKFLOWS } from '../components/Brand.jsx';
import { Icon, cx } from '../components/ui.jsx';
import { Link } from '../lib/router.jsx';

const STEPS = [
  ['Capture', 'Take a photo of the area, or jot down the day in your own words. Shorthand is fine.'],
  ['SiteLens structures it', 'Hazards, defects, labour, progress and delays are sorted, rated by severity and given a next step.'],
  ['Share the report', 'Download a clean PDF, copy it into WhatsApp or email, and find past reports any time.'],
];

const TOOL_POINTS = {
  inspect: ['Safety hazards and defects', 'Severity and confidence for each finding', 'Recommended actions, most urgent first'],
  diary: ['Live preview as you type', 'Labour, progress, delays and safety in one report', 'PDF, copy or share in one tap'],
};

export default function LandingPage() {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-5 lg:px-8">
          <Brand />
          <nav className="flex items-center gap-7 text-[14px] text-muted max-md:hidden" aria-label="Main">
            <a href="#how-it-works" className="hover:text-heading">
              How it works
            </a>
            <a href="#tools" className="hover:text-heading">
              Tools
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/app"
              className="inline-flex h-10 items-center rounded-md bg-heading px-4 text-[14px] font-medium text-paper no-underline transition-opacity hover:opacity-90"
            >
              Open workspace
            </Link>
          </div>
        </div>
      </header>

      <main>
        <Hero />
        <HowItWorks />
        <Tools />
        <ClosingCta />
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 px-5 py-6 text-[13px] text-muted lg:px-8">
          <span>SiteLens. Findings are a first look; always confirm on site.</span>
          <span className="font-mono text-[11px] tracking-wide">REPORTS ARE SAVED ON YOUR DEVICE</span>
        </div>
      </footer>
    </>
  );
}

function Hero() {
  return (
    <section>
      <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-5 pt-16 pb-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.02fr)] lg:gap-16 lg:px-8 lg:pt-24 lg:pb-28">
        <div className="grid gap-7">
          <p className="flex items-center gap-3 font-mono text-[11.5px] tracking-[0.16em] text-muted">
            <span className="h-px w-10 bg-amber-deep" aria-hidden="true" />
            FOR SITE ENGINEERS AND SUPERVISORS
          </p>
          <h1 className="font-display text-[64px] leading-[0.98] font-semibold tracking-[-0.025em] text-heading max-lg:text-[54px] max-sm:text-[42px]">
            Better site inspections.
            <span className="block text-amber-deep italic">Clearer daily reports.</span>
          </h1>
          <p className="max-w-[50ch] text-[17px] leading-relaxed text-muted">
            Document construction activities, identify visible site hazards and defects, and turn everyday site observations into
            structured reports you can share the same day.
          </p>
          <div className="flex flex-wrap gap-3">
            {WORKFLOWS.map((w, i) => (
              <Link
                key={w.id}
                to={`/app#${w.id}`}
                className={cx(
                  'inline-flex h-12 items-center gap-2.5 rounded-md border px-5 text-[15px] font-medium no-underline transition-colors max-sm:w-full max-sm:justify-center',
                  i === 0 ? 'border-amber bg-amber text-amber-ink hover:bg-[#dba020]' : 'border-line-strong/25 bg-transparent text-heading hover:bg-paper',
                )}
              >
                <Icon name={w.icon} />
                {w.cta}
              </Link>
            ))}
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-6 text-[13.5px] text-muted">
            {['Install it like an app', 'Severity-rated findings', 'PDF ready to share'].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Icon name="check" className="size-4 text-amber-deep" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <HeroDemo />
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-y border-line bg-paper">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-16 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,2fr)] lg:px-8">
        <div>
          <p className="font-mono text-[11px] tracking-[0.14em] text-muted">HOW IT WORKS</p>
          <h2 className="mt-2 font-display text-[34px] leading-tight font-semibold tracking-tight max-sm:text-[28px]">
            From site to report in three steps.
          </h2>
        </div>
        <ol className="grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-3">
          {STEPS.map(([title, text], i) => (
            <li key={title} className="grid content-start gap-3 bg-paper p-6">
              <span className="font-mono text-[12px] text-amber-deep">0{i + 1}</span>
              <h3 className="text-[16px] font-semibold">{title}</h3>
              <p className="text-[14px] leading-relaxed text-muted">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Tools() {
  return (
    <section id="tools" className="scroll-mt-20">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-20 lg:px-8">
        <div className="max-w-[640px]">
          <p className="font-mono text-[11px] tracking-[0.14em] text-muted">TWO TOOLS</p>
          <h2 className="mt-2 font-display text-[34px] leading-tight font-semibold tracking-tight max-sm:text-[28px]">
            One for what you see. One for what happened today.
          </h2>
        </div>
        <div className="grid gap-px overflow-hidden rounded-md border border-line bg-line md:grid-cols-2">
          {WORKFLOWS.map((w) => (
            <article key={w.id} className="grid content-start gap-5 bg-paper p-7">
              <span className="grid size-11 place-items-center rounded-md bg-[#17263d] text-amber">
                <Icon name={w.icon} className="size-5" />
              </span>
              <div className="grid gap-2">
                <h3 className="font-display text-[24px] font-semibold">{w.label}</h3>
                <p className="max-w-[48ch] text-[15px] text-muted">{w.blurb}</p>
              </div>
              <ul className="grid gap-2 text-[14px]">
                {TOOL_POINTS[w.id].map((p) => (
                  <li key={p} className="flex items-center gap-2.5">
                    <Icon name="check" className="size-4 text-amber-deep" />
                    {p}
                  </li>
                ))}
              </ul>
              <Link to={`/app#${w.id}`} className="inline-flex items-center gap-2 text-[14px] font-medium text-heading underline decoration-amber underline-offset-4">
                {w.cta}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section className="bg-[#17263d] text-white">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-6 px-5 py-14 lg:px-8">
        <div>
          <h2 className="font-display text-[32px] leading-tight font-semibold text-white max-sm:text-[26px]">Your next site report starts here.</h2>
          <p className="mt-2 text-[15px] text-white/70">Open the workspace in your browser, or install SiteLens on your phone for site visits.</p>
        </div>
        <Link
          to="/app"
          className="inline-flex h-12 items-center gap-2.5 rounded-md bg-amber px-6 text-[15px] font-medium text-[#17263d] no-underline hover:bg-[#dba020]"
        >
          Open workspace
        </Link>
      </div>
    </section>
  );
}
