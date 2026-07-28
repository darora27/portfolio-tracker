import { AddTradeForm } from "@/components/trades/AddTradeForm";
import { TradeLogTable } from "@/components/trades/TradeLogTable";
import { ShareSettingsToggle } from "@/components/trades/ShareSettingsToggle";
import { LiveQuotesProvider } from "@/components/dashboard/LiveQuotesProvider";
import { LiveHeadlineStats } from "@/components/dashboard/LiveHeadlineStats";
import { HowAmIDoingMode } from "@/components/dashboard/HowAmIDoingMode";
import { WhyMode } from "@/components/dashboard/WhyMode";
import { AttentionMode } from "@/components/dashboard/AttentionMode";
import { AllAnalyticsView } from "@/components/dashboard/AllAnalyticsView";
import { DailyReturnsChart } from "@/components/history/DailyReturnsChart";
import { DrawdownChart } from "@/components/history/DrawdownChart";
import { CompositionOverTimeChart } from "@/components/history/CompositionOverTimeChart";
import { DataTable, DataTableBody, DataTableHead, DataTableRow, Td, Th } from "@/components/ui/DataTable";
import { Card } from "@/components/ui/Card";
import { StockNews } from "@/components/stock/StockNews";
import { InsiderFilings } from "@/components/research/InsiderFilings";
import { LeanIndicator } from "@/components/research/LeanIndicator";
import type { DashboardData } from "@/lib/dashboard-data";
import type { HistoryData } from "@/lib/history-data";
import type { ResearchData } from "@/lib/research-data";
import type { Database } from "@/lib/supabase/types";
import {
  formatCurrency,
  formatDate,
  formatSignedCurrency,
  formatSignedNumber,
  formatSignedPercent,
} from "@/lib/format";
import {
  CROSS_SOURCE_SUBTITLE,
  INSIDER_FILINGS_SUBTITLE,
  REDDIT_PENDING_MESSAGE,
  RESEARCH_FOOTER_LINE,
  RESEARCH_INTRO,
} from "@/lib/research-copy";
import { todayInTimeZone } from "@/lib/date";
import type { MissionControlPanelId } from "./MissionControl";
import styles from "./orrery.module.css";

type TradeRow = Database["public"]["Tables"]["trades"]["Row"];

export function OwnerMissionControlContent({
  panel,
  data,
  history,
  research,
  trades,
  hideDollars,
}: {
  panel: MissionControlPanelId;
  data: DashboardData;
  history?: HistoryData;
  research?: ResearchData;
  trades?: TradeRow[];
  hideDollars?: boolean;
}) {
  if (panel === "scope" && history) {
    return (
      <div className={styles.ownerMissionPanel}>
        <div className={styles.ownerPanelHeading}>
          <div><p className={styles.inspectorKicker}>Owner history station</p><h3>History</h3></div>
          <a href="/api/export/history.csv">Export CSV</a>
        </div>
        <DailyReturnsChart data={history.dailyReturnBars} />
        <DrawdownChart data={history.drawdownSeries} />
        <CompositionOverTimeChart data={history.compositionHistory} />
        <DataTable minWidth="640px">
          <DataTableHead>
            <Th sticky>Date</Th><Th numeric>Invested</Th><Th numeric>Value</Th>
            <Th numeric>Day $</Th><Th numeric>Day %</Th><Th numeric>Cumulative TWR</Th>
          </DataTableHead>
          <DataTableBody>
            {history.rows.map((row) => (
              <DataTableRow key={row.date}>
                <Td sticky>{formatDate(row.date)}</Td>
                <Td numeric>{formatCurrency(row.invested)}</Td>
                <Td numeric>{formatCurrency(row.value)}</Td>
                <Td numeric>{row.day === null ? "—" : formatSignedCurrency(row.day)}</Td>
                <Td numeric>{row.dayPct === null ? "—" : formatSignedPercent(row.dayPct, 2)}</Td>
                <Td numeric>{formatSignedPercent(row.cumulativeTwr, 2)}</Td>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </div>
    );
  }

  if (panel === "log" && trades) {
    return (
      <div className={styles.ownerMissionPanel}>
        <div className={styles.ownerPanelHeading}>
          <div><p className={styles.inspectorKicker}>Owner trade station</p><h3>Trades</h3></div>
          <a href="/api/export/trades.csv">Export CSV</a>
        </div>
        <ShareSettingsToggle initialHideDollars={hideDollars ?? true} />
        <AddTradeForm />
        <TradeLogTable trades={trades} />
      </div>
    );
  }

  if (panel === "comms" && research) {
    return (
      <div className={styles.ownerMissionPanel}>
        <p className={styles.inspectorKicker}>Owner research station</p>
        <h3>Research</h3>
        <p>{RESEARCH_INTRO}</p>
        {!research.redditConfigured ? <Card><p>{REDDIT_PENDING_MESSAGE}</p></Card> : null}
        <section>
          <h4>Cross-source signal</h4>
          <p>{CROSS_SOURCE_SUBTITLE}</p>
          <DataTable minWidth="640px">
            <DataTableHead>
              <Th sticky>Ticker</Th><Th numeric>News (24h)</Th>
              <Th numeric>Reddit (24h)</Th><Th numeric>Insider net (90d)</Th>
            </DataTableHead>
            <DataTableBody>
              {research.rows.map((row) => (
                <DataTableRow key={row.ticker}>
                  <Td sticky>{row.ticker}</Td>
                  <Td numeric>{row.newsCount24h} <LeanIndicator lean={row.newsLean} /></Td>
                  <Td numeric>{row.redditMentions24h ?? "pending"} {row.redditLean ? <LeanIndicator lean={row.redditLean} /> : null}</Td>
                  <Td numeric>{formatSignedNumber(row.insiderNet90d)}</Td>
                </DataTableRow>
              ))}
            </DataTableBody>
          </DataTable>
        </section>
        {research.marketNews.length ? <StockNews items={research.marketNews} title="General market news" /> : null}
        <section>
          <h4>Insider filings</h4>
          <p>{INSIDER_FILINGS_SUBTITLE}</p>
          {research.rows.map((row) => (
            <InsiderFilings key={row.ticker} ticker={row.ticker} transactions={row.insiderTransactions} />
          ))}
        </section>
        <p>{RESEARCH_FOOTER_LINE}</p>
      </div>
    );
  }

  return (
    <LiveQuotesProvider initialPositions={data.positionRows}>
      <div className={styles.ownerMissionPanel}>
        <p className={styles.inspectorKicker}>Owner dashboard station</p>
        <h3>Dashboard</h3>
        <LiveHeadlineStats
          totalCost={data.totalCost}
          simpleReturnPct={data.simpleReturnPct}
          dailyChangeAsOf={data.dailyChangeAsOf}
          twrPct={data.twrPct}
          xirrPct={data.xirrPct}
          historyDays={data.historyDays}
          pricesAsOf={data.pricesAsOf}
          allTimeHigh={data.allTimeHigh}
          netFlowsToday={data.netFlowsToday}
          prevSnapshotValue={data.prevSnapshotValue}
        />
        <HowAmIDoingMode data={data} />
        <WhyMode data={data} />
        <AttentionMode data={data} today={todayInTimeZone("America/New_York")} />
        <AllAnalyticsView data={data} />
      </div>
    </LiveQuotesProvider>
  );
}
