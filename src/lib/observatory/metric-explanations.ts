import {
  formatDate,
  formatNumber,
  formatPercent,
  formatSignedPercent,
} from "@/lib/format";
import { riskLine, windowLabel } from "@/lib/surface-copy";

export type MetricExplanationId =
  | "twr"
  | "xirr"
  | "beta"
  | "sharpe"
  | "sortino"
  | "volatility"
  | "max-drawdown"
  | "hhi";

export type MetricExplanation = {
  id: MetricExplanationId;
  name: string;
  shortLabel: string;
  category: "performance" | "risk" | "market-relative" | "cash-flow";
  definition: string;
  currentValue: {
    raw: number | null;
    formatted: string;
    asOf: string;
    window: string;
  };
  interpretation: {
    summary: string;
    evidence: string[];
    status: "contextual" | "limited" | "unavailable";
  };
  whyItMattersHere: string;
  limitations: string[];
  calculation: {
    formulaLabel: string;
    inputLabels: string[];
    methodReference: string;
  };
  sourceFreshness: string;
};

export const METRIC_EXPLANATION_IDS: readonly MetricExplanationId[] = [
  "twr",
  "xirr",
  "beta",
  "sharpe",
  "sortino",
  "volatility",
  "max-drawdown",
  "hhi",
] as const;

export function isMetricExplanationId(
  value: string,
): value is MetricExplanationId {
  return (METRIC_EXPLANATION_IDS as readonly string[]).includes(value);
}

export function resolveExplainParam(
  raw: string | string[] | undefined,
): MetricExplanationId | undefined {
  const slug = Array.isArray(raw) ? raw[0] : raw;
  return slug !== undefined && isMetricExplanationId(slug) ? slug : undefined;
}

export const METRIC_SHORT_HISTORY_DAYS = 90;

function freshnessLine(
  dailyChangeAsOf: string,
  pricesAsOf: string | null,
): string {
  const base = `Prices as of ${formatDate(dailyChangeAsOf)}.`;
  return pricesAsOf === null
    ? `${base} The latest source is currently stale.`
    : base;
}

export function twrExplanation(input: {
  twrPct: number;
  historyDays: number;
  firstFundedDate: string | null;
  dailyChangeAsOf: string;
  pricesAsOf: string | null;
  benchmark: {
    available: boolean;
    twrPct: number | null;
    excessReturnPct: number | null;
  };
}): MetricExplanation {
  const evidence =
    input.benchmark.available && input.benchmark.excessReturnPct !== null
      ? [
          `Excess return vs. VOO: ${formatSignedPercent(
            input.benchmark.excessReturnPct,
            2,
          )}.`,
        ]
      : [];

  return {
    id: "twr",
    name: "Time-weighted return",
    shortLabel: "TWR",
    category: "performance",
    definition:
      "Time-weighted return chains each funded day's return into one portfolio result, removing the effect of deposits and withdrawals.",
    currentValue: {
      raw: input.twrPct,
      formatted: formatSignedPercent(input.twrPct, 2),
      window: input.firstFundedDate
        ? windowLabel(input.firstFundedDate)
        : "since the first funded snapshot",
      asOf: formatDate(input.dailyChangeAsOf),
    },
    interpretation: {
      status: input.historyDays < 14 ? "limited" : "contextual",
      summary:
        input.benchmark.available && input.benchmark.twrPct !== null
          ? `Portfolio TWR is compared with VOO TWR over the identical funded-history window; VOO is currently at ${formatSignedPercent(input.benchmark.twrPct, 2)}.`
          : "Portfolio TWR is compared with VOO TWR only over an identical funded-history window; VOO is currently unavailable for a complete same-period comparison.",
      evidence,
    },
    whyItMattersHere:
      "A same-day deposit would otherwise look like investment performance, even though it is new capital rather than a gain — TWR keeps the two separate.",
    limitations: [
      `TWR-versus-benchmark comparisons under 14 days of history are unreliable. This view currently has ${input.historyDays} days of history.`,
    ],
    calculation: {
      formulaLabel: "Chained daily returns",
      inputLabels: ["Daily net-of-flow returns"],
      methodReference:
        "r_t = (V_t − F_t) / V_{t−1} − 1, chained as (1+r_1)×(1+r_2)×...−1 (CLAUDE.md financial math rules).",
    },
    sourceFreshness: freshnessLine(
      input.dailyChangeAsOf,
      input.pricesAsOf,
    ),
  };
}

