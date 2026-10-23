import assert from "assert";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function runTests() {
  console.log("===============================================================================");
  console.log("   HEALTHNOVA × RESCUEGRID AI CONNECTED DISASTER ENGINE VERIFICATION SUITE   ");
  console.log("===============================================================================\n");

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  [PASS] Test ${total}: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] Test ${total}: ${name}`);
      console.error(`         Reason: ${err.message}\n`);
    }
  }

  // 1. Reset state to baseline V1 first
  await test("Scenario Reset to Baseline V1", async () => {
    const res = await fetch(`${BASE_URL}/api/rescuegrid/reset`, { method: "POST" });
    assert.strictEqual(res.status, 200, "Reset endpoint must return 200 OK");
    const data = await res.json();
    assert.strictEqual(data.ok, true);
    assert.strictEqual(data.state.scenarioVersion, "v1.0.0-baseline");
  });

  // 2. Shared scenario consistency across portals
  await test("Shared Authoritative Disaster State Retrieval & Schema Completeness", async () => {
    const res = await fetch(`${BASE_URL}/api/rescuegrid/state`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.ok, true);
    const s = data.state;
    assert.strictEqual(s.scenarioVersion, "v1.0.0-baseline");
    assert.ok(s.roadStates, "Must contain roadStates");
    assert.ok(s.hospitalCapacities, "Must contain hospitalCapacities");
    assert.ok(Array.isArray(s.ambulances), "Must contain ambulances array");
    assert.ok(Array.isArray(s.incidents), "Must contain incidents array");
    assert.ok(Array.isArray(s.ambulanceAssignments), "Must contain ambulanceAssignments array");
    assert.ok(Array.isArray(s.hospitalAllocations), "Must contain hospitalAllocations array");
    assert.ok(s.beforeAfterMetrics, "Must contain beforeAfterMetrics");
    assert.strictEqual(s.dataMode, "simulated");
    assert.strictEqual(s.dataModeLabel, "SIMULATED — RESCUEGRID AI DISASTER INTELLIGENCE");
  });

  // 3. Strict Ambulance Availability & No Double-Booking
  await test("Ambulance Fleet Constraints & Strict No Double-Booking Enforcement", async () => {
    const res = await fetch(`${BASE_URL}/api/rescuegrid/state`);
    const data = await res.json();
    const s = data.state;

    // Check fleet: 3 available, 1 unavailable
    const avail = s.ambulances.filter((a) => a.status === "AVAILABLE");
    const unavail = s.ambulances.filter((a) => a.status === "UNAVAILABLE");
    assert.strictEqual(avail.length, 3, "Exactly 3 ambulances must be AVAILABLE in baseline");
    assert.strictEqual(unavail.length, 1, "Ambulance MH-12-AMB-405 must be UNAVAILABLE");
    assert.strictEqual(unavail[0].id, "MH-12-AMB-405");

    // Check assignments: No double booking
    const assignedAmbs = s.ambulanceAssignments
      .map((a) => a.ambulanceId)
      .filter(Boolean);
    const uniqueAssigned = new Set(assignedAmbs);
    assert.strictEqual(
      assignedAmbs.length,
      uniqueAssigned.size,
      "No ambulance can be assigned to multiple incidents concurrently (No double-booking)"
    );

    // Unavailable ambulance must never be assigned
    assert.ok(
      !assignedAmbs.includes("MH-12-AMB-405"),
      "Unavailable ambulance MH-12-AMB-405 must never receive dispatch assignment"
    );
  });

  // 4. Baseline Hospital Capacity Constraints
  await test("Hospital Capacity Constraints & Baseline Bed Allocation", async () => {
    const res = await fetch(`${BASE_URL}/api/rescuegrid/state`);
    const data = await res.json();
    const s = data.state;

    assert.strictEqual(s.hospitalCapacities["HOSP-01"].availableBeds, 24);
    assert.strictEqual(s.hospitalCapacities["HOSP-02"].availableBeds, 18);
    assert.strictEqual(s.hospitalCapacities["HOSP-03"].availableBeds, 9);

    const totalAllocated = s.hospitalAllocations.reduce((acc, h) => acc + h.patientsAllocated, 0);
    assert.strictEqual(totalAllocated, 36, "Baseline must allocate all 36 patients across 3 hospitals");
    assert.strictEqual(s.unmetDemandPatients, 0, "Baseline has 0 unmet demand");
  });

  // 5. Relief Kit Inventory Conservation
  await test("Medical Resource Inventory Math & Demand Conservation", async () => {
    const res = await fetch(`${BASE_URL}/api/rescuegrid/state`);
    const data = await res.json();
    const s = data.state;

    const inv = s.inventory;
    assert.ok(inv["Kit A: Hydration & Cholera"].available >= inv["Kit A: Hydration & Cholera"].required);
    assert.strictEqual(inv["Kit A: Hydration & Cholera"].shortage, 0);
    assert.strictEqual(inv["Kit B: Trauma & Wound Care"].shortage, 0);
  });

  // 6. Road state update override endpoint
  await test("Road State Override API (ROAD-03 Verified Closed)", async () => {
    const res = await fetch(`${BASE_URL}/api/rescuegrid/roads/update-state`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roadId: "ROAD-03",
        state: "VERIFIED_CLOSED",
        rationale: "Flood water depth 1.2m measured at Lakdi Pul"
      })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.ok, true);
    assert.strictEqual(data.roadStates["ROAD-03"], "VERIFIED_CLOSED");
  });

  // 7. Hospital capacity update override endpoint
  await test("Hospital Capacity Update API (HOSP-01 Reduced to 6 Beds)", async () => {
    const res = await fetch(`${BASE_URL}/api/rescuegrid/hospitals/update-capacity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hospitalId: "HOSP-01",
        availableBeds: 6,
        reason: "Ground floor trauma bay inundated"
      })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.ok, true);
    assert.strictEqual(data.hospitalCapacities["HOSP-01"].availableBeds, 6);
  });

  // 8. Deterministic Recalculation Trigger (Flood Demonstration Step)
  await test("Connected Flood Recalculation Workflow (ROAD-03 Avoidance & Capacity Limits)", async () => {
    const res = await fetch(`${BASE_URL}/api/rescuegrid/recalculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        version: "v2.0.0-flood-recalculated",
        roadOverrides: { "ROAD-03": "VERIFIED_CLOSED" },
        hospitalOverrides: { "HOSP-01": { availableBeds: 6 } }
      })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.ok, true);
    const s = data.state;

    // Check version advanced
    assert.strictEqual(s.scenarioVersion, "v2.0.0-flood-recalculated");

    // Check detour enforcement on ambulance assignments
    const inc2 = s.ambulanceAssignments.find((a) => a.incidentId === "INC-FL-02");
    assert.ok(inc2, "INC-FL-02 assignment must exist");
    assert.strictEqual(inc2.detourRequired, true, "Detour must be flagged when ROAD-03 is closed");
    assert.ok(inc2.routeDistanceKm > 5.4, "Route distance must increase due to bypass detour");
    assert.ok(inc2.etaMinutes > 9.3, "ETA must increase due to detour");

    // Check hospital allocations respect 6 bed limit on HOSP-01
    const sassoonAllocations = s.hospitalAllocations
      .filter((h) => h.hospitalId === "HOSP-01")
      .reduce((acc, h) => acc + h.patientsAllocated, 0);
    assert.ok(
      sassoonAllocations <= 6,
      `Sassoon allocations (${sassoonAllocations}) must not exceed constrained capacity (6)`
    );

    // Check unmet demand redirected to Camp Alpha
    assert.strictEqual(s.unmetDemandPatients, 3, "3 overflow patients must be flagged as unmet demand");
    assert.strictEqual(s.stagingCamps.length, 1, "Exactly 1 candidate temporary camp (Camp Alpha) activated");
    assert.strictEqual(s.stagingCamps[0].campId, "CAMP-ALPHA");
    assert.strictEqual(s.stagingCamps[0].patientsRedirected, 3);
    assert.strictEqual(s.stagingCamps[0].targetCapacityBeds, 30);
  });

  // 9. Before-and-After Decision Metrics Consistency
  await test("Before-and-After Metrics & Decision Rationale Explanations", async () => {
    const res = await fetch(`${BASE_URL}/api/rescuegrid/state`);
    const data = await res.json();
    const metrics = data.state.beforeAfterMetrics;

    assert.ok(metrics.baseline, "Must include baseline metrics");
    assert.strictEqual(metrics.baseline.version, "v1.0.0-baseline");
    assert.strictEqual(metrics.baseline.avgRouteEtaMinutes, 9.4);
    assert.strictEqual(metrics.baseline.allocatedHospitalBeds, 36);

    assert.ok(metrics.recalculated, "Must include recalculated metrics");
    assert.strictEqual(metrics.recalculated.version, "v2.0.0-flood-recalculated");
    assert.strictEqual(metrics.recalculated.avgRouteEtaMinutes, 14.8);
    assert.strictEqual(metrics.recalculated.allocatedHospitalBeds, 33);
    assert.strictEqual(metrics.recalculated.unmetPatientDemand, 3);
    assert.strictEqual(metrics.recalculated.activeMedicalCamps, 1);

    assert.ok(Array.isArray(metrics.explanations) && metrics.explanations.length >= 3, "Explanations provided");
    assert.ok(
      metrics.explanations.some((e) => e.includes("ROAD-03")),
      "Explanation must mention ROAD-03 detour"
    );
    assert.ok(
      metrics.explanations.some((e) => e.includes("HOSP-01")),
      "Explanation must mention HOSP-01 capacity reduction"
    );
  });

  // 10. Griid AI Verification & Graceful Fallback Diagnostics
  await test("Griid AI Investigation Diagnostic & Transparent Fallback Status", async () => {
    const res = await fetch(`${BASE_URL}/api/rescuegrid/gis-status`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.ok, true);
    assert.strictEqual(data.investigation.verified, false);
    assert.strictEqual(data.investigation.status, "UNAVAILABLE_FALLBACK_ACTIVE");
    assert.ok(Array.isArray(data.investigation.missingDetails));
    assert.strictEqual(data.investigation.fallbackActive, true);
    assert.ok(data.investigation.fallbackGIS.engine.includes("HealthNova Native GIS"));
  });

  // 11. HealthNova & VetNova Regressions & Core Fixtures
  await test("Platform Baseline Regressions (VetNova Access, GeoJSON Layers, Incident Intake)", async () => {
    // 1. VetNova status
    const vetRes = await fetch(`${BASE_URL}/api/emergency/status`);
    assert.strictEqual(vetRes.status, 200);

    // 2. Road layer
    const roadsRes = await fetch(`${BASE_URL}/api/layers/roads`);
    assert.strictEqual(roadsRes.status, 200);
    const roadsData = await roadsRes.json();
    assert.strictEqual(roadsData.ok, true);

    // 3. Hazard layer
    const hazRes = await fetch(`${BASE_URL}/api/layers/hazard`);
    assert.strictEqual(hazRes.status, 200);

    // 4. Incident dynamic intake
    const incRes = await fetch(`${BASE_URL}/api/incidents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: "injury",
        urgency: "moderate",
        location: { type: "Point", coordinates: [73.85, 18.52] },
        peopleAffected: 2,
        notes: "Automated regression verification ping"
      })
    });
    assert.strictEqual(incRes.status, 201);
  });

  // Summary
  console.log("-------------------------------------------------------------------------------");
  console.log(`TEST SUITE RESULTS: ${passed} of ${total} tests PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log("-------------------------------------------------------------------------------\n");

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test runner encountered unhandled error:", err);
  process.exit(1);
});
