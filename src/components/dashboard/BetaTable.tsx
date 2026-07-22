import { DataTable, DataTableHead, DataTableBody, DataTableRow, Th, Td } from "@/components/ui/DataTable";
import { formatNumber } from "@/lib/format";
import type { BenchmarkComparison } from "@/lib/portfolio/benchmark-comparison";

export function BetaTable({ comparisons }: { comparisons: BenchmarkComparison[] }) {
  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Beta</h2>
      <div className="mt-3">
        <DataTable minWidth="280px">
          <DataTableHead>
            <Th>Benchmark</Th>
            <Th numeric>Beta</Th>
          </DataTableHead>
          <DataTableBody>
            {comparisons.map((c) => (
              <DataTableRow key={c.ticker}>
                <Td>{c.ticker}</Td>
                <Td numeric>
                  {c.beta !== null ? formatNumber(c.beta) : <span className="text-text-muted">—</span>}
                </Td>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </div>
    </section>
  );
}
