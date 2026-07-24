// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ChapterOrbit } from "./ChapterOrbit";
import { OBSERVATORY_CHAPTERS } from "@/lib/observatory/chapters";

afterEach(() => cleanup());

describe("ChapterOrbit", () => {
  it("renders one real link per chapter, each a real <a href> (works with JS disabled)", () => {
    render(<ChapterOrbit basePath="/share" chapters={OBSERVATORY_CHAPTERS} activeChapterId="pulse" />);
    for (const chapter of OBSERVATORY_CHAPTERS) {
      const link = screen.getByRole("link", { name: new RegExp(chapter.label) });
      expect(link.tagName).toBe("A");
      expect(link.getAttribute("href")).toBe(`/share?chapter=${chapter.id}`);
    }
  });

  it("marks only the active chapter's link aria-current=page", () => {
    render(<ChapterOrbit basePath="/share" chapters={OBSERVATORY_CHAPTERS} activeChapterId="structure" />);
    const active = screen.getByRole("link", { name: /Structure/ });
    expect(active.getAttribute("aria-current")).toBe("page");

    const inactive = screen.getByRole("link", { name: /Pulse/ });
    expect(inactive.getAttribute("aria-current")).toBeNull();
  });

  it("exposes exactly one semantic nav landmark naming the chapters — no duplicate control set", () => {
    render(<ChapterOrbit basePath="/share" chapters={OBSERVATORY_CHAPTERS} activeChapterId="pulse" />);
    expect(screen.getAllByRole("navigation")).toHaveLength(1);
    expect(screen.getAllByRole("link")).toHaveLength(OBSERVATORY_CHAPTERS.length);
  });

  it("the selected-body inspector names the active chapter's label and question (label also appears in its own nav link)", () => {
    render(<ChapterOrbit basePath="/" chapters={OBSERVATORY_CHAPTERS} activeChapterId="lab" />);
    expect(screen.getAllByText("Lab")).toHaveLength(2); // the nav link + the inspector
    expect(
      screen.getByText("How do methods, simulations, calculations, and limitations change the interpretation?"),
    ).toBeTruthy();
  });

  it("falls back to the first chapter's question in the inspector when given an activeChapterId absent from the chapters list", () => {
    render(<ChapterOrbit basePath="/share" chapters={OBSERVATORY_CHAPTERS} activeChapterId={"nope" as never} />);
    expect(screen.getByText(OBSERVATORY_CHAPTERS[0].question)).toBeTruthy();
  });

  it("preserves preservedQuery (e.g. mode=private) on every chapter link, not just the current one", () => {
    render(
      <ChapterOrbit
        basePath="/dev/observatory-shell"
        chapters={OBSERVATORY_CHAPTERS}
        activeChapterId="structure"
        preservedQuery={{ mode: "private" }}
      />,
    );
    for (const chapter of OBSERVATORY_CHAPTERS) {
      const link = screen.getByRole("link", { name: new RegExp(chapter.label) });
      const params = new URLSearchParams(link.getAttribute("href")?.split("?")[1]);
      expect(params.get("mode")).toBe("private");
      expect(params.get("chapter")).toBe(chapter.id);
    }
  });

  it("preserves forced-no-3d state (no3d=1) alongside mode across chapter navigation", () => {
    render(
      <ChapterOrbit
        basePath="/dev/observatory-shell"
        chapters={OBSERVATORY_CHAPTERS}
        activeChapterId="pulse"
        preservedQuery={{ mode: "private", no3d: "1" }}
      />,
    );
    const link = screen.getByRole("link", { name: /Forces/ });
    const params = new URLSearchParams(link.getAttribute("href")?.split("?")[1]);
    expect(params.get("no3d")).toBe("1");
    expect(params.get("mode")).toBe("private");
  });

  it("renders a single aria-hidden concentric map with one ring per chapter and no additional focusable elements", () => {
    const { container } = render(
      <ChapterOrbit basePath="/share" chapters={OBSERVATORY_CHAPTERS} activeChapterId="structure" />,
    );
    const map = container.querySelector('[aria-hidden="true"]');
    expect(map).toBeTruthy();
    expect(map?.querySelectorAll("a, button, [tabindex]").length).toBe(0);
    expect(container.querySelectorAll('[class*="concentricRing"]').length).toBe(OBSERVATORY_CHAPTERS.length);
    // Real controls remain exactly the five chapter links — the map adds no duplicate focus stops.
    expect(screen.getAllByRole("link")).toHaveLength(OBSERVATORY_CHAPTERS.length);
  });

  it("marks only the active chapter's ring as active in the concentric map", () => {
    const { container } = render(
      <ChapterOrbit basePath="/share" chapters={OBSERVATORY_CHAPTERS} activeChapterId="timeline" />,
    );
    const activeRings = container.querySelectorAll('[class*="concentricRing"][data-active="true"]');
    expect(activeRings).toHaveLength(1);
  });

  it("every chapter link is natively keyboard-operable — no tabindex removed, no click-only handler required", () => {
    render(<ChapterOrbit basePath="/share" chapters={OBSERVATORY_CHAPTERS} activeChapterId="pulse" />);
    for (const link of screen.getAllByRole("link")) {
      // A real, unmodified <a href> is in the natural Tab order by default
      // and activates on Enter without any JS keydown handler — asserting
      // no tabindex override and a same-document href is the meaningful
      // check here (jsdom doesn't run real Tab-order/Enter navigation).
      expect(link.hasAttribute("tabindex")).toBe(false);
      expect(link.getAttribute("href")).toMatch(/^\/share\?chapter=/);
    }
  });
});
