import { Triangle } from "lucide-react";
import { formatSignedCurrency, formatSignedPercent } from "@/lib/format";

export function DeltaChip({
  value,
  percent = false,
  decimals,
}: {
  value: number;
  percent?: boolean;
  decimals?: number;
}) {
  const isGain = value >= 0;
  const formatted = percent
    ? formatSignedPercent(value, decimals ?? 1)
    : formatSignedCurrency(value);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 font-mono text-xs font-medium ${
        isGain ? "bg-gain-bg text-gain" : "bg-loss-bg text-loss"
      }`}
    >
      <Triangle
        strokeWidth={0}
        aria-hidden
        className={`h-2.5 w-2.5 fill-current ${isGain ? "" : "rotate-180"}`}
      />
      {formatted}
    </span>
  );
}
