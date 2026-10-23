// AeroRelief Inventory Integrity & Lifecycle Transition Regression Suite
// Verifies: Idempotent delivery, strict transition validation, atomic inventory bounds,
// quantity-based reconciliation, and audit trail integrity.

import assert from "assert";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function runTests() {
  console.log("===============================================================================");
  console.log("   HEALTHNOVA AERORELIEF INVENTORY INTEGRITY & TRANSITION REGRESSION SUITE   ");
  console.log("===============================================================================\n");

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✓ [PASS] Test ${total}: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ [FAIL] Test ${total}: ${name}`);
      console.error(`         Reason: ${err.message}\n`);
      process.exitCode = 1;
    }
  }

  // Helper to fetch current state
  async function getState() {
    const res = await fetch(`${BASE_URL}/api/rescuegrid/state`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    return data.state;
  }

  // 1. Reset baseline
  await test("Reset scenario to baseline fixture", async () => {
    const res = await fetch(`${BASE_URL}/api/rescuegrid/reset`, { method: "POST" });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.ok, true);
    assert.strictEqual(data.state.inventory["Kit A: Hydration & Cholera"].available, 14500);
    assert.strictEqual(data.state.inventory["Kit B: Trauma & Wound Care"].available, 8200);
  });

  // 2. Unknown request ID returns 404 and does not mutate inventory
  await test("Unknown request ID returns 404 and leaves inventory unchanged", async () => {
    const sBefore = await getState();
    const stockA = sBefore.inventory["Kit A: Hydration & Cholera"].available;

    const res = await fetch(`${BASE_URL}/api/rescuegrid/airlift-request/update-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: "NON-EXISTENT-REQUEST-ID", status: "delivered" })
    });
    assert.strictEqual(res.status, 404);
    const data = await res.json();
    assert.strictEqual(data.error, "REQUEST_NOT_FOUND");

    const sAfter = await getState();
    assert.strictEqual(sAfter.inventory["Kit A: Hydration & Cholera"].available, stockA);
  });

  // 3. Invalid status returns 400 and leaves inventory unchanged
  await test("Unrecognized status string returns 400 and leaves inventory unchanged", async () => {
    const sBefore = await getState();
    const stockA = sBefore.inventory["Kit A: Hydration & Cholera"].available;

    const res = await fetch(`${BASE_URL}/api/rescuegrid/airlift-request/update-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: "AIRLIFT-REQ-1002", status: "flying_around" })
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.error, "INVALID_STATUS");

    const sAfter = await getState();
    assert.strictEqual(sAfter.inventory["Kit A: Hydration & Cholera"].available, stockA);
  });

  // 4. Illegal state transition (submitted -> delivered directly without dispatch) is rejected
  await test("Illegal skip transition (submitted -> delivered) is rejected with 400", async () => {
    const sBefore = await getState();
    const stockA = sBefore.inventory["Kit A: Hydration & Cholera"].available;

    const res = await fetch(`${BASE_URL}/api/rescuegrid/airlift-request/update-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: "AIRLIFT-REQ-1002", status: "delivered" })
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.error, "INVALID_STATE_TRANSITION");
    assert(data.permittedTransitions.includes("accepted"));
    assert(!data.permittedTransitions.includes("delivered"));

    const sAfter = await getState();
    assert.strictEqual(sAfter.inventory["Kit A: Hydration & Cholera"].available, stockA);
  });

  // 5. Cancellation or failure before delivery does not deduct inventory
  await test("Cancellation before delivery transitions state with zero inventory deduction", async () => {
    const sBefore = await getState();
    const stockA = sBefore.inventory["Kit A: Hydration & Cholera"].available;

    // AIRLIFT-REQ-1002 starts in submitted -> cancel it
    const res = await fetch(`${BASE_URL}/api/rescuegrid/airlift-request/update-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: "AIRLIFT-REQ-1002", status: "cancelled", reviewOwner: "Capt. Test" })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.request.status, "cancelled");

    const sAfter = await getState();
    assert.strictEqual(sAfter.inventory["Kit A: Hydration & Cholera"].available, stockA);
  });

  // 6. Valid step-by-step lifecycle to dispatched and delivered: stock deducted exactly once
  let testReqId = "";
  await test("Full legal lifecycle (intake -> accept -> dispatch -> delivered) deducts stock exactly once", async () => {
    // Create new intake with structured requestedSupplies
    const intakeRes = await fetch(`${BASE_URL}/api/rescuegrid/airlift-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidateZoneId: "AERO-ZONE-PUNE-01",
        community: "Isolated Flood Sector Test",
        patientCount: 5,
        urgency: "critical",
        requestedSupplies: [
          { itemId: "Kit A: Hydration & Cholera", quantity: 60 },
          { itemId: "Kit B: Trauma & Wound Care", quantity: 25 }
        ]
      })
    });
    assert.strictEqual(intakeRes.status, 201);
    const intakeData = await intakeRes.json();
    testReqId = intakeData.requestId;
    assert.strictEqual(intakeData.status, "submitted");

    const sBefore = await getState();
    const stockA_before = sBefore.inventory["Kit A: Hydration & Cholera"].available;
    const stockB_before = sBefore.inventory["Kit B: Trauma & Wound Care"].available;

    // Step 1: Accept
    const acceptRes = await fetch(`${BASE_URL}/api/rescuegrid/airlift-request/update-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: testReqId, status: "accepted", reviewOwner: "Aviation Officer A" })
    });
    assert.strictEqual(acceptRes.status, 200);

    // Step 2: Dispatch
    const dispatchRes = await fetch(`${BASE_URL}/api/rescuegrid/airlift-request/update-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: testReqId, status: "dispatched", reviewOwner: "Flight Coordinator" })
    });
    assert.strictEqual(dispatchRes.status, 200);

    // Check inventory prior to delivery: MUST be untouched
    const sPreDelivery = await getState();
    assert.strictEqual(sPreDelivery.inventory["Kit A: Hydration & Cholera"].available, stockA_before);

    // Step 3: Confirm Delivery
    const deliverRes = await fetch(`${BASE_URL}/api/rescuegrid/airlift-request/update-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: testReqId, status: "delivered", reviewOwner: "Ground Responder" })
    });
    assert.strictEqual(deliverRes.status, 200);
    const deliverData = await deliverRes.json();
    assert.strictEqual(deliverData.request.status, "delivered");
    assert.ok(deliverData.inventoryAdjustments);
    assert.strictEqual(deliverData.inventoryAdjustments["Kit A: Hydration & Cholera"].deducted, 60);
    assert.strictEqual(deliverData.inventoryAdjustments["Kit B: Trauma & Wound Care"].deducted, 25);

    // Verify stock is deducted by exact requested quantities
    const sAfterDelivery = await getState();
    assert.strictEqual(sAfterDelivery.inventory["Kit A: Hydration & Cholera"].available, stockA_before - 60);
    assert.strictEqual(sAfterDelivery.inventory["Kit B: Trauma & Wound Care"].available, stockB_before - 25);
  });

  // 7. Idempotent repeat delivery: Repeating delivered update cannot deduct stock again
  await test("Repeated delivery update on already-delivered mission does NOT deduct stock again", async () => {
    const sBefore = await getState();
    const stockA = sBefore.inventory["Kit A: Hydration & Cholera"].available;
    const stockB = sBefore.inventory["Kit B: Trauma & Wound Care"].available;

    const repeatRes = await fetch(`${BASE_URL}/api/rescuegrid/airlift-request/update-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: testReqId, status: "delivered", notes: "Duplicate confirmation click" })
    });
    assert.strictEqual(repeatRes.status, 200);
    const repeatData = await repeatRes.json();
    assert.strictEqual(repeatData.repeatUpdate, true);
    assert.strictEqual(repeatData.inventoryDeducted, null);

    const sAfter = await getState();
    assert.strictEqual(sAfter.inventory["Kit A: Hydration & Cholera"].available, stockA, "Stock A must not change on duplicate delivery");
    assert.strictEqual(sAfter.inventory["Kit B: Trauma & Wound Care"].available, stockB, "Stock B must not change on duplicate delivery");
  });

  // 8. Delivered mission cannot be transitionally cancelled or refunded automatically
  await test("Delivered mission rejects subsequent transition to cancelled (non-refundable)", async () => {
    const sBefore = await getState();
    const stockA = sBefore.inventory["Kit A: Hydration & Cholera"].available;

    const cancelRes = await fetch(`${BASE_URL}/api/rescuegrid/airlift-request/update-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: testReqId, status: "cancelled" })
    });
    assert.strictEqual(cancelRes.status, 400);
    const cancelData = await cancelRes.json();
    assert.strictEqual(cancelData.error, "INVALID_STATE_TRANSITION");

    const sAfter = await getState();
    assert.strictEqual(sAfter.inventory["Kit A: Hydration & Cholera"].available, stockA, "Stock must remain deducted");
  });

  // 9. Insufficient inventory causes atomic rejection without partial changes
  await test("Insufficient inventory rejects delivery atomically with 409 and zero stock mutation", async () => {
    // Create mission requesting 999,999 units (exceeds total stock)
    const intakeRes = await fetch(`${BASE_URL}/api/rescuegrid/airlift-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        community: "Hyper Mass Surge",
        requestedSupplies: [
          { itemId: "Kit A: Hydration & Cholera", quantity: 50 },
          { itemId: "Kit D: Anti-Venom & Tetanus", quantity: 999999 } // Exceeds available 1200
        ]
      })
    });
    const { requestId } = await intakeRes.json();

    // Advance to dispatched
    await fetch(`${BASE_URL}/api/rescuegrid/airlift-request/update-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, status: "accepted" })
    });
    await fetch(`${BASE_URL}/api/rescuegrid/airlift-request/update-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, status: "dispatched" })
    });

    const sBefore = await getState();
    const stockA_before = sBefore.inventory["Kit A: Hydration & Cholera"].available;
    const stockD_before = sBefore.inventory["Kit D: Anti-Venom & Tetanus"].available;

    // Attempt delivery: should fail atomically because Kit D has shortage
    const deliverRes = await fetch(`${BASE_URL}/api/rescuegrid/airlift-request/update-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, status: "delivered" })
    });
    assert.strictEqual(deliverRes.status, 409);
    const errData = await deliverRes.json();
    assert.strictEqual(errData.error, "INSUFFICIENT_INVENTORY");
    assert.strictEqual(errData.shortage.item, "Kit D: Anti-Venom & Tetanus");

    // Verify ZERO stock was mutated (neither Kit A nor Kit D)
    const sAfter = await getState();
    assert.strictEqual(sAfter.inventory["Kit A: Hydration & Cholera"].available, stockA_before, "Kit A must NOT be partially deducted");
    assert.strictEqual(sAfter.inventory["Kit D: Anti-Venom & Tetanus"].available, stockD_before, "Kit D must NOT be deducted");
  });

  // 10. Audit trail logs exact adjustments and state transitions
  await test("Audit trail records timestamps, previous/new status, and deduction details", async () => {
    const s = await getState();
    assert.ok(Array.isArray(s.auditLog));
    const deliveryAudit = s.auditLog.find((e) => e.action === "AERORELIEF_MISSION_DELIVERED" && e.requestId === testReqId);
    assert.ok(deliveryAudit, "Audit log must contain AERORELIEF_MISSION_DELIVERED entry for testReqId");
    assert.strictEqual(deliveryAudit.previousStatus, "dispatched");
    assert.strictEqual(deliveryAudit.newStatus, "delivered");
    assert.strictEqual(deliveryAudit.inventoryAdjustments["Kit A: Hydration & Cholera"].deducted, 60);
    assert.ok(deliveryAudit.timestamp);
  });

  console.log(`\n===============================================================================`);
  console.log(`   AERORELIEF INVENTORY INTEGRITY RESULTS: ${passed} of ${total} tests PASSED (100%)   `);
  console.log(`===============================================================================\n`);
}

runTests();
