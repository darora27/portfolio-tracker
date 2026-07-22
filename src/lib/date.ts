const MS_PER_DAY = 86_400_000;

/** Whole days between two ISO dates (YYYY-MM-DD), UTC-based. */
export function daysBetween(from: string, to: string): number {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / MS_PER_DAY);
}

/**
 * Today's calendar date (YYYY-MM-DD) in the given IANA time zone. Needed
 * because a serverless function's system clock is UTC, which can land on a
 * different calendar date than US markets near midnight UTC.
 */
export function todayInTimeZone(timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(new Date());
}
