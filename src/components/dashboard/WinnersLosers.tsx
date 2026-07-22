import type { Position } from "@/lib/portfolio/holdings";
import { formatSignedPercent } from "@/lib/format";

function List({
  title,
  positions,
  tone,
}: {
  title: string;
  positions: (Position & { gainPct: number })[];
  tone: "up" | "down";
}) {
  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <h3 className="text-sm font-medium text-zinc-500">{title}</h3>
      {positions.length === 0 ? (
        <p className="mt-2 text-sm text-zinc-400">Not enough priced positions yet.</p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {positions.map((p) => (
            <li key={p.ticker} className="flex items-center justify-between text-sm">
              <span className="font-medium">{p.ticker}</span>
              <span className={tone === "up" ? "text-emerald-600" : "text-red-600"}>
                {formatSignedPercent(p.gainPct, 1)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
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
      <h2 className="text-lg font-medium">Winners &amp; losers</h2>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <List title="Top winners" positions={winners} tone="up" />
        <List title="Top losers" positions={losers} tone="down" />
      </div>
    </section>
  );
}
