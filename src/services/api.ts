import type { TrafficAnalysisResponse } from "@/types/traffic";

/**
 * The backend is an existing FastAPI service owned by a teammate.
 * Always call it directly at this absolute URL — never proxy or mock it.
 */
const API_URL = "http://localhost:8000/api/v1/dashboard/analyze";

const DEFAULT_RADIUS_KM = 5;

export async function analyzeTraffic(
  latitude: number,
  longitude: number,
): Promise<TrafficAnalysisResponse> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      latitude,
      longitude,
      radius_km: DEFAULT_RADIUS_KM,
    }),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return (await response.json()) as TrafficAnalysisResponse;
}
