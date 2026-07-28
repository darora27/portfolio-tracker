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
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Raycaster,
  RingGeometry,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  Texture,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { KTX2Loader } from "three/addons/loaders/KTX2Loader.js";
import {
  ORRERY_MAX_ANGULAR_SPEED,
  angularSpeedForWeeklyReturn,
  axialSpinForDayReturn,
  directionForWeeklyReturn,
  orbitRadiusForRank,
  radiusForWeight,
  type PublicOrreryHolding,
} from "@/lib/observatory/orrery";
import type {
  OrreryCameraState,
  PortfolioHealth,
} from "./OrreryWorld";
import styles from "./orrery.module.css";

const PALETTES: Record<string, readonly [string, string]> = {
  ASML: ["#2d1d63", "#87d7ff"],
  GOOG: ["#17466b", "#f0c857"],
  COST: ["#70251f", "#f3d99e"],
  MSFT: ["#15628c", "#6fe0d0"],
  INTC: ["#493022", "#63a9d4"],
  IBM: ["#18366d", "#a8d8ff"],
  NBIS: ["#632a78", "#ff873d"],
  CBRS: ["#1d5c3b", "#b8ff6d"],
};

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
  uniform sampler2D uBaseMap;
  uniform sampler2D uEmissiveMap;
  uniform sampler2D uNormalMap;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    vec3 normalTex = texture2D(uNormalMap, vUv).xyz * 2.0 - 1.0;
    vec3 normal = normalize(vNormal + normalTex * 0.16 * uHasTextures);
    vec3 viewDirection = normalize(vViewPosition);
    vec3 lightDirection = normalize(vec3(0.7, 0.8, 1.0));
    float diffuse = 0.18 + 0.82 * max(dot(normal, lightDirection), 0.0);
    float bands = sin(vUv.y * (32.0 + mod(uSeed, 8.0)) + sin(vUv.x * 30.0));
    float pattern = smoothstep(-0.45, 0.62, bands);
    vec3 procedural = mix(uBase, uAccent, pattern * 0.58);
    vec3 mapped = texture2D(uBaseMap, vUv).rgb;
    vec3 emissive = texture2D(uEmissiveMap, vUv).rgb;
    vec3 surface = mix(procedural, mapped, uHasTextures);
    float rim = pow(1.0 - max(dot(normal, viewDirection), 0.0), 2.2);
    vec3 color = surface * diffuse + uAccent * rim * (0.7 + uActive * 0.5);
    color += emissive * uHasTextures * 0.75 + uAccent * uActive * 0.1;
    gl_FragColor = vec4(color * uDim, 1.0);
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

