// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LazyMissionSection } from "./LazyMissionSection";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("LazyMissionSection", () => {
  it("reserves its full geometry and mounts when the runtime observer approaches", async () => {
    let notify: IntersectionObserverCallback = () => undefined;
    const disconnect = vi.fn();
    class MockIntersectionObserver {
      root = null;
      rootMargin = "480px 0px";
      thresholds = [0];
      constructor(callback: IntersectionObserverCallback) {
        notify = callback;
      }
      observe = vi.fn();
      disconnect = disconnect;
      unobserve = vi.fn();
      takeRecords = vi.fn(() => []);
    }
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    const { container } = render(
      <LazyMissionSection id="risk" title="RISK" minHeight={560}>
        <p>Mounted risk instrument</p>
      </LazyMissionSection>,
    );
    const section = container.querySelector<HTMLElement>("#risk");
    expect(section?.style.minHeight).toBe("560px");
    expect(section?.dataset.lazyMounted).toBe("false");
    expect(screen.getByText("INSTRUMENT STANDBY")).toBeTruthy();

    notify([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    await waitFor(() => expect(section?.dataset.lazyMounted).toBe("true"));
    expect(screen.getByText("Mounted risk instrument")).toBeTruthy();
    expect(disconnect).toHaveBeenCalled();
  });
});
