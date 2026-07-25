// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { betaExplanation } from "@/lib/observatory/metric-explanations";
import { MetricDisclosure } from "./MetricDisclosure";

function mockMatchMedia(reduced: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("prefers-reduced-motion") ? reduced : false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

const explanation = betaExplanation({
  betaVsVoo: 1.12,
  historyDays: 120,
  dailyChangeAsOf: "2026-07-23",
  pricesAsOf: "2026-07-23",
});

afterEach(cleanup);
beforeEach(() => mockMatchMedia(false));

describe("MetricDisclosure", () => {
  it("starts collapsed behind a visibly labeled native button", () => {
    render(<MetricDisclosure explanation={explanation} permalink="/permalink" />);
    const trigger = screen.getByRole("button", { name: "Explain Beta" });
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("region")).toBeNull();
  });

  it("opens through native activation, updates state, focuses the heading, and keeps the permalink", async () => {
    render(
      <MetricDisclosure
        explanation={explanation}
        permalink="/dashboard?mode=analytics&explain=beta#risk"
      />,
    );
    const trigger = screen.getByRole("button", { name: "Explain Beta" });
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("heading", { name: "Beta vs. VOO" })),
    );
    expect(screen.getByRole("link", { name: "Link to this explanation" }).getAttribute("href"))
      .toBe("/dashboard?mode=analytics&explain=beta#risk");
  });

  it("uses a native button, whose Enter and Space activation contract is browser-provided", () => {
    render(<MetricDisclosure explanation={explanation} permalink="/permalink" />);
    const trigger = screen.getByRole("button", { name: "Explain Beta" });
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger.getAttribute("type")).toBe("button");
  });

  it("closes with Escape or Close and returns focus to the trigger", async () => {
    render(<MetricDisclosure explanation={explanation} permalink="/permalink" initiallyOpen />);
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("heading", { name: "Beta vs. VOO" })),
    );
    fireEvent.keyDown(screen.getByRole("region"), { key: "Escape" });
    const trigger = screen.getByRole("button", { name: "Explain Beta" });
    expect(document.activeElement).toBe(trigger);
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(document.activeElement).toBe(trigger);
  });

  it("skips animation for reduced motion and focuses an initially open heading", async () => {
    mockMatchMedia(true);
    render(<MetricDisclosure explanation={explanation} permalink="/permalink" initiallyOpen />);
    expect(screen.getByRole("region").getAttribute("data-reduced-motion")).toBe("true");
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("heading", { name: "Beta vs. VOO" })),
    );
  });
});
