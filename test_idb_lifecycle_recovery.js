// HealthNova IndexedDB Lifecycle & Connection Recovery Regression Test Suite
// Verifies fix for: "Failed to execute 'transaction' on 'IDBDatabase': The database connection is closing."

import assert from "assert";
import fs from "fs";
import vm from "vm";

// Construct an in-memory IndexedDB mock that faithfully simulates connection closing semantics
function createMockIndexedDB() {
  const storesData = {
    incident_outbox: new Map(),
    incident_drafts: new Map()
  };

  let openCallCount = 0;

  class MockIDBDatabase {
    constructor() {
      this.isClosed = false;
      this.isClosing = false;
      this.objectStoreNames = {
        contains: (name) => name in storesData
      };
      this.onversionchange = null;
      this.onclose = null;
      this.onerror = null;
    }

    close() {
      this.isClosed = true;
    }

    transaction(storeNames, mode) {
      if (this.isClosing || this.isClosed) {
        const err = new Error(
          "Failed to execute 'transaction' on 'IDBDatabase': The database connection is closing."
        );
        err.name = "InvalidStateError";
        throw err;
      }

      let activeRequests = 0;
      const tx = {
        error: null,
        oncomplete: null,
        onerror: null,
        onabort: null,
        abort: () => {
          if (tx.onabort) setTimeout(tx.onabort, 0);
        },
        _checkComplete: () => {
          setTimeout(() => {
            if (activeRequests === 0 && tx.oncomplete) {
              tx.oncomplete();
            }
          }, 3);
        },
        objectStore: (storeName) => {
          const map = storesData[storeName];
          return {
            put: (record) => {
              activeRequests++;
              const req = { onsuccess: null, onerror: null, result: null, error: null };
              setTimeout(() => {
                const key = record.clientIncidentId || record.draftKey;
                map.set(key, JSON.parse(JSON.stringify(record)));
                req.result = key;
                activeRequests--;
                if (req.onsuccess) req.onsuccess();
                tx._checkComplete();
              }, 1);
              return req;
            },
            get: (key) => {
              activeRequests++;
              const req = { onsuccess: null, onerror: null, result: null, error: null };
              setTimeout(() => {
                req.result = map.has(key) ? JSON.parse(JSON.stringify(map.get(key))) : undefined;
                activeRequests--;
                if (req.onsuccess) req.onsuccess();
                tx._checkComplete();
              }, 1);
              return req;
            },
            getAll: () => {
              activeRequests++;
              const req = { onsuccess: null, onerror: null, result: null, error: null };
              setTimeout(() => {
                req.result = Array.from(map.values()).map(v => JSON.parse(JSON.stringify(v)));
                activeRequests--;
                if (req.onsuccess) req.onsuccess();
                tx._checkComplete();
              }, 1);
              return req;
            },
            delete: (key) => {
              activeRequests++;
              const req = { onsuccess: null, onerror: null, result: null, error: null };
              setTimeout(() => {
                map.delete(key);
                activeRequests--;
                if (req.onsuccess) req.onsuccess();
                tx._checkComplete();
              }, 1);
              return req;
            }
          };
        }
      };

      return tx;
    }
  }

  const mockIDB = {
    getOpenCallCount: () => openCallCount,
    getStoreCount: (storeName) => storesData[storeName].size,
    getStoreData: (storeName) => storesData[storeName],
    open: (name, version) => {
      openCallCount++;
      const req = {
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
        result: null,
        error: null
      };

      setTimeout(() => {
        const db = new MockIDBDatabase();
        req.result = db;
        if (req.onsuccess) req.onsuccess({ target: { result: db } });
      }, 5);

      return req;
    }
  };

  return mockIDB;
}

