/**
 * Types matching the FastAPI backend response for
 * POST http://localhost:8000/api/v1/dashboard/analyze
 */

export type CongestionLevel = "LOW" | "MEDIUM" | "HIGH" | "SEVERE";

export interface Road {
  road_id: string;
  latitude: number;
  longitude: number;
  congestion_level: CongestionLevel;
}

export interface EmergencyEvent {
  vehicle_type: string;
  latitude: number;
  longitude: number;
}

export interface Recommendations {
  priority_direction: string;
  recommended_green_duration_seconds: number;
  reason: string;
}

export interface TrafficAnalysisResponse {
  success: boolean;
  location: {
    latitude: number;
    longitude: number;
  };
  traffic: {
    data_source: string;
    overall_congestion: CongestionLevel;
    roads: Road[];
  };
  emergency: {
    active: boolean;
    events: EmergencyEvent[];
  };
  recommendations: Recommendations;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Hex mirrors of the CSS congestion tokens. Leaflet styles SVG/canvas layers
 * with attribute values, so it needs concrete colors rather than Tailwind
 * classes. Keep in sync with --congestion-* in src/styles.css.
 */
export const CONGESTION_HEX: Record<CongestionLevel, string> = {
  LOW: "#22C55E",
  MEDIUM: "#EAB308",
  HIGH: "#F97316",
  SEVERE: "#EF4444",
};

export const CONGESTION_LABEL: Record<CongestionLevel, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  SEVERE: "Severe",
};
