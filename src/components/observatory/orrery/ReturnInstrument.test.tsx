// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  ReturnInstrument,
  type ReturnInstrumentPoint,
} from "./ReturnInstrument";

/**
 * §11 review F4 — every visible range detent must change both the figure
 * and the plotted shape. Two behaviours under test:
 *
 * 1. When two windows produce an identical series (a holding's chart
 *    starts at purchase, so SINCE BUY == MAX today), the redundant detent
 *    is NOT rendered — round 5's rule: a toggle with no consequence isn't
 *    there.
 * 2. When pre-purchase history exists (`sinceIndex` > 0 — the Chart
 *    Room's longer series), SINCE BUY and MAX both render and produce
 *    distinct answers and distinct paths.
 */

function fixture(count: number, start = 100, step = 1.4): ReturnInstrumentPoint[] {
  return Array.from({ length: count }, (_, index) => ({
    date: `2026-06-${String(index + 1).padStart(2, "0")}`,
    index: start + index * step,
  }));
}

afterEach(cleanup);

describe("ReturnInstrument range detents (F4)", () => {
  it("hides MAX when it cannot differ from the since-window", () => {
    render(
      <ReturnInstrument
        points={fixture(20)}
        initialRange="since"
        ariaLabel="fixture"
      />,
    );
    expect(screen.getByRole("button", { name: "SINCE BUY" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "MAX" })).toBeNull();
  });

  it("renders distinct figures and paths for every visible detent when windows differ", () => {
    const { container } = render(
      <ReturnInstrument
        points={fixture(45)}
        sinceIndex={30}
        initialRange="max"
        ariaLabel="fixture"
      />,
    );
    const instrument = container.querySelector("section")!;
    const seen: Array<{ title: string; path: string }> = [];
    for (const label of ["7D", "30D", "SINCE BUY", "MAX"]) {
      const detent = screen.getByRole("button", { name: label });
      fireEvent.click(detent);
      seen.push({
        title: instrument.querySelector("h3")!.textContent ?? "",
        path: instrument.getAttribute("data-chart-signature") ?? "",
      });
    }
    const titles = new Set(seen.map(({ title }) => title));
    const paths = new Set(seen.map(({ path }) => path));
    expect(titles.size).toBe(4);
    expect(paths.size).toBe(4);
  });

  it("speaks the book's window word on the room instrument", () => {
    render(
      <ReturnInstrument
        points={fixture(20)}
        sinceLabel="SINCE START"
        initialRange="since"
        ariaLabel="fixture"
      />,
    );
    expect(screen.getByRole("button", { name: "SINCE START" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "SINCE BUY" })).toBeNull();
  });
});
