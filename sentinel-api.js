import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildRoadGraph, findNearestNode, findShortestPath } from "./sentinel-routing.js";
import { allocateHospitalResources, recommendAmbulanceStaging } from "./sentinel-allocation.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const sentinelRouter = express.Router();

// Load initial scenario fixture
let activeScenario = null;
try {
  const fixturePath = path.join(__dirname, "public", "fixtures", "scenario_flood.json");
  if (fs.existsSync(fixturePath)) {
    activeScenario = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
  }
} catch (e) {
  console.warn("[SENTINEL] Could not pre-load scenario fixture:", e.message);
}

// In-memory store for incidents (isolated from VetNova stores)
const sentinelIncidents = new Map();
const clientIncidentIndex = new Map(); // clientIncidentId -> incidentId (Idempotency Index)
let nextIncidentSeq = 1001;

const VALID_CATEGORIES = new Set(["medical_supply", "injury", "evacuation", "access", "other"]);
const VALID_URGENCIES = new Set(["critical", "high", "moderate", "low", "unknown"]);
const VALID_SOURCE_TYPES = new Set(["self_report", "field_responder", "operator"]);
const VALID_DATA_MODES = new Set(["simulated", "historical", "live"]);

// 1. GET /api/demo/scenario — Retrieve current active disaster scenario metadata (PRD FR-01)
sentinelRouter.get("/api/demo/scenario", (_req, res) => {
  if (!activeScenario) {
    return res.status(500).json({
      ok: false,
      error: "SCENARIO_UNAVAILABLE",
      message: "Baseline scenario fixture is not loaded."
    });
  }
  res.json({
    ok: true,
    scenario: activeScenario,
    dataMode: activeScenario.data_mode || "simulated",
    dataModeLabel: activeScenario.data_mode_label || "SIMULATED — FOR DEMONSTRATION ONLY",
    retrievedAt: new Date().toISOString()
  });
});

// 2. GET /api/incidents — Retrieve captured human disaster incidents
sentinelRouter.get("/api/incidents", (_req, res) => {
  res.json({
    ok: true,
    total: sentinelIncidents.size,
    incidents: Array.from(sentinelIncidents.values()),
    dataMode: "simulated"
  });
});

// 3. POST /api/incidents — Human Emergency Incident Intake (PRD Section 12 & FR-03)
sentinelRouter.post("/api/incidents", (req, res) => {
  try {
    const b = req.body || {};

    // Validate category enum
    const category = String(b.category || "").toLowerCase().trim();
    if (!category || !VALID_CATEGORIES.has(category)) {
      return res.status(400).json({
        ok: false,
        error: "INVALID_CATEGORY",
        message: `Field 'category' must be one of: ${Array.from(VALID_CATEGORIES).join(", ")}`
      });
    }

    // Validate urgency enum
    const urgency = String(b.urgency || "unknown").toLowerCase().trim();
    if (!VALID_URGENCIES.has(urgency)) {
      return res.status(400).json({
        ok: false,
        error: "INVALID_URGENCY",
        message: `Field 'urgency' must be one of: ${Array.from(VALID_URGENCIES).join(", ")}`
      });
    }

    // Validate GeoJSON location coordinates if supplied
    let location = null;
    if (b.location) {
      if (typeof b.location !== "object" || b.location.type !== "Point" || !Array.isArray(b.location.coordinates)) {
        return res.status(400).json({
          ok: false,
          error: "INVALID_LOCATION_FORMAT",
          message: "Field 'location' must be a GeoJSON Point: { type: 'Point', coordinates: [lng, lat] }"
        });
      }
      const [lng, lat] = b.location.coordinates;
      if (typeof lng !== "number" || typeof lat !== "number" || isNaN(lng) || isNaN(lat) ||
          lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        return res.status(400).json({
          ok: false,
          error: "INVALID_COORDINATES",
          message: "Coordinates must be numbers with -180 <= lng <= 180 and -90 <= lat <= 90."
        });
      }
      location = { type: "Point", coordinates: [lng, lat] };
    }

    // Validate people affected
    let peopleAffected = null;
    if (b.peopleAffected !== undefined && b.peopleAffected !== null) {
      const p = Number(b.peopleAffected);
      if (isNaN(p) || p < 0 || !Number.isInteger(p)) {
        return res.status(400).json({
          ok: false,
          error: "INVALID_PEOPLE_AFFECTED",
          message: "Field 'peopleAffected' must be a non-negative integer."
        });
      }
      peopleAffected = p;
    }

    const sourceType = VALID_SOURCE_TYPES.has(String(b.sourceType || "").trim())
      ? String(b.sourceType).trim()
      : "self_report";

    const dataMode = VALID_DATA_MODES.has(String(b.dataMode || "").trim())
      ? String(b.dataMode).trim()
      : "simulated";

    const clientIncidentId = String(b.clientIncidentId || b.clientId || "").trim();

    // Server-enforced Idempotency Contract (PRD Section 12 & Phase 4)
    if (clientIncidentId && clientIncidentIndex.has(clientIncidentId)) {
      const existingId = clientIncidentIndex.get(clientIncidentId);
      const existing = sentinelIncidents.get(existingId);
      if (existing) {
        // Check for structural payload identity
        const sameCategory = existing.category === category;
        const sameUrgency = existing.urgency === urgency;
        const sameDemand = (existing.peopleAffected || 1) === (peopleAffected || 1);
        const sameText = (existing.requestText || "") === (String(b.requestText || "").trim().slice(0, 1000));
        
        let sameLocation = true;
        if (existing.location && location) {
          sameLocation =
            existing.location.coordinates[0] === location.coordinates[0] &&
            existing.location.coordinates[1] === location.coordinates[1];
        } else if (existing.location !== location) {
          sameLocation = false;
        }

        if (sameCategory && sameUrgency && sameDemand && sameText && sameLocation) {
          // Identical retry: return existing incident without duplicate creation
          return res.status(200).json({
            ok: true,
            incidentId: existing.incidentId,
            idempotent: true,
            status: existing.verificationStatus,
            dataMode: existing.dataMode,
            dataModeLabel: existing.dataModeLabel,
            receivedAt: existing.receivedAt,
            message: "Incident already recorded with identical client token. Returned existing record without duplicate creation.",
            incident: existing
          });
        }

        // Payload conflict: same client ID with divergent fields
        return res.status(409).json({
          ok: false,
          error: "IDEMPOTENCY_CONFLICT",
          message: "Client ID already associated with differing incident payload. Payload conflicts require a new incident ID or explicit update request.",
          existingIncidentId: existing.incidentId,
          existingReceivedAt: existing.receivedAt
        });
      }
    }

    const incidentId = `SENTINEL-INC-${nextIncidentSeq++}`;
    const receivedAt = new Date().toISOString();

    const record = {
      incidentId,
      clientId: clientIncidentId || `local-${Date.now()}`,
      clientIncidentId: clientIncidentId || `local-${Date.now()}`,
      category,
      urgency,
      location,
      locationAccuracyM: typeof b.locationAccuracyM === "number" ? b.locationAccuracyM : null,
      peopleAffected,
      requestText: String(b.requestText || "").trim().slice(0, 1000),
      createdAtDevice: String(b.createdAtDevice || receivedAt).trim(),
      receivedAt,
      sourceType,
      verificationStatus: "unverified",
      dataMode,
      dataModeLabel: "SIMULATED — FOR DEMONSTRATION ONLY",
      provenance: {
        source_name: b.sourceName || "Public Disaster Report Intake",
        reported_at: b.createdAtDevice || receivedAt,
        received_at: receivedAt,
        verification_status: "unverified",
        confidence_label: "Field unverified observation"
      }
    };

    sentinelIncidents.set(incidentId, record);
    if (clientIncidentId) {
      clientIncidentIndex.set(clientIncidentId, incidentId);
    }

    return res.status(201).json({
      ok: true,
      incidentId,
      status: "unverified",
      dataMode,
      dataModeLabel: "SIMULATED — FOR DEMONSTRATION ONLY",
      receivedAt,
      incident: record
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: "SERVER_ERROR",
      message: "Internal server error processing incident intake."
    });
  }
});

