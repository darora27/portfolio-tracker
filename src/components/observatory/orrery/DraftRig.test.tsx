// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SIMULATIONS_BANNER } from "@/lib/compare-copy";
import { DraftRig } from "./DraftRig";

const holdings = [
  ["ASML", 0.264, 0.04],
  ["GOOG", 0.208, -0.01],
  ["MSFT", 0.125, 0.02],
  ["IBM", 0.083, -0.03],
  ["COST", 0.073, 0.01],
  ["INTC", 0.072, -0.02],
  ["NBIS", 0.038, 0.05],
  ["CBRS", 0.035, 0],
].map(([ticker, weight, weeklyReturn]) => ({
  ticker: ticker as string,
  companyName: ticker as string,
  weight: weight as number,
  weeklyReturn: weeklyReturn as number,
  portfolioRelativeReturn: 0,
  volatilityPct: 0.2,
  betaVsVoo: 1,
  dayReturn: 0,
}));

beforeEach(() => {
  window.history.replaceState({}, "", "/?focus=portfolio&camera=command");
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
  });
  window.sessionStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function weights(): number[] {
  return screen.getAllByRole("spinbutton").map(
    (input) => Number((input as HTMLInputElement).value),
  );
}

describe("DraftRig", () => {
  it("opens as the real book, keeps 100.0 by construction, and writes compact URL state", async () => {
    render(<DraftRig holdings={holdings} encodedDraft={null} onClose={vi.fn()} />);
    expect(screen.getByText(SIMULATIONS_BANNER)).toBeTruthy();
    expect(weights().reduce((sum, value) => sum + value, 0)).toBe(100);
    await waitFor(() => expect(new URL(window.location.href).searchParams.get("draft")).toMatch(
      /^(?:\d+\.){7}\d+$/,
    ));
    fireEvent.keyDown(screen.getByRole("button", { name: /ASML, .*Arrow keys/ }), {
      key: "ArrowRight",
    });
    expect(weights().reduce((sum, value) => sum + value, 0)).toBe(100);
    expect(new URL(window.location.href).searchParams.get("draft")).not.toBeNull();
    expect(screen.queryByText(/must total/i)).toBeNull();
    expect(screen.getByText("ASML 30.0%. Others adjusted.")).toBeTruthy();

    fireEvent.keyDown(screen.getByRole("button", { name: /ASML, .*Arrow keys/ }), {
      key: "Enter",
    });
    expect(document.activeElement).toBe(
      screen.getByRole("spinbutton", { name: "ASML" }),
    );
    expect(screen.getByText("ASML weight input opened.")).toBeTruthy();
  });

  it("supports keyboard siphon, ghost toggle, guarded reset, and a copyable link", async () => {
    const { container } = render(
      <DraftRig holdings={holdings} encodedDraft={null} onClose={vi.fn()} />,
    );
    const before = weights();
    fireEvent.keyDown(screen.getByRole("button", { name: /ASML, .*Arrow keys/ }), { key: " " });
    fireEvent.keyDown(screen.getByRole("button", { name: /GOOG, .*Arrow keys/ }), {
      key: "ArrowRight",
    });
    const after = weights();
    expect(after[0]).toBe(before[0] - 0.5);
    expect(after[1]).toBe(before[1] + 0.5);
    expect(after.slice(2)).toEqual(before.slice(2));

    expect(container.querySelectorAll("[data-draft-ghost=true]")).toHaveLength(8);
    expect(container.querySelectorAll("[data-real-notch=true]")).toHaveLength(8);
    fireEvent.click(screen.getByRole("switch", { name: "GHOST ON" }));
    expect(screen.getByRole("switch", { name: "GHOST OFF" })).toBeTruthy();
    expect(container.querySelectorAll("[data-draft-ghost=true]")).toHaveLength(0);

    fireEvent.click(screen.getByRole("button", { name: "COPY TEST LINK" }));
    await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining("draft="),
    ));

    fireEvent.click(screen.getByRole("button", { name: "RESET TO BOOK" }));
    const confirm = screen.getByRole("button", { name: "SURE? FLIP AGAIN" });
    fireEvent.click(confirm);
    expect(weights()).toEqual(before);
  });

  it("freezes motion but retains direction and trail encodings under reduced motion", async () => {
    vi.mocked(window.matchMedia).mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList);
    const { container } = render(
      <DraftRig holdings={holdings} encodedDraft={null} onClose={vi.fn()} />,
    );
    await waitFor(() => expect(
      container.querySelector("[data-reduced-motion=true]"),
    ).toBeTruthy());
    expect(screen.getByRole("switch", { name: "MOTION OFF" })).toBeTruthy();
    expect(container.querySelectorAll("[data-direction]")).toHaveLength(8);
    expect(container.querySelectorAll("[data-draft-direction=true]")).toHaveLength(8);
    expect(container.querySelectorAll("button[style*=\"--draft-trail\"]")).toHaveLength(8);
  });

  it("contains the byte-identical banner and no currency amount in rendered rig output", () => {
    const { container } = render(
      <DraftRig holdings={holdings} encodedDraft={null} onClose={vi.fn()} />,
    );
    expect(screen.getByText(SIMULATIONS_BANNER).textContent).toBe(SIMULATIONS_BANNER);
    expect(container.textContent).not.toMatch(/(?:[$€£¥]\s*\d|\bUSD\s+\d)/);
  });

  it("FB-12 / BHV-02: motion defaults OFF for a visitor with no reduced-motion OS preference", async () => {
    // beforeEach already stubs matchMedia matches:false (no OS preference).
    render(<DraftRig holdings={holdings} encodedDraft={null} onClose={vi.fn()} />);
    await waitFor(() => expect(
      screen.getByRole("switch", { name: "MOTION OFF" }),
    ).toBeTruthy());
  });

  it("FB-12 / BHV-02: reduced motion still locks the switch off and blocks manual re-enable", async () => {
    vi.mocked(window.matchMedia).mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList);
    render(<DraftRig holdings={holdings} encodedDraft={null} onClose={vi.fn()} />);
    const motionSwitch = await screen.findByRole("switch", { name: "MOTION OFF" });
    expect((motionSwitch as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(motionSwitch);
    expect(screen.getByRole("switch", { name: "MOTION OFF" })).toBeTruthy();
  });

  it("FB-12 / BHV-02: dish-lap speed stays within [30, 90]s and preserves inverse-magnitude ordering", () => {
    const { container } = render(
      <DraftRig holdings={holdings} encodedDraft={null} onClose={vi.fn()} />,
    );
    const runners = Array.from(
      container.querySelectorAll<HTMLButtonElement>("[data-draft-index]"),
    ).map((button) => {
      const runner = button.parentElement as HTMLElement;
      const raw = runner.style.getPropertyValue("--draft-speed");
      return Number(raw.replace("s", ""));
    });
    expect(runners).toHaveLength(holdings.length);
    for (const speed of runners) {
      expect(speed).toBeGreaterThanOrEqual(30);
      expect(speed).toBeLessThanOrEqual(90);
    }
    // Bigger |weeklyReturn| must still lap proportionally faster (shorter).
    const byMagnitude = holdings
      .map((holding, index) => ({
        magnitude: Math.abs(holding.weeklyReturn),
        speed: runners[index],
      }))
      .sort((a, b) => a.magnitude - b.magnitude);
    for (let i = 0; i < byMagnitude.length - 1; i += 1) {
      expect(byMagnitude[i].speed).toBeGreaterThanOrEqual(byMagnitude[i + 1].speed);
    }
  });

  it("FB-12: the DRAFT latch appears in the strip nav is out of DraftRig's own scope, but the first-open coach line is", async () => {
    render(<DraftRig holdings={holdings} encodedDraft={null} onClose={vi.fn()} />);
    expect(
      screen.getByText(/PULL A CIRCLE.*THE OTHERS BREATHE.*DRAG INTO ANOTHER TO SIPHON/),
    ).toBeTruthy();
    cleanup();
    render(<DraftRig holdings={holdings} encodedDraft={null} onClose={vi.fn()} />);
    expect(
      screen.queryByText(/PULL A CIRCLE/),
    ).toBeNull();
  });
});
