// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UNIVERSE_LEGEND_EVENT } from "./Legend";
import { SystemsManual } from "./SystemsManual";

afterEach(cleanup);

describe("SystemsManual", () => {
  it("opens from the question-mark key and restores focus after Escape", () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const { rerender } = render(
      <SystemsManual open={false} onOpen={onOpen} onClose={onClose} />,
    );
    fireEvent.keyDown(window, { key: "?" });
    expect(onOpen).toHaveBeenCalledOnce();

    rerender(<SystemsManual open onOpen={onOpen} onClose={onClose} />);
    expect(screen.getByRole("dialog", { name: "Systems manual" })).toBeTruthy();
    expect(screen.queryByText("Axial spin")).toBeNull();
    expect(screen.getByText("Trail lightness")).toBeTruthy();
    expect(screen.getAllByText(/Trailing-week magnitude within gain/)).toHaveLength(1);
    expect(screen.getByRole("button", { name: "SHOW ORIENTATION" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "SHOW LEGEND" })).toBeTruthy();
    expect(screen.getByText("Weather wisps")).toBeTruthy();
    expect(screen.getByText(/magenta means positive health/)).toBeTruthy();
    expect(screen.getByText("Radar sweep")).toBeTruthy();
    expect(screen.getByText(/60-second live-quote refresh/)).toBeTruthy();
    expect(screen.getByText("Aurora band")).toBeTruthy();
    expect(screen.getByText(/percent only/)).toBeTruthy();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("summons the legend and closes the manual when SHOW LEGEND is clicked", () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const onLegendEvent = vi.fn();
    window.addEventListener(UNIVERSE_LEGEND_EVENT, onLegendEvent);
    render(<SystemsManual open onOpen={onOpen} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "SHOW LEGEND" }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(onLegendEvent).toHaveBeenCalledOnce();
    window.removeEventListener(UNIVERSE_LEGEND_EVENT, onLegendEvent);
  });

  it("does not steal question-mark input from a text field", () => {
    const onOpen = vi.fn();
    render(
      <>
        <input aria-label="Notes" />
        <SystemsManual open={false} onOpen={onOpen} onClose={vi.fn()} />
      </>,
    );
    fireEvent.keyDown(screen.getByRole("textbox", { name: "Notes" }), {
      key: "?",
    });
    expect(onOpen).not.toHaveBeenCalled();
  });
});
