/** Time-weighted return: chained product of daily net-of-flow returns. */
export function twr(dailyReturns: number[]): number {
  return dailyReturns.reduce((acc, r) => acc * (1 + r), 1) - 1;
}
