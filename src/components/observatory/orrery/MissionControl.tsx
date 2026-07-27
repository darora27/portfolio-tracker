import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./orrery.module.css";

export const MISSION_CONTROL_PANELS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "history", label: "History" },
  { id: "trades", label: "Trades" },
  { id: "research", label: "Research" },
] as const;

export type MissionControlPanelId =
  (typeof MISSION_CONTROL_PANELS)[number]["id"];

export function MissionControl({
  activePanel,
  mode,
  content,
  closeHref,
  preservedQuery,
}: {
  activePanel: MissionControlPanelId;
  mode: "public" | "private";
  content: ReactNode;
  closeHref: string;
  preservedQuery?: Record<string, string>;
}) {
  return (
    <section
      className={styles.missionControl}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mission-control-title"
      data-mode={mode}
    >
      <header>
        <div>
          <p className={styles.inspectorKicker}>
            Command camera / {mode === "private" ? "owner authenticated" : "public-safe"}
          </p>
          <h2 id="mission-control-title" tabIndex={-1}>Mission Control</h2>
        </div>
        <Link href={closeHref} prefetch={false} scroll={false} className={styles.hudButton}>
          Return to universe
        </Link>
      </header>
      <nav aria-label="Mission Control sections">
        {MISSION_CONTROL_PANELS.map((panel) => (
          <Link
            key={panel.id}
            href={`/share?${new URLSearchParams({
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
      <div className={styles.missionContent}>{content}</div>
    </section>
  );
}
