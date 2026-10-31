import { useState } from 'react';
import { Button, Icon, LinkButton, Textarea, cx } from './ui.jsx';
import { speechSupported, useDictation } from '../lib/speech.js';
import { tidyNote } from '../lib/diary.js';

/* A notes box with the AI transcriber: dictate by voice, then let SiteLens tidy the wording.
   `onAppend(phrase)` adds a dictated phrase to the latest text; `onChange(text)` replaces it. */
export default function NoteField({ title, value, placeholder, onChange, onAppend, disabled }) {
  const [tidying, setTidying] = useState(false);
  const [before, setBefore] = useState(null); // text before the last tidy-up, for Undo
  const [message, setMessage] = useState(null);
  const dictation = useDictation((phrase) => {
    setBefore(null);
    onAppend(phrase);
  });

  const tidy = async () => {
    dictation.stop();
    setTidying(true);
    setMessage(null);
    try {
      const original = value;
      const tidied = await tidyNote(title, original);
      if (tidied.trim() === original.trim()) {
        setMessage('These notes already read well. Nothing to change.');
      } else {
        setBefore(original);
        onChange(tidied);
      }
    } catch (e) {
      setMessage(e.message || 'SiteLens could not tidy these notes. Please try again.');
    } finally {
      setTidying(false);
    }
  };

  const undo = () => {
    onChange(before);
    setBefore(null);
  };

  const busy = disabled || tidying;

  return (
    <div className="grid gap-2.5">
      <Textarea
        rows={4}
        aria-label={title}
        value={value}
        placeholder={placeholder}
        disabled={tidying}
        onChange={(e) => {
          setBefore(null);
          onChange(e.target.value);
        }}
      />

      {dictation.listening && (
        <p className="flex items-start gap-2 rounded-md border border-critical/25 bg-critical/6 px-3 py-2 text-[13px]" aria-live="polite">
          <span className="mt-1.5 size-2 flex-none animate-pulse rounded-full bg-critical" aria-hidden="true" />
          <span className="min-w-0">
            <span className="font-medium text-heading">Listening… </span>
            <span className="text-muted">{dictation.interim || 'Speak naturally. Tap Stop when you are done.'}</span>
          </span>
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant={dictation.listening ? 'danger' : 'secondary'}
          icon={dictation.listening ? 'stop' : 'mic'}
          onClick={dictation.toggle}
          disabled={busy || !speechSupported}
          aria-pressed={dictation.listening}
          title={speechSupported ? undefined : 'Voice dictation is not available in this browser. Try Chrome, Edge or Safari.'}
        >
          {dictation.listening ? 'Stop' : 'Dictate'}
        </Button>
        <Button size="sm" icon="sparkle" onClick={tidy} disabled={busy || !value.trim()} busy={tidying}>
          {tidying ? 'Tidying…' : 'Tidy up with AI'}
        </Button>
        {before !== null && (
          <LinkButton className="ml-auto flex items-center gap-1 text-[13px] text-muted no-underline" onClick={undo}>
            <Icon name="undo" className="size-3.5" />
            Undo tidy-up
          </LinkButton>
        )}
      </div>

      {!speechSupported && (
        <p className="text-xs text-muted">Voice dictation isn't available in this browser. Chrome, Edge and Safari support it.</p>
      )}
      {(dictation.error || message) && (
        <p className={cx('text-[13px]', dictation.error ? 'text-critical' : 'text-muted')} role="status">
          {dictation.error || message}
        </p>
      )}
      {before !== null && <p className="text-xs text-muted">Tidied by SiteLens. Check it still says what you meant.</p>}
    </div>
  );
}
