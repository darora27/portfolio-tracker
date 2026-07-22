import type { Trade } from "./holdings";

export type NewTradeInput = {
  date: string;
  ticker: string;
  action: "buy" | "sell";
  shares: number;
  price: number;
  reason: string | null;
};

export type ValidatedTrade = NewTradeInput & {
  total: number;
  realizedGain: number | null;
};

export class TradeValidationError extends Error {}

/**
 * Validates a new trade against existing holdings and computes its total
 * and (for sells) realized gain/loss, using the same average-cost-basis
 * aggregation as computeHoldings (not FIFO lots). Assumes existingTrades
 * predate this one — entering trades out of chronological order will
 * compute cost basis against the full history, not a point-in-time slice.
 */
export function validateNewTrade(existingTrades: Trade[], input: NewTradeInput): ValidatedTrade {
  if (!input.date || Number.isNaN(Date.parse(input.date))) {
    throw new TradeValidationError("Invalid date.");
  }
  if (!input.ticker.trim()) {
    throw new TradeValidationError("Ticker is required.");
  }
  if (!(input.shares > 0)) {
    throw new TradeValidationError("Shares must be positive.");
  }
  if (!(input.price >= 0)) {
    throw new TradeValidationError("Price must be zero or positive.");
  }

  const ticker = input.ticker.trim().toUpperCase();
  const { shares: sharesHeld, costBasis } = existingTrades
    .filter((t) => t.ticker === ticker)
    .reduce(
      (acc, t) => {
        const sign = t.action === "buy" ? 1 : -1;
        return {
          shares: acc.shares + sign * t.shares,
          costBasis: acc.costBasis + sign * t.shares * t.price,
        };
      },
      { shares: 0, costBasis: 0 },
    );

  let realizedGain: number | null = null;
  if (input.action === "sell") {
    if (input.shares > sharesHeld) {
      throw new TradeValidationError(
        `Cannot sell ${input.shares} shares of ${ticker} — only ${sharesHeld} held.`,
      );
    }
    const avgCostPerShare = sharesHeld > 0 ? costBasis / sharesHeld : 0;
    realizedGain = input.shares * (input.price - avgCostPerShare);
  }

  return {
    ...input,
    ticker,
    total: input.shares * input.price,
    realizedGain,
  };
}