async function runLifecycleTests() {
  console.log("=== [HEALTHNOVA INDEXEDDB LIFECYCLE RECOVERY REGRESSION SUITE] ===\n");
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

  // Load healthnova-storage.js in a fresh VM context
  function loadStorageModule(mockIdb) {
    const code = fs.readFileSync("public/healthnova-storage.js", "utf8");
    const sandbox = {
      window: {
        indexedDB: mockIdb,
        addEventListener: () => {}
      },
      console,
      setTimeout,
      clearTimeout
    };
    vm.createContext(sandbox);
    vm.runInContext(code, sandbox);
    return sandbox.HealthNovaStorage;
  }

  // Test 1: Normal initialization and incident enqueue
  const mockIdb1 = createMockIndexedDB();
  const storage1 = loadStorageModule(mockIdb1);

  let initialIncident = null;

  await test("1. Initial open and incident enqueue succeeds cleanly", async () => {
    const payload = {
      clientIncidentId: "test-client-rec-001",
      category: "injury",
      urgency: "critical",
      peopleAffected: 3,
      requestText: "Field casualties requiring splints and dressings"
    };

    initialIncident = await storage1.enqueueIncident(payload);
    assert.strictEqual(initialIncident.clientIncidentId, "test-client-rec-001");
    assert.strictEqual(initialIncident.syncStatus, "pending_sync");
    assert.strictEqual(mockIdb1.getStoreCount("incident_outbox"), 1);
  });

  // Test 2: Concurrent openDatabase() callers coalesce into a single open request
  await test("2. Concurrent openDatabase() callers coalesce safely without racing", async () => {
    const initialOpens = mockIdb1.getOpenCallCount();
    // Invalidate cached db to test in-flight coalescing
    storage1.closeDatabase();

    const [dbA, dbB, dbC] = await Promise.all([
      storage1.openDatabase(),
      storage1.openDatabase(),
      storage1.openDatabase()
    ]);

    assert.strictEqual(dbA, dbB);
    assert.strictEqual(dbB, dbC);
    // Only 1 additional open call should have occurred
    assert.strictEqual(mockIdb1.getOpenCallCount(), initialOpens + 1);
  });

  // Test 3: Closing connection recovery during enqueueIncident
  await test("3. Automatically recovers from 'database connection is closing' during enqueueIncident", async () => {
    const db = await storage1.openDatabase();
    // Simulate connection closing right before user action (e.g. tab lifecycle or devtools)
    db.isClosing = true;

    const payload2 = {
      clientIncidentId: "test-client-rec-002",
      category: "evacuation",
      urgency: "high",
      peopleAffected: 5,
      requestText: "Elderly civilians cut off by rising waters"
    };

    // Before fix, this threw: "Failed to execute 'transaction' on 'IDBDatabase': The database connection is closing."
    const incident2 = await storage1.enqueueIncident(payload2);
    assert.strictEqual(incident2.clientIncidentId, "test-client-rec-002");
    assert.strictEqual(incident2.syncStatus, "pending_sync");
    assert.strictEqual(mockIdb1.getStoreCount("incident_outbox"), 2);
  });

  // Test 4: Verifies NO incident duplication occurs during recovery
  await test("4. Connection recovery never duplicates incidents or generates new clientIncidentIds", async () => {
    const items = await storage1.getOutboxIncidents();
    assert.strictEqual(items.length, 2, "Expected exactly 2 distinct incidents in outbox");
    const ids = items.map(i => i.clientIncidentId);
    assert(ids.includes("test-client-rec-001"));
    assert(ids.includes("test-client-rec-002"));
    assert.strictEqual(new Set(ids).size, 2, "Incident IDs must remain unique and unduplicated");
  });

  // Test 5: Safe handling of onversionchange
  await test("5. db.onversionchange cleanly closes and invalidates connection for subsequent calls", async () => {
    const db = await storage1.openDatabase();
    assert(db.onversionchange, "db.onversionchange handler must be attached");

    // Fire versionchange event
    db.onversionchange();

    // Verify next operation opens a fresh connection and succeeds
    const draft = await storage1.saveDraft("test_key", { text: "Saved during version upgrade" });
    assert.strictEqual(draft.draftKey, "test_key");
    const retrieved = await storage1.getDraft("test_key");
    assert.strictEqual(retrieved.text, "Saved during version upgrade");
  });

  // Test 6: Closing connection recovery during outbox read and update
  await test("6. Automatically recovers from closing connection during getOutboxIncidents and updateOutboxItem", async () => {
    const db = await storage1.openDatabase();
    db.isClosing = true;

    // getOutboxIncidents should transparently reopen
    const items = await storage1.getOutboxIncidents();
    assert.strictEqual(items.length, 2);

    // Now close connection again and test updateOutboxItem
    const freshDb = await storage1.openDatabase();
    freshDb.isClosing = true;

    const updated = await storage1.updateOutboxItem("test-client-rec-001", {
      syncStatus: "synced",
      serverIncidentId: "SENTINEL-INC-9999"
    });

    assert(updated);
    assert.strictEqual(updated.syncStatus, "synced");
    assert.strictEqual(updated.serverIncidentId, "SENTINEL-INC-9999");
  });

  console.log(`\nLifecycle Recovery Suite: ${passed}/${total} passed.\n`);
  if (passed !== total) {
    process.exit(1);
  }
}

runLifecycleTests().catch((err) => {
  console.error("FATAL SUITE ERROR:", err);
  process.exit(1);
});
