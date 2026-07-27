import type { Metadata } from "next";
import { cookies } from "next/headers";
import {
  OrreryWorld,
  type OrreryCameraState,
} from "@/components/observatory/orrery/OrreryWorld";
import { PublicMissionControlContent } from "@/components/observatory/orrery/PublicMissionControlContent";
import {
  MISSION_CONTROL_PANELS,
  type MissionControlPanelId,
} from "@/components/observatory/orrery/MissionControl";
import { isValidSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard-data";
import { getHistoryData } from "@/lib/history-data";
import { getResearchData } from "@/lib/research-data";
import { supabase } from "@/lib/supabase/client";
import {
  healthScalarForPortfolio,
  resolveBeltMembership,
  sunspotIntensityForDrawdown,
} from "@/lib/observatory/orrery";
import styles from "./share-orrery.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Stock Market Universe — Share View",
  description: "Explore a public, read-only portfolio solar system.",
  robots: { index: false, follow: false },
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function resolveMissionPanel(
  value: string | string[] | undefined,
): MissionControlPanelId {
  const candidate = first(value);
  return MISSION_CONTROL_PANELS.some(({ id }) => id === candidate)
    ? (candidate as MissionControlPanelId)
    : "dashboard";
}

export default async function SharePage({
  searchParams,
}: {
  searchParams: Promise<{
    camera?: string | string[];
    chapter?: string | string[];
    explain?: string | string[];
    focus?: string | string[];
    holding?: string | string[];
    planet?: string | string[];
    manual?: string | string[];
    no3d?: string | string[];
    station?: string | string[];
  }>;
}) {
  const [data, params, cookieStore] = await Promise.all([
    getDashboardData(),
    searchParams,
    cookies(),
  ]);
  const ownerPassword = process.env.OWNER_PASSWORD;
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const authenticated = ownerPassword
    ? isValidSession(session, ownerPassword)
    : false;
  const activeMissionPanel = resolveMissionPanel(params.station);
  const focusParam = first(params.focus);
  const holdingParam = first(params.holding) ?? first(params.planet);
  const no3d = first(params.no3d) === "1";
  const manualOpen = first(params.manual) === "1";
  const portfolioSelected = focusParam === "portfolio";
  const selectedTicker = data.publicOrreryHoldings.some(
    (holding) => holding.ticker === holdingParam,
  )
    ? holdingParam ?? null
    : null;
  const requestedCamera = first(params.camera);
  const cameraState: OrreryCameraState =
    requestedCamera === "approach" ||
    requestedCamera === "command" ||
    requestedCamera === "overview"
      ? requestedCamera
      : selectedTicker
        ? "approach"
        : portfolioSelected
          ? "command"
          : "overview";
  const voo = data.benchmarkComparisons.find(
    (comparison) => comparison.ticker === "VOO",
  ) ?? {
    available: false,
    twrPct: null,
    excessReturnPct: null,
  };

  const orreryBelt =
    data.orreryBelt ??
    resolveBeltMembership(
      data.publicOrreryHoldings.map(({ ticker, weight }) => ({ ticker, weight })),
      null,
    );
  const portfolioHealth = {
    h: healthScalarForPortfolio(
      data.dailyChangePct,
      data.twr7d ?? 0,
      data.volatilityPct ?? 0.02,
    ),
    sunspotIntensity: sunspotIntensityForDrawdown(
      data.allTimeHigh?.pct ?? 0,
    ),
  };
  let missionControlContent = (
    <PublicMissionControlContent panel={activeMissionPanel} data={data} />
  );

  if (portfolioSelected && authenticated) {
    const { OwnerMissionControlContent } = await import(
      "@/components/observatory/orrery/OwnerMissionControlContent"
    );
    if (activeMissionPanel === "history") {
      missionControlContent = (
        <OwnerMissionControlContent
          panel="history"
          data={data}
          history={await getHistoryData()}
        />
      );
    } else if (activeMissionPanel === "research") {
      missionControlContent = (
        <OwnerMissionControlContent
          panel="research"
          data={data}
          research={await getResearchData()}
        />
      );
    } else if (activeMissionPanel === "trades") {
      const [{ data: trades, error }, { data: setting }] = await Promise.all([
        supabase.from("trades").select("*").order("date", { ascending: false }),
        supabase
          .from("settings")
          .select("value")
          .eq("key", "share_hide_dollars")
          .maybeSingle(),
      ]);
      if (error) throw error;
      missionControlContent = (
        <OwnerMissionControlContent
          panel="trades"
          data={data}
          trades={trades ?? []}
          hideDollars={setting?.value ?? true}
        />
      );
    } else {
      missionControlContent = (
        <OwnerMissionControlContent panel="dashboard" data={data} />
      );
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.orreryEntry}>
        <OrreryWorld
          basePath="/share"
          holdings={data.publicOrreryHoldings}
          orreryBelt={orreryBelt}
          selectedTicker={selectedTicker}
          portfolioSelected={portfolioSelected}
          cameraState={cameraState}
          manualOpen={manualOpen}
          forceNo3d={no3d}
          portfolioHealth={portfolioHealth}
          portfolioSummary={{
            returnPct: data.twrPct,
            dayReturnPct: data.dailyChangePct,
            marketRelativePct: voo.excessReturnPct,
            topTwoWeight: data.top2ConcentrationPct,
          }}
          missionControlContent={missionControlContent}
          activeMissionPanel={activeMissionPanel}
          missionMode={authenticated ? "private" : "public"}
          missionPreservedQuery={{
            ...(no3d ? { no3d: "1" } : {}),
          }}
        />
      </div>
    </div>
  );
}
