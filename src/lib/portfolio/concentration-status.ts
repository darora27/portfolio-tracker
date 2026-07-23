export type ConcentrationTier = "good" | "warning" | "critical";

export type ConcentrationStatus = {
  tier: ConcentrationTier;
  label: string;
};

/**
 * Standard HHI concentration bands (0-10000 scale), the same thresholds
 * used in antitrust/portfolio-concentration analysis: below 1500 is
 * unconcentrated, 1500-2500 is moderate, above 2500 is highly
 * concentrated.
 */
export function concentrationStatus(hhi: number): ConcentrationStatus {
  if (hhi < 1500) return { tier: "good", label: "Diversified" };
  if (hhi <= 2500) return { tier: "warning", label: "Moderately concentrated" };
  return { tier: "critical", label: "Highly concentrated" };
}
