"use client";

import { useRouter } from "next/navigation";
import type { Position } from "@/lib/portfolio/holdings";
import { formatCurrency, formatSignedCurrency, formatSignedPercent } from "@/lib/format";
import { DataTable, DataTableHead, DataTableBody, DataTableRow, Th, Td } from "@/components/ui/DataTable";
import { Sparkline } from "@/components/ui/Sparkline";

export type PositionRow = Position & {
  contribution: number | null;
  day: number | null;
  dayPct: number | null;
  isNewToday: boolean;
  sparkline: number[];
};

function DayCell({
  day,
  dayPct,
  hideDollars,
}: {
  day: number | null;
  dayPct: number | null;
  hideDollars: boolean;
}) {
  if (day === null || dayPct === null) {
    return <span className="text-text-muted">—</span>;
  }
  return (
    <span className={day >= 0 ? "text-gain" : "text-loss"}>
      {hideDollars ? formatSignedPercent(dayPct, 2) : formatSignedCurrency(day)}
    </span>
  );
}

export function PositionsTable({
  positions,
  hideDollars = false,
  linkRows = true,
}: {
  positions: PositionRow[];
  hideDollars?: boolean;
  linkRows?: boolean;
}) {
  const router = useRouter();

  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Positions</h2>
      <div className="mt-3">
        <DataTable minWidth="720px">
          <DataTableHead>
            <Th sticky>Ticker</Th>
            {!hideDollars && (
              <>
                <Th numeric>Shares</Th>
                <Th numeric>Price</Th>
                <Th numeric>Value</Th>
              </>
            )}
            {!hideDollars && <Th numeric>Day $</Th>}
            <Th numeric>Day %</Th>
            <Th numeric>Weight</Th>
            {!hideDollars && <Th numeric>Cost basis</Th>}
            <Th numeric>Gain / loss</Th>
            <Th numeric>Contribution</Th>
            <Th>Trend</Th>
          </DataTableHead>
          <DataTableBody>
            {positions.map((p) => (
              <DataTableRow
                key={p.ticker}
                onClick={linkRows ? () => router.push(`/stock/${p.ticker}`) : undefined}
                className={linkRows ? "cursor-pointer" : undefined}
              >
                <Td sticky>
                  <span className="inline-flex items-center gap-1.5">
                    {p.ticker}
                    {p.isNewToday && (
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-accent"
                        title="Bought today"
                        aria-label="Bought today"
                      />
                    )}
                  </span>
                </Td>
                {!hideDollars && (
                  <>
                    <Td numeric>{p.shares}</Td>
                    <Td numeric>
                      {p.price !== null ? (
                        formatCurrency(p.price)
                      ) : (
                        <span className="text-text-muted" title="No price data yet — valued at cost">
                          at cost
                        </span>
                      )}
                    </Td>
                    <Td numeric>{formatCurrency(p.value)}</Td>
                  </>
                )}
                {!hideDollars && (
                  <Td numeric>
                    <DayCell day={p.day} dayPct={p.dayPct} hideDollars={false} />
                  </Td>
                )}
                <Td numeric>
                  <DayCell day={p.day} dayPct={p.dayPct} hideDollars />
                </Td>
                <Td numeric>{formatSignedPercent(p.weight, 1)}</Td>
                {!hideDollars && <Td numeric>{formatCurrency(p.costBasis)}</Td>}
                <Td numeric>
                  {p.gain !== null && p.gainPct !== null ? (
                    <span className={p.gain >= 0 ? "text-gain" : "text-loss"}>
                      {hideDollars
                        ? formatSignedPercent(p.gainPct, 1)
                        : `${formatSignedCurrency(p.gain)} (${formatSignedPercent(p.gainPct, 1)})`}
                    </span>
                  ) : (
                    <span className="text-text-muted">—</span>
                  )}
                </Td>
                <Td numeric>
                  {p.contribution !== null ? (
                    formatSignedPercent(p.contribution, 1)
                  ) : (
                    <span className="text-text-muted">—</span>
                  )}
                </Td>
                <Td>
                  <Sparkline points={p.sparkline} />
                </Td>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </div>
      {!hideDollars && positions.some((p) => p.price === null) && (
        <p className="mt-2 text-xs text-text-secondary">
          Positions marked &ldquo;at cost&rdquo; have no closing price yet (
          {positions
            .filter((p) => p.price === null)
            .map((p) => p.ticker)
            .join(", ")}
          ) — live prices arrive once the Finnhub snapshot job is wired up.
        </p>
      )}
    </section>
  );
}
