import { useEffect, useState } from 'react';
import UploadZone, { validateImage } from './components/UploadZone.jsx';
import Results from './components/Results.jsx';
import { analyseImage, isDemoMode, modelName } from './lib/analyse.js';

const today = () => new Date().toISOString().slice(0, 10);

const LOADING_STEPS = [
  'Reading site photograph…',
  'Identifying construction elements…',
  'Checking for safety hazards…',
  'Assessing workmanship…',
  'Compiling inspection report…',
];

export default function App() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [meta, setMeta] = useState({ site: '', inspector: '', date: today() });
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

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
    try {
      setResult(await analyseImage(file));
      setStatus('done');
    } catch (e) {
      setError(e.message || 'Analysis failed.');
      setStatus('error');
    }
  };

  const exportJson = () => {
    const payload = { inspection: meta, image: file?.name, generatedAt: new Date().toISOString(), ...result };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `sitelens-${(meta.site || 'inspection').replace(/\W+/g, '-').toLowerCase()}-${meta.date}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const loading = status === 'loading';

  return (
    <div className="app">
      <header className="topbar no-print">
        <div className="brand">
          <span className="logo" aria-hidden="true" />
          <div>
            <h1>SiteLens</h1>
            <p>AI-assisted construction site inspection</p>
          </div>
        </div>
        <span className={`mode ${isDemoMode ? 'demo' : 'live'}`}>
          {isDemoMode ? 'Demo mode' : `Gemma · ${modelName}`}
        </span>
      </header>

      <main>
        <section className="panel no-print">
          <h2>1. Upload a site photograph</h2>
          <UploadZone
            file={file}
            previewUrl={previewUrl}
            onFile={selectFile}
            onRemove={removeFile}
            error={uploadError}
            disabled={loading}
          />

          <h2>2. Inspection details</h2>
          <div className="fields">
            <label>
              Site / project
              <input
                value={meta.site}
                placeholder="e.g. Block B, Lekki Residences"
                onChange={(e) => setMeta({ ...meta, site: e.target.value })}
              />
            </label>
            <label>
              Inspector
              <input
                value={meta.inspector}
                placeholder="Name"
                onChange={(e) => setMeta({ ...meta, inspector: e.target.value })}
              />
            </label>
            <label>
              Date
              <input type="date" value={meta.date} onChange={(e) => setMeta({ ...meta, date: e.target.value })} />
            </label>
          </div>

          <button className="btn primary big" onClick={analyse} disabled={!file || loading}>
            {loading ? <span className="spinner" aria-hidden="true" /> : null}
            {loading ? 'Analysing…' : 'Analyse Site'}
          </button>

          {loading && (
            <div className="progress" aria-live="polite">
              <div className="bar" />
              <p>{LOADING_STEPS[step]}</p>
            </div>
          )}
          {status === 'error' && (
            <p className="error" role="alert">
              {error}{' '}
              <button className="link" onClick={analyse}>
                Try again
              </button>
            </p>
          )}
        </section>

        {result ? (
          <div className="results-col">
            <div className="report-actions no-print">
              <button className="btn" onClick={() => window.print()}>
                Download PDF
              </button>
              <button className="btn ghost" onClick={exportJson}>
                Export JSON
              </button>
            </div>
            <Results result={result} meta={meta} previewUrl={previewUrl} />
          </div>
        ) : (
          <section className="placeholder no-print">
            <h2>Your inspection report will appear here</h2>
            <p className="muted">
              SiteLens identifies construction elements, potential safety hazards, workmanship concerns and site
              conditions, then rates each by severity and confidence with a recommended corrective action.
            </p>
            <ul className="muted">
              <li>Use clear, well-lit photos taken close to the area of concern.</li>
              <li>One photo per inspection area gives the most focused report.</li>
              <li>Findings are preliminary and must be verified on site.</li>
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
