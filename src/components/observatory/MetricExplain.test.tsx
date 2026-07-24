// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MetricExplain } from "./MetricExplain";
import { xirrExplanation } from "@/lib/observatory/metric-explanations";

function mockMatchMedia(reduced: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("prefers-reduced-motion") ? reduced : false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

const explanation = xirrExplanation({
  xirrPct: 0.1234,
  historyDays: 30,
  dailyChangeAsOf: "2026-07-23",
  pricesAsOf: "2026-07-23",
});

afterEach(cleanup);
beforeEach(() => mockMatchMedia(false));

describe("MetricExplain", () => {
  it("starts collapsed and uses a native button for click, Enter, Space, and touch activation", () => {
    render(
      <MetricExplain explanation={explanation} permalink="/share?chapter=lab&explain=xirr" />,
    );
    const trigger = screen.getByRole("button", { name: "Explain XIRR" });
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("region")).toBeNull();
  });

  it("opens on click, updates aria-expanded, focuses its heading, and preserves the permalink", async () => {
    render(
      <MetricExplain explanation={explanation} permalink="/share?chapter=lab&explain=xirr" />,
    );
    const trigger = screen.getByRole("button", { name: "Explain XIRR" });
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    const heading = screen.getByRole("heading", {
      name: "XIRR (annualized return)",
    });
    await waitFor(() => expect(document.activeElement).toBe(heading));
    expect(
      screen
        .getByRole("link", { name: "Link to this explanation" })
        .getAttribute("href"),
    ).toBe("/share?chapter=lab&explain=xirr");
    expect(screen.getByText("Limited:")).not.toBeNull();
  });

  it.each(["Enter", " "])(
    "uses native %s button activation to open",
    async (key) => {
      render(
        <MetricExplain
          explanation={explanation}
          permalink="/share?chapter=lab&explain=xirr"
        />,
      );
      const trigger = screen.getByRole("button", { name: "Explain XIRR" });
      trigger.focus();
      fireEvent.keyDown(trigger, { key });
      fireEvent.keyUp(trigger, { key });
      // jsdom does not synthesize a button's browser-default click from a
      // keyboard event, so invoke the same native activation that Enter/Space
      // dispatch in a browser.
      fireEvent.click(trigger);
      expect(trigger.getAttribute("aria-expanded")).toBe("true");
      await waitFor(() =>
        expect(document.activeElement).toBe(
          screen.getByRole("heading", { name: "XIRR (annualized return)" }),
        ),
      );
    },
  );

  it("closes on Escape and returns focus to the trigger", async () => {
    render(
      <MetricExplain explanation={explanation} permalink="/share?chapter=lab&explain=xirr" />,
    );
    const trigger = screen.getByRole("button", { name: "Explain XIRR" });
    fireEvent.click(trigger);
    fireEvent.keyDown(screen.getByRole("region"), { key: "Escape" });
    expect(screen.queryByRole("region")).toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it("closes with the visible Close button and returns focus", async () => {
    render(
      <MetricExplain explanation={explanation} permalink="/share?chapter=lab&explain=xirr" />,
    );
    const trigger = screen.getByRole("button", { name: "Explain XIRR" });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("region")).toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it("opens initially, focuses the heading, and disables animation under reduced motion", async () => {
    mockMatchMedia(true);
    render(
      <MetricExplain
        explanation={explanation}
        permalink="/share?chapter=lab&explain=xirr"
        initiallyOpen
      />,
    );
    const region = screen.getByRole("region");
    expect(region.getAttribute("data-reduced-motion")).toBe("true");
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("heading", { name: "XIRR (annualized return)" }),
      ),
    );
  });
});
