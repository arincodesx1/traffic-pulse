import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  CONGESTION_HEX,
  type CongestionLevel,
  type Coordinates,
  type EmergencyEvent,
  type Road,
  type TrafficAnalysisResponse,
} from "@/types/traffic";

/**
 * Leaflet is browser-only (touches `window` at import time), so this module is
 * loaded via React.lazy behind a mounted check in the index route — it is
 * never evaluated during SSR.
 */

interface TrafficMapProps {
  center: Coordinates;
  data: TrafficAnalysisResponse | null;
}

/** Halo radius (meters) per congestion level — worse congestion, bigger signal. */
const ROAD_HALO_RADIUS: Record<CongestionLevel, number> = {
  LOW: 110,
  MEDIUM: 150,
  HIGH: 200,
  SEVERE: 250,
};

const AMBULANCE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M10 10H6"/><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.578-.502l-1.539-3.076A1 1 0 0 0 16.382 8H14"/><path d="M8 8v4"/><path d="M9 18h6"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>`;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function congestionHex(level: string): string {
  return CONGESTION_HEX[level as CongestionLevel] ?? CONGESTION_HEX.MEDIUM;
}

/**
 * Renders one road. The backend currently returns a single coordinate per
 * road, so we draw a congestion-colored halo circle with a solid core marker.
 * When the backend starts returning road geometry, replace the body with:
 *
 *   L.polyline(road.geometry, { color, weight: 6, opacity: 0.9 })
 *
 * and keep the popup wiring unchanged.
 */
function renderRoad(group: L.LayerGroup, road: Road) {
  const color = congestionHex(road.congestion_level);
  const latlng: L.LatLngExpression = [road.latitude, road.longitude];

  const halo = L.circle(latlng, {
    radius:
      ROAD_HALO_RADIUS[road.congestion_level as CongestionLevel] ??
      ROAD_HALO_RADIUS.MEDIUM,
    color,
    weight: 2,
    opacity: 0.9,
    fillColor: color,
    fillOpacity: 0.28,
  });

  const core = L.circleMarker(latlng, {
    radius: 6,
    color: "#0B1120",
    weight: 2,
    fillColor: color,
    fillOpacity: 1,
  });

  const popupHtml = `
    <div class="map-popup-title">${escapeHtml(road.road_id.toUpperCase())}</div>
    <div class="map-popup-row">
      <span class="map-popup-dot" style="background:${color}"></span>
      <span style="color:${color};font-weight:700">${escapeHtml(road.congestion_level)} CONGESTION</span>
    </div>
    <div class="map-popup-row">Lat ${road.latitude.toFixed(5)} · Lng ${road.longitude.toFixed(5)}</div>
  `;

  halo.bindPopup(popupHtml);
  core.bindPopup(popupHtml);
  group.addLayer(halo);
  group.addLayer(core);
}

function renderEmergency(group: L.LayerGroup, event: EmergencyEvent) {
  const icon = L.divIcon({
    className: "emergency-div-icon",
    html: `
      <div class="emergency-marker">
        <span class="emergency-ring"></span>
        <span class="emergency-ring emergency-ring-delay"></span>
        <span class="emergency-core">${AMBULANCE_SVG}</span>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -24],
  });

  const marker = L.marker([event.latitude, event.longitude], {
    icon,
    zIndexOffset: 1000,
  });

  marker.bindPopup(`
    <div class="map-popup-title">🚑 ${escapeHtml(event.vehicle_type.toUpperCase())}</div>
    <div class="map-popup-row">
      <span class="map-popup-dot" style="background:${CONGESTION_HEX.SEVERE}"></span>
      <span style="color:${CONGESTION_HEX.SEVERE};font-weight:700">EMERGENCY ACTIVE</span>
    </div>
    <div class="map-popup-row">Lat ${event.latitude.toFixed(5)} · Lng ${event.longitude.toFixed(5)}</div>
  `);

  group.addLayer(marker);
}

function buildUserMarker(coords: Coordinates): L.Marker {
  const icon = L.divIcon({
    className: "user-div-icon",
    html: `
      <div class="user-marker">
        <span class="user-ping-ring"></span>
        <span class="user-core"></span>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });

  const marker = L.marker([coords.latitude, coords.longitude], { icon });
  marker.bindPopup(`
    <div class="map-popup-title" style="color:${"#38BDF8"}">YOUR LOCATION</div>
    <div class="map-popup-row">Latitude: ${coords.latitude.toFixed(5)}</div>
    <div class="map-popup-row">Longitude: ${coords.longitude.toFixed(5)}</div>
  `);
  return marker;
}

export default function TrafficMap({ center, data }: TrafficMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const trafficLayerRef = useRef<L.LayerGroup | null>(null);
  const emergencyLayerRef = useRef<L.LayerGroup | null>(null);
  const userLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize the map exactly once — the same instance is reused for every
  // 5-second update; only the layer groups are cleared and re-rendered.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [center.latitude, center.longitude],
      zoom: 14,
      zoomControl: true,
      worldCopyJump: true,
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
    }).addTo(map);

    trafficLayerRef.current = L.layerGroup().addTo(map);
    emergencyLayerRef.current = L.layerGroup().addTo(map);
    userLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      trafficLayerRef.current = null;
      emergencyLayerRef.current = null;
      userLayerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // User location marker — updated if coordinates ever change.
  useEffect(() => {
    const group = userLayerRef.current;
    if (!group) return;
    group.clearLayers();
    group.addLayer(buildUserMarker(center));
  }, [center]);

  // Traffic roads + emergency events. Old layers are fully cleared before the
  // latest response renders, so markers never accumulate across polls.
  useEffect(() => {
    const trafficLayer = trafficLayerRef.current;
    const emergencyLayer = emergencyLayerRef.current;
    if (!trafficLayer || !emergencyLayer || !data) return;

    trafficLayer.clearLayers();
    for (const road of data.traffic?.roads ?? []) {
      renderRoad(trafficLayer, road);
    }

    emergencyLayer.clearLayers();
    if (data.emergency?.active) {
      for (const event of data.emergency.events ?? []) {
        renderEmergency(emergencyLayer, event);
      }
    }
  }, [data]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 h-full w-full"
      aria-label="Live traffic map"
    />
  );
}
