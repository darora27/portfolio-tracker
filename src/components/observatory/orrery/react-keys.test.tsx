// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MultiReturnPlot, ReturnInstrument } from "./ReturnInstrument";

/**
 * R7-W9. The red "1 issue" badge in the dev overlay.
 *
 * Fable read it as a missing key on a MissionControl list. It isn't — every
 * `.map()` returning JSX under MissionControl, OrreryWorld and the room
 * content is keyed. What was actually wrong is the other half of the same
 * React warning: a DUPLICATE key.
 *
 * The gridlines on both return plots were keyed by the value they mark. Seven
 * distinct numbers, normally. But when a series is flat — a single data point,
 * a holding bought today, a weekend where nothing moved — min and max collapse
 * onto each other and all seven steps evaluate to the same figure, so all
 * seven <g> elements claim the same key. React logs "Encountered two children
 * with the same key" and the badge lights up.
 *
 * TWO THINGS THIS FILE HAD TO GET RIGHT, and the first draft got one wrong.
 *
 * 1. It renders on the CLIENT. The first version used `renderToStaticMarkup`
 *    like its neighbours, which would have passed against the broken code:
 *    the duplicate-key warning comes from the reconciler walking a keyed
 *    array, and the server renderer never reconciles. A green test proving
 *    nothing is worse than no test.
 *
 * 2. It carries a positive control. `expect([]).toEqual([])` also passes when
 *    the detection is silently broken — a React version that stopped warning,
 *    a spy attached to the wrong console, a dedupe that swallows the second
 *    occurrence. The first test below renders a deliberately duplicated key
 *    and asserts the spy DOES catch it. If that one ever goes green-by-
 *    silence, every assertion under it is void, and it will fail first.
 *
 * What this file proves: the duplicate is gone, because these cases would
 * fail against the previous code. What it does NOT prove: that this was the
 * only warning behind the badge. That needs the dev overlay, which is his to
 * read.
 */

const FLAT_DATES = ["2026-07-20", "2026-07-21", "2026-07-22"] as const;

type ConsoleSpy = { mock: { calls: unknown[][] } };

function keyWarnings(spy: ConsoleSpy): string[] {
  return spy.mock.calls
    .map((call: unknown[]) => call.map((part) => String(part)).join(" "))
    .filter((message: string) => /same key|unique "key"/i.test(message));
}

describe("R7-W9: return plots emit no React key warnings", () => {
  let errorSpy: ConsoleSpy & { mockRestore: () => void };

  beforeEach(() => {
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {}) as unknown as
      ConsoleSpy & { mockRestore: () => void };
  });
  afterEach(() => {
    errorSpy.mockRestore();
    cleanup();
  });

  it("CONTROL: the spy really does catch a duplicate key (if this fails, ignore every result below it)", () => {
    const duplicated = [1, 1, 1];
    render(
      <ul>
        {duplicated.map((value) => (
          <li key={value}>{value}</li>
        ))}
      </ul>,
    );
    expect(keyWarnings(errorSpy).length).toBeGreaterThan(0);
  });

  it("ReturnInstrument survives a flat series, where min and max collapse", () => {
    render(
      <ReturnInstrument
        points={FLAT_DATES.map((date) => ({ date, index: 100 }))}
        initialRange="max"
        ariaLabel="flat single-series plot"
      />,
    );
    expect(keyWarnings(errorSpy)).toEqual([]);
  });

  it("MultiReturnPlot survives a flat series", () => {
    render(
      <MultiReturnPlot
        dates={FLAT_DATES}
        series={[
          {
            id: "portfolio",
            label: "PORTFOLIO",
            color: "#F4F0DF",
            values: [100, 100, 100],
          },
        ]}
        ariaLabel="flat multi-series plot"
      />,
    );
    expect(keyWarnings(errorSpy)).toEqual([]);
  });

  it("MultiReturnPlot survives a single point, the narrowest span there is", () => {
    render(
      <MultiReturnPlot
        dates={["2026-07-22"]}
        series={[
          { id: "portfolio", label: "PORTFOLIO", color: "#F4F0DF", values: [100] },
          { id: "voo", label: "VOO", color: "#8FB8D8", values: [100], dashed: true },
        ]}
        ariaLabel="single-point plot"
      />,
    );
    expect(keyWarnings(errorSpy)).toEqual([]);
  });

  it("still emits no key warnings on an ordinary moving series", () => {
    render(
      <MultiReturnPlot
        dates={FLAT_DATES}
        series={[
          { id: "portfolio", label: "PORTFOLIO", color: "#F4F0DF", values: [100, 103.5, 98.2] },
          { id: "voo", label: "VOO", color: "#8FB8D8", values: [100, 101, 100.4], dashed: true },
        ]}
        ariaLabel="moving plot"
      />,
    );
    expect(keyWarnings(errorSpy)).toEqual([]);
  });
});
