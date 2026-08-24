import { useState } from "react";
import {
  ChevronDown,
  Navigation,
  Siren,
  Sparkles,
  Timer,
} from "lucide-react";
import type { BackendStatus } from "@/hooks/useTrafficPolling";
import type { TrafficAnalysisResponse } from "@/types/traffic";
import { CongestionCard } from "@/components/CongestionCard";

interface DashboardPanelProps {
  data: TrafficAnalysisResponse | null;
  backendStatus: BackendStatus;
}

/** Compass rotation for the priority-direction arrow. */
const DIRECTION_DEGREES: Record<string, number> = {
  NORTH: 0,
  NORTHEAST: 45,
  EAST: 90,
  SOUTHEAST: 135,
  SOUTH: 180,
  SOUTHWEST: 225,
  WEST: 270,
  NORTHWEST: 315,
};

export function DashboardPanel({ data, backendStatus }: DashboardPanelProps) {
  // Collapsible on mobile (bottom sheet); always expanded on desktop.
  const [collapsed, setCollapsed] = useState(false);

  const rec = data?.recommendations;
  const emergency = data?.emergency;
  const direction = rec?.priority_direction?.toUpperCase();
  const degrees = direction ? (DIRECTION_DEGREES[direction] ?? 0) : 0;
  const waiting = !data && backendStatus !== "offline";

  return (
    <aside
      aria-label="AI traffic recommendation panel"
      className="absolute inset-x-3 bottom-3 z-[1010] animate-fade-in-up lg:inset-x-auto lg:top-4 lg:right-4 lg:bottom-4 lg:w-[380px]"
    >
      <div className="glass-panel flex max-h-full flex-col overflow-hidden rounded-2xl">
        {/* Panel header — tap target for the mobile bottom sheet */}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left lg:cursor-default"
          aria-expanded={!collapsed}
        >
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/15 text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-display text-sm font-bold tracking-tight text-foreground">
              AI Traffic Recommendation
            </span>
          </div>
          <div className="flex items-center gap-2">
            {emergency?.active && (
              <span className="flex items-center gap-1 rounded-full border border-congestion-severe/40 bg-congestion-severe/15 px-2 py-0.5 text-[10px] font-bold tracking-wider text-congestion-severe">
                <Siren className="h-3 w-3" />
                OVERRIDE
              </span>
            )}
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform duration-300 lg:hidden ${
                collapsed ? "" : "rotate-180"
              }`}
            />
          </div>
        </button>

        {/* Body — collapses on mobile only */}
        <div
          className={`panel-scroll flex flex-col gap-3 overflow-y-auto px-4 transition-all duration-300 lg:pb-4 ${
            collapsed
              ? "max-h-0 pb-0 opacity-0 lg:max-h-none lg:opacity-100"
              : "max-h-[46vh] pb-4 opacity-100 lg:max-h-[calc(100%-3.25rem)]"
          }`}
        >
          <CongestionCard
            level={data?.traffic?.overall_congestion}
            dataSource={data?.traffic?.data_source}
            roadCount={data?.traffic?.roads?.length ?? 0}
          />

          {/* Priority direction */}
          <section
            aria-label="Priority direction"
            className="rounded-xl border border-primary/25 bg-primary/8 p-3.5"
          >
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Priority Direction
            </div>
            <div className="mt-1 flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-primary/30 bg-primary/15 text-primary">
                <Navigation
                  className="h-5 w-5 transition-transform duration-500"
                  style={{ transform: `rotate(${degrees}deg)` }}
                />
              </span>
              <span className="text-glow font-display text-4xl font-bold tracking-tight text-primary">
                {direction ?? (waiting ? "…" : "—")}
              </span>
            </div>
          </section>

          {/* Green duration */}
          <section
            aria-label="Recommended green duration"
            className="flex items-center justify-between rounded-xl border border-border bg-secondary/40 p-3.5"
          >
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <Timer className="h-3.5 w-3.5" />
                Green Duration
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="font-display text-4xl font-bold tracking-tight text-congestion-low">
                  {rec ? rec.recommended_green_duration_seconds : waiting ? "…" : "—"}
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  seconds
                </span>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-congestion-low/40">
              <div className="h-5 w-5 rounded-full bg-congestion-low shadow-[0_0_16px_var(--congestion-low)]" />
            </div>
          </section>

          {/* AI decision reason */}
          <section
            aria-label="AI decision reason"
            className="rounded-xl border border-border bg-secondary/40 p-3.5"
          >
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              AI Decision Reason
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">
              {rec?.reason ??
                (waiting
                  ? "Analyzing live conditions around you…"
                  : "Waiting for the analysis service to respond.")}
            </p>
          </section>

          {/* Emergency status */}
          <section
            aria-label="Emergency status"
            className={`rounded-xl border p-3.5 ${
              emergency?.active
                ? "border-congestion-severe/40 bg-congestion-severe/10"
                : "border-border bg-secondary/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                  emergency?.active
                    ? "text-congestion-severe"
                    : "text-muted-foreground"
                }`}
              >
                <Siren className="h-3.5 w-3.5" />
                Emergency Status
              </div>
              {emergency?.active && (
                <span className="animate-live-dot h-2 w-2 rounded-full bg-congestion-severe" />
              )}
            </div>
            <p
              className={`mt-1.5 text-sm font-semibold ${
                emergency?.active
                  ? "text-congestion-severe"
                  : "text-foreground/80"
              }`}
            >
              {emergency?.active
                ? `${emergency.events.length} emergency vehicle${
                    emergency.events.length === 1 ? "" : "s"
                  } active — signal override in effect`
                : data
                  ? "No active emergencies"
                  : "—"}
            </p>
          </section>
        </div>
      </div>
    </aside>
  );
}
