import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useTrafficPolling } from "@/hooks/useTrafficPolling";
import { StatusHeader } from "@/components/StatusHeader";
import { DashboardPanel } from "@/components/DashboardPanel";
import { MapLegend } from "@/components/MapLegend";
import { StatusBar } from "@/components/StatusBar";
import {
  AnalyzingOverlay,
  LocationError,
  LocationLoading,
  OfflineBanner,
} from "@/components/LocationGate";

// Leaflet is browser-only: lazy-loaded and rendered strictly after hydration.
const TrafficMap = lazy(() => import("@/components/TrafficMap"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TrafficAI — Real-Time AI Traffic Dashboard" },
      {
        name: "description",
        content:
          "Live AI-powered traffic monitoring: real-time congestion mapping, emergency vehicle tracking, and traffic-signal green-duration recommendations.",
      },
      { property: "og:title", content: "TrafficAI — Real-Time AI Traffic Dashboard" },
      {
        property: "og:description",
        content:
          "Live AI-powered traffic monitoring: real-time congestion mapping, emergency vehicle tracking, and traffic-signal green-duration recommendations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function MapFallback() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-background">
      <span className="text-sm text-muted-foreground">Loading map…</span>
    </div>
  );
}

function Index() {
  const { status: geoStatus, coords, retry } = useGeolocation();
  const {
    data,
    status: backendStatus,
    lastUpdated,
    isRefreshing,
  } = useTrafficPolling(coords);

  // Gate the Leaflet import behind hydration so SSR never evaluates it.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (geoStatus === "requesting") {
    return <LocationLoading />;
  }

  if (!coords) {
    // "granted" without coordinates can't happen, but satisfies the type.
    const errorStatus = geoStatus === "granted" ? "unavailable" : geoStatus;
    return <LocationError status={errorStatus} onRetry={retry} />;
  }

  const initialLoading = backendStatus === "connecting" && !data;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <StatusHeader backendStatus={backendStatus} isRefreshing={isRefreshing} />

      <main className="relative flex-1">
        {mounted ? (
          <Suspense fallback={<MapFallback />}>
            <TrafficMap center={coords} data={data} />
          </Suspense>
        ) : (
          <MapFallback />
        )}

        {initialLoading && <AnalyzingOverlay />}
        {backendStatus === "offline" && <OfflineBanner />}

        <MapLegend />
        <DashboardPanel data={data} backendStatus={backendStatus} />
      </main>

      <StatusBar coords={coords} lastUpdated={lastUpdated} />
    </div>
  );
}
