import ThemeToggle from '../components/ThemeToggle.jsx';
import Showcase, { InspectionOutput } from '../components/Showcase.jsx';
import { Brand, GithubIcon, REPO_URL, WORKFLOWS } from '../components/Brand.jsx';
import { Chip, Icon, cx } from '../components/ui.jsx';
import { Link } from '../lib/router.jsx';

const pill = 'inline-flex h-12 items-center justify-center gap-2.5 rounded-full px-6 text-[15px] font-medium no-underline transition-colors';
const pillPrimary = cx(pill, 'bg-amber text-amber-ink hover:bg-amber-hover');
const pillOutline = cx(pill, 'border border-line-strong/20 text-heading hover:bg-paper-2');

const STEPS = [
  ['Capture', 'Take a photo of the area you are checking, or write down the day. Type it, or just speak and SiteLens types for you.'],
  ['The AI analyses it', 'Google’s Gemma AI looks at the photo or reads your notes, then sorts hazards, defects, progress, labour and delays.'],
  ['Review and share', 'Check the report, then download a PDF or send it on WhatsApp or email. Every report is saved on your device.'],
];

const FEATURES = [
  ['camera', 'AI hazard and defect detection', 'Spots visible safety hazards, defects and quality issues in a site photo.'],
  ['check', 'Severity and confidence', 'Every finding is rated from Low to Critical, with how sure the AI is.'],
  ['arrow', 'Recommended actions', 'A practical next step for each problem, listed most urgent first.'],
  ['mic', 'Voice dictation', 'Speak your notes on site instead of typing with dusty hands.'],
  ['sparkle', 'AI tidy-up', 'Turns rough or spoken notes into clear, professional wording, without adding anything.'],
  ['clipboard', 'Live report preview', 'Watch the daily report take shape as you fill in each section.'],
  ['history', 'Missing-info check', 'The AI points out what a daily report usually needs that your notes left out.'],
  ['location', 'Weather fill-in', 'Adds today’s weather for your location in one tap.'],
  ['share', 'PDF, copy and share', 'A clean PDF for the manager, or plain text for WhatsApp and email.'],
  ['download', 'Install it, use it offline', 'Add SiteLens to your phone. Notes and past reports work without signal.'],
  ['copy', 'Reports stay on your device', 'Your saved reports live in your browser, not on our servers.'],
  ['github', 'Free and open source', 'No cost and no sign-up. The code is public on GitHub under the MIT licence.'],
];

const FAQ = [
  [
    'Is SiteLens really free?',
    'Yes. There is no charge and no sign-up. To use the AI, add your own key from Google AI Studio in the workspace. Creating one is free, and Google’s usage limits apply.',
  ],
  [
    'Which AI does it use?',
    'SiteLens uses Google’s Gemma models through the Gemini API, for both reading site photos and writing reports.',
  ],
  [
    'What happens to my photos and notes?',
    'When you check a photo or create a report, that photo or those notes are sent to Google’s AI service, using your key, to be analysed. Your key and your finished reports are saved only in your browser on your device.',
  ],
  [
    'Does it replace a site inspection?',
    'No. SiteLens gives a fast first look from what is visible in a photo or written in your notes. Always confirm findings on site and use professional judgement.',
  ],
];

