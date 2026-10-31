// Shared building blocks for SiteLens. Every screen uses these so spacing, radii and colour stay consistent:
// 6px radius for controls, 8px for panels, hairline borders instead of shadows.

export const cx = (...c) => c.filter(Boolean).join(' ');

/* ---------- Icons (24px stroke set) ---------- */

const ICONS = {
  camera: 'M3 8.5A1.5 1.5 0 0 1 4.5 7h2.3l1.4-2h7.6l1.4 2h2.3A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5v-9ZM12 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z',
  clipboard: 'M9 4h6v3H9zM8 5.5H6.5A1.5 1.5 0 0 0 5 7v12.5A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V7a1.5 1.5 0 0 0-1.5-1.5H16M8.5 12h7M8.5 16h5',
  chevron: 'm6 9 6 6 6-6',
  check: 'm5 12.5 4.5 4.5L19 7.5',
  upload: 'M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3M12 15V4M7.5 8.5 12 4l4.5 4.5',
  download: 'M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3M12 4v11M7.5 10.5 12 15l4.5-4.5',
  copy: 'M9 9h10.5v10.5H9zM15 9V4.5H4.5V15H9',
  share: 'M12 15V3.5M7.5 8 12 3.5 16.5 8M5 12v7.5h14V12',
  plus: 'M12 5v14M5 12h14',
  sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  moon: 'M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z',
  location: 'M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  trash: 'M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13',
  history: 'M3.5 12a8.5 8.5 0 1 0 2.5-6M3.5 4v4h4M12 8v4.5l3 2',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  mic: 'M12 3.5a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0v-5a3 3 0 0 0-3-3ZM5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21',
  stop: 'M7 7h10v10H7z',
  sparkle: 'M12 3.5l1.8 5.2 5.2 1.8-5.2 1.8L12 17.5l-1.8-5.2L5 10.5l5.2-1.8L12 3.5ZM18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z',
  undo: 'M9 14 4.5 9.5 9 5M4.5 9.5H15a5 5 0 0 1 0 10h-3',
};

export function Icon({ name, className = 'size-[18px]' }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cx('flex-none', className)} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={ICONS[name]} />
    </svg>
  );
}

/* ---------- Buttons ---------- */

const BUTTON = {
  base: 'inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50',
  variant: {
    primary: 'border-amber bg-amber text-amber-ink hover:enabled:bg-[#dba020]',
    dark: 'border-heading bg-heading text-paper hover:enabled:opacity-90',
    secondary: 'border-line bg-paper text-heading hover:enabled:border-line-strong/40 hover:enabled:bg-paper-2',
    ghost: 'border-transparent bg-transparent text-heading hover:enabled:bg-paper-2',
    danger: 'border-line bg-paper text-critical hover:enabled:bg-critical/8',
    navbar: 'border-white/15 bg-transparent text-white hover:enabled:bg-white/10',
  },
  size: {
    sm: 'h-8 px-3 text-[13px]',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-5 text-[15px]',
    icon: 'size-9 p-0',
  },
};

export function Button({ variant = 'secondary', size = 'md', busy = false, icon, className, children, ...props }) {
  return (
    <button
      type="button"
      className={cx(BUTTON.base, BUTTON.variant[variant], BUTTON.size[size], busy && 'disabled:cursor-progress disabled:opacity-90', className)}
      {...props}
    >
      {busy ? <Spinner /> : icon ? <Icon name={icon} className="size-4" /> : null}
      {children}
    </button>
  );
}

export const LinkButton = ({ className, ...props }) => (
  <button
    type="button"
    className={cx('cursor-pointer font-medium text-heading underline decoration-line-strong/30 underline-offset-4 hover:enabled:decoration-amber disabled:opacity-50', className)}
    {...props}
  />
);

export const Spinner = () => <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />;

/* ---------- Form controls ---------- */

export const inputClass =
  'w-full min-w-0 rounded-md border border-line bg-paper px-3 py-2 text-[14px] text-ink transition-colors hover:border-line-strong/30 focus:border-amber focus:outline-none focus:ring-3 focus:ring-amber/25';

export function Field({ label, hint, children, className }) {
  return (
    <label className={cx('grid gap-1.5', className)}>
      <span className="text-[13px] font-medium text-heading">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}

export const Input = (props) => <input className={cx(inputClass, 'h-10')} {...props} />;
export const Textarea = (props) => <textarea className={cx(inputClass, 'min-h-24 resize-y leading-relaxed')} {...props} />;

/* A collapsible group of form fields. Shows whether the group has content so users can see what's left. */
export function FormSection({ title, description, filled, open, onToggle, children }) {
  return (
    <section className="border-b border-line last:border-b-0">
      <button
        type="button"
        className="flex w-full cursor-pointer items-center gap-3 px-5 py-4 text-left hover:bg-paper-2/60"
        aria-expanded={open}
        onClick={onToggle}
      >
        <span
          className={cx(
            'grid size-5 flex-none place-items-center rounded-full border',
            filled ? 'border-low bg-low text-white' : 'border-line bg-paper',
          )}
          aria-hidden="true"
        >
          {filled && <Icon name="check" className="size-3" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold text-heading">{title}</span>
          {!open && description && <span className="block truncate text-[13px] text-muted">{description}</span>}
        </span>
        <span className="sr-only">{filled ? 'Filled in' : 'Not filled in yet'}</span>
        <Icon name="chevron" className={cx('size-4 text-muted transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="grid gap-4 px-5 pb-5 pl-13">{children}</div>}
    </section>
  );
}

/* ---------- Status ---------- */

export const TONE_TEXT = { low: 'text-low', medium: 'text-medium', high: 'text-high', critical: 'text-critical', muted: 'text-muted' };
const TONE_SOLID = { low: 'bg-low', medium: 'bg-medium', high: 'bg-high', critical: 'bg-critical', muted: 'bg-muted' };
export const TONE_BORDER = { low: 'border-l-low', medium: 'border-l-medium', high: 'border-l-high', critical: 'border-l-critical', muted: 'border-l-line' };

export const severityTone = (s) => String(s).toLowerCase();

const STATUS_TONE = {
  'on track': 'low', 'minor delays': 'medium', delayed: 'high', stopped: 'critical',
  completed: 'low', 'in progress': 'medium', started: 'medium', 'not started': 'muted',
  none: 'low', minor: 'medium', moderate: 'high', severe: 'critical',
  working: 'low', idle: 'medium', 'broken down': 'critical',
};
export const statusTone = (s) => STATUS_TONE[String(s).toLowerCase()] || 'muted';

// Soft chip for statuses; `solid` for severities so they stand out in a register.
export function Chip({ tone = 'muted', solid = false, children }) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        solid ? cx(TONE_SOLID[tone], 'text-sev-ink') : cx(TONE_TEXT[tone], 'bg-current/10'),
      )}
    >
      {children}
    </span>
  );
}

