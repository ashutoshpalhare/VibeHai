/* VibeHai service worker — offline app shell + smart runtime caching */
const VERSION = "vibehai-v1";
const SHELL = `${VERSION}-shell`;
const RUNTIME = `${VERSION}-runtime`;
const IMMUTABLE = `${VERSION}-immutable`;

const SHELL_ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./favicon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL);
      await Promise.allSettled(SHELL_ASSETS.map((url) => cache.add(new Request(url, { cache: "reload" }))));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

function isMedia(url) {
  return (
    /\.(mp3|m4a|mp4|aac|ogg|wav|ts|m3u8)(\?|$)/i.test(url.pathname) ||
    /saavncdn\.com|akamaized\.net|jiosaavn\.com/i.test(url.hostname)
  );
}

function isApi(url) {
  return /saavn\.dev|sumit\.co|jiosaavn-api|vercel\.app/i.test(url.hostname) || url.pathname.includes("/api/");
}

async function networkFirst(request, cacheName, fallbackToCache = true) {
  const cache = await caches.open(cacheName);
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok) cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    if (fallbackToCache) {
      const cached = await cache.match(request, { ignoreSearch: true });
      if (cached) return cached;
    }
    throw err;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(IMMUTABLE);
  const cached = await cache.match(request, { ignoreSearch: false });
  if (cached) return cached;
  const fresh = await fetch(request);
  if (fresh && (fresh.ok || fresh.type === "opaque")) cache.put(request, fresh.clone());
  return fresh;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  // Never intercept audio/video or the music API — playback must stay live.
  if (isMedia(url) || isApi(url)) return;

  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          return await networkFirst(request, SHELL, false);
        } catch {
          const cache = await caches.open(SHELL);
          return (
            (await cache.match("./index.html")) ||
            (await cache.match("./")) ||
            new Response("<h1>Offline</h1>", {
              headers: { "content-type": "text/html" },
              status: 200,
            })
          );
        }
      })(),
    );
    return;
  }

  if (url.origin === location.origin) {
    const immutable = /\.[0-9a-f]{8,}\.|\/assets\//.test(url.pathname);
    event.respondWith(immutable ? cacheFirst(request) : networkFirst(request, RUNTIME));
  }
});
