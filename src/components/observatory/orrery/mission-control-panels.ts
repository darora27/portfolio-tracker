export const MISSION_CONTROL_PANELS = [
  { id: "plot", anchor: "orbits", label: "ORBITS", question: "where is everything, and how was the week" },
  { id: "manifest", anchor: "holdings", label: "HOLDINGS", question: "what do I own, at what weight" },
  { id: "scope", anchor: "returns", label: "RETURNS", question: "am I beating the market" },
  { id: "hazard", anchor: "risk", label: "RISK", question: "how much can this hurt" },
  { id: "signals", anchor: "correlation", label: "CORRELATION", question: "what moves together" },
  { id: "comms", anchor: "news", label: "NEWS", question: "what’s being said" },
  { id: "log", anchor: "trades", label: "TRADES", question: "what did I do" },
] as const;

export type MissionControlPanelId =
  (typeof MISSION_CONTROL_PANELS)[number]["id"];
