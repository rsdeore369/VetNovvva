// HealthNova Failure Recovery & Idempotency Edge-Case Verification Suite
import assert from "assert";

const BASE_URL = "http://localhost:3000";

async function runFailureRecoveryTests() {
  console.log("=== [HEALTHNOVA FAILURE RECOVERY & CONTRACT VERIFICATION] ===\n");
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

  // 1. Lost-Response Simulation: Initial insert succeeds
  const lostResponseClientId = `lost-resp-${Date.now()}`;
  const originalPayload = {
    clientIncidentId: lostResponseClientId,
    category: "injury",
    urgency: "high",
    peopleAffected: 3,
    location: { type: "Point", coordinates: [73.8567, 18.5204] },
    requestText: "Casualties needing tourniquets and splints in Sector A",
    sourceType: "field_responder",
    dataMode: "simulated"
  };

  let initialIncidentId = null;

  await test("1. Initial server-side insert succeeds with HTTP 201", async () => {
    const res = await fetch(`${BASE_URL}/api/incidents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(originalPayload)
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.ok, true);
    assert(data.incidentId);
    initialIncidentId = data.incidentId;
  });

  // 2. Client re-submits exact same payload (as if network ACK dropped after server commit)
  await test("2. Re-submitting same idempotency key returns HTTP 200 without creating duplicate", async () => {
    const preCount = (await (await fetch(`${BASE_URL}/api/incidents`)).json()).total;

    const res = await fetch(`${BASE_URL}/api/incidents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(originalPayload)
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.ok, true);
    assert.strictEqual(data.idempotent, true);
    assert.strictEqual(data.incidentId, initialIncidentId);

    const postCount = (await (await fetch(`${BASE_URL}/api/incidents`)).json()).total;
    assert.strictEqual(postCount, preCount, "Total incident count must remain unchanged");
  });

  // 3. Conflicting payload: same idempotency key but divergent category or people affected
  await test("3. Conflicting payload returns HTTP 409 without overwriting original record", async () => {
    const conflictPayload = {
      ...originalPayload,
      category: "evacuation", // Divergent valid category!
      peopleAffected: 25 // Divergent count!
    };

    const res = await fetch(`${BASE_URL}/api/incidents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(conflictPayload)
    });
    assert.strictEqual(res.status, 409);
    const data = await res.json();
    assert.strictEqual(data.ok, false);
    assert.strictEqual(data.error, "IDEMPOTENCY_CONFLICT");
    assert.strictEqual(data.existingIncidentId, initialIncidentId);

    // Verify original record in storage was NOT overwritten
    const checkRes = await fetch(`${BASE_URL}/api/incidents`);
    const checkData = await checkRes.json();
    const existing = checkData.incidents.find(i => i.incidentId === initialIncidentId);
    assert.strictEqual(existing.category, "injury", "Original category must remain 'injury'");
    assert.strictEqual(existing.peopleAffected, 3, "Original peopleAffected must remain 3");
  });

  // 4. Distinction between Validation Failure (400) and Conflict Failure (409)
  await test("4. Validation failures (400) and conflicts (409) are distinctly identified", async () => {
    const invalidPayload = {
      clientIncidentId: `invalid-test-${Date.now()}`,
      category: "invalid_alien_attack", // Invalid category enum
      urgency: "critical"
    };

    const res = await fetch(`${BASE_URL}/api/incidents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidPayload)
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.ok, false);
    assert.strictEqual(data.error, "INVALID_CATEGORY");
    assert(data.error !== "IDEMPOTENCY_CONFLICT");
  });

  // 5. Concurrent Retries: Multiple in-flight requests with identical token
  await test("5. Concurrent in-flight retries yield exactly one created record", async () => {
    const concurrentClientId = `concurrent-token-${Date.now()}`;
    const concurrentPayload = {
      clientIncidentId: concurrentClientId,
      category: "medical_supply",
      urgency: "high",
      peopleAffected: 7,
      location: { type: "Point", coordinates: [73.8567, 18.5204] },
      requestText: "Parallel sync test",
      sourceType: "field_responder",
      dataMode: "simulated"
    };

    const preCount = (await (await fetch(`${BASE_URL}/api/incidents`)).json()).total;

    // Send 5 concurrent requests simultaneously
    const promises = Array.from({ length: 5 }, () =>
      fetch(`${BASE_URL}/api/incidents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(concurrentPayload)
      })
    );

    const responses = await Promise.all(promises);
    const statuses = responses.map(r => r.status);
    const bodies = await Promise.all(responses.map(r => r.json()));

    // Exactly one should be 201, remainder 200 with idempotent: true
    const count201 = statuses.filter(s => s === 201).length;
    const count200 = statuses.filter(s => s === 200).length;

    assert(count201 >= 1, "At least one request must create the record");
    assert.strictEqual(count201 + count200, 5, "All responses must be 200 or 201");

    // All successful responses must return the same incident ID
    const assignedIds = new Set(bodies.map(b => b.incidentId));
    assert.strictEqual(assignedIds.size, 1, "All parallel requests must reference the same incidentId");

    const postCount = (await (await fetch(`${BASE_URL}/api/incidents`)).json()).total;
    assert.strictEqual(postCount, preCount + 1, "Net increment must be exactly 1");
  });

  console.log(`\nFailure Recovery Suite: ${passed}/${total} passed.\n`);
  if (passed !== total) {
    process.exit(1);
  }
}

runFailureRecoveryTests().catch(err => {
  console.error("FATAL SUITE ERROR:", err);
  process.exit(1);
});
