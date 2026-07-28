import Link from "next/link";
import type { PublicOrreryHolding } from "@/lib/observatory/orrery";
import { planetIdentityForTicker } from "@/lib/observatory/planet-identity";
import styles from "../orrery.module.css";

function signed(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return `${value >= 0 ? "▲" : "▼"} ${Math.abs(value * 100).toFixed(1)}`;
}

export function ManifestBay({
  holdings,
  basePath,
}: {
  holdings: readonly PublicOrreryHolding[];
  basePath: string;
}) {
  return (
    <section className={styles.operationsBay} aria-labelledby="manifest-title">
      <h3 id="manifest-title">MANIFEST</h3>
      <p className={styles.bayQuestion}>what do I own, at what weight</p>
      <div className={styles.manifestHeader} aria-hidden="true">
        <span>BODY</span><span>DAY</span><span>FUEL</span><span>CONTRIBUTION</span>
      </div>
      <ol className={styles.manifestRows}>
        {holdings.map((holding) => {
          const contribution = holding.contributionPct ?? 0;
          return (
            <li key={holding.ticker}>
              <Link
                href={`${basePath}?holding=${encodeURIComponent(holding.ticker)}&camera=approach`}
                data-manifest-ticker={holding.ticker}
                scroll={false}
              >
                <span
                  className={styles.planetChip}
                  style={{ "--chip": planetIdentityForTicker(holding.ticker).brandHex } as React.CSSProperties}
                />
                <strong>{holding.ticker}</strong>
                <span
                  title={
                    holding.dayReturn === null
                      ? "Day return unavailable: source history missing"
                      : undefined
                  }
                >
                  {signed(holding.dayReturn)}
                </span>
                <span className={styles.fuelGauge}>
                  <i style={{ width: `${Math.min(100, holding.weight * 100)}%` }} />
                  <b>{(holding.weight * 100).toFixed(1)}%</b>
                </span>
                <span className={styles.bilateralBar}>
                  <i
                    data-sign={contribution < 0 ? "negative" : "positive"}
                    style={{
                      width: `${Math.min(50, Math.abs(contribution) * 120)}%`,
                      [contribution < 0 ? "right" : "left"]: "50%",
                    }}
                  />
                  <b data-sign={contribution < 0 ? "negative" : "positive"}>
                    {contribution >= 0 ? "+" : ""}
                    {(contribution * 100).toFixed(1)}%
                  </b>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
