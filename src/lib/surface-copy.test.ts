import { describe, expect, it } from "vitest";
import { weeklySubline, todayLine, riskLine, containsBannedLanguage } from "./surface-copy";

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
