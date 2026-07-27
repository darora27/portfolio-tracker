import Link from "next/link";
import { cookies } from "next/headers";
import { LoginForm } from "@/components/auth/LoginForm";
import { isValidSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard-data";
import { getHistoryData } from "@/lib/history-data";
import { getResearchData } from "@/lib/research-data";
import {
  healthScalarForPortfolio,
  resolveBeltMembership,
  sunspotIntensityForDrawdown,
} from "@/lib/observatory/orrery";
import { supabase } from "@/lib/supabase/client";
import {
  MISSION_CONTROL_PANELS,
  type MissionControlPanelId,
} from "./MissionControl";
import { OrreryWorld, type OrreryCameraState } from "./OrreryWorld";
import { PublicMissionControlContent } from "./PublicMissionControlContent";

export type UniverseSearchParams = {
  camera?: string | string[];
  focus?: string | string[];
  holding?: string | string[];
  planet?: string | string[];
  manual?: string | string[];
  no3d?: string | string[];
  station?: string | string[];
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

export async function UniverseRoute({
  basePath,
  searchParams,
  ownerGate = false,
}: {
  basePath: "/" | "/share";
  searchParams: Promise<UniverseSearchParams>;
  ownerGate?: boolean;
}) {
  const [params, cookieStore] = await Promise.all([searchParams, cookies()]);
  const ownerPassword = process.env.OWNER_PASSWORD;
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const authenticated = ownerPassword
    ? isValidSession(session, ownerPassword)
    : false;

  if (ownerGate && !authenticated) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <Link
          href="/share"
          className="text-sm text-text-secondary hover:text-text-primary hover:underline"
        >
          View public share page
        </Link>
        <h1 className="mt-3 text-xl font-semibold text-text-primary">
          Portfolio Tracker
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Sign in to view the private universe.
        </p>
        <LoginForm />
      </div>
    );
  }

  const data = await getDashboardData();
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
      data.publicOrreryHoldings.map(({ ticker, weight }) => ({
        ticker,
        weight,
      })),
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
      "./OwnerMissionControlContent"
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
    <OrreryWorld
      basePath={basePath}
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
  );
}