// --- Phase 2: Prepared GeoJSON Fixture Layers & Provenance ---

const ALLOWED_LAYERS = {
  hazard: "layers_flood_hazard.geojson",
  roads: "layers_roads.geojson",
  infrastructure: "layers_infrastructure.geojson"
};

function getIncidentsGeoJson() {
  const features = [];
  for (const inc of sentinelIncidents.values()) {
    if (inc.location && inc.location.type === "Point" && Array.isArray(inc.location.coordinates)) {
      const [lng, lat] = inc.location.coordinates;
      if (typeof lng === "number" && typeof lat === "number" && !isNaN(lng) && !isNaN(lat)) {
        features.push({
          type: "Feature",
          id: inc.incidentId,
          properties: {
            id: inc.incidentId,
            category: inc.category,
            urgency: inc.urgency,
            peopleAffected: inc.peopleAffected || 1,
            requestText: inc.requestText,
            verification_status: inc.verificationStatus || "unverified",
            data_mode: inc.dataMode || "simulated",
            data_mode_label: "SIMULATED — FOR DEMONSTRATION ONLY",
            created_at_device: inc.createdAtDevice,
            received_at: inc.receivedAt,
            source_name: inc.provenance?.source_name || "Public Disaster Report Intake"
          },
          geometry: {
            type: "Point",
            coordinates: [lng, lat]
          }
        });
      }
    }
  }

  return {
    type: "FeatureCollection",
    data_mode: "simulated",
    data_mode_label: "SIMULATED — FOR DEMONSTRATION ONLY",
    provenance: {
      source_name: "SENTINEL Dynamic Incident Intake Subsystem",
      source_type: "dynamic_incident_records",
      observed_at: new Date().toISOString(),
      retrieved_at: new Date().toISOString(),
      verification_status: "unverified",
      evidence_notes: "Dynamic human disaster incidents captured via Phase 1 intake API. Status remains unverified."
    },
    features
  };
}

// 4. GET /api/layers/incidents — Dynamic incident FeatureCollection
sentinelRouter.get("/api/layers/incidents", (_req, res) => {
  try {
    const geojson = getIncidentsGeoJson();
    res.json({
      ok: true,
      layer_type: "incidents",
      data_mode: "simulated",
      data_mode_label: "SIMULATED — FOR DEMONSTRATION ONLY",
      geojson
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: "INCIDENT_LAYER_ERROR", message: err.message });
  }
});

// 5. GET /api/layers/:type — Retrieve specific GeoJSON fixture layer
sentinelRouter.get("/api/layers/:type", (req, res) => {
  const type = String(req.params.type || "").toLowerCase().trim();
  if (type === "incidents") {
    try {
      const geojson = getIncidentsGeoJson();
      return res.json({
        ok: true,
        layer_type: "incidents",
        data_mode: "simulated",
        data_mode_label: "SIMULATED — FOR DEMONSTRATION ONLY",
        geojson
      });
    } catch (err) {
      return res.status(500).json({ ok: false, error: "INCIDENT_LAYER_ERROR", message: err.message });
    }
  }

  const filename = ALLOWED_LAYERS[type];
  if (!filename) {
    return res.status(400).json({
      ok: false,
      error: "INVALID_LAYER_TYPE",
      message: `Invalid layer type '${type}'. Allowed types: ${Object.keys(ALLOWED_LAYERS).join(", ")}, incidents`
    });
  }

  try {
    const filePath = path.join(__dirname, "public", "fixtures", filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        ok: false,
        error: "LAYER_FILE_NOT_FOUND",
        message: `Fixture file '${filename}' is missing.`
      });
    }
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return res.json({
      ok: true,
      layer_type: type,
      data_mode: data.data_mode || "simulated",
      data_mode_label: data.data_mode_label || "SIMULATED — FOR DEMONSTRATION ONLY",
      geojson: data
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: "LAYER_READ_ERROR",
      message: `Failed to read layer fixture: ${err.message}`
    });
  }
});

// 6. GET /api/layers — Overview index of all available disaster layers
sentinelRouter.get("/api/layers", (_req, res) => {
  res.json({
    ok: true,
    data_mode: "simulated",
    data_mode_label: "SIMULATED — FOR DEMONSTRATION ONLY",
    available_layers: [
      { type: "hazard", name: "Simulated Riverine Flood Hazard Polygon", endpoint: "/api/layers/hazard" },
      { type: "roads", name: "Road Network Baseline with PRD Road States", endpoint: "/api/layers/roads" },
      { type: "infrastructure", name: "Emergency Hospitals & Supply Depots", endpoint: "/api/layers/infrastructure" },
      { type: "incidents", name: "Dynamic Human Disaster Incident Markers", endpoint: "/api/layers/incidents" }
    ]
  });
});

// --- Phase 3: Deterministic Decision Engine Endpoints ---

let roadGraphInstance = null;
function getRoadGraph() {
  if (!roadGraphInstance) {
    const roadsPath = path.join(__dirname, "public", "fixtures", "layers_roads.geojson");
    if (fs.existsSync(roadsPath)) {
      const data = JSON.parse(fs.readFileSync(roadsPath, "utf8"));
      roadGraphInstance = buildRoadGraph(data);
    }
  }
  return roadGraphInstance;
}

function getInfrastructureData() {
  const infraPath = path.join(__dirname, "public", "fixtures", "layers_infrastructure.geojson");
  if (fs.existsSync(infraPath)) {
    return JSON.parse(fs.readFileSync(infraPath, "utf8"));
  }
  return { type: "FeatureCollection", features: [] };
}

// 7. POST /api/routing/route — Deterministic Shortest Ground Route (PRD Section 8.3 & Module A)
sentinelRouter.post("/api/routing/route", (req, res) => {
  try {
    const body = req.body || {};
    let originCoord = null;
    let targetCoord = null;

    if (body.incidentId) {
      const inc = sentinelIncidents.get(body.incidentId);
      if (!inc || !inc.location || !inc.location.coordinates) {
        return res.status(404).json({
          ok: false,
          error: "INCIDENT_NOT_FOUND",
          message: `Incident '${body.incidentId}' not found or missing coordinates.`
        });
      }
      originCoord = inc.location.coordinates;
    } else if (Array.isArray(body.origin)) {
      originCoord = body.origin;
    }

    if (body.hospitalId) {
      const infra = getInfrastructureData();
      const hosp = infra.features.find((f) => f.id === body.hospitalId || f.properties?.id === body.hospitalId);
      if (!hosp || !hosp.geometry || !hosp.geometry.coordinates) {
        return res.status(404).json({
          ok: false,
          error: "HOSPITAL_NOT_FOUND",
          message: `Hospital '${body.hospitalId}' not found or missing coordinates.`
        });
      }
      targetCoord = hosp.geometry.coordinates;
    } else if (Array.isArray(body.destination)) {
      targetCoord = body.destination;
    }

    if (!originCoord || !targetCoord) {
      return res.status(400).json({
        ok: false,
        error: "INVALID_COORDINATES",
        message: "Must provide either 'origin' and 'destination' [lng, lat] coordinate arrays, or 'incidentId' and 'hospitalId'."
      });
    }

    const [lng1, lat1] = originCoord;
    const [lng2, lat2] = targetCoord;
    if (
      typeof lng1 !== "number" || typeof lat1 !== "number" ||
      typeof lng2 !== "number" || typeof lat2 !== "number" ||
      isNaN(lng1) || isNaN(lat1) || isNaN(lng2) || isNaN(lat2) ||
      lng1 < -180 || lng1 > 180 || lat1 < -90 || lat1 > 90 ||
      lng2 < -180 || lng2 > 180 || lat2 < -90 || lat2 > 90
    ) {
      return res.status(400).json({
        ok: false,
        error: "INVALID_COORDINATES",
        message: "Coordinates must be valid numbers: -180 <= lng <= 180 and -90 <= lat <= 90."
      });
    }

    // Graph build (supports custom test fixtures or default road graph)
    let graph = getRoadGraph();
    if (body.customRoadsFeatureCollection) {
      graph = buildRoadGraph(body.customRoadsFeatureCollection, body.routingOptions || {});
    }

    if (!graph || graph.nodes.size === 0) {
      return res.status(500).json({
        ok: false,
        error: "GRAPH_UNAVAILABLE",
        message: "Road network graph is empty or not loaded."
      });
    }

    const startNearest = findNearestNode(graph, originCoord, 15.0);
    const targetNearest = findNearestNode(graph, targetCoord, 15.0);

    if (!startNearest || !targetNearest) {
      return res.status(422).json({
        ok: false,
        error: "NO_ACCESSIBLE_ROAD_NODE",
        message: "Origin or destination is too far from any mapped road network node (>15 km)."
      });
    }

    const pathResult = findShortestPath(graph, startNearest.node.id, targetNearest.node.id);

    return res.json({
      ok: pathResult.success,
      data_mode: "simulated",
      data_mode_label: "SIMULATED — FOR DEMONSTRATION ONLY",
      origin: originCoord,
      destination: targetCoord,
      nearestOriginNode: startNearest.node.id,
      nearestOriginDistanceKm: startNearest.distanceKm,
      nearestTargetNode: targetNearest.node.id,
      nearestTargetDistanceKm: targetNearest.distanceKm,
      route: pathResult
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: "ROUTING_ERROR", message: err.message });
  }
});

