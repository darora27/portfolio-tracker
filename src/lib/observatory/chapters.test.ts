import { describe, it, expect } from "vitest";
import {
  OBSERVATORY_CHAPTERS,
  DEFAULT_OBSERVATORY_CHAPTER_ID,
  resolveObservatoryChapter,
  observatoryChapterHref,
} from "./chapters";

describe("OBSERVATORY_CHAPTERS", () => {
  it("has exactly the five chapters named in PRODUCT_DIRECTION.md's information model, in order", () => {
    expect(OBSERVATORY_CHAPTERS.map((c) => c.id)).toEqual(["pulse", "forces", "structure", "timeline", "lab"]);
    expect(OBSERVATORY_CHAPTERS.map((c) => c.index)).toEqual([0, 1, 2, 3, 4]);
  });

  it("every chapter has a non-empty label and question", () => {
    for (const chapter of OBSERVATORY_CHAPTERS) {
      expect(chapter.label.length).toBeGreaterThan(0);
      expect(chapter.question.length).toBeGreaterThan(0);
    }
  });
});

describe("resolveObservatoryChapter", () => {
  it("resolves a known slug", () => {
    expect(resolveObservatoryChapter("forces").id).toBe("forces");
  });

  it("defaults to Pulse for undefined", () => {
    expect(resolveObservatoryChapter(undefined).id).toBe(DEFAULT_OBSERVATORY_CHAPTER_ID);
  });

  it("defaults to Pulse for an unrecognized slug (never crashes on a bad URL)", () => {
    expect(resolveObservatoryChapter("not-a-real-chapter").id).toBe(DEFAULT_OBSERVATORY_CHAPTER_ID);
  });

  it("defaults to Pulse for an empty string", () => {
    expect(resolveObservatoryChapter("").id).toBe(DEFAULT_OBSERVATORY_CHAPTER_ID);
  });

  it("takes the first value when Next.js hands back a repeated-param array", () => {
    expect(resolveObservatoryChapter(["structure", "lab"]).id).toBe("structure");
  });
});

describe("observatoryChapterHref", () => {
  it("builds a query-param URL against the given base path", () => {
    expect(observatoryChapterHref("/share", "timeline")).toBe("/share?chapter=timeline");
    expect(observatoryChapterHref("/", "lab")).toBe("/?chapter=lab");
  });

  it("preserves caller-supplied query state (e.g. mode) alongside the new chapter", () => {
    const href = observatoryChapterHref("/dev/observatory-shell", "forces", { mode: "private" });
    const params = new URLSearchParams(href.split("?")[1]);
    expect(params.get("mode")).toBe("private");
    expect(params.get("chapter")).toBe("forces");
  });

  it("preserves multiple caller-supplied query params (e.g. mode and no3d) across a chapter change", () => {
    const href = observatoryChapterHref("/dev/observatory-shell", "structure", {
      mode: "private",
      no3d: "1",
    });
    const params = new URLSearchParams(href.split("?")[1]);
    expect(params.get("mode")).toBe("private");
    expect(params.get("no3d")).toBe("1");
    expect(params.get("chapter")).toBe("structure");
  });

  it("replaces only chapter when preservedQuery itself already contains a chapter key", () => {
    const href = observatoryChapterHref("/share", "lab", { chapter: "pulse", mode: "private" });
    const params = new URLSearchParams(href.split("?")[1]);
    expect(params.get("chapter")).toBe("lab");
    expect(params.get("mode")).toBe("private");
  });
});
