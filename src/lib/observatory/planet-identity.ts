export type PlanetIdentity = {
  ticker: string;
  brandHex: string;
  labelHex: string;
  macroFeature: string;
  emissiveSignature: string;
  relightHex?: string;
};

/** The committed normal-text pairs used by §9 chrome. */
export const OBSERVATORY_TEXT_CONTRASTS = [
  { id: "orientation", foreground: "#e8f1df", background: "#020706" },
  { id: "teletype", foreground: "#f6d493", background: "#21120d" },
  { id: "active-bay", foreground: "#fff0cf", background: "#7d3d1d" },
  { id: "bay-nameplate", foreground: "#d5ba8c", background: "#3b1f12" },
] as const;

export const PLANET_IDENTITIES = [
  {
    ticker: "ASML",
    brandHex: "#5c80ad",
    labelHex: "#e8f3ff",
    macroFeature: "precision-lens continent",
    emissiveSignature: "cyan optics rings",
  },
  {
    ticker: "GOOG",
    brandHex: "#bcc7ba",
    labelHex: "#eef8ff",
    macroFeature: "four product districts",
    emissiveSignature: "white fiber boulevards",
  },
  {
    ticker: "MSFT",
    brandHex: "#5f7271",
    labelHex: "#e8f5ff",
    macroFeature: "four-quadrant continent",
    emissiveSignature: "azure ring roads",
  },
  {
    ticker: "IBM",
    brandHex: "#16295d",
    labelHex: "#eaf2ff",
    macroFeature: "pinstripe monolith range",
    emissiveSignature: "quantum-dome grid",
    relightHex: "#8fa3d6",
  },
  {
    ticker: "COST",
    brandHex: "#645d53",
    labelHex: "#fff2e9",
    macroFeature: "warehouse crater complex",
    emissiveSignature: "red dock lanes",
    relightHex: "#8a8274",
  },
  {
    ticker: "INTC",
    brandHex: "#42474f",
    labelHex: "#fff0e8",
    macroFeature: "copper reconstruction spiral",
    emissiveSignature: "blue coolant channels",
    relightHex: "#5a6270",
  },
  {
    ticker: "NBIS",
    brandHex: "#763a74",
    labelHex: "#faedff",
    macroFeature: "newborn accretion scar",
    emissiveSignature: "violet-white compute terraces",
    relightHex: "#a05a9e",
  },
  {
    ticker: "CBRS",
    brandHex: "#655331",
    labelHex: "#fff1dd",
    macroFeature: "wafer-scale core",
    emissiveSignature: "cyan coolant rivers",
    relightHex: "#9c7d3f",
  },
] as const satisfies readonly PlanetIdentity[];

export type PlanetIdentityTicker = (typeof PLANET_IDENTITIES)[number]["ticker"];

const IDENTITY_BY_TICKER = new Map<string, PlanetIdentity>(
  PLANET_IDENTITIES.map((identity) => [identity.ticker, identity]),
);

export function planetIdentityForTicker(ticker: string): PlanetIdentity {
  return (
    IDENTITY_BY_TICKER.get(ticker.toUpperCase()) ?? {
      ticker: ticker.toUpperCase(),
      brandHex: "#6da184",
      labelHex: "#eef8ef",
      macroFeature: "authored surface",
      emissiveSignature: "surface light network",
    }
  );
}
