import type { EarningsEvent } from "@/lib/finnhub-earnings";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card } from "@/components/ui/Card";

const HOUR_LABELS: Record<EarningsEvent["hour"], string> = {
  bmo: "Before open",
  amc: "After close",
  dmh: "During market",
  "": "Time unknown",
};

export function EarningsCalendar({ events }: { events: EarningsEvent[] }) {
  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
        Upcoming earnings
      </h2>
      {events.length === 0 ? (
        <p className="mt-2 text-sm text-text-secondary">
          No earnings scheduled in the next 90 days for your holdings.
        </p>
      ) : (
        <Card padding="p-0" className="mt-3 divide-y divide-border overflow-hidden">
          {events.map((e) => (
            <div
              key={`${e.ticker}-${e.date}`}
              className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
            >
              <div>
                <span className="font-medium text-text-primary">{e.ticker}</span>
                <span className="ml-2 text-text-secondary">{HOUR_LABELS[e.hour]}</span>
              </div>
              <div className="flex items-center gap-3 text-text-secondary">
                {e.epsEstimate !== null && <span>Est. EPS {formatCurrency(e.epsEstimate)}</span>}
                <span className="font-mono text-text-primary">{formatDate(e.date)}</span>
              </div>
            </div>
          ))}
        </Card>
      )}
    </section>
  );
}
