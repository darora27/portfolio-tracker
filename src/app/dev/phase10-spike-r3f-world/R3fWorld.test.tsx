// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { OBSERVATORY_CHAPTERS } from "@/lib/observatory/chapters";
import { R3fWorld } from "./R3fWorld";
import { probeWebgl } from "./R3fSceneLoader";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("next/dynamic", () => ({
  default: () => () => <canvas aria-hidden="true" data-testid="mock-r3f-canvas" />,
}));

function stubMedia({ desktop = true, reducedMotion = false } = {}) {
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
  push.mockReset();
  stubMedia();
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
    (() => ({ getExtension: vi.fn() })) as unknown as typeof HTMLCanvasElement.prototype.getContext,
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("§7 R3F world spike", () => {
  it("server-renders the complete semantic no-JS path independently of the canvas", () => {
    const html = renderToStaticMarkup(<R3fWorld activeChapterId="pulse" />);
    for (const chapter of OBSERVATORY_CHAPTERS) {
      expect(html).toContain(`chapter=${chapter.id}`);
      expect(html).toContain(chapter.label);
      expect(html).toContain(chapter.question);
    }
  });

  it("keeps five real anchors keyboard-operable and uses their href for navigation", () => {
    render(<R3fWorld activeChapterId="pulse" />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(5);
    const forces = screen.getByRole("link", { name: /Forces/ });
    expect(forces.tagName).toBe("A");
    expect(forces.hasAttribute("tabindex")).toBe(false);
    expect(forces.getAttribute("href")).toBe("/dev/phase10-spike-r3f-world?chapter=forces");
    fireEvent.click(forces);
    expect(push).toHaveBeenCalledWith("/dev/phase10-spike-r3f-world?chapter=forces");
  });

  it("mirrors semantic hover/focus into shared mesh-preview state without a new focus stop", () => {
    render(<R3fWorld activeChapterId="pulse" />);
    const forces = screen.getByRole("link", { name: /Forces/ });
    fireEvent.focus(forces);
    expect(forces.getAttribute("data-mesh-hovered")).toBe("true");
    expect(screen.getAllByRole("link")).toHaveLength(5);
    fireEvent.blur(forces);
    expect(forces.getAttribute("data-mesh-hovered")).toBe("false");
  });

  it("turns a forced WebGL context creation failure into the complete CSS/semantic fallback", async () => {
    render(<R3fWorld activeChapterId="structure" forceWebglFailure />);
    expect(probeWebgl(true)).toBe(false);
    expect(screen.getAllByRole("link")).toHaveLength(5);
    expect(screen.getByRole("heading", { level: 2, name: "Structure" })).toBeTruthy();
    await waitFor(() => expect(screen.queryByTestId("mock-r3f-canvas")).toBeNull());
  });

  it("does not request/render the lazy scene when reduced motion is preferred", async () => {
    stubMedia({ desktop: true, reducedMotion: true });
    render(<R3fWorld activeChapterId="pulse" />);
    await waitFor(() => expect(screen.queryByTestId("mock-r3f-canvas")).toBeNull());
    expect(screen.getAllByRole("link")).toHaveLength(5);
  });
});
