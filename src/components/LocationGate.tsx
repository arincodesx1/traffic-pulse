import { Loader2, MapPinOff, MapPin, Radar } from "lucide-react";
import type { GeolocationStatus } from "@/hooks/useGeolocation";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--secondary)_0%,transparent_65%)] opacity-60" />
      <div className="glass-panel relative flex w-full max-w-md flex-col items-center rounded-2xl px-8 py-10 text-center animate-fade-in-up">
        {children}
      </div>
    </div>
  );
}

export function LocationLoading() {
  return (
    <Shell>
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-primary">
        <Radar className="h-7 w-7 animate-pulse" />
      </span>
      <h1 className="mt-5 font-display text-xl font-bold tracking-tight text-foreground">
        TrafficAI
      </h1>
      <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Detecting your location…
      </p>
      <p className="mt-1 text-xs text-muted-foreground/70">
        Please allow location access when your browser asks.
      </p>
    </Shell>
  );
}

interface LocationErrorProps {
  status: Exclude<GeolocationStatus, "requesting" | "granted">;
  onRetry: () => void;
}

export function LocationError({ status, onRetry }: LocationErrorProps) {
  const denied = status === "denied";

  return (
    <Shell>
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-congestion-severe/15 text-congestion-severe">
        {denied ? (
          <MapPinOff className="h-7 w-7" />
        ) : (
          <MapPin className="h-7 w-7" />
        )}
      </span>
      <h1 className="mt-5 font-display text-xl font-bold tracking-tight text-foreground">
        {denied
          ? "Location permission needed"
          : status === "unsupported"
            ? "Geolocation not supported"
            : "Location unavailable"}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {denied
          ? "Location permission is required to analyze traffic around you. Enable it in your browser settings, then retry."
          : status === "unsupported"
            ? "Your browser does not support the HTML5 Geolocation API, which is required to analyze traffic around you."
            : "We couldn't determine your position. Check that location services are turned on, then retry."}
      </p>
      {status !== "unsupported" && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Retry location access
        </button>
      )}
    </Shell>
  );
}

export function AnalyzingOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[1005] grid place-items-center">
      <div className="glass-panel flex items-center gap-3 rounded-2xl px-6 py-4 animate-fade-in-up">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-sm font-semibold text-foreground">
          Analyzing traffic around you…
        </span>
      </div>
    </div>
  );
}

export function OfflineBanner() {
  return (
    <div
      role="alert"
      className="glass-panel absolute top-3 left-1/2 z-[1010] flex -translate-x-1/2 items-center gap-2 rounded-full border-congestion-severe/40 px-4 py-2 text-xs font-semibold text-congestion-severe animate-fade-in-up"
    >
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-congestion-severe" />
      Unable to connect to traffic analysis service. Retrying…
    </div>
  );
}
