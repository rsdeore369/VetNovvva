// SENTINEL Hospital Allocation & Ambulance Staging Engine (Phase 3 Modules B & C)
// PRD Alignment: Section 6 (Data Tier Rules), Section 8.3 (Resource Allocation & Staging)

import { haversineDistanceKm } from "./sentinel-routing.js";

/**
 * Deterministic Emergency Hospital Allocation
 *
 * Allocates patients from disaster incidents to candidate hospital facilities
 * based on urgency tier, proximity/route feasibility, and available bed capacity.
 *
 * @param {Array} incidents - List of incident records { incidentId, category, urgency, peopleAffected, location }
 * @param {Array} hospitals - List of hospital features from infrastructure GeoJSON
 * @param {Object} options - Allocation options (e.g., routingGraph)
 */
export function allocateHospitalResources(incidents, hospitals, options = {}) {
  if (!Array.isArray(incidents) || !Array.isArray(hospitals)) {
    throw new Error("INVALID_INPUT: 'incidents' and 'hospitals' must be valid arrays.");
  }

  // Deep clone hospital capacity state so allocation is deterministic and non-destructive
  const hospitalState = new Map();
  for (const h of hospitals) {
    const props = h.properties || {};
    const id = props.id || h.id;
    if (!id) continue;

    const totalBeds = Number(props.bed_capacity_total) || 0;
    const availableBeds = typeof props.bed_capacity_available === "number"
      ? props.bed_capacity_available
      : totalBeds;
    const availableIcu = Number(props.icu_capacity_available) || 0;

    hospitalState.set(id, {
      id,
      name: props.name || "Hospital Facility",
      traumaTier: props.trauma_tier || "Secondary Facility",
      coordinates: h.geometry?.coordinates || [0, 0],
      totalBeds,
      initialAvailableBeds: availableBeds,
      remainingBeds: availableBeds,
      initialAvailableIcu: availableIcu,
      remainingIcu: availableIcu,
      allocatedCases: []
    });
  }

  // Sort incidents by emergency priority: critical > high > moderate > low > unknown
  const URGENCY_PRIORITY = { critical: 1, high: 2, moderate: 3, low: 4, unknown: 5 };

  const sortedIncidents = [...incidents].sort((a, b) => {
    const pA = URGENCY_PRIORITY[String(a.urgency).toLowerCase()] || 5;
    const pB = URGENCY_PRIORITY[String(b.urgency).toLowerCase()] || 5;
    if (pA !== pB) return pA - pB;
    // Tie-breaker: larger demand first, then incidentId
    const demandA = Number(a.peopleAffected) || 1;
    const demandB = Number(b.peopleAffected) || 1;
    if (demandA !== demandB) return demandB - demandA;
    return String(a.incidentId || "").localeCompare(String(b.incidentId || ""));
  });

  const assignments = [];
  const unassigned = [];

  let totalDemandRequested = 0;
  let totalDemandAssigned = 0;

  for (const inc of sortedIncidents) {
    const incId = inc.incidentId || "UNKNOWN-INCIDENT";
    const demand = Math.max(1, Number(inc.peopleAffected) || 1);
    totalDemandRequested += demand;

    const incCoords = inc.location?.coordinates;
    if (!Array.isArray(incCoords) || incCoords.length !== 2) {
      unassigned.push({
        incidentId: incId,
        unassignedDemand: demand,
        reason: "INVALID_COORDINATES: Incident missing valid GeoJSON Point coordinates."
      });
      continue;
    }

    // Rank available hospitals by proximity / travel feasibility
    const candidateRankings = [];
    for (const hosp of hospitalState.values()) {
      const distanceKm = Number(haversineDistanceKm(incCoords, hosp.coordinates).toFixed(2));
      candidateRankings.push({
        hospital: hosp,
        distanceKm
      });
    }

    // Sort closest first
    candidateRankings.sort((a, b) => a.distanceKm - b.distanceKm);

    let remainingIncidentDemand = demand;
    const incidentAllocations = [];

    for (const { hospital, distanceKm } of candidateRankings) {
      if (remainingIncidentDemand <= 0) break;
      if (hospital.remainingBeds <= 0) continue;

      const assignCount = Math.min(remainingIncidentDemand, hospital.remainingBeds);
      hospital.remainingBeds -= assignCount;
      remainingIncidentDemand -= assignCount;

      hospital.allocatedCases.push({
        incidentId: incId,
        patientsCount: assignCount,
        urgency: inc.urgency,
        distanceKm
      });

      incidentAllocations.push({
        hospitalId: hospital.id,
        hospitalName: hospital.name,
        traumaTier: hospital.traumaTier,
        patientsAssigned: assignCount,
        distanceKm,
        remainingHospitalBeds: hospital.remainingBeds
      });
    }

    const assignedCountForInc = demand - remainingIncidentDemand;
    totalDemandAssigned += assignedCountForInc;

    if (incidentAllocations.length > 0) {
      assignments.push({
        incidentId: incId,
        category: inc.category,
        urgency: inc.urgency,
        requestedDemand: demand,
        allocatedDemand: assignedCountForInc,
        allocations: incidentAllocations,
        fullySatisfied: remainingIncidentDemand === 0
      });
    }

    if (remainingIncidentDemand > 0) {
      unassigned.push({
        incidentId: incId,
        category: inc.category,
        urgency: inc.urgency,
        requestedDemand: demand,
        unassignedDemand: remainingIncidentDemand,
        reason: assignedCountForInc === 0
          ? "INSUFFICIENT_BED_CAPACITY: All candidate hospitals in range have 0 available beds."
          : "PARTIAL_CAPACITY_EXHAUSTED: Candidate hospitals reached maximum surge capacity before fulfilling total demand."
      });
    }
  }

  // Facility summary table
  const facilityUtilization = Array.from(hospitalState.values()).map((h) => ({
    hospitalId: h.id,
    name: h.name,
    traumaTier: h.traumaTier,
    totalBeds: h.totalBeds,
    initialAvailableBeds: h.initialAvailableBeds,
    remainingBeds: h.remainingBeds,
    occupiedByAllocation: h.initialAvailableBeds - h.remainingBeds,
    utilizationPercent:
      h.initialAvailableBeds > 0
        ? Math.round(((h.initialAvailableBeds - h.remainingBeds) / h.initialAvailableBeds) * 100)
        : 100
  }));

  const totalUnassignedDemand = totalDemandRequested - totalDemandAssigned;

  return {
    success: true,
    data_mode: "simulated",
    data_mode_label: "SIMULATED — FOR DEMONSTRATION ONLY",
    summary: {
      totalIncidentsProcessed: sortedIncidents.length,
      totalDemandRequested,
      totalDemandAssigned,
      totalUnassignedDemand,
      fulfillmentRatePercent:
        totalDemandRequested > 0 ? Math.round((totalDemandAssigned / totalDemandRequested) * 100) : 100
    },
    facilityUtilization,
    assignments,
    unassigned,
    disclaimer:
      "All hospital capacities and patient allocations are synthetic demonstrations for Fusion 2026. Do NOT use for real-life clinical dispatch or assume live bed telemetry.",
    explanation: generateAllocationExplanation(
      totalDemandRequested,
      totalDemandAssigned,
      totalUnassignedDemand,
      facilityUtilization
    )
  };
}

