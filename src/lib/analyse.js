import { demoResult } from './demo.js';
import { SEVERITIES, asArray, fileToBase64, generateJson, isDemoMode, normaliseSeverity } from './gemma.js';

export { SEVERITIES, isDemoMode };
export { modelName } from './gemma.js';

export const MAX_PHOTOS = 4;
// Longest edge sent to the AI. Several photos go in one request, so each is a little smaller.
const maxEdgeFor = (count) => (count > 1 ? 1600 : 2048);

export const CATEGORIES = {
  safety: 'Safety hazard',
  workmanship: 'Workmanship concern',
  site: 'Site condition',
};

function buildPrompt(count) {
  const intro =
    count > 1
      ? `You are given ${count} photographs of the same construction site area, labelled Photo 1 to Photo ${count} in the order provided. Analyse them together and write ONE combined inspection report. If the same issue appears in several photos, report it once and list every photo it appears in.`
      : 'Analyse the attached construction site photograph.';
  return `You are SiteLens, an assistant that supports preliminary visual inspections of construction sites.
${intro}
Only report what is plausibly VISIBLE in the images; do not invent details.
If the images are not of a construction site, say so in "summary" and return empty arrays.

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
      "location": "where in the photo",
      "photos": [1],
      "severity": "Low" | "Medium" | "High" | "Critical",
      "confidence": 0-100,
      "recommendation": "specific corrective action"
    }
  ],
  "observations": ["general observations about activities and visible site conditions"]
}

"photos" lists the photo numbers (1 to ${count}) where the finding is visible.

Category guidance:
- safety: missing visible PPE, unsafe access, unprotected edges, exposed hazards, unsafe scaffolding.
- workmanship: visible cracks, honeycombing, poor concrete finish, misaligned or exposed reinforcement, poor formwork.
- site: poor housekeeping, material storage, debris, drainage, obstructed access.`;
}

// Phone photos are often 4000px+ and several MB; Gemma doesn't need that much detail and
// large uploads are slow, so downscale to maxEdge and re-encode as JPEG.
export async function prepareImage(file, maxEdge) {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
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

// Photo numbers a finding refers to, limited to the photos actually sent.
const normalisePhotos = (v, count) =>
  [...new Set(asArray(v).map(Number).filter((n) => Number.isInteger(n) && n >= 1 && n <= count))].sort((a, b) => a - b);

export function normaliseResult(raw, photoCount = 1) {
  const findings = asArray(raw.findings)
    .map((f, i) => ({
      id: `f${i + 1}`,
      category: normaliseCategory(f.category),
      title: String(f.title || 'Untitled finding'),
      description: String(f.description || ''),
      location: String(f.location || ''),
      photos: photoCount > 1 ? normalisePhotos(f.photos, photoCount) : [],
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

/** Analyse one or more photos of the same area (up to MAX_PHOTOS) into a single report. */
export async function analysePhotos(files) {
  const list = files.slice(0, MAX_PHOTOS);
  if (isDemoMode()) {
    await new Promise((r) => setTimeout(r, 1800));
    const demo = normaliseResult(demoResult, list.length);
    // Spread the example findings across the photos so the photo labels can be seen.
    if (list.length > 1) demo.findings.forEach((f, i) => (f.photos = [(i % list.length) + 1]));
    return { ...demo, demo: true, model: 'demo', photoCount: list.length };
  }

  const maxEdge = maxEdgeFor(list.length);
  const images = await Promise.all(list.map((f) => prepareImage(f, maxEdge)));
  const parts = images.flatMap((image, i) => [
    ...(list.length > 1 ? [{ text: `Photo ${i + 1}:` }] : []),
    { inline_data: { mime_type: image.mime, data: image.data } },
  ]);
  const { json, model } = await generateJson([...parts, { text: buildPrompt(list.length) }]);
  return { ...normaliseResult(json, list.length), demo: false, model, photoCount: list.length };
}
