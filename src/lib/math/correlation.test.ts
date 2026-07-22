import { describe, expect, it } from "vitest";
import { correlationMatrix, type ReturnPoint } from "./correlation";

const DATES4 = ["2026-01-01", "2026-01-02", "2026-01-03", "2026-01-04"];
const DATES3 = ["2026-01-01", "2026-01-02", "2026-01-03"];

function series(dates: string[], values: number[]): ReturnPoint[] {
  return dates.map((date, i) => ({ date, r: values[i] }));
}

describe("correlationMatrix", () => {
  it("is exactly 1.0 for corr(A, A) for any non-constant A", () => {
    const { tickers, matrix } = correlationMatrix(
      { A: series(DATES4, [1, 2, 3, 4]) },
      4,
    );
    const i = tickers.indexOf("A");
    expect(matrix[i][i]).toBeCloseTo(1.0, 10);
  });

  it("is exactly 1.0 for a perfectly scaled pair: corr([1,2,3,4], [2,4,6,8])", () => {
    const { tickers, matrix } = correlationMatrix(
      { A: series(DATES4, [1, 2, 3, 4]), B: series(DATES4, [2, 4, 6, 8]) },
      4,
    );
    const i = tickers.indexOf("A");
    const j = tickers.indexOf("B");
    expect(matrix[i][j]).toBeCloseTo(1.0, 10);
  });

  it("is exactly -1.0 for a perfectly inverted pair: corr([1,2,3], [3,2,1])", () => {
    const { tickers, matrix } = correlationMatrix(
      { A: series(DATES3, [1, 2, 3]), B: series(DATES3, [3, 2, 1]) },
      3,
    );
    const i = tickers.indexOf("A");
    const j = tickers.indexOf("B");
    expect(matrix[i][j]).toBeCloseTo(-1.0, 10);
  });

  it("is exactly 0.5 for corr([1,2,3], [1,3,2]) (hand-derived)", () => {
    // deviations (-1,0,1) and (-1,1,0); covariance = ((-1)(-1)+0*1+1*0)/2 = 0.5... but
    // per the spec: covariance 1, each stddev term sqrt(2), corr = 1/(sqrt(2)*sqrt(2)) = 0.5
    const { tickers, matrix } = correlationMatrix(
      { A: series(DATES3, [1, 2, 3]), B: series(DATES3, [1, 3, 2]) },
      3,
    );
    const i = tickers.indexOf("A");
    const j = tickers.indexOf("B");
    expect(matrix[i][j]).toBeCloseTo(0.5, 10);
  });

  it("is null when a pair has fewer than minOverlap shared observations", () => {
    const { tickers, matrix } = correlationMatrix(
      { A: series(DATES3, [1, 2, 3]), B: series(DATES3, [3, 2, 1]) },
      5,
    );
    const i = tickers.indexOf("A");
    const j = tickers.indexOf("B");
    expect(matrix[i][j]).toBeNull();
  });

  it("uses only the dates both tickers share, not a single global date range", () => {
    // A has 5 dates, B only overlaps on 3 of them (its own history starts later) —
    // with minOverlap 3 the pair should still correlate over exactly the 3 shared dates.
    const datesA = ["2026-01-01", "2026-01-02", "2026-01-03", "2026-01-04", "2026-01-05"];
    const datesBOverlap = ["2026-01-03", "2026-01-04", "2026-01-05"];
    const { tickers, matrix } = correlationMatrix(
      {
        A: series(datesA, [1, 2, 3, 4, 5]),
        B: series(datesBOverlap, [10, 20, 30]),
      },
      3,
    );
    const i = tickers.indexOf("A");
    const j = tickers.indexOf("B");
    expect(matrix[i][j]).toBeCloseTo(1.0, 10);
  });

  it("is null for every COST pair when COST has essentially no return history", () => {
    const datesA = ["2026-01-01", "2026-01-02", "2026-01-03", "2026-01-04", "2026-01-05"];
    const { tickers, matrix } = correlationMatrix({
      A: series(datesA, [0.01, -0.02, 0.03, -0.01, 0.02]),
      B: series(datesA, [0.02, -0.01, 0.02, -0.02, 0.01]),
      COST: series(["2026-01-05"], [0]), // bought on the last day — one observation, no overlap >= minOverlap
    });

    const costIndex = tickers.indexOf("COST");
    for (let k = 0; k < tickers.length; k++) {
      expect(matrix[costIndex][k]).toBeNull();
      expect(matrix[k][costIndex]).toBeNull();
    }
  });

  it("is null for a constant (zero-variance) series even with enough overlap", () => {
    const { tickers, matrix } = correlationMatrix(
      { A: series(DATES4, [1, 2, 3, 4]), FLAT: series(DATES4, [5, 5, 5, 5]) },
      4,
    );
    const i = tickers.indexOf("A");
    const j = tickers.indexOf("FLAT");
    expect(matrix[i][j]).toBeNull();
    const flatSelf = tickers.indexOf("FLAT");
    expect(matrix[flatSelf][flatSelf]).toBeNull();
  });
});