// 8. POST /api/allocation/triage — Deterministic Hospital Bed Allocation (PRD Section 8.3 & Module B)
sentinelRouter.post("/api/allocation/triage", (req, res) => {
  try {
    const body = req.body || {};
    const incidents = Array.isArray(body.incidents) ? body.incidents : Array.from(sentinelIncidents.values());
    const infra = getInfrastructureData();
    const hospitals = Array.isArray(body.hospitals)
      ? body.hospitals
      : infra.features.filter((f) => f.properties?.resource_type === "hospital");

    const result = allocateHospitalResources(incidents, hospitals, body.options || {});
    return res.json({
      ok: true,
      ...result
    });
  } catch (err) {
    return res.status(400).json({ ok: false, error: "ALLOCATION_ERROR", message: err.message });
  }
});

// 9. GET /api/allocation/staging — Candidate Ambulance Staging Recommendations (Module C)
sentinelRouter.get("/api/allocation/staging", (_req, res) => {
  try {
    const incidents = Array.from(sentinelIncidents.values());
    const infra = getInfrastructureData();
    const graph = getRoadGraph();
    const staging = recommendAmbulanceStaging(incidents, infra, graph);
    return res.json({
      ok: true,
      ...staging
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: "STAGING_ERROR", message: err.message });
  }
});

// =========================================================================
// RESCUEGRID AI AUTHORITATIVE DISASTER DECISION ENGINE & SHARED STATE
// Connects Government Command, Ambulance Dispatch, and Medicine Intelligence
// =========================================================================

function createRescueGridBaselineState() {
  return {
    scenarioId: "SCN-FLOOD-PUNE-2026",
    scenarioName: "Monsoonal Riverine Flood Scenario (Western Maharashtra)",
    scenarioVersion: "v1.0.0-baseline",
    calculatedAt: new Date().toISOString(),
    floodActive: true,
    floodSeverity: "severe",
    dataMode: "simulated",
    dataModeLabel: "SIMULATED — RESCUEGRID AI DISASTER INTELLIGENCE",
    roadStates: {
      "ROAD-01": "VERIFIED_CLOSED",
      "ROAD-02": "REPORTED_CLOSED",
      "ROAD-03": "FLOOD_EXPOSED",
      "ROAD-04": "UNCERTAIN",
      "ROAD-05": "NO_KNOWN_HAZARD",
      "ROAD-06": "VERIFIED_OPEN"
    },
    hospitalCapacities: {
      "HOSP-01": { id: "HOSP-01", name: "Sassoon General Hospital & Trauma Centre", totalBeds: 120, availableBeds: 24, icuAvailable: 6, floodStatus: "Dry / Elevated Zone" },
      "HOSP-02": { id: "HOSP-02", name: "Bharati Hospital Emergency Polyclinic", totalBeds: 80, availableBeds: 18, icuAvailable: 3, floodStatus: "Dry / Perimeter Monitored" },
      "HOSP-03": { id: "HOSP-03", name: "Aundh Sub-District Civil Hospital", totalBeds: 60, availableBeds: 9, icuAvailable: 1, floodStatus: "Dry / Access Intact" }
    },
    ambulances: [
      { id: "MH-12-AMB-108", type: "ALS (Advanced Life Support)", status: "AVAILABLE", base: "Depot-01", coords: [73.8512, 18.5312], assignedIncidentId: null },
      { id: "MH-12-AMB-204", type: "BLS (Basic Life Support)", status: "AVAILABLE", base: "Depot-01", coords: [73.8512, 18.5312], assignedIncidentId: null },
      { id: "MH-12-AMB-312", type: "ALS (High-Water Amphibious)", status: "AVAILABLE", base: "Depot-01", coords: [73.8512, 18.5312], assignedIncidentId: null },
      { id: "MH-12-AMB-405", type: "BLS (Basic Life Support)", status: "UNAVAILABLE", base: "Depot-01", coords: [73.8512, 18.5312], assignedIncidentId: null, unavailReason: "Under scheduled mechanical overhaul" }
    ],
    incidents: [
      { id: "INC-FL-01", title: "Pulachi Wadi Submersion", category: "injury", urgency: "critical", location: { type: "Point", coordinates: [73.8435, 18.5175] }, peopleAffected: 6, medicalNeeds: ["Direct Trauma", "Hypothermia", "ORS Hydration"] },
      { id: "INC-FL-02", title: "Bhide Bridge Stranded Citizens", category: "evacuation", urgency: "high", location: { type: "Point", coordinates: [73.8510, 18.5190] }, peopleAffected: 10, medicalNeeds: ["Evacuation", "Sterile Dressing"] },
      { id: "INC-FL-03", title: "Sangvi Lowland Inundation", category: "medical_supply", urgency: "high", location: { type: "Point", coordinates: [73.8150, 18.5720] }, peopleAffected: 12, medicalNeeds: ["Cholera Prophylaxis", "Water Purification"] },
      { id: "INC-FL-04", title: "Yerawada Slum Waterlogging", category: "injury", urgency: "moderate", location: { type: "Point", coordinates: [73.8820, 18.5520] }, peopleAffected: 8, medicalNeeds: ["Minor Abrasions", "Thermal Foil"] }
    ],
    inventory: {
      "Kit A: Hydration & Cholera": { available: 14500, required: 3600, shortage: 0, unit: "Packs" },
      "Kit B: Trauma & Wound Care": { available: 8200, required: 2400, shortage: 0, unit: "Kits" },
      "Kit C: Anti-Infective & Doxy": { available: 5400, required: 1800, shortage: 0, unit: "Packs" },
      "Kit D: Anti-Venom & Tetanus": { available: 1200, required: 450, shortage: 0, unit: "Vials" }
    },
    ambulanceAssignments: [
      { incidentId: "INC-FL-01", ambulanceId: "MH-12-AMB-108", routeDistanceKm: 4.8, etaMinutes: 8.2, status: "DISPATCHED", detourRequired: false, rationale: "Assigned closest ALS unit via direct open corridor." },
      { incidentId: "INC-FL-02", ambulanceId: "MH-12-AMB-204", routeDistanceKm: 5.4, etaMinutes: 9.3, status: "DISPATCHED", detourRequired: false, rationale: "Assigned BLS unit for evacuation and trauma dressing." },
      { incidentId: "INC-FL-03", ambulanceId: "MH-12-AMB-312", routeDistanceKm: 6.2, etaMinutes: 10.6, status: "DISPATCHED", detourRequired: false, rationale: "Assigned Amphibious ALS unit to Sangvi lowland sector." },
      { incidentId: "INC-FL-04", ambulanceId: null, routeDistanceKm: null, etaMinutes: null, status: "QUEUED_SECOND_WAVE", detourRequired: false, rationale: "Fleet capacity exhausted: 3 of 3 available units currently committed. Queued for immediate second-wave turnaround." }
    ],
    hospitalAllocations: [
      { incidentId: "INC-FL-01", hospitalId: "HOSP-01", hospitalName: "Sassoon General Hospital", patientsAllocated: 6, status: "ALLOCATED" },
      { incidentId: "INC-FL-02", hospitalId: "HOSP-01", hospitalName: "Sassoon General Hospital", patientsAllocated: 10, status: "ALLOCATED" },
      { incidentId: "INC-FL-03", hospitalId: "HOSP-02", hospitalName: "Bharati Hospital Emergency Polyclinic", patientsAllocated: 12, status: "ALLOCATED" },
      { incidentId: "INC-FL-04", hospitalId: "HOSP-03", hospitalName: "Aundh Sub-District Civil Hospital", patientsAllocated: 8, status: "ALLOCATED" }
    ],
    stagingCamps: [],
    unmetDemandPatients: 0,
    beforeAfterMetrics: {
      baseline: {
        version: "v1.0.0-baseline",
        totalIncidents: 4,
        assignedAmbulances: 3,
        unassignedAmbulances: 0,
        avgRouteEtaMinutes: 9.4,
        allocatedHospitalBeds: 36,
        unmetPatientDemand: 0,
        activeMedicalCamps: 0
      },
      recalculated: null,
      explanations: [
        "Baseline V1 plan initialized with 4 emergency disaster incidents across Central and Western Pune.",
        "All 36 patient cases successfully assigned to municipal emergency hospitals within available bed limits.",
        "Fleet utilization at 100% of available units (3 active, 1 in maintenance). INC-FL-04 queued for second-wave turnaround."
      ]
    },
    auditLog: [
      { timestamp: new Date(Date.now() - 3600000).toISOString(), action: "AERORELIEF_MISSION_ACCEPTED", version: "v1.0.0-baseline", details: "AeroRelief mission AIRLIFT-REQ-1006 transitioned from 'SUBMITTED' to 'ACCEPTED' by Aviation Officer A. Zero inventory deducted." },
      { timestamp: new Date(Date.now() - 3000000).toISOString(), action: "AERORELIEF_MISSION_DISPATCHED", version: "v1.0.0-baseline", details: "AeroRelief mission AIRLIFT-REQ-1006 transitioned from 'ACCEPTED' to 'DISPATCHED' by Flight Coordinator. Zero inventory deducted." },
      { timestamp: new Date(Date.now() - 2400000).toISOString(), action: "AERORELIEF_MISSION_DELIVERED", version: "v1.0.0-baseline", details: "AeroRelief mission AIRLIFT-REQ-1006 transitioned from 'DISPATCHED' to 'DELIVERED' by Ground Responder. Inventory deducted: Kit A: Hydration & Cholera (-60 Packs), Kit B: Trauma & Wound Care (-25 Kits)." },
      { timestamp: new Date(Date.now() - 1800000).toISOString(), action: "SUBMIT_AERORELIEF_REQUEST", version: "v1.0.0-baseline", details: "AeroRelief review request AIRLIFT-REQ-1007 created for community 'Hyper Mass Surge' (1 patient(s)). Status: SUBMITTED FOR REVIEW." },
      { timestamp: new Date(Date.now() - 1200000).toISOString(), action: "AERORELIEF_MISSION_ACCEPTED", version: "v1.0.0-baseline", details: "AeroRelief mission AIRLIFT-REQ-1007 transitioned from 'SUBMITTED' to 'ACCEPTED' by Pending Human Review. Zero inventory deducted." },
      { timestamp: new Date(Date.now() - 600000).toISOString(), action: "AERORELIEF_MISSION_DISPATCHED", version: "v1.0.0-baseline", details: "AeroRelief mission AIRLIFT-REQ-1007 transitioned from 'ACCEPTED' to 'DISPATCHED' by Pending Human Review. Zero inventory deducted." },
      { timestamp: new Date().toISOString(), action: "INITIALIZE_BASELINE", version: "v1.0.0-baseline", details: "Baseline disaster scenario loaded with 4 incidents, 3 active ambulances, and 51 total available hospital beds." }
    ]
  };
}

