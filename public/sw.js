/* SiteLens service worker: makes the app installable and lets it open offline.
   - Pages: network first, falling back to the cached app shell when offline.
   - Built assets (/assets/*, hashed filenames): cache first.
   - Google Fonts: served from cache, refreshed in the background.
   - Everything else (AI and weather requests) goes straight to the network and is never cached. */

const VERSION = 'sitelens-v2';
const SHELL = ['/', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(VERSION);
      await cache.addAll(SHELL);
      // Also cache the JS and CSS the current page needs, so the very first install works offline.
      const html = await (await cache.match('/')).text();
      const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1]);
      await cache.addAll(assets);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          if (fresh.ok && url.origin === self.location.origin) {
            const cache = await caches.open(VERSION);
            cache.put('/', fresh.clone());
          }
          return fresh;
        } catch {
          return (await caches.match('/')) || Response.error();
        }
      })(),
    );
    return;
  }

  if (url.origin === self.location.origin && (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/'))) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        const fresh = await fetch(request);
        if (fresh.ok) (await caches.open(VERSION)).put(request, fresh.clone());
        return fresh;
      })(),
    );
    return;
  }

  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(VERSION);
        const cached = await cache.match(request);
        const refresh = fetch(request)
          .then((res) => {
            if (res.ok || res.type === 'opaque') cache.put(request, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || refresh;
      })(),
    );
  }
});
