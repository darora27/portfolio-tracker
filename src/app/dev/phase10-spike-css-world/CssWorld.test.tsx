// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { CssWorld } from "./CssWorld";
import { OBSERVATORY_CHAPTERS } from "@/lib/observatory/chapters";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("§7 CSS world spike", () => {
  it("server-renders all five real chapter anchors for the no-JS path", () => {
    const html = renderToStaticMarkup(<CssWorld activeChapterId="pulse" />);
    for (const chapter of OBSERVATORY_CHAPTERS) {
      expect(html).toContain(`chapter=${chapter.id}`);
      expect(html).toContain(chapter.label);
      expect(html).toContain(chapter.question);
    }
  });

  it("keeps every chapter natively keyboard-operable and marks one current link", () => {
    render(<CssWorld activeChapterId="structure" />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(5);
    for (const link of links) {
      expect(link.tagName).toBe("A");
      expect(link.hasAttribute("tabindex")).toBe(false);
      expect(link.getAttribute("href")).toMatch(/^\/dev\/phase10-spike-css-world\?chapter=/);
    }
    expect(screen.getByRole("link", { name: /Structure/ }).getAttribute("aria-current")).toBe("page");
  });

  it("renders the forced no-3D branch without removing links or content", () => {
    const { container } = render(<CssWorld activeChapterId="forces" forceNo3d />);
    expect(screen.getAllByRole("link")).toHaveLength(5);
    expect(container.querySelector('[data-force-no-3d="true"]')).toBeTruthy();
    expect(screen.getByRole("heading", { level: 2, name: "Forces" })).toBeTruthy();
  });

  it("does not attach pointer parallax when reduced motion is preferred", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({
        matches: query.includes("prefers-reduced-motion"),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
    const add = vi.spyOn(window, "addEventListener");
    render(<CssWorld activeChapterId="pulse" />);
    expect(add.mock.calls.some(([name]) => name === "pointermove")).toBe(false);
  });
});
