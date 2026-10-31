// Shared Gemma 4 client (Gemini API) used by photo inspection and the daily diary.
// The API key comes from the user, entered in the workspace (see aiKey.js).
import { getApiKey } from './aiKey.js';

const MODEL = import.meta.env.VITE_GEMMA_MODEL || 'gemma-4-26b-a4b-it';
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';
// gemma-4-31b-it has been returning HTTP 500 for image requests; this one has been reliable.
const FALLBACK_MODEL = 'gemma-4-26b-a4b-it';

// Without a key, SiteLens shows example results so the whole flow can still be tried.
export const isDemoMode = () => !getApiKey();
export const modelName = MODEL;

export const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];

export const normaliseSeverity = (v) =>
  SEVERITIES.find((s) => s.toLowerCase() === String(v).trim().toLowerCase()) || 'Medium';

export const toNumber = (v, fallback = 0) => {
  const n = Number(String(v ?? '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) && String(v ?? '').trim() !== '' ? n : fallback;
};

export const asArray = (v) => (Array.isArray(v) ? v : []);

export function fileToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(new Error('Could not read the file.'));
    reader.readAsDataURL(blob);
  });
}

// Gemma may wrap JSON in code fences or add stray prose; pull out the outermost object.
function extractJson(text) {
  const cleaned = text.replace(/```(?:json)?/gi, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end <= start) throw new Error('SiteLens could not read the result. Please try again.');
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    throw new Error('SiteLens could not read the result. Please try again.');
  }
}

async function requestOnce(model, parts, maxOutputTokens) {
  const res = await fetch(`${ENDPOINT}/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': getApiKey() },
    body: JSON.stringify({
      contents: [{ role: 'user', parts }],
      generationConfig: { temperature: 0.2, maxOutputTokens },
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body?.error?.message || `HTTP ${res.status}`);
    err.retryable = res.status === 429 || res.status >= 500;
    throw err;
  }
  return body;
}

async function requestWithRetry(model, parts, maxOutputTokens, attempts) {
  for (let i = 1; ; i++) {
    try {
      return await requestOnce(model, parts, maxOutputTokens);
    } catch (e) {
      if (!e.retryable || i >= attempts) throw e;
      await new Promise((r) => setTimeout(r, 1500 * i));
    }
  }
}

/**
 * Send `parts` (text and/or inline_data) to Gemma and parse the JSON object it returns.
 * Falls back to FALLBACK_MODEL on server-side errors.
 */
export async function generateJson(parts, { maxOutputTokens = 8192 } = {}) {
  const models = MODEL === FALLBACK_MODEL ? [MODEL] : [MODEL, FALLBACK_MODEL];

  let body;
  let usedModel;
  let lastError;
  for (const [i, model] of models.entries()) {
    try {
      // A failing call can take ~25s, so only retry once there's nothing left to fall back to.
      body = await requestWithRetry(model, parts, maxOutputTokens, i === models.length - 1 ? 2 : 1);
      usedModel = model;
      break;
    } catch (e) {
      lastError = e;
      // Only server-side failures are worth trying another model for; bad keys etc. won't improve.
      if (!e.retryable) break;
    }
  }
  if (!body) {
    console.error('SiteLens AI request failed:', lastError);
    throw new Error(
      lastError?.retryable
        ? 'The AI service is busy right now. Please try again in a minute.'
        : 'Something went wrong. Check your internet connection and try again — if it keeps happening, contact whoever set up SiteLens.',
    );
  }

  // Gemma 4 returns its reasoning as `thought: true` parts; only the answer parts hold the JSON.
  const text = asArray(body?.candidates?.[0]?.content?.parts)
    .filter((p) => !p.thought)
    .map((p) => p.text || '')
    .join('');
  if (!text) throw new Error('SiteLens did not get a result back. Please try again.');

  return { json: extractJson(text), model: usedModel };
}
