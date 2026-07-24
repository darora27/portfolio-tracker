import { describe, expect, it } from "vitest";
import {
  foldContributionsForDisplay,
  forcesMarginaliaCopy,
  rankContributions,
} from "./forces-copy";

describe("Forces copy and selection", () => {
  it("ranks known contributions and omits nulls", () => {
    expect(rankContributions([
      { ticker: "B", contribution: -0.02 },
      { ticker: "UNKNOWN", contribution: null },
      { ticker: "A", contribution: 0.03 },
    ])).toEqual([
      { ticker: "A", contribution: 0.03 },
      { ticker: "B", contribution: -0.02 },
    ]);
  });

  it("describes a clear top and bottom pair", () => {
    expect(forcesMarginaliaCopy([
      { ticker: "MSFT", contribution: 0.012 },
      { ticker: "IBM", contribution: -0.027 },
    ])).toBe(
      "MSFT contributed the most to total return, at +1.2%; IBM weighed on it the most, at -2.7%.",
    );
  });

  it("describes top-only and bottom-only material contributions", () => {
    expect(forcesMarginaliaCopy([
      { ticker: "MSFT", contribution: 0.012 },
      { ticker: "IBM", contribution: -0.0002 },
    ])).toBe("MSFT contributed the most to total return, at +1.2%.");
    expect(forcesMarginaliaCopy([
      { ticker: "MSFT", contribution: 0.0002 },
      { ticker: "IBM", contribution: -0.027 },
    ])).toBe("IBM weighed on the result the most, at -2.7%.");
  });

  it("uses the spread fallback below the materiality threshold", () => {
    expect(forcesMarginaliaCopy([
      { ticker: "MSFT", contribution: 0.0014 },
      { ticker: "IBM", contribution: -0.0014 },
    ])).toBe(
      "Contribution was spread across the portfolio; no single holding stood out.",
    );
    expect(forcesMarginaliaCopy([])).toBeNull();
  });

  it("keeps four rows at each extreme and folds the middle above eight rows", () => {
    const ranked = Array.from({ length: 10 }, (_, index) => ({
      ticker: `T${index}`,
      contribution: 0.05 - index * 0.01,
    }));
    expect(foldContributionsForDisplay(ranked)).toEqual({
      named: [...ranked.slice(0, 4), ...ranked.slice(6)],
      otherSum: ranked[4].contribution + ranked[5].contribution,
    });
    expect(foldContributionsForDisplay(ranked.slice(0, 8))).toEqual({
      named: ranked.slice(0, 8),
      otherSum: null,
    });
  });
});
