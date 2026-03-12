const CACHE_NAME = "southmississippi-sports-v2";
const STATIC_ASSETS = ["/icon.svg", "/manifest.webmanifest"];

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

function isNavigationRequest(request) {
  return request.mode === "navigate" || request.destination === "document";
}

function isStaticAsset(pathname) {
  return (
    pathname.startsWith("/_next/static/") ||
    pathname === "/icon.svg" ||
    pathname === "/manifest.webmanifest" ||
    /\.(?:css|js|svg|png|jpg|jpeg|webp|gif|ico)$/i.test(pathname)
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);

  if (!isSameOrigin(url)) {
    return;
  }

  if (isNavigationRequest(event.request) || url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (!isStaticAsset(url.pathname)) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);
      const networkRequest = fetch(event.request)
        .then((response) => {
          if (response.ok) {
            cache.put(event.request, response.clone());
          }
          return response;
        })
        .catch(() => cached);

      return cached || networkRequest;
    }),
  );
});
