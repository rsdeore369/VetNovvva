/**
 * GRIID AI GIS ADAPTER & DEFENSIVE COMPATIBILITY LAYER
 *
 * HealthNova × RescueGrid AI Integration (Fusion 2026)
 *
 * Verification Findings for Griid AI:
 * 1. Product Identification: Investigated potential "Griid AI" geospatial SDKs/APIs.
 *    No official client-side JavaScript SDK, npm package, embeddable WebGL/GIS widget,
 *    or public REST endpoints exist for the named entity "Griid AI".
 * 2. Fallback Policy: Per Master Prompt Sections 1 & 8, since Griid AI cannot be verified
 *    from available context, external Griid-specific integration is halted gracefully.
 * 3. HealthNova Infrastructure: All geospatial mapping, hazard polygons, LineString road
 *    networks, and Dijkstra shortest-path calculations are handled deterministically
 *    by HealthNova's verified Leaflet and Dijkstra GIS engine.
 */

(function (root) {
  "use strict";

  const GriidAdapter = {
    version: "1.0.0-defensive",
    provider: "Griid AI (Geospatial Investigation)",
    status: "UNAVAILABLE_FALLBACK_ACTIVE",

    /**
     * Checks if external Griid AI SDK is present in the global scope.
     * @returns {boolean}
     */
    isAvailable: function () {
      return typeof root.GriidAI !== "undefined" && root.GriidAI !== null;
    },

    /**
     * Diagnostic report detailing why Griid AI is not directly active
     * and how HealthNova's GIS engine provides full coverage.
     */
    getDiagnosticReport: function () {
      return {
        product: "Griid AI",
        verified: false,
        status: "UNAVAILABLE_FALLBACK_ACTIVE",
        reason: "No public client SDK, npm package, or authenticated GIS API endpoint identified.",
        missingInformation: [
          "Official Griid AI package or CDN script bundle URL",
          "Geospatial vector tile / hazard layer endpoint specification",
          "API authentication credentials / bearer token schema",
          "Client-side map rendering component or WebGL binding"
        ],
        fallbackActive: true,
        fallbackProvider: "HealthNova Native GIS (Leaflet 1.9.4 + Deterministic Dijkstra Engine)",
        supportedCapabilities: {
          geospatialMapping: "Leaflet L.map via public/sentinel-map.js",
          hazardLayerRendering: "GeoJSON Inundation Polygons (/api/layers/hazard)",
          roadNetworkGraph: "GeoJSON LineStrings with 6-State PRD Taxonomy (/api/layers/roads)",
          routeComputation: "Deterministic Dijkstra Shortest-Path (/api/routing/route)",
          ambulanceStaging: "Spatial Centroid Staging (/api/allocation/staging)"
        }
      };
    },

    /**
     * Renders a disaster map using Griid AI if present, or delegates to HealthNova Leaflet.
     * @param {string|HTMLElement} container - DOM container element or id
     * @param {Object} options - Map initialization options
     */
    renderMap: function (container, options) {
      if (this.isAvailable()) {
        try {
          return root.GriidAI.createMap(container, options);
        } catch (e) {
          console.warn("[GRIID-ADAPTER] Griid AI failed during initialization:", e);
        }
      }

      // Safe fallback to HealthNova Leaflet Map
      if (root.SentinelMap && typeof root.SentinelMap.init === "function") {
        return root.SentinelMap.init(container, options);
      }

      console.info("[GRIID-ADAPTER] Operating in HealthNova Leaflet fallback mode.");
      return null;
    },

    /**
     * Computes a route avoiding closed roads.
     * @param {Array<number>} origin - [lng, lat]
     * @param {Array<number>} destination - [lng, lat]
     * @param {Object} options - Routing options
     * @returns {Promise<Object>}
     */
    computeRoute: async function (origin, destination, options) {
      if (this.isAvailable() && typeof root.GriidAI.route === "function") {
        try {
          return await root.GriidAI.route({ origin, destination, ...options });
        } catch (err) {
          console.warn("[GRIID-ADAPTER] Griid AI route failed, falling back to HealthNova Dijkstra:", err);
        }
      }

      // Delegate to HealthNova deterministic routing API
      const res = await fetch("/api/routing/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin,
          destination,
          routingOptions: options
        })
      });
      return await res.json();
    }
  };

  // Expose to window / global scope
  root.GriidAdapter = GriidAdapter;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = GriidAdapter;
  }
})(typeof window !== "undefined" ? window : globalThis);
