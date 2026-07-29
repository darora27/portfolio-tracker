export const DRAFT_TOTAL_UNITS = 200;
export const DRAFT_HOLDING_COUNT = 8;

export type DraftUnits = readonly number[];

function assertRoster(units: DraftUnits): void {
  if (
    units.length !== DRAFT_HOLDING_COUNT ||
    units.some((unit) => !Number.isInteger(unit) || unit < 0) ||
    units.reduce((sum, unit) => sum + unit, 0) !== DRAFT_TOTAL_UNITS
  ) {
    throw new RangeError(
      `Draft ledger must contain ${DRAFT_HOLDING_COUNT} non-negative integer weights totaling ${DRAFT_TOTAL_UNITS}.`,
    );
  }
}

function distributeLargestRemainder(
  weights: readonly number[],
  total: number,
): number[] {
  if (!Number.isInteger(total) || total < 0) {
    throw new RangeError("Draft redistribution total must be a non-negative integer.");
  }
  if (weights.length === 0) return [];
  const positive = weights.map((weight) =>
    Number.isFinite(weight) ? Math.max(0, weight) : 0
  );
  const weightTotal = positive.reduce((sum, weight) => sum + weight, 0);
  if (weightTotal === 0) {
    const quotient = Math.floor(total / positive.length);
    let remainder = total - quotient * positive.length;
    return positive.map(() => quotient + (remainder-- > 0 ? 1 : 0));
  }
  const exact = positive.map((weight) => (weight / weightTotal) * total);
  const rounded = exact.map(Math.floor);
  let remainder = total - rounded.reduce((sum, value) => sum + value, 0);
  const order = exact
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort(
      (left, right) =>
        right.fraction - left.fraction || left.index - right.index,
    );
  for (let index = 0; index < remainder; index += 1) {
    rounded[order[index % order.length].index] += 1;
  }
  return rounded;
}

export function draftUnitsFromWeights(weights: readonly number[]): number[] {
  if (weights.length !== DRAFT_HOLDING_COUNT) {
    throw new RangeError(
      `Draft book requires exactly ${DRAFT_HOLDING_COUNT} holdings.`,
    );
  }
  return distributeLargestRemainder(weights, DRAFT_TOTAL_UNITS);
}

export function setDraftWeightProRata(
  base: DraftUnits,
  holdingIndex: number,
  requestedUnits: number,
): number[] {
  assertRoster(base);
  if (holdingIndex < 0 || holdingIndex >= base.length) {
    throw new RangeError("Draft holding index is outside the fixed roster.");
  }
  const target = Math.min(
    DRAFT_TOTAL_UNITS,
    Math.max(0, Math.round(requestedUnits)),
  );
  const remaining = DRAFT_TOTAL_UNITS - target;
  const otherIndexes = base
    .map((_, index) => index)
    .filter((index) => index !== holdingIndex);
  const redistributed = distributeLargestRemainder(
    otherIndexes.map((index) => base[index]),
    remaining,
  );
  const next = base.slice();
  next[holdingIndex] = target;
  otherIndexes.forEach((index, offset) => {
    next[index] = redistributed[offset];
  });
  assertRoster(next);
  return next;
}

export function setDraftWeightSiphon(
  base: DraftUnits,
  holdingIndex: number,
  requestedUnits: number,
  counterpartyIndex: number,
): number[] {
  assertRoster(base);
  if (
    holdingIndex < 0 ||
    holdingIndex >= base.length ||
    counterpartyIndex < 0 ||
    counterpartyIndex >= base.length ||
    holdingIndex === counterpartyIndex
  ) {
    throw new RangeError("Draft siphon requires two different roster holdings.");
  }
  const minimum = 0;
  const maximum = Math.min(
    DRAFT_TOTAL_UNITS,
    base[holdingIndex] + base[counterpartyIndex],
  );
  const target = Math.min(
    maximum,
    Math.max(minimum, Math.round(requestedUnits)),
  );
  const next = base.slice();
  const delta = target - base[holdingIndex];
  next[holdingIndex] = target;
  next[counterpartyIndex] = base[counterpartyIndex] - delta;
  assertRoster(next);
  return next;
}

export function adjustDraftWeight(
  base: DraftUnits,
  holdingIndex: number,
  deltaUnits: number,
  counterpartyIndex: number | null = null,
): number[] {
  const target = base[holdingIndex] + Math.round(deltaUnits);
  return counterpartyIndex === null || counterpartyIndex === holdingIndex
    ? setDraftWeightProRata(base, holdingIndex, target)
    : setDraftWeightSiphon(base, holdingIndex, target, counterpartyIndex);
}

export function encodeDraftUnits(units: DraftUnits): string {
  assertRoster(units);
  return units.join(".");
}

export function decodeDraftUnits(value: string | null | undefined): number[] | null {
  if (!value) return null;
  const units = value.split(".").map(Number);
  try {
    assertRoster(units);
    return units;
  } catch {
    return null;
  }
}

export function draftWeightPercent(unit: number): number {
  return unit / 2;
}
