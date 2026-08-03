import { unstable_cache } from "next/cache";
import { supabase } from "@/lib/supabase/client";
import { getQuotes, getUpcomingEarnings, getCompanyNews } from "@/lib/finnhub";
import type { EarningsEvent } from "@/lib/finnhub-earnings";
import { isUsableNewsUrl, type NewsItem } from "@/lib/finnhub-news";
import { dailyReturns, priceReturns } from "@/lib/math/returns";
import { correlationMatrix } from "@/lib/math/correlation";
import { twr } from "@/lib/math/twr";
import { drawdown } from "@/lib/math/drawdown";
import { annualizedVolatility } from "@/lib/math/volatility";
import { sharpeRatio } from "@/lib/math/sharpe";
import { xirr } from "@/lib/math/xirr";
import { dailyChangeAmount, dailyChangePercent, netFlowsForDate } from "@/lib/math/daily-change";
import {
  bestDay,
  currentStreak,
  sortino,
  winRate,
  worstDay,
  type DatedReturn,
  type Streak,
} from "@/lib/math/daily-stats";
import { fromAllTimeHigh, type AllTimeHighInfo } from "@/lib/math/all-time-high";
import { trailingReturn } from "@/lib/portfolio/trailing-return";
import { daysBetween, todayInTimeZone } from "@/lib/date";
import {
  buildXirrCashFlows,
  computeHoldings,
  concentration,
  resolveDailyChange,
  latestKnownPrices,
  latestPriceDate,
  mergePrices,
  resolvePrevClose,
  topWinnersLosers,
  type Position,
} from "@/lib/portfolio/holdings";
import {
  computeBenchmarkComparison,
  type BenchmarkComparison,
  type BenchmarkTicker,
} from "@/lib/portfolio/benchmark-comparison";
import { classificationWeights, type ClassificationWeight } from "@/lib/portfolio/classification-weights";
import { getHistoryData } from "@/lib/history-data";
import type { CompositionHistorySeries } from "@/lib/portfolio/composition-history";
import { buildHoldingsPerformance, type HoldingsPerformanceSeries } from "@/lib/portfolio/holdings-performance";
import { perHoldingRisk, type HoldingRisk } from "@/lib/portfolio/per-holding-risk";
import {
  companyNameForTicker,
  resolveBeltMembership,
  weeklyReturnForPrices,
  type BeltResolution,
  type PublicOrreryHolding,
} from "@/lib/observatory/orrery";
import {
  buildPublicTradeLog,
  type PublicTradeEntry,
} from "@/lib/observatory/public-trade-log";
import {
  groupNewsByTicker,
  isPublicNewsHeadline,
  type PublicNewsItem,
} from "@/lib/observatory/public-news";
import aiExposureByTicker from "../../data/ai-exposure.json";
import type { ChartPoint } from "@/components/dashboard/ValueChart";
import type { PositionRow } from "@/components/dashboard/PositionsTable";
import type { Mover } from "@/components/dashboard/WinnersLosers";

const SPARKLINE_POINTS = 30;

const BENCHMARK_TICKERS: BenchmarkTicker[] = ["VOO", "VTI", "XLK"];
const BENCHMARK_CHART_KEYS: Record<BenchmarkTicker, "vooIndex" | "vtiIndex" | "xlkIndex"> = {
  VOO: "vooIndex",
  VTI: "vtiIndex",
  XLK: "xlkIndex",
};