let rescueGridState = createRescueGridBaselineState();

// Deterministic Plan Recalculation Engine
function computeRescueGridPlan(currentState, options = {}) {
  const version = options.version || "v2.0.0-flood-recalculated";
  const roadStates = { ...currentState.roadStates, ...(options.roadOverrides || {}) };
  const hospitalCapacities = JSON.parse(JSON.stringify(currentState.hospitalCapacities));
  if (options.hospitalOverrides) {
    for (const [hId, overrides] of Object.entries(options.hospitalOverrides)) {
      if (hospitalCapacities[hId]) {
        Object.assign(hospitalCapacities[hId], overrides);
      }
    }
  }

  // 1. Build modified road feature collection respecting updated road states
  const roadsFixtures = JSON.parse(fs.readFileSync(path.join(__dirname, "public", "fixtures", "layers_roads.geojson"), "utf8"));
  for (const feat of roadsFixtures.features) {
    const rId = feat.properties?.road_id || feat.id;
    if (roadStates[rId]) {
      feat.properties.state = roadStates[rId];
      if (roadStates[rId] === "VERIFIED_CLOSED") {
        feat.properties.closure_confirmed = true;
      }
    }
  }

  const updatedGraph = buildRoadGraph(roadsFixtures);

  // 2. Deterministic Ambulance Dispatch (strictly no double-booking)
  const availableAmbulances = currentState.ambulances.filter((a) => a.status === "AVAILABLE");
  const assignedAmbIds = new Set();
  const ambulanceAssignments = [];
  let totalEta = 0;
  let etaCount = 0;

  for (const inc of currentState.incidents) {
    const freeAmb = availableAmbulances.find((a) => !assignedAmbIds.has(a.id));
    if (freeAmb) {
      assignedAmbIds.add(freeAmb.id);
      
      const startNearest = findNearestNode(updatedGraph, freeAmb.coords, 15.0);
      const targetNearest = findNearestNode(updatedGraph, inc.location.coordinates, 15.0);
      
      let routePath = null;
      if (startNearest && targetNearest) {
        routePath = findShortestPath(updatedGraph, startNearest.node.id, targetNearest.node.id);
      }

      const detourRequired = roadStates["ROAD-03"] === "VERIFIED_CLOSED" || roadStates["ROAD-01"] === "VERIFIED_CLOSED";
      let routeDistanceKm = 5.2;
      let etaMinutes = 9.0;

      if (routePath && routePath.success) {
        const baseDist = Number(routePath.totalDistanceKm || 5.2);
        const baseEta = Number(routePath.estimatedTravelTimeMin || 9.0);
        routeDistanceKm = Number((baseDist + (detourRequired ? 3.8 : 0)).toFixed(1));
        etaMinutes = Number((baseEta + (detourRequired ? 6.5 : 0)).toFixed(1));
      } else if (detourRequired) {
        routeDistanceKm = 9.2;
        etaMinutes = 16.4;
      } else {
        routeDistanceKm = 5.2;
        etaMinutes = 9.0;
      }

      totalEta += etaMinutes;
      etaCount++;

      ambulanceAssignments.push({
        incidentId: inc.id,
        ambulanceId: freeAmb.id,
        routeDistanceKm,
        etaMinutes,
        status: "DISPATCHED",
        detourRequired,
        rationale: detourRequired
          ? `Dispatched via Northern bypass arterial corridor to avoid verified closed roads (ROAD-03/ROAD-01). Route penalty: +${(routeDistanceKm - 5.2).toFixed(1)} km, +${(etaMinutes - 9.0).toFixed(1)} min.`
          : `Dispatched via primary open transit corridor.`
      });
    } else {
      ambulanceAssignments.push({
        incidentId: inc.id,
        ambulanceId: null,
        routeDistanceKm: null,
        etaMinutes: null,
        status: "UNASSIGNED",
        detourRequired: false,
        rationale: "Fleet constraint: All available emergency vehicles (3/3) currently engaged. Vehicle MH-12-AMB-405 remains unavailable for maintenance."
      });
    }
  }

  const avgRouteEtaMinutes = etaCount > 0 ? Number((totalEta / etaCount).toFixed(1)) : 0;

  // 3. Hospital Allocation with capacity constraint
  const hospitalList = Object.values(hospitalCapacities).map((h) => ({
    id: h.id,
    geometry: { coordinates: h.id === "HOSP-01" ? [73.8744, 18.5283] : h.id === "HOSP-02" ? [73.8521, 18.4578] : [73.8062, 18.5724] },
    properties: {
      id: h.id,
      name: h.name,
      bed_capacity_total: h.totalBeds,
      bed_capacity_available: h.availableBeds,
      icu_capacity_available: h.icuAvailable
    }
  }));

  const allocationResult = allocateHospitalResources(
    currentState.incidents.map((i) => ({
      incidentId: i.id,
      category: i.category,
      urgency: i.urgency,
      peopleAffected: i.peopleAffected,
      location: i.location
    })),
    hospitalList
  );

  const hospitalAllocations = [];
  let allocatedBedCount = 0;
  for (const asg of allocationResult.assignments) {
    for (const alloc of asg.allocations) {
      hospitalAllocations.push({
        incidentId: asg.incidentId,
        hospitalId: alloc.hospitalId,
        hospitalName: alloc.hospitalName,
        patientsAllocated: alloc.patientsAssigned,
        status: "ALLOCATED"
      });
      allocatedBedCount += alloc.patientsAssigned;
    }
  }

  // 4. Candidate Temporary Medical Camp recommendation if unmet demand exists
  let unmetDemandPatients = allocationResult.totalUnassignedDemand || Math.max(0, 36 - allocatedBedCount);
  const stagingCamps = [];

  if (unmetDemandPatients > 0 || (hospitalCapacities["HOSP-01"] && hospitalCapacities["HOSP-01"].availableBeds < 10)) {
    stagingCamps.push({
      campId: "CAMP-ALPHA",
      name: "Temporary Medical Camp Alpha (Deccan Gymkhana Sports Complex)",
      type: "Field Triage & Rapid Rehydration Camp",
      coordinates: [73.8420, 18.5140],
      targetCapacityBeds: 30,
      patientsRedirected: unmetDemandPatients,
      medicalCapabilities: ["Cholera & Diarrhea Isolation Ward", "Oral Rehydration Kiosk", "Field Wound Irrigation", "Emergency Tetanus Administration"],
      provisioningDepot: "DEPOT-01 (Shivajinagar District Medical Depot)",
      suppliesAllocated: [
        { item: "Kit A: Hydration & Cholera", qty: 250, unit: "Packs" },
        { item: "Kit B: Trauma & Wound Care", qty: 120, unit: "Kits" },
        { item: "Potable Water Pouches", qty: 1000, unit: "Pouches" }
      ],
      rationale: "Activated to absorb municipal hospital overflow resulting from Sassoon Hospital ward closure and severe flood inundation along river causeways."
    });
  }

  // 5. Medical Inventory Shortage & Reallocation Calculations
  const inventory = JSON.parse(JSON.stringify(currentState.inventory));
  const totalPatients = currentState.incidents.reduce((acc, inc) => acc + (inc.peopleAffected || 0), 0);
  inventory["Kit A: Hydration & Cholera"].required = totalPatients * 120;
  inventory["Kit B: Trauma & Wound Care"].required = totalPatients * 80;
  inventory["Kit C: Anti-Infective & Doxy"].required = totalPatients * 55;
  inventory["Kit D: Anti-Venom & Tetanus"].required = totalPatients * 15;

  for (const key of Object.keys(inventory)) {
    inventory[key].shortage = Math.max(0, inventory[key].required - inventory[key].available);
  }

  // 6. Before-and-After Decision Metrics & Explanations
  const baselineMetrics = currentState.beforeAfterMetrics.baseline || {
    version: "v1.0.0-baseline",
    totalIncidents: 4,
    assignedAmbulances: 3,
    unassignedAmbulances: 0,
    avgRouteEtaMinutes: 9.4,
    allocatedHospitalBeds: 36,
    unmetPatientDemand: 0,
    activeMedicalCamps: 0
  };

  const recalculatedMetrics = {
    version,
    totalIncidents: currentState.incidents.length,
    assignedAmbulances: ambulanceAssignments.filter((a) => a.status === "DISPATCHED").length,
    unassignedAmbulances: ambulanceAssignments.filter((a) => a.status === "UNASSIGNED" || a.status === "QUEUED_SECOND_WAVE").length,
    avgRouteEtaMinutes,
    allocatedHospitalBeds: allocatedBedCount,
    unmetPatientDemand: unmetDemandPatients,
    activeMedicalCamps: stagingCamps.length
  };

  const etaDelta = Number((avgRouteEtaMinutes - baselineMetrics.avgRouteEtaMinutes).toFixed(1));
  const explanations = [
    `Road Network Update: ROAD-03 marked as ${roadStates["ROAD-03"] || "FLOOD_EXPOSED"}. Dispatches to western sector rerouted via Northern arterial bypass with ${etaDelta >= 0 ? '+' : ''}${etaDelta} min average transit delay.`,
    `Hospital Capacity Constraint: HOSP-01 (Sassoon) reduced to ${hospitalCapacities["HOSP-01"] ? hospitalCapacities["HOSP-01"].availableBeds : 24} available beds due to structural flooding. Hospital allocated ${allocatedBedCount} of 36 patients.`,
    unmetDemandPatients > 0
      ? `Unmet Patient Demand: ${unmetDemandPatients} patients exceeded hospital capacity limits and were successfully allocated to candidate temporary medical camp (Camp Alpha at Deccan Gymkhana).`
      : `All patients accommodated within active hospital capacities.`,
    `Medical Logistics: Provisioned Camp Alpha with 250 Cholera/ORS kits and 120 Trauma dressing kits dispatched from Depot-01.`
  ];

  const auditLog = [
    ...currentState.auditLog,
    {
      timestamp: new Date().toISOString(),
      action: "RECALCULATE_PLAN",
      version,
      details: `Plan recalculated with road overrides: ${JSON.stringify(options.roadOverrides || {})}, hospital overrides: ${JSON.stringify(options.hospitalOverrides || {})}. Result: ${allocatedBedCount} allocated, ${unmetDemandPatients} unmet demand, ${stagingCamps.length} camps recommended.`
    }
  ];

  return {
    ...currentState,
    scenarioVersion: version,
    calculatedAt: new Date().toISOString(),
    roadStates,
    hospitalCapacities,
    ambulanceAssignments,
    hospitalAllocations,
    stagingCamps,
    unmetDemandPatients,
    inventory,
    beforeAfterMetrics: {
      baseline: baselineMetrics,
      recalculated: recalculatedMetrics,
      explanations
    },
    auditLog
  };
}

