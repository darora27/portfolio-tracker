export const MISSION_CONTROL_PANELS = [
  { id: "plot", anchor: "orbits", label: "ORBITS", question: "where is everything, and how was the week" },
  { id: "manifest", anchor: "holdings", label: "HOLDINGS", question: "what do I own, at what weight" },
  { id: "scope", anchor: "returns", label: "RETURNS", question: "am I beating the market" },
  { id: "mix", anchor: "mix", label: "MIX", question: "what am I made of" },
  { id: "hazard", anchor: "risk", label: "RISK", question: "how bad can it get" },
  { id: "log", anchor: "trades", label: "ACTIVITY", question: "what did I do" },
] as const;

export type MissionControlPanelId =
  (typeof MISSION_CONTROL_PANELS)[number]["id"];
