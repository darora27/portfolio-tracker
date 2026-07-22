export function mean(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function sampleVariance(values: number[]): number {
  const m = mean(values);
  return values.reduce((sum, v) => sum + (v - m) ** 2, 0) / (values.length - 1);
}

export function sampleStdDev(values: number[]): number {
  return Math.sqrt(sampleVariance(values));
}

export function covariance(a: number[], b: number[]): number {
  const meanA = mean(a);
  const meanB = mean(b);
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += (a[i] - meanA) * (b[i] - meanB);
  return sum / (a.length - 1);
}
