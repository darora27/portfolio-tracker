import type { Position } from "@/lib/portfolio/holdings";
import { Card } from "@/components/ui/Card";
import { DeltaChip } from "@/components/ui/DeltaChip";

function List({
  title,
  positions,
}: {
  title: string;
  positions: (Position & { gainPct: number })[];
}) {
  return (
    <Card>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{title}</h3>
      {positions.length === 0 ? (
        <p className="mt-2 text-sm text-text-muted">Not enough priced positions yet.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {positions.map((p) => (
            <li key={p.ticker} className="flex items-center justify-between text-sm">
              <span className="font-medium text-text-primary">{p.ticker}</span>
              <DeltaChip value={p.gainPct} percent />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export function WinnersLosers({
  winners,
  losers,
}: {
  winners: (Position & { gainPct: number })[];
  losers: (Position & { gainPct: number })[];
}) {
  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
        Winners &amp; losers
      </h2>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <List title="Top winners" positions={winners} />
        <List title="Top losers" positions={losers} />
      </div>
    </section>
  );
}
