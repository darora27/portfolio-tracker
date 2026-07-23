export type SparklineGeometry = {
  /** SVG `points` attribute value for a `<polyline>`. */
  coords: string;
  /** True for an empty/single-point series, or one where every value is equal. */
  isFlat: boolean;
};

/**
 * Min-max normalized coordinates for a sparkline `<polyline>`, with `pad`
 * pixels of margin on every side. A single point can't form a line segment
 * at all, and a genuinely flat series collapses to one point under min-max
 * normalization — both cases render as one straight horizontal line
 * spanning the full width instead of nothing, so "unchanged" reads as a
 * shape rather than as missing data.
 */
export function sparklineGeometry(
  points: number[],
  width: number,
  height: number,
  pad = 2,
): SparklineGeometry {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const isFlat = points.length < 2 || min === max;

  if (isFlat) {
    return { coords: `${pad},${height / 2} ${width - pad},${height / 2}`, isFlat };
  }

  const innerWidth = width - pad * 2;
  const innerHeight = height - pad * 2;
  const stepX = innerWidth / (points.length - 1);
  const coords = points
    .map((v, i) => {
      const x = pad + i * stepX;
      const y = pad + innerHeight - ((v - min) / (max - min)) * innerHeight;
      return `${x},${y}`;
    })
    .join(" ");
  return { coords, isFlat };
}
