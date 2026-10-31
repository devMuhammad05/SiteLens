import { Link } from '../lib/router.jsx';

export const WORKFLOWS = [
  {
    id: 'inspect',
    label: 'Site photo inspection',
    short: 'Photo inspection',
    icon: 'camera',
    cta: 'Inspect a site photo',
    title: 'Inspect a site photo',
    blurb: 'Upload a photo and get the visible hazards, defects and quality issues, rated by severity, with what to do next.',
  },
  {
    id: 'diary',
    label: 'Daily site report',
    short: 'Daily report',
    icon: 'clipboard',
    cta: 'Create a daily report',
    title: 'Write today’s site report',
    blurb: 'Type your notes in your own words and get a structured daily report for your construction manager.',
  },
];

export function Logo() {
  return (
    <span aria-hidden="true" className="grid size-8 place-items-center rounded-md bg-[#17263d] ring-1 ring-white/10">
      <svg viewBox="0 0 24 24" className="size-[17px]" fill="none" stroke="#e9ac28" strokeWidth="2.6" strokeLinecap="round">
        <circle cx="10.5" cy="10.5" r="5.5" />
        <path d="M14.8 14.8 19 19" />
      </svg>
    </span>
  );
}

// Logo and wordmark, linking home.
export function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5 no-underline" aria-label="SiteLens home">
      <Logo />
      <span className="font-display text-[22px] font-semibold tracking-tight text-heading">
        Site<span className="text-amber-deep italic">Lens</span>
      </span>
    </Link>
  );
}
