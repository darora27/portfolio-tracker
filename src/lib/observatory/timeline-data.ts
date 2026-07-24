import "server-only";

import { getHistoryData } from "@/lib/history-data";
import type { CompositionHistorySeries } from "@/lib/portfolio/composition-history";
import { supabase } from "@/lib/supabase/client";

export type FlowMarker = {
  date: string;
  direction: "in" | "out";
};

export type TradeMarker = {
  date: string;
  ticker: string;
  action: "buy" | "sell";
};

export function flowMarkers(
  snapshots: { date: string; totalCost: number }[],
): FlowMarker[] {
  return snapshots.slice(1).flatMap((snapshot, index) => {
    const previous = snapshots[index];
    if (snapshot.totalCost === previous.totalCost) return [];
    return [{
      date: snapshot.date,
      direction: snapshot.totalCost > previous.totalCost ? "in" as const : "out" as const,
    }];
  });
}

export function toPublicTradeMarkers(
  trades: { date: string; ticker: string; action: "buy" | "sell" }[],
): TradeMarker[] {
  return trades.map(({ date, ticker, action }) => ({ date, ticker, action }));
}

export async function getPublicTimelineData(): Promise<{
  flowMarkers: FlowMarker[];
  tradeMarkers: TradeMarker[];
  compositionHistory: CompositionHistorySeries;
}> {
  const [
    { data: snapshots, error: snapshotsError },
    { data: trades, error: tradesError },
    history,
  ] = await Promise.all([
    supabase
      .from("snapshots")
      .select("date, total_cost")
      .order("date", { ascending: true }),
    supabase
      .from("trades")
      .select("date, ticker, action")
      .order("date", { ascending: true }),
    getHistoryData(),
  ]);

  if (snapshotsError) throw snapshotsError;
  if (tradesError) throw tradesError;

  return {
    flowMarkers: flowMarkers(
      (snapshots ?? []).map(({ date, total_cost }) => ({
        date,
        totalCost: total_cost,
      })),
    ),
    tradeMarkers: toPublicTradeMarkers(trades ?? []),
    compositionHistory: history.compositionHistory,
  };
}
