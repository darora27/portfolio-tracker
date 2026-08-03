"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import type { PublicNewsItem } from "@/lib/observatory/public-news";
import type { PublicOrreryHolding } from "@/lib/observatory/orrery";
import { ReturnInstrument } from "./ReturnInstrument";
import styles from "./orrery.module.css";

/**
 * R7-W5. Owner-only position facts, deliberately NOT on PublicOrreryHolding.
 *
 * That type is documented "Never includes shares, value, or cost" and the
 * public-payload test enforces it. Widening it to carry dollars would have
 * put owner figures into the /share payload — OrreryWorld is a client
 * component, so anything handed to it is serialised into the HTML whether or
 * not it renders. The separation is the point: a public holding cannot carry
 * a dollar figure even by accident, because the field does not exist on it.
 *
 * Supplied only when missionMode is "private", which UniverseRoute computes
 * server-side from `authenticated && ownerGate`.
 */
export type PlanetOwnerFacts = {
  shares: number;
  value: number;
  costBasis: number;
  dayDollars: number | null;
  gainDollars: number | null;
};

function money(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function signedMoney(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return `${value >= 0 ? "+" : "−"}${money(Math.abs(value))}`;
}

function signOf(value: number | null | undefined): "up" | "down" | "flat" | "none" {
  if (value === null || value === undefined || !Number.isFinite(value)) return "none";
  if (Math.abs(value) < 0.00005) return "flat";
  return value > 0 ? "up" : "down";
}

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
  ownerFacts = null,
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
  /** Owner dollars. Null on /share, and the type makes that unambiguous. */
  ownerFacts?: PlanetOwnerFacts | null;
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

      {/* R7-W5. "the planet dashboard needs much more information in a bigger
          font. I can hardly read what is on the dashboard and it all looks
          heavily designed by artificial intelligence it does not look unique."

          Two complaints, and the second is the harder one. The first is
          answered by type roles: figures move off label size onto body and
          title, and the owner gets position facts that were never here.

          The second was a structural problem, not a decorative one. Every
          fact sat in an identical LABEL <b>value</b> pill, evenly spaced,
          same weight — the shape you get when a layout is generated rather
          than composed, because it treats every number as equally important.
          Nothing was dominant, so nothing was findable.

          This is a spec sheet instead: rows with the label left and the
          figure right-aligned on tabular numerals, hairlines between them,
          grouped by what the reader is asking. Same information, arranged
          the way his own spreadsheet arranges it — which is the reference he
          gave us for "clear". */}
      <dl className={styles.planetSpec} aria-label="Return windows">
        <div>
          <dt>WEEK</dt>
          <dd data-signal={signOf(holding.weeklyReturn)}>{signedPercent(holding.weeklyReturn)}</dd>
        </div>
        {thirtyDayReturn !== null ? (
          <div>
            <dt>30 DAYS</dt>
            <dd data-signal={signOf(thirtyDayReturn)}>{signedPercent(thirtyDayReturn)}</dd>
          </div>
        ) : null}
        <div>
          <dt>SINCE BUY</dt>
          <dd data-signal={signOf(sinceBuyReturn)}>{signedPercent(sinceBuyReturn)}</dd>
        </div>
        {holding.portfolioRelativeReturn !== null && holding.portfolioRelativeReturn !== undefined ? (
          <div>
            <dt>VS VOO · SAME PERIOD</dt>
            <dd data-signal={signOf(holding.portfolioRelativeReturn)}>
              {signedPercent(holding.portfolioRelativeReturn)}
            </dd>
          </div>
        ) : null}
      </dl>

      <ReturnInstrument
        points={chart}
        initialRange="30d"
        ariaLabel={`${holding.ticker} indexed return`}
      />

      {/* Owner block, and only ever the owner's. Absent rather than blanked on
          /share: a row reading "—" would tell a visitor a number exists and is
          being withheld, which is more than they should learn. */}
      {/* `mode === "private"` is checked here as well as at the server. The
          server guard is the one that keeps dollars out of the /share
          payload; this one keeps a future caller from rendering them by
          passing the prop without thinking. Neither alone is enough. */}
      {ownerFacts && mode === "private" ? (
        <dl className={styles.planetSpec} data-owner="true" aria-label="Your position">
          <div>
            <dt>POSITION</dt>
            <dd>{ownerFacts.shares.toLocaleString("en-US")} SHARES</dd>
          </div>
          <div>
            <dt>VALUE</dt>
            <dd>{money(ownerFacts.value)}</dd>
          </div>
          <div>
            <dt>COST BASIS</dt>
            <dd>{money(ownerFacts.costBasis)}</dd>
          </div>
          <div>
            <dt>GAIN / LOSS</dt>
            <dd data-signal={signOf(ownerFacts.gainDollars)}>{signedMoney(ownerFacts.gainDollars)}</dd>
          </div>
          <div>
            <dt>TODAY</dt>
            <dd data-signal={signOf(ownerFacts.dayDollars)}>{signedMoney(ownerFacts.dayDollars)}</dd>
          </div>
        </dl>
      ) : null}

      <dl className={styles.planetSpec} aria-label="Holding stats">
        <div>
          <dt>WEIGHT</dt>
          <dd>{plainPercent(holding.weight)}</dd>
        </div>
        <div>
          <dt>VOLATILITY</dt>
          <dd>{plainPercent(holding.volatilityPct)}</dd>
        </div>
        <div>
          <dt>BETA VS VOO</dt>
          <dd>{holding.betaVsVoo?.toFixed(2) ?? "—"}</dd>
        </div>
        {holding.contributionPct !== null && holding.contributionPct !== undefined ? (
          <div>
            <dt>CONTRIBUTION</dt>
            <dd data-signal={signOf(holding.contributionPct)}>{signedPercent(holding.contributionPct)}</dd>
          </div>
        ) : null}
      </dl>

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
