import { FlipCard } from "@/components/surface/FlipCard";
import { DepthPull } from "@/components/surface/DepthPull";
import { CountUpSettle } from "@/components/surface/CountUpSettle";
import { PortfolioOrrery } from "@/components/surface/PortfolioOrrery";
import { SurfaceGrowthChart } from "@/components/surface/SurfaceGrowthChart";
import { CompositionDonut, type DonutSlice } from "@/components/dashboard/CompositionDonut";
import { ConcentrationMeter } from "@/components/dashboard/ConcentrationMeter";
import { Card } from "@/components/ui/Card";
import { DeltaChip } from "@/components/ui/DeltaChip";
import type { ChartPoint } from "@/components/dashboard/ValueChart";
import type { Mover } from "@/components/dashboard/WinnersLosers";

function FlipFront({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">{eyebrow}</p>
      <p className="mt-3 text-base text-ink">{children}</p>
    </div>
  );
}

export type SurfaceActsProps = {
  mode: "private" | "share";
  ownerLabel: string;
  /** Dollars for private, TWR fraction (e.g. 0.1132) for share. */
  heroValue: number;
  weeklySublineText: string;
  chartData: ChartPoint[];
  positionsCount: number;
  topHoldingTicker: string | null;
  donutSlices: DonutSlice[];
  hhi: number;
  riskLineText: string;
  todayLineText: string;
  topMover: Mover | null;
  primaryHref: string;
  primaryLabel: string;
  /** Relative weights of the top few holdings — ambient visual variety for the Orrery only, never the sole data source. */
  orreryWeights: number[];
};

/**
 * The shared Act 1-3 body for both `/` and `/share` (they differ only in
 * hero units, dollar visibility, and where the primary button leads —
 * everything else is identical structure, so it lives here once).
 */
export function SurfaceActs({
  mode,
  ownerLabel,
  heroValue,
  weeklySublineText,
  chartData,
  positionsCount,
  topHoldingTicker,
  donutSlices,
  hhi,
  riskLineText,
  todayLineText,
  topMover,
  primaryHref,
  primaryLabel,
  orreryWeights,
}: SurfaceActsProps) {
  const hideDollars = mode === "share";

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Act 1 — the number */}
      <section className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden px-4 py-24 text-center sm:px-6">
        <PortfolioOrrery
          weights={orreryWeights}
          className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black_55%,transparent_92%)]"
        />
        <p className="relative z-10 font-display text-3xl italic text-ink-soft sm:text-4xl">{ownerLabel}</p>
        <div className="relative z-10 mt-6 text-[clamp(56px,10vw,112px)] font-bold leading-none font-mono text-ink">
          <CountUpSettle value={heroValue} variant={mode === "private" ? "currency" : "signedPercent"} />
        </div>
        <p className="relative z-10 mt-5 max-w-md text-lg text-ink-soft sm:text-xl">{weeklySublineText}</p>
      </section>

      {/* Act 2 — the shape. Nothing else on this screen. */}
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <SurfaceGrowthChart data={chartData} />
      </section>

      {/* Act 3 — the doors */}
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <p className="font-display text-2xl italic text-ink-soft">A closer look</p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FlipCard
            ariaLabel="Flip: What I own"
            seeMoreHref={primaryHref}
            front={
              <FlipFront eyebrow="What I own">
                {positionsCount} position{positionsCount === 1 ? "" : "s"}
                {topHoldingTicker ? ` — largest: ${topHoldingTicker}` : ""}
              </FlipFront>
            }
            back={<CompositionDonut slices={donutSlices} hideDollars={hideDollars} compact />}
          />
          <FlipCard
            ariaLabel="Flip: How risky is it"
            seeMoreHref={primaryHref}
            front={<FlipFront eyebrow="How risky is it">{riskLineText}</FlipFront>}
            back={<ConcentrationMeter hhi={hhi} />}
          />
          <FlipCard
            ariaLabel="Flip: Today"
            seeMoreHref={primaryHref}
            front={<FlipFront eyebrow="Today">{todayLineText}</FlipFront>}
            back={
              <Card>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Today&rsquo;s top mover
                </h3>
                {topMover ? (
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="font-medium text-text-primary">{topMover.ticker}</span>
                    <DeltaChip value={topMover.dayPct} percent decimals={2} />
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-text-muted">No live price moves yet today.</p>
                )}
              </Card>
            }
          />
        </div>

        <div className="mt-10 flex justify-center">
          <DepthPull
            href={primaryHref}
            className="inline-flex min-h-[44px] items-center rounded-full bg-accent px-7 py-3.5 text-lg font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {primaryLabel}
          </DepthPull>
        </div>
      </section>
    </div>
  );
}
