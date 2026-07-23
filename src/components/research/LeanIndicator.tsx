import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { SentimentLean } from "@/lib/research/sentiment";

const LEAN_CONFIG: Record<SentimentLean, { Icon: typeof TrendingUp; label: string; color: string }> = {
  positive: { Icon: TrendingUp, label: "Positive", color: "var(--gain)" },
  negative: { Icon: TrendingDown, label: "Negative", color: "var(--loss)" },
  neutral: { Icon: Minus, label: "Neutral", color: "var(--text-muted)" },
};

/** Icon + label pairing for a sentiment lean — never color alone. */
export function LeanIndicator({ lean }: { lean: SentimentLean }) {
  const { Icon, label, color } = LEAN_CONFIG[lean];
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color }}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {label}
    </span>
  );
}
