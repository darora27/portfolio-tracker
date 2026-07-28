// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SectorMap } from "./SectorMap";

const system = {
  slug: "observatory-growth",
  name: "OBSERVATORY-GROWTH",
  owned: false,
  hollowCore: true,
  health: 0.01,
  holdings: [],
};

describe("SectorMap", () => {
  it("exposes both systems and the observed no-TWR contract", () => {
    render(<SectorMap basePath="/share" solHealth={0.02} system={system} selectedSystem={null} forceNo3d />);
    expect(screen.getByText(/OBSERVED · NO TWR/)).toBeTruthy();
    expect(
      screen.getByRole("link", { name: /OBSERVATORY-GROWTH/ }).getAttribute("href"),
    ).toContain("camera=sector");
  });
});
