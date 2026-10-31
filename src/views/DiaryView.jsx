import { useEffect, useRef, useState } from 'react';
import DiaryReport from '../components/DiaryReport.jsx';
import DiaryDraft from '../components/DiaryDraft.jsx';
import NoteField from '../components/NoteField.jsx';
import AskReports from '../components/AskReports.jsx';
import { appendPhrase } from '../lib/speech.js';
import {
  Button,
  Chip,
  Field,
  FormSection,
  Icon,
  Input,
  LinkButton,
  Progress,
  cx,
  panel,
  statusTone,
} from '../components/ui.jsx';
import {
  EXAMPLE_NOTES,
  NOTE_FIELDS,
  deleteDiary,
  diaryToText,
  emptyNotes,
  fetchWeather,
  generateDiary,
  loadDiaries,
  loadProfile,
  saveDiary,
  saveProfile,
} from '../lib/diary.js';
import { downloadJson, longDate, slugify } from '../lib/format.js';

const today = () => new Date().toISOString().slice(0, 10);
const newId = () => `d${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const newEntry = () => {
  const profile = loadProfile();
  return {
    id: newId(),
    project: profile.project,
    preparedBy: profile.preparedBy,
    date: today(),
    weather: { conditions: '', temperature: '', notes: '' },
    notes: emptyNotes(),
  };
};

const LOADING_STEPS = ['Reading your notes…', 'Sorting out labour and progress…', 'Picking out problems and delays…', 'Writing up the report…'];

// Form groups, in the order a site engineer runs through their day.
const NOTE_TITLES = {
  progress: 'Work progress',
  labour: 'Labour and equipment',
  deliveries: 'Deliveries and visitors',
  problems: 'Problems and delays',
  safety: 'Health and safety',
  tomorrow: 'Planned activities for tomorrow',
};

const WEATHER_OPTIONS = ['Sunny', 'Partly cloudy', 'Overcast', 'Light rain', 'Heavy rain', 'Thunderstorm', 'Windy', 'Harmattan haze'];

const snapshot = (e) => JSON.stringify({ ...e, id: undefined });

export default function DiaryView() {
  const [entry, setEntry] = useState(newEntry);
  const [result, setResult] = useState(null);
  const [generatedFrom, setGeneratedFrom] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [error, setError] = useState(null);
  const [step, setStep] = useState(0);
  const [diaries, setDiaries] = useState(loadDiaries);
  const [weatherMsg, setWeatherMsg] = useState(null);
  const [flash, setFlash] = useState(null);
  const [openSections, setOpenSections] = useState(() => new Set(['project', 'progress']));
  const previewRef = useRef(null);

  useEffect(() => {
    if (status !== 'loading') return;
    setStep(0);
    const t = setInterval(() => setStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1)), 1600);
    return () => clearInterval(t);
  }, [status]);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 3000);
    return () => clearTimeout(t);
  }, [flash]);

  const set = (patch) => setEntry((e) => ({ ...e, ...patch }));
  const setWeather = (patch) => setEntry((e) => ({ ...e, weather: { ...e.weather, ...patch } }));
  const setNote = (key, value) => setEntry((e) => ({ ...e, notes: { ...e.notes, [key]: value } }));
  const toggleSection = (key) =>
    setOpenSections((s) => {
      const next = new Set(s);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const showPreview = () => {
    // On stacked layouts the preview sits below the form, so bring it into view.
    if (window.matchMedia('(max-width: 1023px)').matches) previewRef.current?.scrollIntoView({ block: 'start' });
  };

  const generate = async () => {
    setStatus('loading');
    setError(null);
    try {
      const r = await generateDiary(entry);
      setResult(r);
      setGeneratedFrom(snapshot(entry));
      setDiaries(saveDiary(entry, r));
      saveProfile({ project: entry.project, preparedBy: entry.preparedBy });
      setStatus('done');
      showPreview();
    } catch (e) {
      setError(e.message || 'Could not create the report.');
      setStatus('error');
    }
  };

  const lookupWeather = async () => {
    setWeatherMsg('Getting the weather for your location…');
    try {
      setWeather(await fetchWeather(entry.date));
      setWeatherMsg(null);
    } catch (e) {
      setWeatherMsg(e.message);
    }
  };

  const loadExample = () => {
    const filled = NOTE_FIELDS.some((f) => entry.notes[f.key].trim());
    if (filled && !window.confirm('Replace your notes with the example notes?')) return;
    set({ notes: { ...EXAMPLE_NOTES } });
    setOpenSections(new Set(['project', ...NOTE_FIELDS.map((f) => f.key)]));
  };

  const startNew = () => {
    if (result === null && hasNotes && !window.confirm('Start a new report? Your current notes will be cleared.')) return;
    setEntry(newEntry());
    setResult(null);
    setGeneratedFrom(null);
    setStatus('idle');
    setError(null);
    setOpenSections(new Set(['project', 'progress']));
  };

  const open = (d) => {
    setEntry(d.entry);
    setResult(d.result);
    setGeneratedFrom(snapshot(d.entry));
    setStatus('done');
    setError(null);
    previewRef.current?.scrollIntoView({ block: 'start' });
  };

  const remove = (d) => {
    if (!window.confirm(`Delete the report for ${longDate(d.entry.date)}? This can't be undone.`)) return;
    setDiaries(deleteDiary(d.id));
    if (d.id === entry.id) {
      setEntry(newEntry());
      setResult(null);
      setGeneratedFrom(null);
      setStatus('idle');
    }
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(diaryToText(entry, result));
      setFlash('Report copied. Paste it into an email or WhatsApp.');
    } catch {
      setFlash('Could not copy. Select the report text and copy it manually.');
    }
  };

  const share = async () => {
    const text = diaryToText(entry, result);
    if (navigator.share) {
      try {
        await navigator.share({ title: `Daily site report: ${entry.project || 'Site'}, ${longDate(entry.date)}`, text });
      } catch (e) {
        if (e.name !== 'AbortError') setFlash('Sharing did not work. Use Copy instead.');
      }
      return;
    }
    // Desktop browsers without a share sheet: copying is the most useful fallback.
    await copyText();
  };

  const exportJson = () =>
    downloadJson(
      { diary: entry, generatedAt: new Date().toISOString(), report: result },
      `sitelens-diary-${slugify(entry.project || 'site')}-${entry.date}.json`,
    );

  const loading = status === 'loading';
  const hasNotes = NOTE_FIELDS.some((f) => entry.notes[f.key].trim());
  const stale = result && generatedFrom && generatedFrom !== snapshot(entry);

  const filled = {
    project: Boolean(entry.project.trim() && entry.preparedBy.trim()),
    weather: Boolean(entry.weather.conditions.trim()),
    ...Object.fromEntries(NOTE_FIELDS.map((f) => [f.key, Boolean(entry.notes[f.key].trim())])),
  };
  const filledCount = Object.values(filled).filter(Boolean).length;
  const totalSections = Object.keys(filled).length;

  return (
    <main className="grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] print:block">
      {/* ---------- Input workspace ---------- */}
      <div className="no-print grid min-w-0 gap-5">
        <section className={cx(panel, 'overflow-hidden')}>
          <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
            <div>
              <h2 className="text-[17px] font-semibold">Today's site notes</h2>
              <p className="mt-0.5 text-[13px] text-muted">
                {filledCount} of {totalSections} sections filled in. Type or dictate; shorthand is fine.
              </p>
            </div>
            <LinkButton className="mt-0.5 flex-none text-[13px]" onClick={loadExample} disabled={loading}>
              Use example notes
            </LinkButton>
          </header>

          <FormSection
            title="Project information"
            description={[entry.project, longDate(entry.date)].filter(Boolean).join(', ') || 'Site, date and who prepared the report'}
            filled={filled.project}
            open={openSections.has('project')}
            onToggle={() => toggleSection('project')}
          >
            <Field label="Site or project">
              <Input value={entry.project} placeholder="e.g. Lekki Residences, Block B" onChange={(e) => set({ project: e.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Report date">
                <Input type="date" value={entry.date} onChange={(e) => set({ date: e.target.value })} />
              </Field>
              <Field label="Prepared by">
                <Input value={entry.preparedBy} placeholder="Your name" onChange={(e) => set({ preparedBy: e.target.value })} />
              </Field>
            </div>
          </FormSection>

          <FormSection
            title="Weather and site conditions"
            description={[entry.weather.conditions, entry.weather.temperature].filter(Boolean).join(', ') || 'Conditions and temperature'}
            filled={filled.weather}
            open={openSections.has('weather')}
            onToggle={() => toggleSection('weather')}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Conditions">
                <Input
                  list="weather-options"
                  value={entry.weather.conditions}
                  placeholder="e.g. Rain, then sunny"
                  onChange={(e) => setWeather({ conditions: e.target.value })}
                />
              </Field>
              <Field label="Temperature">
                <Input value={entry.weather.temperature} placeholder="e.g. 24–31°C" onChange={(e) => setWeather({ temperature: e.target.value })} />
              </Field>
            </div>
            <datalist id="weather-options">
              {WEATHER_OPTIONS.map((w) => (
                <option key={w} value={w} />
              ))}
            </datalist>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm" icon="location" onClick={lookupWeather} disabled={loading}>
                Fill in from my location
              </Button>
              {weatherMsg && <span className="text-[13px] text-muted">{weatherMsg}</span>}
            </div>
            {entry.weather.notes && <p className="text-[13px] text-muted">{entry.weather.notes}</p>}
          </FormSection>

          {NOTE_FIELDS.map((f) => (
            <FormSection
              key={f.key}
              title={NOTE_TITLES[f.key] || f.label}
              description={entry.notes[f.key].trim() ? entry.notes[f.key] : f.placeholder}
              filled={filled[f.key]}
              open={openSections.has(f.key)}
              onToggle={() => toggleSection(f.key)}
            >
              <NoteField
                title={NOTE_TITLES[f.key] || f.label}
                value={entry.notes[f.key]}
                placeholder={f.placeholder}
                disabled={loading}
                onChange={(text) => setNote(f.key, text)}
                onAppend={(phrase) => setEntry((e) => ({ ...e, notes: { ...e.notes, [f.key]: appendPhrase(e.notes[f.key], phrase) } }))}
              />
            </FormSection>
          ))}

          <footer className="grid gap-3 border-t border-line bg-paper-2/60 px-5 py-4">
            <Button variant="primary" size="lg" className="w-full" onClick={generate} disabled={!hasNotes || loading} busy={loading}>
              {loading ? 'Creating report…' : result ? 'Update report' : 'Create report'}
            </Button>
            {!hasNotes && !loading && <p className="text-center text-[13px] text-muted">Add notes to at least one section to create a report.</p>}
            {loading && <Progress text={LOADING_STEPS[step]} />}
            {status === 'error' && (
              <p className="text-[13px] text-critical" role="alert">
                {error} {hasNotes && <LinkButton onClick={generate}>Try again</LinkButton>}
              </p>
            )}
          </footer>
        </section>

        <AskReports diaries={diaries} onOpen={open} />
        <PastReports diaries={diaries} currentId={entry.id} onOpen={open} onDelete={remove} />
      </div>

      {/* ---------- Live report preview ---------- */}
      <section
        ref={previewRef}
        className={cx(panel, 'print-plain flex min-w-0 scroll-mt-4 flex-col lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)]')}
        aria-label="Report preview"
      >
        <div className="no-print flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
          <div className="flex items-center gap-2.5">
            <span className="text-[14px] font-semibold text-heading">Report preview</span>
            {result ? stale ? <Chip tone="medium">Notes changed</Chip> : <Chip tone="low">Report ready</Chip> : <Chip>Live draft</Chip>}
          </div>
          <div className="flex flex-wrap gap-2">
            {result ? (
              <>
                <Button size="sm" variant="ghost" icon="plus" onClick={startNew}>
                  New
                </Button>
                <Button size="sm" icon="copy" onClick={copyText}>
                  Copy
                </Button>
                <Button size="sm" icon="share" onClick={share}>
                  Share
                </Button>
                <Button size="sm" variant="primary" icon="download" onClick={() => window.print()}>
                  Download PDF
                </Button>
              </>
            ) : (
              <Button size="sm" variant="primary" onClick={generate} disabled={!hasNotes || loading} busy={loading}>
                {loading ? 'Creating…' : 'Create report'}
              </Button>
            )}
          </div>
        </div>

        {(flash || stale) && (
          <div className="no-print grid gap-2 border-b border-line px-5 py-3 text-[13px]" aria-live="polite">
            {flash && <p className="text-heading">{flash}</p>}
            {stale && (
              <p className="text-muted">
                You've changed your notes since this report was created.{' '}
                <LinkButton onClick={generate} disabled={loading}>
                  Update report
                </LinkButton>
              </p>
            )}
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-7 py-7 max-sm:px-4 print:overflow-visible print:p-0">
          {result ? <DiaryReport entry={entry} result={result} /> : <DiaryDraft entry={entry} />}
        </div>

        {result && (
          <div className="no-print flex justify-end border-t border-line px-5 py-2.5">
            <LinkButton className="text-[12.5px] text-muted" onClick={exportJson}>
              Download report data (JSON)
            </LinkButton>
          </div>
        )}
      </section>
    </main>
  );
}

function PastReports({ diaries, currentId, onOpen, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? diaries : diaries.slice(0, 5);

  return (
    <section className={cx(panel, 'no-print')}>
      <header className="flex items-center gap-2.5 border-b border-line px-5 py-3.5">
        <Icon name="history" className="size-4 text-muted" />
        <h2 className="flex-1 text-[15px] font-semibold">Past reports</h2>
        <span className="text-[13px] text-muted tabular-nums">{diaries.length}</span>
      </header>
      {diaries.length ? (
        <ul className="divide-y divide-line">
          {shown.map((d) => (
            <li key={d.id} className={cx('flex items-center', d.id === currentId && 'bg-amber-soft')}>
              <button
                type="button"
                className="grid min-w-0 flex-1 cursor-pointer grid-cols-[1fr_auto] items-center gap-x-3 px-5 py-3 text-left hover:bg-paper-2"
                onClick={() => onOpen(d)}
              >
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-medium text-heading">{d.entry.project || 'Untitled project'}</span>
                  <span className="block text-[12.5px] text-muted">{longDate(d.entry.date, true)}</span>
                </span>
                <Chip tone={statusTone(d.result.status)}>{d.result.status}</Chip>
              </button>
              <button
                type="button"
                className="mr-3 grid size-8 flex-none cursor-pointer place-items-center rounded-lg text-muted hover:bg-critical/8 hover:text-critical"
                title="Delete report"
                aria-label={`Delete report for ${longDate(d.entry.date)}`}
                onClick={() => onDelete(d)}
              >
                <Icon name="trash" className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-5 py-4 text-[13px] text-muted">Reports you create are saved on this device, so you can open them again later.</p>
      )}
      {diaries.length > 5 && (
        <div className="border-t border-line px-5 py-2.5">
          <LinkButton className="text-[13px]" onClick={() => setExpanded((x) => !x)}>
            {expanded ? 'Show fewer' : `Show all ${diaries.length}`}
          </LinkButton>
        </div>
      )}
    </section>
  );
}
