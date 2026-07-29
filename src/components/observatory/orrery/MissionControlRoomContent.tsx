import Link from "next/link";
import type { DashboardData } from "@/lib/dashboard-data";
import { daysBetween, todayInTimeZone } from "@/lib/date";
import { formatCurrency } from "@/lib/format";
import { LazyMissionSection } from "./LazyMissionSection";
import { ReturnInstrument } from "./ReturnInstrument";
import styles from "./orrery.module.css";

function signedPercent(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  const arrow = value > 0 ? "▲" : value < 0 ? "▼" : "◆";
  return `${arrow} ${Math.abs(value * 100).toFixed(digits)}%`;
}

function plainPercent(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return `${Math.abs(value * 100).toFixed(digits)}%`;
}

export function MissionControlRoomContent({
  data,
  basePath,
  mode,
}: {
  data: DashboardData;
  basePath: string;
  mode: "public" | "private";
}) {
  const positionByTicker = new Map(data.positionRows.map((row) => [row.ticker, row]));
  const allNews = Object.values(data.newsByHolding ?? {})
    .flat()
    .filter(({ url }) => /^https?:\/\//i.test(url))
    .sort((left, right) => right.datetime - left.datetime)
    .slice(0, 5);
  const today = todayInTimeZone("America/New_York");
  const correlationCount = Math.max(1, data.correlationTickers.length);
  const returns = data.chartData.map((point) => ({
    date: point.date,
    index: point.portfolioIndex,
    ...(typeof point.vooIndex === "number" ? { benchmarkIndex: point.vooIndex } : {}),
  }));

  return (
    <>
      <LazyMissionSection id="holdings" title="HOLDINGS" minHeight={340}>
        <div className={styles.holdingsTableWrap}>
          <table className={styles.holdingsTable}>
            <thead>
              <tr>
                <th>TICKER</th>
                <th>WEIGHT</th>
                <th>TODAY</th>
                <th>WEEK</th>
                {mode === "private" ? <th>VALUE</th> : null}
              </tr>
            </thead>
            <tbody>
              {data.publicOrreryHoldings.slice(0, 8).map((holding) => (
                <tr key={holding.ticker}>
                  <th>
                    <Link href={`${basePath}?holding=${encodeURIComponent(holding.ticker)}&camera=approach`}>
                      {holding.ticker}
                    </Link>
                  </th>
                  <td>{plainPercent(holding.weight)}</td>
                  <td>{signedPercent(holding.dayReturn)}</td>
                  <td>{signedPercent(holding.weeklyReturn)}</td>
                  {mode === "private"
                    ? <td>{formatCurrency(positionByTicker.get(holding.ticker)?.value ?? 0)}</td>
                    : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LazyMissionSection>

      <LazyMissionSection id="returns" title="RETURNS" minHeight={410}>
        <ReturnInstrument
          points={returns}
          initialRange="max"
          roomScale
          sinceLabel="SINCE START"
          ariaLabel="Portfolio return compared with VOO over the same period"
        />
        {mode === "private" ? (
          <p className={styles.xirrReadout}>
            {data.historyDays < 90
              ? "XIRR — (needs 90d)"
              : `XIRR · SINCE START ${signedPercent(data.xirrPct)}`}
          </p>
        ) : null}
      </LazyMissionSection>

      <LazyMissionSection id="risk" title="RISK" minHeight={220}>
        <div className={styles.riskInstruments}>
          <article>
            <span>VOL · SINCE START</span>
            <strong>{plainPercent(data.volatilityPct)}</strong>
            <i style={{ "--meter": `${Math.min(100, Math.max(0, (data.volatilityPct ?? 0) * 220))}%` } as React.CSSProperties} />
          </article>
          <article>
            <span>BETA · SAME PERIOD VOO</span>
            <strong>{data.betaVsVoo?.toFixed(2) ?? "—"}</strong>
            <i style={{ "--meter": `${Math.min(100, Math.max(0, (data.betaVsVoo ?? 0) * 50))}%` } as React.CSSProperties} />
          </article>
          <article>
            <span>OFF HIGH · SINCE {data.allTimeHigh?.peakDate.slice(5).replace("-", "·") ?? "—"}</span>
            <strong>{signedPercent(data.allTimeHigh?.pct)}</strong>
            <i style={{ "--meter": `${Math.min(100, Math.abs(data.allTimeHigh?.pct ?? 0) * 300)}%` } as React.CSSProperties} />
          </article>
        </div>
      </LazyMissionSection>

      <div className={styles.missionHalfRow}>
        <LazyMissionSection id="correlation" title="CORRELATION" minHeight={260}>
          <p className={styles.correlationExplanation}>
            When holdings move together, this portfolio has fewer independent
            paths through a market move. Correlation describes co-movement, not
            cause, certainty, or what happens next.
          </p>
          <div
            className={styles.roomCorrelation}
            style={{ gridTemplateColumns: `repeat(${correlationCount}, 1fr)` }}
            aria-label="Holding return correlation matrix"
          >
            {data.correlationTickers.flatMap((ticker, row) =>
              data.correlationTickers.map((column, col) => {
                const value = data.correlationCells[row]?.[col] ?? null;
                return (
                  <span
                    key={`${ticker}-${column}`}
                    title={`${ticker} and ${column}: ${value?.toFixed(2) ?? "unavailable"}`}
                    style={{ opacity: row === col ? 1 : Math.max(0.24, Math.abs(value ?? 0)) }}
                  >
                    {row === col ? ticker : value === null ? "—" : value.toFixed(1)}
                  </span>
                );
              }),
            )}
          </div>
        </LazyMissionSection>

        <LazyMissionSection id="earnings" title="EARNINGS" minHeight={260}>
          <ol className={styles.roomEarnings}>
            {[...data.upcomingEarnings]
              .sort((left, right) => left.date.localeCompare(right.date))
              .slice(0, 8)
              .map((event) => (
                <li key={`${event.ticker}-${event.date}`}>
                  <strong>{event.ticker}</strong>
                  <span>T−{Math.max(0, daysBetween(today, event.date))}D</span>
                  <time>{event.date}</time>
                </li>
              ))}
          </ol>
        </LazyMissionSection>
      </div>

      {allNews.length ? (
        <LazyMissionSection id="news" title="NEWS" minHeight={190}>
          <ol className={styles.roomNews}>
            {allNews.map((item) => (
              <li key={`${item.ticker}-${item.datetime}-${item.url}`}>
                <a href={item.url} target="_blank" rel="noreferrer">
                  <time>{new Date(item.datetime * 1000).toISOString().slice(5, 10)}</time>
                  <strong>{item.ticker}</strong>
                  <span>{item.headline}</span>
                </a>
              </li>
            ))}
          </ol>
        </LazyMissionSection>
      ) : null}

      <LazyMissionSection id="trades" title="TRADES" minHeight={260} className={styles.roomTrades}>
        <ol>
          {(data.publicTradeLog ?? []).slice(0, 12).map((entry, index) => (
            <li key={`${entry.date}-${entry.ticker}-${index}`}>
              <time>{entry.date}</time>
              <strong>{entry.action.toUpperCase()}</strong>
              <span>{entry.ticker}</span>
              <b>BOOK IMPACT {signedPercent(entry.impactPct)}</b>
            </li>
          ))}
        </ol>
        {mode === "private" ? <Link href="/trades">OPEN TRADE DESK ▸</Link> : null}
      </LazyMissionSection>
    </>
  );
}
