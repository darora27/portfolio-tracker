import { addDays } from "@/lib/date";

export type IndexedPoint = { date: string; index: number };

/**
 * Trailing N-calendar-day return from an indexed series (e.g. the TWR
 * growth index or a benchmark's chart index, both already indexed the
 * same way in dashboard-data.ts) — feeds the surface tier's
 * weeklySubline (src/lib/surface-copy.ts).
 *
 * Snapshots only exist on trading days, so an exact "N days ago" date
 * rarely has its own point — this looks back `daysBack` calendar days
 * from the series' last point and compares against the closest point ON
 * OR BEFORE that target date. Returns null when there isn't a point that
 * old yet (too little history), never NaN or a crash.
 */
export function trailingReturn(series: IndexedPoint[], daysBack: number): number | null {
  if (series.length === 0) return null;
  const last = series[series.length - 1];
  const targetDate = addDays(last.date, -daysBack);

  let found: IndexedPoint | null = null;
  for (const point of series) {
    if (point.date <= targetDate && (!found || point.date > found.date)) {
      found = point;
    }
  }

  if (!found || found.index === 0) return null;
  return last.index / found.index - 1;
}