type PlanetRuntime = {
  holding: PublicOrreryHolding;
  orbit: Group;
  mesh: Mesh<SphereGeometry, ShaderMaterial>;
  path: Mesh<RingGeometry, MeshBasicMaterial>;
  label: HTMLButtonElement;
  initialAngle: number;
  direction: ReturnType<typeof directionForWeeklyReturn>;
  angularSpeed: number;
  axialSpin: number;
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

function createStarField(): Points<BufferGeometry, PointsMaterial> {
  const positions: number[] = [];
  const colors: number[] = [];
  const phosphor = new Color("#8acda0");
  const amber = new Color("#d7aa63");
  const white = new Color("#dcebd7");
  for (let index = 0; index < 760; index += 1) {
    const radius = 10 + seededUnit(index, 1) * 22;
    const theta = seededUnit(index, 2) * Math.PI * 2;
    const phi = Math.acos(2 * seededUnit(index, 3) - 1);
    positions.push(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi) * 0.8,
      radius * Math.sin(phi) * Math.sin(theta) - 5,
    );
    const tint = index % 17 === 0 ? amber : index % 5 === 0 ? phosphor : white;
    const intensity = 0.45 + seededUnit(index, 4) * 0.55;
    colors.push(tint.r * intensity, tint.g * intensity, tint.b * intensity);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  return new Points(
    geometry,
    new PointsMaterial({
      size: 0.045,
      transparent: true,
      opacity: 0.82,
      vertexColors: true,
      depthWrite: false,
    }),
  );
}

function createTrailGeometry(
  radius: number,
  length: number,
  direction: ReturnType<typeof directionForWeeklyReturn>,
): BufferGeometry {
  const positions: number[] = [];
  const segments = 28;
  const sign = direction === "counterclockwise" ? -1 : 1;
  for (let index = 0; index < segments; index += 1) {
    const t0 = index / segments;
    const t1 = (index + 1) / segments;
    const a0 = sign * length * t0;
    const a1 = sign * length * t1;
    const w0 = 0.14 * (1 - t0) + 0.012;
    const w1 = 0.14 * (1 - t1) + 0.012;
    const point = (angle: number, width: number) => [
      Math.cos(angle) * (radius + width),
      0.025,
      Math.sin(angle) * (radius + width),
      Math.cos(angle) * (radius - width),
      0.025,
      Math.sin(angle) * (radius - width),
    ];
    const p0 = point(a0, w0);
    const p1 = point(a1, w1);
    positions.push(
      ...p0.slice(0, 3), ...p0.slice(3), ...p1.slice(0, 3),
      ...p0.slice(3), ...p1.slice(3), ...p1.slice(0, 3),
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
  cameraState,
  portfolioHealth,
  onHover,
  onSelect,
  onSelectPortfolio,
  onSelectBelt,
  onExitOverview,
}: {
  holdings: readonly PublicOrreryHolding[];
  beltHoldings: readonly PublicOrreryHolding[];
  selectedTicker: string | null;
  hoveredTicker: string | null;
  cameraState: OrreryCameraState;
  portfolioHealth: PortfolioHealth;
  onHover: (ticker: string | null) => void;
  onSelect: (ticker: string) => void;
  onSelectPortfolio: () => void;
  onSelectBelt: () => void;
  onExitOverview: () => void;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const selectedTickerRef = useRef(selectedTicker);
  const hoveredTickerRef = useRef(hoveredTicker);
  const cameraStateRef = useRef(cameraState);
  const callbacksRef = useRef({
    onHover,
    onSelect,
    onSelectPortfolio,
    onSelectBelt,
    onExitOverview,
  });
  const holdingsRef = useRef(holdings);
  const beltRef = useRef(beltHoldings);
  const healthRef = useRef(portfolioHealth);
  const sceneKey = useMemo(
    () =>
      [...holdings, ...beltHoldings]
        .map((holding) =>
          [holding.ticker, holding.weight, holding.weeklyReturn, holding.dayReturn].join(":"),
        )
        .join("|"),
    [beltHoldings, holdings],
  );

  useEffect(() => {
    selectedTickerRef.current = selectedTicker;
    hoveredTickerRef.current = hoveredTicker;
    cameraStateRef.current = cameraState;
    callbacksRef.current = {
      onHover,
      onSelect,
      onSelectPortfolio,
      onSelectBelt,
      onExitOverview,
    };
    healthRef.current = portfolioHealth;
    holdingsRef.current = holdings;
    beltRef.current = beltHoldings;
  }, [
    beltHoldings,
    cameraState,
    holdings,
    hoveredTicker,
    onExitOverview,
    onHover,
    onSelect,
    onSelectBelt,
    onSelectPortfolio,
    portfolioHealth,
    selectedTicker,
  ]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const sceneHoldings = holdingsRef.current;
    const sceneBelt = beltRef.current;
    const scene = new Scene();
    scene.fog = new Fog("#020706", 15, 34);

    const outerRadius = orbitRadiusForRank(Math.max(1, sceneHoldings.length));
    const camera = new PerspectiveCamera(42, 1, 0.1, 70);
    const overviewPosition = new Vector3(0, outerRadius * 1.15, outerRadius * 2.05);
    camera.position.copy(overviewPosition);
    const cameraTarget = overviewPosition.clone();
    const lookAt = new Vector3();
    const lookAtTarget = new Vector3();
    let zoomScale = 1;
    let dragTilt = 0;

    const renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(1);
    renderer.setClearColor("#020706", 0);
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
    const rocket = document.createElement("span");
    rocket.className = styles.rocketCursor;
    rocket.setAttribute("aria-hidden", "true");
    const rocketBody = document.createElement("span");
    rocketBody.className = styles.rocketBody;
    const rocketFlame = document.createElement("span");
    rocketFlame.className = styles.rocketFlame;
    rocket.append(rocketBody, rocketFlame);
    if (!reducedMotion) labelLayer.appendChild(rocket);

    const starField = createStarField();
    scene.add(starField);
    const planetGeometry = new SphereGeometry(1, 32, 24);
    const sunGeometry = new SphereGeometry(1.28, 40, 28);
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
    sun.userData.orreryTarget = "portfolio";
    scene.add(sun);

    const glowMaterialInner = new MeshBasicMaterial({
      color: "#ffb347",
      transparent: true,
      opacity: 0.12,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const glowMaterialOuter = glowMaterialInner.clone();
    const glowInner = new Mesh(sunGeometry, glowMaterialInner);
    const glowOuter = new Mesh(sunGeometry, glowMaterialOuter);
    scene.add(glowInner, glowOuter);

    const dockingRingMaterial = new MeshBasicMaterial({
      color: "#ffe4ad",
      transparent: true,
      opacity: 0.78,
      blending: AdditiveBlending,
      depthWrite: false,
      side: 2,
    });
    const dockingRing = new Group();
    for (let index = 0; index < 18; index += 1) {
      const dash = new Mesh(
        new RingGeometry(2.28, 2.34, 10, 1, index * (Math.PI / 9), Math.PI / 18),
        dockingRingMaterial,
      );
      dockingRing.add(dash);
    }
    dockingRing.visible = false;
    scene.add(dockingRing);

    const orbitGeometries: RingGeometry[] = [];
    const orbitMaterials: MeshBasicMaterial[] = [];
    const trailGeometries: BufferGeometry[] = [];
    const trailMaterials: MeshBasicMaterial[] = [];
    const loadedTextures: Texture[] = [];

    let launchRocket = (ticker: string) => {
      callbacksRef.current.onSelect(ticker);
    };
    const planetRuntimes: PlanetRuntime[] = sceneHoldings.map((holding, index) => {
      const rank = index + 1;
      const orbitRadius = orbitRadiusForRank(rank);
      const initialAngle = index * 2.399963;
      const plane = new Group();
      const pathGeometry = new RingGeometry(orbitRadius - 0.012, orbitRadius + 0.012, 160);
      pathGeometry.rotateX(-Math.PI / 2);
      orbitGeometries.push(pathGeometry);
      const path = new Mesh(
        pathGeometry,
        new MeshBasicMaterial({
          color: "#6da184",
          transparent: true,
          opacity: 0.34,
          depthWrite: false,
          side: 2,
        }),
      );
      orbitMaterials.push(path.material);
      plane.add(path);

      const direction = directionForWeeklyReturn(holding.weeklyReturn);
      const speed = angularSpeedForWeeklyReturn(holding.weeklyReturn);
      const trailGeometry = createTrailGeometry(
        orbitRadius,
        0.28 + (speed / ORRERY_MAX_ANGULAR_SPEED) * 0.78,
        direction,
      );
      trailGeometries.push(trailGeometry);
      const trailMaterial = new MeshBasicMaterial({
        color:
          direction === "clockwise"
            ? "#63ef98"
            : direction === "counterclockwise"
              ? "#ff665f"
              : "#e3b65c",
        transparent: true,
        opacity: 0.96,
        blending: AdditiveBlending,
        depthWrite: false,
        side: 2,
      });
      trailMaterials.push(trailMaterial);

      const orbit = new Group();
      orbit.rotation.y = initialAngle;
      orbit.add(new Mesh(trailGeometry, trailMaterial));
      const palette = PALETTES[holding.ticker] ?? ["#345b59", "#d8b35b"];
      const material = new ShaderMaterial({
        uniforms: {
          uBase: { value: new Color(palette[0]) },
          uAccent: { value: new Color(palette[1]) },
          uSeed: { value: tickerSeed(holding.ticker) % 97 },
          uActive: { value: 0 },
          uDim: { value: 1 },
          uHasTextures: { value: 0 },
          uBaseMap: { value: fallbackTexture },
          uEmissiveMap: { value: fallbackTexture },
          uNormalMap: { value: fallbackTexture },
        },
        vertexShader: PLANET_VERTEX_SHADER,
        fragmentShader: PLANET_FRAGMENT_SHADER,
      });
      const planet = new Mesh(planetGeometry, material);
      planet.position.set(orbitRadius, 0, 0);
      planet.scale.setScalar(radiusForWeight(holding.weight));
      planet.userData.orreryTarget = holding.ticker;
      orbit.add(planet);
      plane.add(orbit);
      scene.add(plane);

      const label = document.createElement("button");
      label.type = "button";
      label.tabIndex = -1;
      label.className = styles.sceneLabel;
      label.textContent = holding.ticker;
      label.style.setProperty(
        "--planet-label-color",
        new Color(palette[1]).lerp(new Color("#ffffff"), 0.72).getStyle(),
      );
      label.addEventListener("click", () => launchRocket(holding.ticker));
      labelLayer.appendChild(label);
      return {
        holding,
        orbit,
        mesh: planet,
        path,
        label,
        initialAngle,
        direction,
        angularSpeed: speed,
        axialSpin: axialSpinForDayReturn(holding.dayReturn),
      };
    });

    const beltRadius = outerRadius + 1.05;
    const beltGroup = new Group();
    const rockGeometry = new IcosahedronGeometry(0.11, 0);
    const rockMaterial = new MeshBasicMaterial({ color: "#b38a57" });
    const beltRocks: Mesh[] = [];
    const beltLabels: HTMLButtonElement[] = [];
    sceneBelt.forEach((holding, index) => {
      const angle = (index / Math.max(1, sceneBelt.length)) * Math.PI * 2 + index * 0.23;
      const rock = new Mesh(rockGeometry, rockMaterial);
      rock.position.set(Math.cos(angle) * beltRadius, 0, Math.sin(angle) * beltRadius);
      rock.scale.set(0.7 + seededUnit(index, 7), 0.5, 0.55);
      rock.userData.orreryTarget = "belt";
      beltGroup.add(rock);
      beltRocks.push(rock);
      const label = document.createElement("button");
      label.type = "button";
      label.tabIndex = -1;
      label.className = `${styles.sceneLabel} ${styles.beltLabel}`;
      label.textContent = holding.ticker;
      label.addEventListener("click", () => callbacksRef.current.onSelectBelt());
      labelLayer.appendChild(label);
      beltLabels.push(label);
    });
    scene.add(beltGroup);

    let textureFrame = requestAnimationFrame(() => {
      textureFrame = requestAnimationFrame(() => {
        const loader = new KTX2Loader().detectSupport(renderer);
        for (const planet of planetRuntimes) {
          const ticker = planet.holding.ticker.toLowerCase();
          const uniforms = planet.mesh.material.uniforms;
          Promise.all([
            loader.loadAsync(`/textures/planets/${ticker}-base.ktx2`),
            loader.loadAsync(`/textures/planets/${ticker}-emissive.ktx2`),
            loader.loadAsync(`/textures/planets/${ticker}-normal.ktx2`),
          ])
            .then(([base, emissive, normal]) => {
              base.colorSpace = SRGBColorSpace;
              emissive.colorSpace = SRGBColorSpace;
              loadedTextures.push(base, emissive, normal);
              uniforms.uBaseMap.value = base;
              uniforms.uEmissiveMap.value = emissive;
              uniforms.uNormalMap.value = normal;
              uniforms.uHasTextures.value = 1;
            })
            .catch(() => {
              // Unknown/new top-eight tickers keep deterministic shader art.
            });
        }
      });
    });

    const raycaster = new Raycaster();
    const pointer = new Vector2(2, 2);
    const worldPosition = new Vector3();
    const projected = new Vector3();
    const labelPosition = new Vector3();
    const pickTargets: Mesh[] = [sun, ...planetRuntimes.map(({ mesh }) => mesh), ...beltRocks];
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
          return "belt";
        }
      }
      return undefined;
    };
    const pick = () => {
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(pickTargets, false)[0]?.object.userData
        .orreryTarget as string | undefined;
      const target = magneticTarget() ?? hit;
      localTarget = target;
      const ticker = target && target !== "portfolio" && target !== "belt" ? target : null;
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
      if (target === "portfolio") callbacksRef.current.onSelectPortfolio();
      else if (target === "belt") callbacksRef.current.onSelectBelt();
      else if (target) launchRocket(target);
      else if (cameraStateRef.current !== "overview") {
        callbacksRef.current.onExitOverview();
      }
    };
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      zoomScale = Math.max(0.88, Math.min(1.18, zoomScale + Math.sign(event.deltaY) * 0.035));
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
    const render = (now: number) => {
      const delta = Math.min(0.05, (now - previousTime) / 1000);
      previousTime = now;
      const selected = selectedTickerRef.current;
      const hovered = hoveredTickerRef.current;
      const state = cameraStateRef.current;

      for (const planet of planetRuntimes) {
        const targeted =
          planet.holding.ticker === selected || planet.holding.ticker === hovered;
        if (planet.direction !== "neutral") {
          planet.orbit.rotation.y +=
            (planet.direction === "clockwise" ? -1 : 1) *
            planet.angularSpeed *
            delta;
        }
        planet.mesh.rotation.y += planet.axialSpin * delta;
        const targetScale = radiusForWeight(planet.holding.weight) * (targeted ? 1.08 : 1);
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
        planet.path.visible = state !== "approach";
        planet.mesh.getWorldPosition(worldPosition);
        projected.copy(worldPosition).project(camera);
        labelPosition
          .copy(worldPosition)
          .addScaledVector(camera.up, -planet.mesh.scale.x * 1.45)
          .project(camera);
        planet.label.style.left = `${(labelPosition.x * 0.5 + 0.5) * 100}%`;
        planet.label.style.top = `${(-labelPosition.y * 0.5 + 0.5) * 100}%`;
        planet.label.dataset.targeted = targeted ? "true" : "false";
        planet.label.hidden = projected.z > 1;
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
        selectedRuntime.mesh.getWorldPosition(worldPosition);
        cameraTarget.set(
          worldPosition.x + 2.8,
          worldPosition.y + 1.15,
          worldPosition.z + 4.2,
        );
        lookAtTarget.copy(worldPosition).add(new Vector3(0.6, 0, 0));
      } else if (state === "command") {
        cameraTarget.set(0, 3.8, 7.4);
        lookAtTarget.set(0, 0, 0);
      } else {
        cameraTarget
          .copy(overviewPosition)
          .multiplyScalar(zoomScale)
          .applyAxisAngle(new Vector3(0, 1, 0), tiltRadians);
        cameraTarget.x += pointerX * 0.12;
        lookAtTarget.set(pointerX * 0.15, pointerY * 0.08, 0);
      }
      const cameraAmount = 1 - Math.exp(-delta * (state === "approach" ? 3.7 : 5));
      camera.position.lerp(cameraTarget, cameraAmount);
      lookAt.lerp(lookAtTarget, cameraAmount);
      camera.lookAt(lookAt);

      const time = now / 1000;
      const health = healthRef.current;
      dockingRing.visible = localTarget === "portfolio";
      dockingRing.rotation.z = reducedMotion ? 0 : time * 0.16;
      sunMaterial.uniforms.uTime.value = time;
      sunMaterial.uniforms.uHealth.value = health.h;
      sunMaterial.uniforms.uSunspots.value = health.sunspotIntensity;
      const health01 = (health.h + 1) / 2;
      const pulseDepth = 0.002 + health01 * 0.012;
      const pulseRate = 0.42 + health01 * 0.95;
      const pulse = 1 + Math.sin(time * pulseRate) * pulseDepth;
      const innerBase = 1.12 + health01 * 0.22;
      const outerBase = 1.28 + health01 * 0.38;
      glowMaterialInner.opacity = 0.05 + health01 * 0.11;
      glowMaterialOuter.opacity = 0.018 + health01 * 0.055;
      glowInner.scale.setScalar(innerBase * pulse);
      glowOuter.scale.setScalar(outerBase * (2 - pulse));
      starField.rotation.y = pointerX * 0.007 + time * 0.0007;
      starField.rotation.x = pointerY * -0.005;
      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(render);
    };
    animationFrame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrame);
      cancelAnimationFrame(textureFrame);
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
      starField.geometry.dispose();
      starField.material.dispose();
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
      fallbackTexture.dispose();
      renderer.dispose();
      labelLayer.remove();
      renderer.domElement.remove();
    };
  }, [sceneKey]);

  return <div ref={mountRef} className={styles.sceneMount} aria-hidden="true" />;
}
