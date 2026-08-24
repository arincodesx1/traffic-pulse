import type { Coordinates } from "@/types/traffic";

interface StatusBarProps {
  coords: Coordinates;
  lastUpdated: Date | null;
}

export function StatusBar({ coords, lastUpdated }: StatusBarProps) {
  return (
    <footer className="relative z-[1010] flex h-9 shrink-0 items-center gap-4 overflow-x-auto border-t border-border glass-strong px-4 font-mono text-[11px] text-muted-foreground sm:px-5">
      <span className="whitespace-nowrap">
        LAT{" "}
        <span className="text-foreground/85">{coords.latitude.toFixed(5)}</span>
      </span>
      <span className="whitespace-nowrap">
        LNG{" "}
        <span className="text-foreground/85">{coords.longitude.toFixed(5)}</span>
      </span>
      <span className="hidden whitespace-nowrap sm:inline">
        RADIUS <span className="text-foreground/85">5 KM</span>
      </span>
      <span className="hidden whitespace-nowrap md:inline">
        AUTO-REFRESH <span className="text-foreground/85">5S</span>
      </span>
      <span className="ml-auto whitespace-nowrap">
        UPDATED{" "}
        <span className="text-foreground/85">
          {lastUpdated ? lastUpdated.toLocaleTimeString() : "—"}
        </span>
      </span>
    </footer>
  );
}
