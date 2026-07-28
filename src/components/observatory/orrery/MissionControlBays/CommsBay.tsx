import type { EarningsEvent } from "@/lib/finnhub-earnings";
import { daysBetween, todayInTimeZone } from "@/lib/date";
import styles from "../orrery.module.css";

const HOUR: Record<string, string> = {
  amc: "AFTER CLOSE",
  bmo: "BEFORE OPEN",
  dmh: "DURING MARKET",
  "": "TIME —",
};

export function CommsBay({ events }: { events: readonly EarningsEvent[] }) {
  const today = todayInTimeZone("America/New_York");
  const rows = [...events].sort((left, right) => left.date.localeCompare(right.date));
  return (
    <section className={styles.operationsBay} aria-labelledby="comms-title">
      <h3 id="comms-title">COMMS</h3>
      <ol className={styles.commsRows}>
        {rows.length ? rows.map((event, index) => (
          <li key={`${event.ticker}-${event.date}`} data-soonest={index === 0}>
            <strong>T−{Math.max(0, daysBetween(today, event.date))}D</strong>
            <span>{event.ticker}</span>
            <span>{HOUR[event.hour]}</span>
            <span>EST {event.epsEstimate?.toFixed(2) ?? "—"}</span>
          </li>
        )) : <li><strong>T−—</strong><span>NO SIGNAL</span></li>}
      </ol>
    </section>
  );
}
