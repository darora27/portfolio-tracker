import { describe, expect, it } from "vitest";
import {
  weeklySubline,
  todayLine,
  riskLine,
  containsBannedLanguage,
  pulseLeadCopy,
  pulseDriverCopy,
  windowLabel,
} from "./surface-copy";

describe("weeklySubline", () => {
  it("matches the exact PHASE9.md fixtures", () => {
    expect(weeklySubline({ twr7d: 0.024, voo7d: 0.01 })).toBe("Up 2.4% this week — ahead of the market.");
    expect(weeklySubline({ twr7d: -0.031, voo7d: -0.012 })).toBe("Down 3.1% this week — behind the market.");
    expect(weeklySubline({ twr7d: 0.0009, voo7d: 0.0002 })).toBe("Little changed this week.");
    expect(weeklySubline({ twr7d: 0.012, voo7d: 0.0112 })).toBe("Up 1.2% this week — about even with the market.");
  });

  it("treats the little-changed cutoff as a strict threshold, not inclusive", () => {
    // Just above the (corrected) 0.0015 little-changed threshold, market-even.
    expect(weeklySubline({ twr7d: 0.0016, voo7d: 0.0016 })).toBe("Up 0.2% this week — about even with the market.");
  });

  it("bands the market clause at exactly ±0.0015", () => {
    expect(weeklySubline({ twr7d: 0.02, voo7d: 0.02 - 0.0015 })).toBe("Up 2.0% this week — ahead of the market.");
    expect(weeklySubline({ twr7d: 0.02, voo7d: 0.02 + 0.0015 })).toBe("Up 2.0% this week — behind the market.");
    expect(weeklySubline({ twr7d: 0.02, voo7d: 0.02 + 0.0014 })).toBe(
      "Up 2.0% this week — about even with the market.",
    );
  });
});

describe("todayLine", () => {
  it("same thresholds, 'today' wording, no market clause", () => {
    expect(todayLine({ dayReturn: 0.02 })).toBe("Up 2.0% today.");
    expect(todayLine({ dayReturn: -0.0268 })).toBe("Down 2.7% today.");
    expect(todayLine({ dayReturn: 0.0001 })).toBe("Little changed today.");
  });
});

describe("riskLine", () => {
  it("maps every Phase 8 HHI band edge to the plain-language string", () => {
    expect(riskLine(0)).toBe("Well spread out.");
    expect(riskLine(1499)).toBe("Well spread out.");
    expect(riskLine(1500)).toBe("Moderately concentrated.");
    expect(riskLine(2500)).toBe("Moderately concentrated.");
    expect(riskLine(2501)).toBe("Very concentrated — a few stocks drive most of the movement.");
    expect(riskLine(10000)).toBe("Very concentrated — a few stocks drive most of the movement.");
  });
});

describe("Pulse market-relative copy", () => {
  const availableBenchmark = {
    available: true,
    twrPct: 0.017,
    excessReturnPct: -0.046,
  };

  it("formats the funded-history window deterministically", () => {
    expect(windowLabel("2026-06-24")).toBe("since Jun 24, 2026");
  });

  it("describes a clear lead with a percentage-point gap", () => {
    expect(
      pulseLeadCopy({
        historyDays: 30,
        portfolioTwrPct: 0.071,
        benchmark: { available: true, twrPct: 0.032, excessReturnPct: 0.039 },
        windowLabel: "since Jun 24, 2026",
      }),
    ).toBe(
      "Since Jun 24, 2026, the portfolio is Up 7.1% while VOO is Up 3.2% — a 3.9-point lead over the market.",
    );
  });

  it("describes a clear trailing gap", () => {
    expect(
      pulseLeadCopy({
        historyDays: 30,
        portfolioTwrPct: -0.029,
        benchmark: availableBenchmark,
        windowLabel: "since Jun 24, 2026",
      }),
    ).toBe(
      "Since Jun 24, 2026, the portfolio is Down 2.9% while VOO is Up 1.7% — a 4.6-point gap behind the market.",
    );
  });

  it("uses the established strict epsilon for an effective tie", () => {
    expect(
      pulseLeadCopy({
        historyDays: 30,
        portfolioTwrPct: 0.012,
        benchmark: { available: true, twrPct: 0.011, excessReturnPct: 0.0014 },
        windowLabel: "since Jun 24, 2026",
      }),
    ).toBe("Since Jun 24, 2026, the portfolio is Up 1.2%, about even with VOO.");
  });

  it("uses the exact fallback for short history or an unavailable benchmark", () => {
    const fallback = "Building the market-relative picture — a full comparison needs more trading history.";
    expect(
      pulseLeadCopy({
        historyDays: 13,
        portfolioTwrPct: 0.02,
        benchmark: availableBenchmark,
        windowLabel: "since Jul 12, 2026",
      }),
    ).toBe(fallback);
    expect(
      pulseLeadCopy({
        historyDays: 30,
        portfolioTwrPct: 0.02,
        benchmark: { available: false, twrPct: null, excessReturnPct: null },
        windowLabel: "since Jun 24, 2026",
      }),
    ).toBe(fallback);
  });
});

