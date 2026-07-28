// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { canRenderOrrery } from "./OrrerySceneLoader";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function media({
  desktop,
  reduced,
}: {
  desktop: boolean;
  reduced: boolean;
}) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("min-width") ? desktop : reduced,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

describe("canRenderOrrery", () => {
  it("keeps mobile, reduced motion and forced fallback canvas-free", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      {} as RenderingContext,
    );
    media({ desktop: true, reduced: false });
    expect(canRenderOrrery(true)).toBe(false);
    media({ desktop: false, reduced: false });
    expect(canRenderOrrery(false)).toBe(false);
    media({ desktop: true, reduced: true });
    expect(canRenderOrrery(false)).toBe(false);
  });

  it("enables the scene only for a desktop motion-capable WebGL context", () => {
    media({ desktop: true, reduced: false });
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      {} as RenderingContext,
    );
    expect(canRenderOrrery(false)).toBe(true);
  });
});
