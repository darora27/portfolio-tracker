import type { DashboardData } from "@/lib/dashboard-data";
import type { MissionControlPanelId } from "./MissionControl";
import { CommsBay } from "./MissionControlBays/CommsBay";
import { HazardBay } from "./MissionControlBays/HazardBay";
import { LogBay } from "./MissionControlBays/LogBay";
import { ManifestBay } from "./MissionControlBays/ManifestBay";
import { ScopeBay } from "./MissionControlBays/ScopeBay";
import { SignalsBay } from "./MissionControlBays/SignalsBay";
import styles from "./orrery.module.css";

function pct(value: number | null): string {
  if (value === null) return "—";
  return `${value >= 0 ? "+" : ""}${(value * 100).toFixed(1)}%`;
}

export function PublicMissionControlContent({
  panel,
  data,
  basePath,
}: {
  panel: MissionControlPanelId;
  data: DashboardData;
  basePath: string;
}) {
  if (panel === "scope") {
    return <ScopeBay data={data.chartData} />;
  }
  if (panel === "hazard") {
    return (
      <HazardBay
        volatility={data.volatilityPct}
        beta={data.betaVsVoo ?? null}
        drawdown={data.allTimeHigh?.pct ?? null}
        winRate={data.winRatePct ?? 0}
        best={data.bestDay?.r ?? null}
        worst={data.worstDay?.r ?? null}
      />
    );
  }
  if (panel === "signals") {
    return (
      <SignalsBay
        tickers={data.correlationTickers}
        cells={data.correlationCells}
        holdings={data.publicOrreryHoldings}
        hhi={data.hhi}
      />
    );
  }
  if (panel === "comms") {
    return <CommsBay events={data.upcomingEarnings} />;
  }
  if (panel === "log") {
    return <LogBay entries={data.publicTradeLog ?? []} />;
  }
  if (panel === "plot") {
    const voo = data.benchmarkComparisons.find(({ ticker }) => ticker === "VOO");
    return (
      <section className={styles.operationsBay} aria-labelledby="plot-title">
        <h3 id="plot-title">PLOT</h3>
        <div className={styles.plotReadouts}>
          <span>DAY <b>{pct(data.dailyChangePct)}</b></span>
          <span>TWR <b>{pct(data.twrPct)}</b></span>
          <span>VS VOO <b>{pct(voo?.excessReturnPct ?? null)}</b></span>
          <span>BODIES <b>{data.publicOrreryHoldings.length}</b></span>
        </div>
        <ManifestBay holdings={data.publicOrreryHoldings} basePath={basePath} />
      </section>
    );
  }
  return (
    <ManifestBay
      holdings={data.publicOrreryHoldings}
      basePath={basePath}
    />
  );
}
