export const MISSION_CONTROL_PANELS = [
  { id: "plot", label: "PLOT 00", question: "where is everything, and how was the week" },
  { id: "manifest", label: "MANIFEST 01", question: "what do I own, at what weight" },
  { id: "scope", label: "SCOPE 02", question: "am I beating the market" },
  { id: "hazard", label: "HAZARD 03", question: "how much can this hurt" },
  { id: "signals", label: "SIGNALS 04", question: "what moves together" },
  { id: "comms", label: "COMMS 05", question: "what’s being said" },
  { id: "log", label: "LOG 06", question: "what did I do" },
] as const;

export type MissionControlPanelId =
  (typeof MISSION_CONTROL_PANELS)[number]["id"];
