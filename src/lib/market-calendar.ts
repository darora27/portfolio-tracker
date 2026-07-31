function toISO(year: number, month: number, day: number): string {
  return new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10);
}

function weekdayOf(year: number, month: number, day: number): number {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

/** Nth occurrence (1-indexed) of a weekday (0=Sun..6=Sat) in a given month. */
function nthWeekdayOfMonth(year: number, month: number, weekday: number, n: number): string {
  const firstWeekday = weekdayOf(year, month, 1);
  const offset = (weekday - firstWeekday + 7) % 7;
  return toISO(year, month, 1 + offset + (n - 1) * 7);
}

/** Last occurrence of a weekday (0=Sun..6=Sat) in a given month. */
function lastWeekdayOfMonth(year: number, month: number, weekday: number): string {
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const lastDayWeekday = weekdayOf(year, month, lastDay);
  const offset = (lastDayWeekday - weekday + 7) % 7;
  return toISO(year, month, lastDay - offset);
}

/** A fixed-date holiday, observed the nearest weekday if it falls on a weekend. */
function observedFixedHoliday(year: number, month: number, day: number): string {
  const weekday = weekdayOf(year, month, day);
  if (weekday === 6) return toISO(year, month, day - 1); // Saturday -> observed Friday
  if (weekday === 0) return toISO(year, month, day + 1); // Sunday -> observed Monday
  return toISO(year, month, day);
}

/** Good Friday: the Friday before Easter Sunday, via the Anonymous Gregorian algorithm. */
function goodFriday(year: number): string {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const easterMonth = Math.floor((h + l - 7 * m + 114) / 31);
  const easterDay = ((h + l - 7 * m + 114) % 31) + 1;
  return toISO(year, easterMonth, easterDay - 2);
}

const MONDAY = 1;
const THURSDAY = 4;

/** NYSE holidays for a given year, as ISO dates (YYYY-MM-DD). */
export function marketHolidays(year: number): string[] {
  return [
    observedFixedHoliday(year, 1, 1), // New Year's Day
    nthWeekdayOfMonth(year, 1, MONDAY, 3), // MLK Day
    nthWeekdayOfMonth(year, 2, MONDAY, 3), // Presidents Day
    goodFriday(year),
    lastWeekdayOfMonth(year, 5, MONDAY), // Memorial Day
    observedFixedHoliday(year, 6, 19), // Juneteenth
    observedFixedHoliday(year, 7, 4), // Independence Day
    nthWeekdayOfMonth(year, 9, MONDAY, 1), // Labor Day
    nthWeekdayOfMonth(year, 11, THURSDAY, 4), // Thanksgiving
    observedFixedHoliday(year, 12, 25), // Christmas
  ];
}

export function isWeekend(isoDate: string): boolean {
  const [y, m, d] = isoDate.split("-").map(Number);
  const day = weekdayOf(y, m, d);
  return day === 0 || day === 6;
}

export function isMarketHoliday(isoDate: string): boolean {
  const year = Number(isoDate.split("-")[0]);
  return marketHolidays(year).includes(isoDate);
}

/** Whether the NYSE is open for regular trading on this date. */
export function isTradingDay(isoDate: string): boolean {
  return !isWeekend(isoDate) && !isMarketHoliday(isoDate);
}

const WEEKDAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

/** Short uppercase weekday for an ISO date — "THU" for 2026-07-30. */
export function weekdayLabel(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return WEEKDAY_LABELS[weekdayOf(y, m, d)];
}

/**
 * Wall-clock date and time in America/New_York for an instant.
 *
 * Uses Intl rather than a fixed UTC offset so DST is handled by the
 * platform's tz database instead of by us: the same instant is 13:30 or
 * 14:30 UTC depending on the date, and hardcoding either produces an hour
 * of wrong answers twice a year.
 */
export function newYorkParts(now: Date): {
  date: string;
  hour: number;
  minute: number;
} {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    // Some ICU builds render midnight as hour "24" under hour12:false.
    hour: Number(get("hour")) % 24,
    minute: Number(get("minute")),
  };
}

const SESSION_OPEN_MINUTES = 9 * 60 + 30; // 09:30 ET
const SESSION_CLOSE_MINUTES = 16 * 60; // 16:00 ET

/**
 * Whether the NYSE regular session is open at this instant — a trading day
 * AND between 09:30 and 16:00 New York time.
 *
 * `isTradingDay` alone is not this: it is true all day on a trading day,
 * including at 3am, which is why "today's change" could read as a live
 * figure when nothing had traded yet.
 */
export function isMarketSessionOpen(now: Date): boolean {
  const { date, hour, minute } = newYorkParts(now);
  if (!isTradingDay(date)) return false;
  const minutes = hour * 60 + minute;
  return minutes >= SESSION_OPEN_MINUTES && minutes < SESSION_CLOSE_MINUTES;
}
