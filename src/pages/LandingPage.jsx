import ThemeToggle from '../components/ThemeToggle.jsx';
import Showcase, { InspectionOutput } from '../components/Showcase.jsx';
import { Brand, GithubIcon, REPO_URL, WORKFLOWS } from '../components/Brand.jsx';
import Reveal from '../components/Reveal.jsx';
import { Chip, Icon, cx } from '../components/ui.jsx';
import { Link } from '../lib/router.jsx';

const button = 'inline-flex h-11 items-center justify-center gap-2 rounded-lg px-5 text-[15px] font-medium no-underline transition-all duration-200';
const buttonPrimary = cx(button, 'bg-amber text-amber-ink hover:bg-amber-hover');
const buttonSecondary = cx(button, 'border border-line text-heading hover:bg-paper-2');
const section = 'mx-auto max-w-[1120px] px-5 lg:px-8';
const h2 = 'font-display text-[38px] leading-[1.15] font-semibold tracking-[-0.01em] text-balance max-sm:text-[30px]';

const STEPS = [
  ['Capture', 'Take a photo of the area you are checking, or write down the day. Type it, or speak and SiteLens types for you.'],
  ['SiteLens analyses it', 'Google’s Gemma AI reads the photo or your notes and sorts out hazards, defects, progress, labour and delays.'],
  ['Review and share', 'Check the report, then download a PDF or send it by WhatsApp or email. Every report is saved on your device.'],
];

const FEATURES = [
  ['camera', 'Hazard and defect detection', 'Finds visible safety hazards, defects and quality issues in site photos.'],
  ['upload', 'Several photos, one report', 'Check up to four photos of an area together. Each finding says which photo it is in.'],
  ['check', 'Severity and confidence', 'Every finding is rated from Low to Critical, with how sure the AI is.'],
  ['arrow', 'Recommended actions', 'A practical next step for each problem, most urgent first.'],
  ['mic', 'Voice dictation', 'Speak your notes on site instead of typing.'],
  ['sparkle', 'Tidy-up', 'Turns rough or spoken notes into clear, professional wording without adding anything.'],
  ['clipboard', 'Live report preview', 'The daily report takes shape as you fill in each section.'],
  ['eye', 'Missing-info check', 'Points out what a daily report usually needs that your notes left out.'],
  ['history', 'Ask your reports', 'Ask questions like “When did we last pour concrete?” and get answers from your saved reports, with the dates.'],
  ['location', 'Weather fill-in', 'Adds today’s weather for your location in one tap.'],
  ['share', 'PDF, copy and share', 'A clean PDF for the manager, or plain text for WhatsApp and email.'],
  ['download', 'Works offline', 'Install it on your phone. Notes and past reports work without signal.'],
  ['key', 'Private by default', 'Reports are saved in your browser. There is no SiteLens server.'],
  ['moon', 'Light and dark mode', 'Easy to read in the site office or outside in bright sun.'],
  ['github', 'Free and open source', 'No cost, no sign-up. The code is on GitHub under the MIT licence.'],
];

const FAQ = [
  [
    'Is SiteLens free?',
    'Yes. There is no charge and no sign-up. To use the AI, add your own key from Google AI Studio in the workspace. Creating one is free, and Google’s usage limits apply.',
  ],
  ['Which AI does it use?', 'Google’s Gemma models, through the Gemini API, for both reading site photos and writing reports.'],
  [
    'What happens to my photos and notes?',
    'When you check photos, create a report or ask a question, those photos, notes or saved reports are sent to Google’s AI service with your key. Your key and your finished reports are saved only in your browser.',
  ],
  [
    'Does it replace a site inspection?',
    'No. SiteLens gives a quick first look at what is visible in a photo or written in your notes. Always confirm findings on site.',
  ],
];