export type DashboardData = {
  totalValue: number;
  totalCost: number;
  simpleReturnPct: number;
  dailyChange: number;
  dailyChangePct: number;
  dailyChangeAsOf: string;
  twrPct: number;
  xirrPct: number;
  historyDays: number;
  pricesAsOf: string | null;
  chartData: ChartPoint[];
  positionRows: PositionRow[];
  winners: (Position & { gainPct: number })[];
  losers: (Position & { gainPct: number })[];
  movers: Mover[];
  upcomingEarnings: EarningsEvent[];
  volatilityPct: number | null;
  maxDrawdown: number;
  sharpe: number | null;
  betaVsVoo: number | null;
  top2ConcentrationPct: number;
  hhi: number;
  benchmarkComparisons: BenchmarkComparison[];
  sectorWeights: ClassificationWeight[];
  aiExposureWeights: ClassificationWeight[];
  correlationTickers: string[];
  correlationCells: (number | null)[][];
  realizedGain: number;
  unrealizedGain: number;
  donutSlices: { ticker: string; weight: number; value: number }[];
  latestNews: NewsItem[];
  /** Trailing-seven-day, held-ticker-only public news projection. */
  newsByHolding?: Record<string, PublicNewsItem[]>;
  /** Ratio-only public trade projection; never carries owner ledger fields. */
  publicTradeLog?: PublicTradeEntry[];
  allTimeHigh: AllTimeHighInfo | null;
  sortinoRatio: number | null;
  bestDay: DatedReturn | null;
  worstDay: DatedReturn | null;
  winRatePct: number;
  currentStreak: Streak | null;
  /** Ingredients for client-side Daily Change recomputation as new live quotes arrive (§6). */
  netFlowsToday: number;
  prevSnapshotValue: number | null;
  holdingsPerformance: HoldingsPerformanceSeries;
  holdingRisks: HoldingRisk[];
  /** Public-safe holding facts used by the §7 Portfolio Orrery. Never includes shares, value, or cost. */
  publicOrreryHoldings: PublicOrreryHolding[];
  /** Snapshot-stable top-eight planet membership and the remaining asteroid-belt tickers. */
  orreryBelt: BeltResolution;
  /** Trailing 7-calendar-day return, for the surface tier's weeklySubline. Null when history isn't old enough yet. */
  twr7d: number | null;
  voo7d: number | null;
  /** §14: raw VOO close-price history (not indexed), for the Chart Room's VOO · SAME PERIOD overlay. */
  vooCloseHistory: { date: string; price: number }[];
  /** §14: the portfolio's own TWR growth index (started at 1, unmultiplied by 100), for the Chart Room's BOOK · SAME PERIOD overlay. */
  bookGrowthIndex: { date: string; index: number }[];
  /** §14: each currently-held ticker's first-ever trade date, for the Chart Room's SINCE BUY range/bench window. */
  firstTradeDateByTicker: Record<string, string>;
  /** §14: every trade for currently-held tickers, for the Chart Room graph's TRADES overlay. */
  trades: { date: string; ticker: string; action: string; shares: number; price: number }[];
  /** §15: same series /history's DrawdownChart already renders, via getHistoryData(). Oldest first. */
  drawdownSeries: { date: string; drawdown: number }[];
  /** §15: same series /history's DailyReturnsChart already renders, via getHistoryData(). Oldest first. */
  dailyReturnBars: { date: string; return: number }[];
  /** §15: same series /history's CompositionOverTimeChart already renders, via getHistoryData(). */
  compositionHistory: CompositionHistorySeries;
};

/**
 * FB-36. How long the cached payload stays warm.
 *
 * Five minutes, at his choosing. The underlying data is daily snapshots plus
 * live quotes; a quote five minutes old is not meaningfully staler than one
 * fetched at page load, and the alternative was an 18-second wait for every
 * visitor.
 */
const DASHBOARD_CACHE_SECONDS = 300;

/**
 * All computed dashboard data, shared between the owner's private view (/)
 * and the public read-only view (/share) — both render the same numbers,
 * they just differ in whether dollar amounts are shown.
 *
 * ## FB-36: why the cache is here and not on the page
 *
 * Measured on the deployed site: 18.2 seconds to first byte, on a warm
 * instance, every request. TTFB was 42 ms and the HTML body then took 17.3
 * seconds — the server holding the connection open while this function
 * awaited ~24 Finnhub calls (8 quotes + 8 earnings + 8 news).
 *
 * The obvious fix — `export const revalidate` on the route — cannot work.
 * `UniverseRoute` calls `cookies()` and reads `searchParams`, and either one
 * opts a route into dynamic rendering in the App Router, so the full route
 * cache never engages. The expense is in the data, so the cache goes on the
 * data.
 *
 * `unstable_cache` is shared across instances and across visitors, which the
 * existing in-memory `getOrFetch` is not: that one lives on a single
 * serverless instance and so never helps a FIRST-TIME visitor, which is the
 * only visitor a shared link has. Both are kept — getOrFetch still collapses
 * repeat Finnhub calls inside one render.
 *
 * ## Privacy
 *
 * The cached payload carries owner dollar figures, exactly as the uncached
 * one did. It is not keyed by viewer, and it does not need to be: this is a
 * single-owner application, and `/share` strips dollars at render time from
 * the same object `/` renders in full. The public boundary is enforced where
 * it always was — in the component, by `mode` — and caching does not move
 * it. If this ever becomes multi-user, this cache must become per-user or be
 * removed; that is the trap to remember.
 */
