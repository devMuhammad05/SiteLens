import { demoResult } from './demo.js';
import { SEVERITIES, asArray, fileToBase64, generateJson, isDemoMode, normaliseSeverity } from './gemma.js';

export { SEVERITIES, isDemoMode };
export { modelName } from './gemma.js';

const MAX_EDGE = 2048;

export const CATEGORIES = {
  safety: 'Safety hazard',
  workmanship: 'Workmanship concern',
  site: 'Site condition',
};

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

// Phone photos are often 4000px+ and several MB; Gemma doesn't need that much detail and
// large uploads are slow, so downscale to MAX_EDGE and re-encode as JPEG.
async function prepareImage(file) {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 1.5 * 1024 * 1024) {
      bitmap.close();
      return { mime: file.type, data: await fileToBase64(file) };
    }
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.85));
    return { mime: 'image/jpeg', data: await fileToBase64(blob) };
  } catch {
    return { mime: file.type, data: await fileToBase64(file) };
  }
}

const clampConfidence = (v) => {
  let n = Number(v);
  if (!Number.isFinite(n)) return 50;
  if (n > 0 && n <= 1) n *= 100;
  return Math.round(Math.min(100, Math.max(0, n)));
};

const normaliseCategory = (v) => {
  const s = String(v).toLowerCase();
  if (s.includes('work')) return 'workmanship';
  if (s.includes('site') || s.includes('house') || s.includes('condition')) return 'site';
  return 'safety';
};

export function normaliseResult(raw) {
  const findings = asArray(raw.findings)
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
    elements: asArray(raw.elements).map((e) => ({
      name: String(e.name || e),
      description: String(e.description || ''),
      confidence: clampConfidence(e.confidence),
    })),
    findings,
    observations: asArray(raw.observations).map(String),
  };
}

export async function analyseImage(file) {
  if (isDemoMode) {
    await new Promise((r) => setTimeout(r, 1800));
    return { ...normaliseResult(demoResult), demo: true, model: 'demo' };
  }

  const image = await prepareImage(file);
  const { json, model } = await generateJson([
    { inline_data: { mime_type: image.mime, data: image.data } },
    { text: PROMPT },
  ]);
  return { ...normaliseResult(json), demo: false, model };
}
