import { useEffect, useRef, useState } from 'react';

// Voice dictation using the browser's built-in speech recognition (Chrome, Edge, Safari; not Firefox).
// Note: Chrome and Edge send the audio to their own speech service to transcribe it.

const Recognition = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : undefined;
export const speechSupported = Boolean(Recognition);

// Nigerian English first when the device is set to it, otherwise the device language, otherwise British English.
const pickLang = () => {
  const lang = navigator.language || 'en-GB';
  return lang.toLowerCase().startsWith('en') ? lang : 'en-GB';
};

const ERRORS = {
  'not-allowed': 'Microphone access is blocked. Allow it in your browser settings to dictate.',
  'service-not-allowed': 'Microphone access is blocked. Allow it in your browser settings to dictate.',
  'audio-capture': 'No microphone was found. Check that one is connected.',
  network: 'Dictation needs an internet connection. You can still type your notes.',
  'no-speech': "Didn't catch anything. Tap the mic and try again.",
};

// Only one section can listen at a time.
let active = null;

/**
 * useDictation(onText): onText(text) is called with each finished phrase.
 * Returns { listening, interim, error, start, stop, toggle }.
 */
export function useDictation(onText) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState(null);
  const recRef = useRef(null);
  const onTextRef = useRef(onText);
  onTextRef.current = onText;

  const stop = () => recRef.current?.stop();

  const start = () => {
    if (!Recognition) return;
    if (active && active !== recRef.current) active.stop();
    const rec = new Recognition();
    rec.lang = pickLang();
    rec.continuous = true;
    rec.interimResults = true;

    rec.onstart = () => {
      setError(null);
      setListening(true);
    };
    rec.onresult = (e) => {
      let pending = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) onTextRef.current(r[0].transcript.trim());
        else pending += r[0].transcript;
      }
      setInterim(pending.trim());
    };
    rec.onerror = (e) => {
      if (e.error !== 'aborted') setError(ERRORS[e.error] || 'Dictation stopped unexpectedly. Tap the mic to try again.');
    };
    rec.onend = () => {
      setListening(false);
      setInterim('');
      if (active === rec) active = null;
      if (recRef.current === rec) recRef.current = null;
    };

    recRef.current = rec;
    active = rec;
    try {
      rec.start();
    } catch {
      setError('Dictation could not start. Tap the mic to try again.');
    }
  };

  // Stop listening when the section closes or the page changes.
  useEffect(() => () => recRef.current?.abort(), []);

  return { listening, interim, error, start, stop, toggle: () => (listening ? stop() : start()) };
}

// Add a dictated phrase to existing notes, with sensible spacing.
export const appendPhrase = (text, phrase) => {
  if (!phrase) return text;
  if (!text.trim()) return phrase;
  return /[\s\n]$/.test(text) ? text + phrase : `${text} ${phrase}`;
};
