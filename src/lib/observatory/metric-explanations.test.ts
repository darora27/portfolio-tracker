import { describe, expect, it } from "vitest";
import {
  METRIC_EXPLANATION_IDS,
  betaExplanation,
  hhiExplanation,
  maxDrawdownExplanation,
  resolveExplainParam,
  sharpeExplanation,
  sortinoExplanation,
  twrExplanation,
  volatilityExplanation,
  xirrExplanation,
  type MetricExplanation,
} from "./metric-explanations";

const dates = {
  dailyChangeAsOf: "2026-07-23",
  pricesAsOf: "2026-07-23",
};

function assertComplete(explanation: MetricExplanation) {
  expect(explanation.name).not.toBe("");
  expect(explanation.shortLabel).not.toBe("");
  expect(explanation.definition).not.toBe("");
  expect(explanation.currentValue.formatted).not.toBe("");
  expect(explanation.currentValue.asOf).not.toBe("");
  expect(explanation.currentValue.window).not.toBe("");
  expect(explanation.interpretation.summary).not.toBe("");
  expect(["contextual", "limited", "unavailable"]).toContain(
    explanation.interpretation.status,
  );
  expect(explanation.whyItMattersHere).not.toBe("");
  expect(explanation.calculation.formulaLabel).not.toBe("");
  expect(explanation.calculation.inputLabels.length).toBeGreaterThan(0);
  expect(explanation.calculation.methodReference).not.toBe("");
  expect(explanation.sourceFreshness).not.toBe("");
}

const fixtures = [
  twrExplanation({
    ...dates,
    twrPct: -0.029,
    historyDays: 30,
    firstFundedDate: "2026-06-24",
    benchmark: {
      available: true,
      twrPct: 0.017,
      excessReturnPct: -0.046,
    },
  }),
  twrExplanation({
    dailyChangeAsOf: "2026-07-23",
    pricesAsOf: null,
    twrPct: 0,
    historyDays: 8,
    firstFundedDate: null,
    benchmark: { available: false, twrPct: null, excessReturnPct: null },
  }),
  xirrExplanation({ ...dates, xirrPct: 0.1234, historyDays: 120 }),
  xirrExplanation({ ...dates, xirrPct: -0.05, historyDays: 30 }),
  betaExplanation({ ...dates, betaVsVoo: 1.25, historyDays: 120 }),
  betaExplanation({ ...dates, betaVsVoo: null, historyDays: 30 }),
  sharpeExplanation({ ...dates, sharpe: 0.75, historyDays: 120 }),
  sharpeExplanation({ ...dates, sharpe: null, historyDays: 1 }),
  sortinoExplanation({ ...dates, sortinoRatio: 1.2, historyDays: 120 }),
  sortinoExplanation({ ...dates, sortinoRatio: null, historyDays: 20 }),
  volatilityExplanation({
    ...dates,
    volatilityPct: 0.184,
    historyDays: 120,
  }),
  volatilityExplanation({
    ...dates,
    volatilityPct: null,
    historyDays: 1,
  }),
  maxDrawdownExplanation({
    ...dates,
    maxDrawdown: -0.123,
    historyDays: 120,
  }),
  maxDrawdownExplanation({ ...dates, maxDrawdown: 0, historyDays: 1 }),
  hhiExplanation({
    ...dates,
    hhi: 3000,
    top2ConcentrationPct: 0.73,
    positions: [
      { ticker: "IBM", weight: 0.42 },
      { ticker: "MSFT", weight: 0.31 },
    ],
  }),
  hhiExplanation({
    ...dates,
    hhi: 0,
    top2ConcentrationPct: 0,
    positions: [],
  }),
];

describe("metric explanation content model", () => {
  it("validates explain query values without choosing a default", () => {
    expect(resolveExplainParam("twr")).toBe("twr");
    expect(resolveExplainParam(["hhi", "twr"])).toBe("hhi");
    expect(resolveExplainParam("alpha")).toBeUndefined();
    expect(resolveExplainParam(undefined)).toBeUndefined();
  });

  it("covers every supported id with two complete deterministic fixtures", () => {
    expect(fixtures.map((item) => item.id)).toEqual(
      METRIC_EXPLANATION_IDS.flatMap((id) => [id, id]),
    );
    fixtures.forEach(assertComplete);
  });

  it("formats TWR and its short-history/unavailable benchmark state exactly", () => {
    expect(fixtures[0].currentValue.formatted).toBe("-2.90%");
    expect(fixtures[0].currentValue.window).toBe("since Jun 24, 2026");
    expect(fixtures[0].interpretation.status).toBe("contextual");
    expect(fixtures[0].interpretation.evidence).toEqual([
      "Excess return vs. VOO: -4.60%.",
    ]);
    expect(fixtures[1].interpretation.status).toBe("limited");
    expect(fixtures[1].interpretation.evidence).toEqual([]);
    expect(fixtures[1].sourceFreshness).toBe(
      "Prices as of Jul 23, 2026. The latest source is currently stale.",
    );
  });

  it("formats XIRR and warns on short annualization exactly", () => {
    expect(fixtures[2].currentValue.formatted).toBe("+12.34%");
    expect(fixtures[2].interpretation.status).toBe("contextual");
    expect(fixtures[2].limitations).toEqual([]);
    expect(fixtures[3].currentValue.formatted).toBe("-5.00%");
    expect(fixtures[3].interpretation.status).toBe("limited");
    expect(fixtures[3].limitations).toEqual([
      "Only 30d of history — annualizing a short window can be noisy.",
    ]);
  });

  it("formats Beta, Sharpe, Sortino, and Volatility normal/null states exactly", () => {
    expect(fixtures[4].currentValue.formatted).toBe("1.25");
    expect(fixtures[5].interpretation.status).toBe("unavailable");
    expect(fixtures[5].limitations).toEqual([
      "Needs a full-history VOO benchmark match.",
    ]);
    expect(fixtures[6].currentValue.formatted).toBe("0.75");
    expect(fixtures[7].limitations).toEqual([
      "Needs at least 2 daily returns.",
    ]);
    expect(fixtures[8].currentValue.formatted).toBe("1.20");
    expect(fixtures[9].limitations).toEqual([
      "No losing days recorded yet to measure downside risk.",
    ]);
    expect(fixtures[10].currentValue.formatted).toBe("18.4%");
    expect(fixtures[11].interpretation.status).toBe("unavailable");
  });

  it("formats drawdown and HHI edge evidence exactly", () => {
    expect(fixtures[12].currentValue.formatted).toBe("-12.3%");
    expect(fixtures[13].currentValue.formatted).toBe("0.0%");
    expect(fixtures[13].interpretation.status).toBe("contextual");
    expect(fixtures[14].currentValue.formatted).toBe("3000");
    expect(fixtures[14].interpretation.evidence).toEqual([
      "IBM is the largest position at 42.0%.",
      "Top two positions: 73.0% combined.",
    ]);
    expect(fixtures[15].interpretation.evidence).toEqual([]);
  });

  it("contains no advisory language across any content layer", () => {
    const banned = /\b(buy|sell|should|recommend|advice|advise)\b/i;
    for (const explanation of fixtures) {
      expect(JSON.stringify(explanation)).not.toMatch(banned);
    }
  });
});
