"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PublicNewsItem } from "@/lib/observatory/public-news";
import type { PublicOrreryHolding } from "@/lib/observatory/orrery";
import styles from "./orrery.module.css";

type Range = "7d" | "30d" | "since" | "max";

function percent(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined) return "—";
  return `${value > 0 ? "+" : ""}${(value * 100).toFixed(digits)}%`;
}

function direction(value: number | null): string {
  if (value === null || value === 0) return "◆";
  return value > 0 ? "▲" : "▼";
}

function tracePoints(values: readonly number[], width = 320, height = 130): string {
  if (values.length < 2) return "";
  const low = Math.min(...values);
  const high = Math.max(...values);
  const span = high - low || 1;
  return values.map((value, index) => {
    const x = (index / (values.length - 1)) * width;
    const y = height - ((value - low) / span) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

export function PlanetDetail({
  holding,
  news,
  basePath,
  forceNo3d,
  transmissionsFirst = false,
}: {
  holding: PublicOrreryHolding;
  news: readonly PublicNewsItem[];
  basePath: string;
  forceNo3d: boolean;
  transmissionsFirst?: boolean;
}) {
  const [range, setRange] = useState<Range>("30d");
  const [expanded, setExpanded] = useState(false);
  const transmissionsRef = useRef<HTMLElement>(null);
  const fullSeries = holding.chart ?? [];
  const series = useMemo(() => {
    if (range === "7d") return fullSeries.slice(-7);
    if (range === "30d") return fullSeries.slice(-30);
    return fullSeries;
  }, [fullSeries, range]);
  const values = series.map(({ index }) => index);

  useEffect(() => {
    if (!transmissionsFirst) return;
    transmissionsRef.current?.scrollIntoView({ block: "nearest" });
    transmissionsRef.current?.focus({ preventScroll: true });
  }, [transmissionsFirst]);

  return (
    <div className={styles.planetDetail}>
      <section className={styles.detailBay} aria-labelledby="orrery-inspector-heading">
        <span>ID</span>
        <h2 id="orrery-inspector-heading" tabIndex={-1}>{holding.ticker} · {holding.companyName}</h2>
        <strong className={styles.dayNumber}>
          {direction(holding.dayReturn)} {percent(holding.dayReturn)}
        </strong>
        {holding.nextEarningsDays !== null && holding.nextEarningsDays !== undefined
          ? <b className={styles.earningsChip}>T−{holding.nextEarningsDays}D</b>
          : null}
      </section>

      <section className={styles.detailBay} aria-labelledby="detail-scope">
        <span id="detail-scope">SCOPE</span>
        <div className={styles.rangeDetents}>
          {([
            ["7d", "7D"],
            ["30d", "30D"],
            ["since", "SINCE BUY · SIMPLE"],
            ["max", "MAX"],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={range === id}
              onClick={() => setRange(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <svg className={styles.holdingScope} viewBox="0 0 320 130" role="img" aria-label={`${holding.ticker} ${range} indexed return trace`}>
          <line x1="0" y1="65" x2="320" y2="65" />
          <polyline points={tracePoints(values)} />
        </svg>
        <button
          className={styles.benchmarkToggle}
          type="button"
          disabled
          aria-pressed="false"
          title="Same-period VOO series is not supplied for this holding view."
        >
          VOO UNAVAILABLE
        </button>
      </section>

      <section className={styles.detailBay} aria-label="Telemetry">
        <span>TELEMETRY</span>
        <dl className={styles.telemetryStrip}>
          <div><dt>WEIGHT</dt><dd>◒ {percent(holding.weight)}</dd></div>
          <div><dt>WEEK</dt><dd>{direction(holding.weeklyReturn)} {percent(holding.weeklyReturn)}</dd></div>
          <div><dt>VOL</dt><dd>⌁ {percent(holding.volatilityPct)}</dd></div>
          <div><dt>BETA</dt><dd>β {holding.betaVsVoo?.toFixed(2) ?? "—"}</dd></div>
        </dl>
      </section>

      <section
        ref={transmissionsRef}
        className={styles.detailBay}
        data-expanded={expanded}
        aria-labelledby="transmissions-title"
        tabIndex={-1}
      >
        <span id="transmissions-title">TRANSMISSIONS</span>
        {news.length ? (
          <>
            <ol className={styles.transmissionList}>
              {news.slice(0, 3).map((item) => (
                <li key={`${item.datetime}-${item.url}`}>
                  <a href={item.url} target="_blank" rel="noreferrer">
                    <time>{new Date(item.datetime * 1000).toISOString().slice(5, 10)}</time>
                    <b>{item.headline}</b>
                    <i>· {item.source}</i>
                  </a>
                </li>
              ))}
            </ol>
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() => setExpanded((current) => !current)}
            >
              {expanded ? "LESS ◂" : "MORE ▸"}
            </button>
          </>
        ) : <strong className={styles.noTransmissions}>NO TRANSMISSIONS</strong>}
      </section>

      <section className={styles.detailBay} aria-label="Egress">
        <span>EGRESS</span>
        <Link href={`${basePath}?focus=portfolio&camera=command&station=manifest&anchor=${encodeURIComponent(holding.ticker)}`} scroll={false}>
          OPEN IN MISSION CONTROL ▸
        </Link>
        <Link href={`${basePath}${forceNo3d ? "?no3d=1" : ""}`} scroll={false}>
          ◂ SYSTEM
        </Link>
      </section>
    </div>
  );
}
