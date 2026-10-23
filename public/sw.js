// HealthNova Service Worker (Phase 4 Offline Resilience)
// Cache Version: healthnova-v4-shell
// PRD Alignment: Section 6 (Data Tier Rules), Section 8.1, Section 13.2

const CACHE_NAME = "healthnova-v4-shell-v15";

const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/styles.css?v=20260629",
  "/styles-premium.css?v=20260629",
  "/vendor/leaflet.css",
  "/vendor/leaflet.js",
  "/vendor/react.production.min.js",
  "/vendor/react-dom.production.min.js",
  "/vendor/babel.min.js",
  "/vendor/images/marker-icon.png",
  "/vendor/images/marker-shadow.png",
  "/griid-adapter.js?v=20261010_v15",
  "/sentinel-map.js?v=20261010_v15",
  "/sentinel-shell.js?v=20261010_v15",
  "/healthnova-storage.js?v=20261010_v15",
  "/sentinel-routing.js",
  "/sentinel-allocation.js",
  "/app.js?v=20261010_v15",
  "/screens.js?v=20261010_v15",
  "/logo.png",
  "/healthnova-logo.png",
  "/fixtures/scenario_flood.json",
  "/fixtures/layers_flood_hazard.geojson",
  "/fixtures/layers_roads.geojson",
  "/fixtures/layers_infrastructure.geojson"
];

// 1. Atomic Install: All precache URLs must succeed
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[HealthNova SW] Caching application shell assets…");
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.error("[HealthNova SW] Atomic install failed. Aborting cache activation:", err);
      })
  );
});

// 2. Safe Activation: Migrate and purge only obsolete healthnova caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              console.log("[HealthNova SW] Removing obsolete cache version:", key);
              return caches.delete(key);
            }
            return Promise.resolve();
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// 3. Routing & Fetch Handling
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Non-GET requests (e.g. POST /api/incidents, /api/routing/route) pass directly to network / outbox
  if (event.request.method !== "GET") {
    return;
  }

  // A. Raster Map Tiles: Do not fabricate synthetic tiles; allow tile error to trigger grid canvas
  if (url.hostname.includes("tile.openstreetmap.org")) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(null, { status: 503, statusText: "Offline Tile Unavailable" });
      })
    );
    return;
  }

  // B. Disaster Fixtures & Layer APIs: Network-first with stamped cache fallback
  if (url.pathname.startsWith("/api/layers") || url.pathname === "/api/demo/scenario") {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            const cachedData = await cachedResponse.json();
            // Inject explicit offline cache provenance headers & fields
            const offlinePayload = {
              ...cachedData,
              offline_cached: true,
              data_mode_label: "OFFLINE CACHED — OBSERVED HISTORICAL BASELINE",
              cached_notice: "NETWORK OFFLINE: Displaying local cached disaster state. Live telemetry unreachable."
            };
            return new Response(JSON.stringify(offlinePayload), {
              headers: {
                "Content-Type": "application/json",
                "X-HealthNova-Offline": "true",
                "X-HealthNova-Cache": CACHE_NAME
              }
            });
          }
          return new Response(
            JSON.stringify({ ok: false, error: "OFFLINE_UNCACHED", message: "Resource unavailable offline." }),
            { status: 503, headers: { "Content-Type": "application/json" } }
          );
        })
    );
    return;
  }

  // C. Navigation requests & Scripts: Network-First with Cache Fallback (ensures live code updates)
  if (event.request.mode === "navigate" || url.pathname === "/" || url.pathname === "/index.html" || url.pathname.endsWith(".js")) {
    event.respondWith(
      fetch(event.request)
        .then((networkRes) => {
          if (networkRes.ok) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkRes;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // D. Core Application Shell & Local Static Assets: Cache-First with Network Update
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        // Fetch in background to update cache for next load
        fetch(event.request)
          .then((networkRes) => {
            if (networkRes.ok) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkRes));
            }
          })
          .catch(() => {});
        return cached;
      }
      return fetch(event.request).catch(() => {
        if (event.request.mode === "navigate") {
          return caches.match("/index.html");
        }
      });
    })
  );
});
