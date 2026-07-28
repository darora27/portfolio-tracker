import Link from "next/link";
import type { SectorSystem } from "@/lib/observatory/sector-systems";
import styles from "./orrery.module.css";

function signed(value: number | null): string {
  if (value === null) return "—";
  return `${value >= 0 ? "+" : ""}${(value * 100).toFixed(1)}%`;
}

export function SectorMap({
  basePath,
  solHealth,
  system,
  selectedSystem,
  forceNo3d,
}: {
  basePath: string;
  solHealth: number;
  system: SectorSystem;
  selectedSystem: string | null;
  forceNo3d: boolean;
}) {
  const viewingObserved = selectedSystem === system.slug;
  return (
    <section className={styles.sectorMap} aria-labelledby="sector-map-title">
      <header>
        <span>SECTOR CHART</span>
        <h2 id="sector-map-title">{viewingObserved ? system.name : "LOCAL SECTOR"}</h2>
      </header>
      <p className={styles.sectorExplanation}>
        Solid core = my portfolio · hollow core = observed public system · health uses public percent returns only
      </p>
      <div className={styles.sectorGrid} aria-hidden="true" />
      {viewingObserved ? (
        <div className={styles.observedSystem} aria-label={`${system.name} observed system`}>
          <i className={styles.observedCore} aria-hidden="true" />
          <strong>{system.name}</strong>
          <span>{signed(system.health)} HEALTH · OBSERVED · NO TWR</span>
          {system.holdings.map((holding, index) => {
            const angle = index * 2.399963;
            const orbit = 5.8 + index * 3.5;
            return (
              <span
                className={styles.observedBody}
                key={holding.ticker}
                style={{
                  "--body-x": `${Math.cos(angle) * orbit}rem`,
                  "--body-y": `${Math.sin(angle) * orbit * 0.55}rem`,
                  "--body-size": `${0.8 + Math.sqrt(holding.weight) * 1.7}rem`,
                } as React.CSSProperties}
              >
                <i aria-hidden="true" />
                <b>{holding.ticker}</b>
                <small>{signed(holding.dayReturn)} DAY · {(holding.weight * 100).toFixed(1)}% WEIGHT</small>
              </span>
            );
          })}
        </div>
      ) : (
        <>
          <Link
            className={styles.sectorSun}
            data-core="solid"
            href={`${basePath}${forceNo3d ? "?no3d=1" : ""}`}
            scroll={false}
            style={{
              "--sector-x": "29%",
              "--sector-y": "61%",
              "--system-health": solHealth < 0 ? "#d65a24" : "#f5c45d",
            } as React.CSSProperties}
          >
            <i />
            <strong>SOL-DEVAN</strong>
            <span>{signed(solHealth)} DAY</span>
          </Link>
          <Link
            className={styles.sectorSun}
            data-core="hollow"
            href={`${basePath}?camera=sector&system=${encodeURIComponent(system.slug)}${forceNo3d ? "&no3d=1" : ""}`}
            scroll={false}
            style={{
              "--sector-x": "70%",
              "--sector-y": "34%",
              "--system-health":
                system.health !== null && system.health < 0
                  ? "#d65a24"
                  : "#f5c45d",
            } as React.CSSProperties}
          >
            <i />
            <strong>{system.name}</strong>
            <span>{signed(system.health)} HEALTH · OBSERVED · NO TWR</span>
          </Link>
        </>
      )}
      {viewingObserved ? (
        <Link
          className={styles.sectorBreadcrumb}
          href={`${basePath}${forceNo3d ? "?no3d=1" : ""}`}
          scroll={false}
        >
          SECTOR ◂ SOL-DEVAN
        </Link>
      ) : (
        <Link
          className={styles.sectorBreadcrumb}
          href={`${basePath}${forceNo3d ? "?no3d=1" : ""}`}
          scroll={false}
        >
          ◂ SOL-DEVAN
        </Link>
      )}
    </section>
  );
}
