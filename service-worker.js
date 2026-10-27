const CACHE_NAME = "rv-workspace-v1";

const APP_SHELL = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/database.js",
  "./js/storage.js",
  "./js/app.js",
  "./manifest.webmanifest",
  "./icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil( caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()) );
});

self.addEventListener("activate", (event) => {
  event.waitUntil( caches.keys().then((keys) => Promise.all( keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)) ) ).then(() => self.clients.claim()) );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          if (response && response.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put("./index.html", response.clone());
          }

          return response;
        } catch {
          return ( (await caches.match(request)) || (await caches.match("./index.html")) );
        }
      })()
    );
    return;
  }

  event.respondWith( (async () => {
      const cached = await caches.match(request);
      if (cached) {
        return cached;
      }

      try {
        const response = await fetch(request);
        if (response && response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }

        return response;
      } catch {
        return new Response("Offline and resource not cached.", {
          status: 503,
          statusText: "Service Unavailable",
          headers: {
            "Content-Type": "text/plain; charset=utf-8"
          }
        });
      }
    })()
  );
});