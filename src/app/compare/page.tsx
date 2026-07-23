import { cookies } from "next/headers";
import type { Metadata } from "next";
import { isValidSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { getCompareData } from "@/lib/compare-data";
import { LoginForm } from "@/components/auth/LoginForm";
import { NavBar } from "@/components/layout/NavBar";
import { SimulationsBanner } from "@/components/compare/SimulationsBanner";
import { CompareChart } from "@/components/compare/CompareChart";
import { SimTradeLog } from "@/components/compare/SimTradeLog";
import { DataTable, DataTableHead, DataTableBody, DataTableRow, Th, Td } from "@/components/ui/DataTable";
import { formatSignedPercent, formatPercent } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Compare — Portfolio Tracker",
  robots: { index: false, follow: false },
};

export default async function ComparePage() {
  const ownerPassword = process.env.OWNER_PASSWORD;
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const authenticated = ownerPassword ? isValidSession(session, ownerPassword) : false;

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <h1 className="mt-3 text-xl font-semibold text-text-primary">Compare</h1>
        <p className="mt-1 text-sm text-text-secondary">Sign in to view.</p>
        <LoginForm />
      </div>
    );
  }

  const data = await getCompareData();

  return (
    <>
      <NavBar variant="private" />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="space-y-6">
          <SimulationsBanner />

          <div>
            <h1 className="text-2xl font-semibold text-text-primary">Compare</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Your real portfolio against three hypothetical $10,000 portfolios, same inception date, same math.
            </p>
          </div>

          <CompareChart data={data.chartData} />

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Stats</h2>
            <div className="mt-3">
              <DataTable minWidth="480px">
                <DataTableHead>
                  <Th>Simulation</Th>
                  <Th numeric>TWR</Th>
                  <Th numeric>Volatility (ann.)</Th>
                  <Th numeric>Max drawdown</Th>
                </DataTableHead>
                <DataTableBody>
                  {data.stats.map((row) => (
                    <DataTableRow key={row.name}>
                      <Td>
                        <span className="font-medium text-text-primary">{row.name}</span>
                      </Td>
                      <Td numeric>{formatSignedPercent(row.twrPct)}</Td>
                      <Td numeric>{formatPercent(row.volatilityPct, 1)}</Td>
                      <Td numeric>{formatSignedPercent(row.maxDrawdown)}</Td>
                    </DataTableRow>
                  ))}
                </DataTableBody>
              </DataTable>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Trade logs</h2>
            <div className="mt-3 space-y-2">
              {data.sims.map((sim) => (
                <SimTradeLog key={sim.name} name={sim.name} trades={sim.trades} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
