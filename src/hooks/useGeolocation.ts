import { useCallback, useEffect, useState } from "react";
import type { Coordinates } from "@/types/traffic";

export type GeolocationStatus =
  | "requesting"
  | "granted"
  | "denied"
  | "unavailable"
  | "unsupported";

export function useGeolocation() {
  const [status, setStatus] = useState<GeolocationStatus>("requesting");
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setStatus("unsupported");
      return;
    }

    let cancelled = false;
    setStatus("requesting");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) return;
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setStatus("granted");
      },
      (error) => {
        if (cancelled) return;
        setStatus(
          error.code === error.PERMISSION_DENIED ? "denied" : "unavailable",
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 },
    );

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  return { status, coords, retry };
}
