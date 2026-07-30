// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Legend, UNIVERSE_LEGEND_EVENT, UNIVERSE_LEGEND_STORAGE_KEY } from "./Legend";

beforeEach(() => {
  localStorage.clear();
});

afterEach(cleanup);

describe("Legend", () => {
  it("appears on first visit, dismisses on first interaction, and never replays after a reload", () => {
    const { unmount } = render(<Legend />);
    expect(screen.getByText(/SUN = WHOLE PORTFOLIO/)).toBeTruthy();

    fireEvent.pointerDown(window);
    expect(screen.queryByText(/SUN = WHOLE PORTFOLIO/)).toBeNull();
    expect(localStorage.getItem(UNIVERSE_LEGEND_STORAGE_KEY)).toBe("true");

    unmount();
    render(<Legend />);
    expect(screen.queryByText(/SUN = WHOLE PORTFOLIO/)).toBeNull();
  });

  it("is summonable via the legend event after being dismissed", () => {
    render(<Legend />);
    fireEvent.pointerDown(window);
    expect(screen.queryByText(/SUN = WHOLE PORTFOLIO/)).toBeNull();

    fireEvent(window, new Event(UNIVERSE_LEGEND_EVENT));
    expect(screen.getByText(/SUN = WHOLE PORTFOLIO/)).toBeTruthy();

    fireEvent.keyDown(window, { key: "Enter" });
    expect(screen.queryByText(/SUN = WHOLE PORTFOLIO/)).toBeNull();
  });

  it("never renders while disabled", () => {
    render(<Legend disabled />);
    expect(screen.queryByText(/SUN = WHOLE PORTFOLIO/)).toBeNull();
  });
});
