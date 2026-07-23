// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { DepthPullProvider, DepthPull } from "./DepthPull";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

function mockMatchMedia(reduced: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("prefers-reduced-motion") ? reduced : false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

beforeEach(() => {
  pushMock.mockClear();
  // Deterministic, fast stand-ins so the two-rAF cover->push->wipe sequence
  // resolves quickly and predictably in a jsdom environment.
  vi.stubGlobal(
    "requestAnimationFrame",
    ((cb: FrameRequestCallback) => setTimeout(() => cb(performance.now()), 0)) as unknown as typeof requestAnimationFrame,
  );
  vi.stubGlobal("cancelAnimationFrame", ((id: number) => clearTimeout(id)) as unknown as typeof cancelAnimationFrame);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("DepthPull", () => {
  it("is a real link with a real href — functional if JS never hydrates", () => {
    mockMatchMedia(false);
    render(
      <DepthPullProvider>
        <DepthPull href="/dashboard">Go</DepthPull>
      </DepthPullProvider>,
    );
    const link = screen.getByRole("link", { name: "Go" });
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("/dashboard");
  });

  it("under reduced motion, navigates immediately with no overlay ever mounted", () => {
    mockMatchMedia(true);
    const { container } = render(
      <DepthPullProvider>
        <DepthPull href="/dashboard">Go</DepthPull>
      </DepthPullProvider>,
    );
    fireEvent.click(screen.getByRole("link", { name: "Go" }));
    expect(pushMock).toHaveBeenCalledWith("/dashboard");
    expect(container.querySelector('[aria-hidden="true"].fixed')).toBeNull();
  });

  it("under normal motion, covers the viewport then navigates", async () => {
    mockMatchMedia(false);
    const { container } = render(
      <DepthPullProvider>
        <DepthPull href="/dashboard">Go</DepthPull>
      </DepthPullProvider>,
    );
    fireEvent.click(screen.getByRole("link", { name: "Go" }));

    // Overlay covers the viewport before the wipe starts.
    expect(container.querySelector('[aria-hidden="true"].fixed')).not.toBeNull();

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/dashboard"));
  });
});
