import { describe, expect, it } from "vitest";
import {
  additionalSectorSystem,
  hydrateAuthoredSystem,
  observedSystemHealth,
} from "./sector-systems";

const market = [
  { ticker: "MSFT", companyName: "Microsoft", weight: 0.5, dayReturn: 0.02, weeklyReturn: 0.04, portfolioRelativeReturn: 0, volatilityPct: 0.2, betaVsVoo: 1 },
  { ticker: "GOOG", companyName: "Alphabet", weight: 0.3, dayReturn: -0.01, weeklyReturn: 0.02, portfolioRelativeReturn: 0, volatilityPct: 0.2, betaVsVoo: 1 },
  { ticker: "ASML", companyName: "ASML", weight: 0.2, dayReturn: null, weeklyReturn: null, portfolioRelativeReturn: null, volatilityPct: null, betaVsVoo: null },
];

describe("sector systems", () => {
  it("derives observed health from available weighted day/week inputs", () => {
    expect(observedSystemHealth([
      { weight: 0.75, dayReturn: 0.02, weeklyReturn: 0.04 },
      { weight: 0.25, dayReturn: -0.02, weeklyReturn: 0 },
    ])).toBeCloseTo(0.018, 8);
    expect(observedSystemHealth([{ weight: 1, dayReturn: null, weeklyReturn: null }])).toBeNull();
  });

  it("marks a weight-only authored system hollow and never invents TWR", () => {
    const system = additionalSectorSystem(market);
    expect(system.owned).toBe(false);
    expect(system.hollowCore).toBe(true);
    expect(system).not.toHaveProperty("twr");
  });

  it("uses a solid core only when authored trade history exists", () => {
    expect(hydrateAuthoredSystem({
      name: "OWNED",
      holdings: [{ ticker: "MSFT", weight: 1 }],
      trades: [{}],
    }, market).hollowCore).toBe(false);
  });
});
