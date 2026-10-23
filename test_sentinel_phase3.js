// SENTINEL Phase 3 Focused Verification Suite
// Verifies Deterministic Routing, Road-State Penalties, Hospital Bed Allocation, and Staging

import assert from "assert";
import {
  buildRoadGraph,
  findShortestPath,
  findNearestNode,
  ROAD_STATE_RULES
} from "./sentinel-routing.js";
import {
  allocateHospitalResources,
  recommendAmbulanceStaging
} from "./sentinel-allocation.js";

const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("=== [SENTINEL PHASE 3 VERIFICATION SUITE] ===\n");
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

  // --- Hand-Checkable Synthetic Graph Fixtures for Rigorous Verification ---
  // Node A: [73.80, 18.50]
  // Node B: [73.81, 18.50] (direct path via Road 1)
  // Node C: [73.805, 18.51] (detour via Road 2 and Road 3)
  // Node D: [73.99, 18.99] (isolated island)

  function createTestRoads(road1State = "VERIFIED_OPEN", road2State = "VERIFIED_OPEN", road3State = "VERIFIED_OPEN") {
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          id: "T-ROAD-01",
          properties: { road_id: "T-ROAD-01", name: "Direct Corridor A-B", state: road1State },
          geometry: {
            type: "LineString",
            coordinates: [[73.80, 18.50], [73.81, 18.50]]
          }
        },
        {
          type: "Feature",
          id: "T-ROAD-02",
          properties: { road_id: "T-ROAD-02", name: "Detour Leg 1 A-C", state: road2State },
          geometry: {
            type: "LineString",
            coordinates: [[73.80, 18.50], [73.805, 18.51]]
          }
        },
        {
          type: "Feature",
          id: "T-ROAD-03",
          properties: { road_id: "T-ROAD-03", name: "Detour Leg 2 C-B", state: road3State },
          geometry: {
            type: "LineString",
            coordinates: [[73.805, 18.51], [73.81, 18.50]]
          }
        },
        {
          type: "Feature",
          id: "T-ROAD-ISOLATED",
          properties: { road_id: "T-ROAD-ISOLATED", name: "Isolated Segment", state: "VERIFIED_OPEN" },
          geometry: {
            type: "LineString",
            coordinates: [[73.98, 18.98], [73.99, 18.99]]
          }
        }
      ]
    };
  }

  // 1. Simple Valid Route
  await test("1. Simple valid route finds shortest path over direct open edge", () => {
    const fixture = createTestRoads("VERIFIED_OPEN", "VERIFIED_OPEN", "VERIFIED_OPEN");
    const graph = buildRoadGraph(fixture);
    const nodeA = findNearestNode(graph, [73.80, 18.50]).node.id;
    const nodeB = findNearestNode(graph, [73.81, 18.50]).node.id;

    const res = findShortestPath(graph, nodeA, nodeB);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.edgesTraversed.length, 1);
    assert.strictEqual(res.edgesTraversed[0].roadId, "T-ROAD-01");
    assert(res.totalDistanceKm > 0.9 && res.totalDistanceKm < 1.3);
    assert.strictEqual(res.totalPenaltyKm, 0);
  });

  // 2. Route must strictly avoid VERIFIED_CLOSED edge
  await test("2. Route must avoid VERIFIED_CLOSED direct edge and take detour", () => {
    // Road 1 is VERIFIED_CLOSED; Road 2 & 3 are VERIFIED_OPEN
    const fixture = createTestRoads("VERIFIED_CLOSED", "VERIFIED_OPEN", "VERIFIED_OPEN");
    const graph = buildRoadGraph(fixture);
    const nodeA = findNearestNode(graph, [73.80, 18.50]).node.id;
    const nodeB = findNearestNode(graph, [73.81, 18.50]).node.id;

    const res = findShortestPath(graph, nodeA, nodeB);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.edgesTraversed.length, 2);
    assert.strictEqual(res.edgesTraversed[0].roadId, "T-ROAD-02");
    assert.strictEqual(res.edgesTraversed[1].roadId, "T-ROAD-03");
    // Ensure T-ROAD-01 is NOT traversed
    assert(!res.edgesTraversed.some((e) => e.roadId === "T-ROAD-01"));
  });

  // 3. Prefer longer, lower-risk alternative when penalties justify it
  await test("3. Route prefers longer alternative when direct path has high REPORTED_CLOSED penalty", () => {
    // Road 1 has REPORTED_CLOSED penalty (+15 km); detour has 0 penalty and ~2.5 km distance
    const fixture = createTestRoads("REPORTED_CLOSED", "VERIFIED_OPEN", "VERIFIED_OPEN");
    const graph = buildRoadGraph(fixture);
    const nodeA = findNearestNode(graph, [73.80, 18.50]).node.id;
    const nodeB = findNearestNode(graph, [73.81, 18.50]).node.id;

    const res = findShortestPath(graph, nodeA, nodeB);
    assert.strictEqual(res.success, true);
    // Should choose detour because 2.5 km < 1.0 km + 15 km penalty
    assert.strictEqual(res.edgesTraversed.length, 2);
    assert.strictEqual(res.edgesTraversed[0].roadId, "T-ROAD-02");
    assert.strictEqual(res.edgesTraversed[1].roadId, "T-ROAD-03");
  });

  // 4. FLOOD_EXPOSED is not automatically treated as closed
  await test("4. FLOOD_EXPOSED is traversable when no viable alternative exists", () => {
    // Detour legs closed; only FLOOD_EXPOSED direct path available
    const fixture = createTestRoads("FLOOD_EXPOSED", "VERIFIED_CLOSED", "VERIFIED_CLOSED");
    const graph = buildRoadGraph(fixture);
    const nodeA = findNearestNode(graph, [73.80, 18.50]).node.id;
    const nodeB = findNearestNode(graph, [73.81, 18.50]).node.id;

    const res = findShortestPath(graph, nodeA, nodeB);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.edgesTraversed.length, 1);
    assert.strictEqual(res.edgesTraversed[0].roadId, "T-ROAD-01");
    assert.strictEqual(res.totalPenaltyKm, ROAD_STATE_RULES.FLOOD_EXPOSED.riskPenaltyKm);
    assert(res.warnings.some((w) => w.includes("inundation hazard polygon")));
  });

  // 5. NO_KNOWN_HAZARD warning: not described as verified safe
  await test("5. NO_KNOWN_HAZARD produces warning that it does NOT mean verified safe", () => {
    const fixture = createTestRoads("NO_KNOWN_HAZARD", "VERIFIED_CLOSED", "VERIFIED_CLOSED");
    const graph = buildRoadGraph(fixture);
    const nodeA = findNearestNode(graph, [73.80, 18.50]).node.id;
    const nodeB = findNearestNode(graph, [73.81, 18.50]).node.id;

    const res = findShortestPath(graph, nodeA, nodeB);
    assert.strictEqual(res.success, true);
    assert(res.warnings.some((w) => w.includes("NO_KNOWN_HAZARD does NOT mean verified safe")));
  });

  // 6. Stale / conflicting evidence appears in warnings
  await test("6. UNCERTAIN road state exposes stale/conflicting evidence warning", () => {
    const fixture = createTestRoads("UNCERTAIN", "VERIFIED_CLOSED", "VERIFIED_CLOSED");
    const graph = buildRoadGraph(fixture);
    const nodeA = findNearestNode(graph, [73.80, 18.50]).node.id;
    const nodeB = findNearestNode(graph, [73.81, 18.50]).node.id;

    const res = findShortestPath(graph, nodeA, nodeB);
    assert.strictEqual(res.success, true);
    assert(res.warnings.some((w) => w.includes("Stale or conflicting evidence")));
  });

  // 7. Disconnected graph / No feasible route
  await test("7. Disconnected graph returns clear no-feasible-route result without guessing", () => {
    // Road 1 (A-B) is open; Detour roads are closed; Isolated segment (D1-D2) is open but unreachable from A-B
    const fixture = createTestRoads("VERIFIED_OPEN", "VERIFIED_CLOSED", "VERIFIED_CLOSED");
    const graph = buildRoadGraph(fixture);
    // Path from A to isolated island D
    const nodeA = findNearestNode(graph, [73.80, 18.50]).node.id;
    const nodeD = findNearestNode(graph, [73.98, 18.98]).node.id;

    const res = findShortestPath(graph, nodeA, nodeD);
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.error, "NO_FEASIBLE_ROUTE");
    assert(res.message.includes("No traversable ground route exists"));
  });

  // 8. API Endpoint: Invalid coordinates & malformed requests rejected
  await test("8. POST /api/routing/route rejects out-of-bounds coords with 400", async () => {
    const res = await fetch(`${BASE_URL}/api/routing/route`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin: [200.0, 18.5],
        destination: [73.8, 18.5]
      })
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.error, "INVALID_COORDINATES");
  });

  // 9. Hospital capacity is never exceeded
  await test("9. Hospital capacity is strictly respected without exceeding available beds", () => {
    const testHospitals = [
      {
        id: "H-TEST-01",
        properties: { id: "H-TEST-01", name: "Test Clinic", bed_capacity_total: 10, bed_capacity_available: 5 },
        geometry: { coordinates: [73.85, 18.52] }
      }
    ];
    const testIncidents = [
      {
        incidentId: "INC-TEST-01",
        urgency: "critical",
        peopleAffected: 8,
        location: { coordinates: [73.85, 18.52] }
      }
    ];

    const res = allocateHospitalResources(testIncidents, testHospitals);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.summary.totalDemandRequested, 8);
    assert.strictEqual(res.summary.totalDemandAssigned, 5); // Capped at 5!
    assert.strictEqual(res.facilityUtilization[0].occupiedByAllocation, 5);
    assert.strictEqual(res.facilityUtilization[0].remainingBeds, 0);
  });

  // 10. Unreachable / invalid incident does not receive assignments
  await test("10. Malformed coordinates incident produces explicit unassigned record", () => {
    const testHospitals = [
      {
        id: "H-TEST-01",
        properties: { id: "H-TEST-01", name: "Test Clinic", bed_capacity_total: 10, bed_capacity_available: 10 },
        geometry: { coordinates: [73.85, 18.52] }
      }
    ];
    const testIncidents = [
      {
        incidentId: "INC-BAD-COORDS",
        urgency: "high",
        peopleAffected: 3,
        location: null // Missing
      }
    ];

    const res = allocateHospitalResources(testIncidents, testHospitals);
    assert.strictEqual(res.summary.totalDemandAssigned, 0);
    assert.strictEqual(res.unassigned.length, 1);
    assert.strictEqual(res.unassigned[0].incidentId, "INC-BAD-COORDS");
  });

  // 11. Insufficient capacity produces explicit unassigned demand
  await test("11. Mass casualty surge exceeding all hospitals produces explicit unassigned demand", () => {
    const testHospitals = [
      {
        id: "H-1",
        properties: { id: "H-1", name: "Clinic 1", bed_capacity_available: 2 },
        geometry: { coordinates: [73.85, 18.52] }
      },
      {
        id: "H-2",
        properties: { id: "H-2", name: "Clinic 2", bed_capacity_available: 3 },
        geometry: { coordinates: [73.86, 18.53] }
      }
    ];
    const testIncidents = [
      {
        incidentId: "INC-MASS-CASUALTY",
        urgency: "critical",
        peopleAffected: 15,
        location: { coordinates: [73.85, 18.52] }
      }
    ];

    const res = allocateHospitalResources(testIncidents, testHospitals);
    assert.strictEqual(res.summary.totalDemandRequested, 15);
    assert.strictEqual(res.summary.totalDemandAssigned, 5);
    assert.strictEqual(res.summary.totalUnassignedDemand, 10);
    assert(res.explanation.includes("SURGE ALERT"));
  });

  // 12. Deterministic output for identical inputs
  await test("12. Routing and allocation produce bit-identical deterministic outputs", () => {
    const fixture = createTestRoads("VERIFIED_OPEN", "VERIFIED_OPEN", "VERIFIED_OPEN");
    const graph = buildRoadGraph(fixture);
    const nodeA = findNearestNode(graph, [73.80, 18.50]).node.id;
    const nodeB = findNearestNode(graph, [73.81, 18.50]).node.id;

    const res1 = findShortestPath(graph, nodeA, nodeB);
    const res2 = findShortestPath(graph, nodeA, nodeB);

    assert.deepStrictEqual(res1, res2, "Shortest path outputs must be bit-identical");
  });

  // 13. Missing or invalid capacity data rejected
  await test("13. allocateHospitalResources rejects invalid array inputs", () => {
    assert.throws(() => {
      allocateHospitalResources("not-an-array", []);
    }, /INVALID_INPUT/);
  });

  // 14. Ambulance Staging API recommendations
  await test("14. GET /api/allocation/staging returns candidate centroid staging sites", async () => {
    // Ensure at least one test incident exists
    await fetch(`${BASE_URL}/api/incidents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: "injury",
        urgency: "high",
        peopleAffected: 3,
        location: { type: "Point", coordinates: [73.8567, 18.5204] },
        requestText: "Staging cluster test incident",
        sourceType: "field_responder",
        dataMode: "simulated"
      })
    });

    const res = await fetch(`${BASE_URL}/api/allocation/staging`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.ok, true);
    assert.strictEqual(body.data_mode, "simulated");
    assert(Array.isArray(body.candidateStagingSites));
    assert(body.candidateStagingSites.length >= 1);
    assert(body.disclaimer.includes("Candidate staging locations are simulated"));
  });

  // 15. API End-to-end: POST /api/routing/route with custom fixture
  await test("15. POST /api/routing/route end-to-end executes Dijkstra via HTTP", async () => {
    const fixture = createTestRoads("VERIFIED_CLOSED", "VERIFIED_OPEN", "VERIFIED_OPEN");
    const res = await fetch(`${BASE_URL}/api/routing/route`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin: [73.80, 18.50],
        destination: [73.81, 18.50],
        customRoadsFeatureCollection: fixture
      })
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.ok, true);
    assert.strictEqual(body.route.success, true);
    assert.strictEqual(body.route.edgesTraversed.length, 2);
    assert(body.route.explanation.includes("Deterministic ground route calculated"));
  });

  console.log(`\nPhase 3 Verification Complete: ${passed}/${total} passed.\n`);
  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error("FATAL SUITE ERROR:", e);
  process.exit(1);
});