export function xirrExplanation(input: {
  xirrPct: number;
  historyDays: number;
  dailyChangeAsOf: string;
  pricesAsOf: string | null;
}): MetricExplanation {
  const limited = input.historyDays < METRIC_SHORT_HISTORY_DAYS;
  return {
    id: "xirr",
    name: "XIRR (annualized return)",
    shortLabel: "XIRR",
    category: "performance",
    definition:
      "XIRR is the annualized, money-weighted return implied by every cash flow's exact date and size, plus today's value as a final flow.",
    currentValue: {
      raw: input.xirrPct,
      formatted: formatSignedPercent(input.xirrPct, 2),
      window: "annualized, money-weighted",
      asOf: formatDate(input.dailyChangeAsOf),
    },
    interpretation: {
      status: limited ? "limited" : "contextual",
      summary:
        "Unlike TWR, XIRR is sensitive to when money was added or withdrawn — a large recent deposit can swing it sharply even if the underlying investments haven't moved much.",
      evidence: [],
    },
    whyItMattersHere:
      "XIRR states the portfolio's return the way an annualized personal rate of return is usually understood, accounting for exactly when capital moved.",
    limitations: limited
      ? [
          `Only ${input.historyDays}d of history — annualizing a short window can be noisy.`,
        ]
      : [],
    calculation: {
      formulaLabel: "Signed cash flows solved for a constant annual rate",
      inputLabels: [
        "Trade dates and signed amounts",
        "Current total value as a final flow",
      ],
      methodReference:
        "Newton-Raphson with bisection fallback on the cash-flow NPV equation (src/lib/math/xirr.ts).",
    },
    sourceFreshness: freshnessLine(
      input.dailyChangeAsOf,
      input.pricesAsOf,
    ),
  };
}

export function betaExplanation(input: {
  betaVsVoo: number | null;
  historyDays: number;
  dailyChangeAsOf: string;
  pricesAsOf: string | null;
}): MetricExplanation {
  let summary = "";
  if (input.betaVsVoo === null) {
    summary =
      "Beta needs a full-history VOO benchmark match to compute — it isn't available yet.";
  } else if (input.betaVsVoo > 1) {
    summary = "The portfolio has historically moved more than VOO.";
  } else if (input.betaVsVoo > 0) {
    summary = "The portfolio has historically moved less than VOO.";
  } else {
    summary =
      "The portfolio has historically moved opposite to or independently of VOO.";
  }

  return {
    id: "beta",
    name: "Beta vs. VOO",
    shortLabel: "Beta",
    category: "market-relative",
    definition:
      "Beta measures how much the portfolio has historically moved for each 1% move in VOO, over the same funded-history window.",
    currentValue: {
      raw: input.betaVsVoo,
      formatted:
        input.betaVsVoo !== null ? formatNumber(input.betaVsVoo) : "—",
      window: "vs. VOO, full funded history",
      asOf: formatDate(input.dailyChangeAsOf),
    },
    interpretation: {
      status:
        input.betaVsVoo === null
          ? "unavailable"
          : input.historyDays < METRIC_SHORT_HISTORY_DAYS
            ? "limited"
            : "contextual",
      summary,
      evidence: [],
    },
    whyItMattersHere:
      "Beta names how much of the portfolio's own movement is explained by the broader market it's benchmarked against.",
    limitations:
      input.betaVsVoo === null
        ? ["Needs a full-history VOO benchmark match."]
        : input.historyDays < METRIC_SHORT_HISTORY_DAYS
          ? [
              `Only ${input.historyDays}d of history — the estimate may be unstable.`,
            ]
          : [],
    calculation: {
      formulaLabel: "Covariance with VOO, divided by VOO's variance",
      inputLabels: ["Portfolio daily returns", "VOO daily returns"],
      methodReference:
        "beta = Cov(portfolio, VOO) / Var(VOO) (src/lib/math/beta.ts).",
    },
    sourceFreshness: freshnessLine(
      input.dailyChangeAsOf,
      input.pricesAsOf,
    ),
  };
}

