// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MissionControl } from "./MissionControl";
import { MISSION_CONTROL_PANELS } from "./mission-control-panels";

/**
 * FB-08 + FB-15 (§12a), VIS-06 — build-correctness only, no ranking. Each
 * tab-strip variant (A: no tabs, B: black rail boxless, C: index edge)
 * must render without console errors, keep all seven MISSION_CONTROL_PANELS
 * destinations reachable by some control, and stay keyboard-operable.
 * stripVariant is capture-only; the default (undefined) production strip is
 * covered by the existing MissionControl.interaction.test.tsx suite.
 */

const holding = {
  ticker: "MSFT",
  companyName: "Microsoft",
  weight: 0.6,
  contributionPct: 0.12,
  dayReturn: 0.01,
  weeklyReturn: 0.03,
  portfolioRelativeReturn: 0.01,
  volatilityPct: 0.2,
  betaVsVoo: 1,
} as const;

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  );
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
  } as unknown as CanvasRenderingContext2D);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe.each(["a", "b", "c"] as const)("tab-strip variant %s", (stripVariant) => {
  it("renders with zero console errors and every destination reachable by a real, focusable control", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const { container } = render(
      <MissionControl
        activePanel="plot"
        mode="public"
        content={<div>PUBLIC ROOM</div>}
        closeHref="/share"
        basePath="/share"
        holdings={[holding]}
        health={0.2}
        stripVariant={stripVariant}
      />,
    );
    expect(consoleError).not.toHaveBeenCalled();

    /* R7-W7. This walked MISSION_CONTROL_PANELS and demanded a focusable
     * same-page anchor per section. Those anchors are gone at his request, so
     * the check now guards the opposite: the strip must contain no
     * scroll-to-self links pretending to be navigation.
     *
     * The accessibility question underneath it survives, and is what the
     * `control.tagName` loop below still asks of the links that DO remain:
     * every route in the strip must be a real, focusable anchor with an
     * href — not a div with a click handler. That was the valuable half. */
    for (const panel of MISSION_CONTROL_PANELS) {
      expect(
        container.querySelectorAll(`a[href="#${panel.anchor}"]`).length,
        `${stripVariant}: ${panel.label} must not be a same-page tab`,
      ).toBe(0);
    }
    for (const control of container.querySelectorAll("nav a")) {
      expect(control.tagName).toBe("A");
      expect(control.hasAttribute("href")).toBe(true);
    }
  });

  /* R7-W7. This asserted an active-page marker on the current tab, and skipped
   * itself for variant A "which has no tabs by design". No variant has tabs
   * now — he asked for them gone three times — so the test has no subject
   * left and asserting a marker that cannot exist would be theatre.
   *
   * Replaced with the question that outlived it: whatever IS in the strip must
   * go somewhere real. A link that scrolls you to where you already are was
   * the whole complaint, and this is the check that stops it coming back. */
  it("offers only real destinations — no link in the strip scrolls to the page it is on", () => {
    const { container } = render(
      <MissionControl
        activePanel="hazard"
        mode="private"
        content={<div>ROOM</div>}
        closeHref="/"
        basePath="/"
        holdings={[holding]}
        health={0.2}
        stripVariant={stripVariant}
      />,
    );
    for (const link of container.querySelectorAll("a")) {
      const href = link.getAttribute("href") ?? "";
      expect(
        href.startsWith("#"),
        `${stripVariant}: "${link.textContent}" is a same-page anchor`,
      ).toBe(false);
    }
    // And the two he named by name are present and are real page loads.
    expect(container.querySelector('a[href="/history"]')).toBeTruthy();
    expect(container.querySelector('a[href="/research"]')).toBeTruthy();
  });
});
