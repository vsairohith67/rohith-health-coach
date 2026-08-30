const CACHE = "rohith-health-shell-v2";
const SHELL = ["/icon.svg", "/manifest.webmanifest"];
self.addEventListener("install", (event) =>
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL))),
);
self.addEventListener("activate", (event) =>
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)),
        ),
      ),
  ),
);
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (
    request.method !== "GET" ||
    request.url.includes("/api/") ||
    request.headers.get("authorization")
  )
    return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || request.destination === "document")
    return;
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (
            response.ok &&
            ["style", "script", "image", "font"].includes(request.destination)
          ) {
            const copy = response.clone();
            void caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        }),
    ),
  );
});
self.addEventListener("message", (event) => {
  if (event.data === "CLEAR_PRIVATE_CACHE")
    event.waitUntil(caches.delete(CACHE));
});