export function sharpeExplanation(input: {
  sharpe: number | null;
  historyDays: number;
  dailyChangeAsOf: string;
  pricesAsOf: string | null;
}): MetricExplanation {
  return {
    id: "sharpe",
    name: "Sharpe ratio",
    shortLabel: "Sharpe",
    category: "risk",
    definition:
      "Sharpe ratio measures annualized return earned per unit of volatility, using a 0% risk-free rate.",
    currentValue: {
      raw: input.sharpe,
      formatted: input.sharpe !== null ? formatNumber(input.sharpe) : "—",
      window: "annualized",
      asOf: formatDate(input.dailyChangeAsOf),
    },
    interpretation: {
      status:
        input.sharpe === null
          ? "unavailable"
          : input.historyDays < METRIC_SHORT_HISTORY_DAYS
            ? "limited"
            : "contextual",
      summary:
        input.sharpe === null
          ? "Sharpe needs at least two daily returns with non-zero volatility to compute."
          : "A higher Sharpe ratio means more return was earned for the volatility taken on.",
      evidence: [],
    },
    whyItMattersHere:
      "Sharpe puts the portfolio's return in the context of how much it moved to get there, rather than looking at return alone.",
    limitations:
      input.sharpe === null
        ? ["Needs at least 2 daily returns."]
        : input.historyDays < METRIC_SHORT_HISTORY_DAYS
          ? ["Short samples can make this ratio noisy."]
          : [],
    calculation: {
      formulaLabel: "Annualized excess return over annualized volatility",
      inputLabels: ["Daily net-of-flow returns", "Risk-free rate (0%)"],
      methodReference:
        "(mean(daily returns) × 252 − riskFreeRate) / annualizedVolatility (src/lib/math/sharpe.ts).",
    },
    sourceFreshness: freshnessLine(
      input.dailyChangeAsOf,
      input.pricesAsOf,
    ),
  };
}

export function sortinoExplanation(input: {
  sortinoRatio: number | null;
  historyDays: number;
  dailyChangeAsOf: string;
  pricesAsOf: string | null;
}): MetricExplanation {
  return {
    id: "sortino",
    name: "Sortino ratio",
    shortLabel: "Sortino",
    category: "risk",
    definition:
      "Sortino ratio measures annualized return earned per unit of downside volatility only — days below a 4% annual minimum acceptable return.",
    currentValue: {
      raw: input.sortinoRatio,
      formatted:
        input.sortinoRatio !== null
          ? formatNumber(input.sortinoRatio)
          : "—",
      window: "annualized",
      asOf: formatDate(input.dailyChangeAsOf),
    },
    interpretation: {
      status:
        input.sortinoRatio === null
          ? "unavailable"
          : input.historyDays < METRIC_SHORT_HISTORY_DAYS
            ? "limited"
            : "contextual",
      summary:
        input.sortinoRatio === null
          ? "Sortino needs at least one losing day recorded to measure downside risk."
          : "Unlike Sharpe, Sortino only penalizes downside moves, not upside volatility.",
      evidence: [],
    },
    whyItMattersHere:
      "Sortino answers the same question as Sharpe but doesn't treat a strong up day as risk, which can matter for a concentrated or growth-leaning portfolio.",
    limitations:
      input.sortinoRatio === null
        ? ["No losing days recorded yet to measure downside risk."]
        : input.historyDays < METRIC_SHORT_HISTORY_DAYS
          ? ["Short samples can make this ratio noisy."]
          : [],
    calculation: {
      formulaLabel:
        "Annualized excess return over annualized downside deviation",
      inputLabels: [
        "Daily net-of-flow returns",
        "Minimum acceptable return (4%/yr)",
      ],
      methodReference:
        "(mean(daily returns) × 252 − 4%) / (downsideDeviation × √252) (src/lib/math/daily-stats.ts).",
    },
    sourceFreshness: freshnessLine(
      input.dailyChangeAsOf,
      input.pricesAsOf,
    ),
  };
}

