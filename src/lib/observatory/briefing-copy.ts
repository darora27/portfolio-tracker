import { addDays } from "@/lib/date";
import { formatDate, formatSignedPercent } from "@/lib/format";
import { concentrationStatus } from "@/lib/portfolio/concentration-status";
import { riskLine } from "@/lib/surface-copy";

export type AttentionSeverity = "critical" | "notice";

export type AttentionItem = {
  id: string;
  text: string;
  href: string;
  severity: AttentionSeverity;
};

export const BRIEFING_NOTABLE_MOVE_THRESHOLD = 0.03;
export const BRIEFING_EARNINGS_WINDOW_DAYS = 7;

const MAX_EARNINGS_ATTENTION_ITEMS = 3;

export function briefingWhyCopy(
  movers: { ticker: string; dayPct: number }[],
): string | null {
  const top = movers[0];
  if (!top) return null;

  return `${top.ticker} drove most of today's move, ${formatSignedPercent(top.dayPct, 1)}.`;
}

export function buildAttentionItems(input: {
  pricesStale: boolean;
  hhi: number;
  topMover: { ticker: string; dayPct: number } | null;
  upcomingEarnings: { ticker: string; date: string }[];
  today: string;
}): AttentionItem[] {
  const items: AttentionItem[] = [];

  if (input.pricesStale) {
    items.push({
      id: "stale-prices",
      text: "Prices are stale — showing the last known values.",
      href: "/dashboard",
      severity: "critical",
    });
  }

  if (concentrationStatus(input.hhi).tier === "critical") {
    items.push({
      id: "concentration",
      text: riskLine(input.hhi),
      href: "/dashboard",
      severity: "notice",
    });
  }

  if (
    input.topMover !== null &&
    Math.abs(input.topMover.dayPct) >= BRIEFING_NOTABLE_MOVE_THRESHOLD
  ) {
    items.push({
      id: "notable-move",
      text: `${input.topMover.ticker} moved ${formatSignedPercent(input.topMover.dayPct, 1)} today.`,
      href: `/stock/${input.topMover.ticker}`,
      severity: "notice",
    });
  }

  const earningsWindowEnd = addDays(input.today, BRIEFING_EARNINGS_WINDOW_DAYS);
  const upcoming = input.upcomingEarnings
    .filter((event) => event.date >= input.today && event.date <= earningsWindowEnd)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, MAX_EARNINGS_ATTENTION_ITEMS);

  for (const event of upcoming) {
    items.push({
      id: `earnings-${event.ticker}`,
      text: `${event.ticker} reports earnings ${formatDate(event.date)}.`,
      href: `/stock/${event.ticker}`,
      severity: "notice",
    });
  }

  return items;
}
