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
}) {
  const [activeTicker, setActiveTicker] = useState<string | null>(null);
  const resolveManifestTicker = useCallback((target: EventTarget | null) => {
    const element = target instanceof Element
      ? target.closest<HTMLElement>("[data-manifest-ticker]")
      : null;
    setActiveTicker(element?.dataset.manifestTicker ?? null);
  }, []);

  return (
    <section
      className={styles.missionControl}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mission-control-title"
      data-mode={mode}
      onPointerOver={(event: PointerEvent<HTMLElement>) =>
        resolveManifestTicker(event.target)
      }
      onPointerLeave={() => setActiveTicker(null)}
      onFocusCapture={(event: FocusEvent<HTMLElement>) =>
        resolveManifestTicker(event.target)
      }
      onBlurCapture={(event: FocusEvent<HTMLElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setActiveTicker(null);
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
          <span>PLOT FEED</span>
          <SystemPlot
            holdings={holdings}
            activeTicker={activeTicker}
            health={health}
          />
        </aside>
        <div className={styles.missionContent}>{content}</div>
      </div>
    </section>
  );
}
