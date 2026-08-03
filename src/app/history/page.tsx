import Link from "next/link";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { isValidSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { getHistoryData } from "@/lib/history-data";
import { LoginForm } from "@/components/auth/LoginForm";
import { UniverseNav } from "@/components/observatory/UniverseNav";
import { DailyReturnsChart } from "@/components/history/DailyReturnsChart";
import { DrawdownChart } from "@/components/history/DrawdownChart";
import { CompositionOverTimeChart } from "@/components/history/CompositionOverTimeChart";
import { DataTable, DataTableHead, DataTableBody, DataTableRow, Th, Td } from "@/components/ui/DataTable";
import { formatCurrency, formatDate, formatSignedCurrency, formatSignedPercent } from "@/lib/format";

// Reflects live snapshot history, never static. Owner-gated — never part
// of the public /share surface.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "History — Portfolio Tracker",
  robots: { index: false, follow: false },
};

export default async function HistoryPage() {
  const ownerPassword = process.env.OWNER_PASSWORD;
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const authenticated = ownerPassword ? isValidSession(session, ownerPassword) : false;

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <Link href="/share" className="text-sm text-text-secondary hover:text-text-primary hover:underline">
          View public share page
        </Link>
        <h1 className="mt-3 text-xl font-semibold text-text-primary">History</h1>
        <p className="mt-1 text-sm text-text-secondary">Sign in to view portfolio history.</p>
        <LoginForm />
      </div>
    );
  }

  const { rows, dailyReturnBars, drawdownSeries, compositionHistory } = await getHistoryData();

  return (
    <>
      <UniverseNav active="history" />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-text-primary">History</h1>
            <a
              href="/api/export/history.csv"
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text-secondary hover:border-border-strong hover:text-text-primary"
            >
              Export CSV
            </a>
          </div>

          <DailyReturnsChart data={dailyReturnBars} />
          <DrawdownChart data={drawdownSeries} />
          <CompositionOverTimeChart data={compositionHistory} />

          <section>
            <DataTable minWidth="640px">
              <DataTableHead>
                <Th sticky>Date</Th>
                <Th numeric>Invested</Th>
                <Th numeric>Value</Th>
                <Th numeric>Day $</Th>
                <Th numeric>Day %</Th>
                <Th numeric>Cumulative TWR</Th>
              </DataTableHead>
              <DataTableBody>
                {rows.map((r) => (
                  <DataTableRow key={r.date}>
                    <Td sticky>{formatDate(r.date)}</Td>
                    <Td numeric>{formatCurrency(r.invested)}</Td>
                    <Td numeric>{formatCurrency(r.value)}</Td>
                    <Td numeric>
                      {r.day !== null ? (
                        <span className={r.day >= 0 ? "text-gain" : "text-loss"}>
                          {formatSignedCurrency(r.day)}
                        </span>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </Td>
                    <Td numeric>
                      {r.dayPct !== null ? (
                        <span className={r.dayPct >= 0 ? "text-gain" : "text-loss"}>
                          {formatSignedPercent(r.dayPct, 2)}
                        </span>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </Td>
                    <Td numeric>
                      <span className={r.cumulativeTwr >= 0 ? "text-gain" : "text-loss"}>
                        {formatSignedPercent(r.cumulativeTwr, 2)}
                      </span>
                    </Td>
                  </DataTableRow>
                ))}
              </DataTableBody>
            </DataTable>
          </section>
        </div>
      </div>
    </>
  );
}
