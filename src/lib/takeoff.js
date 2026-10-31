// Drawing take-off: load a plan (PDF page or image), set its scale, and turn traced lines,
// areas and counts into quantities. Geometry is kept in plan pixels; scale converts to metres.
import * as pdfjs from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { prepareImage } from './analyse.js';
import { asArray, generateJson, isDemoMode } from './gemma.js';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

export const PLAN_ACCEPT = '.pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp';
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 40 * 1024 * 1024;
// Longest edge a PDF page is rendered at. Big enough to zoom into detail, small enough for phones.
const RENDER_EDGE = 4200;

export const TYPES = {
  length: { label: 'Length', unit: 'm', icon: 'ruler', extra: 'Height', extraUnit: 'm²', hint: 'Walls, kerbs, pipes, skirting' },
  area: { label: 'Area', unit: 'm²', icon: 'area', extra: 'Depth', extraUnit: 'm³', hint: 'Floors, slabs, roofs, ceilings' },
  count: { label: 'Count', unit: 'nr', icon: 'count', hint: 'Doors, windows, columns, fittings' },
};

export const COLORS = ['#ff6900', '#2563eb', '#16a34a', '#db2777', '#7c3aed', '#0891b2', '#ca8a04', '#dc2626'];

export const DRAWING_SCALES = [20, 50, 100, 200, 250, 500, 1000, 1250, 2500];

/* ---------- Loading plans ---------- */

export function validatePlan(file) {
  if (!file) return 'No file selected.';
  const pdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
  if (!pdf && !IMAGE_TYPES.includes(file.type)) return `${file.name} is not a PDF, JPG, PNG or WEBP drawing.`;
  if (file.size > MAX_BYTES) return `${file.name} is larger than 40 MB.`;
  return null;
}

export async function openPlan(file) {
  if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) {
    const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
    return { name: file.name, kind: 'pdf', doc, pageCount: doc.numPages };
  }
  const bitmap = await createImageBitmap(file);
  const page = { url: URL.createObjectURL(file), width: bitmap.width, height: bitmap.height, blob: file, pxPerPaperMm: null };
  bitmap.close();
  return { name: file.name, kind: 'image', pageCount: 1, pages: { 1: page } };
}

/** Render one PDF page to an image. Records how many pixels make one millimetre of paper, so a drawing ratio can set the scale. */
export async function renderPdfPage(doc, n) {
  const page = await doc.getPage(n);
  const base = page.getViewport({ scale: 1 }); // 1 unit = 1 PDF point = 1/72 inch
  const scale = Math.min(6, RENDER_EDGE / Math.max(base.width, base.height));
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport }).promise;
  const blob = await new Promise((r) => canvas.toBlob(r, 'image/png'));
  return { url: URL.createObjectURL(blob), width: canvas.width, height: canvas.height, blob, pxPerPaperMm: (scale * 72) / 25.4 };
}

/* ---------- Geometry ---------- */

export const dist = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);

export const pathLength = (pts) => pts.slice(1).reduce((sum, p, i) => sum + dist(pts[i], p), 0);

// Shoelace formula.
export const polygonArea = (pts) =>
  Math.abs(pts.reduce((sum, p, i) => {
    const q = pts[(i + 1) % pts.length];
    return sum + p.x * q.y - q.x * p.y;
  }, 0)) / 2;

export const centroid = (pts) => ({
  x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
  y: pts.reduce((s, p) => s + p.y, 0) / pts.length,
});

// Holding Shift keeps a segment horizontal or vertical.
export function ortho(from, to) {
  return Math.abs(to.x - from.x) >= Math.abs(to.y - from.y) ? { x: to.x, y: from.y } : { x: from.x, y: to.y };
}

/* ---------- Quantities ---------- */

/** Measured value of one shape in real units, or null when the page has no scale yet. */
export function shapeQuantity(type, pts, pxPerM) {
  if (type === 'count') return 1;
  if (!pxPerM) return null;
  return type === 'length' ? pathLength(pts) / pxPerM : polygonArea(pts) / (pxPerM * pxPerM);
}

/** Totals for an item across every page it was measured on. scales: { [page]: pxPerM } */
export function itemTotals(item, scales) {
  let measured = 0;
  let unscaled = 0;
  for (const s of item.shapes) {
    const q = shapeQuantity(item.type, s.points, scales[s.page]);
    if (q == null) unscaled++;
    else measured += q;
  }
  const waste = 1 + (Number(item.waste) || 0) / 100;
  const extra = Number(item.extra) || 0;
  return {
    measured,
    unscaled,
    total: measured * waste,
    derived: TYPES[item.type].extra && extra > 0 ? measured * extra * waste : null,
  };
}