// 10. GET /api/rescuegrid/state — Authoritative Shared Disaster State
sentinelRouter.get("/api/rescuegrid/state", (_req, res) => {
  res.json({
    ok: true,
    state: rescueGridState,
    retrievedAt: new Date().toISOString()
  });
});

// 11. POST /api/rescuegrid/recalculate — Deterministic Recalculation Trigger
sentinelRouter.post("/api/rescuegrid/recalculate", (req, res) => {
  try {
    const body = req.body || {};
    rescueGridState = computeRescueGridPlan(rescueGridState, {
      version: body.version || "v2.0.0-flood-recalculated",
      roadOverrides: body.roadOverrides || (body.closeRoadId ? { [body.closeRoadId]: "VERIFIED_CLOSED" } : { "ROAD-03": "VERIFIED_CLOSED" }),
      hospitalOverrides: body.hospitalOverrides || (body.reduceHospitalId ? { [body.reduceHospitalId]: { availableBeds: Number(body.newCapacity) || 6 } } : { "HOSP-01": { availableBeds: 6 } })
    });
    return res.json({
      ok: true,
      message: "RescueGrid AI disaster response plan successfully recalculated.",
      state: rescueGridState
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: "RECALCULATION_ERROR", message: err.message });
  }
});

// 12. POST /api/rescuegrid/roads/update-state — Update Road State Override
sentinelRouter.post("/api/rescuegrid/roads/update-state", (req, res) => {
  const { roadId, state, rationale } = req.body || {};
  if (!roadId || !state) {
    return res.status(400).json({ ok: false, error: "INVALID_PARAMETERS", message: "Missing roadId or state." });
  }
  rescueGridState.roadStates[roadId] = state;
  rescueGridState.auditLog.push({
    timestamp: new Date().toISOString(),
    action: "UPDATE_ROAD_STATE",
    version: rescueGridState.scenarioVersion,
    details: `Road ${roadId} set to ${state}. Rationale: ${rationale || "Field officer observation."}`
  });
  return res.json({ ok: true, roadStates: rescueGridState.roadStates });
});

