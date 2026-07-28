"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  axialSpinForDayReturn,
  directionForWeeklyReturn,
  type BeltResolution,
  type PublicOrreryHolding,
} from "@/lib/observatory/orrery";
import type { PublicNewsItem } from "@/lib/observatory/public-news";
import type { PublicTradeEntry } from "@/lib/observatory/public-trade-log";
import type { EarningsEvent } from "@/lib/finnhub-earnings";
import type { SectorSystem } from "@/lib/observatory/sector-systems";
import {
  moonBucketForStoryCount,
  satelliteBlinkSeconds,
} from "@/lib/observatory/scene-model";
import { FirstVisitOrientation } from "./FirstVisitOrientation";
import {
  MissionControl,
  type MissionControlPanelId,
} from "./MissionControl";
import { OrrerySceneLoader } from "./OrrerySceneLoader";
import { PlanetDetail } from "./PlanetDetail";
import { SectorMap } from "./SectorMap";
import { SystemsManual } from "./SystemsManual";
import styles from "./orrery.module.css";

const REFERENCE_BASE_PATH = "/dev/phase10-portfolio-orrery";

export type PortfolioHealth = {
  h: number;
  sunspotIntensity: number;
};

export type OrreryCameraState = "overview" | "approach" | "command" | "sector";

export function orreryHoldingHref(
  ticker: string,
  forceNo3d = false,
  basePath = REFERENCE_BASE_PATH,
): string {
  return `${basePath}?holding=${encodeURIComponent(ticker)}&camera=approach${
    forceNo3d ? "&no3d=1" : ""
  }`;
}

