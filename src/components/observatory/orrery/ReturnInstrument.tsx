"use client";

import {
  useMemo,
  useState,
  type MouseEvent,
} from "react";
import styles from "./orrery.module.css";

export type ReturnInstrumentPoint = {
  date: string;
  index: number;
  benchmarkIndex?: number;
};

/**
 * R7-W3(a). One named line on the plot.
 *
 * The four screenshots Devan said displayed information better all shared
 * this shape: several series at once, each its own colour, each individually
 * toggleable, with a hover readout giving exact values for every visible
 * line at a date. The single-benchmark path below stays exactly as it was —
 * PlanetDetail and the §11 detent evidence both depend on it — and this is
 * an additive second mode.
 */
export type ReturnSeries = {
  id: string;
  label: string;
  /** Identity colour from lib/observatory/identity-palette, or the book's gold. */
  color: string;
  /** Index values aligned to the shared date axis. Null where the series has no point. */
  values: readonly (number | null)[];
  /** Benchmarks render dashed, so the lines are distinguishable without colour alone. */
  dashed?: boolean;
};

type ReturnRange = "7d" | "30d" | "since" | "max";

function rangesFor(
  sinceLabel: string,
): ReadonlyArray<{ id: ReturnRange; label: string; title: string }> {
  return [
    { id: "7d", label: "7D", title: "7 DAYS" },
    { id: "30d", label: "30D", title: "30 DAYS" },
    { id: "since", label: sinceLabel, title: sinceLabel },
    { id: "max", label: "MAX", title: "MAX" },
  ];
}

function signedReturn(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  const arrow = value > 0 ? "▲" : value < 0 ? "▼" : "◆";
  return `${arrow} ${Math.abs(value * 100).toFixed(1)}%`;
}

function windowed(
  points: readonly ReturnInstrumentPoint[],
  range: ReturnRange,
  sinceIndex: number,
): readonly ReturnInstrumentPoint[] {
  if (range === "7d") return points.slice(-7);
  if (range === "30d") return points.slice(-30);
  if (range === "since") return points.slice(sinceIndex);
  return points;
}

/* §11 review F4: SINCE BUY and MAX rendered the same figure and the same
 * path — a toggle with no consequence. Two-part fix: `sinceIndex` gives
 * SINCE BUY a real purchase-date window whenever the series carries
 * pre-purchase history (the Chart Room's longer series will); and when two
 * windows still produce an identical series, the later detent is not
 * rendered at all — round 5's own rule: where the toggle has no
 * consequence, the toggle simply isn't there. */
function windowSignature(points: readonly ReturnInstrumentPoint[]): string {
  return points.map((point) => `${point.date}:${point.index}`).join("|");
}

function returnFor(points: readonly ReturnInstrumentPoint[], key: "index" | "benchmarkIndex"): number | null {
  const first = points.find((point) => typeof point[key] === "number")?.[key];
  const last = [...points].reverse().find((point) => typeof point[key] === "number")?.[key];
  return typeof first === "number" && typeof last === "number" && first !== 0
    ? last / first - 1
    : null;
}

