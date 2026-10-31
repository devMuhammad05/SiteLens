import { SEVERITIES, asArray, generateJson, isDemoMode, normaliseSeverity, toNumber } from './gemma.js';
import { demoDiaryResult } from './demo.js';

export const PROGRESS_STATUSES = ['Completed', 'In progress', 'Started', 'Not started', 'Delayed'];
export const SITE_STATUSES = ['On track', 'Minor delays', 'Delayed', 'Stopped'];
export const WEATHER_IMPACTS = ['None', 'Minor', 'Moderate', 'Severe'];
export const ISSUE_TYPES = ['Delay', 'Safety', 'Quality', 'Design/RFI', 'Supply', 'Labour', 'Equipment', 'Weather', 'Other'];

export const NOTE_FIELDS = [
  { key: 'progress', label: 'Work progress', placeholder: 'What was done today, where, and how far along…' },
  { key: 'labour', label: 'Labour & plant', placeholder: 'Trades / subcontractors and headcount, hours, equipment on site…' },
  { key: 'deliveries', label: 'Deliveries & visitors', placeholder: 'Materials received, inspections, client or consultant visits…' },
  { key: 'problems', label: 'Problems & delays', placeholder: 'Anything that slowed or stopped work, RFIs, defects, shortages…' },
  { key: 'safety', label: 'Safety', placeholder: 'Toolbox talk, incidents, near misses, observations…' },
  { key: 'tomorrow', label: 'Plan for tomorrow', placeholder: 'Planned activities, materials or labour needed…' },
];

export const emptyNotes = () => Object.fromEntries(NOTE_FIELDS.map((f) => [f.key, '']));

const SCHEMA = `{
  "summary": "2-3 sentence executive summary for the construction manager: overall progress, key problems, what needs their attention",
  "status": "On track" | "Minor delays" | "Delayed" | "Stopped",
  "weather": { "conditions": "", "temperature": "", "impact": "None" | "Minor" | "Moderate" | "Severe", "hoursLost": number, "notes": "" },
  "labour": [ { "trade": "", "company": "", "headcount": number, "hours": number | null } ],
  "plant": [ { "item": "", "quantity": number, "status": "Working" | "Idle" | "Broken down", "notes": "" } ],
  "progress": [ { "activity": "", "location": "", "status": "Completed" | "In progress" | "Started" | "Not started" | "Delayed", "percentComplete": number | null, "notes": "" } ],
  "deliveries": [ { "material": "", "quantity": "", "supplier": "", "notes": "" } ],
  "visitors": [ { "name": "", "organisation": "", "purpose": "" } ],
  "issues": [ { "title": "", "description": "", "type": "Delay" | "Safety" | "Quality" | "Design/RFI" | "Supply" | "Labour" | "Equipment" | "Weather" | "Other", "severity": "Low" | "Medium" | "High" | "Critical", "impact": "effect on programme, cost or safety", "action": "recommended next step", "owner": "who should act, if stated or obvious" } ],
  "safety": { "incidents": number, "nearMisses": number, "toolboxTalk": "", "notes": [""] },
  "tomorrow": [""],
  "missing": ["important daily-report information that is absent from the notes"]
}`;

function buildPrompt(entry) {
  const notes = NOTE_FIELDS.map((f) => `### ${f.label}\n${entry.notes[f.key]?.trim() || '(nothing entered)'}`).join('\n\n');
  return `You are SiteLens, an assistant that turns a site engineer's rough daily notes into a formal construction daily site diary report for the construction manager.

Rules:
- Use ONLY information in the notes. Never invent quantities, names, headcounts or percentages. Use null or "" when not stated.
- Notes may be informal, abbreviated or in mixed English; interpret them sensibly (e.g. "2 masons 3 labs" = 2 masons, 3 labourers).
- Rewrite in clear, professional, concise English.
- Each problem, delay, defect, shortage or safety concern becomes an item in "issues" with a severity and a practical recommended action.
- If something a daily report normally needs is missing (e.g. labour numbers, weather, plan for tomorrow), list it in "missing".
- Return ONLY a JSON object (no markdown, no prose) with exactly this shape:
${SCHEMA}

Project: ${entry.project || '(not given)'}
Date: ${entry.date}
Prepared by: ${entry.preparedBy || '(not given)'}
Weather recorded: ${entry.weather.conditions || '(not given)'}${entry.weather.temperature ? `, ${entry.weather.temperature}` : ''}${entry.weather.notes ? ` (${entry.weather.notes})` : ''}

${notes}`;
}

