"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useState,
  type FocusEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import type { PublicOrreryHolding } from "@/lib/observatory/orrery";
import { MISSION_CONTROL_CSS_PROPERTIES } from "@/lib/observatory/mission-control-layout";
import { SystemPlot } from "./MissionControlBays/SystemPlot";
import {
  MISSION_CONTROL_PANELS,
  type MissionControlPanelId,
} from "./mission-control-panels";
import styles from "./orrery.module.css";

const DraftRig = dynamic(
  () => import("./DraftRig").then((module) => module.DraftRig),
  { ssr: false },
);

// FB-08 + FB-15 (§12a) variant A/C: destinations not already reachable via
// a readout chip, folded into the strip as compact links. ORBITS is
// deliberately last since PLOT already scrolls into view by default.
const FOLDED_CHIP_DESTINATIONS = [
  { anchor: "holdings", label: "HOLDINGS" },
  { anchor: "correlation", label: "CORRELATION" },
  { anchor: "news", label: "NEWS" },
  { anchor: "trades", label: "TRADES" },
  { anchor: "orbits", label: "ORBITS" },
  { anchor: "earnings", label: "EARNINGS" },
] as const;

export function MissionControl({
  activePanel,
  mode,
  content,
  closeHref,
  basePath,
  holdings,
  health,
  dayReadout = "—",
  weekReadout = "—",
  twrReadout = "—",
  marketReadout = "—",
  offHighReadout = "—",
  signalPair = null,
  footerEquipment = null,
  draftParam = null,
  stripVariant = null,
}: {
  activePanel: MissionControlPanelId;
  mode: "public" | "private";
  content: ReactNode;
  closeHref: string;
  basePath: string;
  preservedQuery?: Record<string, string>;
  holdings: readonly PublicOrreryHolding[];
  health: number;
  teletype?: string;
  dayReadout?: string;
  weekReadout?: string;
  twrReadout?: string;
  marketReadout?: string;
  offHighReadout?: string;
  signalPair?: string | null;
  footerEquipment?: ReactNode;
  draftParam?: string | null;
  newsByHolding?: unknown;
  /** FB-08 + FB-15 (§12a): capture-only, never set in production. */
  stripVariant?: "a" | "b" | "c" | null;
}) {
  const [activeTicker, setActiveTicker] = useState<string | null>(null);
  const [briefingOpen, setBriefingOpen] = useState(false);
  const [draftOpen, setDraftOpen] = useState(
    mode === "private" && draftParam !== null,
  );
  const routeToHolding = useCallback((ticker: string) => {
    window.location.assign(
      `${basePath}?holding=${encodeURIComponent(ticker)}&camera=approach`,
    );
  }, [basePath]);
  const resolveTicker = useCallback((target: EventTarget | null) => {
    const element = target instanceof Element
      ? target.closest<HTMLElement>("[data-radar-ticker]")
      : null;
    setActiveTicker(element?.dataset.radarTicker ?? null);
  }, []);

  useEffect(() => {
    const panel = MISSION_CONTROL_PANELS.find(({ id }) => id === activePanel);
    if (!panel || activePanel === "plot") return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(panel.anchor)?.scrollIntoView({ block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activePanel]);

  return (
    <section
      className={styles.missionControl}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mission-control-title"
      data-mode={mode}
      style={MISSION_CONTROL_CSS_PROPERTIES}
      onPointerOver={(event: PointerEvent<HTMLElement>) => resolveTicker(event.target)}
      onPointerLeave={() => setActiveTicker(null)}
      onFocusCapture={(event: FocusEvent<HTMLElement>) => resolveTicker(event.target)}
      onBlurCapture={(event: FocusEvent<HTMLElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setActiveTicker(null);
      }}
    >
      <header className={styles.missionStrip} data-strip-variant={stripVariant ?? undefined}>
        <div className={styles.missionHero}>
          <span>TODAY</span>
          <strong>{dayReadout}</strong>
        </div>
        <div className={styles.missionReadoutChips}>
          {stripVariant === "a" || stripVariant === "c" ? (
            <>
              <a href="#returns">WEEK <b>{weekReadout}</b></a>
              <a href="#returns">SINCE START TWR <b>{twrReadout}</b></a>
              <a href="#returns">VS VOO · SAME PERIOD <b>{marketReadout}</b></a>
              <a href="#risk">OFF HIGH <b>{offHighReadout}</b></a>
              {FOLDED_CHIP_DESTINATIONS.map((destination) => (
                <a key={destination.anchor} href={`#${destination.anchor}`} className={styles.missionFoldedChip}>
                  {destination.label}
                </a>
              ))}
            </>
          ) : (
            <>
              <span>WEEK <b>{weekReadout}</b></span>
              <span>SINCE START TWR <b>{twrReadout}</b></span>
              <span>VS VOO · SAME PERIOD <b>{marketReadout}</b></span>
              <span>OFF HIGH <b>{offHighReadout}</b></span>
            </>
          )}
        </div>
        {stripVariant === "a" || stripVariant === "c" ? null : (
          <nav aria-label="Mission Control sections">
            {MISSION_CONTROL_PANELS.map((panel) => (
              <a
                key={panel.id}
                href={`#${panel.anchor}`}
                aria-current={panel.id === activePanel ? "page" : undefined}
              >
                {panel.label}
              </a>
            ))}
            <a href="#earnings">EARNINGS</a>
          </nav>
        )}
        {mode === "private" && holdings.length === 8 ? (
          <button
            type="button"
            className={styles.draftLatch}
            aria-expanded={draftOpen}
            onClick={() => setDraftOpen(true)}
          >
            DRAFT · 🚀
          </button>
        ) : null}
        <Link
          href={closeHref}
          prefetch={false}
          scroll={false}
          className={styles.missionExit}
        >
          ◂ UNIVERSE
        </Link>
      </header>

      {stripVariant === "c" ? (
        <nav aria-label="Mission Control sections" className={styles.missionIndexEdge}>
          {MISSION_CONTROL_PANELS.map((panel) => (
            <a
              key={panel.id}
              href={`#${panel.anchor}`}
              aria-current={panel.id === activePanel ? "page" : undefined}
            >
              {panel.label}
            </a>
          ))}
          <a href="#earnings">EARNINGS</a>
        </nav>
      ) : null}

      <div className={styles.missionDescent}>
        <h2 id="mission-control-title" tabIndex={-1}>Mission Control</h2>
        <section
          id="orbits"
          className={`${styles.missionDescentSection} ${styles.orbitsSection}`}
          aria-labelledby="orbits-title"
        >
          <header className={styles.missionSectionHeading}>
            <h3 id="orbits-title">ORBITS</h3>
            <p>where is everything, and how was the week</p>
          </header>
          <SystemPlot
            holdings={holdings}
            activeTicker={activeTicker}
            health={health}
            onSelectTicker={setActiveTicker}
            onOpenTicker={routeToHolding}
            signalPair={signalPair}
          />
        </section>

        {content}

        <footer className={styles.missionFooter}>
          <button
            type="button"
            className={styles.briefingFolder}
            aria-expanded={briefingOpen}
            onClick={() => setBriefingOpen((current) => !current)}
          >
            BRIEFING {briefingOpen ? "◂" : "▸"}
          </button>
          {footerEquipment}
          {mode === "private" && holdings.length === 8 ? (
            <button
              type="button"
              className={styles.draftLatch}
              aria-expanded={draftOpen}
              onClick={() => setDraftOpen(true)}
            >
              DRAFT · 🚀
            </button>
          ) : null}
          <span>SOL-DEVAN · READ-ONLY INSTRUMENTS</span>
          {briefingOpen ? (
            <p className={styles.briefingPaper}>
              <b>PORTFOLIO LINK</b>
              RETURNS ARE WINDOWED · BENCHMARKS USE THE SAME PERIOD ·
              CORRELATION IS DESCRIPTIVE, NOT PREDICTIVE.
            </p>
          ) : null}
        </footer>
      </div>
      {mode === "private" && draftOpen && holdings.length === 8 ? (
        <DraftRig
          holdings={holdings}
          encodedDraft={draftParam}
          onClose={() => setDraftOpen(false)}
        />
      ) : null}
    </section>
  );
}
