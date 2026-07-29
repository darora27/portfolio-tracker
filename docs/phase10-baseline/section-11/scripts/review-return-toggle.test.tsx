// @vitest-environment jsdom
//
// §11 / BHV-15 · F4 — range detents must have consequence.
//
// HISTORY. This file was written during §11 review to *observe the defect*:
// SINCE BUY and MAX rendered the same figure and a byte-identical SVG path,
// so it asserted only that four detents existed and recorded whether two of
// them collapsed. Fable's owner-directed drop (a7f85ac) fixed the defect, so
// the original observation went stale — it still demanded four buttons, and
// the fix deliberately renders fewer.
//
// It is rewritten here, not retired, because the assertion worth keeping is
// the *contract*, and the round-5 rule behind it is easy to regress:
//
//   Where a toggle would have no consequence, the toggle is not there.
//
// Two cases pin it down:
//   A. No pre-purchase history (sinceIndex 0) — the SINCE window and the MAX
//      window are the same series, so only ONE of them may render. The
//      window-word detent outranks MAX, so MAX must be absent.
//   B. Pre-purchase history present (sinceIndex > 0) — SINCE is genuinely
//      shorter than MAX, so both render, with different figures AND different
//      plotted paths.
//
// Anything still rendering a dead MAX fails A. Anything collapsing a
// meaningful MAX fails B.

import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  ReturnInstrument,
  type ReturnInstrumentPoint,
} from "@/components/observatory/orrery/ReturnInstrument";

afterEach(cleanup);

const series = (length: number): ReturnInstrumentPoint[] =>
  Array.from({ length }, (_, index) => ({
    date: `2026-06-${String((index % 28) + 1).padStart(2, "0")}`,
    index: 100 + index * 0.35 + Math.sin(index / 3) * 2,
    benchmarkIndex: 100 + index * 0.14,
  }));

function observe() {
  const instrument = document.querySelector<HTMLElement>("[data-range]");
  return {
    range: instrument?.dataset.range ?? null,
    path: instrument?.dataset.chartSignature ?? null,
    heading: instrument?.querySelector("h3")?.textContent ?? "",
  };
}

// Scoped to the detent group on purpose: the instrument also renders a
// "VOO · SAME PERIOD" toggle, and an unscoped button query would count it.
const detentLabels = () => {
  const group = document.querySelector<HTMLElement>(
    '[aria-label="Return window"]',
  );
  if (!group) throw new Error("no Return window detent group rendered");
  return [...group.querySelectorAll("button")]
    .map((button) => button.textContent?.trim() ?? "")
    .filter(Boolean);
};

describe("§11 BHV-15 — every rendered detent changes the answer", () => {
  it("A. drops MAX when its window is identical to the SINCE window", () => {
    render(
      <ReturnInstrument
        points={series(64)}
        ariaLabel="Reviewer return instrument"
        sinceLabel="SINCE BUY"
        sinceIndex={0}
      />,
    );

    const labels = detentLabels();
    const evidence = {
      criterion: "BHV-15",
      case: "A · no pre-purchase history",
      rendered_detents: labels,
      max_rendered: labels.includes("MAX"),
      requirement:
        "SINCE and MAX span the same series, so only the window-word detent may render.",
    };
    console.log(`machine-readable: ${JSON.stringify(evidence)}`);

    expect(labels).toContain("SINCE BUY");
    expect(labels).not.toContain("MAX");
  });

  it("B. renders both, with a different figure and a different path, when SINCE is a real window", () => {
    const points = series(64);
    render(
      <ReturnInstrument
        points={points}
        ariaLabel="Reviewer return instrument"
        sinceLabel="SINCE BUY"
        sinceIndex={40}
      />,
    );

    const labels = detentLabels();
    expect(labels).toContain("SINCE BUY");
    expect(labels).toContain("MAX");

    const readings: Record<string, ReturnType<typeof observe>> = {};
    for (const label of ["SINCE BUY", "MAX"]) {
      fireEvent.click(screen.getByRole("button", { name: label }));
      readings[label] = observe();
    }

    const since = readings["SINCE BUY"];
    const max = readings["MAX"];
    const evidence = {
      criterion: "BHV-15",
      case: "B · pre-purchase history at sinceIndex 40 of 64",
      rendered_detents: labels,
      since: { range: since.range, heading: since.heading, path: since.path },
      max: { range: max.range, heading: max.heading, path: max.path },
      distinct_paths: since.path !== max.path,
      distinct_figures: since.heading !== max.heading,
      requirement:
        "Both detents render and each visibly changes the figure and the plotted shape.",
    };
    console.log(`machine-readable: ${JSON.stringify(evidence)}`);

    expect(since.range).not.toBe(max.range);
    // The defect this file was written to catch: identical plotted geometry.
    expect(since.path).not.toBe(max.path);
    expect(since.path).toBeTruthy();
    expect(max.path).toBeTruthy();
    expect(since.heading).not.toBe(max.heading);
  });

  it("C. never titles a window it does not span", () => {
    // Fable also fixed a 20-session series calling itself "30 DAYS".
    render(
      <ReturnInstrument
        points={series(20)}
        ariaLabel="Reviewer return instrument"
        sinceLabel="SINCE START"
        sinceIndex={0}
      />,
    );
    const labels = detentLabels();
    console.log(
      `machine-readable: ${JSON.stringify({
        criterion: "BHV-15",
        case: "C · 20 sessions",
        rendered_detents: labels,
        requirement: "A fixed-span detent only appears when the series spans it.",
      })}`,
    );
    expect(labels).not.toContain("30D");
  });
});
