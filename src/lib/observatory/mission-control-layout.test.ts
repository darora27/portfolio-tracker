import { describe, expect, it } from "vitest";
import {
  MISSION_CONTROL_CSS_PROPERTIES,
  MISSION_CONTROL_LAYOUT,
} from "./mission-control-layout";

describe("Mission Control geometry contract", () => {
  it("keeps one dominant plot and the 56/24/15/13/11 ramp's display size", () => {
    expect(MISSION_CONTROL_LAYOUT).toMatchObject({
      plotFraction: 0.55,
      dayNumberPx: 56,
      bodyTextPx: 15,
      bayLabelPx: 11,
      dominantGutterPx: 20,
      stripGutterPx: 10,
      detailMinWidthPx: 560,
      detailViewportFraction: 0.4,
    });
    expect(MISSION_CONTROL_LAYOUT.dominantGutterPx).not.toBe(
      MISSION_CONTROL_LAYOUT.stripGutterPx,
    );
    expect(MISSION_CONTROL_CSS_PROPERTIES).toMatchObject({
      "--mission-plot-fraction": "55%",
      "--mission-day-size": "56px",
      "--mission-body-size": "15px",
      "--mission-label-size": "11px",
      "--mission-detail-min": "560px",
      "--mission-detail-fraction": "40vw",
    });
  });
});
