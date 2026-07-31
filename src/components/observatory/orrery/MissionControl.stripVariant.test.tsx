// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
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

    for (const panel of MISSION_CONTROL_PANELS) {
      const controls = container.querySelectorAll(`a[href="#${panel.anchor}"]`);
      expect(controls.length, `${stripVariant}: ${panel.label} reachable`).toBeGreaterThanOrEqual(1);
      for (const control of controls) {
        // A real, focusable, keyboard-operable anchor -- not a div/span with
        // a click handler and no tab stop.
        expect(control.tagName).toBe("A");
        expect(control.hasAttribute("href")).toBe(true);
      }
    }
  });

  it.skipIf(stripVariant === "a")(
    "keeps an active-page marker for the current panel where a tab surface exists (variant A has no tabs by design)",
    () => {
      render(
        <MissionControl
          activePanel="hazard"
          mode="public"
          content={<div>PUBLIC ROOM</div>}
          closeHref="/share"
          basePath="/share"
          holdings={[holding]}
          health={0.2}
          stripVariant={stripVariant}
        />,
      );
      const current = screen.getAllByText(/RISK/).filter(
        (el) => el.closest("a")?.getAttribute("aria-current") === "page",
      );
      expect(current.length).toBeGreaterThanOrEqual(1);
    },
  );
});
