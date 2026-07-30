"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  DataTexture,
  Float32BufferAttribute,
  Fog,
  Group,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  NoColorSpace,
  NormalBlending,
  type Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Raycaster,
  RedFormat,
  RGFormat,
  RingGeometry,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  Texture,
  UnsignedByteType,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import {
  ORRERY_SUN_CLEARANCE,
  type PublicOrreryHolding,
} from "@/lib/observatory/orrery";
import {
  ACTIVE_RING_OPACITY,
  APPROACH_CAMERA_DISTANCE,
  APPROACH_CAMERA_HEIGHT,
  APPROACH_CAMERA_TANGENT_OFFSET,
  APPROACH_LOOK_AT_TANGENT_OFFSET,
  OVERVIEW_RING_OPACITY,
  approachExposure,
  brandEntryPhase,
  buildOverviewSceneModel,
  layoutOverviewLabels,
  projectSphereScreenBounds,
  resolveOrreryRaycastTarget,
  ringVertexAlpha,
  starMagnitudeBucket,
  trailRibbonHalfWidths,
  type SceneModel,
  type TradeCometInput,
} from "@/lib/observatory/scene-model";
import { UNIVERSE_PALETTE } from "@/lib/observatory/universe-palette";
import type {
  OrreryCameraState,
  PortfolioHealth,
} from "./OrreryWorld";
import styles from "./orrery.module.css";

// F10 (VIS-16) evidence instrumentation: an odd-count arc of far-side
// screen points, +/-14deg in 7deg steps (5 points), an exact camera
// projection rather than an assumed circle. See the render loop's
// ringFarArc dataset assignment below.
const RING_FAR_ARC_HALF_COUNT = 2;
const RING_FAR_ARC_STEP_RADIANS = (7 * Math.PI) / 180;

const PLANET_VERTEX_SHADER = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    vUv = uv;
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewPosition = -viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const PLANET_FRAGMENT_SHADER = `
  uniform vec3 uBase;
  uniform vec3 uAccent;
  uniform float uSeed;
  uniform float uActive;
  uniform float uDim;
  uniform float uHasTextures;
  uniform float uExposure;
  uniform sampler2D uBaseMap;
  uniform sampler2D uEmissiveMap;
  uniform sampler2D uNormalMap;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    vec2 normalXY = texture2D(uNormalMap, vUv).rg * 2.0 - 1.0;
    float normalZ = sqrt(max(0.0, 1.0 - dot(normalXY, normalXY)));
    vec3 normalTex = vec3(normalXY, normalZ);
    vec3 normal = normalize(vNormal + normalTex * 0.16 * uHasTextures);
    vec3 viewDirection = normalize(vViewPosition);
    vec3 lightDirection = normalize(vec3(0.7, 0.8, 1.0));
    float diffuse = 0.18 + 0.82 * max(dot(normal, lightDirection), 0.0);
    float bands = sin(vUv.y * (32.0 + mod(uSeed, 8.0)) + sin(vUv.x * 30.0));
    float pattern = smoothstep(-0.45, 0.62, bands);
    vec3 procedural = mix(uBase, uAccent, pattern * 0.58);
    vec3 mapped = texture2D(uBaseMap, vUv).rgb;
    float emissive = texture2D(uEmissiveMap, vUv).r;
    vec3 surface = mix(procedural, mapped, uHasTextures);
    float rim = pow(1.0 - max(dot(normal, viewDirection), 0.0), 2.2);
    vec3 color = surface * diffuse + uAccent * rim * (0.7 + uActive * 0.5);
    color += uAccent * emissive * uHasTextures * 0.75 + uAccent * uActive * 0.1;
    gl_FragColor = vec4(color * uDim * uExposure, 1.0);
  }
`;

const SUN_VERTEX_SHADER = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vViewPosition;
  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vPosition = normalize(position);
    vViewPosition = -viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const SUN_FRAGMENT_SHADER = `
  uniform float uTime;
  uniform float uHealth;
  uniform float uSunspots;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vViewPosition;
  void main() {
    float filaments = sin(vPosition.y * 19.0 + uTime * (0.34 + max(uHealth, 0.0) * 0.4));
    filaments += sin((vPosition.x - vPosition.z) * 15.0 - uTime * 0.28);
    float plasma = smoothstep(-0.9, 1.45, filaments);
    float healthMix = (uHealth + 1.0) * 0.5;
    vec3 ember = vec3(0.48, 0.055, 0.018);
    vec3 amber = vec3(1.0, 0.52, 0.08);
    vec3 gold = vec3(1.0, 0.93, 0.62);
    vec3 weather = healthMix < 0.5
      ? mix(ember, amber, healthMix * 2.0)
      : mix(amber, gold, (healthMix - 0.5) * 2.0);
    float spotNoise = sin(vPosition.x * 21.0) * sin(vPosition.y * 17.0) * sin(vPosition.z * 23.0);
    float spots = smoothstep(0.68 - uSunspots * 0.6, 0.94, spotNoise) * uSunspots;
    float rim = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewPosition)), 0.0), 1.7);
    vec3 color = weather * (0.56 + plasma * 0.62) * (1.0 - spots * 0.72);
    gl_FragColor = vec4(color + weather * rim * 0.65, 1.0);
  }
`;

const RING_VERTEX_SHADER = `
  attribute float aAlpha;
  varying float vAlpha;
  void main() {
    vAlpha = aAlpha;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const RING_FRAGMENT_SHADER = `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;
  void main() {
    gl_FragColor = vec4(uColor, vAlpha * uOpacity);
  }
