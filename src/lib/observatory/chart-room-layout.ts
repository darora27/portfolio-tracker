/**
 * §14's own role -> token contract, mirroring MISSION_CONTROL_TEXT_ROLES
 * (FB-05's pattern): an explicit map from semantic text role to one of the
 * five `--type-*` ramp tokens, at current production values (12px
 * `--type-label` floor, post-FB-05) -- never the mock's stale 11px.
 */
export const CHART_ROOM_TEXT_ROLES = {
  kicker: {
    token: "--type-label",
    description: "Strip kicker and nav exits.",
    selectors: [".kicker", ".strip nav a"],
  },
  idplate: {
    token: "--type-title",
    description: "Ticker + company name in the strip.",
    selectors: [".idplate b"],
  },
  heroFigure: {
    token: "--type-readout",
    description: "The TODAY hero figure and tile values.",
    selectors: [".hero strong", ".tile b"],
  },
  chipLabel: {
    token: "--type-label",
    description: "Strip chip labels and stamps.",
    selectors: [".chips span", ".stamp", ".tile span"],
  },
  benchHeader: {
    token: "--type-title",
    description: "Bench and plate instrument headers.",
    selectors: [".instHead h2"],
  },
  benchQuestion: {
    token: "--type-label",
    description: "Each bench's plain-English question.",
    selectors: [".q"],
  },
  bodyProse: {
    token: "--type-body",
    description: "Sentence lines and news headlines.",
    selectors: [".sentence", ".newslist a"],
  },
} as const;

export type ChartRoomTextRole = keyof typeof CHART_ROOM_TEXT_ROLES;