export function volatilityExplanation(input: {
  volatilityPct: number | null;
  historyDays: number;
  dailyChangeAsOf: string;
  pricesAsOf: string | null;
}): MetricExplanation {
  return {
    id: "volatility",
    name: "Volatility (annualized)",
    shortLabel: "Volatility",
    category: "risk",
    definition:
      "Annualized volatility measures how much daily returns have varied — the spread of outcomes, not a prediction of loss.",
    currentValue: {
      raw: input.volatilityPct,
      formatted:
        input.volatilityPct !== null
          ? formatPercent(input.volatilityPct, 1)
          : "—",
      window: "annualized",
      asOf: formatDate(input.dailyChangeAsOf),
    },
    interpretation: {
      status:
        input.volatilityPct === null
          ? "unavailable"
          : input.historyDays < METRIC_SHORT_HISTORY_DAYS
            ? "limited"
            : "contextual",
      summary:
        input.volatilityPct === null
          ? "Volatility needs at least two daily returns to compute a standard deviation."
          : "This is variability, not permanent loss — a high number means the path moved more, not that value was necessarily lost.",
      evidence: [],
    },
    whyItMattersHere:
      "Volatility gives Sharpe and Sortino their denominator, and on its own describes how bumpy the ride has been.",
    limitations:
      input.volatilityPct === null
        ? ["Needs at least 2 daily returns."]
        : input.historyDays < METRIC_SHORT_HISTORY_DAYS
          ? [
              `Only ${input.historyDays}d of history — the estimate may understate typical variability.`,
            ]
          : [],
    calculation: {
      formulaLabel:
        "Sample standard deviation of daily returns, annualized",
      inputLabels: ["Daily net-of-flow returns"],
      methodReference:
        "sampleStdDev(daily returns) × √252 (src/lib/math/volatility.ts).",
    },
    sourceFreshness: freshnessLine(
      input.dailyChangeAsOf,
      input.pricesAsOf,
    ),
  };
}

export function maxDrawdownExplanation(input: {
  maxDrawdown: number;
  historyDays: number;
  dailyChangeAsOf: string;
  pricesAsOf: string | null;
}): MetricExplanation {
  return {
    id: "max-drawdown",
    name: "Max drawdown",
    shortLabel: "Max drawdown",
    category: "risk",
    definition:
      "Max drawdown is the largest peak-to-trough decline in the portfolio's funded-history value curve.",
    currentValue: {
      raw: input.maxDrawdown,
      formatted: formatSignedPercent(input.maxDrawdown, 1),
      window: "peak-to-trough, full funded history",
      asOf: formatDate(input.dailyChangeAsOf),
    },
    interpretation: {
      status: "contextual",
      summary:
        input.maxDrawdown === 0
          ? "The portfolio has not recorded a decline from a prior peak yet."
          : "This measures the worst point-to-point decline recorded, not the current distance from a peak.",
      evidence: [],
    },
    whyItMattersHere:
      "Max drawdown names the deepest decline actually experienced, which return and volatility alone don't show.",
    limitations: [
      "A short history may not yet include the portfolio's largest possible decline.",
    ],
    calculation: {
      formulaLabel:
        "Running peak-to-current decline of a chained growth index",
      inputLabels: ["Daily net-of-flow returns"],
      methodReference:
        "index_t = index_{t-1} × (1+r_t), maxDrawdown = min(index_t / peak_t − 1) (src/lib/math/drawdown.ts).",
    },
    sourceFreshness: freshnessLine(
      input.dailyChangeAsOf,
      input.pricesAsOf,
    ),
  };
}

export function hhiExplanation(input: {
  hhi: number;
  top2ConcentrationPct: number;
  positions: { ticker: string; weight: number }[];
  dailyChangeAsOf: string;
  pricesAsOf: string | null;
}): MetricExplanation {
  const evidence: string[] = [];
  if (input.positions[0]) {
    evidence.push(
      `${input.positions[0].ticker} is the largest position at ${formatPercent(input.positions[0].weight, 1)}.`,
    );
  }
  if (input.positions[1]) {
    evidence.push(
      `Top two positions: ${formatPercent(input.top2ConcentrationPct, 1)} combined.`,
    );
  }

  return {
    id: "hhi",
    name: "Herfindahl-Hirschman Index (concentration)",
    shortLabel: "HHI",
    category: "risk",
    definition:
      "HHI sums the squared weight of every holding (0-10000 scale) to measure how concentrated the portfolio is in its largest positions.",
    currentValue: {
      raw: input.hhi,
      formatted: formatNumber(input.hhi, 0),
      window: "current holdings",
      asOf: formatDate(input.dailyChangeAsOf),
    },
    interpretation: {
      status: "contextual",
      summary: riskLine(input.hhi),
      evidence,
    },
    whyItMattersHere:
      "A concentrated portfolio's total return depends heavily on a small number of holdings — HHI names how concentrated, in one comparable number.",
    limitations: [
      "HHI describes current weights only — it says nothing about correlation between the holdings themselves.",
    ],
    calculation: {
      formulaLabel: "Sum of each holding's squared portfolio weight, ×10000",
      inputLabels: ["Current holding weights"],
      methodReference:
        "HHI = Σ(weight_i²) × 10000 (src/lib/portfolio/holdings.ts).",
    },
    sourceFreshness: freshnessLine(
      input.dailyChangeAsOf,
      input.pricesAsOf,
    ),
  };
}