`;

type PlanetRuntime = {
  holding: PublicOrreryHolding;
  orbit: Group;
  mesh: Mesh<SphereGeometry, ShaderMaterial>;
  path: Mesh<RingGeometry, ShaderMaterial>;
  trailMeshes: Mesh<BufferGeometry, MeshBasicMaterial>[];
  label: HTMLButtonElement;
  descriptor: SceneModel["planets"][number];
  labelDescriptor: SceneModel["labels"][number];
  trailDescriptor: SceneModel["trails"][number];
  initialAngle: number;
  direction: SceneModel["planets"][number]["direction"];
  angularSpeed: number;
  spinRadiansPerSecond: number;
};

type RocketFlight = {
  ticker: string;
  startedAt: number;
  startX: number;
  startY: number;
};


function tickerSeed(ticker: string): number {
  return [...ticker].reduce((sum, char) => sum * 31 + char.charCodeAt(0), 7);
}

function seededUnit(index: number, salt: number): number {
  const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

type StarPopulationRuntime = {
  group: Group;
  points: Array<Points<BufferGeometry, PointsMaterial>>;
  spikes: LineSegments<BufferGeometry, LineBasicMaterial>;
};

function gaussian(index: number, salt: number): number {
  const left = Math.max(0.000001, seededUnit(index, salt));
  const right = seededUnit(index, salt + 1);
  return Math.sqrt(-2 * Math.log(left)) * Math.cos(Math.PI * 2 * right);
}

function createStarPopulation(
  descriptor: SceneModel["starPopulation"],
): StarPopulationRuntime {
  type StarBucket = keyof typeof descriptor.buckets;
  const positions = {
    faint: new Float32Array(descriptor.buckets.faint * 3),
    medium: new Float32Array(descriptor.buckets.medium * 3),
    bright: new Float32Array(descriptor.buckets.bright * 3),
    diffraction: new Float32Array(descriptor.buckets.diffraction * 3),
  };
  const colors = {
    faint: new Float32Array(descriptor.buckets.faint * 3),
    medium: new Float32Array(descriptor.buckets.medium * 3),
    bright: new Float32Array(descriptor.buckets.bright * 3),
    diffraction: new Float32Array(descriptor.buckets.diffraction * 3),
  };
  const positionOffsets: Record<StarBucket, number> = {
    faint: 0,
    medium: 0,
    bright: 0,
    diffraction: 0,
  };
  const spikePositions = new Float32Array(
    descriptor.buckets.diffraction * 4 * 3,
  );
  let spikeOffset = 0;
  const cyan = new Color(UNIVERSE_PALETTE.glass.cyan);
  const violet = new Color(UNIVERSE_PALETTE.glass.violet);
  const cream = new Color(UNIVERSE_PALETTE.cabinet.cream);
  for (let index = 0; index < descriptor.count; index += 1) {
    const bucket = starMagnitudeBucket(
      index,
      descriptor.count,
    ) as StarBucket;
    const clustered = seededUnit(index, 20) > 0.36;
    const cluster =
      descriptor.clusterSeeds[index % descriptor.clusterSeeds.length];
    const theta = seededUnit(index, 21) * Math.PI * 2;
    const radius = 11 + seededUnit(index, 22) * 22;
    let x = Math.cos(theta) * radius;
    let y = (seededUnit(index, 23) * 2 - 1) * radius * 0.62;
    let z = Math.sin(theta) * radius - 8;
    if (clustered) {
      x += cluster.x * 14 + gaussian(index, 24) * 3.2;
      y += cluster.y * 10 + gaussian(index, 26) * 2.4;
      z += cluster.z * 12 + gaussian(index, 28) * 3.4;
    }
    if (seededUnit(index, 30) < 0.36) {
      y = 6.5 + seededUnit(index, 31) * 5.5;
      x += (seededUnit(index, 32) - 0.5) * 6;
    }
    let offset = positionOffsets[bucket];
    positions[bucket][offset] = x;
    positions[bucket][offset + 1] = y;
    positions[bucket][offset + 2] = z;
    const tint = index % 23 === 0 ? cyan : index % 41 === 0 ? violet : cream;
    const intensity =
      bucket === "faint"
        ? 0.25 + seededUnit(index, 33) * 0.2
        : bucket === "medium"
          ? 0.62
          : bucket === "bright"
            ? 0.82
            : 1;
    colors[bucket][offset] = tint.r * intensity;
    colors[bucket][offset + 1] = tint.g * intensity;
    colors[bucket][offset + 2] = tint.b * intensity;
    positionOffsets[bucket] = offset + 3;
    if (bucket === "diffraction") {
      const span = 0.24;
      spikePositions[spikeOffset++] = x - span;
      spikePositions[spikeOffset++] = y;
      spikePositions[spikeOffset++] = z;
      spikePositions[spikeOffset++] = x + span;
      spikePositions[spikeOffset++] = y;
      spikePositions[spikeOffset++] = z;
      spikePositions[spikeOffset++] = x;
      spikePositions[spikeOffset++] = y - span;
      spikePositions[spikeOffset++] = z;
      spikePositions[spikeOffset++] = x;
      spikePositions[spikeOffset++] = y + span;
      spikePositions[spikeOffset++] = z;
    }
  }
  const group = new Group();
  const pointLayers = ([
    ["faint", 1, 0.72],
    ["medium", 2, 0.78],
    ["bright", 3, 0.88],
    ["diffraction", 3, 0.96],
  ] as const).map(([bucket, size, opacity]) => {
    const geometry = new BufferGeometry();
    geometry.setAttribute(
      "position",
      new Float32BufferAttribute(positions[bucket], 3),
    );
    geometry.setAttribute(
      "color",
      new Float32BufferAttribute(colors[bucket], 3),
    );
    const points = new Points(
      geometry,
      new PointsMaterial({
        size,
        sizeAttenuation: false,
        transparent: true,
        opacity,
        vertexColors: true,
        depthWrite: false,
      }),
    );
    points.visible = false;
    group.add(points);
    return points;
  });
  const spikeGeometry = new BufferGeometry();
  spikeGeometry.setAttribute(
    "position",
    new Float32BufferAttribute(spikePositions, 3),
  );
  const spikes = new LineSegments(
    spikeGeometry,
    new LineBasicMaterial({
      color: UNIVERSE_PALETTE.cabinet.cream,
      transparent: true,
      opacity: 0.68,
      depthWrite: false,
    }),
  );
  spikes.visible = false;
  group.add(spikes);
  return { group, points: pointLayers, spikes };
}

function createTrailGeometry(
  radius: number,
  length: number,
  direction: SceneModel["trails"][number]["direction"],
  maximumWidth: number,
  minimumWidth = 0,
): BufferGeometry {
  const segments = 28;
  const ribbonsPerSegment = 4;
  const valuesPerQuad = 6 * 3;
  const positions = new Float32Array(
    segments * ribbonsPerSegment * valuesPerQuad,
  );
  let positionOffset = 0;
  const sign = direction === "counterclockwise" ? 1 : -1;
  const quad = (
    outer0X: number,
    outer0Y: number,
    outer0Z: number,
    inner0X: number,
    inner0Y: number,
    inner0Z: number,
    outer1X: number,
    outer1Y: number,
    outer1Z: number,
    inner1X: number,
    inner1Y: number,
    inner1Z: number,
  ) => {
    positions[positionOffset++] = outer0X;
    positions[positionOffset++] = outer0Y;
    positions[positionOffset++] = outer0Z;
    positions[positionOffset++] = inner0X;
    positions[positionOffset++] = inner0Y;
    positions[positionOffset++] = inner0Z;
    positions[positionOffset++] = outer1X;
    positions[positionOffset++] = outer1Y;
    positions[positionOffset++] = outer1Z;
    positions[positionOffset++] = inner0X;
    positions[positionOffset++] = inner0Y;
    positions[positionOffset++] = inner0Z;
    positions[positionOffset++] = inner1X;
    positions[positionOffset++] = inner1Y;
    positions[positionOffset++] = inner1Z;
    positions[positionOffset++] = outer1X;
    positions[positionOffset++] = outer1Y;
    positions[positionOffset++] = outer1Z;
  };
  for (let index = 0; index < segments; index += 1) {
    const t0 = index / segments;
    const t1 = (index + 1) / segments;
    const a0 = sign * length * t0;
    const a1 = sign * length * t1;
    // Preserve a visible taper without letting the outer-orbit core collapse
    // below a pixel at the established OVERVIEW camera.
    const widths0 = trailRibbonHalfWidths(
      t0,
      maximumWidth,
      minimumWidth,
    );
    const widths1 = trailRibbonHalfWidths(
      t1,
      maximumWidth,
      minimumWidth,
    );
    const outer0 = widths0.outer;
    const outer1 = widths1.outer;
    const inner0 = widths0.inner;
    const inner1 = widths1.inner;
    const cos0 = Math.cos(a0);
    const sin0 = Math.sin(a0);
    const cos1 = Math.cos(a1);
    const sin1 = Math.sin(a1);
    const radiusOuter0 = radius + outer0;
    const radiusInner0 = radius + inner0;
    const radiusOuter1 = radius + outer1;
    const radiusInner1 = radius + inner1;
    const radiusNegativeOuter0 = radius - outer0;
    const radiusNegativeInner0 = radius - inner0;
    const radiusNegativeOuter1 = radius - outer1;
    const radiusNegativeInner1 = radius - inner1;

    // Pair the orbital-plane ribbon with a vertical ribbon so its core remains
    // measurable where perspective foreshortens the plane. The glow uses
    // minimumWidth to occupy only the annulus outside the opaque core.
    quad(
      cos0 * radiusOuter0,
      0.025,
      sin0 * radiusOuter0,
      cos0 * radiusInner0,
      0.025,
      sin0 * radiusInner0,
      cos1 * radiusOuter1,
      0.025,
      sin1 * radiusOuter1,
      cos1 * radiusInner1,
      0.025,
      sin1 * radiusInner1,
    );
    quad(
      cos0 * radiusNegativeOuter0,
      0.025,
      sin0 * radiusNegativeOuter0,
      cos0 * radiusNegativeInner0,
      0.025,
      sin0 * radiusNegativeInner0,
      cos1 * radiusNegativeOuter1,
      0.025,
      sin1 * radiusNegativeOuter1,
      cos1 * radiusNegativeInner1,
      0.025,
      sin1 * radiusNegativeInner1,
    );
    quad(
      cos0 * radius,
      0.025 + outer0,
      sin0 * radius,
      cos0 * radius,
      0.025 + inner0,
      sin0 * radius,
      cos1 * radius,
      0.025 + outer1,
      sin1 * radius,
      cos1 * radius,
      0.025 + inner1,
      sin1 * radius,
    );
    quad(
      cos0 * radius,
      0.025 - outer0,
      sin0 * radius,
      cos0 * radius,
      0.025 - inner0,
      sin0 * radius,
      cos1 * radius,
      0.025 - outer1,
      sin1 * radius,
      cos1 * radius,
      0.025 - inner1,
      sin1 * radius,
    );
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  return geometry;
}

function createFallbackTexture(): DataTexture {
  const texture = new DataTexture(new Uint8Array([128, 128, 255, 255]), 1, 1);
  texture.needsUpdate = true;
  return texture;
}

export default function OrreryScene({
  holdings,
  beltHoldings,
  selectedTicker,
  hoveredTicker,
  portfolioFocused = false,
  cameraState,
  portfolioHealth,
  driftExcessReturn = null,
  portfolioVolatility = null,
  nextEarningsDays = null,
  tradeComet = null,
  auroraWeeklySeries = [],
  sunTelemetryRef,
  onHover,
  onSelect,
  onSelectPortfolio,
  onSelectBelt,
  onSelectMoon,
  onSelectSatellite,
  onOpenSector,
  onExitOverview,
}: {
  holdings: readonly PublicOrreryHolding[];
  beltHoldings: readonly PublicOrreryHolding[];
  selectedTicker: string | null;
  hoveredTicker: string | null;
  portfolioFocused?: boolean;
  cameraState: OrreryCameraState;
  portfolioHealth: PortfolioHealth;
  driftExcessReturn?: number | null;
  portfolioVolatility?: number | null;
  nextEarningsDays?: number | null;
  tradeComet?: TradeCometInput | null;
  auroraWeeklySeries?: readonly number[];
  sunTelemetryRef?: RefObject<HTMLDivElement | null>;
  onHover: (ticker: string | null) => void;
  onSelect: (ticker: string) => void;
  onSelectPortfolio: () => void;
  onSelectBelt: (ticker?: string) => void;
  onSelectMoon: (ticker: string) => void;
  onSelectSatellite: (id: "DRIFT" | "HAZARD" | "SUPPLY") => void;
  onOpenSector: () => void;
  onExitOverview: () => void;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const selectedTickerRef = useRef(selectedTicker);
  const hoveredTickerRef = useRef(hoveredTicker);
  const cameraStateRef = useRef(cameraState);
  const portfolioFocusedRef = useRef(portfolioFocused);
  const callbacksRef = useRef({
    onHover,
    onSelect,
    onSelectPortfolio,
    onSelectBelt,
    onSelectMoon,
    onSelectSatellite,
    onOpenSector,
    onExitOverview,
  });
  const holdingsRef = useRef(holdings);
  const beltRef = useRef(beltHoldings);
  const healthRef = useRef(portfolioHealth);
  const instrumentRef = useRef({
    driftExcessReturn,
    portfolioVolatility,
    nextEarningsDays,
    tradeComet,
    auroraWeeklySeries,
  });
  const sceneKey = useMemo(
    () =>
      [...holdings, ...beltHoldings]
        .map((holding) =>
          [holding.ticker, holding.weight, holding.weeklyReturn, holding.dayReturn].join(":"),
        )
        .join("|") +
      `|health:${portfolioHealth.h}:${portfolioHealth.sunspotIntensity}` +
      `|trade:${tradeComet?.date ?? "none"}:${tradeComet?.ticker ?? ""}` +
      `|aurora:${auroraWeeklySeries.join(",")}`,
    [
      beltHoldings,
      holdings,
      portfolioHealth.h,
      portfolioHealth.sunspotIntensity,
      tradeComet?.date,
      tradeComet?.ticker,
      auroraWeeklySeries,
    ],
  );

  useEffect(() => {
    selectedTickerRef.current = selectedTicker;
    hoveredTickerRef.current = hoveredTicker;
    cameraStateRef.current = cameraState;
    portfolioFocusedRef.current = portfolioFocused;
    callbacksRef.current = {
      onHover,
      onSelect,
      onSelectPortfolio,
      onSelectBelt,
      onSelectMoon,
      onSelectSatellite,
      onOpenSector,
      onExitOverview,
    };
    healthRef.current = portfolioHealth;
    instrumentRef.current = {
      driftExcessReturn,
      portfolioVolatility,
      nextEarningsDays,
      tradeComet,
      auroraWeeklySeries,
    };
    holdingsRef.current = holdings;
    beltRef.current = beltHoldings;
  }, [
    beltHoldings,
    auroraWeeklySeries,
    cameraState,
    holdings,
    hoveredTicker,
    driftExcessReturn,
    nextEarningsDays,
    onExitOverview,
    onHover,
    onSelect,
    onSelectBelt,
    onSelectMoon,
    onSelectSatellite,
    onOpenSector,
      onSelectPortfolio,
    portfolioVolatility,
    portfolioHealth,
    portfolioFocused,
    selectedTicker,
    tradeComet,
  ]);

  useEffect(() => {
    let initializationCancelled = false;
    let initializedCleanup: (() => void) | null = null;
    // F5 / BLD-04: the retained owner profile attributes the breached task
    // to diffuse scene construction plus GC, not one shader compile. Yield
    // each construction family to its own frame; typed geometry buffers below
    // also avoid the short-lived arrays that fed the measured GC slice.
    const nextConstructionFrame = () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
    const initialize = async () => {
      const mount = mountRef.current;
      if (!mount) return;
      const sceneHoldings = holdingsRef.current;
      const sceneBelt = beltRef.current;
      const instruments = instrumentRef.current;
      const sceneModel = buildOverviewSceneModel({
        holdings: sceneHoldings,
        beltHoldings: sceneBelt,
        healthScalar: healthRef.current.h,
        sunspotIntensity: healthRef.current.sunspotIntensity,
        hoveredTicker: hoveredTickerRef.current,
        portfolioFocused: portfolioFocusedRef.current,
        viewport: {
          width: Math.max(1, mount.clientWidth),
          height: Math.max(1, mount.clientHeight),
        },
        ...instruments,
      });
      mount.dataset.sceneConstructionStage = "model";
      await nextConstructionFrame();

      const scene = new Scene();
      scene.fog = new Fog(UNIVERSE_PALETTE.cabinet.void, 15, 34);

    const outerRadius =
      sceneModel.planets.at(-1)?.orbitRadius ?? ORRERY_SUN_CLEARANCE;
    const overviewCamera = sceneModel.overviewCamera;
    const camera = new PerspectiveCamera(
      overviewCamera.fovDegrees,
      1,
      overviewCamera.near,
      overviewCamera.far,
    );
    const overviewPosition = new Vector3(
      overviewCamera.position.x,
      overviewCamera.position.y,
      overviewCamera.position.z,
    );
    const overviewLookAt = new Vector3(
      overviewCamera.target.x,
      overviewCamera.target.y,
      overviewCamera.target.z,
    );
    camera.position.copy(overviewPosition);
    camera.lookAt(overviewLookAt);
    const cameraTarget = overviewPosition.clone();
    const lookAt = overviewLookAt.clone();
    const lookAtTarget = overviewLookAt.clone();
    let zoomScale = 1;
    let dragTilt = 0;

    const renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(1);
    renderer.setClearColor(UNIVERSE_PALETTE.cabinet.void, 0);
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.style.cssText = "width:100%;height:100%;display:block";
    mount.appendChild(renderer.domElement);
    mount.dataset.sceneConstructionStage = "renderer-gl-context";
    await nextConstructionFrame();

    const labelLayer = document.createElement("div");
    labelLayer.className = styles.sceneLabels;
    labelLayer.setAttribute("aria-hidden", "true");
    mount.appendChild(labelLayer);

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const dockingStorageKey = "orrery-sun-docking-introduced";
    let dockingFlashUntil = 0;
    let dockingHintTimer = 0;
    if (!reducedMotion) {
      try {
        if (
          !window.sessionStorage.getItem(dockingStorageKey) &&
          !window.sessionStorage.getItem(`${dockingStorageKey}:activated`)
        ) {
          dockingHintTimer = window.setTimeout(() => {
            dockingFlashUntil = performance.now() + 1050;
            window.sessionStorage.setItem(dockingStorageKey, "shown");
          }, 20_000);
        }
      } catch {
        // Storage denial suppresses the optional discoverability nudge.
      }
    }
    const rocket = document.createElement("span");
    rocket.className = styles.rocketCursor;
    rocket.setAttribute("aria-hidden", "true");
    const rocketBody = document.createElement("span");
    rocketBody.className = styles.rocketBody;
    const rocketFlame = document.createElement("span");
    rocketFlame.className = styles.rocketFlame;
    const rocketPrism = document.createElement("span");
    rocketPrism.className = styles.rocketPrism;
    for (const color of ["cyan", "violet", "gold"]) {
      const ray = document.createElement("i");
      ray.dataset.prism = color;
      rocketPrism.appendChild(ray);
    }
    rocket.append(rocketBody, rocketFlame, rocketPrism);
    if (!reducedMotion) labelLayer.appendChild(rocket);
    mount.dataset.sceneConstructionStage = "renderer-dom";
    await nextConstructionFrame();

    const starPopulation = createStarPopulation(sceneModel.starPopulation);
    scene.add(starPopulation.group);
    mount.dataset.sceneConstructionStage = "environment-stars";
    await nextConstructionFrame();

    const nebulaGeometry = new RingGeometry(
      outerRadius * 0.25,
      outerRadius * 0.95,
      96,
      1,
      0,
      Math.PI * 0.82,
    );
    nebulaGeometry.rotateX(-Math.PI / 2);
    const nebulaMaterial = new MeshBasicMaterial({
      color: sceneModel.nebula.color,
      transparent: true,
      opacity: sceneModel.nebula.alpha,
      blending: AdditiveBlending,
      depthWrite: false,
      fog: false,
      side: 2,
    });
    const nebula = new Mesh(nebulaGeometry, nebulaMaterial);
    nebula.position.set(-outerRadius * 0.25, -1.7, -outerRadius * 0.45);
    nebula.visible = false;
    scene.add(nebula);
    const auroraBytes = new Uint8Array(
      sceneModel.aurora.colorSamples.flatMap((hex) => {
        const color = new Color(hex);
        return [
          Math.round(color.r * 255),
          Math.round(color.g * 255),
          Math.round(color.b * 255),
          255,
        ];
      }),
    );
    const auroraTexture = new DataTexture(
      auroraBytes,
      sceneModel.aurora.colorSamples.length,
      1,
    );
    auroraTexture.colorSpace = SRGBColorSpace;
    auroraTexture.needsUpdate = true;
    const auroraGeometry = new PlaneGeometry(
      outerRadius * sceneModel.aurora.chord.widthInOuterRadii,
      outerRadius * sceneModel.aurora.chord.heightInOuterRadii,
    );
    const auroraMaterial = new MeshBasicMaterial({
      map: auroraTexture,
      transparent: true,
      opacity: sceneModel.aurora.opacity,
      blending: AdditiveBlending,
      depthWrite: false,
      fog: false,
      side: 2,
    });
    const aurora = new Mesh(auroraGeometry, auroraMaterial);
    aurora.position.set(
      0,
      outerRadius * sceneModel.aurora.chord.yInOuterRadii,
      outerRadius * sceneModel.aurora.chord.zInOuterRadii,
    );
    aurora.rotation.z = -0.12;
    aurora.visible = false;
    scene.add(aurora);
    mount.dataset.auroraClearanceSunRadii = String(
      sceneModel.aurora.chord.screenClearanceSunRadii,
    );
    mount.dataset.auroraAlpha = String(sceneModel.aurora.opacity);
    mount.dataset.sceneConstructionStage = "environment-aurora";
    await nextConstructionFrame();

    const wispGeometry = new SphereGeometry(0.18, 12, 8);
    const wispMaterial = new MeshBasicMaterial({
      color: sceneModel.weatherWisps.color,
      transparent: true,
      opacity: sceneModel.weatherWisps.alpha,
      blending: AdditiveBlending,
      depthWrite: false,
      fog: false,
      side: 2,
    });
    const weatherWisps = new Group();
    for (const pole of [-1, 1]) {
      const wisp = new Mesh(wispGeometry, wispMaterial);
      wisp.position.y = pole * sceneModel.sun.radius * 1.18;
      weatherWisps.add(wisp);
    }
    weatherWisps.visible = false;
    scene.add(weatherWisps);
    mount.dataset.weatherWispSign = sceneModel.weatherWisps.sign;
    mount.dataset.weatherWispAlpha = String(sceneModel.weatherWisps.alpha);
    mount.dataset.sceneConstructionStage = "environment";
    await nextConstructionFrame();

    const planetGeometry = new SphereGeometry(1, 32, 24);
    const sunGeometry = new SphereGeometry(sceneModel.sun.radius, 48, 32);
    const fallbackTexture = createFallbackTexture();

    const sunMaterial = new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uHealth: { value: healthRef.current.h },
        uSunspots: { value: healthRef.current.sunspotIntensity },
      },
      vertexShader: SUN_VERTEX_SHADER,
      fragmentShader: SUN_FRAGMENT_SHADER,
    });
    const sun = new Mesh(sunGeometry, sunMaterial);
    sun.visible = false;
    sun.userData.orreryTarget = "portfolio";
    scene.add(sun);

    const glowMaterialInner = new MeshBasicMaterial({
      color: "#ffb347",
      transparent: true,
      opacity: 0.12,
      blending: AdditiveBlending,
      depthWrite: false,
      fog: false,
      side: 2,
    });
    const glowMaterialOuter = glowMaterialInner.clone();
    const glowInner = new Mesh(sunGeometry, glowMaterialInner);
    const glowOuter = new Mesh(sunGeometry, glowMaterialOuter);
    glowInner.visible = false;
    glowOuter.visible = false;
    glowInner.userData.orreryTarget = "portfolio-glow";
    glowOuter.userData.orreryTarget = "portfolio-glow";
    scene.add(glowInner, glowOuter);

    const dockingRingMaterial = new MeshBasicMaterial({
      color: "#ffe4ad",
      transparent: true,
      opacity: 0.78,
      blending: AdditiveBlending,
      depthWrite: false,
      fog: false,
      side: 2,
    });
    const dockingRing = new Group();
    for (let index = 0; index < 18; index += 1) {
      const dash = new Mesh(
        new RingGeometry(
          sceneModel.sun.radius * 1.72,
          sceneModel.sun.radius * 1.77,
          10,
          1,
          index * (Math.PI / 9),
          Math.PI / 18,
        ),
        dockingRingMaterial,
      );
      dockingRing.add(dash);
    }
    dockingRing.visible = false;
    scene.add(dockingRing);

    // FB-02 (§13), move 5: one faint ecliptic graticule -- a great-circle
    // ring with sparse tick marks in the orbital plane. Ambient tier,
    // decorative, encodes nothing.
    const graticuleMaterial = new MeshBasicMaterial({
      color: UNIVERSE_PALETTE.cabinet.ringSlate,
      transparent: true,
      opacity: 0.1,
      depthWrite: false,
      fog: false,
      side: 2,
    });
    const graticule = new Group();
    const graticuleRingGeometry = new RingGeometry(
      outerRadius * 1.62,
      outerRadius * 1.63,
      128,
    );
    graticuleRingGeometry.rotateX(-Math.PI / 2);
    graticule.add(new Mesh(graticuleRingGeometry, graticuleMaterial));
    const GRATICULE_TICK_COUNT = 12;
    const graticuleTickGeometries: RingGeometry[] = [];
    for (let index = 0; index < GRATICULE_TICK_COUNT; index += 1) {
      const tickGeometry = new RingGeometry(
        outerRadius * 1.6,
        outerRadius * 1.66,
        4,
        1,
        index * ((Math.PI * 2) / GRATICULE_TICK_COUNT),
        0.03,
      );
      tickGeometry.rotateX(-Math.PI / 2);
      graticuleTickGeometries.push(tickGeometry);
      graticule.add(new Mesh(tickGeometry, graticuleMaterial));
    }
    scene.add(graticule);
    mount.dataset.sceneConstructionStage = "sun";
    await nextConstructionFrame();

    const orbitGeometries: RingGeometry[] = [];
    const orbitMaterials: ShaderMaterial[] = [];
    const trailGeometries: BufferGeometry[] = [];
    const trailMaterials: MeshBasicMaterial[] = [];
    const loadedTextures: Texture[] = [];

    let launchRocket = (ticker: string) => {
      callbacksRef.current.onSelect(ticker);
    };
    const planetRuntimes: PlanetRuntime[] = [];
    for (const [index, holding] of sceneHoldings.entries()) {
      const descriptor = sceneModel.planets[index];
      const ringDescriptor = sceneModel.rings[index];
      const trailDescriptor = sceneModel.trails[index];
      const labelDescriptor = sceneModel.labels.find(
        ({ ticker }) => ticker === holding.ticker,
      )!;
      const orbitRadius = descriptor.orbitRadius;
      const initialAngle = descriptor.initialAngle;
      const plane = new Group();
      // F10 (VIS-16): the ring's 3D band was a FIXED half-width (0.012)
      // regardless of orbitRadius. ringDescriptor.widthPx (the intended
      // on-screen width) was computed but never consumed -- under this
      // perspective camera, a fixed 3D width projects to fewer and fewer
      // screen pixels as orbitRadius (and so distance from camera) grows,
      // to the point of sub-pixel/anti-aliased dropout for the outer rings
      // regardless of alpha (confirmed: the outermost ring stayed
      // undetectable above background even forced to full opacity, while
      // width alone explained it -- a near-invisible full circle, not a
      // hemisphere). The camera is oblique (elevated, forward-offset), so
      // distance from camera varies noticeably around a single ring -- the
      // far side (exactly where VIS-16 grades) is meaningfully farther than
      // the near side for the outer rings, so a single near-side sample
      // under-widens the far side. Solve the 3D half-width against the
      // FARTHEST point sampled around the ring, so every point (worst case
      // included) renders at least ringDescriptor.widthPx screen pixels,
      // same pinhole relationship the rest of this file already uses for
      // planet/label projection.
      const ringSamplePoint = new Vector3();
      let ringMaxDistanceFromCamera = 0;
      for (let sampleIndex = 0; sampleIndex < 32; sampleIndex += 1) {
        const sampleAngle = (sampleIndex / 32) * Math.PI * 2;
        ringSamplePoint.set(
          Math.cos(sampleAngle) * orbitRadius,
          0,
          Math.sin(sampleAngle) * orbitRadius,
        );
        ringMaxDistanceFromCamera = Math.max(
          ringMaxDistanceFromCamera,
          camera.position.distanceTo(ringSamplePoint),
        );
      }
      const ringVerticalFovRadians = (camera.fov * Math.PI) / 180;
      const ringWorldUnitsPerPixel =
        (2 * ringMaxDistanceFromCamera * Math.tan(ringVerticalFovRadians / 2)) /
        sceneModel.viewport.height;
      const ringHalfWidth3D = Math.max(
        0.012,
        (ringDescriptor.widthPx / 2) * ringWorldUnitsPerPixel,
      );
      const pathGeometry = new RingGeometry(orbitRadius - ringHalfWidth3D, orbitRadius + ringHalfWidth3D, 160);
      pathGeometry.rotateX(-Math.PI / 2);
      const pathPositions = pathGeometry.getAttribute("position");
      const pathAlphas = new Float32Array(pathPositions.count);
      for (
        let positionIndex = 0;
        positionIndex < pathPositions.count;
        positionIndex += 1
      ) {
        const x = pathPositions.getX(positionIndex);
        const z = pathPositions.getZ(positionIndex);
        pathAlphas[positionIndex] = ringVertexAlpha(Math.atan2(z, x));
      }
      pathGeometry.setAttribute(
        "aAlpha",
        new Float32BufferAttribute(pathAlphas, 1),
      );
      orbitGeometries.push(pathGeometry);
      const path = new Mesh(
        pathGeometry,
        new ShaderMaterial({
          uniforms: {
            uColor: { value: new Color(ringDescriptor.color) },
            uOpacity: { value: ringDescriptor.opacity },
          },
          vertexShader: RING_VERTEX_SHADER,
          fragmentShader: RING_FRAGMENT_SHADER,
          transparent: true,
          depthWrite: false,
          side: 2,
        }),
      );
      path.rotation.y = initialAngle;
      orbitMaterials.push(path.material);
      plane.add(path);

      const orbit = new Group();
      orbit.rotation.y = initialAngle;
      const trailMeshes = trailDescriptor.passes.map((pass) => {
        const isGlow = pass.id === "glow";
        const geometry = createTrailGeometry(
          orbitRadius,
          trailDescriptor.arcRadians,
          trailDescriptor.direction,
          isGlow ? 0.25 : 0.15,
          isGlow ? 0.15 : 0,
        );
        trailGeometries.push(geometry);
        const material = new MeshBasicMaterial({
          color: trailDescriptor.color,
          transparent: pass.additive,
          opacity: pass.opacity,
          fog: trailDescriptor.fog,
          blending: pass.additive ? AdditiveBlending : NormalBlending,
          depthWrite: false,
          side: 2,
        });
        trailMaterials.push(material);
        const mesh = new Mesh(geometry, material);
        mesh.visible = false;
        orbit.add(mesh);
        return mesh;
      });
      const headGeometry = createTrailGeometry(
        orbitRadius,
        trailDescriptor.arcRadians * trailDescriptor.head.fraction,
        trailDescriptor.direction,
        0.065,
      );
      trailGeometries.push(headGeometry);
      const headMaterial = new MeshBasicMaterial({
        color: trailDescriptor.head.color,
        transparent: true,
        opacity: trailDescriptor.head.opacity,
        fog: trailDescriptor.fog,
        blending: AdditiveBlending,
        depthWrite: false,
        side: 2,
      });
      trailMaterials.push(headMaterial);
      const headMesh = new Mesh(headGeometry, headMaterial);
      headMesh.visible = false;
      orbit.add(headMesh);
      trailMeshes.push(headMesh);
      const brandColor = new Color(descriptor.brandHex);
      const material = new ShaderMaterial({
        uniforms: {
          uBase: { value: brandColor.clone().multiplyScalar(0.34) },
          uAccent: { value: brandColor },
          uSeed: { value: tickerSeed(holding.ticker) % 97 },
          uActive: { value: 0 },
          uDim: { value: 1 },
          uHasTextures: { value: 0 },
          uExposure: { value: descriptor.renderExposure },
          uBaseMap: { value: fallbackTexture },
          uEmissiveMap: { value: fallbackTexture },
          uNormalMap: { value: fallbackTexture },
        },
        vertexShader: PLANET_VERTEX_SHADER,
        fragmentShader: PLANET_FRAGMENT_SHADER,
      });
      const planet = new Mesh(planetGeometry, material);
      planet.visible = false;
      planet.position.set(orbitRadius, 0, 0);
      planet.rotation.y = brandEntryPhase(holding.ticker);
      planet.scale.setScalar(descriptor.radius);
      planet.userData.orreryTarget = holding.ticker;
      orbit.add(planet);
      plane.add(orbit);
      scene.add(plane);

      const label = document.createElement("button");
      label.type = "button";
      label.tabIndex = -1;
      label.className = styles.sceneLabel;
      label.textContent = holding.ticker;
      label.dataset.sceneTicker = holding.ticker;
      label.dataset.dailyReturn =
        holding.dayReturn === null ? "null" : String(holding.dayReturn);
      label.dataset.trailColor = trailDescriptor.color;
      label.style.setProperty(
        "--planet-label-color",
        labelDescriptor.color,
      );
      label.addEventListener("click", () => launchRocket(holding.ticker));
      labelLayer.appendChild(label);
      planetRuntimes.push({
        holding,
        orbit,
        mesh: planet,
        path,
        trailMeshes,
        label,
        descriptor,
        labelDescriptor,
        trailDescriptor,
        initialAngle,
        direction: descriptor.direction,
        angularSpeed: descriptor.angularSpeed,
        spinRadiansPerSecond: descriptor.spinRadiansPerSecond,
      });
      if ((index + 1) % 2 === 0 && index + 1 < sceneHoldings.length) {
        mount.dataset.sceneConstructionStage = `planets-${index + 1}`;
        await nextConstructionFrame();
      }
    }
    mount.dataset.sceneConstructionStage = "planets-complete";
    await nextConstructionFrame();

    const moonGeometry = new IcosahedronGeometry(1, 2);
    const moonMaterial = new MeshBasicMaterial({
      color: "#b9aa8c",
      fog: false,
      side: 2,
    });
    const moonRuntimes = sceneModel.moons.flatMap((moon) => {
      const planet = planetRuntimes.find(
        ({ holding }) => holding.ticker === moon.ticker,
      );
      if (!planet) return [];
      const group = new Group();
      group.visible = false;
      group.position.copy(planet.mesh.position);
      const mesh = new Mesh(moonGeometry, moonMaterial);
      mesh.scale.setScalar(moon.radius);
      mesh.position.x = planet.descriptor.radius * 1.7 + moon.radius;
      mesh.userData.orreryTarget = `moon:${moon.ticker}`;
      group.add(mesh);
      let earningsRing: Mesh<RingGeometry, MeshBasicMaterial> | null = null;
      if (moon.ringVisible) {
        earningsRing = new Mesh(
          new RingGeometry(moon.radius * 1.45, moon.radius * 1.72, 28),
          new MeshBasicMaterial({
            color: "#ffe3a2",
            transparent: true,
            opacity: 0.85,
            blending: AdditiveBlending,
            fog: false,
            side: 2,
          }),
        );
        earningsRing.position.copy(mesh.position);
        earningsRing.rotation.x = -Math.PI / 2;
        group.add(earningsRing);
      }
      planet.orbit.add(group);
      return [{ descriptor: moon, group, mesh, earningsRing }];
    });
    mount.dataset.sceneConstructionStage = "secondary-moons";
    await nextConstructionFrame();

    const satelliteGeometry = new IcosahedronGeometry(0.16, 0);
    const satelliteMaterial = new MeshBasicMaterial({
      color: "#e9c780",
      fog: false,
      side: 2,
    });
    const satelliteLightMaterial = new MeshBasicMaterial({
      color: "#fff4cb",
      transparent: true,
      opacity: 1,
      fog: false,
      side: 2,
    });
    const satelliteRuntimes = sceneModel.satellites.map((satellite) => {
      const group = new Group();
      group.visible = false;
      group.rotation.y = satellite.phase;
      const craft = new Mesh(satelliteGeometry, satelliteMaterial);
      craft.position.x = satellite.orbitRadius;
      craft.scale.set(1.5, 0.55, 0.8);
      craft.userData.orreryTarget = `satellite:${satellite.id}`;
      const light = new Mesh(
        new IcosahedronGeometry(0.045, 1),
        satelliteLightMaterial,
      );
      light.position.set(satellite.orbitRadius, 0.13, 0);
      group.add(craft, light);
      scene.add(group);
      return { descriptor: satellite, group, craft, light };
    });
    mount.dataset.sceneConstructionStage = "secondary-satellites";
    await nextConstructionFrame();

    const beltRadius = sceneModel.belt.radius;
    const beltGroup = new Group();
    beltGroup.visible = false;
    const rockGeometry = new IcosahedronGeometry(1, 1);
    const rockMaterial = new MeshBasicMaterial({
      color: "#b38a57",
      fog: false,
      side: 2,
    });
    const beltRocks: Mesh[] = [];
    const beltLabels: HTMLButtonElement[] = [];
    sceneBelt.forEach((holding, index) => {
      const body = sceneModel.belt.bodies[index];
      const angle = (index / Math.max(1, sceneBelt.length)) * Math.PI * 2 + index * 0.23;
      const rock = new Mesh(rockGeometry, rockMaterial);
      rock.position.set(Math.cos(angle) * beltRadius, 0, Math.sin(angle) * beltRadius);
      rock.scale.set(
        body.visualRadius * (0.92 + seededUnit(index, 7) * 0.24),
        body.visualRadius * 0.72,
        body.visualRadius * 0.82,
      );
      rock.userData.orreryTarget = `belt:${holding.ticker}`;
      beltGroup.add(rock);
      beltRocks.push(rock);
      const label = document.createElement("button");
      label.type = "button";
      label.tabIndex = -1;
      label.className = `${styles.sceneLabel} ${styles.beltLabel}`;
      label.textContent = holding.ticker;
      label.dataset.beltTicker = holding.ticker;
      label.addEventListener("click", () =>
        callbacksRef.current.onSelectBelt(holding.ticker)
      );
      labelLayer.appendChild(label);
      beltLabels.push(label);
    });
    scene.add(beltGroup);
    mount.dataset.sceneConstructionStage = "secondary-belt";
    await nextConstructionFrame();

    const cometGroup = new Group();
    cometGroup.visible = false;
    const cometHeadGeometry = sceneModel.comet
      ? new IcosahedronGeometry(0.13, 1)
      : null;
    const cometTailGeometry = sceneModel.comet
      ? new BufferGeometry()
      : null;
    const cometMaterial = sceneModel.comet
      ? new MeshBasicMaterial({
          color: sceneModel.comet.color,
          transparent: true,
          opacity: 0.92,
          blending: AdditiveBlending,
          depthWrite: false,
          fog: false,
          side: 2,
        })
      : null;
    if (cometHeadGeometry && cometTailGeometry && cometMaterial) {
      const head = new Mesh(cometHeadGeometry, cometMaterial);
      cometTailGeometry.setAttribute(
        "position",
        new Float32BufferAttribute(
          [0, 0, 0, -2.8, 0.13, 0, -2.8, -0.13, 0],
          3,
        ),
      );
      cometGroup.add(head, new Mesh(cometTailGeometry, cometMaterial));
      cometGroup.position.set(-outerRadius * 1.2, 2.4, -outerRadius * 0.34);
      scene.add(cometGroup);
    }
    mount.dataset.sceneConstructionStage = "secondary-objects";
    await nextConstructionFrame();

    let textureCancelled = false;
    const textureWorker = new Worker(
      new URL("./planet-texture.worker.ts", import.meta.url),
      { type: "module" },
    );
    let textureRequestId = 0;
    const textureRequests = new Map<
      number,
      {
        resolve: (texture: DataTexture) => void;
        reject: (error: Error) => void;
        kind: "base" | "emissive" | "normal";
      }
    >();
    textureWorker.addEventListener(
      "message",
      (
        event: MessageEvent<
          | {
              id: number;
              data: ArrayBuffer;
              width: number;
              height: number;
              channels: 1 | 2 | 4;
            }
          | { id: number; error: string }
        >,
      ) => {
        const request = textureRequests.get(event.data.id);
        if (!request) return;
        textureRequests.delete(event.data.id);
        if ("error" in event.data) {
          request.reject(new Error(event.data.error));
          return;
        }
        const format =
          event.data.channels === 4
            ? undefined
            : event.data.channels === 2
              ? RGFormat
              : RedFormat;
        const texture = new DataTexture(
          new Uint8Array(event.data.data),
          event.data.width,
          event.data.height,
          format,
          UnsignedByteType,
        );
        texture.colorSpace =
          request.kind === "base" ? SRGBColorSpace : NoColorSpace;
        texture.needsUpdate = true;
        request.resolve(texture);
      },
    );
    textureWorker.addEventListener("error", () => {
      for (const request of textureRequests.values()) {
        request.reject(new Error("Texture worker failed"));
      }
      textureRequests.clear();
    });
    const loadTexture = (
      url: string,
      kind: "base" | "emissive" | "normal",
    ) =>
      new Promise<DataTexture>((resolve, reject) => {
        if (textureCancelled) {
          reject(new Error("Texture decode cancelled"));
          return;
        }
        const id = ++textureRequestId;
        textureRequests.set(id, { resolve, reject, kind });
        textureWorker.postMessage({ id, url });
      });
    const nextTextureFrame = () =>
      new Promise<void>((resolve) => {
        textureFrame = requestAnimationFrame(() => resolve());
      });
    const loadTextures = async () => {
      await nextTextureFrame();
      await nextTextureFrame();
      // FB-02 (§13), move 3: the nebula's flat RingGeometry colour is
      // replaced by one offline-generated filament texture
      // (scripts/generate-nebula-texture.mjs). The texture ships as a flat
      // white RGB with a filament-density alpha channel, so the existing
      // gold/ember material.color tint (nebulaForHealth) still carries the
      // same sign->hue encoding -- only the flat fill becomes textured.
      try {
        const filament = await loadTexture(
          "/textures/nebula/filament.ktx2",
          "base",
        );
        if (!textureCancelled) {
          filament.colorSpace = SRGBColorSpace;
          loadedTextures.push(filament);
          nebulaMaterial.map = filament;
          nebulaMaterial.needsUpdate = true;
        } else {
          filament.dispose();
        }
      } catch {
        // Falls back to the flat colour fill if the texture fails to load.
      }
      for (const planet of planetRuntimes) {
        const ticker = planet.holding.ticker.toLowerCase();
        const uniforms = planet.mesh.material.uniforms;
        try {
          const [base, emissive, normal] = await Promise.all([
            loadTexture(`/textures/planets/${ticker}-base.ktx2`, "base"),
            loadTexture(
              `/textures/planets/${ticker}-emissive.ktx2`,
              "emissive",
            ),
            loadTexture(`/textures/planets/${ticker}-normal.ktx2`, "normal"),
          ]);
          if (textureCancelled) {
            base.dispose();
            emissive.dispose();
            normal.dispose();
            return;
          }
          base.colorSpace = SRGBColorSpace;
          loadedTextures.push(base, emissive, normal);

          // Binding all three decoded maps together made the following render
          // upload a full planet texture batch in one >50 ms main-thread task.
          // Give each map its own frame so uploads remain incremental.
          uniforms.uBaseMap.value = base;
          await nextTextureFrame();
          if (textureCancelled) return;
          uniforms.uEmissiveMap.value = emissive;
          await nextTextureFrame();
          if (textureCancelled) return;
          uniforms.uNormalMap.value = normal;
          await nextTextureFrame();
          if (textureCancelled) return;
          uniforms.uHasTextures.value = 1;
        } catch {
          // Unknown/new top-eight tickers keep deterministic shader art.
        }
        if (textureCancelled) return;
        await nextTextureFrame();
      }
    };
    let textureFrame = 0;
    mount.dataset.sceneConstructionStage = "texture-worker";
    await nextConstructionFrame();

    const raycaster = new Raycaster();
    const pointer = new Vector2(2, 2);
    const worldPosition = new Vector3();
    const projected = new Vector3();
    const labelPosition = new Vector3();
    const trailSamplePosition = new Vector3();
    const ringFarSidePosition = new Vector3();
    const outwardVector = new Vector3();
    const tangentVector = new Vector3();
    const pickTargets: Mesh[] = [
      sun,
      glowInner,
      glowOuter,
      ...planetRuntimes.map(({ mesh }) => mesh),
      ...moonRuntimes.map(({ mesh }) => mesh),
      ...satelliteRuntimes.map(({ craft }) => craft),
      ...beltRocks,
    ];
    let localHovered: string | null = null;
    let localTarget: string | undefined;
    let pointerX = 0;
    let pointerY = 0;
    let pointerClientX = -1000;
    let pointerClientY = -1000;
    let dragging = false;
    let dragStartX = 0;
    let dragStartTilt = 0;
    let rocketFlight: RocketFlight | null = null;
    const cometStartedAt = performance.now();

    /* FB-06, fourth request — the flight model (round 6 §3, mock-tuned by
     * the owner). The rocket is a vehicle chasing the pointer through a
     * critically damped spring: it trails at speed (lag = v/20), banks into
     * turns, docks within ~145ms of a stop, and HOLDS its last heading at
     * rest — it never re-parks between strokes (owner decision against the
     * round-6 mock). Hit-testing stays on the true pointer below, so
     * precision never depends on the costume. Critical damping (c = 2√k)
     * makes overshoot impossible by construction. */
    const ROCKET_STIFFNESS = 1600; // s^-2
    const ROCKET_DAMPING = 2 * Math.sqrt(ROCKET_STIFFNESS); // critical, 80 s^-1
    const ROCKET_AFTERBURNER = 3200; // click-to-fly stiffness
    const ROCKET_HEADING_TAU = 0.08; // s
    const ROCKET_BANK_GAIN = 0.12; // s
    const ROCKET_BANK_CLAMP = (28 * Math.PI) / 180;
    const ROCKET_PARK_RADIANS = (-35 * Math.PI) / 180; // pre-flight attitude only
    const ROCKET_ARRIVE_PX = 12;
    const ROCKET_FLIGHT_GUARANTEE_MS = 1400; // navigation never hangs on physics
    let shipX = 0;
    let shipY = 0;
    let shipVx = 0;
    let shipVy = 0;
    let shipHeading = ROCKET_PARK_RADIANS;
    let shipPlaced = false;

    launchRocket = (ticker: string) => {
      if (reducedMotion) {
        callbacksRef.current.onSelect(ticker);
        return;
      }
      rocketFlight = {
        ticker,
        startedAt: performance.now(),
        startX: shipX,
        startY: shipY,
      };
      rocket.dataset.flying = "true";
      rocket.dataset.visible = "true";
    };

    const readPointer = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      pointerX = pointer.x;
      pointerY = pointer.y;
      pointerClientX = event.clientX - rect.left;
      pointerClientY = event.clientY - rect.top;
      if (!shipPlaced) {
        // First contact: the ship materialises at the helm, parked.
        shipX = pointerClientX;
        shipY = pointerClientY;
        shipPlaced = true;
      }
      if (!rocketFlight && !reducedMotion) {
        rocket.dataset.visible = "true";
      }
    };
    const magneticTarget = () => {
      const rect = renderer.domElement.getBoundingClientRect();
      let nearest: { ticker: string; distance: number } | null = null;
      for (const planet of planetRuntimes) {
        planet.mesh.getWorldPosition(projected);
        projected.project(camera);
        const x = (projected.x * 0.5 + 0.5) * rect.width;
        const y = (-projected.y * 0.5 + 0.5) * rect.height;
        const distance = Math.hypot(pointerClientX - x, pointerClientY - y);
        if (distance <= 64 && (!nearest || distance < nearest.distance)) {
          nearest = { ticker: planet.holding.ticker, distance };
        }
      }
      if (nearest) return nearest.ticker;
      for (const rock of beltRocks) {
        rock.getWorldPosition(projected);
        projected.project(camera);
        const x = (projected.x * 0.5 + 0.5) * rect.width;
        const y = (-projected.y * 0.5 + 0.5) * rect.height;
        if (Math.hypot(pointerClientX - x, pointerClientY - y) <= 32) {
          return rock.userData.orreryTarget as string;
        }
      }
      return undefined;
    };
    const pick = () => {
      raycaster.setFromCamera(pointer, camera);
      const directHits = raycaster
        .intersectObjects(pickTargets, false)
        .map(({ object }) => object.userData.orreryTarget)
        .filter((target): target is string => typeof target === "string");
      const target = resolveOrreryRaycastTarget(directHits, magneticTarget());
      localTarget = target;
      mount.dataset.orreryTarget = target ?? "";
      const ticker =
        target?.startsWith("moon:")
          ? target.slice(5)
          : target &&
              !target.startsWith("satellite:") &&
              !target.startsWith("belt:") &&
              target !== "portfolio" &&
              target !== "belt"
            ? target
            : null;
      if (ticker !== localHovered) {
        localHovered = ticker;
        callbacksRef.current.onHover(ticker);
      }
      if (!reducedMotion) {
        rocket.dataset.targeted = target ? "true" : "false";
      }
      renderer.domElement.style.cursor = reducedMotion
        ? target
          ? "pointer"
          : dragging
            ? "grabbing"
            : "grab"
        : "none";
      return target;
    };
    const onPointerMove = (event: PointerEvent) => {
      readPointer(event);
      if (dragging) {
        dragTilt = Math.max(-10, Math.min(10, dragStartTilt + (event.clientX - dragStartX) * 0.08));
      }
      pick();
    };
    const onPointerDown = (event: PointerEvent) => {
      dragging = true;
      dragStartX = event.clientX;
      dragStartTilt = dragTilt;
      renderer.domElement.setPointerCapture(event.pointerId);
    };
    const onPointerUp = (event: PointerEvent) => {
      dragging = false;
      renderer.domElement.releasePointerCapture(event.pointerId);
    };
    const onPointerLeave = () => {
      pointer.set(2, 2);
      localTarget = undefined;
      localHovered = null;
      callbacksRef.current.onHover(null);
      if (!rocketFlight) rocket.dataset.visible = "false";
    };
    const onClick = (event: MouseEvent) => {
      readPointer(event as PointerEvent);
      const target = pick();
      if (target === "portfolio") {
        try {
          window.clearTimeout(dockingHintTimer);
          window.sessionStorage.setItem(
            `${dockingStorageKey}:activated`,
            "true",
          );
        } catch {
          // Storage denial never blocks docking.
        }
        callbacksRef.current.onSelectPortfolio();
      }
      else if (target === "belt") callbacksRef.current.onSelectBelt();
      else if (target?.startsWith("belt:")) {
        callbacksRef.current.onSelectBelt(target.slice(5));
      }
      else if (target?.startsWith("moon:")) {
        callbacksRef.current.onSelectMoon(target.slice(5));
      }
      else if (target?.startsWith("satellite:")) {
        callbacksRef.current.onSelectSatellite(
          target.slice(10) as "DRIFT" | "HAZARD" | "SUPPLY",
        );
      }
      else if (target) launchRocket(target);
      else if (cameraStateRef.current !== "overview") {
        callbacksRef.current.onExitOverview();
      }
    };
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const requested = zoomScale + Math.sign(event.deltaY) * 0.035;
      const bounded = Math.max(0.88, Math.min(1.18, requested));
      zoomScale += (bounded - zoomScale) * 0.72;
      if (Math.abs(zoomScale - bounded) < 0.001) zoomScale = bounded;
    };
    const onDoubleClick = () => callbacksRef.current.onExitOverview();
    renderer.domElement.addEventListener("pointermove", onPointerMove, { passive: true });
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointerleave", onPointerLeave);
    renderer.domElement.addEventListener("click", onClick);
    renderer.domElement.addEventListener("dblclick", onDoubleClick);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: false });

    const resize = () => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);

    type ShaderWarmupJob = {
      label: string;
      object: Object3D;
      reveal: () => void;
    };
    const warmedObjects = new WeakSet<Object3D>();
    let dockingProgramReady = false;
    const shaderWarmupJobs: ShaderWarmupJob[] = [];
    const enqueueReveal = (
      label: string,
      object: Object3D,
      reveal = () => {
        object.visible = true;
      },
    ) => {
      shaderWarmupJobs.push({ label, object, reveal });
    };

    starPopulation.points.forEach((points, index) => {
      enqueueReveal(`stars-${index + 1}`, points);
    });
    enqueueReveal("star-spikes", starPopulation.spikes);
    enqueueReveal("sun", sun);
    planetRuntimes.forEach(({ mesh }, index) => {
      enqueueReveal(`planet-${index + 1}`, mesh);
    });
    planetRuntimes.forEach(({ path }, index) => {
      enqueueReveal(`ring-${index + 1}`, path, () => {
        warmedObjects.add(path);
      });
    });
    planetRuntimes.forEach(({ trailMeshes }, planetIndex) => {
      trailMeshes.forEach((mesh, passIndex) => {
        enqueueReveal(
          `trail-${planetIndex + 1}-${passIndex + 1}`,
          mesh,
        );
      });
    });
    enqueueReveal("nebula", nebula);
    enqueueReveal("aurora", aurora);
    enqueueReveal("weather-wisps", weatherWisps);
    enqueueReveal("sun-glow-inner", glowInner);
    enqueueReveal("sun-glow-outer", glowOuter);
    enqueueReveal("docking-ring", dockingRing, () => {
      dockingProgramReady = true;
    });
    moonRuntimes.forEach(({ group }, index) => {
      enqueueReveal(`moon-${index + 1}`, group);
    });
    if (satelliteRuntimes[0]) {
      enqueueReveal("satellites", satelliteRuntimes[0].group, () => {
        satelliteRuntimes.forEach(({ group }) => {
          group.visible = true;
        });
      });
    }
    if (beltRocks.length) enqueueReveal("belt", beltGroup);
    if (cometGroup.children.length) {
      enqueueReveal("comet", cometGroup, () => {
        cometGroup.visible = Boolean(sceneModel.comet);
      });
    }

    mount.dataset.shaderWarmupComplete = "false";
    mount.dataset.shaderWarmupTotal = String(shaderWarmupJobs.length);
    let shaderWarmupIndex = 0;
    let shaderWarmupRunning = false;
    let textureLoadStarted = false;
    const completeShaderWarmupJob = (job: ShaderWarmupJob) => {
      if (textureCancelled) return;
      job.reveal();
      shaderWarmupRunning = false;
      mount.dataset.shaderWarmupCurrent = String(shaderWarmupIndex);
      if (shaderWarmupIndex < shaderWarmupJobs.length) return;
      mount.dataset.shaderWarmupComplete = "true";
      if (!textureLoadStarted) {
        textureLoadStarted = true;
        void loadTextures();
      }
    };
    const advanceShaderWarmup = () => {
      if (
        shaderWarmupRunning ||
        shaderWarmupIndex >= shaderWarmupJobs.length
      ) {
        return;
      }
      const job = shaderWarmupJobs[shaderWarmupIndex];
      shaderWarmupIndex += 1;
      shaderWarmupRunning = true;
      mount.dataset.shaderWarmupLabel = job.label;
      try {
        void renderer
          .compileAsync(job.object, camera, scene)
          .then(() => completeShaderWarmupJob(job))
          .catch(() => completeShaderWarmupJob(job));
      } catch {
        completeShaderWarmupJob(job);
      }
    };

    let previousTime = performance.now();
    let animationFrame = 0;
    let brandEntryTicker: string | null = null;
    const render = (now: number) => {
      const delta = Math.min(0.05, (now - previousTime) / 1000);
      const time = now / 1000;
      previousTime = now;
      const selected = selectedTickerRef.current;
      const hovered = hoveredTickerRef.current;
      const state = cameraStateRef.current;
      const labelRect = renderer.domElement.getBoundingClientRect();
      const labelCandidates: SceneModel["labels"] = [];

      for (const planet of planetRuntimes) {
        const targeted =
          planet.holding.ticker === selected || planet.holding.ticker === hovered;
        if (planet.direction !== "neutral") {
          planet.orbit.rotation.y +=
            (planet.direction === "clockwise" ? -1 : 1) *
            planet.angularSpeed *
            delta;
        }
        const progradeSign = planet.direction === "clockwise" ? -1 : 1;
        const evidenceRotationDegrees = Number(
          mount.dataset.evidenceRotationDegrees,
        );
        const evidenceRotationHeld =
          state === "approach" &&
          planet.holding.ticker === selected &&
          Number.isFinite(evidenceRotationDegrees);
        if (evidenceRotationHeld) {
          planet.mesh.rotation.y =
            brandEntryPhase(planet.holding.ticker) +
            (evidenceRotationDegrees * Math.PI) / 180;
        } else {
          planet.mesh.rotation.y +=
            progradeSign * planet.spinRadiansPerSecond * delta;
        }
        const targetScale =
          planet.descriptor.radius * (targeted ? 1.08 : 1);
        const nextScale =
          planet.mesh.scale.x +
          (targetScale - planet.mesh.scale.x) * (1 - Math.exp(-delta * 9));
        planet.mesh.scale.setScalar(nextScale);
        planet.mesh.material.uniforms.uActive.value +=
          ((targeted ? 1 : 0) - planet.mesh.material.uniforms.uActive.value) *
          (1 - Math.exp(-delta * 8));
        const dimTarget = selected && planet.holding.ticker !== selected ? 0.22 : 1;
        planet.mesh.material.uniforms.uDim.value +=
          (dimTarget - planet.mesh.material.uniforms.uDim.value) *
          (1 - Math.exp(-delta * 5));
        const exposureTarget =
          state === "approach" && planet.holding.ticker === selected
            ? approachExposure(planet.descriptor.renderExposure)
            : planet.descriptor.renderExposure;
        planet.mesh.material.uniforms.uExposure.value +=
          (exposureTarget -
            planet.mesh.material.uniforms.uExposure.value) *
          (1 - Math.exp(-delta * 6));
        planet.path.material.uniforms.uOpacity.value = targeted
          ? ACTIVE_RING_OPACITY
          : OVERVIEW_RING_OPACITY;
        planet.path.rotation.y = planet.orbit.rotation.y;
        planet.path.visible =
          warmedObjects.has(planet.path) && state !== "approach";
        planet.mesh.getWorldPosition(worldPosition);
        const liveProjection = projectSphereScreenBounds(
          {
            x: worldPosition.x,
            y: worldPosition.y,
            z: worldPosition.z,
          },
          planet.mesh.scale.x,
          {
            fovDegrees: camera.fov,
            near: camera.near,
            far: camera.far,
            position: {
              x: camera.position.x,
              y: camera.position.y,
              z: camera.position.z,
            },
            target: {
              x: lookAt.x,
              y: lookAt.y,
              z: lookAt.z,
            },
          },
          {
            width: labelRect.width,
            height: labelRect.height,
          },
        );
        projected.copy(worldPosition).project(camera);
        labelPosition
          .copy(worldPosition)
          .addScaledVector(camera.up, -planet.mesh.scale.x * 1.45)
          .project(camera);
        // FB-20: a label's own offset position can still read as "on
        // screen" (see layoutOverviewLabels' edge clamp) even after its
        // body has left the depth-tested range or drifted fully outside the
        // canvas -- the raw depth test alone (projected.z > 1) missed both.
        // bodyVisible is derived from the body's OWN projected bounds
        // (liveProjection), not the label's offset position, so a culled or
        // off-frame body is never rescued by the label clamp below.
        const bodyVisible =
          projected.z <= 1 &&
          projected.z >= -1 &&
          liveProjection.bounds.right >= 0 &&
          liveProjection.bounds.left <= labelRect.width &&
          liveProjection.bounds.bottom >= 0 &&
          liveProjection.bounds.top <= labelRect.height;
        labelCandidates.push({
          ...planet.labelDescriptor,
          screen: {
            x: (labelPosition.x * 0.5 + 0.5) * labelRect.width,
            y: (-labelPosition.y * 0.5 + 0.5) * labelRect.height,
            depth: projected.z,
          },
          opacity: 1,
          yielded: false,
          bodyVisible,
        });
        planet.label.textContent = targeted
          ? `${planet.holding.ticker} ${planet.labelDescriptor.dayChip}`
          : planet.holding.ticker;
        planet.label.dataset.targeted = targeted ? "true" : "false";
        planet.label.dataset.planetCenterX = String(
          liveProjection.screen.x,
        );
        planet.label.dataset.planetCenterY = String(
          liveProjection.screen.y,
        );
        planet.label.dataset.planetRadiusPx = String(
          liveProjection.bounds.width / 2,
        );
        planet.label.dataset.renderExposure = String(
          planet.mesh.material.uniforms.uExposure.value,
        );
        planet.orbit.updateWorldMatrix(true, false);
        const trailSampleAngle =
          planet.trailDescriptor.sweep.tailRadians *
          planet.trailDescriptor.sampleFraction;
        trailSamplePosition
          .set(
            Math.cos(trailSampleAngle) * planet.descriptor.orbitRadius,
            0.025,
            Math.sin(trailSampleAngle) * planet.descriptor.orbitRadius,
          )
          .applyMatrix4(planet.orbit.matrixWorld)
          .project(camera);
        planet.label.dataset.trailSampleX = String(
          (trailSamplePosition.x * 0.5 + 0.5) * labelRect.width,
        );
        planet.label.dataset.trailSampleY = String(
          (-trailSamplePosition.y * 0.5 + 0.5) * labelRect.height,
        );
        // FB-26 verification methodology (owner ruling, §13): publish the
        // same projection at every candidate fraction along this trail, so a
        // verifier can walk them looking for a point clear of this planet's
        // own disc and on the ribbon's solid core, instead of trusting one
        // fixed fraction to be valid for every orbit-radius/disc-size
        // combination. Nothing about the trail's rendered geometry changes.
        planet.label.dataset.trailSampleCandidates = JSON.stringify(
          planet.trailDescriptor.sampleSearchFractions.map((fraction) => {
            const angle = planet.trailDescriptor.sweep.tailRadians * fraction;
            trailSamplePosition
              .set(
                Math.cos(angle) * planet.descriptor.orbitRadius,
                0.025,
                Math.sin(angle) * planet.descriptor.orbitRadius,
              )
              .applyMatrix4(planet.orbit.matrixWorld)
              .project(camera);
            return {
              fraction,
              x: (trailSamplePosition.x * 0.5 + 0.5) * labelRect.width,
              y: (-trailSamplePosition.y * 0.5 + 0.5) * labelRect.height,
            };
          }),
        );
        // A short arc of points diametrically opposite the planet on its
        // own ring, projected through the real camera. The overview camera
        // is oblique (see cameraForOverview: an elevated, forward-offset
        // position, not top-down orthographic), so a ring lying flat in the
        // XZ plane projects onto the screen as an ELLIPSE, not a circle
        // centered on the sun -- a naive sunCenter + orbitRadiusPx *
        // (cos, sin) far-side estimate drifts off the true ring band as it
        // can miss badly (confirmed: CBRS's naive far point landed 192px
        // off-canvas from its true camera-projected position). Each point
        // here is an exact 3D point on the ring, run through the same
        // camera projection as the planet/trail samples above -- no circle
        // assumed. The arc (not one exact point) is robust to a single
        // ticker label overlapping one sample, same rationale as the
        // existing near-side trail sampling. The off-ring reference point
        // is derived from this arc in screen space by the evidence script
        // (a small fixed-pixel radial offset), not re-projected at a larger
        // 3D radius -- a larger 3D radius drifts across the background's
        // own radial vignette for outer rings, which reads as signal that
        // has nothing to do with the ring.
        const farArc: Array<[number, number]> = [];
        for (let arcStep = -RING_FAR_ARC_HALF_COUNT; arcStep <= RING_FAR_ARC_HALF_COUNT; arcStep += 1) {
          const arcAngle = Math.PI + (arcStep * RING_FAR_ARC_STEP_RADIANS);
          ringFarSidePosition
            .set(
              Math.cos(arcAngle) * planet.descriptor.orbitRadius,
              0,
              Math.sin(arcAngle) * planet.descriptor.orbitRadius,
            )
            .applyMatrix4(planet.orbit.matrixWorld)
            .project(camera);
          farArc.push([
            (ringFarSidePosition.x * 0.5 + 0.5) * labelRect.width,
            (-ringFarSidePosition.y * 0.5 + 0.5) * labelRect.height,
          ]);
        }
        planet.label.dataset.ringFarArc = JSON.stringify(farArc);
      }
      const resolvedLabels = layoutOverviewLabels(labelCandidates, {
        width: labelRect.width,
        height: labelRect.height,
      });
      for (const resolved of resolvedLabels) {
        const runtime = planetRuntimes.find(
          ({ holding }) => holding.ticker === resolved.ticker,
        );
        if (!runtime) continue;
        // FB-20: hidden is the authoritative cull -- a body that failed the
        // depth/frame test never gets a position write, so it cannot be
        // left visible at a stale (or edge-clamped) screen position.
        runtime.label.hidden = !resolved.bodyVisible;
        if (resolved.bodyVisible) {
          runtime.label.style.left = `${resolved.screen.x}px`;
          runtime.label.style.top = `${resolved.screen.y}px`;
          runtime.label.style.opacity = String(resolved.opacity);
          runtime.label.dataset.yielded = resolved.yielded ? "true" : "false";
        }
      }
      if (!reducedMotion && shipPlaced) {
        // Resolve the helm: the live pointer, or the flight destination
        // projected fresh each frame (planets keep orbiting mid-flight).
        let targetX = pointerClientX;
        let targetY = pointerClientY;
        let stiffness = ROCKET_STIFFNESS;
        if (rocketFlight) {
          const destination = planetRuntimes.find(
            ({ holding }) => holding.ticker === rocketFlight?.ticker,
          );
          if (destination) {
            destination.mesh.getWorldPosition(projected);
            projected.project(camera);
            const rect = renderer.domElement.getBoundingClientRect();
            targetX = (projected.x * 0.5 + 0.5) * rect.width;
            targetY = (-projected.y * 0.5 + 0.5) * rect.height;
            stiffness = ROCKET_AFTERBURNER;
          }
        }
        const damping = 2 * Math.sqrt(stiffness);
        shipVx += (stiffness * (targetX - shipX) - damping * shipVx) * delta;
        shipVy += (stiffness * (targetY - shipY) - damping * shipVy) * delta;
        shipX += shipVx * delta;
        shipY += shipVy * delta;
        const shipSpeed = Math.hypot(shipVx, shipVy);
        // Heading follows velocity while flying and HOLDS at rest (no
        // re-park between strokes — owner decision, round 6 mock).
        if (shipSpeed > 24) {
          const targetHeading = Math.atan2(shipVy, shipVx);
          let turn = targetHeading - shipHeading;
          while (turn > Math.PI) turn -= Math.PI * 2;
          while (turn < -Math.PI) turn += Math.PI * 2;
          const step = turn * Math.min(1, delta / ROCKET_HEADING_TAU);
          const bank = Math.max(
            -ROCKET_BANK_CLAMP,
            Math.min(
              ROCKET_BANK_CLAMP,
              (step / Math.max(delta, 1e-4)) * ROCKET_BANK_GAIN,
            ),
          );
          shipHeading += step;
          rocket.style.transform = `translate(${(shipX - 8).toFixed(1)}px, ${(
            shipY - 9
          ).toFixed(1)}px) rotate(${(((shipHeading + bank) * 180) / Math.PI).toFixed(1)}deg)`;
        } else {
          rocket.style.transform = `translate(${(shipX - 8).toFixed(1)}px, ${(
            shipY - 9
          ).toFixed(1)}px) rotate(${((shipHeading * 180) / Math.PI).toFixed(1)}deg)`;
        }
        // Thrust is honest: exhaust reads the SHIP's speed, not the pointer's.
        const thrust = Math.min(1, shipSpeed / 900);
        rocket.style.setProperty("--rocket-speed", thrust.toFixed(3));
        rocket.dataset.prismSpeed = thrust.toFixed(3);
        if (rocketFlight) {
          const arrived =
            Math.hypot(targetX - shipX, targetY - shipY) <= ROCKET_ARRIVE_PX;
          const overdue =
            now - rocketFlight.startedAt >= ROCKET_FLIGHT_GUARANTEE_MS;
          if (arrived || overdue) {
            const ticker = rocketFlight.ticker;
            rocketFlight = null;
            rocket.dataset.flying = "false";
            rocket.dataset.visible = "false";
            callbacksRef.current.onSelect(ticker);
          }
        }
      }
      beltGroup.rotation.y += delta * 0.015;
      moonRuntimes.forEach(({ descriptor, group }) => {
        group.rotation.y += delta * (Math.PI * 2 / descriptor.orbitPeriodSeconds);
      });
      satelliteRuntimes.forEach(({ descriptor, group, light }, index) => {
        group.rotation.y += delta * (0.19 + index * 0.025);
        light.material.opacity =
          descriptor.blinkSeconds === null
            ? 1
            : 0.35 + 0.65 * (0.5 + Math.sin(time * Math.PI * 2 / descriptor.blinkSeconds) * 0.5);
      });
      const canvasRect = renderer.domElement.getBoundingClientRect();
      sun.getWorldPosition(projected);
      projected.project(camera);
      const sunScreenX = (projected.x * 0.5 + 0.5) * canvasRect.width;
      const sunScreenY = (-projected.y * 0.5 + 0.5) * canvasRect.height;
      mount.dataset.evidenceSunX = String(sunScreenX);
      mount.dataset.evidenceSunY = String(sunScreenY);
      // FB-23 (§13): the PORTFOLIO chip tracks the sun's actual per-frame
      // projected screen position, the same technique planet labels use,
      // instead of a static frame-center CSS position.
      const sunTelemetryElement = sunTelemetryRef?.current;
      if (sunTelemetryElement) {
        sunTelemetryElement.style.left = `${sunScreenX}px`;
        sunTelemetryElement.style.top = `${sunScreenY}px`;
      }
      const firstMoon = moonRuntimes[0];
      if (firstMoon) {
        firstMoon.mesh.getWorldPosition(projected);
        projected.project(camera);
        mount.dataset.evidenceMoonX = String(
          (projected.x * 0.5 + 0.5) * canvasRect.width,
        );
        mount.dataset.evidenceMoonY = String(
          (-projected.y * 0.5 + 0.5) * canvasRect.height,
        );
        mount.dataset.evidenceMoonTarget = `moon:${firstMoon.descriptor.ticker}`;
      }
      const hazardSatellite = satelliteRuntimes.find(
        ({ descriptor }) => descriptor.id === "HAZARD",
      );
      if (hazardSatellite) {
        hazardSatellite.craft.getWorldPosition(projected);
        projected.project(camera);
        mount.dataset.evidenceSatelliteX = String(
          (projected.x * 0.5 + 0.5) * canvasRect.width,
        );
        mount.dataset.evidenceSatelliteY = String(
          (-projected.y * 0.5 + 0.5) * canvasRect.height,
        );
        mount.dataset.evidenceSatelliteTarget = "satellite:HAZARD";
      }
      if (sceneModel.comet && cometGroup.visible) {
        const cometProgress = Math.min(1, (now - cometStartedAt) / 2400);
        cometGroup.position.x =
          -outerRadius * 1.2 + outerRadius * 2.4 * cometProgress;
        cometGroup.position.z =
          -outerRadius * 0.34 + Math.sin(cometProgress * Math.PI) * 1.8;
        if (cometProgress >= 1) cometGroup.visible = false;
      }
      beltRocks.forEach((rock, index) => {
        rock.getWorldPosition(projected);
        projected.project(camera);
        const label = beltLabels[index];
        label.style.left = `${(projected.x * 0.5 + 0.5) * 100}%`;
        label.style.top = `${(-projected.y * 0.5 + 0.5) * 100}%`;
        label.hidden = projected.z > 1;
      });

      const selectedRuntime = planetRuntimes.find(
        ({ holding }) => holding.ticker === selected,
      );
      const tiltRadians = (dragTilt * Math.PI) / 180;
      if (state === "approach" && selectedRuntime) {
        if (brandEntryTicker !== selectedRuntime.holding.ticker) {
          selectedRuntime.mesh.rotation.y = brandEntryPhase(
            selectedRuntime.holding.ticker,
          );
          brandEntryTicker = selectedRuntime.holding.ticker;
        }
        selectedRuntime.mesh.getWorldPosition(worldPosition);
        outwardVector.copy(worldPosition).setY(0).normalize();
        tangentVector.set(-outwardVector.z, 0, outwardVector.x);
        cameraTarget
          .copy(worldPosition)
          .addScaledVector(outwardVector, APPROACH_CAMERA_DISTANCE)
          .addScaledVector(
            tangentVector,
            APPROACH_CAMERA_TANGENT_OFFSET,
          );
        cameraTarget.y += APPROACH_CAMERA_HEIGHT;
        lookAtTarget
          .copy(worldPosition)
          .addScaledVector(
            tangentVector,
            APPROACH_LOOK_AT_TANGENT_OFFSET,
          );
      } else if (state === "command") {
        brandEntryTicker = null;
        cameraTarget.set(0, 3.8, 7.4);
        lookAtTarget.set(0, 0, 0);
      } else {
        brandEntryTicker = null;
        cameraTarget
          .copy(overviewPosition)
          .multiplyScalar(zoomScale)
          .applyAxisAngle(new Vector3(0, 1, 0), tiltRadians);
        cameraTarget.x += pointerX * 0.12;
        lookAtTarget.set(
          overviewLookAt.x + pointerX * 0.15,
          overviewLookAt.y + pointerY * 0.08,
          overviewLookAt.z,
        );
      }
      const cameraAmount = 1 - Math.exp(-delta * (state === "approach" ? 3.7 : 5));
      camera.position.lerp(cameraTarget, cameraAmount);
      lookAt.lerp(lookAtTarget, cameraAmount);
      camera.lookAt(lookAt);

      const health = healthRef.current;
      const dockingActive =
        localTarget === "portfolio" ||
        portfolioFocusedRef.current ||
        now < dockingFlashUntil;
      dockingRing.visible = dockingProgramReady && dockingActive;
      mount.dataset.docking = dockingActive ? "true" : "false";
      dockingRing.rotation.z = reducedMotion ? 0 : time * 0.16;
      sunMaterial.uniforms.uTime.value = time;
      sunMaterial.uniforms.uHealth.value = health.h;
      sunMaterial.uniforms.uSunspots.value = health.sunspotIntensity;
      const sunDescriptor = sceneModel.sun;
      const health01 = (sunDescriptor.healthScalar + 1) / 2;
      const pulse =
        1 + Math.sin(time * sunDescriptor.pulseRate) * sunDescriptor.pulseDepth;
      const innerBase = 1.12 + health01 * 0.22;
      const outerBase = sunDescriptor.coronaWidth;
      glowMaterialInner.opacity = 0.05 + health01 * 0.11;
      glowMaterialOuter.opacity = sunDescriptor.coronaOpacity;
      glowInner.scale.setScalar(innerBase * pulse);
      glowOuter.scale.setScalar(outerBase * (2 - pulse));
      starPopulation.group.rotation.y =
        pointerX * sceneModel.starfields[0].parallax + time * 0.0007;
      starPopulation.group.rotation.x =
        pointerY * -sceneModel.starfields[0].parallax * 0.72;
      nebula.rotation.z += delta * sceneModel.nebula.driftRadiansPerSecond;
      aurora.position.x = reducedMotion ? 0 : Math.sin(time * 0.025) * outerRadius * 0.04;
      renderer.render(scene, camera);
      // Retain the already-landed one-material warmup so program work stays
      // incremental. The current F5 fix is the construction staging above;
      // the owner profile disproved shader acquisition as the breached task's
      // dominant cause.
      advanceShaderWarmup();
      animationFrame = requestAnimationFrame(render);
    };
    animationFrame = requestAnimationFrame(render);

      mount.dataset.sceneConstructionStage = "complete";
      return () => {
      cancelAnimationFrame(animationFrame);
      textureCancelled = true;
      cancelAnimationFrame(textureFrame);
      textureWorker.terminate();
      for (const request of textureRequests.values()) {
        request.reject(new Error("Texture decode cancelled"));
      }
      textureRequests.clear();
      window.clearTimeout(dockingHintTimer);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointerleave", onPointerLeave);
      renderer.domElement.removeEventListener("click", onClick);
      renderer.domElement.removeEventListener("dblclick", onDoubleClick);
      renderer.domElement.removeEventListener("wheel", onWheel);
      for (const planet of planetRuntimes) planet.mesh.material.dispose();
      for (const texture of loadedTextures) texture.dispose();
      for (const geometry of orbitGeometries) geometry.dispose();
      for (const material of orbitMaterials) material.dispose();
      for (const geometry of trailGeometries) geometry.dispose();
      for (const material of trailMaterials) material.dispose();
      for (const points of starPopulation.points) {
        points.geometry.dispose();
        points.material.dispose();
      }
      starPopulation.spikes.geometry.dispose();
      starPopulation.spikes.material.dispose();
      nebulaGeometry.dispose();
      nebulaMaterial.dispose();
      auroraGeometry.dispose();
      auroraMaterial.dispose();
      auroraTexture.dispose();
      wispGeometry.dispose();
      wispMaterial.dispose();
      planetGeometry.dispose();
      sunGeometry.dispose();
      sunMaterial.dispose();
      glowMaterialInner.dispose();
      glowMaterialOuter.dispose();
      dockingRing.children.forEach((child) => {
        if (child instanceof Mesh) child.geometry.dispose();
      });
      dockingRingMaterial.dispose();
      graticuleRingGeometry.dispose();
      graticuleTickGeometries.forEach((geometry) => geometry.dispose());
      graticuleMaterial.dispose();
      rockGeometry.dispose();
      rockMaterial.dispose();
      moonGeometry.dispose();
      moonMaterial.dispose();
      moonRuntimes.forEach(({ earningsRing }) => {
        earningsRing?.geometry.dispose();
        earningsRing?.material.dispose();
      });
      satelliteGeometry.dispose();
      satelliteMaterial.dispose();
      satelliteLightMaterial.dispose();
      satelliteRuntimes.forEach(({ light }) => light.geometry.dispose());
      cometHeadGeometry?.dispose();
      cometTailGeometry?.dispose();
      cometMaterial?.dispose();
      fallbackTexture.dispose();
      renderer.dispose();
      labelLayer.remove();
      renderer.domElement.remove();
      };
    };
    void initialize().then((cleanup) => {
      if (!cleanup) return;
      if (initializationCancelled) {
        cleanup();
        return;
      }
      initializedCleanup = cleanup;
    });
    return () => {
      initializationCancelled = true;
      initializedCleanup?.();
      initializedCleanup = null;
    };
  }, [sceneKey]);

  return <div ref={mountRef} className={styles.sceneMount} aria-hidden="true" />;
}
