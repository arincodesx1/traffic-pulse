import { Siren } from "lucide-react";

const ITEMS = [
  { label: "Low", dotClass: "bg-congestion-low" },
  { label: "Medium", dotClass: "bg-congestion-medium" },
  { label: "High", dotClass: "bg-congestion-high" },
  { label: "Severe", dotClass: "bg-congestion-severe" },
];

export function MapLegend() {
  return (
    <div
      aria-label="Map legend"
      className="glass-panel absolute bottom-3 left-3 z-[1010] hidden rounded-xl px-3.5 py-3 sm:block lg:bottom-4 lg:left-4"
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        Congestion
      </div>
      <ul className="mt-2 space-y-1.5">
        {ITEMS.map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-xs text-foreground/85">
            <span className={`h-2.5 w-2.5 rounded-full ${item.dotClass}`} />
            {item.label}
          </li>
        ))}
        <li className="flex items-center gap-2 text-xs text-foreground/85">
          <Siren className="h-3 w-3 text-congestion-severe" />
          Emergency
        </li>
      </ul>
    </div>
  );
}
