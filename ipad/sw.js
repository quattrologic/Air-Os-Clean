/* Cache the real root page, not /index.html: static file servers may redirect
   /index.html to /, which Safari rejects if returned by a service worker.
   Bump this version when the app shell changes. */
const CACHE_VERSION = 'air-os-ipad-v4-official-uploaded-logo';
const SHELL = ['./', './styles.css', './app.js', './manifest.webmanifest', './air-os-official.png'];

/* Strip the redirect flag from same-origin responses, even after CacheStorage.
   WebKit rejects redirected Response objects in navigation respondWith(). */
function withoutRedirect(response) {
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  });
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);
    // Fetch '/' instead of '/index.html': Tailscale Serve may redirect the latter.
    const shell = await fetch('./', { cache: 'reload' });
    if (!shell.ok || !(shell.headers.get('content-type') || '').includes('text/html')) {
      throw new Error('Air-OS Startseite konnte nicht als HTML geladen werden.');
    }
    await cache.put('./', withoutRedirect(shell));
    await cache.addAll(SHELL.filter(path => path !== './'));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith('air-os-ipad-') && name !== CACHE_VERSION)
      .map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const scope = new URL(self.registration.scope);
  if (url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_VERSION);
      const saved = await cache.match('./');
      if (saved) return withoutRedirect(saved);
      const live = await fetch(event.request);
      // A redirected 200 must not reach Safari's navigation respondWith() unchanged.
      if (live.ok && (live.headers.get('content-type') || '').includes('text/html')) {
        const safe = withoutRedirect(live);
        await cache.put('./', safe.clone());
        return safe;
      }
      return withoutRedirect(live);
    })());
    return;
  }
  event.respondWith(caches.match(event.request).then(saved => saved || fetch(event.request)));
});