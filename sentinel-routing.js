// SENTINEL Deterministic Road Network Routing Engine (Phase 3 Module A)
// PRD Alignment: Section 6 (Data Tier Rules), Section 7 (Road-State Taxonomy), Section 8.3

/**
 * Calculates Haversine distance between two coordinates in kilometers.
 */
export function haversineDistanceKm(coordA, coordB) {
  const [lng1, lat1] = coordA;
  const [lng2, lat2] = coordB;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Road State Deterministic Cost & Policy Rules
 */
export const ROAD_STATE_RULES = {
  VERIFIED_CLOSED: {
    traversable: false,
    riskPenaltyKm: Infinity,
    warning: "CRITICAL: Road segment is confirmed closed by field authority. Excluded from routing."
  },
  REPORTED_CLOSED: {
    traversable: true,
    riskPenaltyKm: 15.0, // High penalty: route around unless no alternative
    warning: "CAUTION: Unverified closure report pending field inspection. Traversing under cautious emergency policy."
  },
  FLOOD_EXPOSED: {
    traversable: true,
    riskPenaltyKm: 8.0, // Moderate penalty: hazard exposure signal
    warning: "ADVISORY: Geospatial intersection with inundation hazard polygon. High risk of water on road."
  },
  UNCERTAIN: {
    traversable: true,
    riskPenaltyKm: 10.0, // High penalty for conflicting/stale evidence
    warning: "ADVISORY: Stale or conflicting evidence recorded. Ground conditions remain unverified."
  },
  NO_KNOWN_HAZARD: {
    traversable: true,
    riskPenaltyKm: 0.0,
    warning: "NOTICE: No hazard recorded in current baseline. Critical: NO_KNOWN_HAZARD does NOT mean verified safe."
  },
  VERIFIED_OPEN: {
    traversable: true,
    riskPenaltyKm: 0.0,
    warning: "VERIFIED: Confirmed passable by law enforcement / emergency patrol within observation window."
  }
};

/**
 * Builds an adjacency graph from a GeoJSON FeatureCollection of LineStrings.
 * Snaps endpoints within junctionToleranceKm to ensure topological connectivity.
 */
export function buildRoadGraph(roadsFeatureCollection, options = {}) {
  const junctionToleranceKm = options.junctionToleranceKm || 0.35; // 350 meters default
  const allowReportedClosed = options.allowReportedClosed !== undefined ? options.allowReportedClosed : true;

  const nodes = new Map(); // nodeId -> { id, coordinates: [lng, lat] }
  const edges = []; // { id, fromNode, toNode, roadId, name, state, distanceKm, cost, coordinates, properties }

  let nextNodeId = 1;

  function getOrCreateNode(coord) {
    for (const node of nodes.values()) {
      if (haversineDistanceKm(node.coordinates, coord) <= junctionToleranceKm) {
        return node.id;
      }
    }
    const id = `NODE-${nextNodeId++}`;
    nodes.set(id, { id, coordinates: [Number(coord[0].toFixed(5)), Number(coord[1].toFixed(5))] });
    return id;
  }

  const features = roadsFeatureCollection.features || [];

  for (const feat of features) {
    if (!feat.geometry || feat.geometry.type !== "LineString") continue;
    const coords = feat.geometry.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) continue;

    const props = feat.properties || {};
    const state = props.state || "UNCERTAIN";
    const rule = ROAD_STATE_RULES[state] || ROAD_STATE_RULES.UNCERTAIN;

    // 1. Exclude VERIFIED_CLOSED edges strictly
    if (!rule.traversable) continue;

    // 2. Exclude REPORTED_CLOSED if strict policy active
    if (state === "REPORTED_CLOSED" && !allowReportedClosed) continue;

    // Calculate total geometric length along line vertices
    let distKm = 0;
    for (let i = 0; i < coords.length - 1; i++) {
      distKm += haversineDistanceKm(coords[i], coords[i + 1]);
    }

    const startNodeId = getOrCreateNode(coords[0]);
    const endNodeId = getOrCreateNode(coords[coords.length - 1]);

    const totalCost = Number((distKm + rule.riskPenaltyKm).toFixed(3));

    const edgeData = {
      edgeId: `${props.road_id || feat.id || "EDGE"}-FWD`,
      roadId: props.road_id || feat.id,
      name: props.name || "Road Segment",
      fromNode: startNodeId,
      toNode: endNodeId,
      state,
      distanceKm: Number(distKm.toFixed(3)),
      riskPenaltyKm: rule.riskPenaltyKm,
      cost: totalCost,
      warning: rule.warning,
      coordinates: coords,
      properties: props
    };

    edges.push(edgeData);

    // Bi-directional ground roads for emergency transit
    edges.push({
      ...edgeData,
      edgeId: `${props.road_id || feat.id || "EDGE"}-REV`,
      fromNode: endNodeId,
      toNode: startNodeId,
      coordinates: [...coords].reverse()
    });
  }

  // Construct adjacency list
  const adjacency = new Map();
  for (const node of nodes.values()) {
    adjacency.set(node.id, []);
  }
  for (const edge of edges) {
    if (adjacency.has(edge.fromNode)) {
      adjacency.get(edge.fromNode).push(edge);
    }
  }

  return { nodes, edges, adjacency, junctionToleranceKm };
}

/**
 * Finds closest graph node to a query [lng, lat] coordinate.
 */
