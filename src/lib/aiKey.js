import { useEffect, useState } from 'react';

// The Google AI (Gemini API) key is entered by each user in the workspace and kept only in their browser.
// It is never built into the app, so a deployed site doesn't expose anyone's key.

const STORAGE_KEY = 'sitelens-ai-key';
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';
const listeners = new Set();

export function getApiKey() {
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function setApiKey(key) {
  try {
    if (key) localStorage.setItem(STORAGE_KEY, key);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage blocked (e.g. private mode): the key just won't be remembered.
  }
  listeners.forEach((fn) => fn(getApiKey()));
}

// Keep other open tabs in sync when the key changes.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) listeners.forEach((fn) => fn(getApiKey()));
  });
}

export function useApiKey() {
  const [key, setKey] = useState(getApiKey);
  useEffect(() => {
    listeners.add(setKey);
    return () => listeners.delete(setKey);
  }, []);
  return key;
}

// Shows the start and end of a key so people can tell which one is saved.
export const maskKey = (key) => (key.length > 10 ? `${key.slice(0, 4)}…${key.slice(-4)}` : '••••');

/**
 * Check a key with Google by listing models (no generation, no cost).
 * Resolves on success; throws an Error with a user-facing message otherwise.
 */
export async function checkApiKey(key) {
  let res;
  try {
    res = await fetch(`${ENDPOINT}?pageSize=1`, { headers: { 'x-goog-api-key': key } });
  } catch {
    throw new Error('Could not reach Google to check the key. Check your internet connection.');
  }
  if (res.ok) return;
  if (res.status === 400 || res.status === 401 || res.status === 403) {
    throw new Error('Google did not accept this key. Check that you copied all of it, or create a new one.');
  }
  throw new Error('Google could not check the key right now. Try again in a minute.');
}
