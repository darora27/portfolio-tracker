import { DataTable, DataTableHead, DataTableBody, DataTableRow, Th, Td } from "@/components/ui/DataTable";
import { formatNumber, formatPercent } from "@/lib/format";
import type { HoldingRisk } from "@/lib/portfolio/per-holding-risk";

/** Volatility and beta vs VOO for each holding individually — the portfolio-level Risk section only shows these blended. */
export function HoldingRiskTable({ risks }: { risks: HoldingRisk[] }) {
  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Risk by holding</h2>
      <div className="mt-3">
        <DataTable minWidth="360px">
          <DataTableHead>
            <Th sticky>Ticker</Th>
            <Th numeric>Volatility (ann.)</Th>
            <Th numeric>Beta vs VOO</Th>
          </DataTableHead>
          <DataTableBody>
            {risks.map((r) => (
              <DataTableRow key={r.ticker}>
                <Td sticky>{r.ticker}</Td>
                <Td numeric>
                  {r.volatilityPct !== null ? (
                    formatPercent(r.volatilityPct, 1)
                  ) : (
                    <span className="text-text-muted">—</span>
                  )}
                </Td>
                <Td numeric>
                  {r.betaVsVoo !== null ? (
                    formatNumber(r.betaVsVoo)
                  ) : (
                    <span className="text-text-muted">—</span>
                  )}
                </Td>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </div>
    </section>
  );
}
