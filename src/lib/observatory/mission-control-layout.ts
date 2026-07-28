import type { CSSProperties } from "react";

export const MISSION_CONTROL_LAYOUT = {
  plotFraction: 0.55,
  dayNumberPx: 64,
  bodyTextPx: 15,
  bayLabelPx: 11,
  dominantGutterPx: 20,
  stripGutterPx: 10,
  detailMinWidthPx: 560,
  detailViewportFraction: 0.4,
} as const;

export const MISSION_CONTROL_CSS_PROPERTIES = {
  "--mission-plot-fraction": `${Number(
    (MISSION_CONTROL_LAYOUT.plotFraction * 100).toFixed(2),
  )}%`,
  "--mission-day-size": `${MISSION_CONTROL_LAYOUT.dayNumberPx}px`,
  "--mission-body-size": `${MISSION_CONTROL_LAYOUT.bodyTextPx}px`,
  "--mission-label-size": `${MISSION_CONTROL_LAYOUT.bayLabelPx}px`,
  "--mission-dominant-gutter": `${MISSION_CONTROL_LAYOUT.dominantGutterPx}px`,
  "--mission-strip-gutter": `${MISSION_CONTROL_LAYOUT.stripGutterPx}px`,
  "--mission-detail-min": `${MISSION_CONTROL_LAYOUT.detailMinWidthPx}px`,
  "--mission-detail-fraction": `${MISSION_CONTROL_LAYOUT.detailViewportFraction * 100}vw`,
} as CSSProperties;
