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
import type { EarningsEvent } from "@/lib/finnhub-earnings";
import type { PublicNewsItem } from "@/lib/observatory/public-news";
import { daysBetween, todayInTimeZone } from "@/lib/date";
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
/* R7-W7. FOLDED_CHIP_DESTINATIONS is gone. It was the tab strip in a smaller
   shape — same-page anchors labelled HOLDINGS / MIX / ACTIVITY / ORBITS /
   EARNINGS, rendered in the variants that had no tab row. Removing the tabs
   while leaving these would have kept exactly the thing he objected to and
   only changed where it sat. */

// §15 BHV-01: the single soonest upcoming-earnings entry across all
// holdings, same daysBetween/date-formatting pattern the room's own
// (now-removed) EARNINGS section already used. Absent (not zero/dashed)
// when there is no upcoming earnings data at all.
function nextEarningsChip(upcomingEarnings: readonly EarningsEvent[]): string | null {
  const next = [...upcomingEarnings].sort((left, right) => left.date.localeCompare(right.date))[0];
  if (!next) return null;
  const today = todayInTimeZone("America/New_York");
  return `NEXT: ${next.ticker} T−${Math.max(0, daysBetween(today, next.date))}D`;
}

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
  upcomingEarnings = [],
  newsByHolding = {},
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
  newsByHolding?: Record<string, PublicNewsItem[]>;
  /** FB-08 + FB-15 (§12a): capture-only, never set in production. */
  stripVariant?: "a" | "b" | "c" | null;
  /** §15 BHV-01: source for the strip's NEXT chip. */
  upcomingEarnings?: readonly EarningsEvent[];
}) {
  const [activeTicker, setActiveTicker] = useState<string | null>(null);
  const [briefingOpen, setBriefingOpen] = useState(false);
  const [draftOpen, setDraftOpen] = useState(
    mode === "private" && draftParam !== null,
  );
  const routeToHolding = useCallback((ticker: string) => {
    // §15 BHV-08/PRV-01 (door #2, ORBITS): private mode opens the Chart
    // Room; public/`/share` mode keeps its exact pre-existing destination.
    // /stock/[ticker] is owner-gated and never part of the public surface.
    window.location.assign(
      mode === "private"
        ? `/stock/${encodeURIComponent(ticker)}`
        : `${basePath}?holding=${encodeURIComponent(ticker)}&camera=approach`,
    );
  }, [basePath, mode]);
  const allNews = Object.values(newsByHolding)
    .flat()
    .filter(({ url }) => /^https?:\/\//i.test(url))
    .sort((left, right) => right.datetime - left.datetime)
    .slice(0, 3);
  const resolveTicker = useCallback((target: EventTarget | null) => {
    const element = target instanceof Element
      ? target.closest<HTMLElement>("[data-radar-ticker]")
      : null;
    setActiveTicker(element?.dataset.radarTicker ?? null);
  }, []);

  const nextChip = nextEarningsChip(upcomingEarnings);

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
              {/* Readouts, not links. They pointed at #returns and #risk —
                  same-page anchors, the same pattern as the tabs. Variant B
                  already rendered them as plain spans; the others now match. */}
              <span>WEEK <b>{weekReadout}</b></span>
              <span>SINCE START TWR <b>{twrReadout}</b></span>
              <span>VS VOO · SAME PERIOD <b>{marketReadout}</b></span>
              <span>OFF HIGH <b>{offHighReadout}</b></span>
              {nextChip ? <span>{nextChip}</span> : null}
            </>
          ) : (
            <>
              <span>WEEK <b>{weekReadout}</b></span>
              <span>SINCE START TWR <b>{twrReadout}</b></span>
              <span>VS VOO · SAME PERIOD <b>{marketReadout}</b></span>
              <span>OFF HIGH <b>{offHighReadout}</b></span>
              {nextChip ? <span>{nextChip}</span> : null}
            </>
          )}
        </div>
        {/* R7-W7. The section tabs are gone, on his third report of them:
            "all of those tabs are LOCATED ON THE SAME PAGE". They were anchor
            links that scrolled the page you were already on — navigation in
            appearance, a table of contents in fact. Sections are still
            reachable by scrolling, which is all they ever were.

            In their place, the two destinations he actually named: "maybe one
            showing history and one showing research". These are real page
            loads. Private only — both routes are owner-gated, so offering
            them on the public share view would be offering a login wall. */}
        {mode === "private" ? (
          <nav aria-label="Pages" className={styles.missionPageNav}>
            <Link href="/history">HISTORY ▸</Link>
            <Link href="/research">RESEARCH ▸</Link>
          </nav>
        ) : null}
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
          {allNews.length ? (
            <div className={styles.footerNews} aria-label="Recent news">
              <span className={styles.footerNewsLabel}>NEWS</span>
              <ol className={styles.roomNews}>
                {allNews.map((item) => (
                  <li key={`${item.ticker}-${item.datetime}-${item.url}`}>
                    <a href={item.url} target="_blank" rel="noreferrer">
                      <time>{new Date(item.datetime * 1000).toISOString().slice(5, 10)}</time>
                      <strong>{item.ticker}</strong>
                      <span>{item.headline}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
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
