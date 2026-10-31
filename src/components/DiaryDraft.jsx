import { DocHeader, DocSection, Empty, NoteText, Notice } from './ui.jsx';
import { longDate } from '../lib/format.js';

/* Live preview of the daily report built straight from the notes as they're typed.
   It uses the same document layout as the finished report so users can see where everything will go. */
export default function DiaryDraft({ entry }) {
  const n = entry.notes;
  const weather = [entry.weather.conditions, entry.weather.temperature].filter(Boolean).join(', ');
  const note = (key) => (n[key]?.trim() ? <NoteText text={n[key]} /> : <Empty />);

  return (
    <article className="grid gap-7">
      <DocHeader
        kind="Daily site report (draft)"
        title={entry.project || 'Untitled project'}
        cells={[
          ['Date', longDate(entry.date, true)],
          ['Prepared by', entry.preparedBy],
          ['Weather', weather],
        ]}
      />

      <Notice tone="plain">
        This preview shows your notes as you type. Select <strong>Create report</strong> and SiteLens will turn them into a
        formal report with a summary, tables, highlighted problems and recommended actions.
      </Notice>

      <DocSection n={1} title="Executive summary">
        <Empty>Written for you when you create the report.</Empty>
      </DocSection>
      <DocSection n={2} title="Work completed">{note('progress')}</DocSection>
      <DocSection n={3} title="Labour and equipment">{note('labour')}</DocSection>
      <DocSection n={4} title="Deliveries and visitors">{note('deliveries')}</DocSection>
      <DocSection n={5} title="Site conditions">
        {weather || entry.weather.notes ? <NoteText text={[weather, entry.weather.notes].filter(Boolean).join('. ')} /> : <Empty />}
      </DocSection>
      <DocSection n={6} title="Problems and delays">{note('problems')}</DocSection>
      <DocSection n={7} title="Safety observations">{note('safety')}</DocSection>
      <DocSection n={8} title="Recommended actions">
        <Empty>SiteLens suggests an action for each problem when you create the report.</Empty>
      </DocSection>
      <DocSection n={9} title="Planned activities for tomorrow">{note('tomorrow')}</DocSection>
    </article>
  );
}
