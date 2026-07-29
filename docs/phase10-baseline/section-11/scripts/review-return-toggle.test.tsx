// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup } from "@testing-library/react";
import {
  ReturnInstrument,
  type ReturnInstrumentPoint,
} from "@/components/observatory/orrery/ReturnInstrument";

afterEach(cleanup);

const points: ReturnInstrumentPoint[] = Array.from(
  { length: 64 },
  (_, index) => ({
    date: `2026-06-${String((index % 28) + 1).padStart(2, "0")}`,
    index: 100 + index * 0.35 + Math.sin(index / 3) * 2,
    benchmarkIndex: 100 + index * 0.14,
  }),
);

function observation() {
  const instrument = document.querySelector<HTMLElement>("[data-range]");
  const heading = instrument?.querySelector("h3")?.textContent ?? "";
  return {
    range: instrument?.dataset.range ?? null,
    path: instrument?.dataset.chartSignature ?? null,
    heading,
  };
}

describe("§11 reviewer range-toggle observation", () => {
  it("records the rendered signature and answer for all four detents", () => {
    render(
      <ReturnInstrument
        points={points}
        ariaLabel="Reviewer return instrument"
      />,
    );

    const rows = [];
    for (const label of ["7D", "30D", "SINCE BUY", "MAX"]) {
      fireEvent.click(screen.getByRole("button", { name: label }));
      rows.push({ label, ...observation() });
    }

    const output = {
      criterion: "BHV-15",
      requirement:
        "Each range must visibly change both the title figure and plotted shape.",
      rows,
      sinceAndMaxSamePath: rows[2].path === rows[3].path,
      sinceAndMaxSameFigure:
        rows[2].heading.replace("SINCE BUY", "") ===
        rows[3].heading.replace("MAX", ""),
      result:
        rows[2].path === rows[3].path &&
        rows[2].heading.replace("SINCE BUY", "") ===
          rows[3].heading.replace("MAX", "")
          ? "fail"
          : "pass",
    };
    console.log(JSON.stringify(output));
    expect(rows).toHaveLength(4);
    expect(new Set(rows.map(({ range }) => range)).size).toBe(4);
    expect(["pass", "fail"]).toContain(output.result);
  });
});
