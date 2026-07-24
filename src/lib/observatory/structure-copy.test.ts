import { describe, expect, it } from "vitest";
import {
  mostCorrelatedPair,
  structureConcentrationCopy,
} from "./structure-copy";

describe("Structure copy and correlation selection", () => {
  it("uses the existing HHI language in every band", () => {
    expect(structureConcentrationCopy(1200, 0.42)).toBe(
      "Well spread out. The top two holdings make up 42.0% of the portfolio.",
    );
    expect(structureConcentrationCopy(1800, 0.55)).toBe(
      "Moderately concentrated. The top two holdings make up 55.0% of the portfolio.",
    );
    expect(structureConcentrationCopy(2800, 0.7)).toBe(
      "Very concentrated — a few stocks drive most of the movement. The top two holdings make up 70.0% of the portfolio.",
    );
  });

  it("returns null when every off-diagonal cell is null", () => {
    expect(mostCorrelatedPair(
      ["A", "B"],
      [[1, null], [null, 1]],
    )).toBeNull();
  });

  it("returns the highest unique off-diagonal pair", () => {
    expect(mostCorrelatedPair(
      ["A", "B", "C"],
      [
        [1, 0.35, 0.82],
        [0.35, 1, 0.64],
        [0.82, 0.64, 1],
      ],
    )).toEqual({ a: "A", b: "C", correlation: 0.82 });
  });
});