function generateAllocationExplanation(requested, assigned, unassigned, facilities) {
  const facilityBreakdown = facilities
    .map((f) => `${f.name}: ${f.occupiedByAllocation} beds allocated (${f.remainingBeds} remaining)`)
    .join("; ");

  if (unassigned === 0) {
    return `Deterministic capacity allocation successfully assigned all ${assigned}/${requested} simulated casualty demands across available facilities. Breakdown: ${facilityBreakdown}.`;
  }

  return `SURGE ALERT: ${assigned} of ${requested} patients assigned. ${unassigned} patient demands remain UNASSIGNED due to saturated regional hospital bed capacities. Regional facility state: ${facilityBreakdown}. Recommend secondary field triage or external regional medical transfer.`;
}

/**
 * Module C: Candidate Ambulance Staging Location Generator
 *
 * Evaluates spatial clustering of active disaster incidents and available emergency infrastructure
 * to suggest strategic ambulance forward-staging hubs with zero AI dependencies.
 */
export function recommendAmbulanceStaging(incidents, infrastructure, roadsGraph) {
  const validIncidents = (incidents || []).filter(
    (i) => i.location?.coordinates && Array.isArray(i.location.coordinates)
  );

  const candidateStagingSites = [];
  let centroid = [73.8567, 18.5204]; // Default Pune corridor center
  let totalCasualties = 0;

  if (validIncidents.length > 0) {
    let sumLng = 0;
    let sumLat = 0;

    for (const inc of validIncidents) {
      const [lng, lat] = inc.location.coordinates;
      const count = Number(inc.peopleAffected) || 1;
      sumLng += lng * count;
      sumLat += lat * count;
      totalCasualties += count;
    }

    const centroidLng = Number((sumLng / totalCasualties).toFixed(5));
    const centroidLat = Number((sumLat / totalCasualties).toFixed(5));
    centroid = [centroidLng, centroidLat];

    candidateStagingSites.push({
      stagingId: "STAGE-CENTROID-01",
      name: "Deccan-Shivajinagar Forward Tactical Staging Post",
      coordinates: centroid,
      siteType: "demand_weighted_centroid",
      rationale: `Weighted centroid of ${validIncidents.length} active casualty reports (${totalCasualties} total casualties). Minimizes average transit time to reported emergency clusters.`,
      assignedIncidentsCount: validIncidents.length,
      estimatedCoverageRadiusKm: 4.5,
      recommendedAmbulanceUnits: Math.max(2, Math.ceil(totalCasualties / 3)),
      data_mode: "simulated"
    });
  }

  // Secondary Staging: Supply Depot / Hospital Staging if available
  const depots = (infrastructure?.features || []).filter(
    (f) => f.properties?.resource_type === "supply_depot"
  );

  for (const depot of depots) {
    candidateStagingSites.push({
      stagingId: `STAGE-${depot.id || "DEPOT"}`,
      name: `${depot.properties.name || "Logistics Depot"} Logistics Staging Bay`,
      coordinates: depot.geometry.coordinates,
      siteType: "logistics_depot_co-located",
      rationale: "Co-located with State Disaster Response Force medical supply inventory. Ensures rapid resupply of trauma dressings and IV fluids between transport runs.",
      assignedIncidentsCount: validIncidents.length,
      estimatedCoverageRadiusKm: 6.0,
      recommendedAmbulanceUnits: 3,
      data_mode: "simulated"
    });
  }

  return {
    success: true,
    data_mode: "simulated",
    data_mode_label: "SIMULATED — FOR DEMONSTRATION ONLY",
    activeIncidentsEvaluated: validIncidents.length,
    totalCasualtiesEvaluated: totalCasualties,
    demandCentroid: centroid,
    candidateStagingSites,
    disclaimer:
      "Candidate staging locations are simulated recommendations based on static geographic centroid and supply depot locations. Not operationally sanctioned for real-world deployment."
  };
}
