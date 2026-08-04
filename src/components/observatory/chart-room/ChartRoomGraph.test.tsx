// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ChartRoomGraph } from "./ChartRoomGraph";

const priceHistory = [
  { date: "2026-06-01", price: 100 },
  { date: "2026-07-01", price: 110 },
  { date: "2026-07-08", price: 108 },
  { date: "2026-07-15", price: 112 },
  { date: "2026-07-22", price: 109 },
  { date: "2026-07-29", price: 115 },
  { date: "2026-07-30", price: 116 },
];

const vooCloseHistory = priceHistory.map((p) => ({ date: p.date, price: 400 + p.price }));
const bookGrowthIndex = priceHistory.map((p) => ({ date: p.date, index: 1 + p.price / 1000 }));

const trades = [{ date: "2026-07-08", action: "buy", shares: 5, price: 108 }];

function renderGraph(overrides: Partial<Parameters<typeof ChartRoomGraph>[0]> = {}) {
  return render(
    <ChartRoomGraph
      priceHistory={priceHistory}
      vooCloseHistory={vooCloseHistory}
      bookGrowthIndex={bookGrowthIndex}
      trades={trades}
      firstTradeDate="2026-07-01"
      {...overrides}
    />,
  );
}

afterEach(cleanup);

describe("ChartRoomGraph", () => {
  it("defaults to 30D / RETURN / VOO on", () => {
    renderGraph();
    expect(screen.getByRole("button", { name: "30D" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "RETURN" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "VOO · SAME PERIOD" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText(/30 DAYS/)).toBeTruthy();
  });

  it("reslices the displayed series when a range detent is clicked (BHV-02)", () => {
    renderGraph();
    fireEvent.click(screen.getByRole("button", { name: "7D" }));
    expect(screen.getByRole("button", { name: "7D" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "30D" }).getAttribute("aria-pressed")).toBe("false");
    expect(screen.getByText(/7 DAYS/)).toBeTruthy();
  });

  it("switches the Y-axis basis between indexed-return and raw price (BHV-03)", () => {
    renderGraph();
    fireEvent.click(screen.getByRole("button", { name: "PRICE" }));
    expect(screen.getByRole("button", { name: "PRICE" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText(/· PRICE/)).toBeTruthy();
  });

  it("independently toggles each overlay via aria-pressed (BHV-04)", () => {
    renderGraph();
    const book = screen.getByRole("button", { name: "BOOK · SAME PERIOD" });
    expect(book.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(book);
    expect(book.getAttribute("aria-pressed")).toBe("true");

    const voo = screen.getByRole("button", { name: "VOO · SAME PERIOD" });
    fireEvent.click(voo);
    expect(voo.getAttribute("aria-pressed")).toBe("false");
  });

  it("renders nothing (not a fabricated line) for an overlay whose source is unavailable for the selected window", () => {
    const thinVoo = [{ date: "2026-07-29", price: 500 }];
    const { container } = renderGraph({ vooCloseHistory: thinVoo });
    expect(container.querySelector(`.bmk`)).toBeNull();
  });

  /* R7-W6 removed this test with the control it covered.
   *
   * It asserted that COST was a no-op outside PRICE mode — which is the
   * defect he described, not a behaviour worth keeping: "you overcomplicated
   * the graph with buttons that don't matter like depth and cost." A button
   * that does nothing in the default mode is the thing that got cut, so a
   * test pinning its no-op semantics is pinning the wrong half.
   *
   * Its replacement is the absence assertion at the bottom of this file. */

  it("renders an empty state, not a crash, when there is no history", () => {
    renderGraph({ priceHistory: [] });
    expect(screen.getByText(/Not enough history/)).toBeTruthy();
  });

  it("R7-W6: the controls he called noise are gone", () => {
    /* "you overcomplicated the graph with buttons that don't matter like
     * depth and cost." Eleven controls above one chart is not a chart with
     * options — it is a chart you configure before you can read it. Asserted
     * as absence so they cannot drift back in. */
    renderGraph();
    expect(screen.queryByRole("button", { name: /DEPTH/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /COST/ })).toBeNull();
    expect(screen.queryByText("OWNER")).toBeNull();

    /* Nine: four windows (7D/30D/SINCE BUY/MAX), two modes (RETURN/PRICE),
     * three overlays (VOO/BOOK/TRADES).
     *
     * This number was wrong in the first draft of this test — the comment
     * said six, the list came to eight, and the assertion said seven, none of
     * which matched the nine the component actually renders. It failed, which
     * is the one thing it did right. A cap is a drift guard, so it has to be
     * the real count; a cap picked from a sentence rather than from the
     * component is just a second bug waiting to fail.
     *
     * Whether nine is still too many is Devan's call, not this test's. If it
     * is, TRADES is the next candidate — it marks his buy points, so it
     * answers a question, but it is the only overlay that is not a
     * same-period comparison. */
    expect(screen.getAllByRole("button")).toHaveLength(9);
  });
});
