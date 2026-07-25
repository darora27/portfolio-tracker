"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  angularSpeedForWeeklyReturn,
  directionForWeeklyReturn,
  radiusForWeight,
  type PublicOrreryHolding,
} from "@/lib/observatory/orrery";
import { OrrerySceneLoader } from "./OrrerySceneLoader";
import styles from "./orrery.module.css";

const BASE_PATH = "/dev/phase10-portfolio-orrery";

export function orreryHoldingHref(ticker: string, forceNo3d = false): string {
  return `${BASE_PATH}?holding=${encodeURIComponent(ticker)}${forceNo3d ? "&no3d=1" : ""}`;
}

function formatPercent(value: number | null, digits = 1): string {
  if (value === null) return "Unavailable";
  const sign = value > 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(digits)}%`;
}

function HoldingInspector({ holding }: { holding: PublicOrreryHolding }) {
  return (
    <>
      <p className={styles.inspectorKicker}>Holding telemetry / public-safe</p>
      <h2 id="orrery-inspector-heading" tabIndex={-1}>
        {holding.ticker} <span>{holding.companyName}</span>
      </h2>
      <dl className={styles.inspectorGrid}>
        <div><dt>Portfolio weight</dt><dd>{formatPercent(holding.weight)}</dd></div>
        <div><dt>Trailing week</dt><dd>{formatPercent(holding.weeklyReturn)}</dd></div>
        <div><dt>Vs. portfolio</dt><dd>{formatPercent(holding.portfolioRelativeReturn)}</dd></div>
        <div><dt>Annualized volatility</dt><dd>{formatPercent(holding.volatilityPct)}</dd></div>
        <div><dt>Beta vs. VOO</dt><dd>{holding.betaVsVoo?.toFixed(2) ?? "Unavailable"}</dd></div>
        <div><dt>Orbit state</dt><dd>{directionForWeeklyReturn(holding.weeklyReturn)}</dd></div>
      </dl>
      <Link className={styles.deepLink} href={`/stock/${encodeURIComponent(holding.ticker)}`}>
        Open deeper stock information
      </Link>
    </>
  );
}

export function OrreryWorld({
  holdings,
  selectedTicker,
  portfolioSelected,
  forceNo3d = false,
  portfolioSummary,
}: {
  holdings: readonly PublicOrreryHolding[];
  selectedTicker: string | null;
  portfolioSelected: boolean;
  forceNo3d?: boolean;
  portfolioSummary: {
    returnPct: number;
    marketRelativePct: number | null;
    topTwoWeight: number;
  };
}) {
  const router = useRouter();
  const worldRef = useRef<HTMLElement>(null);
  const previousTickerRef = useRef<string | null>(selectedTicker);
  const previousPortfolioRef = useRef(portfolioSelected);
  const [hoveredTicker, setHoveredTicker] = useState<string | null>(null);
  const selected = holdings.find((holding) => holding.ticker === selectedTicker) ?? null;

  const navigateToHolding = useCallback(
    (ticker: string) => router.push(orreryHoldingHref(ticker, forceNo3d), { scroll: false }),
    [forceNo3d, router],
  );
  const navigateToPortfolio = useCallback(
    () => router.push(`${BASE_PATH}?focus=portfolio${forceNo3d ? "&no3d=1" : ""}`, { scroll: false }),
    [forceNo3d, router],
  );

  useEffect(() => {
    if (selectedTicker || portfolioSelected) {
      document.getElementById("orrery-inspector-heading")?.focus({ preventScroll: true });
    } else if (previousTickerRef.current) {
      const prior = document.querySelector<HTMLElement>(
        `[data-holding="${CSS.escape(previousTickerRef.current)}"]`,
      );
      prior?.focus({ preventScroll: true });
    } else if (previousPortfolioRef.current) {
      document.querySelector<HTMLElement>("[data-portfolio-sun]")?.focus({ preventScroll: true });
    }
    previousTickerRef.current = selectedTicker;
    previousPortfolioRef.current = portfolioSelected;
  }, [portfolioSelected, selectedTicker]);

  useEffect(() => {
    const world = worldRef.current;
    if (!world || forceNo3d || typeof window.matchMedia !== "function") return;
    if (
      !window.matchMedia("(min-width: 1024px)").matches ||
      !window.matchMedia("(pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const onPointerMove = (event: PointerEvent) => {
      world.style.setProperty("--orrery-pointer-x", (event.clientX / window.innerWidth - 0.5).toFixed(4));
      world.style.setProperty("--orrery-pointer-y", (event.clientY / window.innerHeight - 0.5).toFixed(4));
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [forceNo3d]);

  return (
    <main
      ref={worldRef}
      className={styles.world}
      data-force-no-3d={forceNo3d ? "true" : "false"}
      data-selected-holding={selectedTicker ?? ""}
    >
      <div className={styles.starField} aria-hidden="true" />
      <div className={styles.scanlines} aria-hidden="true" />

      <header className={styles.commandBar}>
        <div>
          <p>Public orbital telemetry / owner-gated production study</p>
          <h1>Portfolio Orrery</h1>
        </div>
        <p className={styles.status}>SYSTEM NOMINAL · {holdings.length} PUBLIC HOLDINGS</p>
      </header>

      <section className={styles.stage} aria-label="Portfolio solar system">
        <div className={styles.canvasLayer} aria-hidden="true">
          <OrrerySceneLoader
            holdings={holdings}
            selectedTicker={selectedTicker}
            hoveredTicker={hoveredTicker}
            forceNo3d={forceNo3d}
            onHover={setHoveredTicker}
            onSelect={navigateToHolding}
            onSelectPortfolio={navigateToPortfolio}
          />
        </div>

        <nav className={styles.semanticMap} aria-label="Portfolio bodies">
          <Link
            href={`${BASE_PATH}?focus=portfolio${forceNo3d ? "&no3d=1" : ""}`}
            data-portfolio-sun
            className={styles.sunControl}
            aria-current={portfolioSelected ? "page" : undefined}
            onMouseEnter={() => setHoveredTicker(null)}
            scroll={false}
          >
            <span aria-hidden="true">SUN / 00</span>
            Portfolio summary
          </Link>
          <ol className={styles.holdingList}>
            {holdings.map((holding, index) => {
              const direction = directionForWeeklyReturn(holding.weeklyReturn);
              return (
                <li key={holding.ticker}>
                  <Link
                    href={orreryHoldingHref(holding.ticker, forceNo3d)}
                    data-holding={holding.ticker}
                    data-selected={holding.ticker === selectedTicker ? "true" : undefined}
                    data-hovered={holding.ticker === hoveredTicker ? "true" : undefined}
                    className={styles.holdingControl}
                    aria-current={holding.ticker === selectedTicker ? "page" : undefined}
                    onMouseEnter={() => setHoveredTicker(holding.ticker)}
                    onMouseLeave={() => setHoveredTicker(null)}
                    onFocus={() => setHoveredTicker(holding.ticker)}
                    onBlur={() => setHoveredTicker(null)}
                    scroll={false}
                  >
                    <span className={styles.ticker}>{String(index + 1).padStart(2, "0")} · {holding.ticker}</span>
                    <span>{holding.companyName}</span>
                    <span className={styles.orbitFacts}>
                      {formatPercent(holding.weight)} weight · {formatPercent(holding.weeklyReturn)} week · {direction}
                    </span>
                    <span className={styles.visualEncoding} aria-hidden="true">
                      R {radiusForWeight(holding.weight).toFixed(2)} · ω {angularSpeedForWeeklyReturn(holding.weeklyReturn).toFixed(2)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>

        <aside className={styles.legend} aria-label="Orbit encoding legend">
          <p>ORBIT ENCODING</p>
          <ul>
            <li><span>Radius</span> Portfolio weight, perceptually scaled and clamped</li>
            <li><span>Clockwise</span> Positive trailing week</li>
            <li><span>Counterclockwise</span> Negative trailing week</li>
            <li><span>Neutral</span> Unavailable or within ±0.05%; orbit freezes</li>
            <li><span>Speed</span> Increases with absolute weekly change, safely clamped</li>
          </ul>
        </aside>

        <aside className={styles.inspector} aria-live="polite">
          {selected ? (
            <HoldingInspector holding={selected} />
          ) : portfolioSelected ? (
            <>
              <p className={styles.inspectorKicker}>Central body / portfolio aggregate</p>
              <h2 id="orrery-inspector-heading" tabIndex={-1}>Portfolio summary</h2>
              <dl className={styles.inspectorGrid}>
                <div><dt>Composition</dt><dd>{holdings.length} public holdings</dd></div>
                <div><dt>Portfolio return</dt><dd>{formatPercent(portfolioSummary.returnPct)}</dd></div>
                <div><dt>Market-relative</dt><dd>{formatPercent(portfolioSummary.marketRelativePct)}</dd></div>
                <div><dt>Top-two weight</dt><dd>{formatPercent(portfolioSummary.topTwoWeight)}</dd></div>
              </dl>
              <Link className={styles.deepLink} href="/share?chapter=pulse">Open Pulse and Forces context</Link>
            </>
          ) : (
            <>
              <p className={styles.inspectorKicker}>Navigation signature / awaiting selection</p>
              <h2>Every body carries portfolio meaning.</h2>
              <p className={styles.inspectorLead}>
                Select the sun for composition and market-relative context, or a planet for holding telemetry.
              </p>
            </>
          )}
          {(selected || portfolioSelected) && (
            <Link className={styles.closeLink} href={forceNo3d ? `${BASE_PATH}?no3d=1` : BASE_PATH} scroll={false}>
              Close inspector
            </Link>
          )}
        </aside>
      </section>
    </main>
  );
}
