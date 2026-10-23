// SENTINEL Phase 2 Focused Verification Test Suite
// Verifies PRD Data & Map Phase: Layer APIs, GeoJSON fixtures, Road Taxonomy, Provenance, and Dynamic Incidents

import assert from "assert";

const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("=== [SENTINEL PHASE 2 VERIFICATION SUITE] ===\n");
  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✓ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ [FAIL] ${name}: ${err.message}`);
    }
  }

  // 1. Layer Overview Index
  await test("GET /api/layers returns index of all available disaster layers", async () => {
    const res = await fetch(`${BASE_URL}/api/layers`);
    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
    const body = await res.json();
    assert.strictEqual(body.ok, true);
    assert.strictEqual(body.data_mode, "simulated");
    assert(Array.isArray(body.available_layers));
    assert(body.available_layers.length >= 4);
    const types = body.available_layers.map((l) => l.type);
    assert(types.includes("hazard"));
    assert(types.includes("roads"));
    assert(types.includes("infrastructure"));
    assert(types.includes("incidents"));
  });

  // 2. Flood Hazard GeoJSON Layer
  await test("GET /api/layers/hazard returns valid GeoJSON Polygon with provenance", async () => {
    const res = await fetch(`${BASE_URL}/api/layers/hazard`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.ok, true);
    assert.strictEqual(body.layer_type, "hazard");
    assert.strictEqual(body.data_mode, "simulated");
    assert(body.data_mode_label.includes("SIMULATED"));

    const geo = body.geojson;
    assert.strictEqual(geo.type, "FeatureCollection");
    assert(Array.isArray(geo.features) && geo.features.length >= 1);
    assert(geo.provenance, "Top-level provenance must be present");
    assert.strictEqual(geo.provenance.data_mode || geo.data_mode, "simulated");

    const feat = geo.features[0];
    assert.strictEqual(feat.type, "Feature");
    assert.strictEqual(feat.geometry.type, "Polygon");
    assert(Array.isArray(feat.geometry.coordinates[0]));

    // Check Western Maharashtra / Pune coordinate bounds
    const coords = feat.geometry.coordinates[0];
    for (const [lng, lat] of coords) {
      assert(lng >= 73.0 && lng <= 74.5, `Longitude ${lng} outside Pune corridor`);
      assert(lat >= 18.0 && lat <= 19.5, `Latitude ${lat} outside Pune corridor`);
    }
  });

  // 3. Road Network Segments & Complete 6-State Taxonomy
  await test("GET /api/layers/roads returns full 6-state PRD taxonomy and LineStrings", async () => {
    const res = await fetch(`${BASE_URL}/api/layers/roads`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.ok, true);
    assert.strictEqual(body.layer_type, "roads");

    const geo = body.geojson;
    assert.strictEqual(geo.type, "FeatureCollection");
    assert(Array.isArray(geo.features));

    const foundStates = new Set();
    for (const feat of geo.features) {
      assert.strictEqual(feat.type, "Feature");
      assert.strictEqual(feat.geometry.type, "LineString");
      assert(Array.isArray(feat.geometry.coordinates));

      const p = feat.properties;
      assert(p.state, "Road feature must have 'state'");
      foundStates.add(p.state);

      // Verify coordinate order [lng, lat] in Pune area
      for (const [lng, lat] of feat.geometry.coordinates) {
        assert(lng >= 73.0 && lng <= 74.5, `Lng ${lng} out of range`);
        assert(lat >= 18.0 && lat <= 19.5, `Lat ${lat} out of range`);
      }
    }

    const REQUIRED_TAXONOMY = [
      "VERIFIED_CLOSED",
      "REPORTED_CLOSED",
      "FLOOD_EXPOSED",
      "UNCERTAIN",
      "NO_KNOWN_HAZARD",
      "VERIFIED_OPEN"
    ];

    for (const reqState of REQUIRED_TAXONOMY) {
      assert(foundStates.has(reqState), `Missing PRD road state: ${reqState}`);
    }
  });

  // 4. Infrastructure Layer (Hospitals & Supply Depots)
  await test("GET /api/layers/infrastructure returns Point features with simulated capacity", async () => {
    const res = await fetch(`${BASE_URL}/api/layers/infrastructure`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.ok, true);

    const geo = body.geojson;
    assert.strictEqual(geo.type, "FeatureCollection");
    assert(Array.isArray(geo.features) && geo.features.length >= 3);

    let hasHospital = false;
    let hasDepot = false;

    for (const feat of geo.features) {
      assert.strictEqual(feat.geometry.type, "Point");
      const [lng, lat] = feat.geometry.coordinates;
      assert(lng >= 73.0 && lng <= 74.5);
      assert(lat >= 18.0 && lat <= 19.5);

      if (feat.properties.resource_type === "hospital") {
        hasHospital = true;
        assert(typeof feat.properties.bed_capacity_total === "number");
        assert(typeof feat.properties.bed_capacity_available === "number");
      }
      if (feat.properties.resource_type === "supply_depot") {
        hasDepot = true;
        assert(Array.isArray(feat.properties.stock_inventory));
      }
    }

    assert(hasHospital, "Expected at least one hospital feature");
    assert(hasDepot, "Expected at least one supply depot feature");
  });

  // 5. Dynamic Incident Layer Integration
  await test("POST incident and verify it appears in GET /api/layers/incidents as GeoJSON Point", async () => {
    const testLng = 73.8567;
    const testLat = 18.5204;

    // Post new incident
    const postRes = await fetch(`${BASE_URL}/api/incidents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: "injury",
        urgency: "critical",
        peopleAffected: 2,
        location: { type: "Point", coordinates: [testLng, testLat] },
        requestText: "Field trauma casualty needing urgent extraction",
        sourceType: "field_responder",
        dataMode: "simulated"
      })
    });
    assert.strictEqual(postRes.status, 201);
    const postBody = await postRes.json();
    const incidentId = postBody.incidentId;
    assert(incidentId);

    // Verify in incident layer
    const layerRes = await fetch(`${BASE_URL}/api/layers/incidents`);
    assert.strictEqual(layerRes.status, 200);
    const layerBody = await layerRes.json();
    assert.strictEqual(layerBody.ok, true);

    const match = layerBody.geojson.features.find((f) => f.id === incidentId);
    assert(match, `Incident ${incidentId} not found in dynamic incident layer`);
    assert.strictEqual(match.geometry.type, "Point");
    assert.strictEqual(match.geometry.coordinates[0], testLng);
    assert.strictEqual(match.geometry.coordinates[1], testLat);
    assert.strictEqual(match.properties.urgency, "critical");
    assert.strictEqual(match.properties.verification_status, "unverified");
  });

  // 6. Security & Parameter Validation
  await test("GET /api/layers/:type rejects invalid layer types and directory traversal", async () => {
    const res1 = await fetch(`${BASE_URL}/api/layers/nonexistent`);
    assert.strictEqual(res1.status, 400);
    const body1 = await res1.json();
    assert.strictEqual(body1.error, "INVALID_LAYER_TYPE");

    const res2 = await fetch(`${BASE_URL}/api/layers/..%2f..%2fpackage.json`);
    assert.strictEqual(res2.status, 400);
  });

  console.log(`\nPhase 2 Tests Finished: ${passed}/${total} passed.\n`);
  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error("FATAL SUITE ERROR:", e);
  process.exit(1);
});