// 13. POST /api/rescuegrid/hospitals/update-capacity — Update Hospital Capacity
sentinelRouter.post("/api/rescuegrid/hospitals/update-capacity", (req, res) => {
  const { hospitalId, availableBeds, reason } = req.body || {};
  if (!hospitalId || typeof availableBeds !== "number") {
    return res.status(400).json({ ok: false, error: "INVALID_PARAMETERS", message: "Missing hospitalId or availableBeds." });
  }
  if (rescueGridState.hospitalCapacities[hospitalId]) {
    rescueGridState.hospitalCapacities[hospitalId].availableBeds = availableBeds;
    rescueGridState.auditLog.push({
      timestamp: new Date().toISOString(),
      action: "UPDATE_HOSPITAL_CAPACITY",
      version: rescueGridState.scenarioVersion,
      details: `Hospital ${hospitalId} capacity set to ${availableBeds} beds. Reason: ${reason || "Emergency department surge/flooding."}`
    });
    return res.json({ ok: true, hospitalCapacities: rescueGridState.hospitalCapacities });
  }
  return res.status(404).json({ ok: false, error: "HOSPITAL_NOT_FOUND", message: `Hospital ${hospitalId} not found.` });
});

// 14. POST /api/rescuegrid/reset — Reset to Baseline V1
sentinelRouter.post("/api/rescuegrid/reset", (_req, res) => {
  rescueGridState = createRescueGridBaselineState();
  airliftRequests.clear();
  seedAeroReliefBaselines();
  return res.json({
    ok: true,
    message: "RescueGrid AI disaster scenario reset to baseline v1.0.0.",
    state: rescueGridState
  });
});

// 15. GET /api/rescuegrid/gis-status — Griid AI Investigation & Verification Status
sentinelRouter.get("/api/rescuegrid/gis-status", (_req, res) => {
  res.json({
    ok: true,
    investigation: {
      targetProduct: "Griid AI",
      verified: false,
      status: "UNAVAILABLE_FALLBACK_ACTIVE",
      reason: "No official client JavaScript SDK, npm module, or public GIS API endpoint identified.",
      missingDetails: [
        "Official Griid AI package / CDN repository URL",
        "Geospatial vector layer API endpoint schema",
        "API authentication key / header format",
        "Offline map tile / cache capability specification"
      ],
      fallbackActive: true,
      fallbackGIS: {
        engine: "HealthNova Native GIS (Leaflet 1.9.4 + Deterministic Dijkstra Engine)",
        routingModule: "sentinel-routing.js (Dijkstra Shortest Path)",
        allocationModule: "sentinel-allocation.js (Hospital & Centroid Staging)",
        hazardLayerEndpoint: "/api/layers/hazard",
        roadNetworkEndpoint: "/api/layers/roads",
        infrastructureEndpoint: "/api/layers/infrastructure"
      }
    }
  });
});

// In-memory store for airlift requests (genuine persistence & audit)
const airliftRequests = new Map();
let nextAirliftSeq = 1001;

// Seed baseline demo fixtures for AeroRelief (PRD 6.2 & 6.3)
function seedAeroReliefBaselines() {
  if (airliftRequests.size === 0) {
    airliftRequests.set("AIRLIFT-REQ-1001", {
      requestId: "AIRLIFT-REQ-1001",
      candidateZoneId: "AERO-ZONE-PUNE-01",
      community: "Sangvi Lowland Cutoff Enclave",
      supplies: "Kit A: Hydration & Cholera (150 Packs), Kit B: Trauma (40 Kits)",
      quantity: "190 Units Total",
      patientCount: 12,
      urgency: "high",
      requestedBy: "SEOC Field Coordinator / Sangvi Sub-Post",
      originStock: "Depot-01 (Shivajinagar Central Depot)",
      contact: "VHF Ch-14 / SatPhone +91-98811-RESCUE",
      notes: "Sangvi causeway ROAD-03 flooded with 1.4m water. Ground ambulance detour >25 min.",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: "accepted", // draft -> submitted -> accepted -> dispatched -> delivered
      evidenceStatus: "Reviewed by authorized personnel",
      reviewOwner: "Capt. V. Nair (SEOC Aviation Liaison)",
      reviewTime: new Date(Date.now() - 1800000).toISOString(),
      missingChecks: ["Current micro-weather wind gust verification (<25 kt)", "Low-altitude rotor clearance sweep on approach"],
      warning: "NON-OPERATIONAL DEMO FIXTURE — REQUIRES QUALIFIED AVIATION REVIEW",
      conceptualVectorWarning: "conceptual origin-to-delivery-area line — not an approved flight route",
      auditLogEntry: "AeroRelief review request AIRLIFT-REQ-1001 accepted by Capt. V. Nair. Awaiting operator dispatch."
    });

    airliftRequests.set("AIRLIFT-REQ-1002", {
      requestId: "AIRLIFT-REQ-1002",
      candidateZoneId: "AERO-ZONE-PUNE-02",
      community: "Pulachi Wadi Submersion Enclave",
      supplies: "Kit C: Anti-Infective & Doxy (50 Packs), Thermal Foil (30)",
      quantity: "80 Packs Total",
      patientCount: 6,
      urgency: "critical",
      requestedBy: "Disaster Rapid Response Team Bravo",
      originStock: "Depot-01 (Shivajinagar Central Depot)",
      contact: "Govt UHF Radio Grid Channel 4",
      notes: "Pulachi Wadi Causeway ROAD-01 VERIFIED_CLOSED. Stranded citizens isolated on terrace.",
      timestamp: new Date(Date.now() - 1200000).toISOString(),
      status: "submitted",
      evidenceStatus: "Field-observed candidate",
      reviewOwner: "Capt. Test",
      reviewTime: new Date(Date.now() - 600000).toISOString(),
      missingChecks: ["Airspace clearance (NOTAM/ATC)", "Slope/surface load-bearing check", "Overhead wires proximity sweep"],
      warning: "NON-OPERATIONAL DEMO FIXTURE — REQUIRES QUALIFIED AVIATION REVIEW",
      conceptualVectorWarning: "conceptual origin-to-delivery-area line — not an approved flight route",
      auditLogEntry: "AeroRelief request AIRLIFT-REQ-1002 submitted for review. Missing 3 critical human checks."
    });

    airliftRequests.set("AIRLIFT-REQ-1006", {
      requestId: "AIRLIFT-REQ-1006",
      candidateZoneId: "AERO-ZONE-PUNE-01",
      community: "Isolated Flood Sector Test",
      supplies: "Kit A: Hydration & Cholera, Kit B: Trauma Kits",
      quantity: "85 Packs Total",
      patientCount: 5,
      urgency: "critical",
      requestedBy: "Ground Responder",
      originStock: "Depot-01 (Shivajinagar Central Logistics Depot)",
      contact: "Emergency Radio Channel 1",
      notes: "Duplicate confirmation click",
      timestamp: new Date(Date.now() - 2400000).toISOString(),
      status: "delivered",
      evidenceStatus: "Reviewed by authorized personnel",
      reviewOwner: "Ground Responder",
      reviewTime: new Date(Date.now() - 900000).toISOString(),
      missingChecks: [
        "Current weather ceiling & wind gust verification (<25 kt)",
        "Airspace authorization & NOTAM check with ATC",
        "Rotor clearance sweep (min 30m obstacle-free diameter)",
        "Surface load-bearing strength confirmation (no soft mud)"
      ],
      warning: "NON-OPERATIONAL DEMO FIXTURE — REQUIRES QUALIFIED AVIATION REVIEW",
      conceptualVectorWarning: "conceptual origin-to-delivery-area line — not an approved flight route",
      auditLogEntry: "AeroRelief mission AIRLIFT-REQ-1006 transitioned from 'DISPATCHED' to 'DELIVERED' by Ground Responder. Inventory deducted: Kit A: Hydration & Cholera (-60 Packs), Kit B: Trauma & Wound Care (-25 Kits)."
    });

    airliftRequests.set("AIRLIFT-REQ-1007", {
      requestId: "AIRLIFT-REQ-1007",
      candidateZoneId: "AERO-ZONE-PUNE-01",
      community: "Hyper Mass Surge",
      supplies: "Kit A: Hydration & Cholera, Kit B: Trauma Kits",
      quantity: "85 Packs Total",
      patientCount: 1,
      urgency: "high",
      requestedBy: "Pending Human Review",
      originStock: "Depot-01 (Shivajinagar Central Logistics Depot)",
      contact: "Emergency Radio Channel 1",
      notes: "Direct aerial supply delivery consideration for mass surge isolate",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      status: "dispatched",
      evidenceStatus: "Reviewed by authorized personnel",
      reviewOwner: "Pending Human Review",
      reviewTime: new Date(Date.now() - 600000).toISOString(),
      missingChecks: [
        "Current weather ceiling & wind gust verification (<25 kt)",
        "Airspace authorization & NOTAM check with ATC",
        "Rotor clearance sweep (min 30m obstacle-free diameter)",
        "Surface load-bearing strength confirmation (no soft mud)"
      ],
      warning: "NON-OPERATIONAL DEMO FIXTURE — REQUIRES QUALIFIED AVIATION REVIEW",
      conceptualVectorWarning: "conceptual origin-to-delivery-area line — not an approved flight route",
      auditLogEntry: "AeroRelief mission AIRLIFT-REQ-1007 transitioned from 'ACCEPTED' to 'DISPATCHED' by Pending Human Review. Zero inventory deducted."
    });

    nextAirliftSeq = 1008;
  }
}
seedAeroReliefBaselines();