const pick = (list, v, fallback) =>
  list.find((s) => s.toLowerCase() === String(v ?? '').trim().toLowerCase()) || fallback;
const str = (v) => (v == null ? '' : String(v));
const numOrNull = (v) => (v == null || v === '' ? null : toNumber(v, null));

export function normaliseDiary(raw) {
  const labour = asArray(raw.labour).map((l) => ({
    trade: str(l.trade || l.role) || 'Unspecified',
    company: str(l.company),
    headcount: toNumber(l.headcount ?? l.count, 0),
    hours: numOrNull(l.hours),
  }));
  const issues = asArray(raw.issues)
    .map((x, i) => ({
      id: `i${i + 1}`,
      title: str(x.title) || 'Untitled issue',
      description: str(x.description),
      type: pick(ISSUE_TYPES, x.type, 'Other'),
      severity: normaliseSeverity(x.severity),
      impact: str(x.impact),
      action: str(x.action),
      owner: str(x.owner),
    }))
    .sort((a, b) => SEVERITIES.indexOf(b.severity) - SEVERITIES.indexOf(a.severity));
  const w = raw.weather || {};
  const s = raw.safety || {};

  return {
    summary: str(raw.summary),
    status: pick(SITE_STATUSES, raw.status, issues.some((i) => i.type === 'Delay') ? 'Minor delays' : 'On track'),
    weather: {
      conditions: str(w.conditions),
      temperature: str(w.temperature),
      impact: pick(WEATHER_IMPACTS, w.impact, 'None'),
      hoursLost: toNumber(w.hoursLost, 0),
      notes: str(w.notes),
    },
    labour,
    totals: {
      headcount: labour.reduce((n, l) => n + l.headcount, 0),
      manHours: labour.reduce((n, l) => n + (l.hours != null ? l.headcount * l.hours : 0), 0),
    },
    plant: asArray(raw.plant).map((p) => ({
      item: str(p.item || p.name),
      quantity: toNumber(p.quantity, 1),
      status: pick(['Working', 'Idle', 'Broken down'], p.status, 'Working'),
      notes: str(p.notes),
    })),
    progress: asArray(raw.progress).map((p) => ({
      activity: str(p.activity),
      location: str(p.location),
      status: pick(PROGRESS_STATUSES, p.status, 'In progress'),
      percentComplete: p.percentComplete == null ? null : Math.min(100, Math.max(0, toNumber(p.percentComplete, 0))),
      notes: str(p.notes),
    })),
    deliveries: asArray(raw.deliveries).map((d) => ({
      material: str(d.material),
      quantity: str(d.quantity),
      supplier: str(d.supplier),
      notes: str(d.notes),
    })),
    visitors: asArray(raw.visitors).map((v) => ({
      name: str(v.name),
      organisation: str(v.organisation || v.organization),
      purpose: str(v.purpose),
    })),
    issues,
    safety: {
      incidents: toNumber(s.incidents, 0),
      nearMisses: toNumber(s.nearMisses, 0),
      toolboxTalk: str(s.toolboxTalk),
      notes: asArray(s.notes).map(str).filter(Boolean),
    },
    tomorrow: asArray(raw.tomorrow).map(str).filter(Boolean),
    missing: asArray(raw.missing).map(str).filter(Boolean),
  };
}

export async function generateDiary(entry) {
  const hasNotes = NOTE_FIELDS.some((f) => entry.notes[f.key]?.trim());
  if (!hasNotes) throw new Error('Add some site notes first.');

  if (isDemoMode()) {
    await new Promise((r) => setTimeout(r, 1500));
    return { ...normaliseDiary(demoDiaryResult), demo: true, model: 'demo' };
  }
  const { json, model } = await generateJson([{ text: buildPrompt(entry) }]);
  return { ...normaliseDiary(json), demo: false, model };
}

// ---- AI transcriber: tidy dictated or rough notes for one section ----

const SHORTHAND = [
  [/\babt\b/gi, 'about'],
  [/\bhrs?\b/gi, 'hours'],
  [/\blabs\b/gi, 'labourers'],
  [/\bflr\b/gi, 'floor'],
  [/\bcol\b/gi, 'column'],
  [/\bblk\b/gi, 'block'],
  [/\bthurs\b/gi, 'Thursday'],
  [/\bGF\b/g, 'ground floor'],
];

