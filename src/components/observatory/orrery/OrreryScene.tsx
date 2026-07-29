"use client";

import { useEffect, useMemo, useRef } from "react";
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
  OVERVIEW_RING_OPACITY,
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

const ROCKET_FLIGHT_MS = 560;

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
  const positions = {
    faint: [] as number[],
    medium: [] as number[],
    bright: [] as number[],
    diffraction: [] as number[],
  };
  const colors = {
    faint: [] as number[],
    medium: [] as number[],
    bright: [] as number[],
    diffraction: [] as number[],
  };
  const spikePositions: number[] = [];
  const cyan = new Color(UNIVERSE_PALETTE.glass.cyan);
  const violet = new Color(UNIVERSE_PALETTE.glass.violet);
  const cream = new Color(UNIVERSE_PALETTE.cabinet.cream);
  for (let index = 0; index < descriptor.count; index += 1) {
    const bucket = starMagnitudeBucket(index, descriptor.count);
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
    positions[bucket].push(x, y, z);
    const tint = index % 23 === 0 ? cyan : index % 41 === 0 ? violet : cream;
    const intensity =
      bucket === "faint"
        ? 0.25 + seededUnit(index, 33) * 0.2
        : bucket === "medium"
          ? 0.62
          : bucket === "bright"
            ? 0.82
            : 1;
    colors[bucket].push(
      tint.r * intensity,
      tint.g * intensity,
      tint.b * intensity,
    );
    if (bucket === "diffraction") {
      const span = 0.24;
      spikePositions.push(
        x - span, y, z, x + span, y, z,
        x, y - span, z, x, y + span, z,
      );
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
  const positions: number[] = [];
  const segments = 28;
  const sign = direction === "counterclockwise" ? 1 : -1;
  const quad = (
    outer0: readonly number[],
    inner0: readonly number[],
    outer1: readonly number[],
    inner1: readonly number[],
  ) => {
    positions.push(
      ...outer0,
      ...inner0,
      ...outer1,
      ...inner0,
      ...inner1,
      ...outer1,
    );
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
    const radial = (angle: number, offset: number) =>
      [
        Math.cos(angle) * (radius + offset),
        0.025,
        Math.sin(angle) * (radius + offset),
      ] as const;
    const vertical = (angle: number, offset: number) =>
      [
        Math.cos(angle) * radius,
        0.025 + offset,
        Math.sin(angle) * radius,
      ] as const;

    // Pair the orbital-plane ribbon with a vertical ribbon so its core remains
    // measurable where perspective foreshortens the plane. The glow uses
    // minimumWidth to occupy only the annulus outside the opaque core.
    quad(
      radial(a0, outer0),
      radial(a0, inner0),
      radial(a1, outer1),
      radial(a1, inner1),
    );
    quad(
      radial(a0, -outer0),
      radial(a0, -inner0),
      radial(a1, -outer1),
      radial(a1, -inner1),
    );
    quad(
      vertical(a0, outer0),
      vertical(a0, inner0),
      vertical(a1, outer1),
      vertical(a1, inner1),
    );
    quad(
      vertical(a0, -outer0),
      vertical(a0, -inner0),
      vertical(a1, -outer1),
      vertical(a1, -inner1),
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

    const starPopulation = createStarPopulation(sceneModel.starPopulation);
    scene.add(starPopulation.group);
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

    const orbitGeometries: RingGeometry[] = [];
    const orbitMaterials: ShaderMaterial[] = [];
    const trailGeometries: BufferGeometry[] = [];
    const trailMaterials: MeshBasicMaterial[] = [];
    const loadedTextures: Texture[] = [];

    let launchRocket = (ticker: string) => {
      callbacksRef.current.onSelect(ticker);
    };
    const planetRuntimes: PlanetRuntime[] = sceneHoldings.map((holding, index) => {
      const descriptor = sceneModel.planets[index];
      const ringDescriptor = sceneModel.rings[index];
      const trailDescriptor = sceneModel.trails[index];
      const labelDescriptor = sceneModel.labels.find(
        ({ ticker }) => ticker === holding.ticker,
      )!;
      const orbitRadius = descriptor.orbitRadius;
      const initialAngle = descriptor.initialAngle;
      const plane = new Group();
      const pathGeometry = new RingGeometry(orbitRadius - 0.012, orbitRadius + 0.012, 160);
      pathGeometry.rotateX(-Math.PI / 2);
      const pathPositions = pathGeometry.getAttribute("position");
      pathGeometry.setAttribute(
        "aAlpha",
        new Float32BufferAttribute(
          Array.from({ length: pathPositions.count }, (_, positionIndex) => {
            const x = pathPositions.getX(positionIndex);
            const z = pathPositions.getZ(positionIndex);
            return ringVertexAlpha(Math.atan2(z, x));
          }),
          1,
        ),
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
      label.dataset.weeklyReturn =
        holding.weeklyReturn === null ? "null" : String(holding.weeklyReturn);
      label.dataset.trailColor = trailDescriptor.color;
      label.style.setProperty(
        "--planet-label-color",
        labelDescriptor.color,
      );
      label.addEventListener("click", () => launchRocket(holding.ticker));
      labelLayer.appendChild(label);
      return {
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
      };
    });

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
    void loadTextures();

    const raycaster = new Raycaster();
    const pointer = new Vector2(2, 2);
    const worldPosition = new Vector3();
    const projected = new Vector3();
    const labelPosition = new Vector3();
    const trailSamplePosition = new Vector3();
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
    let priorPointerX = -1000;
    let priorPointerY = -1000;
    let priorPointerAt = performance.now();
    let dragging = false;
    let dragStartX = 0;
    let dragStartTilt = 0;
    let rocketFlight: RocketFlight | null = null;
    const cometStartedAt = performance.now();

    const positionRocket = (x: number, y: number) => {
      rocket.style.left = `${x}px`;
      rocket.style.top = `${y}px`;
    };

    launchRocket = (ticker: string) => {
      if (reducedMotion) {
        callbacksRef.current.onSelect(ticker);
        return;
      }
      rocketFlight = {
        ticker,
        startedAt: performance.now(),
        startX: pointerClientX,
        startY: pointerClientY,
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
      const now = performance.now();
      const elapsed = Math.max(8, now - priorPointerAt);
      const speed = Math.min(
        1,
        Math.hypot(pointerClientX - priorPointerX, pointerClientY - priorPointerY) /
          elapsed /
          1.6,
      );
      rocket.style.setProperty("--rocket-speed", speed.toFixed(3));
      rocket.dataset.prismSpeed = speed.toFixed(3);
      priorPointerX = pointerClientX;
      priorPointerY = pointerClientY;
      priorPointerAt = now;
      if (!rocketFlight && !reducedMotion) {
        positionRocket(pointerClientX, pointerClientY);
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

    let previousTime = performance.now();
    let animationFrame = 0;
    let shaderWarmupStage = 0;
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
        planet.mesh.rotation.y +=
          progradeSign * planet.spinRadiansPerSecond * delta;
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
        planet.path.material.uniforms.uOpacity.value = targeted
          ? ACTIVE_RING_OPACITY
          : OVERVIEW_RING_OPACITY;
        planet.path.rotation.y = planet.orbit.rotation.y;
        planet.path.visible =
          shaderWarmupStage >= 2 && state !== "approach";
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
        labelCandidates.push({
          ...planet.labelDescriptor,
          screen: {
            x: (labelPosition.x * 0.5 + 0.5) * labelRect.width,
            y: (-labelPosition.y * 0.5 + 0.5) * labelRect.height,
            depth: projected.z,
          },
          opacity: 1,
          yielded: false,
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
        planet.label.hidden = projected.z > 1;
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
        runtime.label.style.left = `${resolved.screen.x}px`;
        runtime.label.style.top = `${resolved.screen.y}px`;
        runtime.label.style.opacity = String(resolved.opacity);
        runtime.label.dataset.yielded = resolved.yielded ? "true" : "false";
      }
      if (rocketFlight) {
        const destination = planetRuntimes.find(
          ({ holding }) => holding.ticker === rocketFlight?.ticker,
        );
        if (destination) {
          destination.mesh.getWorldPosition(projected);
          projected.project(camera);
          const rect = renderer.domElement.getBoundingClientRect();
          const targetX = (projected.x * 0.5 + 0.5) * rect.width;
          const targetY = (-projected.y * 0.5 + 0.5) * rect.height;
          const progress = Math.min(
            1,
            (now - rocketFlight.startedAt) / ROCKET_FLIGHT_MS,
          );
          const eased = 1 - Math.pow(1 - progress, 3);
          positionRocket(
            rocketFlight.startX + (targetX - rocketFlight.startX) * eased,
            rocketFlight.startY + (targetY - rocketFlight.startY) * eased,
          );
          if (progress >= 1) {
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
      mount.dataset.evidenceSunX = String(
        (projected.x * 0.5 + 0.5) * canvasRect.width,
      );
      mount.dataset.evidenceSunY = String(
        (-projected.y * 0.5 + 0.5) * canvasRect.height,
      );
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
          .addScaledVector(outwardVector, 6.2)
          .addScaledVector(tangentVector, 1.25);
        cameraTarget.y += 1.35;
        lookAtTarget
          .copy(worldPosition)
          .addScaledVector(tangentVector, 1.45);
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
      dockingRing.visible = shaderWarmupStage >= 4 && dockingActive;
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
      if (shaderWarmupStage === 0) {
        nebula.visible = true;
        aurora.visible = true;
        weatherWisps.visible = true;
        glowInner.visible = true;
        glowOuter.visible = true;
        shaderWarmupStage = 1;
      } else if (shaderWarmupStage === 1) {
        // The ring shader becomes visible through the render-loop gate on the
        // next frame. Keeping one program family per frame prevents first-load
        // WebGLPrograms acquisition from becoming a single long task.
        shaderWarmupStage = 2;
      } else if (shaderWarmupStage === 2) {
        planetRuntimes.forEach(({ trailMeshes }) => {
          trailMeshes.forEach((mesh) => {
            mesh.visible = true;
          });
        });
        shaderWarmupStage = 3;
      } else if (shaderWarmupStage === 3) {
        moonRuntimes.forEach(({ group }) => {
          group.visible = true;
        });
        satelliteRuntimes.forEach(({ group }) => {
          group.visible = true;
        });
        beltGroup.visible = true;
        cometGroup.visible = Boolean(sceneModel.comet);
        shaderWarmupStage = 4;
      } else if (shaderWarmupStage === 4) {
        sun.visible = true;
        shaderWarmupStage = 5;
      } else if (shaderWarmupStage === 5) {
        planetRuntimes.forEach(({ mesh }) => {
          mesh.visible = true;
        });
        shaderWarmupStage = 6;
      }
      animationFrame = requestAnimationFrame(render);
    };
    animationFrame = requestAnimationFrame(render);

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
  }, [sceneKey]);

  return <div ref={mountRef} className={styles.sceneMount} aria-hidden="true" />;
}