export default function LandingPage() {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
        <div className={cx(section, 'flex h-16 items-center justify-between gap-3')}>
          <Brand />
          <div className="flex min-w-0 items-center gap-6">
            <nav className="flex items-center gap-6 text-[14px] text-muted max-lg:hidden" aria-label="Main">
              <a href="#how-it-works" className="hover:text-heading">
                How it works
              </a>
              <a href="#features" className="hover:text-heading">
                Features
              </a>
              <a href="#open-source" className="hover:text-heading">
                Open source
              </a>
            </nav>
            <div className="flex items-center gap-2">
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="grid size-10 place-items-center rounded-lg text-muted hover:bg-paper-2 hover:text-heading max-sm:hidden"
                aria-label="SiteLens on GitHub"
                title="SiteLens on GitHub"
              >
                <GithubIcon />
              </a>
              <span className="max-[360px]:hidden">
                <ThemeToggle />
              </span>
              <Link to="/app" className={cx(buttonPrimary, 'h-10 px-4 text-[14px] whitespace-nowrap max-[360px]:px-3')}>
                <span className="max-sm:hidden">Open workspace</span>
                <span className="sm:hidden">Open app</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        <Hero />
        <HowItWorks />
        <Tool
          id="photo-inspection"
          title="Know what needs fixing from a few photos."
          text="Upload up to four photos of the area you are checking. SiteLens flags visible safety hazards, defects and quality issues, rates how serious each one is, and recommends what to do, most urgent first."
          cta={WORKFLOWS[0]}
          visual={<InspectionOutput />}
        />
        <Tool
          id="daily-report"
          reverse
          title="Speak or type. SiteLens writes the report."
          text="Jot down the day in your own words, or dictate it on site. SiteLens tidies the wording, builds a structured daily report with tables, problems and recommended actions, and tells you what is missing. Later, ask questions about any past day."
          cta={WORKFLOWS[1]}
          visual={<DiaryVisual />}
        />
        <Features />
        <OpenSource />
        <Faq />
        <ClosingCta />
      </main>

      <Footer />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-paper">
      <div className="bg-dots absolute inset-x-0 top-0 h-[560px] [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden="true" />
      {/* Warm glow the product preview sits on. */}
      <div className="absolute inset-x-0 bottom-0 h-[52%] bg-gradient-to-b from-transparent via-amber/10 to-amber/35" aria-hidden="true" />

      <div className={cx(section, 'relative grid justify-items-center gap-6 pt-20 pb-14 text-center lg:pt-28')}>
        <span className="fade-up inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3.5 py-1.5 text-[13px] text-heading shadow-sm">
          <Icon name="sparkle" className="size-4 text-amber-deep" />
          Powered by Google Gemma AI
          <span className="h-3.5 w-px bg-line max-sm:hidden" aria-hidden="true" />
          <span className="text-muted max-sm:hidden">Free and open source</span>
        </span>
        <h1
          className="fade-up max-w-[24ch] font-display text-[60px] leading-[1.12] font-semibold tracking-[-0.012em] text-balance text-heading max-lg:text-[48px] max-sm:text-[36px] max-sm:leading-[1.15]"
          style={{ animationDelay: '80ms' }}
        >
          Your AI assistant for site inspections and daily reports.
        </h1>
        <p
          className="fade-up max-w-[58ch] text-[18px] leading-relaxed text-pretty text-muted max-sm:text-[16px]"
          style={{ animationDelay: '160ms' }}
        >
          SiteLens uses Google’s Gemma AI to spot hazards and defects in site photos, and to turn rough notes, typed or spoken, into a
          daily report your manager can read in a minute.
        </p>
        <div className="fade-up mt-2 flex flex-wrap justify-center gap-3 max-sm:w-full max-sm:flex-col" style={{ animationDelay: '240ms' }}>
          <Link to="/app#inspect" className={cx(buttonPrimary, 'shadow-[0_10px_24px_-12px_var(--amber)] hover:-translate-y-0.5')}>
            <Icon name="camera" className="size-[18px]" />
            Inspect a site photo
          </Link>
          <Link to="/app#diary" className={cx(buttonSecondary, 'bg-paper hover:-translate-y-0.5')}>
            <Icon name="clipboard" className="size-[18px]" />
            Create a daily report
          </Link>
        </div>
        <p className="fade-up text-[13.5px] text-muted" style={{ animationDelay: '320ms' }}>
          Free and open source. No sign-up.
        </p>
      </div>

      <div className={cx(section, 'relative pb-24')}>
        <div className="fade-up" style={{ animationDelay: '420ms' }}>
          <div className="float">
            <Showcase />
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-t border-line bg-canvas">
      <div className={cx(section, 'grid gap-12 py-24')}>
        <Reveal>
          <h2 className={cx(h2, 'max-w-[20ch]')}>From site to finished report in three steps.</h2>
        </Reveal>
        <ol className="grid gap-5 md:grid-cols-3">
          {STEPS.map(([title, text], i) => (
            <Reveal as="li" key={title} delay={i * 120} className="lift grid content-start gap-3 rounded-2xl border border-line bg-paper p-7">
              <span className="grid size-10 place-items-center rounded-full bg-amber text-[15px] font-semibold text-amber-ink">{i + 1}</span>
              <h3 className="text-[18px] font-semibold">{title}</h3>
              <p className="text-[15px] leading-relaxed text-muted">{text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Tool({ id, title, text, cta, visual, reverse }) {
  return (
    <section id={id} className={cx('scroll-mt-20 border-t border-line', reverse ? 'bg-canvas' : 'bg-paper')}>
      <div className={cx(section, 'grid grid-cols-[minmax(0,1fr)] items-center gap-12 py-24 lg:grid-cols-2 lg:gap-20')}>
        <Reveal className={cx('grid content-start gap-5', reverse && 'lg:order-2')}>
          <span className="grid size-11 place-items-center rounded-xl bg-amber-soft text-amber-deep">
            <Icon name={cta.icon} className="size-5" />
          </span>
          <p className="text-[14px] font-medium text-amber-deep">{cta.label}</p>
          <h2 className={h2}>{title}</h2>
          <p className="max-w-[52ch] text-[16.5px] leading-relaxed text-muted">{text}</p>
          <div className="mt-2">
            <Link to={`/app#${cta.id}`} className={cx(buttonPrimary, 'max-sm:w-full')}>
              {cta.cta}
              <Icon name="arrow" className="size-4" />
            </Link>
          </div>
        </Reveal>
        <Reveal delay={150} className={cx('rounded-3xl p-8 max-sm:p-4', reverse ? 'bg-paper-2' : 'bg-canvas', reverse && 'lg:order-1')}>
          <div className="lift rounded-xl shadow-[0_30px_60px_-35px_rgb(15_23_42/0.45)]">{visual}</div>
        </Reveal>
      </div>
    </section>
  );
}

function DiaryVisual() {
  return (
    <div className="mx-auto grid max-w-[460px] gap-4 rounded-xl border border-line bg-paper p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] text-muted">Daily site report, Saturday 31 October</p>
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
            <dt className="mt-1 text-[11.5px] text-muted">{k}</dt>
          </div>
        ))}
      </dl>
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-line text-left text-[11.5px] text-muted">
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
      <div className="flex items-center justify-between gap-3 border-l-2 border-l-high py-1 pl-3">
        <span className="text-[13px] font-medium text-heading">Slab rebar inspection not booked</span>
        <Chip tone="high">High</Chip>
      </div>
      <p className="border-t border-line pt-3 text-[12.5px] text-muted">
        Missing from your notes: how many hours the afternoon labourers worked.
      </p>
    </div>
  );
}

function Features() {
  return (
    <section id="features" className="scroll-mt-20 border-t border-line bg-paper">
      <div className={cx(section, 'grid gap-12 py-24')}>
        <Reveal className="mx-auto grid max-w-[640px] gap-4 text-center">
          <h2 className={h2}>Everything you need to report from site.</h2>
          <p className="text-[16.5px] leading-relaxed text-muted">Built for patchy signal, busy days and a manager waiting for the report.</p>
        </Reveal>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(([icon, title, text], i) => (
            <Reveal
              as="li"
              key={title}
              delay={(i % 3) * 90}
              className="lift grid content-start gap-3 rounded-2xl border border-line bg-paper p-6 hover:border-amber/40"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-amber-soft text-amber-deep">
                {icon === 'github' ? <GithubIcon className="size-[18px]" /> : <Icon name={icon} className="size-[18px]" />}
              </span>
              <h3 className="text-[16px] font-semibold">{title}</h3>
              <p className="text-[14.5px] leading-relaxed text-muted">{text}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

function OpenSource() {
  return (
    <section id="open-source" className="scroll-mt-20 border-t border-line bg-paper">
      <div className={cx(section, 'grid grid-cols-[minmax(0,1fr)] items-center gap-12 py-24 lg:grid-cols-2 lg:gap-20')}>
        <Reveal className="grid content-start gap-5">
          <h2 className={h2}>Free to use. Open source.</h2>
          <p className="max-w-[50ch] text-[16.5px] leading-relaxed text-muted">
            SiteLens is released under the MIT licence. Read the code, run your own copy, report an issue or help build the next
            feature.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <a href={REPO_URL} target="_blank" rel="noreferrer" className={buttonSecondary}>
              <GithubIcon className="size-[18px]" />
              View on GitHub
            </a>
            <a href={`${REPO_URL}/issues`} target="_blank" rel="noreferrer" className={cx(button, 'text-muted hover:text-heading')}>
              Report an issue
            </a>
          </div>
        </Reveal>
        <pre className="overflow-x-auto rounded-xl border border-line bg-canvas p-6 font-mono text-[13px] leading-relaxed text-ink">
          <span className="text-muted">$</span> git clone {REPO_URL}.git{'\n'}
          <span className="text-muted">$</span> cd SiteLens{'\n'}
          <span className="text-muted">$</span> npm install{'\n'}
          <span className="text-muted">$</span> npm run dev
        </pre>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="border-t border-line bg-canvas">
      <div className={cx(section, 'grid gap-10 py-24 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]')}>
        <h2 className={h2}>Questions</h2>
        <div className="divide-y divide-line border-y border-line">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group py-5">
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-[16px] font-semibold text-heading">
                {q}
                <span className="text-[20px] leading-none font-normal text-muted transition-transform group-open:rotate-45" aria-hidden="true">
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-[60ch] text-[15px] leading-relaxed text-muted">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section className="border-t border-line bg-canvas px-5 py-20 lg:px-8">
      <Reveal className="relative mx-auto grid max-w-[1120px] justify-items-center gap-5 overflow-hidden rounded-3xl bg-gradient-to-br from-[#ff6900] to-[#e65a33] px-6 py-16 text-center">
        <div className="bg-dots absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" aria-hidden="true" />
        <h2 className="relative max-w-[22ch] font-display text-[40px] leading-[1.12] font-semibold text-[#0f172a] max-sm:text-[30px]">
          Finish the report before you leave the site.
        </h2>
        <p className="relative text-[16.5px] text-[#0f172a]/80">Free to use, no sign-up. Open it in your browser or install it on your phone.</p>
        <Link to="/app" className={cx(button, 'relative mt-2 bg-[#0f172a] text-white hover:-translate-y-0.5 hover:bg-[#1e293b]')}>
          Open workspace
          <Icon name="arrow" className="size-4" />
        </Link>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line bg-canvas">
      <div className={cx(section, 'flex flex-wrap items-center justify-between gap-6 py-10')}>
        <div className="grid gap-2">
          <Brand />
          <p className="text-[13.5px] text-muted">© {new Date().getFullYear()} SiteLens. Open source under the MIT licence.</p>
        </div>
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] text-muted" aria-label="Footer">
          <Link to="/app#inspect" className="hover:text-heading">
            Photo inspection
          </Link>
          <Link to="/app#diary" className="hover:text-heading">
            Daily report
          </Link>
          <a href={`${REPO_URL}/blob/main/LICENSE`} target="_blank" rel="noreferrer" className="hover:text-heading">
            MIT licence
          </a>
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="text-heading hover:text-amber-deep" aria-label="SiteLens on GitHub">
            <GithubIcon />
          </a>
        </nav>
      </div>
    </footer>
  );
}
