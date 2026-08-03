import Link from "next/link";
import { cookies } from "next/headers";
import { LoginForm } from "@/components/auth/LoginForm";
import { isValidSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard-data";
import {
  healthScalarForPortfolio,
  resolveBeltMembership,
  sunspotIntensityForDrawdown,
} from "@/lib/observatory/orrery";
import { weeklyReturnsFromIndexSeries } from "@/lib/observatory/scene-model";
import {
  MISSION_CONTROL_PANELS,
  type MissionControlPanelId,
} from "./mission-control-panels";
import { OrreryWorld, type OrreryCameraState } from "./OrreryWorld";
import { MissionControlRoomContent } from "./MissionControlRoomContent";
import { additionalSectorSystem } from "@/lib/observatory/sector-systems";
import { todayInTimeZone } from "@/lib/date";

export const AUTHORED_SYSTEMS_ENABLED = false;

export type UniverseSearchParams = {
  camera?: string | string[];
  focus?: string | string[];
  holding?: string | string[];
  planet?: string | string[];
  manual?: string | string[];
  no3d?: string | string[];
  station?: string | string[];
  detail?: string | string[];
  system?: string | string[];
  pair?: string | string[];
  draft?: string | string[];
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
    : "plot";
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
    requestedCamera === "overview" ||
    (AUTHORED_SYSTEMS_ENABLED && requestedCamera === "sector")
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
  const sectorSystem = AUTHORED_SYSTEMS_ENABLED
    ? additionalSectorSystem(data.publicOrreryHoldings)
    : undefined;
  const missionMode = authenticated && ownerGate ? "private" : "public";
  const missionControlContent = (
    <MissionControlRoomContent
      data={data}
      basePath={basePath}
      mode={missionMode}
    />
  );

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
        weekReturnPct: data.twr7d,
        marketRelativePct: voo.excessReturnPct,
        topTwoWeight: data.top2ConcentrationPct,
        drawdownPct: data.allTimeHigh?.pct ?? null,
      }}
      missionControlContent={missionControlContent}
      activeMissionPanel={activeMissionPanel}
      missionMode={missionMode}
      missionPreservedQuery={{
        ...(no3d ? { no3d: "1" } : {}),
        ...(first(params.pair) ? { pair: first(params.pair)! } : {}),
      }}
      missionSignalPair={first(params.pair) ?? null}
      draftParam={missionMode === "private" ? first(params.draft) ?? null : null}
      newsByHolding={data.newsByHolding ?? {}}
      upcomingEarnings={data.upcomingEarnings}
      publicTradeLog={data.publicTradeLog ?? []}
      tradeComet={(data.publicTradeLog ?? []).find(
        (entry) => entry.date === todayInTimeZone("America/New_York"),
      ) ?? null}
      portfolioVolatility={data.volatilityPct}
      /* R7-W8(b). Same-period index returns, from data already computed for
         the RETURNS section. An unavailable benchmark still gets a craft with
         a null value — it renders dim and reads "—" rather than vanishing,
         so the ring does not silently change size when a feed is down. */
      indexBenchmarks={data.benchmarkComparisons.map((comparison) => ({
        label:
          comparison.ticker === "VOO"
            ? "S&P 500"
            : comparison.ticker === "VTI"
              ? "TOTAL MARKET"
              : "TECH",
        returnPct: comparison.available ? comparison.twrPct : null,
      }))}
      portfolioBeta={data.betaVsVoo}
      sectorSystem={sectorSystem}
      selectedSystem={first(params.system) ?? null}
      transmissionsFirst={first(params.detail) === "transmissions"}
      auroraWeeklySeries={weeklyReturnsFromIndexSeries(
        data.chartData.map(({ portfolioIndex }) => portfolioIndex),
      )}
    />
  );
}
