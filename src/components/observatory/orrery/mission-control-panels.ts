export const MISSION_CONTROL_PANELS = [
  { id: "plot", label: "PLOT 00" },
  { id: "manifest", label: "MANIFEST 01" },
  { id: "scope", label: "SCOPE 02" },
  { id: "hazard", label: "HAZARD 03" },
  { id: "signals", label: "SIGNALS 04" },
  { id: "comms", label: "COMMS 05" },
  { id: "log", label: "LOG 06" },
] as const;

export type MissionControlPanelId =
  (typeof MISSION_CONTROL_PANELS)[number]["id"];
