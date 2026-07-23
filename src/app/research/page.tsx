import { cookies } from "next/headers";
import type { Metadata } from "next";
import { isValidSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { getResearchData } from "@/lib/research-data";
import { LoginForm } from "@/components/auth/LoginForm";
import { NavBar } from "@/components/layout/NavBar";
import { Card } from "@/components/ui/Card";
import { DataTable, DataTableHead, DataTableBody, DataTableRow, Th, Td } from "@/components/ui/DataTable";
import { StockNews } from "@/components/stock/StockNews";
import { InsiderFilings } from "@/components/research/InsiderFilings";
import { LeanIndicator } from "@/components/research/LeanIndicator";
import { formatSignedNumber } from "@/lib/format";
import {
  INSIDER_FILINGS_SUBTITLE,
  RESEARCH_FOOTER_LINE,
  REDDIT_PENDING_MESSAGE,
  CROSS_SOURCE_SUBTITLE,
  RESEARCH_INTRO,
} from "@/lib/research-copy";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Research — Portfolio Tracker",
  robots: { index: false, follow: false },
};

export default async function ResearchPage() {
  const ownerPassword = process.env.OWNER_PASSWORD;
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const authenticated = ownerPassword ? isValidSession(session, ownerPassword) : false;

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <h1 className="mt-3 text-xl font-semibold text-text-primary">Research</h1>
        <p className="mt-1 text-sm text-text-secondary">Sign in to view.</p>
        <LoginForm />
      </div>
    );
  }

  const data = await getResearchData();

  return (
    <>
      <NavBar variant="private" active="research" />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">Research</h1>
            <p className="mt-1 text-sm text-text-secondary">{RESEARCH_INTRO}</p>
          </div>

          {!data.redditConfigured && (
            <Card>
              <p className="text-sm text-text-secondary">{REDDIT_PENDING_MESSAGE}</p>
            </Card>
          )}

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Cross-source signal
            </h2>
            <p className="mt-1 text-xs text-text-muted">{CROSS_SOURCE_SUBTITLE}</p>
            <div className="mt-3">
              <DataTable minWidth="640px">
                <DataTableHead>
                  <Th sticky>Ticker</Th>
                  <Th numeric>News (24h)</Th>
                  <Th numeric>Reddit (24h)</Th>
                  <Th numeric>Insider net (90d)</Th>
                </DataTableHead>
                <DataTableBody>
                  {data.rows.map((row) => (
                    <DataTableRow
                      key={row.ticker}
                      className={row.agreementRing ? "ring-1 ring-inset ring-accent" : ""}
                    >
                      <Td sticky>
                        <span className="font-mono font-medium text-text-primary">{row.ticker}</span>
                      </Td>
                      <Td numeric>
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-mono">{row.newsCount24h}</span>
                          <LeanIndicator lean={row.newsLean} />
                        </div>
                      </Td>
                      <Td numeric>
                        {row.redditMentions24h === null || row.redditLean === null ? (
                          <span className="text-xs text-text-muted">pending</span>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-mono">{row.redditMentions24h}</span>
                            <LeanIndicator lean={row.redditLean} />
                          </div>
                        )}
                      </Td>
                      <Td numeric>
                        <span className="font-mono">{formatSignedNumber(row.insiderNet90d)}</span>
                      </Td>
                    </DataTableRow>
                  ))}
                </DataTableBody>
              </DataTable>
            </div>
          </section>

          {data.marketNews.length > 0 && <StockNews items={data.marketNews} title="General market news" />}

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Insider filings</h2>
            <p className="mt-1 text-xs text-text-muted">{INSIDER_FILINGS_SUBTITLE}</p>
            <div className="mt-3 space-y-2">
              {data.rows.map((row) => (
                <InsiderFilings key={row.ticker} ticker={row.ticker} transactions={row.insiderTransactions} />
              ))}
            </div>
          </section>

          <p className="border-t border-border pt-6 text-xs text-text-muted">{RESEARCH_FOOTER_LINE}</p>
        </div>
      </div>
    </>
  );
}
