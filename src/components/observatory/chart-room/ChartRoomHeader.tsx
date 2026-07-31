import { formatPercent } from "@/lib/format";
import styles from "./chart-room.module.css";

function signGlyph(value: number): string {
  return value > 0 ? "▲" : value < 0 ? "▼" : "◆";
}

function signedPercentLabel(value: number, digits = 1): string {
  return `${signGlyph(value)} ${Math.abs(value * 100).toFixed(digits)}%`;
}

export function ChartRoomHeader({
  ticker,
  companyName,
  dayPct,
  weight,
  weeklyReturn,
  monthlyReturn,
  sinceBuyPct,
  earningsInDays,
  sessionCount,
}: {
  ticker: string;
  companyName: string | null;
  dayPct: number | null;
  weight: number;
  weeklyReturn: number | null;
  monthlyReturn: number | null;
  sinceBuyPct: number | null;
  earningsInDays: number | null;
  sessionCount: number;
}) {
  return (
    <header className={styles.strip}>
      <div className={styles.idplate}>
        <span className={styles.kicker}>CHART ROOM</span>
        <b>
          {ticker}
          {companyName ? ` · ${companyName.toUpperCase()}` : ""}
        </b>
      </div>
      <div />
      <div className={styles.hero}>
        <span>TODAY</span>
        {dayPct !== null && (
          <strong style={{ color: dayPct < 0 ? "var(--loss)" : "var(--gain)" }}>
            {signedPercentLabel(dayPct)}
          </strong>
        )}
      </div>
      <nav aria-label="Chart room exits" />
      <p className={styles.chips}>
        <span>
          WEIGHT <b>{formatPercent(weight, 1)}</b>
        </span>
        {weeklyReturn !== null && (
          <span>
            WEEK <b>{signedPercentLabel(weeklyReturn)}</b>
          </span>
        )}
        {monthlyReturn !== null && (
          <span>
            30D <b>{signedPercentLabel(monthlyReturn)}</b>
          </span>
        )}
        {sinceBuyPct !== null && (
          <span>
            SINCE BUY <b>{signedPercentLabel(sinceBuyPct)} (SIMPLE)</b>
          </span>
        )}
        {earningsInDays !== null && (
          <span>
            EARNINGS <b>T−{earningsInDays}D</b>
          </span>
        )}
        <span>
          N <b>{sessionCount} SESSIONS</b>
        </span>
      </p>
    </header>
  );
}
