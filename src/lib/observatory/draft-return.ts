import { DRAFT_TOTAL_UNITS, type DraftUnits } from "./draft-ledger";

export function mixHeldReturn(
  units: DraftUnits,
  holdingReturns: readonly number[],
): number {
  if (units.length !== holdingReturns.length) {
    throw new RangeError("Draft weights and holding returns must share a roster.");
  }
  if (units.reduce((sum, unit) => sum + unit, 0) !== DRAFT_TOTAL_UNITS) {
    throw new RangeError("Draft weights must total 100.0% before return math.");
  }
  return units.reduce(
    (sum, unit, index) => sum + (unit / DRAFT_TOTAL_UNITS) * holdingReturns[index],
    0,
  );
}

export function draftConcentration(units: DraftUnits): {
  topTwoPct: number;
  hhi: number;
} {
  const weights = units.map((unit) => unit / DRAFT_TOTAL_UNITS);
  const topTwoPct =
    [...weights].sort((left, right) => right - left).slice(0, 2)
      .reduce((sum, weight) => sum + weight, 0) * 100;
  const hhi = Math.round(
    weights.reduce((sum, weight) => sum + weight * weight, 0) * 10_000,
  );
  return { topTwoPct, hhi };
}

export function draftTurnover(
  units: DraftUnits,
  realUnits: DraftUnits,
): number {
  if (units.length !== realUnits.length) {
    throw new RangeError("Draft and real books must share a roster.");
  }
  return units.reduce(
    (sum, unit, index) => sum + Math.abs(unit - realUnits[index]),
    0,
  ) / 4;
}