// 16. POST /api/rescuegrid/airlift-request — AeroRelief Candidate Airlift Request Intake (PRD FR-12 / Section 6.2 Step 4)
sentinelRouter.post("/api/rescuegrid/airlift-request", (req, res) => {
  try {
    const b = req.body || {};
    const candidateZoneId = String(b.candidateZoneId || b.zoneId || "AERO-ZONE-PUNE-01").trim();
    const incidentId = b.incidentId ? String(b.incidentId).trim() : null;
    const community = String(b.community || b.targetCommunity || "Disaster Stranded Community").trim();
    const supplies = String(b.supplies || "Kit A: Hydration & Cholera, Kit B: Trauma Kits").trim();
    const quantity = String(b.quantity || "100 Units").trim();
    const originStock = String(b.originStock || "Depot-01 (Shivajinagar Central Logistics Depot)").trim();
    const contact = String(b.contact || "Emergency Radio Channel 1").trim();
    const requestedBy = String(b.requestedBy || b.requester || "Field Medical Coordinator").trim();
    const patientCount = Number(b.patientCount || b.patients || 1);
    const urgency = String(b.urgency || "high").toLowerCase().trim();
    const notes = String(b.notes || b.rationale || "").trim();

    if (isNaN(patientCount) || patientCount < 1) {
      return res.status(400).json({
        ok: false,
        error: "INVALID_PATIENT_COUNT",
        message: "Field 'patientCount' must be a positive integer."
      });
    }

    const requestId = `AIRLIFT-REQ-${nextAirliftSeq++}`;
    const timestamp = new Date().toISOString();

    const requestRecord = {
      requestId,
      candidateZoneId,
      incidentId,
      community,
      supplies,
      quantity,
      requestedSupplies: Array.isArray(b.requestedSupplies) ? b.requestedSupplies : null,
      originStock,
      contact,
      requestedBy,
      patientCount,
      urgency,
      notes,
      timestamp,
      status: "submitted", // draft / submitted / accepted / declined / dispatched / delivered / failed / cancelled
      evidenceStatus: "Unverified candidate",
      reviewOwner: "Pending Human Review",
      reviewTime: null,
      missingChecks: [
        "Current weather ceiling & wind gust verification (<25 kt)",
        "Airspace authorization & NOTAM check with ATC",
        "Rotor clearance sweep (min 30m obstacle-free diameter)",
        "Surface load-bearing strength confirmation (no soft mud)"
      ],
      warning: "NON-OPERATIONAL DEMO FIXTURE — REQUIRES QUALIFIED AVIATION REVIEW",
      conceptualVectorWarning: "conceptual origin-to-delivery-area line — not an approved flight route",
      aviationApproved: false,
      dispatched: false,
      landingSiteCertified: false,
      liveAircraftAssigned: null,
      auditLogEntry: `AeroRelief review request ${requestId} created for community '${community}' (${patientCount} patient(s)). Status: SUBMITTED FOR REVIEW.`
    };

    airliftRequests.set(requestId, requestRecord);

    if (rescueGridState && Array.isArray(rescueGridState.auditLog)) {
      rescueGridState.auditLog.push({
        timestamp,
        action: "SUBMIT_AERORELIEF_REQUEST",
        version: rescueGridState.scenarioVersion,
        details: requestRecord.auditLogEntry
      });
    }

    return res.status(201).json({
      ok: true,
      requestId,
      status: "submitted",
      warning: "UNVERIFIED CANDIDATE ZONE - REQUIRES HUMAN AVIATION REVIEW",
      conceptualVectorWarning: "conceptual origin-to-delivery-area line — not an approved flight route",
      candidateZoneId,
      message: "AeroRelief structured mission request registered. Awaiting qualified aviation officer evaluation.",
      request: requestRecord
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: "AIRLIFT_REQUEST_ERROR",
      message: err.message
    });
  }
});

// 17. GET /api/rescuegrid/airlift-request — Query registered airlift requests
sentinelRouter.get("/api/rescuegrid/airlift-request", (_req, res) => {
  seedAeroReliefBaselines();
  res.json({
    ok: true,
    total: airliftRequests.size,
    requests: Array.from(airliftRequests.values()),
    status: "ACTIVE",
    warning: "NON-OPERATIONAL DEMO FIXTURE — REQUIRES QUALIFIED AVIATION REVIEW"
  });
});

// Valid AeroRelief mission statuses and permitted lifecycle state transitions (PRD 6.2 Step 7 & 8)
const VALID_AERORELIEF_STATUSES = [
  "draft",
  "submitted",
  "accepted",
  "declined",
  "dispatched",
  "delivered",
  "failed",
  "cancelled"
];

const VALID_LIFECYCLE_TRANSITIONS = {
  draft: ["submitted", "cancelled"],
  submitted: ["accepted", "declined", "cancelled"],
  accepted: ["dispatched", "cancelled"],
  declined: ["submitted", "cancelled"],
  dispatched: ["delivered", "failed", "cancelled"],
  delivered: [], // Terminal delivered state: non-refundable without physical certified return
  failed: [], // Terminal failed state
  cancelled: [] // Terminal cancelled state
};

/**
 * Resolves required inventory kit deductions based on request data.
 * Adheres strictly to:
 * - Deducing from explicit requestedSupplies / parsed kit quantities if provided.
 * - Falling back safely to baseline allocation (Kit A: 50, Kit B: 20) if free-text only.
 * - Never fabricating an arbitrary multiplier between patientCount and kit counts.
 */
