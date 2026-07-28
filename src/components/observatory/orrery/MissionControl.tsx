"use client";

import Link from "next/link";
import {
  useCallback,
  useState,
  type FocusEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import type { PublicOrreryHolding } from "@/lib/observatory/orrery";
import type { PublicNewsItem } from "@/lib/observatory/public-news";
import { MISSION_CONTROL_CSS_PROPERTIES } from "@/lib/observatory/mission-control-layout";
import { SystemPlot } from "./MissionControlBays/SystemPlot";
import {
  MISSION_CONTROL_PANELS,
  type MissionControlPanelId,
} from "./mission-control-panels";
import styles from "./orrery.module.css";

export function MissionControl({
  activePanel,
  mode,
  content,
  closeHref,
  basePath,
  preservedQuery,
  holdings,
  health,
  teletype,
  dayReadout,
  newsByHolding,
  signalPair = null,
}: {
  activePanel: MissionControlPanelId;
  mode: "public" | "private";
  content: ReactNode;
  closeHref: string;
  basePath: string;
  preservedQuery?: Record<string, string>;
  holdings: readonly PublicOrreryHolding[];
  health: number;
  teletype: string;
  dayReadout?: string;
  newsByHolding?: Readonly<Record<string, readonly PublicNewsItem[]>>;
  signalPair?: string | null;
}) {
  const [hoveredTicker, setHoveredTicker] = useState<string | null>(null);
  const [detailTicker, setDetailTicker] = useState<string | null>(null);
  const [briefingOpen, setBriefingOpen] = useState(false);
  const activeTicker = hoveredTicker ?? detailTicker;
  const routeToHolding = useCallback((ticker: string) => {
    window.location.assign(
      `${basePath}?holding=${encodeURIComponent(ticker)}&camera=approach`,
    );
  }, [basePath]);
  const resolveManifestTicker = useCallback((target: EventTarget | null) => {
    const element = target instanceof Element
      ? target.closest<HTMLElement>("[data-manifest-ticker]")
      : null;
    setHoveredTicker(element?.dataset.manifestTicker ?? null);
  }, []);

  return (
    <section
      className={styles.missionControl}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mission-control-title"
      data-mode={mode}
      style={MISSION_CONTROL_CSS_PROPERTIES}
      onPointerOver={(event: PointerEvent<HTMLElement>) =>
        resolveManifestTicker(event.target)
      }
      onPointerLeave={() => setHoveredTicker(null)}
      onFocusCapture={(event: FocusEvent<HTMLElement>) =>
        resolveManifestTicker(event.target)
      }
      onBlurCapture={(event: FocusEvent<HTMLElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setHoveredTicker(null);
        }
      }}
    >
      <header>
        <div>
          <span className={styles.inspectorKicker}>{mode === "private" ? "OWNER LINK" : "PUBLIC LINK"}</span>
          <h2 id="mission-control-title" tabIndex={-1}>Mission Control</h2>
        </div>
        <Link href={closeHref} prefetch={false} scroll={false} className={styles.hudButton}>
          Return to universe
        </Link>
      </header>
      <div className={styles.teletype} aria-label={teletype}>
        <span>{teletype}</span><i aria-hidden="true">█</i>
      </div>
      <div className={styles.commandReadouts}>
        <strong className={styles.commandDay}>{dayReadout ?? "—"}</strong>
        <button
          type="button"
          className={styles.briefingFolder}
          aria-expanded={briefingOpen}
          onClick={() => setBriefingOpen((current) => !current)}
        >
          BRIEFING {briefingOpen ? "◂" : "▸"}
        </button>
        {briefingOpen ? (
          <div className={styles.briefingPaper}>
            <b>PORTFOLIO LINK</b>
            <span>PUBLIC RATIOS · SAME-PERIOD INDEXES · HELD NEWS</span>
          </div>
        ) : null}
      </div>
      <nav aria-label="Mission Control sections">
        {MISSION_CONTROL_PANELS.map((panel) => (
          <Link
            key={panel.id}
            href={`${basePath}?${new URLSearchParams({
              focus: "portfolio",
              camera: "command",
              station: panel.id,
              ...preservedQuery,
            }).toString()}`}
            prefetch={false}
            scroll={false}
            aria-current={panel.id === activePanel ? "page" : undefined}
          >
            {panel.label}
          </Link>
        ))}
      </nav>
      <div className={styles.missionMachine}>
        <aside className={styles.plotChassis} aria-label="System plot">
          <header>
            <b>PLOT FEED</b>
            {activePanel === "plot" ? null : (
              <span className={styles.bayQuestion}>
                where is everything, and how was the week
              </span>
            )}
          </header>
          <SystemPlot
            holdings={holdings}
            activeTicker={activeTicker}
            health={health}
            onSelectTicker={setDetailTicker}
            onOpenTicker={routeToHolding}
            signalPair={signalPair}
          />
        </aside>
        <aside className={styles.missionRail} aria-label="Mission instruments">
          <section className={styles.manifestInstrument}>
            <header>
              <b>MANIFEST</b>
              {activePanel === "manifest" ? null : (
                <span className={styles.bayQuestion}>
                  what do I own, at what weight
                </span>
              )}
            </header>
            <ol className={styles.radarManifest}>
              {holdings.map((holding) => (
                <li
                  key={holding.ticker}
                  data-expanded={detailTicker === holding.ticker}
                >
                  <button
                    type="button"
                    data-manifest-ticker={holding.ticker}
                    aria-expanded={detailTicker === holding.ticker}
                    onClick={() => setDetailTicker(
                      detailTicker === holding.ticker ? null : holding.ticker,
                    )}
                    onDoubleClick={() => routeToHolding(holding.ticker)}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter") return;
                      event.preventDefault();
                      routeToHolding(holding.ticker);
                    }}
                  >
                    <strong>{holding.ticker}</strong>
                    <span>{(holding.weight * 100).toFixed(1)}%</span>
                  </button>
                  {detailTicker === holding.ticker ? (
                    <div className={styles.radarDetailCard}>
                      <svg viewBox="0 0 120 28" role="img" aria-label={`${holding.ticker} indexed sparkline`}>
                        <polyline
                          points={sparklinePoints(holding.chart?.map(({ index }) => index) ?? [])}
                        />
                      </svg>
                      <dl>
                        <div><dt>DAY</dt><dd>{signedPercent(holding.dayReturn)}</dd></div>
                        <div><dt>WEEK</dt><dd>{signedPercent(holding.weeklyReturn)}</dd></div>
                        <div><dt>WEIGHT</dt><dd>{(holding.weight * 100).toFixed(1)}%</dd></div>
                      </dl>
                      {newsByHolding?.[holding.ticker]?.[0] ? (
                        <a
                          href={newsByHolding[holding.ticker][0].url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {newsByHolding[holding.ticker][0].headline}
                        </a>
                      ) : <span>NO TRANSMISSIONS</span>}
                      <button type="button" onClick={() => routeToHolding(holding.ticker)}>
                        FULL PLANET
                      </button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ol>
          </section>
          <div
            className={styles.missionContent}
            data-material={activePanel === "log" ? "paper" : "glass"}
          >
            {content}
          </div>
          <div className={styles.railStations}>
            <Link href={`${basePath}?focus=portfolio&camera=command&station=scope`}>
              <b>SCOPE</b><span>am I beating the market</span>
            </Link>
            <Link href={`${basePath}?focus=portfolio&camera=command&station=comms`}>
              <b>LAUNCH</b><span>what’s next on the calendar</span>
            </Link>
          </div>
        </aside>
        <footer className={styles.instrumentStrip}>
          <Link href={`${basePath}?focus=portfolio&camera=command&station=hazard`}>
            <b>HAZARD</b><span>how much can this hurt</span>
          </Link>
          <Link href={`${basePath}?focus=portfolio&camera=command&station=signals`}>
            <b>SIGNALS</b><span>what moves together</span>
          </Link>
        </footer>
      </div>
    </section>
  );
}

function signedPercent(value: number | null): string {
  if (value === null) return "—";
  return `${value >= 0 ? "+" : ""}${(value * 100).toFixed(1)}%`;
}

function sparklinePoints(values: readonly number[]): string {
  if (values.length < 2) return "";
  const low = Math.min(...values);
  const span = Math.max(...values) - low || 1;
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 120;
      const y = 26 - ((value - low) / span) * 24;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}
