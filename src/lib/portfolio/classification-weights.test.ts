import { describe, expect, it } from "vitest";
import { classificationWeights } from "./classification-weights";

describe("classificationWeights", () => {
  it("groups position value by label and weights against the total", () => {
    const positions = [
      { ticker: "ASML", value: 400 },
      { ticker: "INTC", value: 300 },
      { ticker: "GOOG", value: 300 },
    ];
    const labelByTicker = new Map([
      ["ASML", "Semiconductors"],
      ["INTC", "Semiconductors"],
      ["GOOG", "Communication Services"],
    ]);

    const result = classificationWeights(positions, labelByTicker);
    expect(result).toEqual([
      { label: "Semiconductors", weight: 0.7 },
      { label: "Communication Services", weight: 0.3 },
    ]);
  });

  it("groups unmapped tickers under Unclassified rather than dropping them", () => {
    const positions = [
      { ticker: "ASML", value: 500 },
      { ticker: "COST", value: 500 },
    ];
    const labelByTicker = new Map([["ASML", "Semiconductors"]]);

    const result = classificationWeights(positions, labelByTicker);
    expect(result).toContainEqual({ label: "Unclassified", weight: 0.5 });
  });

  it("returns an empty array for zero total value without dividing by zero", () => {
    const result = classificationWeights([{ ticker: "X", value: 0 }], new Map());
    expect(result).toEqual([{ label: "Unclassified", weight: 0 }]);
  });
});
