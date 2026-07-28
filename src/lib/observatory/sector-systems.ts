import authoredSystem from "../../../systems/observatory-growth.json";
import type { PublicOrreryHolding } from "./orrery";

export type AuthoredSystem = {
  name: string;
  holdings: readonly { ticker: string; weight: number }[];
  trades?: readonly unknown[];
};

export type SectorSystem = {
  slug: string;
  name: string;
  owned: boolean;
  hollowCore: boolean;
  health: number | null;
  holdings: readonly {
    ticker: string;
    weight: number;
    dayReturn: number | null;
    weeklyReturn: number | null;
  }[];
};

export function observedSystemHealth(
  holdings: readonly {
    weight: number;
    dayReturn: number | null;
    weeklyReturn: number | null;
  }[],
): number | null {
  const scored = holdings.flatMap((holding) => {
    const available = [
      holding.dayReturn === null ? null : holding.dayReturn * 0.6,
      holding.weeklyReturn === null ? null : holding.weeklyReturn * 0.4,
    ].filter((value): value is number => value !== null);
    if (!available.length || holding.weight <= 0) return [];
    return [{ weight: holding.weight, score: available.reduce((sum, value) => sum + value, 0) }];
  });
  const denominator = scored.reduce((sum, holding) => sum + holding.weight, 0);
  if (!denominator) return null;
  return scored.reduce(
    (sum, holding) => sum + holding.score * (holding.weight / denominator),
    0,
  );
}

export function hydrateAuthoredSystem(
  system: AuthoredSystem,
  market: readonly PublicOrreryHolding[],
): SectorSystem {
  const marketByTicker = new Map(market.map((holding) => [holding.ticker, holding]));
  const holdings = system.holdings.map((authored) => {
    const observed = marketByTicker.get(authored.ticker);
    return {
      ticker: authored.ticker,
      weight: authored.weight,
      dayReturn: observed?.dayReturn ?? null,
      weeklyReturn: observed?.weeklyReturn ?? null,
    };
  });
  const owned = Boolean(system.trades?.length);
  return {
    slug: system.name.toLowerCase(),
    name: system.name,
    owned,
    hollowCore: !owned,
    health: observedSystemHealth(holdings),
    holdings,
  };
}

export function additionalSectorSystem(
  market: readonly PublicOrreryHolding[],
): SectorSystem {
  return hydrateAuthoredSystem(authoredSystem as AuthoredSystem, market);
}
