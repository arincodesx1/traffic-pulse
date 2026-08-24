import { Activity } from "lucide-react";
import type { CongestionLevel } from "@/types/traffic";

interface CongestionCardProps {
  level: CongestionLevel | undefined;
  dataSource: string | undefined;
  roadCount: number;
}

const LEVEL_TEXT_CLASS: Record<CongestionLevel, string> = {
  LOW: "text-congestion-low",
  MEDIUM: "text-congestion-medium",
  HIGH: "text-congestion-high",
  SEVERE: "text-congestion-severe",
};

const LEVEL_CHIP_CLASS: Record<CongestionLevel, string> = {
  LOW: "bg-congestion-low",
  MEDIUM: "bg-congestion-medium",
  HIGH: "bg-congestion-high",
  SEVERE: "bg-congestion-severe",
};

export function CongestionCard({ level, dataSource, roadCount }: CongestionCardProps) {
  return (
    <section aria-label="Overall congestion" className="rounded-xl border border-border bg-secondary/40 p-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          <Activity className="h-3.5 w-3.5" />
          Overall Traffic
        </div>
        {level && (
          <span className={`h-2 w-2 rounded-full ${LEVEL_CHIP_CLASS[level]}`} />
        )}
      </div>

      <p
        className={`mt-1.5 font-display text-3xl font-bold tracking-tight ${
          level ? LEVEL_TEXT_CLASS[level] : "text-muted-foreground"
        }`}
      >
        {level ?? "—"}
      </p>

      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          Data source:{" "}
          <span className="font-mono font-semibold text-foreground/80">
            {dataSource ? dataSource.toUpperCase() : "—"}
          </span>
        </span>
        <span className="font-mono">{roadCount} roads</span>
      </div>
    </section>
  );
}
