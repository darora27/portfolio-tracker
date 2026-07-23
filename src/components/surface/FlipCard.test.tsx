// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { FlipCard } from "./FlipCard";

function mockMatchMedia(reduced: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("prefers-reduced-motion") ? reduced : false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

afterEach(() => cleanup());

describe("FlipCard", () => {
  beforeEach(() => mockMatchMedia(false));

  it("starts unflipped: front visible, back and the See more link hidden from assistive tech", () => {
    render(
      <FlipCard
        ariaLabel="Flip: Test"
        seeMoreHref="/dashboard"
        front={<div>Front content</div>}
        back={<div>Back content</div>}
      />,
    );
    const button = screen.getByRole("button", { name: "Flip: Test" });
    expect(button.getAttribute("aria-pressed")).toBe("false");

    // Both faces are in the DOM (needed for the flip animation) with
    // aria-hidden swapped, per the FlipCard spec.
    expect(screen.getByText("Front content").closest("span")?.getAttribute("aria-hidden")).toBe("false");
    expect(screen.getByText("Back content").closest("span")?.getAttribute("aria-hidden")).toBe("true");

    const link = screen.getByRole("link", { hidden: true });
    expect(link.getAttribute("aria-hidden")).toBe("true");
    expect(link.getAttribute("tabindex")).toBe("-1");
  });

  it("flips on click: toggles aria-pressed and reveals the See more link to assistive tech and keyboard", () => {
    render(
      <FlipCard
        ariaLabel="Flip: Test"
        seeMoreHref="/dashboard"
        front={<div>Front content</div>}
        back={<div>Back content</div>}
      />,
    );
    const button = screen.getByRole("button", { name: "Flip: Test" });
    fireEvent.click(button);

    expect(button.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("Back content").closest("span")?.getAttribute("aria-hidden")).toBe("false");
    const link = screen.getByRole("link");
    expect(link.getAttribute("aria-hidden")).toBe("false");
    expect(link.hasAttribute("tabindex")).toBe(false);
  });

  it("flips back to front on a second click", () => {
    render(<FlipCard ariaLabel="Flip: Test" seeMoreHref="/dashboard" front={<div>F</div>} back={<div>B</div>} />);
    const button = screen.getByRole("button", { name: "Flip: Test" });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(button.getAttribute("aria-pressed")).toBe("false");
  });

  it("is a real <button> (native Enter/Space activation) — not a div with a click handler", () => {
    render(<FlipCard ariaLabel="Flip: Test" seeMoreHref="/dashboard" front={<div>F</div>} back={<div>B</div>} />);
    expect(screen.getByRole("button", { name: "Flip: Test" }).tagName).toBe("BUTTON");
  });

  it("the See more link is never nested inside the button (invalid HTML / unpredictable browser behavior)", () => {
    render(<FlipCard ariaLabel="Flip: Test" seeMoreHref="/dashboard" front={<div>F</div>} back={<div>B</div>} />);
    const button = screen.getByRole("button", { name: "Flip: Test" });
    const link = screen.getByRole("link", { hidden: true });
    expect(button.contains(link)).toBe(false);
  });
});

describe("FlipCard under prefers-reduced-motion", () => {
  beforeEach(() => mockMatchMedia(true));

  it("uses no 3D perspective and no rotation — opacity crossfade only", () => {
    const { container } = render(
      <FlipCard ariaLabel="Flip: Test" seeMoreHref="/dashboard" front={<div>F</div>} back={<div>B</div>} />,
    );
    const card = container.firstElementChild as HTMLElement;
    expect(card.style.perspective).toBe("");

    const button = screen.getByRole("button", { name: "Flip: Test" });
    const flipper = button.firstElementChild as HTMLElement;
    expect(flipper.style.transform).toBe("");
    expect(flipper.style.transformStyle).toBe("");
  });

  it("still flips (toggles aria-pressed) via the same button under reduced motion", () => {
    render(<FlipCard ariaLabel="Flip: Test" seeMoreHref="/dashboard" front={<div>F</div>} back={<div>B</div>} />);
    const button = screen.getByRole("button", { name: "Flip: Test" });
    fireEvent.click(button);
    expect(button.getAttribute("aria-pressed")).toBe("true");
  });
});
