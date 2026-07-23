// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { CountUpSettle } from "./CountUpSettle";

function mockMatchMedia(reduced: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("prefers-reduced-motion") ? reduced : false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

afterEach(() => cleanup());

describe("CountUpSettle", () => {
  it("under reduced motion, renders the final formatted value immediately — no count-up", () => {
    mockMatchMedia(true);
    render(<CountUpSettle value={1234.5} variant="currency" />);
    expect(screen.getByText("$1,234.50")).toBeTruthy();
  });

  it("under normal motion, settles on the final formatted currency value", async () => {
    mockMatchMedia(false);
    render(<CountUpSettle value={1234.5} variant="currency" durationMs={10} />);
    await waitFor(() => expect(screen.getByText("$1,234.50")).toBeTruthy(), { timeout: 2000 });
  });

  it("formats the signedPercent variant through src/lib/format.ts, not a local toFixed", async () => {
    mockMatchMedia(false);
    render(<CountUpSettle value={0.1132} variant="signedPercent" durationMs={10} />);
    await waitFor(() => expect(screen.getByText("+11.32%")).toBeTruthy(), { timeout: 2000 });
  });

  it("negative values format with the format module's sign convention, not hidden or clamped", () => {
    mockMatchMedia(true);
    render(<CountUpSettle value={-0.031} variant="signedPercent" />);
    expect(screen.getByText("-3.10%")).toBeTruthy();
  });
});
