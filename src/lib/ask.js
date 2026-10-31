import { asArray, generateJson, isDemoMode } from './gemma.js';

// "Ask your reports": answers questions using only the daily reports saved on this device.

const short = (v) => String(v ?? '').trim();
const list = (items, fn) => asArray(items).map(fn).filter(Boolean);

// A compact, plain version of one saved report, so many reports fit in one request.
function compactReport(id, { entry, result: r }) {
  return {
    id,
    date: entry.date,
    project: entry.project || 'Untitled project',
    preparedBy: entry.preparedBy || undefined,
    status: r.status,
    summary: r.summary,
    weather: { conditions: r.weather?.conditions || entry.weather?.conditions, impact: r.weather?.impact, hoursLost: r.weather?.hoursLost },
    workers: r.totals?.headcount,
    manHours: r.totals?.manHours,
    labour: list(r.labour, (l) => short(`${l.headcount ?? ''} ${l.trade}${l.company ? ` (${l.company})` : ''}${l.hours != null ? `, ${l.hours} h` : ''}`)),
    plant: list(r.plant, (p) => short(`${p.quantity ?? ''} ${p.item}: ${p.status}${p.notes ? `, ${p.notes}` : ''}`)),
    progress: list(r.progress, (p) =>
      short(`${p.activity}${p.location ? ` at ${p.location}` : ''}: ${p.status}${p.percentComplete != null ? `, ${p.percentComplete}%` : ''}${p.notes ? `. ${p.notes}` : ''}`),
    ),
    deliveries: list(r.deliveries, (d) => short(`${[d.quantity, d.material].filter(Boolean).join(' ')}${d.supplier ? ` from ${d.supplier}` : ''}`)),
    visitors: list(r.visitors, (v) => short(`${v.name || 'Visitor'}${v.organisation ? `, ${v.organisation}` : ''}${v.purpose ? `: ${v.purpose}` : ''}`)),
    problems: list(r.issues, (x) =>
      short(`${x.title} (${x.severity}, ${x.type})${x.description ? `: ${x.description}` : ''}${x.action ? ` Action: ${x.action}` : ''}${x.owner ? ` (${x.owner})` : ''}`),
    ),
    safety: {
      incidents: r.safety?.incidents,
      nearMisses: r.safety?.nearMisses,
      toolboxTalk: r.safety?.toolboxTalk || undefined,
      notes: asArray(r.safety?.notes),
    },
    planForNextDay: asArray(r.tomorrow),
  };
}

function buildPrompt(question, reports) {
  const today = new Date().toISOString().slice(0, 10);
  return `You answer questions about a construction site's daily site reports. Today's date is ${today}.

Rules:
- Use ONLY the reports below. Do not use outside knowledge or guess.
- Say which report date each fact comes from, and list the ids of every report you used in "sources".
- If the reports do not contain the answer, say so plainly and return an empty "sources" list.
- The reports do not record when a problem was fixed. If asked whether something is still open, say when it was last reported and whether any later report mentions it being resolved.
- When adding up figures (hours, workers, deliveries), add them carefully and show the figures you added.
- Interpret relative dates ("this week", "this month", "yesterday") from today's date.
- Answer in short, plain English. Use a short list if there are several items.

Return ONLY a JSON object: {"answer": "your answer", "sources": ["r1", "r2"]}

Reports (oldest first):
${reports.map((r) => JSON.stringify(r)).join('\n')}

Question: ${question}`;
}

/**
 * Ask a question about the saved reports.
 * Returns { answer, sources } where sources are the saved report records the answer used.
 */
export async function askReports(question, diaries) {
  if (isDemoMode()) throw new Error('Add your AI key (top right) to ask questions about your reports.');
  if (!diaries.length) throw new Error('There are no saved reports yet. Create a daily report first.');

  const ordered = [...diaries].sort((a, b) => a.entry.date.localeCompare(b.entry.date));
  const byId = new Map(ordered.map((d, i) => [`r${i + 1}`, d]));
  const reports = [...byId].map(([id, d]) => compactReport(id, d));

  const { json } = await generateJson([{ text: buildPrompt(question.trim(), reports) }], { maxOutputTokens: 2048 });
  const answer = short(json?.answer);
  if (!answer) throw new Error('SiteLens could not answer that. Try asking in a different way.');

  const sources = [...new Set(asArray(json?.sources).map(String))].map((id) => byId.get(id)).filter(Boolean);
  sources.sort((a, b) => b.entry.date.localeCompare(a.entry.date));
  return { answer, sources };
}
