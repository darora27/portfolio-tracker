export type ClassificationWeight = { label: string; weight: number };

/**
 * Position value summed by classification label (sector, AI-exposure
 * level, etc.) divided by total value, sorted descending. Any ticker
 * missing from `labelByTicker` falls into "Unclassified" — shown plainly
 * rather than silently dropped, per the spec's "visibly, never silently
 * omitted" rule.
 */
export function classificationWeights(
  positions: { ticker: string; value: number }[],
  labelByTicker: Map<string, string>,
): ClassificationWeight[] {
  const totalValue = positions.reduce((sum, p) => sum + p.value, 0);
  const valueByLabel = new Map<string, number>();
  for (const p of positions) {
    const label = labelByTicker.get(p.ticker) ?? "Unclassified";
    valueByLabel.set(label, (valueByLabel.get(label) ?? 0) + p.value);
  }
  return [...valueByLabel.entries()]
    .map(([label, value]) => ({ label, weight: totalValue > 0 ? value / totalValue : 0 }))
    .sort((a, b) => b.weight - a.weight);
}
