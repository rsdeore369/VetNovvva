// HealthNova IndexedDB Offline Outbox & Draft Storage (Phase 4 Module C)
// Database: healthnova_offline_db (Version 1)
// PRD Alignment: Section 6 (Data Tier Rules), Section 12 (Intake & Resilience)

(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.HealthNovaStorage = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const DB_NAME = "healthnova_offline_db";
  const DB_VERSION = 1;
  const OUTBOX_STORE = "incident_outbox";
  const DRAFTS_STORE = "incident_drafts";

  let cachedDb = null;
  let pendingOpenPromise = null;

  function getIDBFactory() {
    if (typeof window !== "undefined" && window.indexedDB) {
      return window.indexedDB;
    }
    if (typeof globalThis !== "undefined" && globalThis.indexedDB) {
      return globalThis.indexedDB;
    }
    return null;
  }

  function invalidateConnection(db) {
    if (db && !db._closingHandled) {
      db._closingHandled = true;
      try {
        db.close();
      } catch (_) {}
    }
    if (!db || cachedDb === db) {
      cachedDb = null;
    }
    pendingOpenPromise = null;
  }

  function openDatabase() {
    // If cached connection exists, return it immediately
    if (cachedDb) {
      return Promise.resolve(cachedDb);
    }

    // Coalesce concurrent open requests to prevent racing multiple open attempts
    if (pendingOpenPromise) {
      return pendingOpenPromise;
    }

    pendingOpenPromise = new Promise((resolve, reject) => {
      const idb = getIDBFactory();
      if (!idb) {
        pendingOpenPromise = null;
        return reject(new Error("IndexedDB is not supported in this environment."));
      }

      let req;
      try {
        req = idb.open(DB_NAME, DB_VERSION);
      } catch (openErr) {
        pendingOpenPromise = null;
        return reject(openErr);
      }

      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(OUTBOX_STORE)) {
          const outboxStore = db.createObjectStore(OUTBOX_STORE, { keyPath: "clientIncidentId" });
          outboxStore.createIndex("syncStatus", "syncStatus", { unique: false });
          outboxStore.createIndex("createdAtDevice", "createdAtDevice", { unique: false });
        }
        if (!db.objectStoreNames.contains(DRAFTS_STORE)) {
          db.createObjectStore(DRAFTS_STORE, { keyPath: "draftKey" });
        }
      };

      req.onsuccess = (e) => {
        const db = e.target.result;
        cachedDb = db;
        pendingOpenPromise = null;

        // Lifecycle handlers: immediately invalidate cached connection when closed or upgrading
        db.onversionchange = () => {
          console.warn("[HealthNova Storage] Database onversionchange received. Closing connection.");
          invalidateConnection(db);
        };

        db.onclose = () => {
          console.warn("[HealthNova Storage] Database onclose event received. Clearing cached connection.");
          invalidateConnection(db);
        };

        db.onerror = (errEvt) => {
          console.warn("[HealthNova Storage] Database error event:", errEvt);
        };

        resolve(db);
      };

      req.onerror = (e) => {
        pendingOpenPromise = null;
        reject(e.target.error || new Error("Failed to open IndexedDB"));
      };

      req.onblocked = (e) => {
        console.warn("[HealthNova Storage] Database open blocked by another connection:", e);
      };
    });

    return pendingOpenPromise;
  }

  function isClosingError(err) {
    if (!err) return false;
    const msg = String(err.message || err.name || err).toLowerCase();
    return (
      msg.includes("closing") ||
      msg.includes("closed") ||
      msg.includes("invalidstateerror") ||
      err.name === "InvalidStateError"
    );
  }

  function executeOnDb(db, storeNames, mode, actionFn) {
    return new Promise((resolve, reject) => {
      let tx;
      try {
        tx = db.transaction(storeNames, mode);
      } catch (txCreateErr) {
        // Thrown synchronously if connection is closing/closed
        return reject(txCreateErr);
      }

      let resultValue = undefined;
      let hasFinished = false;

      tx.onabort = () => {
        if (!hasFinished) {
          hasFinished = true;
          reject(tx.error || new Error("Transaction aborted"));
        }
      };

      tx.onerror = () => {
        if (!hasFinished) {
          hasFinished = true;
          reject(tx.error || new Error("Transaction error"));
        }
      };

      tx.oncomplete = () => {
        if (!hasFinished) {
          hasFinished = true;
          resolve(resultValue);
        }
      };

      try {
        actionFn(
          tx,
          (val) => {
            resultValue = val;
          },
          (err) => {
            if (!hasFinished) {
              hasFinished = true;
              try {
                tx.abort();
              } catch (_) {}
              reject(err);
            }
          }
        );
      } catch (actionErr) {
        if (!hasFinished) {
          hasFinished = true;
          try {
            tx.abort();
          } catch (_) {}
          reject(actionErr);
        }
      }
    });
  }

  async function executeTransaction(storeNames, mode, actionFn, isSafeToRetry = true) {
    let db = await openDatabase();
    try {
      return await executeOnDb(db, storeNames, mode, actionFn);
    } catch (err) {
      if (isClosingError(err)) {
        console.warn(
          "[HealthNova Storage] Transaction failed with closing connection. Reopening and recovering...",
          err.message
        );
        invalidateConnection(db);
        if (isSafeToRetry) {
          db = await openDatabase();
          return await executeOnDb(db, storeNames, mode, actionFn);
        }
      }
      throw err;
    }
  }

  // --- Draft Persistence ---

  async function saveDraft(draftKey, data) {
    try {
      return await executeTransaction(
        [DRAFTS_STORE],
        "readwrite",
        (tx, resolveResult, reject) => {
          const store = tx.objectStore(DRAFTS_STORE);
          const record = { draftKey, data, updatedAt: new Date().toISOString() };
          const req = store.put(record);
          req.onsuccess = () => resolveResult(record);
          req.onerror = () => reject(req.error);
        },
        true
      );
    } catch (_) {
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem(`hn_draft_${draftKey}`, JSON.stringify(data));
        }
      } catch (e) {}
    }
  }

  async function getDraft(draftKey) {
    try {
      return await executeTransaction(
        [DRAFTS_STORE],
        "readonly",
        (tx, resolveResult, reject) => {
          const store = tx.objectStore(DRAFTS_STORE);
          const req = store.get(draftKey);
          req.onsuccess = () => resolveResult(req.result ? req.result.data : null);
          req.onerror = () => reject(req.error);
        },
        true
      );
    } catch (_) {
      try {
        if (typeof localStorage !== "undefined") {
          const raw = localStorage.getItem(`hn_draft_${draftKey}`);
          return raw ? JSON.parse(raw) : null;
        }
      } catch (e) {}
      return null;
    }
  }

  async function clearDraft(draftKey) {
    try {
      return await executeTransaction(
        [DRAFTS_STORE],
        "readwrite",
        (tx, resolveResult, reject) => {
          const store = tx.objectStore(DRAFTS_STORE);
          const req = store.delete(draftKey);
          req.onsuccess = () => resolveResult(true);
          req.onerror = () => reject(req.error);
        },
        true
      );
    } catch (_) {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(`hn_draft_${draftKey}`);
      }
    }
  }

  // --- Outbox Queue & State Transitions ---

  async function enqueueIncident(payload) {
    const clientIncidentId =
      payload.clientIncidentId || `hn-client-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const outboxRecord = {
      clientIncidentId,
      clientId: clientIncidentId,
      category: payload.category,
      urgency: payload.urgency,
      peopleAffected: Number(payload.peopleAffected) || 1,
      location: payload.location || null,
      locationAccuracyM: payload.locationAccuracyM || null,
      requestText: String(payload.requestText || "").trim(),
      createdAtDevice: payload.createdAtDevice || new Date().toISOString(),
      sourceType: payload.sourceType || "self_report",
      dataMode: "simulated",
      dataModeLabel: "SIMULATED — FOR DEMONSTRATION ONLY",
      syncStatus: "pending_sync", // pending_sync | synchronizing | synced | validation_error | conflict_error | network_failed
      syncAttempts: 0,
      lastAttemptAt: null,
      lastError: null,
      serverIncidentId: null,
      syncedAt: null
    };

    return await executeTransaction(
      [OUTBOX_STORE],
      "readwrite",
      (tx, resolveResult, reject) => {
        const store = tx.objectStore(OUTBOX_STORE);
        const req = store.put(outboxRecord);
        req.onsuccess = () => resolveResult(outboxRecord);
        req.onerror = () => reject(req.error);
      },
      true // Safe to retry on unstarted transaction: clientIncidentId is already frozen, so put is strictly idempotent
    );
  }

  async function updateOutboxItem(clientIncidentId, updates) {
    return await executeTransaction(
      [OUTBOX_STORE],
      "readwrite",
      (tx, resolveResult, reject) => {
        const store = tx.objectStore(OUTBOX_STORE);
        const getReq = store.get(clientIncidentId);
        getReq.onsuccess = () => {
          if (!getReq.result) return resolveResult(null);
          const updated = { ...getReq.result, ...updates };
          const putReq = store.put(updated);
          putReq.onsuccess = () => resolveResult(updated);
          putReq.onerror = () => reject(putReq.error);
        };
        getReq.onerror = () => reject(getReq.error);
      },
      true
    );
  }

  async function getOutboxIncidents() {
    return await executeTransaction(
      [OUTBOX_STORE],
      "readonly",
      (tx, resolveResult, reject) => {
        const store = tx.objectStore(OUTBOX_STORE);
        const req = store.getAll();
        req.onsuccess = () => {
          const sorted = (req.result || []).sort(
            (a, b) => new Date(b.createdAtDevice) - new Date(a.createdAtDevice)
          );
          resolveResult(sorted);
        };
        req.onerror = () => reject(req.error);
      },
      true
    );
  }

  // --- Background Queue Sync Engine ---

  async function flushOutbox(onItemUpdate) {
    const items = await getOutboxIncidents();
    const pendingItems = items.filter(
      (item) => item.syncStatus !== "synced" && item.syncStatus !== "validation_error"
    );

    const results = { synced: 0, failed: 0, conflicted: 0 };

    for (const item of pendingItems) {
      // Mark synchronizing
      await updateOutboxItem(item.clientIncidentId, { syncStatus: "synchronizing" });
      if (onItemUpdate) onItemUpdate(item.clientIncidentId, "synchronizing");

      const postBody = {
        clientIncidentId: item.clientIncidentId,
        clientId: item.clientIncidentId,
        category: item.category,
        urgency: item.urgency,
        peopleAffected: item.peopleAffected,
        location: item.location,
        locationAccuracyM: item.locationAccuracyM,
        requestText: item.requestText,
        createdAtDevice: item.createdAtDevice,
        sourceType: item.sourceType,
        dataMode: item.dataMode
      };

      try {
        const response = await fetch("/api/incidents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(postBody)
        });

        const data = await response.json();

        if (response.status === 201 || (response.status === 200 && data.ok)) {
          // Success or verified idempotent retry
          await updateOutboxItem(item.clientIncidentId, {
            syncStatus: "synced",
            serverIncidentId: data.incidentId,
            syncedAt: new Date().toISOString(),
            lastAttemptAt: new Date().toISOString(),
            lastError: null
          });
          results.synced++;
          if (onItemUpdate) onItemUpdate(item.clientIncidentId, "synced", data);
        } else if (response.status === 409) {
          // Idempotency payload conflict
          await updateOutboxItem(item.clientIncidentId, {
            syncStatus: "conflict_error",
            serverIncidentId: data.existingIncidentId,
            lastAttemptAt: new Date().toISOString(),
            lastError: data.message || "Idempotency conflict detected."
          });
          results.conflicted++;
          if (onItemUpdate) onItemUpdate(item.clientIncidentId, "conflict_error", data);
        } else if (response.status === 400) {
          // Permanent schema rejection
          await updateOutboxItem(item.clientIncidentId, {
            syncStatus: "validation_error",
            lastAttemptAt: new Date().toISOString(),
            lastError: data.message || "Server validation rejected payload."
          });
          results.failed++;
          if (onItemUpdate) onItemUpdate(item.clientIncidentId, "validation_error", data);
        } else {
          // Transient server error
          await updateOutboxItem(item.clientIncidentId, {
            syncStatus: "network_failed",
            syncAttempts: (item.syncAttempts || 0) + 1,
            lastAttemptAt: new Date().toISOString(),
            lastError: `HTTP ${response.status}: ${data.message || "Server error"}`
          });
          results.failed++;
          if (onItemUpdate) onItemUpdate(item.clientIncidentId, "network_failed", data);
        }
      } catch (networkErr) {
        // Network dropped / offline
        await updateOutboxItem(item.clientIncidentId, {
          syncStatus: "network_failed",
          syncAttempts: (item.syncAttempts || 0) + 1,
          lastAttemptAt: new Date().toISOString(),
          lastError: `Network unreachable: ${networkErr.message}`
        });
        results.failed++;
        if (onItemUpdate) onItemUpdate(item.clientIncidentId, "network_failed");
      }
    }

    return results;
  }

  // Automatically flush outbox when device reconnects to network
  if (typeof window !== "undefined") {
    window.addEventListener("online", () => {
      console.log("[HealthNova Storage] Online event detected. Auto-flushing outbox queue…");
      flushOutbox().catch(() => {});
    });
  }

  return {
    openDatabase,
    closeDatabase: () => invalidateConnection(cachedDb),
    saveDraft,
    getDraft,
    clearDraft,
    enqueueIncident,
    updateOutboxItem,
    getOutboxIncidents,
    flushOutbox
  };
});
