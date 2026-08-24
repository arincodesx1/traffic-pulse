import { Loader2, Radar, Wifi, WifiOff } from "lucide-react";
import type { BackendStatus } from "@/hooks/useTrafficPolling";

interface StatusHeaderProps {
  backendStatus: BackendStatus;
  isRefreshing: boolean;
}

export function StatusHeader({ backendStatus, isRefreshing }: StatusHeaderProps) {
  const online = backendStatus === "online";
  const offline = backendStatus === "offline";

  return (
    <header className="relative z-[1010] flex h-14 shrink-0 items-center justify-between border-b border-border glass-strong px-4 sm:px-5">
      <div className="flex items-center gap-3">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary">
          <Radar className="h-4.5 w-4.5" />
        </div>
        <div className="leading-tight">
          <h1 className="font-display text-base font-bold tracking-tight text-foreground">
            TrafficAI
          </h1>
          <p className="hidden text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground sm:block">
            Signal Intelligence
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {isRefreshing && online && (
          <span className="hidden items-center gap-1.5 text-xs font-medium text-muted-foreground sm:flex">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Updating…
          </span>
        )}

        {online && (
          <span className="flex items-center gap-1.5 rounded-full border border-congestion-low/30 bg-congestion-low/10 px-2.5 py-1 text-[11px] font-bold tracking-widest text-congestion-low">
            <span className="animate-live-dot h-1.5 w-1.5 rounded-full bg-congestion-low" />
            LIVE
          </span>
        )}

        <span
          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
            online
              ? "border-congestion-low/30 bg-congestion-low/10 text-congestion-low"
              : offline
                ? "border-congestion-severe/40 bg-congestion-severe/10 text-congestion-severe"
                : "border-congestion-medium/30 bg-congestion-medium/10 text-congestion-medium"
          }`}
        >
          {online ? (
            <Wifi className="h-3.5 w-3.5" />
          ) : offline ? (
            <WifiOff className="h-3.5 w-3.5" />
          ) : (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          )}
          <span className="hidden sm:inline">
            {online
              ? "Backend Connected"
              : offline
                ? "Backend Offline"
                : "Connecting…"}
          </span>
          <span className="sm:hidden">
            {online ? "Online" : offline ? "Offline" : "…"}
          </span>
        </span>
      </div>
    </header>
  );
}
