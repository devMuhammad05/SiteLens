import { useEffect, useState } from 'react';

// Minimal client-side routing for the two pages: "/" (landing) and "/app" (workspace).
// The hash after /app picks the tool (#inspect or #diary).

const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn(window.location.pathname));

export function navigate(to) {
  const url = new URL(to, window.location.origin);
  if (url.pathname + url.hash === window.location.pathname + window.location.hash) return;
  const samePage = url.pathname === window.location.pathname;
  history.pushState(null, '', url.pathname + url.search + url.hash);
  notify();
  if (samePage) window.dispatchEvent(new HashChangeEvent('hashchange'));
  else window.scrollTo({ top: 0, behavior: 'instant' });
}

export function usePath() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    listeners.add(setPath);
    window.addEventListener('popstate', onPop);
    return () => {
      listeners.delete(setPath);
      window.removeEventListener('popstate', onPop);
    };
  }, []);
  return path;
}

// An <a> that navigates without a full page reload, but still works with new-tab and modifier clicks.
export function Link({ to, onClick, ...props }) {
  return (
    <a
      href={to}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        navigate(to);
      }}
      {...props}
    />
  );
}
