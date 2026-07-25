"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/components/ui/usePrefersReducedMotion";
import type { MetricExplanation } from "@/lib/observatory/metric-explanations";
import styles from "./metric-disclosure.module.css";

export type MetricDisclosureProps = {
  explanation: MetricExplanation;
  permalink: string;
  initiallyOpen?: boolean;
};

export function MetricDisclosure({
  explanation,
  permalink,
  initiallyOpen = false,
}: MetricDisclosureProps) {
  const [open, setOpen] = useState(initiallyOpen);
  const prefersReducedMotion = usePrefersReducedMotion();
  const reactId = useId();
  const panelId = `dashboard-metric-panel-${reactId}`;
  const headingId = `dashboard-metric-heading-${reactId}`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (open) headingRef.current?.focus();
  }, [open]);

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <section
      className={styles.metric}
      data-open={open ? "true" : "false"}
      onKeyDown={(event) => {
        if (open && event.key === "Escape") {
          event.preventDefault();
          close();
        }
      }}
    >
      <div className={styles.compact}>
        <strong className={styles.value}>{explanation.currentValue.formatted}</strong>
        <span className={styles.label}>{explanation.shortLabel}</span>
        <button
          ref={triggerRef}
          type="button"
          className={styles.trigger}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((current) => !current)}
        >
          Explain {explanation.shortLabel}
          <span aria-hidden="true">{open ? "−" : "+"}</span>
        </button>
      </div>

      {open ? (
        <div
          id={panelId}
          className={styles.panel}
          role="region"
          aria-labelledby={headingId}
          data-reduced-motion={prefersReducedMotion ? "true" : "false"}
        >
          <h3 id={headingId} ref={headingRef} tabIndex={-1}>
            {explanation.name}
          </h3>
          <p>{explanation.definition}</p>
          <p className={styles.currentValue}>
            <strong>
              {explanation.currentValue.formatted} {explanation.currentValue.window}.
            </strong>{" "}
            As of {explanation.currentValue.asOf}.
          </p>
          {explanation.interpretation.status !== "contextual" ? (
            <p className={styles.status}>
              <strong>
                {explanation.interpretation.status === "limited"
                  ? "Limited: "
                  : "Unavailable: "}
              </strong>
              {explanation.interpretation.summary}
            </p>
          ) : (
            <p>{explanation.interpretation.summary}</p>
          )}
          {explanation.interpretation.evidence.length > 0 ? (
            <ul>
              {explanation.interpretation.evidence.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
          <p className={styles.relevance}>{explanation.whyItMattersHere}</p>
          {explanation.limitations.length > 0 ? (
            <div>
              <h4>Limitations</h4>
              <ul>
                {explanation.limitations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <details className={styles.calcDetails}>
            <summary>View calculation</summary>
            <dl>
              <div>
                <dt>Formula</dt>
                <dd>{explanation.calculation.formulaLabel}</dd>
              </div>
              <div>
                <dt>Inputs</dt>
                <dd>
                  <ul>
                    {explanation.calculation.inputLabels.map((input) => (
                      <li key={input}>{input}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt>Method</dt>
                <dd>{explanation.calculation.methodReference}</dd>
              </div>
            </dl>
          </details>
          <p className={styles.freshness}>{explanation.sourceFreshness}</p>
          <div className={styles.actions}>
            <Link href={permalink}>Link to this explanation</Link>
            <button type="button" onClick={close}>
              Close
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
