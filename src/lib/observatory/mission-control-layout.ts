import type { CSSProperties } from "react";

export const MISSION_CONTROL_LAYOUT = {
  plotFraction: 0.55,
  dayNumberPx: 56,
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

/**
 * FB-05 (root-caused in §11, closed in §12a): the universe type ramp
 * (`--type-hero/readout/title/body/label`, `type-ramp.test.ts`) only ever
 * constrained font sizes to the five legal VALUES, never which token a given
 * semantic ROLE must resolve to -- so Mission Control reading surfaces could
 * sit on a legal value (11px) that was still the wrong role. This map is the
 * explicit role -> token contract; `mission-control-text-roles.test.tsx`
 * renders the real component tree and asserts each selector below actually
 * resolves to its role's token, not just some ramp value.
 */
export const MISSION_CONTROL_TEXT_ROLES = {
  sectionHeader: {
    token: "--type-title",
    description: "Section and instrument headers.",
    selectors: [
      ".plotChassis > header",
      ".manifestInstrument > header",
      ".manifestHeader",
    ],
  },
  questionCopy: {
    token: "--type-body",
    description: "Question copy and briefing prose.",
    selectors: [".bayQuestion", ".briefingPaper"],
  },
  holdingsText: {
    token: "--type-body",
    description: "Holdings headers, radar detail card and manifest text.",
    selectors: [
      ".radarDetailCard",
      ".radarManifest > li > button",
      ".holdingsTable thead th",
    ],
  },
  genuineLabel: {
    token: "--type-label",
    description:
      "Genuine labels, stamps and window words -- legitimately unchanged.",
    selectors: [
      ".radarRingTarget > span",
      ".radarTimestamp",
      ".radarPairLine",
      ".railStations a",
      ".instrumentStrip a",
      ".plotReadouts span",
    ],
  },
} as const;

export type MissionControlTextRole = keyof typeof MISSION_CONTROL_TEXT_ROLES;
