import Link from "next/link";
import type { EarningsEvent } from "@/lib/finnhub-earnings";
import { daysBetween, todayInTimeZone } from "@/lib/date";
import type { PublicNewsItem } from "@/lib/observatory/public-news";
import styles from "../orrery.module.css";

const HOUR: Record<string, string> = {
  amc: "AFTER CLOSE",
  bmo: "BEFORE OPEN",
  dmh: "DURING MARKET",
  "": "TIME —",
};

export function CommsBay({
  events,
  newsByHolding,
  basePath,
}: {
  events: readonly EarningsEvent[];
  newsByHolding: Readonly<Record<string, readonly PublicNewsItem[]>>;
  basePath: string;
}) {
  const today = todayInTimeZone("America/New_York");
  const rows = [...events].sort((left, right) => left.date.localeCompare(right.date));
  const transmissions = Object.values(newsByHolding)
    .flat()
    .sort((left, right) => right.datetime - left.datetime)
    .slice(0, 5);
  return (
    <section className={styles.operationsBay} aria-labelledby="comms-title">
      <h3 id="comms-title">COMMS</h3>
      <p className={styles.bayQuestion}>what’s being said</p>
      <div className={styles.launchInstrument}>
        <b>LAUNCH</b>
        <span className={styles.bayQuestion}>what’s next on the calendar</span>
      </div>
      <ol className={styles.commsRows}>
        {rows.length ? rows.map((event, index) => (
          <li key={`${event.ticker}-${event.date}`} data-soonest={index === 0}>
            <Link href={`${basePath}?holding=${encodeURIComponent(event.ticker)}&camera=approach`}>
              <strong>T−{Math.max(0, daysBetween(today, event.date))}D</strong>
              <span>{event.ticker}</span>
              <span>{HOUR[event.hour]}</span>
              <span title={event.epsEstimate === null || event.epsEstimate === undefined ? "Estimate unavailable: calendar source omitted it" : undefined}>
                EST {event.epsEstimate?.toFixed(2) ?? "—"}
              </span>
            </Link>
          </li>
        )) : <li><strong>T−—</strong><span>NO SIGNAL</span></li>}
      </ol>
      <ol className={styles.commsHeadlines}>
        {transmissions.map((item) => (
          <li key={`${item.ticker}-${item.datetime}-${item.url}`}>
            <a href={item.url} target="_blank" rel="noreferrer">
              <strong>{item.ticker}</strong>
              <span>{item.headline}</span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