// Offline-safe fallback used in sample mode: expand common shorthand and fix sentence casing.
function basicTidy(text) {
  let t = text.replace(/\s+/g, ' ').trim();
  SHORTHAND.forEach(([re, word]) => (t = t.replace(re, word)));
  t = t
    .split(/(?<=[.!?])\s+|\s*;\s*|\s+-\s+/)
    .map((s) => s.trim().replace(/[!?.]+$/, ''))
    .filter(Boolean)
    .map((s) => s[0].toUpperCase() + s.slice(1) + '.')
    .join(' ');
  return t;
}

/**
 * Clean up a section of notes (often dictated) into clear, professional site English.
 * Keeps every fact and never adds information.
 */
export async function tidyNote(sectionTitle, text) {
  if (!text.trim()) return text;
  if (isDemoMode()) {
    await new Promise((r) => setTimeout(r, 600));
    return basicTidy(text);
  }
  const prompt = `You tidy up a construction site engineer's notes for the "${sectionTitle}" section of a daily site diary. The notes may be dictated by voice, so they can contain speech-recognition mistakes, missing punctuation and informal shorthand.

Rules:
- Fix misheard words, spelling, punctuation and grammar, and expand obvious shorthand (e.g. "labs" = labourers, "abt" = about).
- Write in clear, concise, professional construction English, as short sentences or a short list.
- Keep every fact, number, name, location, time and quantity exactly. Do not add, guess or remove information.
- If something is unclear, keep the original wording rather than guessing.
- Return ONLY a JSON object: {"text": "the tidied notes"}

Notes:
${text}`;
  const { json } = await generateJson([{ text: prompt }], { maxOutputTokens: 2048 });
  const tidied = str(json?.text).trim();
  if (!tidied) throw new Error('SiteLens could not tidy these notes. Please try again.');
  return tidied;
}

// ---- Plain-text export (for email / WhatsApp) ----

export function diaryToText(entry, r) {
  const lines = [];
  const section = (title) => lines.push('', title.toUpperCase(), '-'.repeat(title.length));
  lines.push(`DAILY SITE DIARY — ${entry.project || 'Untitled project'}`);
  lines.push(`Date: ${entry.date}${entry.preparedBy ? ` | Prepared by: ${entry.preparedBy}` : ''} | Status: ${r.status}`);
  section('Summary');
  lines.push(r.summary);
  section('Weather');
  lines.push(
    [r.weather.conditions, r.weather.temperature].filter(Boolean).join(', ') || 'Not recorded',
    `Impact: ${r.weather.impact}${r.weather.hoursLost ? ` (${r.weather.hoursLost} h lost)` : ''}`,
  );
  if (r.labour.length) {
    section(`Labour (${r.totals.headcount} on site)`);
    r.labour.forEach((l) =>
      lines.push(`- ${l.trade}${l.company ? ` (${l.company})` : ''}: ${l.headcount}${l.hours != null ? ` × ${l.hours} h` : ''}`),
    );
  }
  if (r.plant.length) {
    section('Plant & equipment');
    r.plant.forEach((p) => lines.push(`- ${p.quantity} × ${p.item} — ${p.status}${p.notes ? ` (${p.notes})` : ''}`));
  }
  if (r.progress.length) {
    section('Work progress');
    r.progress.forEach((p) =>
      lines.push(
        `- ${p.activity}${p.location ? ` @ ${p.location}` : ''}: ${p.status}${p.percentComplete != null ? ` (${p.percentComplete}%)` : ''}${p.notes ? ` — ${p.notes}` : ''}`,
      ),
    );
  }
  if (r.issues.length) {
    section('Issues & delays');
    r.issues.forEach((i) => {
      lines.push(`- [${i.severity}] ${i.title} (${i.type}): ${i.description}`);
      if (i.impact) lines.push(`    Impact: ${i.impact}`);
      if (i.action) lines.push(`    Action: ${i.action}${i.owner ? ` — ${i.owner}` : ''}`);
    });
  }
  if (r.deliveries.length) {
    section('Deliveries');
    r.deliveries.forEach((d) => lines.push(`- ${[d.quantity, d.material].filter(Boolean).join(' ')}${d.supplier ? ` from ${d.supplier}` : ''}`));
  }
  if (r.visitors.length) {
    section('Visitors');
    r.visitors.forEach((v) => lines.push(`- ${[v.name, v.organisation].filter(Boolean).join(', ')}${v.purpose ? ` — ${v.purpose}` : ''}`));
  }
  section('Safety');
  lines.push(`Incidents: ${r.safety.incidents} | Near misses: ${r.safety.nearMisses}`);
  if (r.safety.toolboxTalk) lines.push(`Toolbox talk: ${r.safety.toolboxTalk}`);
  r.safety.notes.forEach((n) => lines.push(`- ${n}`));
  if (r.tomorrow.length) {
    section('Plan for tomorrow');
    r.tomorrow.forEach((t) => lines.push(`- ${t}`));
  }
  return lines.join('\n').trim();
}