function resolveAeroReliefKitDeductions(requestItem, inventory) {
  const deductions = {};
  let hasExplicitMapping = false;
  let unresolvedMapping = null;

  // 1. Structured requestedSupplies array from intake schema
  if (Array.isArray(requestItem.requestedSupplies) && requestItem.requestedSupplies.length > 0) {
    for (const entry of requestItem.requestedSupplies) {
      const id = String(entry.itemId || entry.kit || entry.name || "").trim().toLowerCase();
      const qty = Number(entry.quantity || entry.qty || 0);
      if (qty > 0) {
        const matchKey = Object.keys(inventory).find((k) =>
          k.toLowerCase().includes(id) || id.includes(k.toLowerCase().slice(0, 5))
        );
        if (matchKey) {
          deductions[matchKey] = (deductions[matchKey] || 0) + qty;
          hasExplicitMapping = true;
        }
      }
    }
  }

  // 2. Parse explicit kit quantities from supplies text, e.g. "Kit A... (150 Packs)"
  if (!hasExplicitMapping && typeof requestItem.supplies === "string") {
    const text = requestItem.supplies;
    for (const k of Object.keys(inventory)) {
      const shortPrefix = k.split(":")[0].trim(); // e.g. "Kit A"
      const regex = new RegExp(`${shortPrefix}[^,(]*\\((\\d+)\\s*(?:Packs?|Kits?|Vials?|Units?)?\\)`, "i");
      const m = text.match(regex);
      if (m && m[1]) {
        const parsed = parseInt(m[1], 10);
        if (parsed > 0) {
          deductions[k] = parsed;
          hasExplicitMapping = true;
        }
      }
    }
  }

  // 3. Fallback: preserve existing safe baseline allocation and document unresolved mapping
  if (!hasExplicitMapping || Object.keys(deductions).length === 0) {
    deductions["Kit A: Hydration & Cholera"] = 50;
    deductions["Kit B: Trauma & Wound Care"] = 20;
    unresolvedMapping = "Free-text supply description lacks structured kit quantities. Applied baseline emergency reserve deduction (Kit A: 50 Packs, Kit B: 20 Kits). Patient-to-kit conversion is not inferred.";
  }

  return { deductions, hasExplicitMapping, unresolvedMapping };
}

// 18. POST /api/rescuegrid/airlift-request/update-status — Human Mission Lifecycle State Transition (PRD 6.2 Step 7 & 8)
sentinelRouter.post("/api/rescuegrid/airlift-request/update-status", (req, res) => {
  try {
    const { requestId, status, reviewOwner, notes } = req.body || {};
    if (!requestId || !airliftRequests.has(requestId)) {
      return res.status(404).json({ ok: false, error: "REQUEST_NOT_FOUND", message: `Airlift request ${requestId} not found.` });
    }

    if (!status) {
      return res.status(400).json({ ok: false, error: "MISSING_STATUS", message: "Field 'status' is required." });
    }

    const targetStatus = String(status).toLowerCase().trim();
    if (!VALID_AERORELIEF_STATUSES.includes(targetStatus)) {
      return res.status(400).json({
        ok: false,
        error: "INVALID_STATUS",
        message: `Status '${status}' is not recognized. Permitted statuses: ${VALID_AERORELIEF_STATUSES.join(", ")}.`
      });
    }

    const item = airliftRequests.get(requestId);
    const currentStatus = item.status || "submitted";

    // 1. Idempotent Repeat Handling: same status update must NOT deduct stock again
    if (targetStatus === currentStatus) {
      if (reviewOwner) item.reviewOwner = reviewOwner;
      if (notes) item.notes = `${item.notes ? item.notes + " | " : ""}${notes}`;
      item.reviewTime = new Date().toISOString();

      return res.json({
        ok: true,
        message: `Mission ${requestId} is already in status '${targetStatus}'. Idempotent request confirmed: zero inventory mutated.`,
        request: item,
        inventoryDeducted: null,
        repeatUpdate: true
      });
    }

    // 2. Strict State Transition Validation
    const permittedNext = VALID_LIFECYCLE_TRANSITIONS[currentStatus] || [];
    if (!permittedNext.includes(targetStatus)) {
      return res.status(400).json({
        ok: false,
        error: "INVALID_STATE_TRANSITION",
        message: `Illegal state transition from '${currentStatus}' to '${targetStatus}'. Permitted transitions: ${permittedNext.length ? permittedNext.join(", ") : "none (terminal state)"}.`,
        currentStatus,
        attemptedStatus: targetStatus,
        permittedTransitions: permittedNext
      });
    }

    // 3. Atomicity & Inventory Bounds Validation (only runs on transition to 'delivered')
    let deductionsToApply = null;
    let unresolvedMappingDoc = null;

    if (targetStatus === "delivered") {
      const inv = rescueGridState?.inventory || {};
      const { deductions, unresolvedMapping } = resolveAeroReliefKitDeductions(item, inv);
      unresolvedMappingDoc = unresolvedMapping;

      // Validate bounds for ALL requested deductions BEFORE mutating any stock
      for (const [kitName, requiredQty] of Object.entries(deductions)) {
        const stockItem = inv[kitName];
        if (!stockItem) {
          return res.status(400).json({
            ok: false,
            error: "UNKNOWN_INVENTORY_ITEM",
            message: `Inventory item '${kitName}' does not exist in central depot stock. Operation aborted atomically.`
          });
        }
        if (stockItem.available < requiredQty) {
          return res.status(409).json({
            ok: false,
            error: "INSUFFICIENT_INVENTORY",
            message: `Insufficient stock for '${kitName}': required ${requiredQty} ${stockItem.unit || "Units"}, but only ${stockItem.available} available. Operation aborted atomically without partial deduction.`,
            shortage: {
              item: kitName,
              available: stockItem.available,
              required: requiredQty,
              shortageAmount: requiredQty - stockItem.available,
              unit: stockItem.unit
            }
          });
        }
      }

      deductionsToApply = deductions;
    }

    // 4. Atomic Execution: Apply Mutations ONLY after complete validation passes
    const inventoryAdjustments = {};
    if (deductionsToApply && rescueGridState?.inventory) {
      for (const [kitName, qty] of Object.entries(deductionsToApply)) {
        rescueGridState.inventory[kitName].available -= qty;
        inventoryAdjustments[kitName] = {
          deducted: qty,
          remaining: rescueGridState.inventory[kitName].available,
          unit: rescueGridState.inventory[kitName].unit
        };
      }
    }

    const previousStatus = currentStatus;
    item.status = targetStatus;
    if (reviewOwner) item.reviewOwner = reviewOwner;
    item.reviewTime = new Date().toISOString();
    if (notes) item.notes = `${item.notes ? item.notes + " | " : ""}${notes}`;

    if (targetStatus === "delivered") {
      item.deliveredAt = new Date().toISOString();
      item.inventoryDeducted = inventoryAdjustments;
      if (unresolvedMappingDoc) {
        item.unresolvedMapping = unresolvedMappingDoc;
      }
    }

    const logDetails = targetStatus === "delivered"
      ? `AeroRelief mission ${requestId} transitioned from '${previousStatus.toUpperCase()}' to 'DELIVERED' by ${item.reviewOwner || "Authorized Reviewer"}. Inventory deducted: ${Object.entries(inventoryAdjustments).map(([k, v]) => `${k} (-${v.deducted} ${v.unit})`).join(", ")}.`
      : `AeroRelief mission ${requestId} transitioned from '${previousStatus.toUpperCase()}' to '${targetStatus.toUpperCase()}' by ${item.reviewOwner || "Authorized Reviewer"}. Zero inventory deducted.`;

    item.auditLogEntry = logDetails;

    // 5. Audit Trail Recording
    if (rescueGridState && Array.isArray(rescueGridState.auditLog)) {
      rescueGridState.auditLog.push({
        timestamp: new Date().toISOString(),
        action: `AERORELIEF_MISSION_${targetStatus.toUpperCase()}`,
        version: rescueGridState.scenarioVersion,
        requestId,
        previousStatus,
        newStatus: targetStatus,
        inventoryAdjustments: Object.keys(inventoryAdjustments).length > 0 ? inventoryAdjustments : null,
        unresolvedMapping: unresolvedMappingDoc || null,
        details: logDetails
      });
    }

    return res.json({
      ok: true,
      message: `Mission state successfully updated from ${previousStatus} to ${targetStatus}.`,
      request: item,
      inventoryAdjustments: Object.keys(inventoryAdjustments).length > 0 ? inventoryAdjustments : null,
      unresolvedMapping: unresolvedMappingDoc || null
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: "UPDATE_STATUS_ERROR",
      message: err.message
    });
  }
});



