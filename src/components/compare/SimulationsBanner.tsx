import { FlaskConical } from "lucide-react";
import { SIMULATIONS_BANNER } from "@/lib/compare-copy";

/** Mandatory banner at the top of every view that renders sim data (PHASE9.md §5). */
export function SimulationsBanner() {
  return (
    <div
      role="note"
      className="flex items-start gap-2 rounded-xl border border-accent/40 px-4 py-3 text-sm text-text-secondary"
      style={{ background: "color-mix(in srgb, var(--accent) 8%, var(--surface))" }}
    >
      <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
      <p>{SIMULATIONS_BANNER}</p>
    </div>
  );
}