export const Count = ({ children }) => <span className="rounded-md bg-paper-2 px-1.5 text-xs font-medium text-muted tabular-nums">{children}</span>;

export function Progress({ text }) {
  return (
    <div aria-live="polite">
      <div className="relative h-1 overflow-hidden rounded-full bg-paper-2">
        <div className="absolute inset-y-0 w-2/5 animate-indeterminate rounded-full bg-amber" />
      </div>
      <p className="mt-2 text-[13px] text-muted">{text}</p>
    </div>
  );
}

export const panel = 'rounded-lg border border-line bg-paper';

export function Notice({ tone = 'amber', children }) {
  return (
    <div className={cx('rounded-md border px-4 py-3 text-[13.5px]', tone === 'amber' ? 'border-amber/40 bg-amber-soft text-ink' : 'border-line bg-paper-2 text-ink')}>
      {children}
    </div>
  );
}

export const Bullets = ({ items }) => (
  <ul className="grid gap-1.5">
    {items.map((t, i) => (
      <li key={i} className="relative pl-4 before:absolute before:top-[0.62em] before:left-0 before:size-1.5 before:rounded-full before:bg-line-strong/40">
        {t}
      </li>
    ))}
  </ul>
);

/* ---------- Report document ---------- */

/* The header of a report document: what it is, which project, and the key facts in a ruled grid. */
export function DocHeader({ kind, title, cells, status }) {
  return (
    <header className="avoid-break grid gap-4">
      <div className="flex items-center justify-between gap-3 border-b-2 border-line-strong pb-2 font-mono text-[11px] tracking-wide text-muted">
        <span className="flex items-center gap-2 text-heading">
          <span className="size-2 rounded-[2px] bg-amber" aria-hidden="true" />
          SITELENS
        </span>
        <span>{kind.toUpperCase()}</span>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <h2 className="min-w-0 font-display text-[32px] leading-[1.05] font-semibold tracking-tight break-words max-sm:text-[26px]">{title}</h2>
        {status && (
          <div className={cx('flex items-center gap-2 rounded-md border border-current/25 bg-current/8 px-3 py-1.5', TONE_TEXT[status.tone])}>
            <span className="text-xs">{status.label}</span>
            <strong className="text-[15px] font-semibold">{status.value}</strong>
          </div>
        )}
      </div>
      <dl className="grid grid-cols-2 overflow-hidden rounded-md border border-line sm:grid-flow-col sm:auto-cols-fr sm:grid-cols-none">
        {cells.map(([k, v], i) => (
          <div
            key={k}
            className={cx(
              'border-line bg-paper-2/60 px-3.5 py-2.5',
              i > 0 && 'sm:border-l',
              i % 2 === 1 && 'max-sm:border-l',
              i > 1 && 'max-sm:border-t',
              i === cells.length - 1 && i % 2 === 0 && 'max-sm:col-span-2',
            )}
          >
            <dt className="font-mono text-[10.5px] tracking-wide text-muted uppercase">{k}</dt>
            <dd className="text-[13.5px] leading-snug font-medium break-words text-heading">{v || '—'}</dd>
          </div>
        ))}
      </dl>
    </header>
  );
}

/* A numbered report section, the way site reports and specs are laid out. */
export function DocSection({ n, title, count, children }) {
  return (
    <section className="avoid-break grid gap-3">
      <h3 className="flex items-baseline gap-2.5 border-b border-line pb-2 font-display text-[19px] font-semibold">
        <span className="w-6 font-mono text-[12px] text-amber-deep tabular-nums">{String(n).padStart(2, '0')}</span>
        <span className="flex-1">{title}</span>
        {count != null && <Count>{count}</Count>}
      </h3>
      <div className="grid gap-3 pl-8.5 max-sm:pl-0">{children}</div>
    </section>
  );
}

export const Empty = ({ children = 'Nothing entered yet.' }) => <p className="text-[13.5px] text-muted italic">{children}</p>;

export function DocTable({ head, children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[13.5px]">
        <thead>
          <tr className="border-b border-line text-left text-xs text-muted">
            {head.map((h) => (
              <th key={h} className="py-2 pr-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_td]:py-2 [&_td]:pr-3 [&_td]:align-top [&_tr]:border-b [&_tr]:border-line [&_tr:last-child]:border-b-0">{children}</tbody>
      </table>
    </div>
  );
}

// Plain-text notes as typed, kept readable in the draft preview.
export const NoteText = ({ text }) => <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{text}</p>;
