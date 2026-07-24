export function mean(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/** Null (not NaN) when there are fewer than 2 observations — there's no sample variance to compute from a single point. */
export function sampleVariance(values: number[]): number | null {
  if (values.length < 2) return null;
  const m = mean(values);
  return values.reduce((sum, v) => sum + (v - m) ** 2, 0) / (values.length - 1);
}

export function sampleStdDev(values: number[]): number | null {
  const variance = sampleVariance(values);
  return variance === null ? null : Math.sqrt(variance);
}

export function covariance(a: number[], b: number[]): number {
  const meanA = mean(a);
  const meanB = mean(b);
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += (a[i] - meanA) * (b[i] - meanB);
  return sum / (a.length - 1);
}