function pathFor(
  points: readonly ReturnInstrumentPoint[],
  key: "index" | "benchmarkIndex",
  min: number,
  max: number,
): string {
  const drawable = points
    .map((point, index) => ({ value: point[key], index }))
    .filter((point): point is { value: number; index: number } => typeof point.value === "number");
  if (drawable.length < 2) return "";
  const span = max - min || 1;
  return drawable.map(({ value, index }, pathIndex) => {
    const x = 38 + (index / Math.max(1, points.length - 1)) * 566;
    const y = 18 + ((max - value) / span) * 118;
    return `${pathIndex === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
}

function compactDate(value: string): string {
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isNaN(date.valueOf())
    ? value.toUpperCase()
    : date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }).toUpperCase();
}

/**
 * R7 Jul 31, third pass on the same complaint — and the first two missed it.
 *
 * "Wider y axis" then "narrowed" both sounded like the DATA RANGE, so that
 * is what changed, twice, in opposite directions. What he meant: *"it just
 * needs to be a larger scale… can still be +10 to −11, but the y axis needs
 * to be much larger so you can better see the changes."*
 *
 * The range was never the problem. The plot area was 124 units tall against
 * 566 wide — a letterbox, where a 2% move is a few pixels of vertical travel
 * no matter how the bounds are chosen. The fix is geometric: the plot is now
 * 282 units tall, so the same ±10% span gets more than double the vertical
 * distance and a small move becomes a visible one.
 *
 * `left` widens too, because percent labels ("+10.5%") need more room than
 * the bare index numbers they replaced.
 */
const PLOT = { left: 54, right: 604, top: 18, bottom: 300 } as const;

/**
 * R7-W3(a) — several series at once, each toggleable, with a hover readout
 * that reports every visible line.
 *
 * Deliberately a sibling of ReturnInstrument rather than a rewrite of it.
 * ReturnInstrument carries the §11 detent rules and is depended on by
 * PlanetDetail and a committed evidence test; folding two behaviours into it
 * would put that at risk for no gain. The shared helpers above are reused.
 */
export function MultiReturnPlot({
  dates,
  series,
  initiallyHidden = [],
  ariaLabel,
}: {
  dates: readonly string[];
  series: readonly ReturnSeries[];
  /** Series ids that start switched off — the tail of a 13-stock book. */
  initiallyHidden?: readonly string[];
  ariaLabel: string;
}) {
  const [hidden, setHidden] = useState<ReadonlySet<string>>(
    () => new Set(initiallyHidden),
  );
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const visible = useMemo(
    () => series.filter((item) => !hidden.has(item.id)),
    [series, hidden],
  );

  /**
   * R7 Jul 31 (R1/R2). The axis reads in percent growth, not an index out of
   * 100, and it is given room.
   *
   * TWO CORRECTIONS FROM HIM, and the second reverses the first.
   *
   * "The graphs need to have a much wider y axis because all the data is
   * cramped" → padding went to 35% of span, rounded outward to whole
   * percents. Then: *"I told you wrong the returns y axis needs to be
   * narrowed so you can differentiate the graphs better."*
   *
   * Resolved on the third pass: neither sentence was about the range. See
   * PLOT above — the plot area was too SHORT, so no choice of bounds could
   * make a small move visible. Padding stays modest at 10% with a 0.4-point
   * floor; the height is what does the work now.
   */
  const { min, max } = useMemo(() => {
    const values = visible
      .flatMap((item) => item.values)
      .filter((value): value is number => typeof value === "number");
    // 100 — zero growth — is always in frame: every series is indexed to it,
    // so a plot that cropped it would hide whether a line is up or down.
    const all = [...values, 100];
    const low = Math.min(...all);
    const high = Math.max(...all);
    const span = Math.max(high - low, 0.8);
    const pad = Math.max(0.4, span * 0.1);
    return { min: low - pad, max: high + pad };
  }, [visible]);

  /** Index value -> growth percent, which is what the axis actually shows. */
  const asPercent = (index: number) => index - 100;
  const formatPercent = (index: number, digits = 0) => {
    const percent = asPercent(index);
    const sign = percent > 0 ? "+" : percent < 0 ? "−" : "";
    return `${sign}${Math.abs(percent).toFixed(digits)}%`;
  };

  const xFor = (index: number) =>
    PLOT.left +
    (index / Math.max(1, dates.length - 1)) * (PLOT.right - PLOT.left);
  const yFor = (value: number) =>
    PLOT.top + ((max - value) / (max - min || 1)) * (PLOT.bottom - PLOT.top);

  const pathOf = (item: ReturnSeries) => {
    const drawable = item.values
      .map((value, index) => ({ value, index }))
      .filter((point): point is { value: number; index: number } =>
        typeof point.value === "number",
      );
    if (drawable.length < 2) return "";
    return drawable
      .map(
        ({ value, index }, position) =>
          `${position === 0 ? "M" : "L"}${xFor(index).toFixed(1)} ${yFor(value).toFixed(1)}`,
      )
      .join(" ");
  };

  const onMove = (event: MouseEvent<SVGSVGElement>) => {
    if (dates.length < 2) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width === 0) return;
    // Screen pixels -> viewBox units (the svg is 640 wide however it is laid
    // out) -> position along the plot area.
    const viewBoxX = ((event.clientX - rect.left) / rect.width) * 640;
    const ratio =
      (viewBoxX - PLOT.left) / (PLOT.right - PLOT.left);
    setHoverIndex(
      Math.max(
        0,
        Math.min(dates.length - 1, Math.round(ratio * (dates.length - 1))),
      ),
    );
  };

  const baselineY = yFor(100);
  /* R7 Jul 31 (R3): "more dates at the bottom". His spreadsheet labels every
   * date; at this width that would collide, so the axis takes as many evenly
   * spaced labels as fit at ~62px apart, always including both ends. */
  const tickCount = Math.max(
    2,
    Math.min(9, Math.floor((PLOT.right - PLOT.left) / 62), dates.length),
  );
  const tickIndexes =
    dates.length <= tickCount
      ? dates.map((_, index) => index)
      : Array.from({ length: tickCount }, (_, step) =>
          Math.round((step / (tickCount - 1)) * (dates.length - 1)),
        );

  const readout =
    hoverIndex === null
      ? []
      : visible
          .map((item) => ({ item, value: item.values[hoverIndex] }))
          .filter((row): row is { item: ReturnSeries; value: number } =>
            typeof row.value === "number",
          );

  return (
    <section className={styles.multiReturnPlot}>
      <div
        className={styles.seriesToggleRow}
        role="group"
        aria-label="Series shown"
      >
        {series.map((item) => {
          const on = !hidden.has(item.id);
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={on}
              data-series={item.id}
              // Off-state is hollow: the chip keeps its colour as an outline so
              // the reader can still see which line it would bring back.
              style={{
                borderColor: item.color,
                background: on ? item.color : "transparent",
                color: on ? "#0B0F0E" : item.color,
              }}
              onClick={() =>
                setHidden((current) => {
                  const next = new Set(current);
                  if (next.has(item.id)) next.delete(item.id);
                  else next.add(item.id);
                  return next;
                })
              }
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <svg
        className={styles.returnPlot}
        viewBox="0 0 640 340"
        role="img"
        aria-label={ariaLabel}
        onMouseMove={onMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        {/* Seven gridlines, not five: a taller axis can carry more without
            crowding, and more reference lines is what makes a small move
            readable against a number rather than just visible. */}
        {/* R7-W9. Keyed by step, not by value.

            A key of `value` duplicates the moment two gridlines carry the
            same number, which happens whenever a series is flat: min and max
            collapse together and all seven steps between them evaluate
            identically. React then warns about two children with the same
            key. Position is what identifies a gridline here; the value is
            data that happens to sit on it. */}
        {Array.from({ length: 7 }, (_, step) => min + ((max - min) * step) / 6).map(
          (value, step) => (
            <g key={step}>
              <line
                className={styles.returnHairline}
                x1={PLOT.left}
                x2={PLOT.right}
                y1={yFor(value)}
                y2={yFor(value)}
              />
              <text x="2" y={yFor(value) + 3}>
                {/* A narrow axis needs a decimal, or five gridlines all
                    round to the same whole percent and say nothing. */}
                {formatPercent(value, max - min < 6 ? 1 : 0)}
              </text>
            </g>
          ),
        )}
        <line
          className={styles.returnBaseline}
          x1={PLOT.left}
          x2={PLOT.right}
          y1={baselineY}
          y2={baselineY}
        />
        {tickIndexes.map((index) => (
          <text
            key={index}
            className={styles.returnDateTick}
            x={xFor(index)}
            y={PLOT.bottom + 18}
            textAnchor="end"
            transform={`rotate(-45 ${xFor(index)} ${PLOT.bottom + 18})`}
          >
            {compactDate(dates[index] ?? "")}
          </text>
        ))}
        {visible.map((item) => (
          <path
            key={item.id}
            d={pathOf(item)}
            fill="none"
            stroke={item.color}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray={item.dashed ? "5 4" : undefined}
          />
        ))}
        {hoverIndex !== null && readout.length > 0 ? (
          <g className={styles.returnCrosshair}>
            <line
              x1={xFor(hoverIndex)}
              x2={xFor(hoverIndex)}
              y1={PLOT.top}
              y2={PLOT.bottom}
            />
            {readout.map(({ item, value }) => (
              <circle
                key={item.id}
                cx={xFor(hoverIndex)}
                cy={yFor(value)}
                r="3"
                fill={item.color}
              />
            ))}
            <g
              transform={`translate(${Math.max(
                PLOT.left + 2,
                Math.min(PLOT.right - 132, xFor(hoverIndex) - 65),
              )} 2)`}
            >
              <rect width="130" height={18 + readout.length * 14} rx="2" />
              <text x="8" y="13" className={styles.returnTooltipDate}>
                {compactDate(dates[hoverIndex] ?? "")}
              </text>
              {readout.map(({ item, value }, row) => (
                <g key={item.id} transform={`translate(0 ${27 + row * 14})`}>
                  <rect x="8" y="-6" width="7" height="7" fill={item.color} rx="1" />
                  <text x="21" y="0">
                    {item.label}
                  </text>
                  <text x="122" y="0" textAnchor="end">
                    {formatPercent(value, 1)}
                  </text>
                </g>
              ))}
            </g>
          </g>
        ) : null}
      </svg>
    </section>
  );
}

export function ReturnInstrument({
  points,
  initialRange = "30d",
  roomScale = false,
  ariaLabel,
  sinceLabel = "SINCE BUY",
  sinceIndex = 0,
  benchmarkLabel = "VOO",
}: {
  points: readonly ReturnInstrumentPoint[];
  initialRange?: ReturnRange;
  roomScale?: boolean;
  ariaLabel: string;
  /** Window word for the "since" detent — SINCE BUY on a holding, SINCE START on the book. */
  sinceLabel?: string;
  /** First index inside the since-window; earlier points are pre-purchase history. */
  sinceIndex?: number;
  /** §15 BHV-03: which benchmark `points[].benchmarkIndex` represents (VOO/VTI/XLK). */
  benchmarkLabel?: string;
}) {
  const RANGES = useMemo(() => rangesFor(sinceLabel), [sinceLabel]);
  const visibleRanges = useMemo(() => {
    // A fixed-span detent is only honest when the series genuinely spans
    // it — a 20-session series titled "30 DAYS" overstates its window.
    const spanValid: Record<ReturnRange, boolean> = {
      "7d": points.length > 7,
      "30d": points.length > 30,
      since: true,
      max: true,
    };
    // Identical windows collapse to ONE detent; the window-word detent
    // outranks generic spans, which outrank MAX.
    const priority: ReturnRange[] = ["since", "30d", "7d", "max"];
    const keptBySignature = new Map<string, ReturnRange>();
    for (const id of priority) {
      if (!spanValid[id]) continue;
      const signature = windowSignature(windowed(points, id, sinceIndex));
      if (!keptBySignature.has(signature)) keptBySignature.set(signature, id);
    }
    const kept = new Set(keptBySignature.values());
    return RANGES.filter((item) => kept.has(item.id));
  }, [RANGES, points, sinceIndex]);
  const [range, setRange] = useState<ReturnRange>(initialRange);
  const activeRange = visibleRanges.some((item) => item.id === range)
    ? range
    : (visibleRanges.at(-1)?.id ?? "30d");
  const [benchmarkVisible, setBenchmarkVisible] = useState(true);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const series = useMemo(
    () => windowed(points, activeRange, sinceIndex),
    [points, activeRange, sinceIndex],
  );
  const hasBenchmark =
    series.length >= 2 &&
    series.every((point) => typeof point.benchmarkIndex === "number");
  const values = series.flatMap((point) => [
    point.index,
    ...(hasBenchmark && benchmarkVisible && typeof point.benchmarkIndex === "number"
      ? [point.benchmarkIndex]
      : []),
    100,
  ]);
  const rawMin = values.length ? Math.min(...values) : 96;
  const rawMax = values.length ? Math.max(...values) : 104;
  const padding = Math.max(1, (rawMax - rawMin) * 0.08);
  const min = rawMin - padding;
  const max = rawMax + padding;
  const portfolioReturn = returnFor(series, "index");
  const benchmarkReturn = returnFor(series, "benchmarkIndex");
  const portfolioPath = pathFor(series, "index", min, max);
  const benchmarkPath = pathFor(series, "benchmarkIndex", min, max);
  const baselineY = 18 + ((max - 100) / (max - min || 1)) * 118;
  const endPoint = series.at(-1);
  const endY = endPoint
    ? 18 + ((max - endPoint.index) / (max - min || 1)) * 118
    : 77;
  const selectedRange =
    visibleRanges.find((item) => item.id === activeRange) ?? visibleRanges[0];
  const hoverPoint = hoverIndex === null ? null : series[hoverIndex] ?? null;
  const hoverX = hoverIndex === null
    ? 0
    : 38 + (hoverIndex / Math.max(1, series.length - 1)) * 566;
  const hoverY = hoverPoint
    ? 18 + ((max - hoverPoint.index) / (max - min || 1)) * 118
    : 0;
  const onMove = (event: MouseEvent<SVGSVGElement>) => {
    if (series.length < 2) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const local = Math.max(38, Math.min(604, event.clientX - rect.left));
    setHoverIndex(Math.round(((local - 38) / 566) * (series.length - 1)));
  };

  return (
    <section
      className={styles.returnInstrument}
      data-room-scale={roomScale ? "true" : "false"}
      data-range={activeRange}
      data-chart-signature={portfolioPath}
    >
      <header>
        <h3>
          {selectedRange.title} · <span data-signal={portfolioReturn === null ? "flat" : portfolioReturn >= 0 ? "positive" : "negative"}>{signedReturn(portfolioReturn)}</span>
        </h3>
        {hasBenchmark ? (
          <button
            type="button"
            aria-pressed={benchmarkVisible}
            onClick={() => setBenchmarkVisible((visible) => !visible)}
          >
            {benchmarkLabel} · SAME PERIOD {benchmarkVisible ? "ON" : "OFF"}
          </button>
        ) : null}
      </header>
      <div className={styles.rangeDetents} aria-label="Return window">
        {visibleRanges.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={activeRange === item.id}
            onClick={() => setRange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <svg
        className={styles.returnPlot}
        viewBox="0 0 640 160"
        role="img"
        aria-label={`${ariaLabel}, ${selectedRange.title}, ${signedReturn(portfolioReturn)}`}
        onMouseMove={onMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <rect
          className={styles.returnBelowBaseline}
          x="38"
          y={baselineY}
          width="566"
          height={Math.max(0, 142 - baselineY)}
        />
        {[min, (min + max) / 2, max].map((value, step) => {
          const y = 18 + ((max - value) / (max - min || 1)) * 118;
          return (
            // R7-W9: index, not value — a flat series collapses min and max
            // into the same number and duplicates the key.
            <g key={step}>
              <line className={styles.returnHairline} x1="38" x2="604" y1={y} y2={y} />
              <text x="2" y={y + 3}>{value.toFixed(0)}</text>
            </g>
          );
        })}
        <line className={styles.returnBaseline} x1="38" x2="604" y1={baselineY} y2={baselineY} />
        {hasBenchmark && benchmarkVisible ? (
          <path className={styles.returnBenchmarkTrace} d={benchmarkPath} />
        ) : null}
        <path className={styles.returnPortfolioTrace} d={portfolioPath} />
        {series[0] ? (
          <circle
            className={styles.returnEndpoint}
            cx="38"
            cy={18 + ((max - series[0].index) / (max - min || 1)) * 118}
            r="3"
          />
        ) : null}
        {endPoint ? (
          <>
            <circle className={styles.returnEndpoint} cx="604" cy={endY} r="4" />
            <g
              className={styles.returnEndChip}
              data-signal={portfolioReturn === null ? "flat" : portfolioReturn >= 0 ? "positive" : "negative"}
              transform={`translate(526 ${Math.max(2, Math.min(128, endY - 13))})`}
            >
              <rect width="78" height="20" rx="2" />
              <text x="39" y="14" textAnchor="middle">{signedReturn(portfolioReturn)}</text>
            </g>
          </>
        ) : null}
        {hoverPoint ? (
          <g className={styles.returnCrosshair}>
            <line x1={hoverX} x2={hoverX} y1="18" y2="142" />
            <line x1="38" x2="604" y1={hoverY} y2={hoverY} />
            <circle cx={hoverX} cy={hoverY} r="3" />
            <g transform={`translate(${Math.max(40, Math.min(468, hoverX - 68))} 2)`}>
              <rect width="136" height="20" rx="2" />
              <text x="68" y="14" textAnchor="middle">
                {compactDate(hoverPoint.date)} · {signedReturn(
                  series[0] && series[0].index !== 0
                    ? hoverPoint.index / series[0].index - 1
                    : null,
                )}
              </text>
            </g>
          </g>
        ) : null}
      </svg>
      {hasBenchmark && benchmarkVisible ? (
        <p className={styles.benchmarkConclusion}>
          {benchmarkLabel} · SAME PERIOD {signedReturn(benchmarkReturn)}
        </p>
      ) : null}
    </section>
  );
}
