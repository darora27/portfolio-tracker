"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import type { PublicNewsItem } from "@/lib/observatory/public-news";
import type { PublicOrreryHolding } from "@/lib/observatory/orrery";
import { ReturnInstrument } from "./ReturnInstrument";
import styles from "./orrery.module.css";

function signedPercent(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  const direction = value > 0 ? "▲" : value < 0 ? "▼" : "◆";
  return `${direction} ${Math.abs(value * 100).toFixed(digits)}%`;
}

function plainPercent(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return `${Math.abs(value * 100).toFixed(digits)}%`;
}

function seriesReturn(
  points: readonly { index: number }[],
  count?: number,
): number | null {
  const window = count ? points.slice(-count) : points;
  const first = window[0]?.index;
  const last = window.at(-1)?.index;
  return first && typeof last === "number" ? last / first - 1 : null;
}

export function PlanetDetail({
  holding,
  news,
  basePath,
  forceNo3d,
  transmissionsFirst = false,
  mode = "public",
}: {
  holding: PublicOrreryHolding;
  news: readonly PublicNewsItem[];
  basePath: string;
  forceNo3d: boolean;
  transmissionsFirst?: boolean;
  /** §15 BHV-08/PRV-01 (door #3, FULL ANALYSIS): private mode opens the
   * Chart Room; public/`/share` mode keeps its exact pre-existing
   * destination. Defaults to "public" -- a caller that forgets to pass mode
   * must never leak the owner-gated route. */
  mode?: "public" | "private";
}) {
  const newsRef = useRef<HTMLElement>(null);
  const chart = holding.chart ?? [];
  const thirtyDayReturn = useMemo(() => seriesReturn(chart, 30), [chart]);
  const sinceBuyReturn = useMemo(() => seriesReturn(chart), [chart]);
  const linkableNews = news.filter(({ url }) => /^https?:\/\//i.test(url)).slice(0, 3);

  useEffect(() => {
    if (!transmissionsFirst || !linkableNews.length) return;
    newsRef.current?.scrollIntoView({ block: "nearest" });
    newsRef.current?.focus({ preventScroll: true });
  }, [linkableNews.length, transmissionsFirst]);

  return (
    <div className={styles.planetDetail} data-panel-stack="holding-summary">
      <header className={styles.planetDetailHeader}>
        <h2 id="orrery-inspector-heading" tabIndex={-1}>
          {holding.ticker} · {holding.companyName}
        </h2>
        {holding.nextEarningsDays !== null && holding.nextEarningsDays !== undefined
          ? <b className={styles.earningsChip}>EARNINGS T−{holding.nextEarningsDays}D</b>
          : null}
      </header>

      <section className={styles.planetHero} aria-label="Today return">
        <span>TODAY</span>
        <strong data-signal={holding.dayReturn === null ? "flat" : holding.dayReturn >= 0 ? "positive" : "negative"}>
          {signedPercent(holding.dayReturn)}
        </strong>
      </section>

      <p className={styles.planetWindows}>
        <span>WEEK <b>{signedPercent(holding.weeklyReturn)}</b></span>
        {thirtyDayReturn !== null ? (
          <span data-window="30d">30D <b>{signedPercent(thirtyDayReturn)}</b></span>
        ) : null}
        <span>SINCE BUY <b>{signedPercent(sinceBuyReturn)} (SIMPLE)</b></span>
      </p>

      <ReturnInstrument
        points={chart}
        initialRange="30d"
        ariaLabel={`${holding.ticker} indexed return`}
      />

      <section className={styles.planetStats} aria-label="Holding stats">
        <span>WEIGHT <b>{plainPercent(holding.weight)}</b></span>
        <span>VOL <b>{plainPercent(holding.volatilityPct)}</b></span>
        <span>BETA <b>{holding.betaVsVoo?.toFixed(2) ?? "—"}</b></span>
        {holding.contributionPct !== null && holding.contributionPct !== undefined ? (
          <span>CONTRIB <b>{signedPercent(holding.contributionPct)}</b></span>
        ) : null}
        {holding.portfolioRelativeReturn !== null && holding.portfolioRelativeReturn !== undefined ? (
          <span>VS VOO <b>{signedPercent(holding.portfolioRelativeReturn)}</b></span>
        ) : null}
      </section>

      {linkableNews.length ? (
        <section
          ref={newsRef}
          className={styles.planetNews}
          aria-labelledby="holding-news-title"
          tabIndex={-1}
        >
          <h3 id="holding-news-title">NEWS</h3>
          <ol>
            {linkableNews.map((item) => (
              <li key={`${item.datetime}-${item.url}`}>
                <a href={item.url} target="_blank" rel="noreferrer">
                  <time>{new Date(item.datetime * 1000).toISOString().slice(5, 10)}</time>
                  <span>{item.headline}</span>
                </a>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <footer className={styles.planetFooter}>
        <Link
          href={
            mode === "private"
              ? `/stock/${encodeURIComponent(holding.ticker)}`
              : `${basePath}?focus=portfolio&camera=command&station=manifest&anchor=${encodeURIComponent(holding.ticker)}`
          }
          scroll={false}
        >
          FULL ANALYSIS ▸
        </Link>
        <Link href={`${basePath}${forceNo3d ? "?no3d=1" : ""}`} scroll={false}>
          ◂ BACK TO SYSTEM
        </Link>
      </footer>
    </div>
  );
}
