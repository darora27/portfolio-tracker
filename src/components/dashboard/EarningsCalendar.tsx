import type { EarningsEvent } from "@/lib/finnhub-earnings";
import { formatDate } from "@/lib/format";

const HOUR_LABELS: Record<EarningsEvent["hour"], string> = {
  bmo: "Before open",
  amc: "After close",
  dmh: "During market",
  "": "Time unknown",
};

export function EarningsCalendar({ events }: { events: EarningsEvent[] }) {
  return (
    <section>
      <h2 className="text-lg font-medium">Upcoming earnings</h2>
      {events.length === 0 ? (
        <p className="mt-2 text-sm text-zinc-500">
          No earnings scheduled in the next 90 days for your holdings.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-zinc-100 rounded-lg border border-zinc-200 dark:divide-zinc-900 dark:border-zinc-800">
          {events.map((e) => (
            <li
              key={`${e.ticker}-${e.date}`}
              className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
            >
              <div>
                <span className="font-medium">{e.ticker}</span>
                <span className="ml-2 text-zinc-500">{HOUR_LABELS[e.hour]}</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-500">
                {e.epsEstimate !== null && <span>Est. EPS ${e.epsEstimate.toFixed(2)}</span>}
                <span className="tabular-nums text-zinc-900 dark:text-zinc-100">
                  {formatDate(e.date)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
