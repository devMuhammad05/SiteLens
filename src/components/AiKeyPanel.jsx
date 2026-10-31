import { useEffect, useRef, useState } from 'react';
import { Button, Icon, cx, inputClass } from './ui.jsx';
import { checkApiKey, maskKey, setApiKey, useApiKey } from '../lib/aiKey.js';

const GET_KEY_URL = 'https://aistudio.google.com/apikey';

// Header button that shows whether the AI is connected and opens the key panel.
export function AiKeyButton({ onClick }) {
  const key = useApiKey();
  return (
    <Button size="sm" className="h-10" onClick={onClick} title={key ? 'AI key added. Select to change it.' : 'Add your AI key'}>
      <span className={cx('size-2 rounded-full', key ? 'bg-low' : 'bg-amber')} aria-hidden="true" />
      <Icon name="key" className="size-4" />
      <span className="max-sm:sr-only">{key ? 'AI connected' : 'Add AI key'}</span>
    </Button>
  );
}

// Notice shown in the workspace until a key is added.
export function AiKeyNotice({ onAdd }) {
  const key = useApiKey();
  if (key) return null;
  return (
    <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber/40 bg-amber-soft px-4 py-3">
      <p className="flex items-start gap-2.5 text-[14px] text-ink">
        <Icon name="key" className="mt-0.5 size-4 text-amber-deep" />
        <span>
          <strong className="font-semibold text-heading">Add your AI key to analyse photos and write reports.</strong> Until then, SiteLens
          shows example results.
        </span>
      </p>
      <Button size="sm" variant="primary" icon="key" onClick={onAdd}>
        Add AI key
      </Button>
    </div>
  );
}

/* Panel for adding, checking, replacing or removing the Google AI key. */
export default function AiKeyPanel({ open, onClose }) {
  const saved = useApiKey();
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const [value, setValue] = useState('');
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | checking | saved | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) {
      setValue('');
      setShow(false);
      setStatus('idle');
      setMessage('');
      d.showModal();
      setTimeout(() => inputRef.current?.focus(), 0);
    } else if (!open && d.open) d.close();
  }, [open]);

  const save = async (e) => {
    e.preventDefault();
    const key = value.trim();
    if (!key) return;
    setStatus('checking');
    setMessage('');
    try {
      await checkApiKey(key);
      setApiKey(key);
      setValue('');
      setStatus('saved');
      setMessage('Key saved. The AI is ready to use.');
    } catch (err) {
      setStatus('error');
      setMessage(err.message);
    }
  };

  const remove = () => {
    if (!window.confirm('Remove the AI key from this browser? SiteLens will show example results until you add one again.')) return;
    setApiKey('');
    setStatus('idle');
    setMessage('Key removed from this browser.');
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => e.target === dialogRef.current && onClose()}
      className="m-auto w-[min(520px,calc(100vw-2rem))] rounded-xl border border-line bg-paper p-0 text-ink shadow-2xl backdrop:bg-[#0f172a]/50 backdrop:backdrop-blur-[2px]"
      aria-labelledby="ai-key-title"
    >
      <form onSubmit={save} className="grid gap-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="grid gap-1.5">
            <h2 id="ai-key-title" className="font-display text-[24px] leading-tight font-semibold">
              Connect your AI key
            </h2>
            <p className="text-[14px] text-muted">
              SiteLens uses Google’s Gemma AI. Paste an API key from Google AI Studio. Creating one is free.
            </p>
          </div>
          <button type="button" onClick={onClose} className="grid size-8 flex-none cursor-pointer place-items-center rounded-md text-muted hover:bg-paper-2" aria-label="Close">
            <Icon name="close" className="size-4" />
          </button>
        </div>

        {saved && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-low/30 bg-low/8 px-3.5 py-2.5 text-[13.5px]">
            <span className="flex items-center gap-2 text-heading">
              <span className="size-2 rounded-full bg-low" aria-hidden="true" />
              Key saved: <span className="font-mono text-[12.5px]">{maskKey(saved)}</span>
            </span>
            <button type="button" onClick={remove} className="cursor-pointer text-[13px] font-medium text-critical hover:underline">
              Remove
            </button>
          </div>
        )}

        <label className="grid gap-1.5">
          <span className="text-[13px] font-medium text-heading">{saved ? 'Replace with a new key' : 'API key'}</span>
          <span className="relative">
            <input
              ref={inputRef}
              type={show ? 'text' : 'password'}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (status === 'error') setStatus('idle');
              }}
              placeholder="Paste your key, e.g. AIza…"
              autoComplete="off"
              spellCheck="false"
              className={cx(inputClass, 'h-11 pr-11 font-mono text-[13.5px]')}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute inset-y-0 right-1 grid w-9 cursor-pointer place-items-center text-muted hover:text-heading"
              aria-label={show ? 'Hide key' : 'Show key'}
              title={show ? 'Hide key' : 'Show key'}
            >
              <Icon name="eye" className="size-4" />
            </button>
          </span>
        </label>

        <a
          href={GET_KEY_URL}
          target="_blank"
          rel="noreferrer"
          className="w-fit text-[13.5px] font-medium text-amber-deep underline decoration-amber/50 underline-offset-4 hover:decoration-amber"
        >
          Get a free key from Google AI Studio
        </a>

        {message && (
          <p className={cx('text-[13.5px]', status === 'error' ? 'text-critical' : 'text-low')} role="status">
            {message}
          </p>
        )}

        <p className="rounded-md bg-paper-2 px-3.5 py-2.5 text-[12.5px] leading-relaxed text-muted">
          Your key is saved only in this browser on this device. It is sent only to Google when you check a photo or create a report,
          and Google’s usage limits for your key apply.
        </p>

        <div className="flex flex-wrap justify-end gap-2">
          <Button onClick={onClose}>{status === 'saved' ? 'Done' : 'Cancel'}</Button>
          <Button type="submit" variant="primary" disabled={!value.trim() || status === 'checking'} busy={status === 'checking'}>
            {status === 'checking' ? 'Checking key…' : 'Save key'}
          </Button>
        </div>
      </form>
    </dialog>
  );
}