/**
 * The cache is bypassed under test, deliberately.
 *
 * dashboard-data.source.test.ts calls this function four times in one test,
 * re-mocking Finnhub between calls and asserting the result changes. A cache
 * would serve the first payload to all four and the test would pass for the
 * wrong reason — worse than failing, because it would keep passing after the
 * projection logic broke. The uncached function is what has behaviour worth
 * asserting; the cache is transport.
 */
export const getDashboardData: () => Promise<DashboardData> =
  process.env.NODE_ENV === "test"
    ? getDashboardDataUncached
    : unstable_cache(getDashboardDataUncached, ["dashboard-data"], {
        revalidate: DASHBOARD_CACHE_SECONDS,
        tags: ["dashboard-data"],
      });

async function getDashboardDataUncached(): Promise<DashboardData> {
  const [
    { data: trades, error: tradesError },
    { data: snapshots, error: snapshotsError },
    { data: snapshotPositions, error: positionsError },
    { data: benchmarkRows, error: benchmarksError },
    { data: sectorRows, error: sectorError },
    historyData,
  ] = await Promise.all([
    supabase.from("trades").select("*").order("date", { ascending: true }),
    supabase.from("snapshots").select("*").order("date", { ascending: true }),
    supabase.from("snapshot_positions").select("snapshot_id, ticker, close_price, value"),
    supabase.from("benchmarks").select("date, close, ticker").in("ticker", BENCHMARK_TICKERS),
    // Cached sector classification only — never a live Finnhub call from the
    // page-load path. Refreshed exclusively by ensureSectorCached at trade entry.
    supabase.from("ticker_sector").select("ticker, sector"),
    // §15: drawdownSeries/dailyReturnBars/compositionHistory are already
    // computed and tested for /history — a second call to the same pure
    // function, not a re-derivation (spec §3).
    getHistoryData(),
  ]);

  if (tradesError) throw tradesError;
  if (snapshotsError) throw snapshotsError;
  if (positionsError) throw positionsError;
  if (benchmarksError) throw benchmarksError;
  // PGRST205 = "table not found in schema cache" — the ticker_sector migration
  // (supabase/schema.sql) hasn't been applied to this Supabase project yet.
  // Degrade to "no cached sectors" (everything shows Unclassified) instead of
  // a hard 500 for the whole dashboard over one optional, additive table.
  if (sectorError && sectorError.code !== "PGRST205") throw sectorError;

  const now = new Date();
  const today = todayInTimeZone("America/New_York");

  // Current holdings are derived from trades, never read from a stored table.
  const snapshotDateById = new Map((snapshots ?? []).map((s) => [s.id, s.date]));
  const priceRows = (snapshotPositions ?? [])
    .map((row) => {
      const date = snapshotDateById.get(row.snapshot_id);
      return date ? { ticker: row.ticker, closePrice: row.close_price, date } : null;
    })
    .filter((row): row is { ticker: string; closePrice: number; date: string } => row !== null);
  const fallbackPrices = latestKnownPrices(priceRows);

  // Grouped by ticker once, sorted ascending by date, so both the
  // sparkline column and the correlation matrix below can slice/derive
  // from the same source instead of re-scanning priceRows twice.
  const pricesByTicker = new Map<string, { date: string; price: number }[]>();
  for (const row of priceRows) {
    const list = pricesByTicker.get(row.ticker) ?? [];
    list.push({ date: row.date, price: row.closePrice });
    pricesByTicker.set(row.ticker, list);
  }
  for (const list of pricesByTicker.values()) {
    list.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  }

  // For the Day $/Day % columns: the most recent close strictly before
  // today, per ticker (never today's own not-yet-existing snapshot).
  const priorCloseByTicker = latestKnownPrices(priceRows.filter((r) => r.date < today));

  // A ticker's first-ever trade date/price, to special-case "bought
  // today" positions (their day P&L starts at purchase, not at a close
  // for shares they didn't own yet).
  const firstTradeByTicker = new Map<string, { date: string; price: number }>();
  for (const t of trades ?? []) {
    const existing = firstTradeByTicker.get(t.ticker);
    if (!existing || t.date < existing.date) {
      firstTradeByTicker.set(t.ticker, { date: t.date, price: t.price });
    }
  }

  // Live quotes take priority; if Finnhub is down or rate-limited for a
  // ticker, mergePrices falls back to its last known snapshot price rather
  // than showing no price (or $0) at all.
  const heldTickers = computeHoldings(trades ?? [], new Map()).map((p) => p.ticker);
  const [liveQuotes, upcomingEarnings, newsByTicker] = await Promise.all([
    getQuotes(heldTickers),
    getUpcomingEarnings(heldTickers),
    Promise.all(
      heldTickers.map(async (ticker) => {
        try {
          return await getCompanyNews(ticker, 7, 20);
        } catch {
          return [];
        }
      }),
    ),
  ]);
  // Top 6 headlines across all holdings, newest first — each item already
  // carries its own ticker (tagged by getCompanyNews) for the chip.
  const latestNews = newsByTicker.flat().sort((a, b) => b.datetime - a.datetime).slice(0, 6);
  const newsByHolding = groupNewsByTicker(
    new Map(
      heldTickers.map((ticker, index) => [ticker, newsByTicker[index] ?? []]),
    ),
    heldTickers,
  );
  const nowSeconds = Math.floor(Date.now() / 1000);
  // FB-24 (§13): moon existence/sizing must key off the same linkable
  // (http/https URL) count PlanetDetail.tsx's click destination already
  // uses -- a moon that exists but opens to zero real headlines was the
  // owner's "do nothing" report.
  const publicNewsCounts = new Map(
    heldTickers.map((ticker, index) => [
      ticker,
      (newsByTicker[index] ?? []).filter(
        (item) =>
          isUsableNewsUrl(item.url) &&
          isPublicNewsHeadline(item.headline) &&
          item.datetime >= nowSeconds - 7 * 24 * 60 * 60 &&
          item.datetime <= nowSeconds,
      ).length,
    ]),
  );
  const publicTradeLog = buildPublicTradeLog(trades ?? []);
  const livePrices = new Map(
    [...liveQuotes.entries()].map(([ticker, quote]) => [
      ticker,
      { price: quote.price, date: today },
    ]),
  );
  const prices = mergePrices(livePrices, fallbackPrices);
  const positions = computeHoldings(trades ?? [], prices);

  const totalValue = positions.reduce((sum, p) => sum + p.value, 0);
  const totalCost = positions.reduce((sum, p) => sum + p.costBasis, 0);
  const simpleReturnPct = totalCost !== 0 ? (totalValue - totalCost) / totalCost : 0;
  const pricesAsOf = latestPriceDate(positions);

  const positionRows: PositionRow[] = positions.map((p) => {
    const firstTrade = firstTradeByTicker.get(p.ticker);
    const { prevClose } = resolvePrevClose(
      firstTrade?.date,
      firstTrade?.price,
      priorCloseByTicker.get(p.ticker),
      today,
    );
    const boughtToday = firstTrade?.date === today;
    // R7-W1. Replaces dayChange(p.shares, p.price, prevClose), which compared
    // the live price against the latest close — the same number outside a
    // session, so every holding reported a real 0.0%. resolveDailyChange
    // carries the last completed session instead and labels it honestly.
    const daily = resolveDailyChange({
      shares: p.shares,
      quotePrice: liveQuotes.get(p.ticker)?.price ?? null,
      closes: pricesByTicker.get(p.ticker) ?? [],
      now,
      firstTradeDate: firstTrade?.date,
      firstTradePrice: firstTrade?.price,
    });
    return {
      ...p,
      contribution: p.gain !== null && totalCost !== 0 ? p.gain / totalCost : null,
      day: daily.dollars,
      dayPct: daily.pct,
      dayLabel: daily.label,
      dayDirection: daily.direction,
      dayCarried: daily.carried,
      isNewToday: boughtToday,
      sparkline: (pricesByTicker.get(p.ticker) ?? []).slice(-SPARKLINE_POINTS).map((pt) => pt.price),
      prevClose,
    };
  });

  // Top 3 by |day %|, today only — distinct from since-purchase Winners/Losers.
  const movers: Mover[] = [...positionRows]
    .filter((p): p is PositionRow & { day: number; dayPct: number } => p.day !== null && p.dayPct !== null)
    .sort((a, b) => Math.abs(b.dayPct) - Math.abs(a.dayPct))
    .slice(0, 3)
    .map((p) => ({ ticker: p.ticker, day: p.day, dayPct: p.dayPct }));

  const { winners, losers } = topWinnersLosers(positions, 3);
  const { top2, hhi } = concentration(positions);

  const sectorByTicker = new Map((sectorRows ?? []).map((r) => [r.ticker, r.sector]));
  const sectorWeights = classificationWeights(positions, sectorByTicker);

  const aiExposureByTickerMap = new Map(Object.entries(aiExposureByTicker));
  const aiExposureWeights = classificationWeights(positions, aiExposureByTickerMap);

  // Correlation between current holdings, from each ticker's own close-price
  // history (not the portfolio's net-of-flow returns — a single ticker has
  // no cash flows of its own). Overlap windows differ per pair (holdings
  // were bought on different days), which correlationMatrix handles itself.
  const returnsByTicker = Object.fromEntries(
    positions.map((p) => [p.ticker, priceReturns(pricesByTicker.get(p.ticker) ?? [])]),
  );
  const correlation = correlationMatrix(returnsByTicker);

  // Realized gain is already computed per-sell in trade entry (average-cost
  // basis); unrealized is the existing mark-to-market gain on current
  // holdings — these are additive, distinct totals, not two views of the
  // same number.
  const realizedGain = (trades ?? []).reduce((sum, t) => sum + (t.realized_gain ?? 0), 0);
  const unrealizedGain = totalValue - totalCost;
  const donutSlices = positions.map((p) => ({ ticker: p.ticker, weight: p.weight, value: p.value }));

  // Performance history from daily snapshots, net of cash flows. Drop any
  // leading zero-value snapshots (days before the first investment) since
  // the return formula divides by the prior day's value.
  const allMathSnapshots = (snapshots ?? []).map((s) => ({
    date: s.date,
    totalCost: s.total_cost,
    totalValue: s.total_value,
  }));
  const firstFundedIndex = allMathSnapshots.findIndex((s) => s.totalValue > 0);
  const mathSnapshots = firstFundedIndex >= 0 ? allMathSnapshots.slice(firstFundedIndex) : [];
  const returns = dailyReturns(mathSnapshots);
  const twrPct = twr(returns);
  const { maxDrawdown } = drawdown(returns);
  const volatilityPct = annualizedVolatility(returns);
  const sharpe = sharpeRatio(returns);

  // returns[i] is the return realized ON mathSnapshots[i + 1] (day 0 has no
  // prior day to return against) — this is the same offset dailyReturns
  // itself documents.
  const returnsWithDates: DatedReturn[] = returns.map((r, i) => ({ date: mathSnapshots[i + 1].date, r }));
  const sortinoRatio = sortino(returns);
  const bestDayResult = bestDay(returnsWithDates);
  const worstDayResult = worstDay(returnsWithDates);
  const winRatePct = winRate(returns);
  const currentStreakResult = currentStreak(returns);

  let growthIndexValue = 1;
  const growthIndexSeries = mathSnapshots.map((s, i) => ({
    date: s.date,
    index: i === 0 ? growthIndexValue : (growthIndexValue *= 1 + returns[i - 1]),
  }));
  const allTimeHigh = fromAllTimeHigh(growthIndexSeries);

  // Benchmark daily returns, aligned to the exact same dates as the
  // portfolio's funded history — beta, TWR, and the chart comparison are
  // only meaningful over an identical date range. Both series start
  // indexed at 100 on the same first funded date (neither has a "return"
  // for that first day itself), so no separate anchor day is needed here.
  // Falls back to unavailable (rather than a partial/misaligned
  // comparison) per benchmark if any date is missing for it.
  const benchmarkDates = mathSnapshots.map((s) => s.date);
  const closeByDateByTicker = new Map<BenchmarkTicker, Map<string, number>>(
    BENCHMARK_TICKERS.map((ticker) => [ticker, new Map<string, number>()]),
  );
  for (const row of benchmarkRows ?? []) {
    closeByDateByTicker.get(row.ticker as BenchmarkTicker)?.set(row.date, row.close);
  }
  const benchmarkComparisons: BenchmarkComparison[] = BENCHMARK_TICKERS.map((ticker) =>
    computeBenchmarkComparison(
      ticker,
      closeByDateByTicker.get(ticker)!,
      benchmarkDates,
      returns,
      twrPct,
    ),
  );
  const betaVsVoo = benchmarkComparisons.find((b) => b.ticker === "VOO")?.beta ?? null;

  // Since-purchase performance line per holding (top 8 by weight, smaller
  // ones folded into "Other") — positions is already sorted by value/weight
  // descending from computeHoldings, so no extra sort is needed here.
  const holdingsPerformance = buildHoldingsPerformance(
    positions.map((p) => ({ ticker: p.ticker, weight: p.weight })),
    pricesByTicker,
  );

  // Per-holding volatility/beta, using VOO's own close-price returns
  // (already fetched for the portfolio-level benchmark comparison above)
  // as the alignment target.
  const vooCloses = [...(closeByDateByTicker.get("VOO") ?? new Map())].map(([date, price]) => ({
    date,
    price,
  }));
  const vooReturns = priceReturns(vooCloses);
  const holdingRisks = perHoldingRisk(returnsByTicker, vooReturns);

  // The daily-change headline compares LIVE current value (totalValue,
  // already computed above from live quotes) against the most recent
  // CLOSED day strictly before today — never today's own snapshot, which
  // may or may not exist yet depending on whether the EOD cron has run.
  // Cash flows are read straight from `trades` (not snapshot cost deltas)
  // because today's snapshot doesn't exist yet intraday.
  const prevSnapshot = [...mathSnapshots].reverse().find((s) => s.date < today);
  const netFlowsToday = netFlowsForDate(trades ?? [], today);
  const dailyChange = prevSnapshot
    ? dailyChangeAmount(totalValue, prevSnapshot.totalValue, netFlowsToday)
    : 0;
  const dailyChangePct = prevSnapshot
    ? dailyChangePercent(totalValue, prevSnapshot.totalValue, netFlowsToday)
    : 0;

  const cashFlows = buildXirrCashFlows(trades ?? [], totalValue, today);
  const xirrPct = cashFlows.length >= 2 ? xirr(cashFlows) : 0;
  const historyDays = mathSnapshots[0] ? daysBetween(mathSnapshots[0].date, today) : 0;

  const chartData: ChartPoint[] = growthIndexSeries.map((g, i) => {
    const point: ChartPoint = { date: g.date, portfolioIndex: g.index * 100 };
    for (const comparison of benchmarkComparisons) {
      if (comparison.available) point[BENCHMARK_CHART_KEYS[comparison.ticker]] = comparison.chartIndex[i];
    }
    return point;
  });

  // Same series the Act 2 surface chart renders, reused (not re-derived)
  // for the surface tier's weeklySubline.
  const portfolioIndexSeries = chartData.map((d) => ({ date: d.date, index: d.portfolioIndex }));
  const vooIndexSeries = chartData
    .filter((d): d is typeof d & { vooIndex: number } => d.vooIndex !== undefined)
    .map((d) => ({ date: d.date, index: d.vooIndex }));
  const twr7d = trailingReturn(portfolioIndexSeries, 7);
  const voo7d = trailingReturn(vooIndexSeries, 7);
  const publicOrreryHoldings: PublicOrreryHolding[] = positions.map((position) => {
    const weeklyReturn = weeklyReturnForPrices(pricesByTicker.get(position.ticker) ?? []);
    const risk = holdingRisks.find((item) => item.ticker === position.ticker);
    const nextEarnings = upcomingEarnings
      .filter((event) => event.ticker === position.ticker)
      .map((event) => daysBetween(today, event.date))
      .filter((days) => days >= 0 && days <= 7)
      .sort((left, right) => left - right)[0];
    const holdingSeries = pricesByTicker.get(position.ticker) ?? [];
    const firstPrice = holdingSeries[0]?.price;
    return {
      ticker: position.ticker,
      companyName: companyNameForTicker(position.ticker),
      weight: position.weight,
      contributionPct:
        positionRows.find((row) => row.ticker === position.ticker)
          ?.contribution ?? null,
      weeklyReturn,
      portfolioRelativeReturn:
        weeklyReturn === null || twr7d === null ? null : weeklyReturn - twr7d,
      volatilityPct: risk?.volatilityPct ?? null,
      betaVsVoo: risk?.betaVsVoo ?? null,
      dayReturn:
        positionRows.find((row) => row.ticker === position.ticker)?.dayPct ??
        null,
      nextEarningsDays: nextEarnings ?? null,
      newsCount: publicNewsCounts.get(position.ticker) ?? 0,
      chart:
        firstPrice && firstPrice > 0
          ? holdingSeries.map(({ date, price }) => ({
              date,
              index: (price / firstPrice) * 100,
            }))
          : [],
    };
  });
  const previousSnapshotRecord = [...(snapshots ?? [])]
    .reverse()
    .find((snapshot) => snapshot.date < today);
  const previousMembership = previousSnapshotRecord
    ? new Set(
        (snapshotPositions ?? [])
          .filter(
            (position) =>
              position.snapshot_id === previousSnapshotRecord.id &&
              previousSnapshotRecord.total_value > 0,
          )
          .map((position) => ({
            ticker: position.ticker,
            weight: position.value / previousSnapshotRecord.total_value,
          }))
          .sort((a, b) => b.weight - a.weight)
          .slice(0, 8)
          .map(({ ticker }) => ticker),
      )
    : null;
  const orreryBelt = resolveBeltMembership(
    publicOrreryHoldings.map(({ ticker, weight }) => ({ ticker, weight })),
    previousMembership,
  );

  return {
    totalValue,
    totalCost,
    simpleReturnPct,
    dailyChange,
    dailyChangePct,
    dailyChangeAsOf: pricesAsOf ?? today,
    twrPct,
    xirrPct,
    historyDays,
    pricesAsOf,
    chartData,
    positionRows,
    winners,
    losers,
    movers,
    upcomingEarnings,
    volatilityPct,
    maxDrawdown,
    sharpe,
    betaVsVoo,
    top2ConcentrationPct: top2,
    hhi,
    benchmarkComparisons,
    sectorWeights,
    aiExposureWeights,
    correlationTickers: correlation.tickers,
    correlationCells: correlation.matrix,
    realizedGain,
    unrealizedGain,
    donutSlices,
    latestNews,
    newsByHolding,
    publicTradeLog,
    allTimeHigh,
    sortinoRatio,
    bestDay: bestDayResult,
    worstDay: worstDayResult,
    winRatePct,
    currentStreak: currentStreakResult,
    netFlowsToday,
    prevSnapshotValue: prevSnapshot?.totalValue ?? null,
    holdingsPerformance,
    holdingRisks,
    publicOrreryHoldings,
    orreryBelt,
    twr7d,
    voo7d,
    vooCloseHistory: vooCloses,
    bookGrowthIndex: growthIndexSeries,
    firstTradeDateByTicker: Object.fromEntries(
      [...firstTradeByTicker.entries()].map(([ticker, info]) => [ticker, info.date]),
    ),
    trades: (trades ?? []).map((t) => ({
      date: t.date,
      ticker: t.ticker,
      action: t.action,
      shares: t.shares,
      price: t.price,
    })),
    drawdownSeries: historyData.drawdownSeries,
    dailyReturnBars: historyData.dailyReturnBars,
    compositionHistory: historyData.compositionHistory,
  };
}
