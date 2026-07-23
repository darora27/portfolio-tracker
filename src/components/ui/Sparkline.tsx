import { sparklineGeometry } from "@/lib/sparkline";

/**
 * Minimal SVG sparkline: min-max normalized, decorative only (no
 * tooltip, no axes). A flat or single-point series still renders — a
 * straight muted line rather than nothing — since "no shape" would read
 * as missing data rather than "unchanged."
 */
export function Sparkline({
  points,
  width = 96,
  height = 28,
}: {
  points: number[];
  width?: number;
  height?: number;
}) {
  if (points.length === 0) return null;

  const { coords, isFlat } = sparklineGeometry(points, width, height);
  const color = isFlat
    ? "var(--text-muted)"
    : points[points.length - 1] >= points[0]
      ? "var(--gain)"
      : "var(--loss)";

  return (
    <svg width={width} height={height} aria-hidden className="hidden shrink-0 sm:block">
      <polyline
        points={coords}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
