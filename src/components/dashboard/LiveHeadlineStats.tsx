"use client";

import { useLiveQuotes } from "./LiveQuotesProvider";
import { HeadlineStats } from "./HeadlineStats";
import { dailyChangeAmount, dailyChangePercent } from "@/lib/math/daily-change";
import type { AllTimeHighInfo } from "@/lib/math/all-time-high";

export function LiveHeadlineStats({
  totalCost,
  simpleReturnPct,
  dailyChangeAsOf,
  twrPct,
  xirrPct,
  historyDays,
  pricesAsOf,
  allTimeHigh,
  netFlowsToday,
  prevSnapshotValue,
}: {
  totalCost: number;
  simpleReturnPct: number;
  dailyChangeAsOf: string;
  twrPct: number;
  xirrPct: number;
  historyDays: number;
  pricesAsOf: string | null;
  allTimeHigh: AllTimeHighInfo | null;
  netFlowsToday: number;
  prevSnapshotValue: number | null;
}) {
  const { totalValue } = useLiveQuotes();
  const dailyChange =
    prevSnapshotValue !== null ? dailyChangeAmount(totalValue, prevSnapshotValue, netFlowsToday) : 0;
  const dailyChangePct =
    prevSnapshotValue !== null ? dailyChangePercent(totalValue, prevSnapshotValue, netFlowsToday) : 0;

  return (
    <HeadlineStats
      totalValue={totalValue}
      totalCost={totalCost}
      simpleReturnPct={simpleReturnPct}
      dailyChange={dailyChange}
      dailyChangePct={dailyChangePct}
      dailyChangeAsOf={dailyChangeAsOf}
      twrPct={twrPct}
      xirrPct={xirrPct}
      historyDays={historyDays}
      pricesAsOf={pricesAsOf}
      allTimeHigh={allTimeHigh}
    />
  );
}
