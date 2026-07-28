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
import { FirstVisitOrientation } from "./FirstVisitOrientation";
import {
  MissionControl,
  type MissionControlPanelId,
} from "./MissionControl";
import { OrrerySceneLoader } from "./OrrerySceneLoader";
import { SystemsManual } from "./SystemsManual";
import styles from "./orrery.module.css";

const REFERENCE_BASE_PATH = "/dev/phase10-portfolio-orrery";

export type PortfolioHealth = {
  h: number;
  sunspotIntensity: number;
};

export type OrreryCameraState = "overview" | "approach" | "command";

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

function healthLabel(h: number): string {
  if (h >= 0.6) return "Strong";
  if (h >= 0.18) return "Steady";
  if (h > -0.18) return "Flat";
  if (h > -0.6) return "Weak";
  return "Struggling";
}

function HoldingInspector({
  holding,
  showHint,
}: {
  holding: PublicOrreryHolding;
  showHint: boolean;
}) {
  return (
    <>
      <p className={styles.inspectorKicker}>Holding telemetry / public-safe</p>
      {showHint ? <p className={styles.microHint}>spin = today · orbit = this week</p> : null}
      <h2 id="orrery-inspector-heading" tabIndex={-1}>
        {holding.ticker} <span>{holding.companyName}</span>
      </h2>
      <dl className={styles.inspectorGrid}>
        <div><dt>Portfolio weight</dt><dd>{formatPercent(holding.weight)}</dd></div>
        <div><dt>Today</dt><dd>{formatPercent(holding.dayReturn)}</dd></div>
        <div><dt>Trailing week</dt><dd>{formatPercent(holding.weeklyReturn)}</dd></div>
        <div><dt>Vs. portfolio</dt><dd>{formatPercent(holding.portfolioRelativeReturn)}</dd></div>
        <div><dt>Annualized volatility</dt><dd>{formatPercent(holding.volatilityPct)}</dd></div>
        <div><dt>Beta vs. VOO</dt><dd>{holding.betaVsVoo?.toFixed(2) ?? "Unavailable"}</dd></div>
      </dl>
      <Link className={styles.deepLink} href={`/stock/${encodeURIComponent(holding.ticker)}`} prefetch={false}>
        Open full analysis
      </Link>
    </>
  );
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
  activeMissionPanel = "dashboard",
  missionMode = "public",
  missionPreservedQuery,
  basePath = REFERENCE_BASE_PATH,
  referenceStudy = false,
  semanticTitle = true,
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
  };
  portfolioHealth?: PortfolioHealth;
  missionControlContent?: ReactNode;
  activeMissionPanel?: MissionControlPanelId;
  missionMode?: "public" | "private";
  missionPreservedQuery?: Record<string, string>;
  basePath?: string;
  referenceStudy?: boolean;
  semanticTitle?: boolean;
}) {
  const router = useRouter();
  const worldRef = useRef<HTMLElement>(null);
  const previousTickerRef = useRef<string | null>(selectedTicker);
  const previousPortfolioRef = useRef(portfolioSelected);
  const priorCameraRef = useRef<OrreryCameraState>("overview");
  const [hoveredTicker, setHoveredTicker] = useState<string | null>(null);
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
      if (event.key === "Escape" && (selectedTicker || portfolioSelected || beltOpen)) {
        event.preventDefault();
        returnToOverview();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [beltOpen, portfolioSelected, returnToOverview, selectedTicker]);

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

      <section className={styles.stage} aria-label="Portfolio solar system">
        <div className={styles.canvasLayer} aria-hidden="true" onDoubleClick={returnToOverview}>
          <OrrerySceneLoader
            holdings={planets}
            beltHoldings={beltHoldings}
            selectedTicker={selectedTicker}
            hoveredTicker={hoveredTicker}
            cameraState={cameraState}
            portfolioHealth={health}
            forceNo3d={forceNo3d}
            onHover={setHoveredTicker}
            onSelect={navigateToHolding}
            onSelectPortfolio={navigateToPortfolio}
            onSelectBelt={() => setBeltOpen(true)}
            onExitOverview={returnToOverview}
          />
        </div>

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
            scroll={false}
          >
            <span>SUN / PORTFOLIO</span>
            {formatPercent(portfolioSummary.dayReturnPct ?? portfolioSummary.returnPct)} today · {healthLabel(health.h)} health · {(health.sunspotIntensity * 100).toFixed(0)}% sunspot intensity
          </Link>
          <ol className={styles.holdingList}>
            {holdings.map((holding) => {
              const rank = planetTickers.indexOf(holding.ticker);
              const isBelt = rank < 0;
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
                      {formatPercent(holding.dayReturn)} today · axial spin {axialSpinForDayReturn(holding.dayReturn).toFixed(2)} · {isBelt ? "asteroid belt" : `planet rank ${rank + 1}`}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>

        <button type="button" className={styles.beltButton} onClick={() => setBeltOpen(true)}>
          ASTEROID BELT · {beltHoldings.length}
        </button>
        <SystemsManual
          open={manualOpen}
          onOpen={() => setManual(true)}
          onClose={() => setManual(false)}
          disabled={cameraState !== "overview"}
        />

        {selected ? (
          <aside className={styles.inspector} aria-live="polite">
            <HoldingInspector holding={selected} showHint={showHint} />
            <Link className={styles.closeLink} href={fallbackHref} prefetch={false} scroll={false}>
              Return to overview
            </Link>
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
        />
      ) : null}
      <FirstVisitOrientation disabled={forceNo3d} />
    </main>
  );
}
