import type { Database } from "@/lib/supabase/types";
import { formatCurrency, formatDate, formatSignedCurrency } from "@/lib/format";
import { DataTable, DataTableHead, DataTableBody, DataTableRow, Th, Td } from "@/components/ui/DataTable";

type TradeRow = Database["public"]["Tables"]["trades"]["Row"];

export function TradeLogTable({ trades }: { trades: TradeRow[] }) {
  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
        History ({trades.length})
      </h2>
      <div className="mt-3">
        <DataTable minWidth="640px">
          <DataTableHead>
            <Th sticky>Date</Th>
            <Th>Ticker</Th>
            <Th>Action</Th>
            <Th numeric>Shares</Th>
            <Th numeric>Price</Th>
            <Th numeric>Total</Th>
            <Th numeric>Realized G/L</Th>
            <Th>Reason</Th>
          </DataTableHead>
          <DataTableBody>
            {trades.map((t) => (
              <DataTableRow key={t.id}>
                <Td sticky>{formatDate(t.date)}</Td>
                <Td>{t.ticker}</Td>
                <Td>
                  <span className="capitalize">{t.action}</span>
                </Td>
                <Td numeric>{t.shares}</Td>
                <Td numeric>{formatCurrency(t.price)}</Td>
                <Td numeric>{formatCurrency(t.total)}</Td>
                <Td numeric>
                  {t.realized_gain !== null ? (
                    <span className={t.realized_gain >= 0 ? "text-gain" : "text-loss"}>
                      {formatSignedCurrency(t.realized_gain)}
                    </span>
                  ) : (
                    <span className="text-text-muted">—</span>
                  )}
                </Td>
                <Td>
                  <span className="text-text-secondary">{t.reason ?? "—"}</span>
                </Td>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </div>
    </section>
  );
}
