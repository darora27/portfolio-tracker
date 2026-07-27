// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
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
    expect(screen.getByText("Axial spin")).toBeTruthy();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
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
