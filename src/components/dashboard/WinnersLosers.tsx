import type { Position } from "@/lib/portfolio/holdings";
import { formatSignedCurrency, formatSignedPercent } from "@/lib/format";
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

export type Mover = { ticker: string; day: number; dayPct: number };

function MoversList({ movers, hideDollars }: { movers: Mover[]; hideDollars: boolean }) {
  return (
    <Card>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
        Today&rsquo;s movers
      </h3>
      {movers.length === 0 ? (
        <p className="mt-2 text-sm text-text-muted">No live price moves yet today.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {movers.map((m) =>
            hideDollars ? (
              <li key={m.ticker} className="flex items-center justify-between text-sm">
                <span className="font-medium text-text-primary">{m.ticker}</span>
                <DeltaChip value={m.dayPct} percent decimals={2} />
              </li>
            ) : (
              <li key={m.ticker} className="flex items-center justify-between text-sm">
                <span className="font-medium text-text-primary">{m.ticker}</span>
                <span className={`font-mono text-xs ${m.day >= 0 ? "text-gain" : "text-loss"}`}>
                  {formatSignedCurrency(m.day)} ({formatSignedPercent(m.dayPct, 2)})
                </span>
              </li>
            ),
          )}
        </ul>
      )}
    </Card>
  );
}

export function WinnersLosers({
  winners,
  losers,
  movers,
  hideDollars = false,
}: {
  winners: (Position & { gainPct: number })[];
  losers: (Position & { gainPct: number })[];
  movers: Mover[];
  hideDollars?: boolean;
}) {
  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
        Winners &amp; losers
      </h2>
      <p className="mt-1 text-xs text-text-muted">
        Winners/losers are since-purchase; today&rsquo;s movers are today only.
      </p>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <List title="Top winners" positions={winners} />
        <List title="Top losers" positions={losers} />
        <MoversList movers={movers} hideDollars={hideDollars} />
      </div>
    </section>
  );
}
