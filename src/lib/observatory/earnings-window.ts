import { todayInTimeZone } from "@/lib/date";

export type EarningsRow = { ticker: string; date: string };

export type EarningsMonth = {
  /** "JULY 2026" — spelled out, since this is a heading a person reads. */
  label: string;
  /** YYYY-MM, for keys and comparisons. */
  key: string;
  events: EarningsRow[];
};

const MONTHS = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
];

/**
 * R7 Jul 31 (H2): "I really only want a earnings forecast for the upcoming two
 * months. For example it is july now so i would want to see the earnings for
 * july and august. in august i would want to see the earning for august and
 * september."
 *
 * A ROLLING window of the current month and the next — not "the next 60 days",
 * which is a different thing and would put late-September dates on a July
 * screen. The boundary is the calendar, not a day count.
 *
 * Dates already past within the current month are dropped: an earnings
 * *forecast* that lists last week is a history, and he asked for a forecast.
 */
export function earningsForNextTwoMonths(
  events: readonly EarningsRow[],
  today: string = todayInTimeZone("America/New_York"),
): EarningsMonth[] {
  const [year, month] = today.split("-").map(Number);
  const windows = [
    { year, month },
    month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 },
  ];

  return windows.map(({ year: y, month: m }) => {
    const key = `${y}-${String(m).padStart(2, "0")}`;
    return {
      key,
      label: `${MONTHS[m - 1]} ${y}`,
      events: events
        .filter((event) => event.date.startsWith(key) && event.date >= today)
        .sort(
          (left, right) =>
            left.date.localeCompare(right.date) ||
            left.ticker.localeCompare(right.ticker),
        ),
    };
  });
}
