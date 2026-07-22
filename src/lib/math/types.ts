export type DailySnapshot = {
  /** ISO date (YYYY-MM-DD). `snapshots` arrays must be sorted ascending by date. */
  date: string;
  totalCost: number;
  totalValue: number;
};

export type CashFlow = {
  /** ISO date (YYYY-MM-DD). */
  date: string;
  /** Negative for outflows (buys), positive for inflows (sells, final valuation). */
  amount: number;
};
