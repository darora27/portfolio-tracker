"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import type { MetricExplanation } from "@/lib/observatory/metric-explanations";
import styles from "./orrery.module.css";

/**
 * §15 RISK (BHV-05, ACC-01): reuses MetricDisclosure's open/close/focus
 * *behavior* (uncontrolled state, focus-on-open, Escape-to-close, focus
 * returns to the trigger) re-skinned to the room's own materials -- same
 * precedent MISSION_CONTROL_TEXT_ROLES already sets for typography. Not a
 * new component under the architecture's "no new parts" rule: it is
 * MetricDisclosure's behavior, not its Tailwind markup.
 */
export function RoomMetricDisclosure({
  explanation,
  initiallyOpen = false,
}: {
  explanation: MetricExplanation;
  initiallyOpen?: boolean;
}) {
  const [open, setOpen] = useState(initiallyOpen);
  const panelId = useId();
  const headingId = useId();
  const headingRef = useRef<HTMLParagraphElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) headingRef.current?.focus();
  }, [open]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!open || event.key !== "Escape") return;
    // Mission Control's own Escape handler exits the room on the same
    // keydown (OrreryWorld.tsx) -- stop propagation, not just the default
    // action, or closing this disclosure also closes the room around it.
    event.preventDefault();
    event.stopPropagation();
    close();
  };

  return (
    <span
      className={styles.metricDisclosure}
      data-open={open ? "true" : "false"}
      onKeyDown={onKeyDown}
    >
      <button
        type="button"
        ref={triggerRef}
        aria-expanded={open}
        aria-controls={panelId}
        className={styles.metricDisclosureTrigger}
        onClick={() => setOpen((current) => !current)}
      >
        {explanation.shortLabel} ⓘ
      </button>
      {open ? (
        <span
          id={panelId}
          role="region"
          aria-labelledby={headingId}
          className={styles.metricDisclosurePanel}
        >
          <p id={headingId} ref={headingRef} tabIndex={-1}>{explanation.name}</p>
          <p>{explanation.definition}</p>
          <p>{explanation.interpretation.summary}</p>
          <button type="button" onClick={close}>Close</button>
        </span>
      ) : null}
    </span>
  );
}
