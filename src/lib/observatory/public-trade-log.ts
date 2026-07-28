import type { Database } from "@/lib/supabase/types";

type TradeRow = Database["public"]["Tables"]["trades"]["Row"];

export type PublicTradeEntry = {
  date: string;
  action: "buy" | "sell";
  ticker: string;
  impactPct: number;
  realizedSign: -1 | 0 | 1;
};

type CostPosition = { shares: number; costBasis: number };

function roundImpact(value: number): number {
  return Number(value.toFixed(3));
}

export function buildPublicTradeLog(
  trades: readonly TradeRow[],
  maxEntries = 20,
): PublicTradeEntry[] {
  const positions = new Map<string, CostPosition>();
  let portfolioCostBasis = 0;
  const projected: PublicTradeEntry[] = [];
  const ordered = [...trades].sort(
    (left, right) =>
      left.date.localeCompare(right.date) || left.id - right.id,
  );

  for (const trade of ordered) {
    const ticker = trade.ticker.toUpperCase();
    const current = positions.get(ticker) ?? { shares: 0, costBasis: 0 };
    const tradeTotal = Math.abs(
      Number.isFinite(trade.total)
        ? trade.total
        : trade.shares * trade.price,
    );
    if (trade.action === "buy") {
      current.shares += trade.shares;
      current.costBasis += tradeTotal;
      portfolioCostBasis += tradeTotal;
    } else {
      const sharesSold = Math.min(current.shares, trade.shares);
      const averageCost =
        current.shares > 0 ? current.costBasis / current.shares : 0;
      const removedBasis = averageCost * sharesSold;
      current.shares -= sharesSold;
      current.costBasis = Math.max(0, current.costBasis - removedBasis);
      portfolioCostBasis = Math.max(0, portfolioCostBasis - removedBasis);
    }
    positions.set(ticker, current);

    const denominator = portfolioCostBasis;
    const unsignedImpact = denominator > 0 ? tradeTotal / denominator : 0;
    projected.push({
      date: trade.date.slice(0, 10),
      action: trade.action,
      ticker,
      impactPct: roundImpact(
        trade.action === "buy" ? unsignedImpact : -unsignedImpact,
      ),
      realizedSign:
        trade.action === "buy"
          ? 0
          : trade.realized_gain === null || trade.realized_gain === 0
            ? 0
            : trade.realized_gain > 0
              ? 1
              : -1,
    });
  }

  return projected.reverse().slice(0, Math.max(0, maxEntries));
}