function formatPercent(value: number | null, digits = 1): string {
  if (value === null) return "Unavailable";
  const sign = value > 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(digits)}%`;
}

function formatTelemetryPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return `${value >= 0 ? "+" : ""}${(value * 100).toFixed(1)}%`;
}

function healthLabel(h: number): string {
  if (h >= 0.6) return "Strong";
  if (h >= 0.18) return "Steady";
  if (h > -0.18) return "Flat";
  if (h > -0.6) return "Weak";
  return "Struggling";
}

export function OrreryWorld({
  holdings,
  orreryBelt,
  selectedTicker,
  portfolioSelected,
  cameraState = selectedTicker ? "approach" : portfolioSelected ? "command" : "overview",
  manualOpen = false,
  forceNo3d = false,
  portfolioSummary,
  portfolioHealth,
  missionControlContent = null,
  activeMissionPanel = "plot",
  missionMode = "public",
  missionPreservedQuery,
  basePath = REFERENCE_BASE_PATH,
  referenceStudy = false,
  semanticTitle = true,
  newsByHolding = {},
  upcomingEarnings = [],
  publicTradeLog = [],
  tradeComet = null,
  portfolioVolatility = null,
  portfolioBeta = null,
  sectorSystem,
  selectedSystem = null,
  transmissionsFirst = false,
}: {
  holdings: readonly PublicOrreryHolding[];
  orreryBelt?: BeltResolution;
  selectedTicker: string | null;
  portfolioSelected: boolean;
  cameraState?: OrreryCameraState;
  manualOpen?: boolean;
  forceNo3d?: boolean;
  portfolioSummary: {
    returnPct: number;
    dayReturnPct?: number;
    marketRelativePct: number | null;
    topTwoWeight: number;
    drawdownPct?: number | null;
  };
  portfolioHealth?: PortfolioHealth;
  missionControlContent?: ReactNode;
  activeMissionPanel?: MissionControlPanelId;
  missionMode?: "public" | "private";
  missionPreservedQuery?: Record<string, string>;
  basePath?: string;
  referenceStudy?: boolean;
  semanticTitle?: boolean;
  newsByHolding?: Record<string, PublicNewsItem[]>;
  upcomingEarnings?: readonly EarningsEvent[];
  publicTradeLog?: readonly PublicTradeEntry[];
  tradeComet?: PublicTradeEntry | null;
  portfolioVolatility?: number | null;
  portfolioBeta?: number | null;
  sectorSystem?: SectorSystem;
  selectedSystem?: string | null;
  transmissionsFirst?: boolean;
}) {
  const router = useRouter();
  const worldRef = useRef<HTMLElement>(null);
  const previousTickerRef = useRef<string | null>(selectedTicker);
  const previousPortfolioRef = useRef(portfolioSelected);
  const priorCameraRef = useRef<OrreryCameraState>("overview");
  const [hoveredTicker, setHoveredTicker] = useState<string | null>(null);
  const [sunFocused, setSunFocused] = useState(false);
  const [beltOpen, setBeltOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const selected = holdings.find(({ ticker }) => ticker === selectedTicker) ?? null;
  const planetTickers = orreryBelt?.planetTickers ?? holdings.slice(0, 8).map(({ ticker }) => ticker);
  const beltTickers = orreryBelt?.beltTickers ?? holdings.slice(8).map(({ ticker }) => ticker);
  const planets = planetTickers
    .map((ticker) => holdings.find((holding) => holding.ticker === ticker))
    .filter((holding): holding is PublicOrreryHolding => Boolean(holding));
  const beltHoldings = beltTickers
    .map((ticker) => holdings.find((holding) => holding.ticker === ticker))
    .filter((holding): holding is PublicOrreryHolding => Boolean(holding));
  const health = portfolioHealth ?? { h: 0, sunspotIntensity: 0 };
  const fallbackHref = forceNo3d ? `${basePath}?no3d=1` : basePath;
  const nextEarnings = [...upcomingEarnings]
    .filter((event) => {
      const days = holdings.find(({ ticker }) => ticker === event.ticker)?.nextEarningsDays;
      return days !== null && days !== undefined && days >= 0;
    })
    .sort((left, right) => left.date.localeCompare(right.date))[0];
  const nextEarningsHolding = nextEarnings
    ? holdings.find(({ ticker }) => ticker === nextEarnings.ticker)
    : null;

  const navigateToHolding = useCallback(
    (ticker: string) => {
      priorCameraRef.current = cameraState;
      router.push(orreryHoldingHref(ticker, forceNo3d, basePath), { scroll: false });
    },
    [basePath, cameraState, forceNo3d, router],
  );
  const navigateToPortfolio = useCallback(() => {
    priorCameraRef.current = cameraState;
    router.push(
      `${basePath}?focus=portfolio&camera=command${forceNo3d ? "&no3d=1" : ""}`,
      { scroll: false },
    );
  }, [basePath, cameraState, forceNo3d, router]);
  const returnToOverview = useCallback(() => {
    setBeltOpen(false);
    router.push(fallbackHref, { scroll: false });
  }, [fallbackHref, router]);
  const setManual = useCallback(
    (open: boolean) => {
      const query = new URLSearchParams(window.location.search);
      if (open) query.set("manual", "1");
      else query.delete("manual");
      router.push(`${basePath}${query.size ? `?${query.toString()}` : ""}`, {
        scroll: false,
      });
    },
    [basePath, router],
  );

  useEffect(() => {
    let hintFrame = 0;
    if (selectedTicker || portfolioSelected) {
      document.getElementById(
        portfolioSelected ? "mission-control-title" : "orrery-inspector-heading",
      )?.focus({ preventScroll: true });
      if (selectedTicker) {
        try {
          const count = Number(window.sessionStorage.getItem("orrery-selection-hints") ?? "0");
          hintFrame = window.requestAnimationFrame(() => setShowHint(count < 2));
          window.sessionStorage.setItem("orrery-selection-hints", String(count + 1));
        } catch {
          hintFrame = window.requestAnimationFrame(() => setShowHint(false));
        }
      }
    } else if (previousTickerRef.current) {
      document.querySelector<HTMLElement>(
        `[data-holding="${CSS.escape(previousTickerRef.current)}"]`,
      )?.focus({ preventScroll: true });
    } else if (previousPortfolioRef.current) {
      document.querySelector<HTMLElement>("[data-portfolio-sun]")?.focus({
        preventScroll: true,
      });
    }
    previousTickerRef.current = selectedTicker;
    previousPortfolioRef.current = portfolioSelected;
    return () => {
      if (hintFrame) window.cancelAnimationFrame(hintFrame);
    };
  }, [portfolioSelected, selectedTicker]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        (cameraState !== "overview" || selectedTicker || portfolioSelected || beltOpen)
      ) {
        event.preventDefault();
        returnToOverview();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [beltOpen, cameraState, portfolioSelected, returnToOverview, selectedTicker]);

  useEffect(() => {
    const world = worldRef.current;
    if (!world || forceNo3d || typeof window.matchMedia !== "function") return;
    if (!window.matchMedia("(min-width: 1024px)").matches) return;
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
      data-camera={cameraState}
      data-selected-holding={selectedTicker ?? ""}
    >
      <div className={styles.starField} aria-hidden="true" />
      <div className={styles.scanlines} aria-hidden="true" />
      <header className={styles.commandBar}>
        <div>
          <p>
            {referenceStudy
              ? "Owner-gated reference study"
              : missionMode === "private"
                ? "Private universe / owner access"
                : "Public universe / read-only"}
          </p>
          {semanticTitle ? <h1>Stock Market Universe</h1> : <p className={styles.worldTitle}>Stock Market Universe</p>}
        </div>
        <p className={styles.status}>OVERVIEW · {planets.length} PLANETS · {beltHoldings.length} BELT</p>
      </header>
      <p className={styles.orientationLine}>
        SUN = WHOLE PORTFOLIO · PLANET = ONE HOLDING · CLICK EITHER TO OPEN
      </p>

      <section className={styles.stage} aria-label="Portfolio solar system">
        <div className={styles.canvasLayer} aria-hidden="true" onDoubleClick={returnToOverview}>
          {cameraState !== "sector" ? <OrrerySceneLoader
            holdings={planets}
            beltHoldings={beltHoldings}
            selectedTicker={selectedTicker}
            hoveredTicker={hoveredTicker}
            portfolioFocused={sunFocused}
            cameraState={cameraState}
            portfolioHealth={health}
            driftExcessReturn={portfolioSummary.marketRelativePct}
            portfolioVolatility={portfolioVolatility}
            nextEarningsDays={nextEarningsHolding?.nextEarningsDays ?? null}
            tradeComet={tradeComet}
            forceNo3d={forceNo3d}
            onHover={setHoveredTicker}
            onSelect={navigateToHolding}
            onSelectPortfolio={navigateToPortfolio}
            onSelectBelt={() => setBeltOpen(true)}
            onSelectMoon={(ticker) =>
              router.push(`${orreryHoldingHref(ticker, forceNo3d, basePath)}&detail=transmissions`, { scroll: false })
            }
            onSelectSatellite={(id) => {
              const station = id === "DRIFT" ? "scope" : id === "HAZARD" ? "hazard" : "comms";
              router.push(`${basePath}?focus=portfolio&camera=command&station=${station}${forceNo3d ? "&no3d=1" : ""}`, { scroll: false });
            }}
            onOpenSector={() =>
              router.push(`${basePath}?camera=sector${forceNo3d ? "&no3d=1" : ""}`, { scroll: false })
            }
            onExitOverview={returnToOverview}
          /> : null}
        </div>

        {cameraState === "sector" && sectorSystem ? (
          <SectorMap
            basePath={basePath}
            solHealth={portfolioSummary.dayReturnPct ?? 0}
            system={sectorSystem}
            selectedSystem={selectedSystem}
            forceNo3d={forceNo3d}
          />
        ) : null}

        <div className={styles.sunTelemetry} aria-hidden="true">
          <span>PORTFOLIO</span>
          <strong>{formatPercent(portfolioSummary.dayReturnPct ?? portfolioSummary.returnPct)}</strong>
          <em>{healthLabel(health.h)}</em>
        </div>

        <nav className={styles.semanticMap} aria-label="Portfolio bodies">
          <Link
            href={`${basePath}?focus=portfolio&camera=command${forceNo3d ? "&no3d=1" : ""}`}
            prefetch={false}
            data-portfolio-sun
            className={styles.sunControl}
            aria-current={portfolioSelected ? "page" : undefined}
            onFocus={() => setSunFocused(true)}
            onBlur={() => setSunFocused(false)}
            scroll={false}
          >
            <span>SUN / PORTFOLIO</span>
            {formatPercent(portfolioSummary.dayReturnPct ?? portfolioSummary.returnPct)} today · {healthLabel(health.h)} health · {(health.sunspotIntensity * 100).toFixed(0)}% sunspot intensity
          </Link>
          <ol className={styles.holdingList}>
            {planets.map((holding, rank) => {
              return (
                <li key={holding.ticker}>
                  <Link
                    href={orreryHoldingHref(holding.ticker, forceNo3d, basePath)}
                    prefetch={false}
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
                    <span className={styles.ticker}>{holding.ticker} · {holding.companyName}</span>
                    <span className={styles.orbitFacts}>
                      {formatPercent(holding.weight)} weight · {formatPercent(holding.weeklyReturn)} week · {directionForWeeklyReturn(holding.weeklyReturn)}
                    </span>
                    <span className={styles.orbitFacts}>
                      {formatPercent(holding.dayReturn)} today · axial spin {axialSpinForDayReturn(holding.dayReturn).toFixed(2)} · planet rank {rank + 1} · label day chip
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
          <ol className={styles.instrumentList}>
            {planets
              .filter(
                (holding) =>
                  (holding.newsCount ??
                    newsByHolding[holding.ticker]?.length ??
                    0) > 0,
              )
              .map((holding) => (
                <li key={`moon-${holding.ticker}`}>
                  <Link
                    className={styles.bodyControl}
                    href={`${orreryHoldingHref(holding.ticker, forceNo3d, basePath)}&detail=transmissions`}
                    prefetch={false}
                    scroll={false}
                    data-moon={holding.ticker}
                  >
                    MOON / {holding.ticker} · {(holding.newsCount ?? newsByHolding[holding.ticker]?.length)} TRANSMISSIONS · {(moonBucketForStoryCount(holding.newsCount ?? newsByHolding[holding.ticker]?.length ?? 0) ?? "none").toUpperCase()} SIZE
                    {holding.nextEarningsDays !== null && holding.nextEarningsDays !== undefined ? ` · T−${holding.nextEarningsDays}D` : ""}
                  </Link>
                </li>
              ))}
          </ol>
          <ol className={styles.instrumentList}>
            <li>
              <Link className={styles.bodyControl} href={`${basePath}?focus=portfolio&camera=command&station=scope${forceNo3d ? "&no3d=1" : ""}`} prefetch={false} scroll={false}>
                SATELLITE / DRIFT · VS VOO {formatPercent(portfolioSummary.marketRelativePct)}
              </Link>
            </li>
            <li>
              <Link className={styles.bodyControl} href={`${basePath}?focus=portfolio&camera=command&station=hazard${forceNo3d ? "&no3d=1" : ""}`} prefetch={false} scroll={false}>
                SATELLITE / HAZARD · VOL {formatPercent(portfolioVolatility)} · BETA {portfolioBeta?.toFixed(2) ?? "Unavailable"}
                {satelliteBlinkSeconds(portfolioVolatility) === null ? " · NAV STATIC" : ` · NAV ${satelliteBlinkSeconds(portfolioVolatility)}S`}
              </Link>
            </li>
            <li>
              <Link className={styles.bodyControl} href={`${basePath}?focus=portfolio&camera=command&station=comms${forceNo3d ? "&no3d=1" : ""}`} prefetch={false} scroll={false}>
                SATELLITE / SUPPLY · {nextEarningsHolding ? `T−${nextEarningsHolding.nextEarningsDays}D · ${nextEarningsHolding.ticker}` : "NO UPCOMING EARNINGS"}
              </Link>
            </li>
          </ol>
          {sectorSystem ? (
            <Link
              className={styles.bodyControl}
              href={`${basePath}?camera=sector${forceNo3d ? "&no3d=1" : ""}`}
              prefetch={false}
              scroll={false}
              data-sector-system={sectorSystem.slug}
            >
              SECTOR / {sectorSystem.name} · {sectorSystem.health === null ? "—" : formatPercent(sectorSystem.health)} HEALTH · OBSERVED · NO TWR
            </Link>
          ) : null}
          <button type="button" className={styles.bodyControl} onClick={() => setBeltOpen(true)}>
            ASTEROID BELT · {beltHoldings.length} OBJECTS
          </button>
          <span className={styles.visualEncoding}>
            NEBULA {health.h < 0 ? "EMBER" : "GOLD"} · HEALTH SCALAR {health.h >= 0 ? "+" : ""}{health.h.toFixed(2)}
            {tradeComet ? ` · COMET ${tradeComet.action.toUpperCase()} ${tradeComet.realizedSign > 0 ? "+" : tradeComet.realizedSign < 0 ? "−" : "0"} SIGN` : " · NO TRADE COMET TODAY"}
          </span>
        </nav>

        <SystemsManual
          open={manualOpen}
          onOpen={() => setManual(true)}
          onClose={() => setManual(false)}
          disabled={cameraState !== "overview"}
        />

        {selected ? (
          <aside className={styles.inspector} aria-live="polite">
            {showHint ? <span className={styles.microHint}>SPIN = TODAY · ORBIT = WEEK</span> : null}
            <PlanetDetail
              holding={selected}
              news={newsByHolding[selected.ticker] ?? []}
              basePath={basePath}
              forceNo3d={forceNo3d}
              transmissionsFirst={transmissionsFirst}
            />
          </aside>
        ) : null}

        {beltOpen ? (
          <aside className={styles.inspector} aria-live="polite">
            <p className={styles.inspectorKicker}>Outer-system telemetry</p>
            <h2 id="orrery-inspector-heading" tabIndex={-1}>Asteroid belt</h2>
            <ul className={styles.beltList}>
              {beltHoldings.map((holding) => (
                <li key={holding.ticker}>
                  <strong>{holding.ticker}</strong>
                  <span>{formatPercent(holding.weight)} weight</span>
                  <span>{formatPercent(holding.weeklyReturn)} week · {directionForWeeklyReturn(holding.weeklyReturn)}</span>
                </li>
              ))}
            </ul>
            <button type="button" className={styles.hudButton} onClick={() => setBeltOpen(false)}>
              Close belt
            </button>
          </aside>
        ) : null}
      </section>

      {portfolioSelected && missionControlContent ? (
        <MissionControl
          activePanel={activeMissionPanel}
          mode={missionMode}
          content={missionControlContent}
          closeHref={fallbackHref}
          basePath={basePath}
          preservedQuery={missionPreservedQuery}
          holdings={planets}
          health={health.h}
          teletype={`SOL-DEVAN · DAY ${formatTelemetryPercent(portfolioSummary.dayReturnPct)} · TWR ${formatTelemetryPercent(portfolioSummary.returnPct)} · VS VOO ${formatTelemetryPercent(portfolioSummary.marketRelativePct)} SAME PERIOD · DRAWDOWN ${formatTelemetryPercent(portfolioSummary.drawdownPct)}`}
        />
      ) : null}
      <FirstVisitOrientation disabled={forceNo3d} />
    </main>
  );
}
