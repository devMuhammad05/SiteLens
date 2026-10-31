import { useState } from 'react';
import { Button, cx, inputClass, panel } from './ui.jsx';
import { askReports } from '../lib/ask.js';
import { longDate } from '../lib/format.js';

const EXAMPLES = [
  'When did we last pour concrete?',
  'How many hours did we lose to rain this month?',
  'Which problems have not been reported as resolved?',
];

/* Ask questions about the daily reports saved on this device. The answer cites the days it came from. */
export default function AskReports({ diaries, onOpen }) {
  const [question, setQuestion] = useState('');
  const [status, setStatus] = useState('idle'); // idle | asking | done | error
  const [answer, setAnswer] = useState(null);
  const [asked, setAsked] = useState('');
  const [error, setError] = useState(null);
  const empty = diaries.length === 0;

  const ask = async (q = question) => {
    const text = q.trim();
    if (!text) return;
    setQuestion(text);
    setStatus('asking');
    setError(null);
    try {
      setAnswer(await askReports(text, diaries));
      setAsked(text);
      setStatus('done');
    } catch (e) {
      setError(e.message || 'SiteLens could not answer that. Please try again.');
      setStatus('error');
    }
  };

  const asking = status === 'asking';

  return (
    <section className={cx(panel, 'no-print')}>
      <header className="border-b border-line px-5 py-3.5">
        <h2 className="text-[15px] font-semibold">Ask your reports</h2>
        <p className="mt-0.5 text-[13px] text-muted">
          {empty ? 'Create a report first, then ask about past days.' : `Answers come only from your ${diaries.length} saved ${diaries.length === 1 ? 'report' : 'reports'}.`}
        </p>
      </header>

      <form
        className="grid gap-3 px-5 py-4"
        onSubmit={(e) => {
          e.preventDefault();
          ask();
        }}
      >
        <div className="flex gap-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. When was the last rebar delivery?"
            aria-label="Question about your reports"
            disabled={empty || asking}
            className={cx(inputClass, 'h-10')}
          />
          <Button type="submit" variant="primary" disabled={empty || asking || !question.trim()} busy={asking}>
            Ask
          </Button>
        </div>

        {!empty && status !== 'done' && (
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLES.map((q) => (
              <button
                key={q}
                type="button"
                disabled={asking}
                onClick={() => ask(q)}
                className="cursor-pointer rounded-md border border-line px-2.5 py-1 text-left text-[12.5px] text-muted hover:border-line-strong/40 hover:text-heading disabled:cursor-not-allowed disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {status === 'error' && (
          <p className="text-[13px] text-critical" role="alert">
            {error}
          </p>
        )}

        {status === 'done' && answer && (
          <div className="grid gap-3 border-t border-line pt-4" aria-live="polite">
            <p className="text-[12.5px] text-muted">{asked}</p>
            <p className="text-[14px] leading-relaxed whitespace-pre-wrap text-ink">{answer.answer}</p>
            {answer.sources.length > 0 && (
              <div className="grid gap-1.5">
                <span className="text-[12.5px] text-muted">From these reports:</span>
                <div className="flex flex-wrap gap-1.5">
                  {answer.sources.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => onOpen(d)}
                      className="cursor-pointer rounded-md border border-line bg-paper-2 px-2.5 py-1 text-[12.5px] text-heading hover:border-amber"
                      title="Open this report"
                    >
                      {longDate(d.entry.date)}
                      {d.entry.project ? `, ${d.entry.project}` : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <p className="text-[12px] text-muted">Check the report before relying on an answer.</p>
          </div>
        )}
      </form>
    </section>
  );
}
