import type { Position } from "@/lib/portfolio/holdings";
import { formatCurrency, formatSignedCurrency, formatSignedPercent } from "@/lib/format";
import { DataTable, DataTableHead, DataTableBody, DataTableRow, Th, Td } from "@/components/ui/DataTable";

export type PositionRow = Position & { contribution: number | null };

export function PositionsTable({
  positions,
  hideDollars = false,
}: {
  positions: PositionRow[];
  hideDollars?: boolean;
}) {
  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Positions</h2>
      <div className="mt-3">
        <DataTable>
          <DataTableHead>
            <Th sticky>Ticker</Th>
            {!hideDollars && (
              <>
                <Th numeric>Shares</Th>
                <Th numeric>Price</Th>
                <Th numeric>Value</Th>
              </>
            )}
            <Th numeric>Weight</Th>
            {!hideDollars && <Th numeric>Cost basis</Th>}
            <Th numeric>Gain / loss</Th>
            <Th numeric>Contribution</Th>
          </DataTableHead>
          <DataTableBody>
            {positions.map((p) => (
              <DataTableRow key={p.ticker}>
                <Td sticky>{p.ticker}</Td>
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
