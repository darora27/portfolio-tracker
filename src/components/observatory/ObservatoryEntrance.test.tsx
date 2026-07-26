// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  OBSERVATORY_ENTRANCE_DURATION_MS,
  ObservatoryEntrance,
} from "./ObservatoryEntrance";

function stubMedia(desktop = true, reducedMotion = false) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("min-width") ? desktop : reducedMotion,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

beforeEach(() => {
  window.sessionStorage.clear();
  stubMedia();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("ObservatoryEntrance", () => {
  it("keeps content present while offering a bounded, skippable first arrival", () => {
    render(
      <ObservatoryEntrance mode="public">
        <h1>Portfolio Observatory</h1>
      </ObservatoryEntrance>,
    );

    expect(screen.getByRole("heading", { level: 1 })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Skip intro" })).toBeTruthy();
    expect(OBSERVATORY_ENTRANCE_DURATION_MS).toBeLessThanOrEqual(3000);
  });

  it("ends and stores the flag on button activation", () => {
    render(
      <ObservatoryEntrance mode="public">
        <p>Content</p>
      </ObservatoryEntrance>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Skip intro" }));
    expect(screen.queryByRole("button", { name: "Skip intro" })).toBeNull();
    expect(window.sessionStorage.getItem("observatory-entrance-seen-public")).toBe("true");
  });

  it("ends on document pointer or key input", () => {
    const { rerender } = render(
      <ObservatoryEntrance mode="public">
        <p>Content</p>
      </ObservatoryEntrance>,
    );
    fireEvent.pointerDown(window);
    expect(screen.queryByRole("button", { name: "Skip intro" })).toBeNull();

    window.sessionStorage.clear();
    rerender(
      <ObservatoryEntrance mode="private">
        <p>Content</p>
      </ObservatoryEntrance>,
    );
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("button", { name: "Skip intro" })).toBeNull();
  });

  it("renders no arrival after the session flag, below 1024px, under reduced motion, or when disabled", () => {
    window.sessionStorage.setItem("observatory-entrance-seen-public", "true");
    const { rerender } = render(
      <ObservatoryEntrance mode="public">
        <p>Content</p>
      </ObservatoryEntrance>,
    );
    expect(screen.queryByRole("button", { name: "Skip intro" })).toBeNull();

    window.sessionStorage.clear();
    stubMedia(false, false);
    rerender(
      <ObservatoryEntrance mode="private">
        <p>Content</p>
      </ObservatoryEntrance>,
    );
    expect(screen.queryByRole("button", { name: "Skip intro" })).toBeNull();

    stubMedia(true, true);
    rerender(
      <ObservatoryEntrance mode="public">
        <p>Content</p>
      </ObservatoryEntrance>,
    );
    expect(screen.queryByRole("button", { name: "Skip intro" })).toBeNull();

    stubMedia();
    rerender(
      <ObservatoryEntrance mode="private" disabled>
        <p>Content</p>
      </ObservatoryEntrance>,
    );
    expect(screen.queryByRole("button", { name: "Skip intro" })).toBeNull();
  });
});
