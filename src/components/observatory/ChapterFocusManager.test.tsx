// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { ChapterFocusManager } from "./ChapterFocusManager";

afterEach(() => {
  cleanup();
  document.body.replaceChildren();
});

function renderWithHeading(activeChapterId: string) {
  const heading = document.createElement("h2");
  heading.id = "observatory-chapter-heading";
  heading.tabIndex = -1;
  heading.textContent = "Chapter heading";
  document.body.appendChild(heading);
  const utils = render(<ChapterFocusManager activeChapterId={activeChapterId} headingId="observatory-chapter-heading" />);
  return { heading, ...utils };
}

describe("ChapterFocusManager", () => {
  it("does not steal focus on first mount (landing on the page shouldn't yank focus)", () => {
    const { heading } = renderWithHeading("pulse");
    expect(document.activeElement).not.toBe(heading);
  });

  it("moves focus to the chapter heading when activeChapterId changes after mount (chapter switch, or back/forward restoring a prior chapter)", () => {
    const { heading, rerender } = renderWithHeading("pulse");
    expect(document.activeElement).not.toBe(heading);

    rerender(<ChapterFocusManager activeChapterId="forces" headingId="observatory-chapter-heading" />);
    expect(document.activeElement).toBe(heading);
  });

  it("renders nothing itself", () => {
    const { container } = renderWithHeading("pulse");
    expect(container.innerHTML).toBe("");
  });
});
