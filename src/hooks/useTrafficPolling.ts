import { useEffect, useRef, useState } from "react";
import { analyzeTraffic } from "@/services/api";
import type { Coordinates, TrafficAnalysisResponse } from "@/types/traffic";

export type BackendStatus = "idle" | "connecting" | "online" | "offline";

const POLL_INTERVAL_MS = 5000;

/**
 * Fires an immediate analysis request as soon as coordinates arrive, then
 * polls the FastAPI backend every 5 seconds. Exactly one interval exists at a
 * time and it is cleared on unmount. Overlapping requests are prevented with
 * an in-flight guard. Failures never clear previously rendered data.
 */
export function useTrafficPolling(coords: Coordinates | null) {
  const [data, setData] = useState<TrafficAnalysisResponse | null>(null);
  const [status, setStatus] = useState<BackendStatus>("idle");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const inFlight = useRef(false);

  const latitude = coords?.latitude;
  const longitude = coords?.longitude;

  useEffect(() => {
    if (latitude == null || longitude == null) return;

    let cancelled = false;

    const tick = async (initial: boolean) => {
      if (inFlight.current) return;
      inFlight.current = true;
      if (initial) {
        setStatus("connecting");
      } else {
        setIsRefreshing(true);
      }

      try {
        const result = await analyzeTraffic(latitude, longitude);
        if (cancelled) return;
        setData(result);
        setStatus("online");
        setLastUpdated(new Date());
      } catch {
        if (cancelled) return;
        setStatus("offline");
      } finally {
        inFlight.current = false;
        if (!cancelled) setIsRefreshing(false);
      }
    };

    // First request fires immediately, then the 5s cadence starts.
    void tick(true);
    const intervalId = setInterval(() => void tick(false), POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [latitude, longitude]);

  return { data, status, lastUpdated, isRefreshing };
}
