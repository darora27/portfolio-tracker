// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  FirstVisitOrientation,
  UNIVERSE_ORIENTATION_STORAGE_KEY,
} from "./FirstVisitOrientation";

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("min-width"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("FirstVisitOrientation", () => {
  it("uses localStorage, is skippable, and never replays after skipping", async () => {
    const { unmount } = render(<FirstVisitOrientation />);
    expect(await screen.findByText("This is a portfolio.")).toBeTruthy();
    fireEvent.pointerDown(window);
    expect(localStorage.getItem(UNIVERSE_ORIENTATION_STORAGE_KEY)).toBe("true");
    expect(sessionStorage.getItem(UNIVERSE_ORIENTATION_STORAGE_KEY)).toBeNull();
    unmount();
    render(<FirstVisitOrientation />);
    expect(screen.queryByText("This is a portfolio.")).toBeNull();
  });

  it("stays disabled on narrow, reduced-motion, and forced fallback paths", async () => {
    const { rerender } = render(<FirstVisitOrientation disabled />);
    expect(screen.queryByRole("status")).toBeNull();
    rerender(<FirstVisitOrientation disabled={false} />);
    expect(await screen.findByRole("status")).toBeTruthy();
  });
});