// ---- Weather lookup (Open-Meteo, free, no key) ----

const WMO = {
  0: 'Clear', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Fog', 48: 'Fog',
  51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle', 61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
  66: 'Freezing rain', 67: 'Freezing rain', 71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 77: 'Snow grains',
  80: 'Rain showers', 81: 'Rain showers', 82: 'Violent rain showers', 85: 'Snow showers', 86: 'Snow showers',
  95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with hail',
};

export function fetchWeather(date) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Location is not available in this browser.'));
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const url =
            `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude.toFixed(3)}&longitude=${coords.longitude.toFixed(3)}` +
            `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max` +
            `&timezone=auto&start_date=${date}&end_date=${date}`;
          const res = await fetch(url);
          const body = await res.json();
          if (!res.ok || !body.daily) throw new Error(body.reason || 'Could not get the weather. Please type it in yourself.');
          const d = body.daily;
          resolve({
            conditions: WMO[d.weather_code[0]] || 'Unknown',
            temperature: `${Math.round(d.temperature_2m_min[0])}–${Math.round(d.temperature_2m_max[0])}°C`,
            notes: `Rain ${d.precipitation_sum[0]} mm, max wind ${Math.round(d.wind_speed_10m_max[0])} km/h`,
          });
        } catch (e) {
          reject(new Error(e.message || 'Could not get the weather. Please type it in yourself.'));
        }
      },
      () => reject(new Error('Allow location access to fill in the weather, or type it in yourself.')),
      { timeout: 10000 },
    );
  });
}

// ---- Saved diaries (this browser only) ----

const STORE_KEY = 'sitelens.diaries.v1';
const PROFILE_KEY = 'sitelens.profile.v1';

const readJson = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};
const writeJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — saving is best-effort */
  }
};

export const loadDiaries = () => readJson(STORE_KEY, []);

export function saveDiary(entry, result) {
  const list = loadDiaries().filter((d) => d.id !== entry.id);
  const record = { id: entry.id, savedAt: new Date().toISOString(), entry, result };
  const next = [record, ...list].sort((a, b) => b.entry.date.localeCompare(a.entry.date)).slice(0, 60);
  writeJson(STORE_KEY, next);
  return next;
}

export function deleteDiary(id) {
  const next = loadDiaries().filter((d) => d.id !== id);
  writeJson(STORE_KEY, next);
  return next;
}

export const loadProfile = () => readJson(PROFILE_KEY, { project: '', preparedBy: '' });
export const saveProfile = (p) => writeJson(PROFILE_KEY, p);

// Realistic rough notes for the "Load example" button.
export const EXAMPLE_NOTES = {
  progress:
    'blk B 1st flr slab rebar abt 80% done, top mat remaining gridline 4-6. col formwork C1-C6 completed. GF blockwork partitions ~40%, masons pulled off to clear drains during rain',
  labour: '6 steel fixers (Adeyemi Rebar) 8hrs, 4 carpenters 8hrs, 2 masons 6hrs, 5 labs. crane working all day. mixer broke down afternoon - drive belt',
  deliveries: '3t 12mm rebar from Dangote steel, stacked on timber near gate. Engr Okafor (consultant) came to check col formwork alignment - ok',
  problems:
    'heavy rain 10-12 stopped work abt 2hrs. mixer down so footing blinding not done. rebar inspection for slab not booked yet - pour is thursday!!',
  safety: 'toolbox talk on working at height at slab edge. near miss - plank fell from scaffold lift 2, nobody hurt, cordoned off + toe boards fitted',
  tomorrow: 'finish top mat 4-6, book consultant inspection, mechanic for mixer, continue blockwork',
};