export function findNearestNode(graph, queryCoord, maxDistanceKm = 10.0) {
  let closest = null;
  let minDistance = Infinity;

  for (const node of graph.nodes.values()) {
    const dist = haversineDistanceKm(node.coordinates, queryCoord);
    if (dist < minDistance && dist <= maxDistanceKm) {
      minDistance = dist;
      closest = { node, distanceKm: Number(dist.toFixed(3)) };
    }
  }

  return closest;
}

/**
 * Deterministic Dijkstra Shortest Path Search
 */
export function findShortestPath(graph, startNodeId, targetNodeId) {
  if (!graph.nodes.has(startNodeId) || !graph.nodes.has(targetNodeId)) {
    return {
      success: false,
      error: "NODE_NOT_FOUND",
      message: "Start or destination node does not exist in graph."
    };
  }

  if (startNodeId === targetNodeId) {
    return {
      success: true,
      totalCost: 0,
      totalDistanceKm: 0,
      totalPenaltyKm: 0,
      estimatedTravelTimeMin: 0,
      edgesTraversed: [],
      coordinates: [graph.nodes.get(startNodeId).coordinates],
      warnings: ["Origin and destination match identical topological node."],
      roadStates: []
    };
  }

  const distances = new Map(); // nodeId -> number
  const previous = new Map(); // nodeId -> { edge, fromNode }
  const unvisited = new Set(graph.nodes.keys());

  for (const nodeId of graph.nodes.keys()) {
    distances.set(nodeId, Infinity);
  }
  distances.set(startNodeId, 0);

  while (unvisited.size > 0) {
    // Deterministic selection: pick unvisited node with lowest distance
    let currentNodeId = null;
    let lowestDistance = Infinity;

    for (const nodeId of unvisited) {
      const dist = distances.get(nodeId);
      if (dist < lowestDistance) {
        lowestDistance = dist;
        currentNodeId = nodeId;
      }
    }

    if (currentNodeId === null || lowestDistance === Infinity) {
      break; // Remaining nodes are unreachable
    }

    if (currentNodeId === targetNodeId) {
      break; // Reached destination
    }

    unvisited.delete(currentNodeId);

    const neighbors = graph.adjacency.get(currentNodeId) || [];
    for (const edge of neighbors) {
      if (!unvisited.has(edge.toNode)) continue;

      const altDistance = distances.get(currentNodeId) + edge.cost;
      if (altDistance < distances.get(edge.toNode)) {
        distances.set(edge.toNode, altDistance);
        previous.set(edge.toNode, { edge, fromNode: currentNodeId });
      }
    }
  }

  if (distances.get(targetNodeId) === Infinity) {
    return {
      success: false,
      error: "NO_FEASIBLE_ROUTE",
      message: "No traversable ground route exists connecting origin to destination. Confirmed closures or network disconnection isolate the route."
    };
  }

  // Reconstruct path
  const pathEdges = [];
  let curr = targetNodeId;
  while (previous.has(curr)) {
    const { edge, fromNode } = previous.get(curr);
    pathEdges.unshift(edge);
    curr = fromNode;
  }

  // Aggregate metrics
  let totalDistanceKm = 0;
  let totalPenaltyKm = 0;
  let totalCost = 0;
  const pathCoords = [];
  const roadStatesSet = new Set();
  const warnings = [];

  for (let i = 0; i < pathEdges.length; i++) {
    const e = pathEdges[i];
    totalDistanceKm += e.distanceKm;
    totalPenaltyKm += e.riskPenaltyKm;
    totalCost += e.cost;
    roadStatesSet.add(e.state);

    if (e.warning && !warnings.includes(e.warning)) {
      warnings.push(e.warning);
    }

    if (i === 0) {
      pathCoords.push(...e.coordinates);
    } else {
      pathCoords.push(...e.coordinates.slice(1));
    }
  }

  // Estimated emergency ground travel time (assumed average 35 km/h in monsoonal urban terrain)
  const estimatedSpeedKmh = 35;
  const travelTimeMin = Math.round((totalDistanceKm / estimatedSpeedKmh) * 60);

  return {
    success: true,
    startNodeId,
    targetNodeId,
    totalCost: Number(totalCost.toFixed(2)),
    totalDistanceKm: Number(totalDistanceKm.toFixed(2)),
    totalPenaltyKm: Number(totalPenaltyKm.toFixed(2)),
    estimatedTravelTimeMin: travelTimeMin,
    roadStates: Array.from(roadStatesSet),
    edgesTraversed: pathEdges.map((e) => ({
      edgeId: e.edgeId,
      roadId: e.roadId,
      name: e.name,
      state: e.state,
      distanceKm: e.distanceKm,
      riskPenaltyKm: e.riskPenaltyKm,
      cost: e.cost,
      assessed_at: e.properties.assessed_at,
      source_name: e.properties.source_name
    })),
    coordinates: pathCoords,
    warnings,
    explanation: generateRouteExplanation(pathEdges, totalDistanceKm, totalPenaltyKm, travelTimeMin)
  };
}

/**
 * Deterministic human-readable route explanation template
 */
function generateRouteExplanation(edges, distanceKm, penaltyKm, travelTimeMin) {
  const roadNames = edges.map((e) => `${e.name} (${e.state})`).join(" -> ");
  const penaltyNote =
    penaltyKm > 0
      ? ` Route includes ${penaltyKm.toFixed(1)} km equivalent in risk penalties due to hazard exposure or uncertainty.`
      : " Route utilizes only verified open or clear corridors with zero risk penalties.";

  return `Deterministic ground route calculated over ${distanceKm.toFixed(2)} km (~${travelTimeMin} mins travel time at 35 km/h base emergency speed). Corridors traversed: ${roadNames}.${penaltyNote} All verified closures strictly avoided.`;
}
