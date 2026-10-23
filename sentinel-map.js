// SENTINEL Command Map Component (Fusion 2026 Multi-Disaster Intelligent Decision & Optimization Engine)
// Live Multi-Hazard Optimization: Floods, Cyclones, Heatwaves
// Continuously optimizes: Emergency Vehicle Positioning, Evacuation Routes, Hospital Selection & Temporary Medical Resources

(function () {
  const { useState, useEffect, useRef } = window.React || {};

  // Road state visual styling and semantics
  const ROAD_STATE_CONFIG = {
    VERIFIED_CLOSED: {
      color: "#DC2626",
      dashArray: null,
      weight: 5,
      label: "Verified Closed",
      semantics: "Confirmed closed by physical barrier or ground unit. Passability = 0."
    },
    REPORTED_CLOSED: {
      color: "#EF4444",
      dashArray: "6, 6",
      weight: 4,
      label: "Reported Closed",
      semantics: "Public or unverified caller report. Verification pending. Held for safety."
    },
    FLOOD_EXPOSED: {
      color: "#F59E0B",
      dashArray: null,
      weight: 4,
      label: "Flood Exposed",
      semantics: "Geospatial intersection with hazard polygon. High risk signal, NOT proof of closure."
    },
    UNCERTAIN: {
      color: "#6B7280",
      dashArray: "4, 8",
      weight: 3,
      label: "Uncertain / Stale",
      semantics: "Stale observation (>2h) or conflicting reports. Evidence unresolved."
    },
    NO_KNOWN_HAZARD: {
      color: "#64748B",
      dashArray: null,
      weight: 3,
      label: "No Known Hazard",
      semantics: "No incident recorded in baseline graph. Does NOT mean verified safe."
    },
    VERIFIED_OPEN: {
      color: "#10B981",
      dashArray: null,
      weight: 4,
      label: "Verified Open",
      semantics: "Confirmed passable by highway patrol within last 60 minutes."
    }
  };

  // Multi-Disaster Hazard Forecast Definitions
  const HAZARD_FORECASTS = {
    flood: {
      name: "Monsoonal Riverine Flood",
      icon: "🌊",
      color: "#0284c7",
      fillColor: "#38bdf8",
      severity: "Severe (Level 3 Red Alert)",
      metrics: "Est. Depth: 1.8m | Water Velocity: 2.1 m/s | Discharge: 42,000 cusecs",
      advisory: "Low-lying river causeways and subways submerged. Road bypass corridors active.",
      polygon: [
        [18.502, 73.818],
        [18.525, 73.820],
        [18.542, 73.845],
        [18.528, 73.865],
        [18.495, 73.842]
      ]
    },
    cyclone: {
      name: "Severe Tropical Cyclone & Storm Surge",
      icon: "🌀",
      color: "#7c3aed",
      fillColor: "#c084fc",
      severity: "Category 3 (Gale Warning)",
      metrics: "Sustained Winds: 95 km/h | Peak Gusts: 120 km/h | Pressure: 984 hPa",
      advisory: "Downed high-tension power lines and fallen tree debris. Avoid coastal & elevated flyovers.",
      polygon: [
        [18.470, 73.775],
        [18.575, 73.785],
        [18.590, 73.895],
        [18.480, 73.880]
      ]
    },
    heatwave: {
      name: "Extreme Heatwave & Thermal Stress",
      icon: "☀️",
      color: "#ea580c",
      fillColor: "#fb923c",
      severity: "Extreme Thermal Emergency (Orange Alert)",
      metrics: "Ambient Temp: 44.5°C | Wet-Bulb: 32.2°C | Solar Radiation: 980 W/m²",
      advisory: "High risk of heat exhaustion & hyperthermia. Mobile oral rehydration kiosks deployed.",
      polygon: [
        [18.485, 73.815],
        [18.555, 73.822],
        [18.560, 73.885],
        [18.490, 73.875]
      ]
    }
  };

  function SentinelCommandMap({ onNavigateToIntake }) {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const layerGroupsRef = useRef({
      hazard: null,
      roads: null,
      infrastructure: null,
      incidents: null,
      route: null,
      aeroRelief: null,
      ambulances: null,
      tempMedical: null,
      evacCorridors: null
    });

    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [disasterType, setDisasterType] = useState("flood");
    const [continuousOptActive, setContinuousOptActive] = useState(true);
    const [optimizing, setOptimizing] = useState(false);
    const [lastOptimizedAt, setLastOptimizedAt] = useState("Active");
    const [sharedState, setSharedState] = useState(null);

    const [layerCounts, setLayerCounts] = useState({
      hazard: 1,
      roads: 0,
      infrastructure: 0,
      incidents: 0,
      ambulances: 4,
      tempMedical: 2,
      evacCorridors: 2
    });

    const [visibility, setVisibility] = useState({
      hazard: true,
      roads: true,
      infrastructure: true,
      incidents: true,
      ambulances: true,
      tempMedical: true,
      evacCorridors: true
    });

    const [tileErrorDetected, setTileErrorDetected] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [legendOpen, setLegendOpen] = useState(false);

    // Decision & Dispatch Solver State
    const [dispatchOpen, setDispatchOpen] = useState(false);
    const [selectedOrigin, setSelectedOrigin] = useState("INC-AUTO");
    const [selectedDestination, setSelectedDestination] = useState("HOSP-01");
    const [routeResult, setRouteResult] = useState(null);
    const [routeError, setRouteError] = useState("");
    const [allocationResult, setAllocationResult] = useState(null);
    const [stagingResult, setStagingResult] = useState(null);
    const [solvingRoute, setSolvingRoute] = useState(false);
    const [incidentOptions, setIncidentOptions] = useState([]);

    // Initialize Leaflet Map
    useEffect(() => {
      if (!mapContainerRef.current || !window.L) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      delete window.L.Icon.Default.prototype._getIconUrl;
      const defaultIconUrl = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNSIgaGVpZ2h0PSI0MSIgdmlld0JveD0iMCAwIDI1IDQxIj48cGF0aCBkPSJNMTEuOSAxQyUuNyAxIDEgNS43IDEgMTEuN2MwIDcuMSAxMC45IDI4LjMgMTAuOSAyOC4zczEwLjktMjEuMiAxMC45LTI4LjNjMC02LTYuMi0xMC43LTExLjktMTAuN3ptMCAxNS4zYy0yLjcgMC00LjktMi4yLTQuOS00LjlzMi4yLTQuOSA0LjktNC45IDQuOSAyLjIgNC45IDQuOS0yLjIgNC45LTQuOSA0Ljl6IiBmaWxsPSIjMzM4OGZmIi8+PC9zdmc+';
      window.L.Icon.Default.mergeOptions({
        iconRetinaUrl: defaultIconUrl,
        iconUrl: defaultIconUrl,
        shadowUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MSIgaGVpZ2h0PSI0MSI+PC9zdmc+'
      });

      const map = window.L.map(mapContainerRef.current, {
        center: [18.5204, 73.8567],
        zoom: 13,
        minZoom: 9,
        maxZoom: 18,
        attributionControl: false
      });

      window.L.control.scale({ imperial: false, metric: true, position: "bottomright" }).addTo(map);

      const attr = window.L.control.attribution({ position: "bottomright", prefix: false });
      attr.addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a> | HealthNova GIS');
      attr.addTo(map);

      // Dark disaster tile layer via CartoDB Dark Matter (public basemap, zero token exposure)
      const tileLayer = window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
        attribution: '&copy; OpenStreetMap &copy; CARTO'
      });

      tileLayer.on("tileerror", () => {
        setTileErrorDetected(true);
      });
      tileLayer.addTo(map);

      // Initialize all layer groups
      const hazardGroup = window.L.layerGroup().addTo(map);
      const roadsGroup = window.L.layerGroup().addTo(map);
      const infraGroup = window.L.layerGroup().addTo(map);
      const incidentsGroup = window.L.layerGroup().addTo(map);
      const routeGroup = window.L.layerGroup().addTo(map);
      const aeroReliefGroup = window.L.layerGroup().addTo(map);
      const ambulancesGroup = window.L.layerGroup().addTo(map);
      const tempMedicalGroup = window.L.layerGroup().addTo(map);
      const evacCorridorsGroup = window.L.layerGroup().addTo(map);

      layerGroupsRef.current = {
        hazard: hazardGroup,
        roads: roadsGroup,
        infrastructure: infraGroup,
        incidents: incidentsGroup,
        route: routeGroup,
        aeroRelief: aeroReliefGroup,
        ambulances: ambulancesGroup,
        tempMedical: tempMedicalGroup,
        evacCorridors: evacCorridorsGroup
      };

      mapInstanceRef.current = map;
      window._sentinelMapInstance = map;
      window._sentinelAeroReliefGroup = aeroReliefGroup;

      // Map Legend & Quick Controls Widget
      const customControl = window.L.control({ position: "bottomright" });
      customControl.onAdd = function () {
        const div = window.L.DomUtil.create("div", "custom-map-control");
        div.style.background = "rgba(15, 23, 42, 0.92)";
        div.style.backdropFilter = "blur(6px)";
        div.style.padding = "10px";
        div.style.borderRadius = "8px";
        div.style.color = "#f8fafc";
        div.style.fontSize = "11px";
        div.style.border = "1px solid rgba(255,255,255,0.18)";
        div.style.maxWidth = "210px";
        div.style.margin = "10px";
        div.innerHTML = `
          <strong style="display:block; margin-bottom:5px; color:#38bdf8;">DYNAMIC GIS LAYERS</strong>
          <div style="display:grid; gap:4px; margin-bottom:8px;">
            <label style="cursor:pointer; display:flex; align-items:center; gap:5px;"><input type="checkbox" id="cbHazard" checked /> 🌊 Hazard Forecast</label>
            <label style="cursor:pointer; display:flex; align-items:center; gap:5px;"><input type="checkbox" id="cbRoads" checked /> 🛣️ Road Conditions</label>
            <label style="cursor:pointer; display:flex; align-items:center; gap:5px;"><input type="checkbox" id="cbInfra" checked /> 🏥 Hospitals & Beds</label>
            <label style="cursor:pointer; display:flex; align-items:center; gap:5px;"><input type="checkbox" id="cbAmb" checked /> 🚑 108 Ambulances</label>
            <label style="cursor:pointer; display:flex; align-items:center; gap:5px;"><input type="checkbox" id="cbCamps" checked /> ⛺ Temp Medical Camps</label>
            <label style="cursor:pointer; display:flex; align-items:center; gap:5px;"><input type="checkbox" id="cbEvac" checked /> 🛣️ Evacuation Routes</label>
            <label style="cursor:pointer; display:flex; align-items:center; gap:5px;"><input type="checkbox" id="cbAero" checked /> ✈️ AeroRelief Zones</label>
          </div>
          <strong style="display:block; margin-bottom:4px; margin-top:8px; color:#38bdf8;">ROAD ACCESSIBILITY</strong>
          <div style="display:grid; gap:3px; font-size:10px;">
            <div><span style="display:inline-block; width:12px; height:4px; background:#DC2626; margin-right:4px;"></span> VERIFIED_CLOSED</div>
            <div><span style="display:inline-block; width:12px; height:4px; border-top:2px dashed #EF4444; margin-right:4px;"></span> REPORTED_CLOSED</div>
            <div><span style="display:inline-block; width:12px; height:4px; background:#F59E0B; margin-right:4px;"></span> FLOOD_EXPOSED</div>
            <div><span style="display:inline-block; width:12px; height:4px; border-top:2px dashed #6B7280; margin-right:4px;"></span> UNCERTAIN / STALE</div>
            <div><span style="display:inline-block; width:12px; height:4px; background:#10B981; margin-right:4px;"></span> VERIFIED_OPEN</div>
            <div><span style="display:inline-block; width:12px; height:4px; background:#64748B; margin-right:4px;"></span> NO KNOWN HAZARD</div>
          </div>
        `;
        window.L.DomEvent.disableClickPropagation(div);
        return div;
      };
      customControl.addTo(map);

      setTimeout(() => {
        const bind = (id, key) => {
          const el = document.getElementById(id);
          if (el) {
            el.addEventListener("change", (e) => {
              const grp = layerGroupsRef.current[key];
              if (!grp) return;
              if (e.target.checked) map.addLayer(grp);
              else map.removeLayer(grp);
            });
          }
        };
        bind("cbHazard", "hazard");
        bind("cbRoads", "roads");
        bind("cbInfra", "infrastructure");
        bind("cbAmb", "ambulances");
        bind("cbCamps", "tempMedical");
        bind("cbEvac", "evacCorridors");
        bind("cbAero", "aeroRelief");
      }, 500);

      loadAllLayers(disasterType);

      setTimeout(() => {
        if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
      }, 250);
      setTimeout(() => {
        if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
      }, 800);

      const handleResize = () => {
        if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
      };
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    }, []);

    // Continuous Optimization background poll
    useEffect(() => {
      if (!continuousOptActive) return;
      const interval = setInterval(() => {
        loadAllLayers(disasterType, false);
      }, 15000);
      return () => clearInterval(interval);
    }, [continuousOptActive, disasterType]);

    // Re-render when disaster type changes
    useEffect(() => {
      if (mapInstanceRef.current) {
        loadAllLayers(disasterType, false);
      }
    }, [disasterType]);

    // Core Layer Loader & Optimizer
    const loadAllLayers = async (currentDisaster = "flood", showSpinner = true) => {
      if (showSpinner) setLoading(true);
      setErrorMsg("");

      try {
        const [hazRes, roadRes, infraRes, incRes, gridRes] = await Promise.all([
          fetch("/api/layers/hazard").then((r) => r.json()).catch(() => ({})),
          fetch("/api/layers/roads").then((r) => r.json()).catch(() => ({})),
          fetch("/api/layers/infrastructure").then((r) => r.json()).catch(() => ({})),
          fetch("/api/layers/incidents").then((r) => r.json()).catch(() => ({})),
          fetch("/api/rescuegrid/state").then((r) => r.json()).catch(() => ({}))
        ]);

        const groups = layerGroupsRef.current;
        if (!groups.hazard) return;

        setSharedState(gridRes?.state || null);

        // Clear all layers
        groups.hazard.clearLayers();
        groups.roads.clearLayers();
        groups.infrastructure.clearLayers();
        groups.incidents.clearLayers();
        groups.ambulances.clearLayers();
        groups.tempMedical.clearLayers();
        groups.evacCorridors.clearLayers();

        const counts = {
          hazard: 1,
          roads: 0,
          infrastructure: 0,
          incidents: 0,
          ambulances: 0,
          tempMedical: 0,
          evacCorridors: 0
        };

        // 1. LIVE HAZARD FORECAST LAYER (Floods, Cyclones, Heatwaves)
        const hazardConfig = HAZARD_FORECASTS[currentDisaster] || HAZARD_FORECASTS.flood;
        const hazardPoly = window.L.polygon(hazardConfig.polygon, {
          color: hazardConfig.color,
          fillColor: hazardConfig.fillColor,
          fillOpacity: 0.35,
          weight: 2.5
        }).addTo(groups.hazard);

        hazardPoly.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; min-width: 240px;">
            <div style="font-size: 10px; font-weight: 800; color: #fff; background: ${hazardConfig.color}; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-bottom: 4px;">
              LIVE HAZARD FORECAST • ${hazardConfig.severity}
            </div>
            <div style="font-weight: 800; color: #0f172a; font-size: 13px;">${hazardConfig.icon} ${hazardConfig.name}</div>
            <div style="color: #334155; font-size: 11px; margin-top: 4px;">
              <strong>Telemetry:</strong> ${hazardConfig.metrics}<br/>
              <strong>Advisory:</strong> ${hazardConfig.advisory}
            </div>
            <div style="margin-top: 6px; font-size: 10px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 4px;">
              <em>Dynamic engine actively reroutes ambulances & evacuation around this boundary.</em>
            </div>
          </div>
        `);
        hazardPoly.on("click", () => setSelectedFeature({ type: "hazard_forecast", data: hazardConfig }));

        // 2. ROAD ACCESSIBILITY NETWORK
        if (roadRes.ok && roadRes.geojson && Array.isArray(roadRes.geojson.features)) {
          counts.roads = roadRes.geojson.features.length;
          window.L.geoJSON(roadRes.geojson, {
            style: (feature) => {
              const state = feature.properties?.state || "UNCERTAIN";
              const conf = ROAD_STATE_CONFIG[state] || ROAD_STATE_CONFIG.UNCERTAIN;
              return {
                color: conf.color,
                weight: conf.weight,
                dashArray: conf.dashArray,
                opacity: 0.95
              };
            },
            onEachFeature: (feature, layer) => {
              const p = feature.properties || {};
              const stateConf = ROAD_STATE_CONFIG[p.state] || ROAD_STATE_CONFIG.UNCERTAIN;
              const popupContent = `
                <div style="font-family: inherit; font-size: 12px; min-width: 230px;">
                  <div style="font-weight: 800; color: #0f172a; font-size: 13px;">🛣️ ${p.name || p.road_id}</div>
                  <div style="margin-top: 4px;">
                    <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 800; background: ${stateConf.color}; color: #ffffff;">
                      ${stateConf.label}
                    </span>
                  </div>
                  <div style="color: #334155; font-size: 11px; margin-top: 6px; line-height: 1.4;">
                    <strong>Evidence / Rationale:</strong> ${p.rationale || "None recorded"}<br/>
                    <strong>Routing Semantics:</strong> ${stateConf.semantics}
                  </div>
                </div>
              `;
              layer.bindPopup(popupContent);
              layer.on("click", () => setSelectedFeature({ type: "road", data: p }));
            }
          }).addTo(groups.roads);
        }

        // 3. HOSPITALS & RESOURCE CAPACITY (WITH OPTIMAL SELECTION BADGES)
        if (infraRes.ok && infraRes.geojson && Array.isArray(infraRes.geojson.features)) {
          counts.infrastructure = infraRes.geojson.features.length;
          const hospitalAllocations = gridRes?.state?.hospitalAllocations || [];
          const hospitalCapacities = gridRes?.state?.hospitalCapacities || {};

          window.L.geoJSON(infraRes.geojson, {
            pointToLayer: (feature, latlng) => {
              const p = feature.properties || {};
              const isHospital = p.resource_type === "hospital";
              const liveCap = hospitalCapacities[p.id];
              const availBeds = liveCap ? liveCap.availableBeds : p.bed_capacity_available;
              const isFull = isHospital && availBeds != null && availBeds <= 0;
              const isOptimal = hospitalAllocations.some((a) => a.hospitalId === p.id);

              const color = isHospital ? (isFull ? "#DC2626" : (isOptimal ? "#059669" : "#10B981")) : "#0284c7";
              return window.L.circleMarker(latlng, {
                radius: isOptimal ? 10 : 8,
                fillColor: color,
                color: "#ffffff",
                weight: isOptimal ? 3 : 2,
                opacity: 1,
                fillOpacity: 0.95
              });
            },
            onEachFeature: (feature, layer) => {
              const p = feature.properties || {};
              const isHospital = p.resource_type === "hospital";
              const liveCap = hospitalCapacities[p.id];
              const availBeds = liveCap ? liveCap.availableBeds : p.bed_capacity_available;
              const totalBeds = liveCap ? liveCap.totalBeds : p.bed_capacity_total;
              const icuBeds = liveCap ? liveCap.icuAvailable : p.icu_capacity_available;
              const allocs = hospitalAllocations.filter((a) => a.hospitalId === p.id);
              const totalPatientsAssigned = allocs.reduce((sum, a) => sum + (a.patientsAllocated || 0), 0);
              const isOptimal = allocs.length > 0;

              let details = "";
              if (isHospital) {
                details = `
                  <div style="color: #334155; font-size: 11px; margin-top: 4px;">
                    ${isOptimal ? '<div style="font-size:10px; font-weight:800; color:#fff; background:#059669; padding:2px 6px; border-radius:3px; margin-bottom:4px; display:inline-block;">⭐ OPTIMAL RECEIVING FACILITY (' + totalPatientsAssigned + ' Patients Assigned)</div><br/>' : ''}
                    <strong>Tier:</strong> ${p.trauma_tier || "Tertiary Emergency"}<br/>
                    <strong>Beds Available:</strong> ${availBeds != null ? availBeds : "UNKNOWN"} / ${totalBeds != null ? totalBeds : "UNKNOWN"}<br/>
                    <strong>ICU Beds:</strong> ${icuBeds != null ? icuBeds : "1"}<br/>
                    <strong>Flood Status:</strong> ${liveCap?.floodStatus || p.flood_status || "Dry"}
                  </div>
                `;
              } else {
                details = `
                  <div style="color: #334155; font-size: 11px; margin-top: 4px;">
                    <strong>Type:</strong> ${p.depot_type || "Relief Depot"}<br/>
                    <strong>Status:</strong> Active Logistics Hub
                  </div>
                `;
              }

              const popupContent = `
                <div style="font-family: inherit; font-size: 12px; min-width: 250px;">
                  <div style="font-weight: 800; color: #0f172a; font-size: 13px;">${isHospital ? "🏥" : "📦"} ${p.name || p.id}</div>
                  ${details}
                  <div style="margin-top: 6px; font-size: 10px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 4px;">
                    <em>Optimized dynamically based on shortest travel time and surge capacity.</em>
                  </div>
                </div>
              `;
              layer.bindPopup(popupContent);
              layer.on("click", () => setSelectedFeature({ type: "hospital_facility", data: p }));
            }
          }).addTo(groups.infrastructure);
        }

        // 4. EMERGENCY VEHICLE FLEET (108 AMBULANCES - DYNAMIC FORWARD POSITIONING)
        const ambulances = gridRes?.state?.ambulances || [
          { id: "MH-12-AMB-108", type: "ALS (Advanced Life Support)", status: "AVAILABLE", coords: [73.8512, 18.5312] },
          { id: "MH-12-AMB-204", type: "BLS (Basic Life Support)", status: "AVAILABLE", coords: [73.8420, 18.5140] },
          { id: "MH-12-AMB-312", type: "ALS (High-Water Amphibious)", status: "AVAILABLE", coords: [73.8150, 18.5200] },
          { id: "MH-12-AMB-405", type: "BLS (Basic Life Support)", status: "UNAVAILABLE", coords: [73.8512, 18.5312] }
        ];
        const assignments = gridRes?.state?.ambulanceAssignments || [];
        counts.ambulances = ambulances.length;

        ambulances.forEach((amb) => {
          const assignment = assignments.find((a) => a.ambulanceId === amb.id);
          const isDispatched = assignment && assignment.status === "DISPATCHED";
          const coords = amb.coords ? [amb.coords[1], amb.coords[0]] : [18.5312, 73.8512];
          const statusBg = amb.status === "UNAVAILABLE" ? "#64748B" : (isDispatched ? "#D97706" : "#059669");

          const ambIcon = window.L.divIcon({
            className: "amb-custom-icon",
            html: `
              <div style="background:${statusBg}; color:#ffffff; padding:2px 7px; border-radius:12px; font-weight:800; font-size:10px; display:flex; align-items:center; gap:3px; box-shadow:0 2px 6px rgba(0,0,0,0.5); border:1.5px solid #ffffff; white-space:nowrap; cursor:pointer;">
                <span>🚑</span>
                <span>${amb.id}</span>
                ${isDispatched ? '<span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#ef4444; margin-left:2px;"></span>' : ''}
              </div>
            `,
            iconSize: [95, 24],
            iconAnchor: [47, 12]
          });

          const ambMarker = window.L.marker(coords, { icon: ambIcon }).addTo(groups.ambulances);
          const popupHtml = `
            <div style="font-family: inherit; font-size: 12px; min-width: 240px;">
              <div style="font-size: 10px; font-weight: 800; color: #fff; background: ${statusBg}; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-bottom: 4px;">
                ${isDispatched ? "⚡ DISPATCHED EN ROUTE" : (amb.status === "AVAILABLE" ? "✓ AVAILABLE & FORWARD-STAGED" : "UNAVAILABLE (MAINTENANCE)")}
              </div>
              <div style="font-weight: 800; color: #0f172a; font-size: 13px;">🚑 ${amb.id}</div>
              <div style="color: #334155; font-size: 11px; margin-top: 4px;">
                <strong>Unit Type:</strong> ${amb.type}<br/>
                <strong>Positioning:</strong> Forward-Staged Hub (${amb.base || "District Fleet Depot"})<br/>
                ${assignment ? `
                  <div style="margin-top:4px; padding:4px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:4px;">
                    <strong>Assigned Demand:</strong> ${assignment.incidentId}<br/>
                    <strong>Route Distance:</strong> ${assignment.routeDistanceKm} km<br/>
                    <strong>ETA:</strong> ~${assignment.etaMinutes} mins<br/>
                    <strong>Detour Avoidance:</strong> ${assignment.detourRequired ? 'Active Bypass' : 'Direct Path'}
                  </div>
                ` : '<strong>Optimization:</strong> Positioned near high-demand centroid outside hazard flood contour.'}
              </div>
            </div>
          `;
          ambMarker.bindPopup(popupHtml);
        });

        // 5. TEMPORARY MEDICAL RESOURCES (STAGING CAMPS & FIELD CLINICS)
        const camps = (gridRes?.state?.stagingCamps && gridRes.state.stagingCamps.length > 0) ? gridRes.state.stagingCamps : [
          {
            campId: "CAMP-ALPHA",
            name: "Temporary Medical Camp Alpha (Deccan Gymkhana)",
            type: "Field Triage & Rapid Rehydration Camp",
            coordinates: [73.842, 18.514],
            targetCapacityBeds: 30,
            patientsRedirected: 3,
            medicalCapabilities: [
              "Cholera & Diarrhea Isolation Ward",
              "Oral Rehydration Kiosk",
              "Field Wound Irrigation & Suturing",
              "Emergency Tetanus & Anti-Venom"
            ],
            provisioningDepot: "DEPOT-01 (Shivajinagar District Medical Depot)",
            rationale: "Activated to absorb hospital overflow resulting from inundation along river causeways."
          },
          {
            campId: "CAMP-BETA",
            name: "Forward Triage & First Aid Post Beta (Kothrud Bypass)",
            type: "Rapid Stabilization & Heat Stress Station",
            coordinates: [73.805, 18.508],
            targetCapacityBeds: 20,
            patientsRedirected: 2,
            medicalCapabilities: [
              "Thermal Shock Cooling Bed",
              "Oxygen Therapy Kiosk",
              "Basic Life Support Field Triage"
            ],
            provisioningDepot: "DEPOT-01 (Shivajinagar District Medical Depot)",
            rationale: "Positioned near arterial evacuation corridor to intercept casualties before hospital admission."
          }
        ];
        counts.tempMedical = camps.length;

        camps.forEach((camp) => {
          const coords = [camp.coordinates[1], camp.coordinates[0]];
          const campIcon = window.L.divIcon({
            className: "camp-custom-icon",
            html: `
              <div style="background:#7c3aed; color:#ffffff; padding:2px 8px; border-radius:12px; font-weight:800; font-size:10px; display:flex; align-items:center; gap:4px; box-shadow:0 2px 6px rgba(0,0,0,0.5); border:1.5px solid #ffffff; white-space:nowrap; cursor:pointer;">
                <span>⛺</span>
                <span>${camp.campId}</span>
                <span style="background:#4c1d95; padding:1px 5px; border-radius:6px; font-size:9px;">${camp.targetCapacityBeds} Beds</span>
              </div>
            `,
            iconSize: [115, 24],
            iconAnchor: [57, 12]
          });

          const campMarker = window.L.marker(coords, { icon: campIcon }).addTo(groups.tempMedical);
          const capabilitiesList = Array.isArray(camp.medicalCapabilities)
            ? camp.medicalCapabilities.map((c) => `• ${c}`).join("<br/>")
            : "Standard Field Triage";

          const popupHtml = `
            <div style="font-family: inherit; font-size: 12px; min-width: 250px;">
              <div style="font-size: 10px; font-weight: 800; color: #fff; background: #7c3aed; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-bottom: 4px;">
                TEMPORARY MEDICAL RESOURCE / FIELD CLINIC
              </div>
              <div style="font-weight: 800; color: #0f172a; font-size: 13px;">⛺ ${camp.name}</div>
              <div style="color: #334155; font-size: 11px; margin-top: 4px;">
                <strong>Type:</strong> ${camp.type}<br/>
                <strong>Target Capacity:</strong> ${camp.targetCapacityBeds} Emergency Beds<br/>
                <strong>Casualties Absorbed:</strong> ${camp.patientsRedirected || 0} redirected<br/>
                <strong>Medical Capabilities:</strong><br/>
                <div style="font-size:10px; color:#475569; margin:2px 0 4px 6px;">${capabilitiesList}</div>
                <strong>Provisioning Depot:</strong> ${camp.provisioningDepot || "District Logistics Depot"}<br/>
                <em style="font-size:10px; color:#64748b;">${camp.rationale}</em>
              </div>
            </div>
          `;
          campMarker.bindPopup(popupHtml);
        });

        // 6. CONTINUOUS OPTIMAL EVACUATION CORRIDORS
        const evacCorridors = [
          {
            name: "Sinhagad -> Sassoon General Hospital Evacuation Corridor",
            coords: [[18.508, 73.830], [18.518, 73.840], [18.528, 73.860], [18.5283, 73.8744]],
            color: "#06B6D4",
            distance: "7.3 km",
            eta: "12.5 min",
            detour: "+2.1 km",
            rationale: "Northern arterial bypass route avoiding submerged causeway & closed bridges."
          },
          {
            name: "Deccan Casualty -> Temp Camp Alpha Evacuation Corridor",
            coords: [[18.515, 73.838], [18.514, 73.842]],
            color: "#10B981",
            distance: "1.2 km",
            eta: "3.2 min",
            detour: "Direct Safe Corridor",
            rationale: "Direct emergency diversion to Temporary Medical Camp Alpha to prevent hospital overload."
          }
        ];
        counts.evacCorridors = evacCorridors.length;

        evacCorridors.forEach((rt) => {
          const poly = window.L.polyline(rt.coords, {
            color: rt.color,
            weight: 5,
            opacity: 0.9,
            dashArray: "6, 6"
          }).addTo(groups.evacCorridors);

          poly.bindTooltip(`
            <strong>🛣️ ${rt.name}</strong><br/>
            Distance: ${rt.distance} | ETA: ~${rt.eta} | Detour: ${rt.detour}<br/>
            <em>${rt.rationale}</em>
          `, { sticky: true });
        });

        // 7. EMERGENCY DEMAND / INCIDENTS
        if (incRes.ok && incRes.geojson && Array.isArray(incRes.geojson.features)) {
          counts.incidents = incRes.geojson.features.length;
          setIncidentOptions(incRes.geojson.features);

          window.L.geoJSON(incRes.geojson, {
            pointToLayer: (feature, latlng) => {
              return window.L.circleMarker(latlng, {
                radius: 7,
                fillColor: "#ef4444",
                color: "#7f1d1d",
                weight: 2,
                opacity: 1,
                fillOpacity: 0.9
              });
            },
            onEachFeature: (feature, layer) => {
              const p = feature.properties || {};
              const popupContent = `
                <div style="font-family: inherit; font-size: 12px; min-width: 240px;">
                  <div style="font-size: 10px; font-weight: 800; color: #fff; background: #ef4444; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-bottom: 4px;">
                    EMERGENCY DEMAND CLUSTER
                  </div>
                  <div style="font-weight: 800; color: #0f172a; font-size: 13px;">⚠️ ${p.id || "Incident"}</div>
                  <div style="color: #334155; font-size: 11px; margin-top: 4px;">
                    <strong>Category:</strong> ${p.category || "Disaster Casualty"}<br/>
                    <strong>Urgency Tier:</strong> <span style="font-weight: 700; color: #b91c1c;">${p.urgency || "high"}</span><br/>
                    <strong>People Affected:</strong> ${p.peopleAffected || 1} patients<br/>
                    <strong>Description:</strong> ${p.requestText || "N/A"}
                  </div>
                </div>
              `;
              layer.bindPopup(popupContent);
              layer.on("click", () => setSelectedFeature({ type: "incident", data: p }));
            }
          }).addTo(groups.incidents);
        }

        // 8. AERORELIEF CANDIDATE EVACUATION & AIR-SUPPLY ZONES (PRD SECTION 6.3 & 6.4)
        if (groups.aeroRelief) {
          groups.aeroRelief.clearLayers();
          const depotCoord = [18.5312, 73.8512]; // Depot-01 Shivajinagar Logistics Base

          // Origin Helipad / Medical Depot Marker
          const depotIcon = window.L.divIcon({
            className: "aero-depot-marker",
            html: `
              <div style="background:#4338ca; color:#ffffff; padding:3px 8px; border-radius:12px; font-weight:900; font-size:10px; display:flex; align-items:center; gap:4px; box-shadow:0 3px 8px rgba(67,56,202,0.6); border:2px solid #ffffff; white-space:nowrap;">
                <span>🏬</span>
                <span>Depot-01 Air-Supply Staging Base</span>
              </div>
            `,
            iconSize: [210, 24],
            iconAnchor: [105, 12]
          });
          const depotMarker = window.L.marker(depotCoord, { icon: depotIcon }).addTo(groups.aeroRelief);
          depotMarker.bindPopup(`
            <div style="font-family: inherit; font-size: 12px; min-width: 240px;">
              <div style="font-size: 10px; font-weight: 800; color: #fff; background: #4338ca; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-bottom: 4px;">
                CENTRAL LOGISTICS STAGING BASE
              </div>
              <div style="font-weight: 900; color: #1e1b4b; font-size: 13px;">🏬 Depot-01 Shivajinagar Medical Depot</div>
              <div style="color: #334155; font-size: 11px; margin-top: 4px; line-height: 1.5;">
                <strong>Role:</strong> Staging & Air-Supply Packaging Base<br/>
                <strong>Stock:</strong> 14,500 packs Kit A • 8,200 kits Kit B<br/>
                <strong>Coordinates:</strong> 18.5312° N, 73.8512° E<br/>
                <em style="font-size: 10px; color: #64748b;">Ground road access eastward partially disrupted by river flooding.</em>
              </div>
            </div>
          `);

          // 3 Candidate Delivery Zones from PRD 6.3
          const aeroZones = [
            {
              id: "AERO-ZONE-PUNE-01",
              name: "Sangvi Riverside Sports Ground",
              coords: [18.5735, 73.8162],
              status: "Reviewed by authorized personnel",
              statusColor: "#059669",
              bounds: [
                [18.5715, 73.8142],
                [18.5755, 73.8142],
                [18.5755, 73.8182],
                [18.5715, 73.8182]
              ],
              resolution: "0.5m GSD Cartosat-3",
              source: "Prepared dataset & synthetic demo fixture",
              constraints: "Overhead 11kV line 85m south-east; saturated turf",
              reviewer: "Capt. V. Nair (SEOC Aviation Liaison)",
              missionState: "Accepted"
            },
            {
              id: "AERO-ZONE-PUNE-02",
              name: "Pulachi Wadi Elevated Concrete Deck",
              coords: [18.5165, 73.8440],
              status: "Field-observed candidate",
              statusColor: "#d97706",
              bounds: [
                [18.5150, 73.8425],
                [18.5180, 73.8425],
                [18.5180, 73.8455],
                [18.5150, 73.8455]
              ],
              resolution: "Handheld GPS Waypoint (±4.2m)",
              source: "Field report (Disaster Rapid Response Team Bravo)",
              constraints: "Tarpaulin emergency shelters within 28m; wet surface moss",
              reviewer: "Pending Qualified Aviation Officer Review",
              missionState: "Submitted"
            },
            {
              id: "AERO-ZONE-PUNE-03",
              name: "Bhide Riverbank Sandbar (Rejected)",
              coords: [18.5190, 73.8510],
              status: "Rejected",
              statusColor: "#dc2626",
              bounds: [
                [18.5180, 73.8500],
                [18.5200, 73.8500],
                [18.5200, 73.8520],
                [18.5180, 73.8520]
              ],
              resolution: "10.0m optical (Sentinel-2 L2A)",
              source: "Satellite-derived candidate (Optical flood mask)",
              constraints: "Active river surge overflow; unstable water-saturated silt sandbar",
              reviewer: "Flt. Lt. R. Kulkarni (IAF NDRF Cell)",
              missionState: "Declined"
            }
          ];

          aeroZones.forEach((zone) => {
            // Zone Area Polygon
            const poly = window.L.polygon(zone.bounds, {
              color: zone.statusColor,
              dashArray: zone.status === "Rejected" ? "2, 4" : "4, 4",
              fillColor: zone.statusColor,
              fillOpacity: zone.status === "Rejected" ? 0.15 : 0.25,
              weight: 2
            }).addTo(groups.aeroRelief);

            // Candidate Zone Icon Marker
            const zIcon = window.L.divIcon({
              className: "aero-zone-icon",
              html: `
                <div style="background:${zone.statusColor}; color:#ffffff; padding:2px 7px; border-radius:10px; font-weight:800; font-size:9px; display:flex; align-items:center; gap:4px; box-shadow:0 2px 6px rgba(0,0,0,0.4); border:1.5px solid #ffffff; white-space:nowrap; cursor:pointer;">
                  <span>${zone.status === "Rejected" ? "✕" : "🚁"}</span>
                  <span>${zone.id}</span>
                </div>
              `,
              iconSize: [120, 22],
              iconAnchor: [60, 11]
            });

            const zoneMarker = window.L.marker(zone.coords, { icon: zIcon }).addTo(groups.aeroRelief);

            const popupContent = `
              <div style="font-family: inherit; font-size: 12px; min-width: 260px;">
                <div style="font-size: 9px; font-weight: 800; color: #fff; background: ${zone.statusColor}; padding: 3px 6px; border-radius: 4px; display: inline-block; margin-bottom: 6px;">
                  ${zone.status.toUpperCase()} — REQUIRES HUMAN REVIEW
                </div>
                <div style="font-weight: 900; color: #0f172a; font-size: 13px;">${zone.id}: ${zone.name}</div>
                <div style="color: #334155; line-height: 1.5; font-size: 11px; margin-top: 4px;">
                  <strong>Source:</strong> ${zone.source}<br/>
                  <strong>Resolution:</strong> ${zone.resolution}<br/>
                  <strong>Known Constraints:</strong> <span style="color:#b91c1c;">${zone.constraints}</span><br/>
                  <strong>Review Owner:</strong> ${zone.reviewer}<br/>
                  <strong>Mission Status:</strong> <span style="font-weight:700; color:${zone.statusColor};">${zone.missionState}</span>
                </div>
                <div style="margin-top:6px; padding:4px 6px; background:#fef3c7; border-radius:4px; font-size:9px; color:#92400e;">
                  ⚠️ Candidate selection is a prioritization aid; not an operational flight go/no-go determination.
                </div>
                <button onclick="window.submitAeroReliefAirlift && window.submitAeroReliefAirlift('${zone.id}')" style="margin-top:8px; width:100%; background:#7c3aed; color:#ffffff; border:none; padding:6px 10px; border-radius:6px; font-weight:700; font-size:11px; cursor:pointer;">
                  ✈️ Request Human Aviation Review
                </button>
                <div id="airlift-feedback" style="font-size:10px; color:#6b21a8; margin-top:4px; display:none;"></div>
              </div>
            `;
            poly.bindPopup(popupContent);
            zoneMarker.bindPopup(popupContent);

            // Conceptual Origin-to-Delivery Line (only for non-rejected candidate zones)
            if (zone.status !== "Rejected") {
              const conceptualRoute = window.L.polyline([depotCoord, zone.coords], {
                color: "#8B5CF6",
                dashArray: "8, 8",
                weight: 3,
                opacity: 0.85
              }).addTo(groups.aeroRelief);

              conceptualRoute.bindTooltip(
                "CONCEPTUAL ORIGIN-TO-DELIVERY LINE — NOT AN APPROVED FLIGHT ROUTE",
                { permanent: true, opacity: 0.9, direction: "top", className: "aero-tooltip" }
              );
            }
          });
        }

        setLayerCounts(counts);
        setLoading(false);
      } catch (err) {
        setErrorMsg(`Failed to refresh operational map: ${err.message}`);
        setLoading(false);
      }
    };

    // Toggle layer group visibility
    const handleToggleLayer = (layerKey) => {
      const nextState = !visibility[layerKey];
      setVisibility((prev) => ({ ...prev, [layerKey]: nextState }));
      const grp = layerGroupsRef.current[layerKey];
      const map = mapInstanceRef.current;
      if (!grp || !map) return;
      if (nextState) map.addLayer(grp);
      else map.removeLayer(grp);
    };

    // Execute On-Demand Dynamic Optimization
    const handleTriggerOptimization = async () => {
      setOptimizing(true);
      try {
        await fetch("/api/rescuegrid/recalculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({})
        });
        await loadAllLayers(disasterType, false);
        setLastOptimizedAt(new Date().toLocaleTimeString());
      } catch (err) {
        console.warn("Optimization error:", err);
      } finally {
        setOptimizing(false);
      }
    };

    // Execute Phase 3 Deterministic Route & Triage Calculation
    const handleCalculateRouteAndTriage = async () => {
      setSolvingRoute(true);
      setRouteError("");
      setRouteResult(null);

      const routeGroup = layerGroupsRef.current.route;
      if (routeGroup) routeGroup.clearLayers();

      try {
        let originCoords = [73.830, 18.508];
        if (selectedOrigin !== "INC-AUTO") {
          const matchInc = incidentOptions.find((f) => f.id === selectedOrigin || f.properties?.id === selectedOrigin);
          if (matchInc && matchInc.geometry?.coordinates) {
            originCoords = matchInc.geometry.coordinates;
          }
        } else if (incidentOptions.length > 0) {
          originCoords = incidentOptions[0].geometry.coordinates;
        }

        const hospCoordsMap = {
          "HOSP-01": [73.8744, 18.5283],
          "HOSP-02": [73.8521, 18.4578],
          "HOSP-03": [73.8062, 18.5724],
          "DEPOT-01": [73.8512, 18.5312]
        };
        const destCoords = hospCoordsMap[selectedDestination] || [73.8744, 18.5283];

        const routeRes = await fetch("/api/routing/route", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ origin: originCoords, destination: destCoords })
        }).then((r) => r.json());

        const triageRes = await fetch("/api/allocation/triage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({})
        }).then((r) => r.json());

        const stagingRes = await fetch("/api/allocation/staging").then((r) => r.json());

        setAllocationResult(triageRes);
        setStagingResult(stagingRes);

        if (routeRes.ok && routeRes.route && routeRes.route.success) {
          setRouteResult(routeRes.route);

          if (routeGroup && Array.isArray(routeRes.route.coordinates) && routeRes.route.coordinates.length > 0) {
            const latlngs = routeRes.route.coordinates.map((c) => [c[1], c[0]]);
            const polyline = window.L.polyline(latlngs, {
              color: "#06B6D4",
              weight: 6,
              opacity: 0.95,
              lineJoin: "round"
            }).addTo(routeGroup);

            const r = routeRes.route || {};
            const tipLines = [];
            if (r.estimatedTravelTimeMin != null) tipLines.push("Calculated Travel Time: " + r.estimatedTravelTimeMin + " min");
            if (r.totalDistanceKm != null) tipLines.push("Distance: " + r.totalDistanceKm + " km");
            if (r.totalPenaltyKm != null) tipLines.push("Risk Penalties: " + r.totalPenaltyKm + " km");
            if (tipLines.length === 0) tipLines.push("Active Route (Metrics Unavailable)");

            polyline.bindTooltip(tipLines.join("<br/>"), { sticky: true, direction: "top", opacity: 0.9 });

            window.L.circleMarker(latlngs[0], { radius: 7, fillColor: "#10b981", color: "#ffffff", weight: 2 }).addTo(routeGroup).bindPopup("🚩 Route Origin");
            window.L.circleMarker(latlngs[latlngs.length - 1], { radius: 8, fillColor: "#3b82f6", color: "#ffffff", weight: 2 }).addTo(routeGroup).bindPopup("🏁 Destination Hospital");

            if (mapInstanceRef.current) {
              mapInstanceRef.current.fitBounds(polyline.getBounds(), { padding: [30, 30] });
            }
          }
        } else {
          setRouteError(routeRes.route?.message || routeRes.message || "ROUTE UNAVAILABLE: No feasible road network path found connecting selected points.");
        }

        setSolvingRoute(false);
      } catch (err) {
        setSolvingRoute(false);
        setRouteError(`Solver failed: ${err.message}`);
      }
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Dynamic Optimization Header Deck */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: 6 }}>
                <span>🗺️</span>
                <span>Intelligent Multi-Disaster Command Map</span>
                <span style={{ fontSize: 10, background: "#e0f2fe", color: "#0369a1", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>
                  LIVE OPTIMIZATION ENGINE
                </span>
              </div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                Continuous Dynamic Optimization of Vehicle Staging, Evacuation Routes, Hospitals & Temp Camps
              </div>
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={handleTriggerOptimization}
                disabled={optimizing}
                style={{
                  background: "#0284c7",
                  border: "none",
                  borderRadius: 6,
                  padding: "5px 12px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#ffffff",
                  cursor: optimizing ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4
                }}
              >
                {optimizing ? "⚡ Optimizing…" : "⚡ Run Dynamic Optimization"}
              </button>
              <button
                type="button"
                onClick={() => setContinuousOptActive(!continuousOptActive)}
                style={{
                  background: continuousOptActive ? "#f0fdf4" : "#f1f5f9",
                  border: continuousOptActive ? "1px solid #86efac" : "1px solid #cbd5e1",
                  borderRadius: 6,
                  padding: "5px 8px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: continuousOptActive ? "#15803d" : "#475569",
                  cursor: "pointer"
                }}
              >
                {continuousOptActive ? "🔄 Auto-Optimize: ON" : "⏸️ Auto-Optimize: OFF"}
              </button>
              <button
                type="button"
                onClick={() => setDispatchOpen(!dispatchOpen)}
                style={{
                  background: dispatchOpen ? "#0f172a" : "#f8fafc",
                  border: "1px solid #cbd5e1",
                  borderRadius: 6,
                  padding: "5px 9px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: dispatchOpen ? "#ffffff" : "#334155",
                  cursor: "pointer"
                }}
              >
                {dispatchOpen ? "✕ Close Solver" : "⚡ Route Solver"}
              </button>
              <button
                type="button"
                onClick={() => setLegendOpen(!legendOpen)}
                style={{
                  background: "#f8fafc",
                  border: "1px solid #cbd5e1",
                  borderRadius: 6,
                  padding: "5px 8px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#334155",
                  cursor: "pointer"
                }}
              >
                {legendOpen ? "Hide Legend" : "📖 Legend"}
              </button>
            </div>
          </div>

          {/* Live Multi-Disaster Forecast Selector */}
          <div style={{ marginTop: 10, background: "#f8fafc", padding: "8px 10px", borderRadius: 6, border: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#334155", display: "flex", alignItems: "center", gap: 6 }}>
              <span>🚨 Live Hazard Forecast Scenario:</span>
              <div style={{ display: "flex", gap: 4 }}>
                {Object.entries(HAZARD_FORECASTS).map(([key, f]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setDisasterType(key)}
                    style={{
                      background: disasterType === key ? f.color : "#ffffff",
                      color: disasterType === key ? "#ffffff" : "#334155",
                      border: disasterType === key ? "none" : "1px solid #cbd5e1",
                      borderRadius: 4,
                      padding: "3px 8px",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    {f.icon} {f.name.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ fontSize: 10, color: "#64748b" }}>
              Optimization Cycle: <strong>{lastOptimizedAt}</strong>
            </div>
          </div>

          {/* Continuous Optimization Telemetry Pill */}
          <div style={{ marginTop: 8, background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "6px 10px", borderRadius: 6, fontSize: 10, color: "#166534", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
            <div style={{ fontWeight: 700 }}>
              ⚡ CONTINUOUS OPTIMIZATION ENGINE ACTIVE
            </div>
            <div style={{ display: "flex", gap: 10, fontWeight: 600 }}>
              <span>🚑 Ambulances Staged: <strong>{layerCounts.ambulances}</strong></span>
              <span>🏥 Hospital Surge: <strong>Balanced</strong></span>
              <span>⛺ Temp Medical Camps: <strong>{layerCounts.tempMedical}</strong></span>
              <span>🛣️ Safe Evacuation Corridors: <strong>{layerCounts.evacCorridors}</strong></span>
            </div>
          </div>

          {/* Layer Filter Toggles */}
          <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8, fontSize: 11, fontWeight: 600, color: "#334155", borderTop: "1px solid #f1f5f9", paddingTop: 8 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
              <input type="checkbox" checked={visibility.hazard} onChange={() => handleToggleLayer("hazard")} />
              🌊 Hazard Forecast
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
              <input type="checkbox" checked={visibility.roads} onChange={() => handleToggleLayer("roads")} />
              🛣️ Road Network ({layerCounts.roads})
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
              <input type="checkbox" checked={visibility.infrastructure} onChange={() => handleToggleLayer("infrastructure")} />
              🏥 Hospitals & Capacity ({layerCounts.infrastructure})
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
              <input type="checkbox" checked={visibility.ambulances} onChange={() => handleToggleLayer("ambulances")} />
              🚑 108 Ambulances ({layerCounts.ambulances})
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
              <input type="checkbox" checked={visibility.tempMedical} onChange={() => handleToggleLayer("tempMedical")} />
              ⛺ Temp Medical Camps ({layerCounts.tempMedical})
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
              <input type="checkbox" checked={visibility.evacCorridors} onChange={() => handleToggleLayer("evacCorridors")} />
              🛣️ Evacuation Corridors ({layerCounts.evacCorridors})
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
              <input type="checkbox" checked={visibility.incidents} onChange={() => handleToggleLayer("incidents")} />
              ⚠️ Casualty Demand ({layerCounts.incidents})
            </label>
          </div>
        </div>

        {/* Phase 3 Interactive Dispatch & Routing Drawer */}
        {dispatchOpen && (
          <div style={{ background: "#ffffff", border: "2px solid #0284c7", borderRadius: 8, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>
                ⚡ Deterministic Emergency Dispatch & Route Solver
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#0369a1", background: "#e0f2fe", padding: "2px 6px", borderRadius: 4 }}>
                LIVE DIJKSTRA ENGINE
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#334155", display: "block", marginBottom: 3 }}>
                  Emergency Origin (Casualty Cluster):
                </label>
                <select
                  value={selectedOrigin}
                  onChange={(e) => setSelectedOrigin(e.target.value)}
                  style={{ width: "100%", padding: "6px 8px", fontSize: 12, borderRadius: 6, border: "1px solid #cbd5e1" }}
                >
                  <option value="INC-AUTO">Active Casualty Incident (Auto-Select)</option>
                  {incidentOptions.map((inc) => (
                    <option key={inc.id} value={inc.id}>
                      {inc.id} — {inc.properties?.category} ({inc.properties?.urgency})
                    </option>
                  ))}
                  <option value="SINHAGAD-DEMO">Sinhagad Road Sector [73.830, 18.508]</option>
                  <option value="DECCAN-DEMO">Deccan Underpass Sector [73.838, 18.515]</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#334155", display: "block", marginBottom: 3 }}>
                  Target Destination Facility:
                </label>
                <select
                  value={selectedDestination}
                  onChange={(e) => setSelectedDestination(e.target.value)}
                  style={{ width: "100%", padding: "6px 8px", fontSize: 12, borderRadius: 6, border: "1px solid #cbd5e1" }}
                >
                  <option value="HOSP-01">Sassoon General Hospital (Level 1 Trauma)</option>
                  <option value="HOSP-02">Bharati Hospital Emergency Polyclinic</option>
                  <option value="HOSP-03">Aundh Sub-District Civil Hospital</option>
                  <option value="DEPOT-01">Shivajinagar District Medical Depot</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCalculateRouteAndTriage}
              disabled={solvingRoute}
              style={{
                width: "100%",
                background: "#0284c7",
                color: "#ffffff",
                border: "none",
                borderRadius: 6,
                padding: "8px 12px",
                fontSize: 13,
                fontWeight: 700,
                cursor: solvingRoute ? "not-allowed" : "pointer"
              }}
            >
              {solvingRoute ? "Calculating Shortest Evacuation Path…" : "⚡ Solve Optimal Ground Evacuation Route"}
            </button>

            {routeError && (
              <div style={{ marginTop: 10, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: 10, fontSize: 11, color: "#991b1b" }}>
                <strong>Routing Infeasible:</strong> {routeError}
              </div>
            )}

            {routeResult && (
              <div style={{ marginTop: 12, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#166534" }}>
                    ✓ Evacuation Route Verified: {routeResult.totalDistanceKm} km (~{routeResult.estimatedTravelTimeMin} mins)
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#15803d" }}>
                    Risk Penalty: +{routeResult.totalPenaltyKm} km
                  </span>
                </div>
                <div style={{ marginTop: 8, fontSize: 11, color: "#334155", lineHeight: 1.4 }}>
                  <strong>Decision Explanation:</strong> {routeResult.explanation}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tile Outage Notice */}
        {tileErrorDetected && (
          <div style={{ background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 6, padding: "8px 12px", fontSize: 11, color: "#92400e" }}>
            <strong>Tactical Coordinate Grid Active:</strong> Base map tiles offline. Vector overlays (floods, cyclones, road states, hospitals, ambulances, and evacuation corridors) remain fully operational over coordinate canvas.
          </div>
        )}

        {/* Map Canvas */}
        <div style={{ position: "relative", width: "100%", height: 400, borderRadius: 8, overflow: "hidden", border: "1px solid #cbd5e1" }}>
          <div
            ref={mapContainerRef}
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#0f172a",
              backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
              backgroundSize: "30px 30px"
            }}
          />

          <div style={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 1000,
            background: "rgba(15, 23, 42, 0.85)",
            backdropFilter: "blur(4px)",
            color: "#f8fafc",
            padding: "4px 8px",
            borderRadius: 6,
            fontSize: 10,
            fontWeight: 700,
            border: "1px solid rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            gap: 5
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }}></span>
            <span>LIVE INTELLIGENT GIS ENGINE</span>
          </div>
        </div>

        {/* Detailed Legend */}
        {legendOpen && (
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px 14px", fontSize: 11 }}>
            <div style={{ fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>
              PRD Road-State Taxonomy & Tactical Visual Legend
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 6 }}>
              {Object.entries(ROAD_STATE_CONFIG).map(([key, item]) => (
                <div key={key} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "4px 6px", borderRadius: 4, background: "#f8fafc" }}>
                  <div style={{
                    width: 24,
                    height: 4,
                    marginTop: 6,
                    backgroundColor: item.color,
                    borderTop: item.dashArray ? `2px dashed ${item.color}` : "none"
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "#0f172a" }}>{item.label}</div>
                    <div style={{ fontSize: 10, color: "#475569" }}>{item.semantics}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 8, borderTop: "1px solid #f1f5f9", paddingTop: 6, fontSize: 10, color: "#64748b" }}>
              <div><strong>Blue/Purple/Orange Polygon:</strong> Dynamic Hazard Forecast Zone (Floods, Cyclones, Heatwaves)</div>
              <div><strong>Green Vehicle (🚑):</strong> 108 Emergency Ambulance Unit (Forward-staged positioning)</div>
              <div><strong>Purple Tent (⛺):</strong> Temporary Medical Resource (Field triage & rehydration camp)</div>
              <div><strong>Green/Red Pin (🏥):</strong> Emergency Hospital (Live bed capacity & optimal receiving selection)</div>
              <div><strong>Cyan Dashed Line (🛣️):</strong> Dynamic Evacuation Corridor (Dijkstra safe bypass route)</div>
              <div><strong>Red Circle (⚠️):</strong> Dynamic Casualty Demand Cluster</div>
            </div>
          </div>
        )}

        {/* Feature Inspector */}
        {selectedFeature && (
          <div style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#0f172a" }}>
                Feature Inspector: {selectedFeature.type.toUpperCase()}
              </div>
              <button
                type="button"
                onClick={() => setSelectedFeature(null)}
                style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 13, fontWeight: 700 }}
              >
                ✕
              </button>
            </div>
            <div style={{ fontSize: 11, color: "#334155", marginTop: 4 }}>
              <strong>ID / Name:</strong> {selectedFeature.data.name || selectedFeature.data.id || selectedFeature.data.road_id || "Inspected Element"}<br/>
              <strong>Data Mode:</strong> Simulated Fusion 2026 Engine<br/>
              {selectedFeature.data.metrics && (
                <div><strong>Telemetry:</strong> {selectedFeature.data.metrics}</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  window.SentinelCommandMap = SentinelCommandMap;
  window.submitAeroReliefAirlift = async function (zoneId) {
    const fb = document.getElementById("airlift-feedback");
    const btn = document.getElementById("btn-request-airlift");
    if (fb) {
      fb.style.display = "block";
      fb.style.color = "#7c3aed";
      fb.innerText = "Transmitting aviation review request…";
    }
    if (btn) btn.disabled = true;

    try {
      const res = await fetch("/api/rescuegrid/airlift-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateZoneId: zoneId || "CANDIDATE-ZONE-01",
          patientCount: 1,
          urgency: "high",
          notes: "Field review requested from Sentinel Map candidate zone popup"
        })
      });
      const data = await res.json();
      if (fb) {
        fb.style.color = "#15803d";
        fb.innerText = `Request ${data.requestId} registered. Status: ${data.status} (Warning: UNVERIFIED CANDIDATE ZONE).`;
      }
    } catch (e) {
      if (fb) {
        fb.style.color = "#b91c1c";
        fb.innerText = `Submission failed: ${e.message}`;
      }
    } finally {
      if (btn) btn.disabled = false;
    }
  };

  let _activeHeliMarker = null;
  let _activeDropMarker = null;
  let _heliAnimId = null;

  window.aeroSimulateFlight = function (targetCoords, durationMs, onProgress, onComplete) {
    if (!window.L || !window._sentinelMapInstance || !window._sentinelAeroReliefGroup) {
      console.warn("Sentinel Map or AeroRelief layer not ready for flight simulation.");
      if (onComplete) setTimeout(onComplete, durationMs || 5000);
      return;
    }
    const map = window._sentinelMapInstance;
    const group = window._sentinelAeroReliefGroup;

    window.aeroCancelFlight();

    const startCoord = [18.5312, 73.8512]; // Depot-01 Base
    const endCoord = targetCoords || [18.5735, 73.8162];
    const totalDuration = durationMs || 6000;

    const heliIcon = window.L.divIcon({
      className: "aero-live-heli-marker",
      html: `
        <div style="background:#1e1b4b; color:#ffffff; padding:4px 10px; border-radius:14px; font-weight:900; font-size:11px; display:flex; align-items:center; gap:6px; box-shadow:0 4px 14px rgba(30,27,75,0.7); border:2px solid #38bdf8; white-space:nowrap;">
          <span style="font-size:16px;">🚁</span>
          <span>AIRLIFT-101 (EN ROUTE)</span>
        </div>
      `,
      iconSize: [200, 28],
      iconAnchor: [100, 14]
    });

    _activeHeliMarker = window.L.marker(startCoord, { icon: heliIcon, zIndexOffset: 2000 }).addTo(group);
    map.panTo(startCoord);

    const startTime = performance.now();
    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / totalDuration, 1.0);

      const lat = startCoord[0] + (endCoord[0] - startCoord[0]) * progress;
      const lng = startCoord[1] + (endCoord[1] - startCoord[1]) * progress;

      if (_activeHeliMarker) {
        _activeHeliMarker.setLatLng([lat, lng]);
      }

      if (progress < 1.0) {
        if (onProgress) onProgress(progress, lat, lng);
        _heliAnimId = requestAnimationFrame(step);
      } else {
        if (onProgress) onProgress(1.0, endCoord[0], endCoord[1]);
        map.panTo(endCoord);

        // Place drop confirmation beacon
        const dropIcon = window.L.divIcon({
          className: "aero-drop-marker",
          html: `
            <div style="background:#10b981; color:#ffffff; padding:4px 10px; border-radius:14px; font-weight:900; font-size:11px; display:flex; align-items:center; gap:6px; box-shadow:0 4px 14px rgba(16,185,129,0.8); border:2px solid #ffffff; white-space:nowrap; animation:bounce 1s infinite;">
              <span style="font-size:16px;">🪂</span>
              <span>MEDICINE PARACHUTE DELIVERED</span>
            </div>
          `,
          iconSize: [230, 28],
          iconAnchor: [115, 14]
        });
        _activeDropMarker = window.L.marker(endCoord, { icon: dropIcon, zIndexOffset: 1500 }).addTo(group);

        if (onComplete) onComplete();
      }
    }
    _heliAnimId = requestAnimationFrame(step);
  };

  window.aeroCancelFlight = function () {
    if (_heliAnimId) {
      cancelAnimationFrame(_heliAnimId);
      _heliAnimId = null;
    }
    if (_activeHeliMarker && window._sentinelAeroReliefGroup) {
      try { window._sentinelAeroReliefGroup.removeLayer(_activeHeliMarker); } catch(e){}
      _activeHeliMarker = null;
    }
    if (_activeDropMarker && window._sentinelAeroReliefGroup) {
      try { window._sentinelAeroReliefGroup.removeLayer(_activeDropMarker); } catch(e){}
      _activeDropMarker = null;
    }
  };
})();
