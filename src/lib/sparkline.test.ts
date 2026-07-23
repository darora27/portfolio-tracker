import { describe, expect, it } from "vitest";
import { sparklineGeometry } from "./sparkline";

describe("sparklineGeometry", () => {
  it("draws a full-width flat line for a single point (regression: a lone coordinate pair produces no visible polyline)", () => {
    const { coords, isFlat } = sparklineGeometry([925], 96, 28, 2);
    expect(isFlat).toBe(true);
    expect(coords).toBe("2,14 94,14");
  });

  it("draws a full-width flat line when every value is equal", () => {
    const { coords, isFlat } = sparklineGeometry([100, 100, 100], 96, 28, 2);
    expect(isFlat).toBe(true);
    expect(coords).toBe("2,14 94,14");
  });

  it("normalizes a rising series so the last point is higher (lower y) than the first", () => {
    const { coords, isFlat } = sparklineGeometry([10, 20, 30], 96, 28, 2);
    expect(isFlat).toBe(false);
    const [first, , last] = coords.split(" ").map((pair) => pair.split(",").map(Number));
    expect(last[1]).toBeLessThan(first[1]);
  });

  it("spans the full padded width across all points", () => {
    const { coords } = sparklineGeometry([1, 5, 2, 8], 100, 40, 2);
    const xs = coords.split(" ").map((pair) => Number(pair.split(",")[0]));
    expect(xs[0]).toBe(2);
    expect(xs.at(-1)).toBe(98);
  });
});
