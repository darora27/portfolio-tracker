// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ObservatoryShell } from "./ObservatoryShell";

afterEach(() => cleanup());

describe("ObservatoryShell — behavioral / URL state", () => {
  it("renders exactly one h1 naming the route (accessibility contract)", () => {
    render(
      <ObservatoryShell
        mode="public"
        basePath="/share"
        activeChapterId="pulse"
        title="Portfolio Observatory"
        freshness={null}
        chapterContent={{}}
      />,
    );
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe("Portfolio Observatory");
  });

  it("renders all five chapter links with stable, addressable hrefs off the given basePath", () => {
    render(
      <ObservatoryShell
        mode="public"
        basePath="/share"
        activeChapterId="pulse"
        title="Portfolio Observatory"
        freshness={null}
        chapterContent={{}}
      />,
    );
    expect(screen.getAllByRole("link")).toHaveLength(5);
    expect(screen.getByRole("link", { name: /Forces/ }).getAttribute("href")).toBe("/share?chapter=forces");
  });

  it("renders the active chapter's content, not another chapter's", () => {
    render(
      <ObservatoryShell
        mode="public"
        basePath="/share"
        activeChapterId="forces"
        title="Portfolio Observatory"
        freshness={null}
        chapterContent={{
          pulse: <p>Pulse body</p>,
          forces: <p>Forces body</p>,
        }}
      />,
    );
    expect(screen.getByText("Forces body")).toBeTruthy();
    expect(screen.queryByText("Pulse body")).toBeNull();
  });

  it("falls back to a placeholder when no content was supplied for the active chapter (§1 ships the shell only)", () => {
    render(
      <ObservatoryShell
        mode="public"
        basePath="/share"
        activeChapterId="lab"
        title="Portfolio Observatory"
        freshness={null}
        chapterContent={{}}
      />,
    );
    expect(screen.getByText(/ships in a later Phase 10 section/)).toBeTruthy();
  });

  it("resolves an invalid activeChapterId to the default (Pulse) chapter rather than crashing", () => {
    render(
      <ObservatoryShell
        mode="public"
        basePath="/share"
        // @ts-expect-error deliberately invalid for the crash-safety assertion
        activeChapterId="not-a-chapter"
        title="Portfolio Observatory"
        freshness={null}
        chapterContent={{ pulse: <p>Pulse body</p> }}
      />,
    );
    expect(screen.getByText("Pulse body")).toBeTruthy();
  });
});

describe("ObservatoryShell — freshness slot", () => {
  it("renders the freshness label/value when provided", () => {
    render(
      <ObservatoryShell
        mode="private"
        basePath="/"
        activeChapterId="pulse"
        title="Portfolio Observatory"
        freshness={{ label: "Prices as of", value: "Jul 22, 2026 close" }}
        chapterContent={{}}
      />,
    );
    expect(screen.getByText("Prices as of")).toBeTruthy();
    expect(screen.getByText("Jul 22, 2026 close")).toBeTruthy();
  });

  it("renders nothing for the freshness slot when null (never fabricates a value)", () => {
    render(
      <ObservatoryShell
        mode="private"
        basePath="/"
        activeChapterId="pulse"
        title="Portfolio Observatory"
        freshness={null}
        chapterContent={{}}
      />,
    );
    expect(screen.queryByText(/Prices as of/)).toBeNull();
  });
});

describe("ObservatoryShell — public/private modes", () => {
  it("shows the read-only badge only in public mode", () => {
    const { rerender } = render(
      <ObservatoryShell
        mode="public"
        basePath="/share"
        activeChapterId="pulse"
        title="Portfolio Observatory"
        freshness={null}
        chapterContent={{}}
      />,
    );
    expect(screen.getByText("Read-only")).toBeTruthy();

    rerender(
      <ObservatoryShell
        mode="private"
        basePath="/"
        activeChapterId="pulse"
        title="Portfolio Observatory"
        freshness={null}
        chapterContent={{}}
      />,
    );
    expect(screen.queryByText("Read-only")).toBeNull();
  });

  it("never renders the owner slot in public mode, even if one is passed (defensive — the shell must not cross-render owner content)", () => {
    render(
      <ObservatoryShell
        mode="public"
        basePath="/share"
        activeChapterId="pulse"
        title="Portfolio Observatory"
        freshness={null}
        chapterContent={{}}
        ownerSlot={<p>Total value: $999,999</p>}
      />,
    );
    expect(screen.queryByText(/Total value/)).toBeNull();
  });

  it("renders the owner slot in private mode when provided", () => {
    render(
      <ObservatoryShell
        mode="private"
        basePath="/"
        activeChapterId="pulse"
        title="Portfolio Observatory"
        freshness={null}
        chapterContent={{}}
        ownerSlot={<p>Owner utility content</p>}
      />,
    );
    expect(screen.getByText("Owner utility content")).toBeTruthy();
  });

  it("renders no owner slot in private mode when none is provided", () => {
    render(
      <ObservatoryShell
        mode="private"
        basePath="/"
        activeChapterId="pulse"
        title="Portfolio Observatory"
        freshness={null}
        chapterContent={{}}
      />,
    );
    expect(screen.queryByText(/Owner utility/)).toBeNull();
  });
});

describe("ObservatoryShell — no-3D fallback hook", () => {
  it("marks the root data-force-no-3d=false by default", () => {
    const { container } = render(
      <ObservatoryShell
        mode="public"
        basePath="/share"
        activeChapterId="pulse"
        title="Portfolio Observatory"
        freshness={null}
        chapterContent={{}}
      />,
    );
    expect(container.firstElementChild?.getAttribute("data-force-no-3d")).toBe("false");
  });

  it("marks the root data-force-no-3d=true when forced (evidence-capture / testing hook)", () => {
    const { container } = render(
      <ObservatoryShell
        mode="public"
        basePath="/share"
        activeChapterId="pulse"
        title="Portfolio Observatory"
        freshness={null}
        chapterContent={{}}
        forceNo3d
      />,
    );
    expect(container.firstElementChild?.getAttribute("data-force-no-3d")).toBe("true");
  });

  it("tags the root with the current mode", () => {
    const { container } = render(
      <ObservatoryShell
        mode="private"
        basePath="/"
        activeChapterId="pulse"
        title="Portfolio Observatory"
        freshness={null}
        chapterContent={{}}
      />,
    );
    expect(container.firstElementChild?.getAttribute("data-mode")).toBe("private");
  });
});
