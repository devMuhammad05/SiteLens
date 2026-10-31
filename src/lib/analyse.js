import { demoResult } from './demo.js';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = import.meta.env.VITE_GEMMA_MODEL || 'gemma-4-31b-it';
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

export const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];
export const CATEGORIES = {
  safety: 'Safety hazard',
  workmanship: 'Workmanship concern',
  site: 'Site condition',
};

export const isDemoMode = !API_KEY;
export const modelName = MODEL;

const PROMPT = `You are SiteLens, an assistant that supports preliminary visual inspections of construction sites.
Analyse the attached construction site photograph. Only report what is plausibly VISIBLE in the image; do not invent details.
If the image is not a construction site, say so in "summary" and return empty arrays.

Return ONLY a JSON object (no markdown, no prose) with exactly this shape:
{
  "summary": "2-3 sentence overview of the scene and its main concerns",
  "overallRisk": "Low" | "Medium" | "High" | "Critical",
  "elements": [
    { "name": "e.g. Column, Beam, Slab, Reinforcement, Scaffolding, Formwork", "description": "what is visible", "confidence": 0-100 }
  ],
  "findings": [
    {
      "category": "safety" | "workmanship" | "site",
      "title": "short label",
      "description": "what is visible and why it matters",
      "location": "where in the image",
      "severity": "Low" | "Medium" | "High" | "Critical",
      "confidence": 0-100,
      "recommendation": "specific corrective action"
    }
  ],
  "observations": ["general observations about activities and visible site conditions"]
}

Category guidance:
- safety: missing visible PPE, unsafe access, unprotected edges, exposed hazards, unsafe scaffolding.
- workmanship: visible cracks, honeycombing, poor concrete finish, misaligned or exposed reinforcement, poor formwork.
- site: poor housekeeping, material storage, debris, drainage, obstructed access.`;

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(new Error('Could not read the image file.'));
    reader.readAsDataURL(file);
  });
}

// Gemma may wrap JSON in code fences or add stray prose; pull out the outermost object.
function extractJson(text) {
  const cleaned = text.replace(/```(?:json)?/gi, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end <= start) throw new Error('The model did not return a JSON report.');
  return JSON.parse(cleaned.slice(start, end + 1));
}

const clampConfidence = (v) => {
  let n = Number(v);
  if (!Number.isFinite(n)) return 50;
  if (n > 0 && n <= 1) n *= 100;
  return Math.round(Math.min(100, Math.max(0, n)));
};

const normaliseSeverity = (v) =>
  SEVERITIES.find((s) => s.toLowerCase() === String(v).trim().toLowerCase()) || 'Medium';

const normaliseCategory = (v) => {
  const s = String(v).toLowerCase();
  if (s.includes('work')) return 'workmanship';
  if (s.includes('site') || s.includes('house') || s.includes('condition')) return 'site';
  return 'safety';
};

export function normaliseResult(raw) {
  const findings = (Array.isArray(raw.findings) ? raw.findings : [])
    .map((f, i) => ({
      id: `f${i + 1}`,
      category: normaliseCategory(f.category),
      title: String(f.title || 'Untitled finding'),
      description: String(f.description || ''),
      location: String(f.location || ''),
      severity: normaliseSeverity(f.severity),
      confidence: clampConfidence(f.confidence),
      recommendation: String(f.recommendation || ''),
    }))
    .sort((a, b) => SEVERITIES.indexOf(b.severity) - SEVERITIES.indexOf(a.severity));

  const worst = findings[0]?.severity;
  return {
    summary: String(raw.summary || ''),
    overallRisk: raw.overallRisk ? normaliseSeverity(raw.overallRisk) : worst || 'Low',
    elements: (Array.isArray(raw.elements) ? raw.elements : []).map((e) => ({
      name: String(e.name || e),
      description: String(e.description || ''),
      confidence: clampConfidence(e.confidence),
    })),
    findings,
    observations: (Array.isArray(raw.observations) ? raw.observations : []).map(String),
  };
}

export async function analyseImage(file) {
  if (isDemoMode) {
    await new Promise((r) => setTimeout(r, 1800));
    return { ...normaliseResult(demoResult), demo: true, model: 'demo' };
  }

  const data = await fileToBase64(file);
  const res = await fetch(`${ENDPOINT}/${MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': API_KEY },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ inline_data: { mime_type: file.type, data } }, { text: PROMPT }],
        },
      ],
      generationConfig: { temperature: 0.2, maxOutputTokens: 4096 },
    }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body?.error?.message || `Analysis request failed (HTTP ${res.status}).`);
  }
  const text = body?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
  if (!text) throw new Error('The model returned an empty response.');

  return { ...normaliseResult(extractJson(text)), demo: false, model: MODEL };
}
