import { useEffect, useState } from 'react';
import { Button } from './ui.jsx';

const STORAGE_KEY = 'sitelens-theme';
const systemDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

const readSaved = () => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'light' || v === 'dark' ? v : null;
  } catch {
    return null;
  }
};

const SunIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
    <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" />
  </svg>
);

// Switches between light and dark. Until the user picks one, the app follows the system setting.
export default function ThemeToggle() {
  const [saved, setSaved] = useState(readSaved);
  const [system, setSystem] = useState(systemDark);
  const isDark = saved ? saved === 'dark' : system;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystem(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (saved) document.documentElement.dataset.theme = saved;
    else delete document.documentElement.dataset.theme;
  }, [saved]);

  const toggle = () => {
    const next = isDark ? 'light' : 'dark';
    setSaved(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private mode etc. — the choice just won't be remembered.
    }
  };

  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  return (
    <Button variant="secondary" size="icon" className="size-10 [&_svg]:size-[18px]" onClick={toggle} aria-label={label} title={label}>
      {isDark ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
}
