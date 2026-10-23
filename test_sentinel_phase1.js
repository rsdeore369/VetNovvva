// SENTINEL Phase 1 Focused Automated Test Suite
// PRD Alignment: Phase 1 (Domain Shell, FR-01, FR-03, Section 12 Schema Validation)

async function runTests() {
  console.log("==================================================");
  console.log("🛡️ RUNNING SENTINEL PHASE 1 CONTRACT & SHELL TESTS");
  console.log("==================================================");

  const base = "http://localhost:3000";

  // Test 1: Verify static delivery of Phase 1 fixtures and scripts
  console.log("\n[Test 1] Static delivery of Phase 1 files...");
  for (const p of ["/sentinel-shell.js", "/fixtures/scenario_flood.json", "/index.html"]) {
    const res = await fetch(`${base}${p}`);
    if (res.status === 200) {
      console.log(`  ✓ GET ${p} -> 200 OK (${res.headers.get("content-type") || ""})`);
    } else {
      console.error(`  ✗ GET ${p} -> FAILED with status ${res.status}`);
      process.exit(1);
    }
  }

  // Test 2: Verify GET /api/demo/scenario (PRD FR-01)
  console.log("\n[Test 2] Querying GET /api/demo/scenario...");
  const scenRes = await fetch(`${base}/api/demo/scenario`).then((r) => r.json());
  if (
    scenRes.ok &&
    scenRes.scenario?.scenario_id === "flood_pune_2026" &&
    scenRes.dataMode === "simulated" &&
    scenRes.dataModeLabel === "SIMULATED — FOR DEMONSTRATION ONLY" &&
    scenRes.scenario?.medical_safeguard?.clinical_review_status === "PENDING QUALIFIED CLINICAL REVIEW — CITATION ONLY"
  ) {
    console.log("  ✓ /api/demo/scenario successfully returned simulated flood scenario with medical safeguards!");
    console.log(`    - Scenario: ${scenRes.scenario.name}`);
    console.log(`    - Data Tier: ${scenRes.dataModeLabel}`);
    console.log(`    - Clinical Status: ${scenRes.scenario.medical_safeguard.clinical_review_status}`);
  } else {
    console.error("  ✗ /api/demo/scenario output unexpected:", scenRes);
    process.exit(1);
  }

  // Test 3: Verify valid human incident intake (PRD Section 12 & FR-03)
  console.log("\n[Test 3] Submitting valid human incident to POST /api/incidents...");
  const validPayload = {
    clientId: "test-device-uuid-" + Date.now(),
    category: "medical_supply",
    urgency: "high",
    location: { type: "Point", coordinates: [73.8567, 18.5204] },
    locationAccuracyM: 12,
    peopleAffected: 4,
    requestText: "Urgent need for potable water and clean dressings in isolated sector B.",
    sourceType: "self_report",
    createdAtDevice: new Date().toISOString(),
    dataMode: "simulated"
  };

  const incRes = await fetch(`${base}/api/incidents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validPayload)
  });

  const incData = await incRes.json();
  if (
    incRes.status === 201 &&
    incData.ok &&
    incData.incidentId?.startsWith("SENTINEL-INC-") &&
    incData.status === "unverified" &&
    incData.dataMode === "simulated" &&
    incData.incident?.provenance?.verification_status === "unverified"
  ) {
    console.log(`  ✓ POST /api/incidents accepted valid human report! ID: ${incData.incidentId}`);
    console.log(`    - Verification Status: ${incData.status}`);
    console.log(`    - Data Mode: ${incData.dataModeLabel}`);
    console.log(`    - People Affected: ${incData.incident.peopleAffected}`);
  } else {
    console.error("  ✗ POST /api/incidents failed valid intake:", incData);
    process.exit(1);
  }

  // Test 4: Schema validation rejections (negative testing)
  console.log("\n[Test 4] Negative schema validation checks on POST /api/incidents...");

  // 4a. Invalid category
  const badCatRes = await fetch(`${base}/api/incidents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...validPayload, category: "invalid_alien_attack" })
  });
  const badCatData = await badCatRes.json();
  if (badCatRes.status === 400 && badCatData.error === "INVALID_CATEGORY") {
    console.log("  ✓ Correctly rejected invalid category enum with 400 INVALID_CATEGORY");
  } else {
    console.error("  ✗ Failed to reject invalid category:", badCatData);
    process.exit(1);
  }

  // 4b. Invalid coordinates
  const badCoordRes = await fetch(`${base}/api/incidents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...validPayload,
      location: { type: "Point", coordinates: [999, 999] }
    })
  });
  const badCoordData = await badCoordRes.json();
  if (badCoordRes.status === 400 && badCoordData.error === "INVALID_COORDINATES") {
    console.log("  ✓ Correctly rejected out-of-bounds coordinates with 400 INVALID_COORDINATES");
  } else {
    console.error("  ✗ Failed to reject invalid coordinates:", badCoordData);
    process.exit(1);
  }

  // 4c. Invalid people affected
  const badPeopleRes = await fetch(`${base}/api/incidents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...validPayload, peopleAffected: -10 })
  });
  const badPeopleData = await badPeopleRes.json();
  if (badPeopleRes.status === 400 && badPeopleData.error === "INVALID_PEOPLE_AFFECTED") {
    console.log("  ✓ Correctly rejected negative peopleAffected with 400 INVALID_PEOPLE_AFFECTED");
  } else {
    console.error("  ✗ Failed to reject negative peopleAffected:", badPeopleData);
    process.exit(1);
  }

  // Test 5: Verify incident listing
  console.log("\n[Test 5] Querying GET /api/incidents...");
  const listRes = await fetch(`${base}/api/incidents`).then((r) => r.json());
  if (listRes.ok && listRes.total >= 1 && listRes.incidents.some((i) => i.incidentId === incData.incidentId)) {
    console.log(`  ✓ GET /api/incidents confirmed ${listRes.total} active recorded incident(s).`);
  } else {
    console.error("  ✗ GET /api/incidents failed to list created incident:", listRes);
    process.exit(1);
  }

  // Test 6: Verify VetNova core endpoints remain untouched (regression check)
  console.log("\n[Test 6] Regression check on VetNova core endpoints...");
  const health = await fetch(`${base}/api/health`).then((r) => r.json());
  if (health.ok && health.onnx_model) {
    console.log("  ✓ Original VetNova /api/health is operational with active ML status!");
  } else {
    console.error("  ✗ VetNova /api/health regression detected:", health);
    process.exit(1);
  }

  const doctorsRes = await fetch(`${base}/api/doctors`).then((r) => r.json());
  const doctorsList = doctorsRes.doctors || doctorsRes;
  if (Array.isArray(doctorsList) && doctorsList.length === 3) {
    console.log(`  ✓ Original VetNova /api/doctors loaded ${doctorsList.length} registered doctors with zero regression!`);
  } else {
    console.error("  ✗ VetNova /api/doctors regression detected:", doctorsRes);
    process.exit(1);
  }

  console.log("\n==================================================");
  console.log("🎉 ALL SENTINEL PHASE 1 ACCEPTANCE TESTS PASSED!");
  console.log("==================================================");
}

runTests().catch((e) => {
  console.error("Test execution failed with fatal error:", e);
  process.exit(1);
});