export const fmtQty = (n, type) =>
  n == null ? '—' : type === 'count' ? String(Math.round(n)) : n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ---------- Export ---------- */

export function bqRows(items, scales) {
  return items.map((item, i) => {
    const t = itemTotals(item, scales);
    const type = TYPES[item.type];
    return {
      ref: i + 1,
      name: item.name,
      type: type.label,
      unit: type.unit,
      measured: t.measured,
      waste: Number(item.waste) || 0,
      total: t.total,
      derived: t.derived,
      derivedLabel: t.derived != null ? `${type.extra} ${item.extra} m → ${fmtQty(t.derived)} ${type.extraUnit}` : '',
      shapes: item.shapes.length,
      unscaled: t.unscaled,
    };
  });
}

export function downloadCsv(items, scales, filename) {
  const esc = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
  const lines = [
    ['Ref', 'Item', 'Type', 'Measurements', 'Measured', 'Unit', 'Waste %', 'Total', 'Extra quantity'],
    ...bqRows(items, scales).map((r) => [
      r.ref, r.name, r.type, r.shapes, r.measured.toFixed(r.unit === 'nr' ? 0 : 3), r.unit, r.waste, r.total.toFixed(r.unit === 'nr' ? 0 : 3), r.derivedLabel,
    ]),
  ];
  const blob = new Blob([lines.map((l) => l.map(esc).join(',')).join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/* ---------- AI: read the drawing ---------- */

const PROMPT = `You are SiteLens, helping a quantity surveyor or site engineer prepare a take-off from a construction drawing.
Look at the attached drawing. Only use what is visible on it; do not invent details.
If it is not a construction drawing, say so in "summary" and return empty arrays.

Return ONLY a JSON object (no markdown, no prose) with exactly this shape:
{
  "title": "drawing title, or a short description if there is none",
  "drawingType": "e.g. Ground floor plan, Section, Site plan, Elevation",
  "scale": "the scale printed on the drawing, e.g. 1:100, or empty if none is shown",
  "summary": "1-2 sentences on what the drawing shows",
  "items": [
    { "name": "e.g. External blockwork walls", "type": "length" | "area" | "count", "note": "what to trace and anything to watch for" }
  ],
  "dimensions": ["a few clearly printed overall dimensions useful for checking the scale, e.g. 'Overall width 12000 mm'"]
}

List 4 to 10 items worth measuring on this drawing. Use "length" for linear work (walls, beams, kerbs, drains, skirting),
"area" for surfaces (floors, slabs, roofs, ceilings, paving) and "count" for things counted one by one (doors, windows, columns, fittings).`;

const DEMO = {
  title: 'Ground floor plan',
  drawingType: 'Floor plan',
  scale: '1:100',
  summary: 'Example result. A single-storey layout with several rooms, internal partitions and openings.',
  items: [
    { name: 'External walls (230 mm blockwork)', type: 'length', note: 'Trace the centre line of the outer walls all the way round.' },
    { name: 'Internal partitions (150 mm blockwork)', type: 'length', note: 'Trace each partition between rooms.' },
    { name: 'Ground floor slab', type: 'area', note: 'Trace the outside face of the external walls.' },
    { name: 'Floor tiling', type: 'area', note: 'Trace each tiled room separately.' },
    { name: 'Doors', type: 'count', note: 'Click once on each door swing.' },
    { name: 'Windows', type: 'count', note: 'Click once on each window opening.' },
  ],
  dimensions: ['Overall width 12000 mm', 'Overall depth 9000 mm'],
};

const normaliseType = (v) => (['length', 'area', 'count'].includes(String(v).toLowerCase()) ? String(v).toLowerCase() : 'length');

export async function readDrawing(blob) {
  if (isDemoMode()) {
    await new Promise((r) => setTimeout(r, 1400));
    return { ...DEMO, demo: true };
  }
  const image = await prepareImage(blob, 2048);
  const { json } = await generateJson([{ inline_data: { mime_type: image.mime, data: image.data } }, { text: PROMPT }]);
  return {
    title: String(json.title || ''),
    drawingType: String(json.drawingType || ''),
    scale: String(json.scale || ''),
    summary: String(json.summary || ''),
    items: asArray(json.items).map((it) => ({ name: String(it.name || 'Item'), type: normaliseType(it.type), note: String(it.note || '') })),
    dimensions: asArray(json.dimensions).map(String),
    demo: false,
  };
}

/** "1:100" → 100 */
export const parseRatio = (s) => {
  const m = String(s).match(/1\s*:\s*(\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) : null;
};
