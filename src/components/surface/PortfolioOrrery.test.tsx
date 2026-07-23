// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { PortfolioOrrery } from "./PortfolioOrrery";

function mockMatchMedia({ reduced = false, finePointer = false, narrow = false } = {}) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("prefers-reduced-motion")
      ? reduced
      : query.includes("pointer: fine")
        ? finePointer
        : query.includes("max-width")
          ? narrow
          : false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

class FakeIntersectionObserver implements IntersectionObserver {
  root = null;
  rootMargin = "";
  thresholds: ReadonlyArray<number> = [];
  private cb: IntersectionObserverCallback;
  constructor(cb: IntersectionObserverCallback) {
    this.cb = cb;
  }
  observe() {
    this.cb([{ isIntersecting: true } as IntersectionObserverEntry], this);
  }
  disconnect() {}
  unobserve() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("PortfolioOrrery", () => {
  it("is aria-hidden and pointer-events-none regardless of motion state — decorative only, never the sole data source", () => {
    mockMatchMedia({ reduced: true });
    const { container } = render(<PortfolioOrrery />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("aria-hidden")).toBe("true");
    expect(root.className).toContain("pointer-events-none");
  });

  it("renders a static composition (no ambient spin) under prefers-reduced-motion", () => {
    mockMatchMedia({ reduced: true, finePointer: true });
    const { container } = render(<PortfolioOrrery />);
    expect(container.querySelector(".orrery-spin")).toBeNull();
  });

  it("renders a static composition on coarse pointers, even without reduced motion", () => {
    mockMatchMedia({ reduced: false, finePointer: false });
    const { container } = render(<PortfolioOrrery />);
    expect(container.querySelector(".orrery-spin")).toBeNull();
  });

  it("renders a static composition on narrow (390px-class) viewports", () => {
    mockMatchMedia({ reduced: false, finePointer: true, narrow: true });
    const { container } = render(<PortfolioOrrery />);
    expect(container.querySelector(".orrery-spin")).toBeNull();
  });

  it("upgrades to the ambient animated composition only for wide, fine-pointer, motion-ok clients", () => {
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
    mockMatchMedia({ reduced: false, finePointer: true, narrow: false });
    const { container } = render(<PortfolioOrrery />);
    expect(container.querySelector(".orrery-spin")).not.toBeNull();
  });

  it("renders at most 5 forms even when given more weights (deliberately small form count)", () => {
    mockMatchMedia({ reduced: true });
    const weights = [0.3, 0.2, 0.2, 0.1, 0.1, 0.1, 0.1];
    const { container } = render(<PortfolioOrrery weights={weights} />);
    const forms = Array.from(container.querySelectorAll<HTMLElement>("div")).filter(
      (el) => el.style.borderRadius === "22%",
    );
    expect(forms.length).toBe(5);
  });

  it("uses only CSS tokens for its focal/form colors, never a hardcoded hex", () => {
    mockMatchMedia({ reduced: true });
    const { container } = render(<PortfolioOrrery />);
    const forms = Array.from(container.querySelectorAll<HTMLElement>("div")).filter(
      (el) => el.style.borderRadius === "22%",
    );
    for (const form of forms) {
      expect(form.style.background).toMatch(/^var\(--/);
    }
  });
});