export default function LandingPage() {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-5 lg:px-8">
          <Brand />
          <div className="flex items-center gap-7">
            <nav className="flex items-center gap-7 text-[14px] text-muted max-lg:hidden" aria-label="Main">
              <a href="#features" className="hover:text-heading">
                Features
              </a>
              <a href="#how-it-works" className="hover:text-heading">
                How it works
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
                className="grid size-10 place-items-center rounded-full text-heading hover:bg-paper-2 max-sm:hidden"
                aria-label="SiteLens on GitHub"
                title="SiteLens on GitHub"
              >
                <GithubIcon />
              </a>
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
        <HowItWorks />
        <FeatureSection
          id="photo-inspection"
          kicker="AI photo inspection"
          title="AI that spots what needs fixing."
          text="Upload a photo of the area you are checking. SiteLens’s AI looks at what is visible, flags safety hazards, defects and quality issues, rates how serious each one is, and recommends what to do, most urgent first."
          tags={['Hazard detection', 'Defects and quality', 'Severity and confidence', 'Recommended actions']}
          cta={WORKFLOWS[0]}
          visual={<InspectionOutput />}
        />
        <FeatureSection
          id="daily-report"
          reverse
          kicker="AI daily reports"
          title="Speak or type. The AI writes the report."
          text="Jot down the day in your own words, or dictate it on site. SiteLens tidies your wording, then turns it into a structured daily report with tables, highlighted problems and recommended actions, and tells you what is missing."
          tags={['Voice dictation', 'AI tidy-up', 'Live preview', 'Missing-info check', 'PDF and sharing']}
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
      {/* Warm band the product showcase sits on. */}
      <div className="absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-b from-transparent via-canvas to-amber/70 opacity-(--band-opacity)" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-[1200px] justify-items-center gap-7 px-5 pt-20 text-center lg:px-8 lg:pt-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3.5 py-1.5 text-[13px] text-heading shadow-sm">
          <Icon name="sparkle" className="size-4 text-amber-deep" />
          Powered by Google Gemma AI
          <span className="h-3.5 w-px bg-line" aria-hidden="true" />
          <span className="text-muted">Free and open source</span>
        </span>
        <h1 className="max-w-[18ch] font-display text-[66px] leading-[1.02] font-semibold tracking-[-0.025em] text-balance text-heading max-lg:text-[54px] max-sm:text-[40px]">
          Your AI assistant for site inspections and daily reports.
        </h1>
        <p className="max-w-[62ch] text-[18px] leading-relaxed text-pretty text-muted max-sm:text-[16px]">
          SiteLens uses AI to spot hazards and defects in your site photos, and to turn rough notes, typed or spoken, into a
          structured daily report your manager can read in a minute.
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
        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[13.5px] text-muted">
          {['Free to use', 'No sign-up', 'Open source (MIT)', 'Works on your phone'].map((t) => (
            <li key={t} className="flex items-center gap-1.5">
              <Icon name="check" className="size-4 text-amber-deep" />
              {t}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative mx-auto max-w-[1200px] px-5 pt-14 pb-24 lg:px-8 lg:pb-28">
        <Showcase />
      </div>
    </section>
  );
}

function SectionIntro({ kicker, title, text, center }) {
  return (
    <div className={cx('grid gap-4', center && 'mx-auto max-w-[680px] text-center')}>
      <p className={cx('flex items-center gap-2 text-[13px] font-medium text-amber-deep', center && 'justify-center')}>
        <Icon name="sparkle" className="size-4" />
        {kicker}
      </p>
      <h2 className="font-display text-[42px] leading-[1.08] font-semibold tracking-tight text-balance max-sm:text-[30px]">{title}</h2>
      {text && <p className="text-[16.5px] leading-relaxed text-muted">{text}</p>}
    </div>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-b border-line bg-canvas">
      <div className="mx-auto grid max-w-[1200px] gap-12 px-5 py-20 lg:px-8 lg:py-24">
        <SectionIntro center kicker="How it works" title="From site to finished report in three steps." />
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map(([title, text], i) => (
            <li key={title} className="grid content-start gap-3 rounded-2xl border border-line bg-paper p-7">
              <span className="grid size-10 place-items-center rounded-full bg-amber text-[15px] font-semibold text-amber-ink">{i + 1}</span>
              <h3 className="text-[17px] font-semibold">{title}</h3>
              <p className="text-[14.5px] leading-relaxed text-muted">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function FeatureSection({ id, kicker, title, text, tags, cta, visual, reverse }) {
  return (
    <section id={id} className={cx('scroll-mt-20 border-b border-line', reverse ? 'bg-canvas' : 'bg-paper')}>
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:gap-20 lg:px-8 lg:py-24">
        <div className={cx('grid content-start gap-6', reverse && 'lg:order-2')}>
          <SectionIntro kicker={kicker} title={title} text={text} />
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
        <div className={cx('rounded-3xl p-8 max-sm:p-4', reverse ? 'bg-paper-2' : 'bg-canvas', reverse && 'lg:order-1')}>{visual}</div>
      </div>
    </section>
  );
}

// A compact view of a finished daily report for the feature section.
function DiaryVisual() {
  return (
    <div className="mx-auto grid max-w-[460px] gap-4 rounded-xl border border-line bg-paper p-5 shadow-[0_30px_60px_-35px_rgb(15_23_42/0.4)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11.5px] text-muted">Daily site report, Saturday 31 October</p>
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
      <p className="flex items-start gap-2 rounded-md bg-amber-soft px-3 py-2 text-[12px] text-ink">
        <Icon name="sparkle" className="mt-0.5 size-3.5 text-amber-deep" />
        Your notes don’t say how many hours the afternoon labourers worked.
      </p>
    </div>
  );
}

function Features() {
  return (
    <section id="features" className="scroll-mt-20 border-b border-line bg-paper">
      <div className="mx-auto grid max-w-[1200px] gap-12 px-5 py-20 lg:px-8 lg:py-24">
        <SectionIntro
          center
          kicker="Features"
          title="Everything you need to report from site."
          text="Two AI tools, built for patchy signal, busy days and a manager waiting for the report."
        />
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(([icon, title, text]) => (
            <li key={title} className="grid content-start gap-3 bg-paper p-6">
              <span className="grid size-10 place-items-center rounded-xl bg-amber-soft text-amber-deep">
                {icon === 'github' ? <GithubIcon className="size-[18px]" /> : <Icon name={icon} className="size-[18px]" />}
              </span>
              <h3 className="text-[15.5px] font-semibold">{title}</h3>
              <p className="text-[14px] leading-relaxed text-muted">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function OpenSource() {
  return (
    <section id="open-source" className="scroll-mt-20 bg-navy text-white">
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:px-8 lg:py-24">
        <div className="grid content-start gap-6">
          <p className="flex items-center gap-2 text-[13px] font-medium text-amber">
            <GithubIcon className="size-4" />
            Open source
          </p>
          <h2 className="font-display text-[42px] leading-[1.08] font-semibold tracking-tight text-white max-sm:text-[30px]">
            Free to use. Open for everyone.
          </h2>
          <p className="max-w-[52ch] text-[16.5px] leading-relaxed text-white/70">
            SiteLens is free and open source under the MIT licence. Read the code, run your own copy, report an issue or help build
            the next feature.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href={REPO_URL} target="_blank" rel="noreferrer" className={cx(pill, 'bg-white text-[#0f172a] hover:bg-white/90')}>
              <GithubIcon />
              View on GitHub
            </a>
            <a href={`${REPO_URL}/issues`} target="_blank" rel="noreferrer" className={cx(pill, 'border border-white/25 text-white hover:bg-white/10')}>
              Report an issue
            </a>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30 font-mono text-[13px]">
          <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-white/20" />
            <span className="size-2.5 rounded-full bg-white/20" />
            <span className="size-2.5 rounded-full bg-white/20" />
          </div>
          <pre className="overflow-x-auto p-5 leading-relaxed text-white/85">
            <span className="text-white/40"># Run SiteLens on your own computer</span>
            {'\n'}
            <span className="text-amber">$</span> git clone {REPO_URL}.git
            {'\n'}
            <span className="text-amber">$</span> cd SiteLens
            {'\n'}
            <span className="text-amber">$</span> npm install
            {'\n'}
            <span className="text-amber">$</span> npm run dev
          </pre>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="border-b border-line bg-canvas">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-20 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:px-8 lg:py-24">
        <SectionIntro kicker="Questions" title="Good to know." />
        <div className="divide-y divide-line rounded-2xl border border-line bg-paper">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group px-6 py-5">
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-[16px] font-semibold text-heading">
                {q}
                <Icon name="chevron" className="size-4 text-muted transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section className="bg-canvas px-5 py-20 lg:px-8">
      <div className="mx-auto grid max-w-[1200px] justify-items-center gap-5 rounded-3xl bg-gradient-to-br from-[#ff6900] to-[#e65a33] px-6 py-16 text-center">
        <h2 className="max-w-[22ch] font-display text-[40px] leading-[1.08] font-semibold text-[#0f172a] max-sm:text-[30px]">
          Finish the report before you leave the site.
        </h2>
        <p className="max-w-[52ch] text-[16px] text-[#0f172a]/80">Free to use, no sign-up. Open it in your browser, or install it on your phone.</p>
        <Link to="/app" className={cx(pill, 'bg-[#0f172a] text-white hover:bg-[#1e293b]')}>
          Open workspace
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  const columns = [
    [
      'Product',
      [
        ['Photo inspection', '/app#inspect', 'app'],
        ['Daily report', '/app#diary', 'app'],
        ['Features', '#features'],
      ],
    ],
    [
      'Open source',
      [
        ['GitHub', REPO_URL, 'external'],
        ['Report an issue', `${REPO_URL}/issues`, 'external'],
        ['MIT licence', `${REPO_URL}/blob/main/LICENSE`, 'external'],
      ],
    ],
  ];

  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-14 md:grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(0,1fr))] lg:px-8">
        <div className="grid content-start gap-4">
          <Brand />
          <p className="max-w-[40ch] text-[14px] leading-relaxed text-muted">
            AI site inspections and daily reports for site engineers, supervisors and construction managers.
          </p>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-line px-3.5 py-1.5 text-[13.5px] font-medium text-heading hover:bg-paper-2"
          >
            <GithubIcon className="size-4" />
            Star on GitHub
          </a>
        </div>
        {columns.map(([heading, links]) => (
          <div key={heading} className="grid content-start gap-3">
            <h3 className="text-[13px] font-semibold text-heading">{heading}</h3>
            <ul className="grid gap-2 text-[14px] text-muted">
              {links.map(([label, href, kind]) => (
                <li key={label}>
                  {kind === 'app' ? (
                    <Link to={href} className="hover:text-heading">
                      {label}
                    </Link>
                  ) : (
                    <a href={href} className="hover:text-heading" {...(kind === 'external' ? { target: '_blank', rel: 'noreferrer' } : {})}>
                      {label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-5 py-6 text-[13px] text-muted lg:px-8">
          <span>© {new Date().getFullYear()} SiteLens. Free and open source under the MIT licence.</span>
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="text-heading hover:text-amber-deep" aria-label="SiteLens on GitHub">
            <GithubIcon />
          </a>
        </div>
      </div>
    </footer>
  );
}
