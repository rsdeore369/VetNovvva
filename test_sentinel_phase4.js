// HealthNova Phase 4 Focused Verification Suite
// Verifies Server Idempotency Contract, Local Vendor Deliveries, Service Worker, and Provenance

import assert from "assert";

const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("=== [HEALTHNOVA PHASE 4 VERIFICATION SUITE] ===\n");
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

  // 1. Local Vendor Dependencies
  await test("1. Local vendor scripts and CSS serve with HTTP 200 (Zero CDN required for cold boot)", async () => {
    const urls = [
      "/vendor/react.production.min.js",
      "/vendor/react-dom.production.min.js",
      "/vendor/babel.min.js",
      "/vendor/leaflet.js",
      "/vendor/leaflet.css"
    ];

    for (const u of urls) {
      const res = await fetch(`${BASE_URL}${u}`);
      assert.strictEqual(res.status, 200, `Expected 200 for ${u}, got ${res.status}`);
      const text = await res.text();
      assert(text.length > 500, `Vendor asset ${u} is unexpectedly empty`);
    }
  });

  // 2. Service Worker & Storage Assets
  await test("2. Service worker /sw.js and /healthnova-storage.js are served correctly", async () => {
    const swRes = await fetch(`${BASE_URL}/sw.js`);
    assert.strictEqual(swRes.status, 200);
    const swText = await swRes.text();
    assert(swText.includes("healthnova-v4-shell"), "SW must use healthnova-v4-shell cache");
    assert(swText.includes("PRECACHE_URLS"), "SW must contain atomic precache list");

    const storageRes = await fetch(`${BASE_URL}/healthnova-storage.js`);
    assert.strictEqual(storageRes.status, 200);
    const storageText = await storageRes.text();
    assert(storageText.includes("healthnova_offline_db"), "Storage must use healthnova_offline_db");
  });

  // 3. Server Idempotency: Initial Creation
  const testClientId = `test-idemp-${Date.now()}`;
  const basePayload = {
    clientIncidentId: testClientId,
    category: "injury",
    urgency: "critical",
    peopleAffected: 2,
    location: { type: "Point", coordinates: [73.8567, 18.5204] },
    requestText: "Field casualty triage report (Initial Submission)",
    sourceType: "field_responder",
    dataMode: "simulated"
  };

  let createdIncidentId = null;

  await test("3. Initial submission with clientIncidentId returns 201 Created", async () => {
    const res = await fetch(`${BASE_URL}/api/incidents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(basePayload)
    });
    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.ok, true);
    assert(body.incidentId);
    createdIncidentId = body.incidentId;
  });

  // 4. Server Idempotency: Duplicate Identical Retry
  await test("4. Re-submitting identical payload with same clientIncidentId returns 200 without duplicate creation", async () => {
    const preCountRes = await fetch(`${BASE_URL}/api/incidents`);
    const preCount = (await preCountRes.json()).total;

    const res = await fetch(`${BASE_URL}/api/incidents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(basePayload)
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.ok, true);
    assert.strictEqual(body.idempotent, true);
    assert.strictEqual(body.incidentId, createdIncidentId);

    const postCountRes = await fetch(`${BASE_URL}/api/incidents`);
    const postCount = (await postCountRes.json()).total;
    assert.strictEqual(postCount, preCount, "Total stored incidents count must NOT increase on duplicate submission");
  });

  // 5. Server Idempotency: Conflicting Payload Rejection (409)
  await test("5. Submitting conflicting payload with same clientIncidentId returns 409 without overwriting", async () => {
    const conflictingPayload = {
      ...basePayload,
      urgency: "low", // Changed
      requestText: "Conflicting emergency text" // Changed
    };

    const res = await fetch(`${BASE_URL}/api/incidents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(conflictingPayload)
    });
    assert.strictEqual(res.status, 409, `Expected 409 Conflict, got ${res.status}`);
    const body = await res.json();
    assert.strictEqual(body.ok, false);
    assert.strictEqual(body.error, "IDEMPOTENCY_CONFLICT");
    assert.strictEqual(body.existingIncidentId, createdIncidentId);

    // Verify existing record is intact and NOT overwritten
    const getRes = await fetch(`${BASE_URL}/api/incidents`);
    const all = (await getRes.json()).incidents;
    const match = all.find((i) => i.incidentId === createdIncidentId);
    assert.strictEqual(match.urgency, "critical", "Original urgency must remain preserved (never silently overwritten)");
  });

  // 6. Concurrent Submissions
  await test("6. Parallel concurrent submissions with same clientIncidentId create exactly one record", async () => {
    const concurrentClientId = `test-concurrent-${Date.now()}`;
    const payload = {
      ...basePayload,
      clientIncidentId: concurrentClientId
    };

    const responses = await Promise.all([
      fetch(`${BASE_URL}/api/incidents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }),
      fetch(`${BASE_URL}/api/incidents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }),
      fetch(`${BASE_URL}/api/incidents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
    ]);

    const statuses = responses.map((r) => r.status);
    const bodies = await Promise.all(responses.map((r) => r.json()));

    // One must be 201, others must be 200 (or all succeed idempotently)
    assert(statuses.includes(201));
    const incidentIds = bodies.map((b) => b.incidentId);
    const uniqueIds = new Set(incidentIds);
    assert.strictEqual(uniqueIds.size, 1, "All concurrent responses must resolve to the identical incidentId");
  });

  // 7. Provenance & Stamped Timestamps
  await test("7. Fixture layer endpoints preserve original source provenance & observation timestamps", async () => {
    const res = await fetch(`${BASE_URL}/api/layers/roads`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert(data.geojson.provenance);
    assert(data.geojson.provenance.observed_at, "Must preserve observed_at timestamp");
    assert(data.geojson.provenance.source_name, "Must preserve source_name");
    assert.strictEqual(data.data_mode, "simulated");
  });

  // 8. HealthNova Branding & Return Navigation Button
  await test("8. Application HTML and Shell feature HealthNova branding and 'Return to HealthNova' button", async () => {
    const htmlRes = await fetch(`${BASE_URL}/index.html`);
    const html = await htmlRes.text();
    assert(html.includes("HealthNova"), "HTML title must contain HealthNova");

    const shellRes = await fetch(`${BASE_URL}/sentinel-shell.js`);
    const shell = await shellRes.text();
    assert(shell.includes("HealthNova"), "Shell must display HealthNova branding");
    assert(shell.includes("Return to HealthNova"), "Shell must contain Return to HealthNova button");
  });

  console.log(`\nPhase 4 Tests Finished: ${passed}/${total} passed.\n`);
  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error("FATAL SUITE ERROR:", e);
  process.exit(1);
});
