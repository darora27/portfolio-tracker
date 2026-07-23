import { CheckCircle2, AlertTriangle, AlertOctagon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { concentrationStatus, type ConcentrationTier } from "@/lib/portfolio/concentration-status";
import { formatNumber } from "@/lib/format";

const TIER_COLOR: Record<ConcentrationTier, string> = {
  good: "var(--status-good)",
  warning: "var(--status-warning)",
  critical: "var(--status-critical)",
};

const TIER_ICON: Record<ConcentrationTier, typeof CheckCircle2> = {
  good: CheckCircle2,
  warning: AlertTriangle,
  critical: AlertOctagon,
};

/**
 * Visual read on HHI (0-10000 concentration index) as a status meter —
 * never color alone: always paired with an icon and a plain-language
 * label, per the fixed status palette (good/warning/critical), never the
 * per-holding categorical colors used elsewhere on this dashboard.
 */
export function ConcentrationMeter({ hhi }: { hhi: number }) {
  const { tier, label } = concentrationStatus(hhi);
  const color = TIER_COLOR[tier];
  const Icon = TIER_ICON[tier];
  const fillPct = Math.min(100, (hhi / 10000) * 100);

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          Concentration risk
        </div>
        <span className="font-mono text-xs text-text-secondary">HHI {formatNumber(hhi, 0)}</span>
      </div>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full"
        style={{ background: `color-mix(in srgb, ${color} 20%, var(--surface-hover))` }}
      >
        <div className="h-full rounded-full transition-[width]" style={{ width: `${fillPct}%`, background: color }} />
      </div>
      <div className="mt-1.5 flex items-center gap-1.5 text-xs" style={{ color }}>
        <Icon className="h-3.5 w-3.5" aria-hidden />
        <span className="font-medium">{label}</span>
      </div>
    </Card>
  );
}
