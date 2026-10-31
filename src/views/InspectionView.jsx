import { useEffect, useRef, useState } from 'react';
import UploadZone, { validateImage } from '../components/UploadZone.jsx';
import Results from '../components/Results.jsx';
import { analyseImage } from '../lib/analyse.js';
import { downloadJson, slugify } from '../lib/format.js';
import { Button, Chip, DocSection, Field, Icon, Input, LinkButton, Spinner, cx, panel } from '../components/ui.jsx';

const today = () => new Date().toISOString().slice(0, 10);

const LOADING_STEPS = [
  'Looking at your photo',
  'Identifying what is on site',
  'Checking for safety hazards',
  'Checking workmanship and quality',
  'Writing up the report',
];

// What the inspection looks for, shown before a photo has been checked.
const CHECKS = [
  ['Safety hazards', 'Open edges, missing guardrails, exposed rebar, missing PPE, unsafe scaffolding and access.'],
  ['Defects and quality issues', 'Honeycombing, cracks, poor alignment, exposed reinforcement and other workmanship problems.'],
  ['Site conditions and activities', 'Housekeeping, stored materials, incomplete or problematic work in progress.'],
  ['Recommended actions', 'A practical next step for each finding, ordered by how urgent it is.'],
];

export default function InspectionView() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [meta, setMeta] = useState({ site: '', inspector: '', date: today() });
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const reportRef = useRef(null);

  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

  useEffect(() => {
    if (status !== 'loading') return;
    setStep(0);
    const t = setInterval(() => setStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1)), 1400);
    return () => clearInterval(t);
  }, [status]);

  const selectFile = (f) => {
    const problem = validateImage(f);
    setUploadError(problem);
    if (problem) return;
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setResult(null);
    setStatus('idle');
  };

  const removeFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setUploadError(null);
    setStatus('idle');
  };

  const analyse = async () => {
    setStatus('loading');
    setError(null);
    if (window.matchMedia('(max-width: 1023px)').matches) reportRef.current?.scrollIntoView({ block: 'start' });
    try {
      setResult(await analyseImage(file));
      setStatus('done');
    } catch (e) {
      setError(e.message || 'Something went wrong while checking the photo.');
      setStatus('error');
    }
  };

  const exportJson = () =>
    downloadJson(
      { inspection: meta, image: file?.name, generatedAt: new Date().toISOString(), ...result },
      `sitelens-${slugify(meta.site || 'inspection')}-${meta.date}.json`,
    );

  const loading = status === 'loading';
  const stage = result ? 3 : loading ? 2 : file ? 2 : 1;

  return (
    <main className="grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] print:block">
      {/* ---------- Photo and details ---------- */}
      <section className={cx(panel, 'no-print overflow-hidden lg:sticky lg:top-4')}>
        <header className="border-b border-line px-5 py-4">
          <h2 className="text-[17px] font-semibold">Photo and details</h2>
          <Stages current={stage} />
        </header>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 px-5 py-5">
          <UploadZone file={file} previewUrl={previewUrl} onFile={selectFile} onRemove={removeFile} error={uploadError} disabled={loading} />

          <fieldset className="grid gap-4">
            <legend className="mb-3 text-[13px] text-muted">Inspection details (optional, shown on the report)</legend>
            <Field label="Site or project">
              <Input value={meta.site} placeholder="e.g. Block B, Lekki Residences" onChange={(e) => setMeta({ ...meta, site: e.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Inspected by">
                <Input value={meta.inspector} placeholder="Your name" onChange={(e) => setMeta({ ...meta, inspector: e.target.value })} />
              </Field>
              <Field label="Date">
                <Input type="date" value={meta.date} onChange={(e) => setMeta({ ...meta, date: e.target.value })} />
              </Field>
            </div>
          </fieldset>
        </div>

        <footer className="grid gap-3 border-t border-line bg-paper-2/60 px-5 py-4">
          <Button variant="primary" size="lg" className="w-full" onClick={analyse} disabled={!file || loading} busy={loading}>
            {loading ? 'Checking photo…' : result ? 'Check this photo again' : 'Check this photo'}
          </Button>
          {!file && !loading && <p className="text-center text-[13px] text-muted">Add a photo to start the inspection.</p>}
          {status === 'error' && (
            <p className="text-[13px] text-critical" role="alert">
              {error} <LinkButton onClick={analyse}>Try again</LinkButton>
            </p>
          )}
        </footer>
      </section>

      {/* ---------- Report ---------- */}
      <section ref={reportRef} className={cx(panel, 'print-plain flex min-w-0 scroll-mt-4 flex-col')} aria-label="Inspection report">
        <div className="no-print flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
          <div className="flex items-center gap-2.5">
            <span className="text-[14px] font-semibold text-heading">Inspection report</span>
            {result ? <Chip tone="low">Report ready</Chip> : loading ? <Chip tone="medium">Checking</Chip> : <Chip>Waiting for a photo</Chip>}
          </div>
          {result && (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="ghost" icon="plus" onClick={removeFile}>
                New inspection
              </Button>
              <Button size="sm" icon="download" variant="primary" onClick={() => window.print()}>
                Download PDF
              </Button>
            </div>
          )}
        </div>

        <div className="px-7 py-7 max-sm:px-4 print:p-0">
          {result ? (
            <Results result={result} meta={meta} previewUrl={previewUrl} />
          ) : loading ? (
            <Analysing previewUrl={previewUrl} step={step} />
          ) : (
            <WhatWeCheck ready={Boolean(file)} />
          )}
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

function Stages({ current }) {
  const stages = ['Add photo', 'Check', 'Review report'];
  return (
    <ol className="mt-3 flex items-center gap-2 text-[12.5px]">
      {stages.map((s, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <li key={s} className="flex items-center gap-2">
            {i > 0 && <span className={cx('h-px w-5', done || active ? 'bg-line-strong/50' : 'bg-line')} aria-hidden="true" />}
            <span
              className={cx(
                'grid size-5 place-items-center rounded-full text-[11px] font-semibold',
                done ? 'bg-low text-white' : active ? 'bg-heading text-paper' : 'bg-paper-2 text-muted',
              )}
            >
              {done ? <Icon name="check" className="size-3" /> : n}
            </span>
            <span className={active ? 'font-medium text-heading' : 'text-muted'} aria-current={active ? 'step' : undefined}>
              {s}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function WhatWeCheck({ ready }) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-1.5">
        <h3 className="text-[19px] font-semibold">{ready ? 'Your photo is ready to check' : 'What the inspection covers'}</h3>
        <p className="max-w-[60ch] text-muted">
          {ready
            ? 'Add the site name and your name if you want them on the report, then select Check this photo.'
            : 'SiteLens looks at what is visible in one photo and reports on the following. Use a clear, well-lit photo taken close to the area of concern.'}
        </p>
      </div>
      <div className="grid gap-5">
        {CHECKS.map(([title, text], i) => (
          <DocSection key={title} n={i + 1} title={title}>
            <p className="text-[14px] text-muted">{text}</p>
          </DocSection>
        ))}
      </div>
      <p className="text-[13px] text-muted">Findings are a first look from a single photo. Always confirm them on site.</p>
    </div>
  );
}

function Analysing({ previewUrl, step }) {
  return (
    <div className="grid gap-6 sm:grid-cols-[minmax(0,240px)_1fr] sm:items-start" aria-live="polite">
      {previewUrl && <img src={previewUrl} alt="Photo being checked" className="aspect-[4/3] w-full rounded-lg bg-navy object-cover" />}
      <div className="grid gap-4">
        <h3 className="text-[17px] font-semibold">Checking your photo</h3>
        <ol className="grid gap-3">
          {LOADING_STEPS.map((s, i) => (
            <li key={s} className={cx('flex items-center gap-3 text-[14px]', i > step && 'text-muted')}>
              <span className="grid size-5 place-items-center">
                {i < step ? (
                  <span className="grid size-5 place-items-center rounded-full bg-low text-white">
                    <Icon name="check" className="size-3" />
                  </span>
                ) : i === step ? (
                  <span className="text-amber">
                    <Spinner />
                  </span>
                ) : (
                  <span className="size-2 rounded-full bg-line" />
                )}
              </span>
              {s}
            </li>
          ))}
        </ol>
        <p className="text-[13px] text-muted">This usually takes 10 to 30 seconds.</p>
      </div>
    </div>
  );
}