describe("Pulse driver selection", () => {
  const base = { historyDays: 30, benchmarkAvailable: true };

  it("names one material drag", () => {
    expect(
      pulseDriverCopy({
        ...base,
        gapPct: -0.02,
        positions: [{ ticker: "IBM", contribution: -0.014 }],
      }),
    ).toBe("The largest drag came from IBM.");
  });

  it("sorts and names two drags plus the largest offsetting boost", () => {
    expect(
      pulseDriverCopy({
        ...base,
        gapPct: -0.046,
        positions: [
          { ticker: "INTC", contribution: -0.018 },
          { ticker: "MSFT", contribution: 0.011 },
          { ticker: "IBM", contribution: -0.027 },
          { ticker: "NVDA", contribution: 0.004 },
        ],
      }),
    ).toBe("Most of the shortfall came from IBM and INTC. MSFT offset part of it.");
  });

  it("names one boost when the portfolio leads", () => {
    expect(
      pulseDriverCopy({
        ...base,
        gapPct: 0.03,
        positions: [{ ticker: "MSFT", contribution: 0.024 }],
      }),
    ).toBe("The largest gain came from MSFT.");
  });

  it("does not name positions below the materiality threshold", () => {
    expect(
      pulseDriverCopy({
        ...base,
        gapPct: -0.01,
        positions: [
          { ticker: "IBM", contribution: -0.0014 },
          { ticker: "MSFT", contribution: 0.0014 },
        ],
      }),
    ).toBe("No single holding drove most of the result.");
  });

  it("returns the no-single-holding fallback when the gap direction has no matching cause", () => {
    expect(
      pulseDriverCopy({
        ...base,
        gapPct: -0.02,
        positions: [{ ticker: "MSFT", contribution: 0.01 }],
      }),
    ).toBe("No single holding drove most of the result.");
  });

  it("omits driver copy for insufficient history", () => {
    expect(
      pulseDriverCopy({
        historyDays: 13,
        benchmarkAvailable: true,
        gapPct: -0.02,
        positions: [{ ticker: "IBM", contribution: -0.03 }],
      }),
    ).toBeNull();
  });
});

describe("banned imperative/advice language", () => {
  it("never appears in any weeklySubline, todayLine, or riskLine output", () => {
    const samples = [
      weeklySubline({ twr7d: 0.024, voo7d: 0.01 }),
      weeklySubline({ twr7d: -0.031, voo7d: -0.012 }),
      weeklySubline({ twr7d: 0.0009, voo7d: 0.0002 }),
      weeklySubline({ twr7d: 0.012, voo7d: 0.0112 }),
      weeklySubline({ twr7d: 0.05, voo7d: -0.02 }),
      weeklySubline({ twr7d: -0.05, voo7d: 0.02 }),
      todayLine({ dayReturn: 0.02 }),
      todayLine({ dayReturn: -0.02 }),
      todayLine({ dayReturn: 0.0001 }),
      riskLine(0),
      riskLine(1499),
      riskLine(1500),
      riskLine(2000),
      riskLine(2500),
      riskLine(2501),
      riskLine(10000),
    ];
    for (const s of samples) {
      expect(containsBannedLanguage(s)).toBe(false);
    }
  });

  it("containsBannedLanguage flags a literal banned word as a whole word", () => {
    expect(containsBannedLanguage("You should buy this.")).toBe(true);
    expect(containsBannedLanguage("Consider the risk.")).toBe(true);
  });

  it("containsBannedLanguage does not false-positive on 'recommendations' (allowed in the §5 banner)", () => {
    expect(containsBannedLanguage("Not advice, not predictions, not recommendations.")).toBe(false);
  });
});
