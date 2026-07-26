"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Fog,
  Group,
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
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import {
  angularSpeedForWeeklyReturn,
  directionForWeeklyReturn,
  radiusForWeight,
  type PublicOrreryHolding,
} from "@/lib/observatory/orrery";

const PLANET_COLORS = [
  ["#3ca98f", "#d8b35b"],
  ["#b56e42", "#f0ce75"],
  ["#477f9a", "#9de7b2"],
  ["#884b43", "#df9c62"],
  ["#657d43", "#c0d47c"],
  ["#a94f35", "#f3aa68"],
  ["#425f9f", "#8dc4d4"],
  ["#a18b5c", "#f1d997"],
  ["#65528d", "#b6a1d5"],
  ["#427e75", "#9ad8c5"],
  ["#9d6744", "#e8b87b"],
  ["#506b82", "#a9c8d7"],
  ["#8f475b", "#dea0ae"],
] as const;

const PLANET_VERTEX_SHADER = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vViewPosition;

  void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vNormal = normalize(normalMatrix * normal);
    vPosition = normalize(position);
    vViewPosition = -viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const PLANET_FRAGMENT_SHADER = `
  uniform vec3 uBase;
  uniform vec3 uAccent;
  uniform float uSeed;
  uniform float uActive;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vViewPosition;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(vViewPosition);
    vec3 lightDirection = normalize(vec3(0.7, 0.48, 1.0));
    float diffuse = 0.2 + 0.8 * max(dot(normal, lightDirection), 0.0);
    float bands = sin(
      vPosition.y * (13.0 + mod(uSeed, 5.0)) +
      sin(vPosition.x * (7.0 + mod(uSeed, 3.0))) * 2.2 +
      uSeed
    );
    float cells = sin((vPosition.x + vPosition.z) * (9.0 + mod(uSeed, 4.0)));
    float pattern = smoothstep(-0.35, 0.55, bands + cells * 0.32);
    float rim = pow(1.0 - max(dot(normal, viewDirection), 0.0), 2.25);
    vec3 surface = mix(uBase, uAccent, pattern * 0.48);
    vec3 color = surface * diffuse + uAccent * rim * (0.62 + uActive * 0.36);
    color += uAccent * uActive * 0.08;
    gl_FragColor = vec4(color, 1.0);
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
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vViewPosition;

  void main() {
    float filaments = sin(vPosition.y * 18.0 + uTime * 0.7);
    filaments += sin((vPosition.x - vPosition.z) * 13.0 - uTime * 0.45);
    float plasma = smoothstep(-0.8, 1.45, filaments);
    float rim = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewPosition)), 0.0), 1.8);
    vec3 amber = mix(vec3(0.86, 0.24, 0.035), vec3(1.0, 0.78, 0.28), plasma);
    gl_FragColor = vec4(amber + vec3(1.0, 0.56, 0.12) * rim * 0.55, 1.0);
  }
`;

type PlanetRuntime = {
  holding: PublicOrreryHolding;
  orbit: Group;
  mesh: Mesh<SphereGeometry, ShaderMaterial>;
  initialAngle: number;
  direction: ReturnType<typeof directionForWeeklyReturn>;
  angularSpeed: number;
};

function orbitRadiusForIndex(index: number): number {
  return 2.15 + index * 0.47;
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
    const radius = 10 + seededUnit(index, 1) * 18;
    const theta = seededUnit(index, 2) * Math.PI * 2;
    const phi = Math.acos(2 * seededUnit(index, 3) - 1);
    positions.push(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.sin(phi) * Math.sin(theta) * 0.7,
      radius * Math.cos(phi) - 4,
    );
    const tint = index % 17 === 0 ? amber : index % 5 === 0 ? phosphor : white;
    const intensity = 0.45 + seededUnit(index, 4) * 0.55;
    colors.push(tint.r * intensity, tint.g * intensity, tint.b * intensity);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  const material = new PointsMaterial({
    size: 0.038,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.78,
    vertexColors: true,
    depthWrite: false,
  });
  return new Points(geometry, material);
}

export default function OrreryScene({
  holdings,
  selectedTicker,
  hoveredTicker,
  onHover,
  onSelect,
  onSelectPortfolio,
}: {
  holdings: readonly PublicOrreryHolding[];
  selectedTicker: string | null;
  hoveredTicker: string | null;
  onHover: (ticker: string | null) => void;
  onSelect: (ticker: string) => void;
  onSelectPortfolio: () => void;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const selectedTickerRef = useRef(selectedTicker);
  const hoveredTickerRef = useRef(hoveredTicker);
  const onHoverRef = useRef(onHover);
  const onSelectRef = useRef(onSelect);
  const onSelectPortfolioRef = useRef(onSelectPortfolio);
  const holdingsRef = useRef(holdings);
  const holdingsKey = useMemo(
    () =>
      holdings
        .map((holding) => `${holding.ticker}:${holding.weight}:${holding.weeklyReturn ?? "na"}`)
        .join("|"),
    [holdings],
  );

  useEffect(() => {
    holdingsRef.current = holdings;
    selectedTickerRef.current = selectedTicker;
    hoveredTickerRef.current = hoveredTicker;
    onHoverRef.current = onHover;
    onSelectRef.current = onSelect;
    onSelectPortfolioRef.current = onSelectPortfolio;
  }, [holdings, hoveredTicker, onHover, onSelect, onSelectPortfolio, selectedTicker]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const sceneHoldings = holdingsRef.current;

    const scene = new Scene();
    scene.fog = new Fog("#020706", 13, 31);

    const camera = new PerspectiveCamera(43, 1, 0.1, 60);
    camera.position.set(0, 1.2, 13.5);
    const cameraTarget = new Vector3(0, 1.2, 13.5);
    const lookAt = new Vector3();
    const lookAtTarget = new Vector3();

    const renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(1);
    renderer.setClearColor("#020706", 0);
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    mount.appendChild(renderer.domElement);

    const starField = createStarField();
    scene.add(starField);

    const orbitGeometry = new RingGeometry(0.9975, 1.0025, 128);
    const orbitMaterial = new MeshBasicMaterial({
      color: "#51866c",
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
    });
    const planetGeometry = new SphereGeometry(1, 24, 16);
    const sunGeometry = new SphereGeometry(1.14, 32, 22);

    const sunMaterial = new ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: SUN_VERTEX_SHADER,
      fragmentShader: SUN_FRAGMENT_SHADER,
    });
    const sun = new Mesh(sunGeometry, sunMaterial);
    sun.userData.orreryTarget = "portfolio";
    scene.add(sun);

    const glowMaterialInner = new MeshBasicMaterial({
      color: "#f4a83f",
      transparent: true,
      opacity: 0.12,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const glowMaterialOuter = glowMaterialInner.clone();
    glowMaterialOuter.opacity = 0.045;
    const glowInner = new Mesh(sunGeometry, glowMaterialInner);
    const glowOuter = new Mesh(sunGeometry, glowMaterialOuter);
    glowInner.scale.setScalar(1.2);
    glowOuter.scale.setScalar(1.48);
    scene.add(glowInner, glowOuter);

    const planetRuntimes: PlanetRuntime[] = sceneHoldings.map((holding, index) => {
      const orbitRadius = orbitRadiusForIndex(index);
      const initialAngle = index * 2.399963;
      const tiltX = ((index % 5) - 2) * 0.055;
      const tiltY = ((index % 3) - 1) * 0.045;
      const plane = new Group();
      plane.rotation.set(tiltX, tiltY, 0);

      const path = new Mesh(orbitGeometry, orbitMaterial);
      path.scale.setScalar(orbitRadius);
      plane.add(path);

      const orbit = new Group();
      orbit.rotation.z = initialAngle;
      const palette = PLANET_COLORS[index % PLANET_COLORS.length];
      const material = new ShaderMaterial({
        uniforms: {
          uBase: { value: new Color(palette[0]) },
          uAccent: { value: new Color(palette[1]) },
          uSeed: { value: index * 1.73 + 0.4 },
          uActive: { value: 0 },
        },
        vertexShader: PLANET_VERTEX_SHADER,
        fragmentShader: PLANET_FRAGMENT_SHADER,
      });
      const planet = new Mesh(planetGeometry, material);
      const radius = radiusForWeight(holding.weight);
      planet.position.set(orbitRadius, 0, 0);
      planet.scale.setScalar(radius);
      planet.userData.orreryTarget = holding.ticker;
      orbit.add(planet);
      plane.add(orbit);
      scene.add(plane);

      return {
        holding,
        orbit,
        mesh: planet,
        initialAngle,
        direction: directionForWeeklyReturn(holding.weeklyReturn),
        angularSpeed: angularSpeedForWeeklyReturn(holding.weeklyReturn),
      };
    });

    const raycaster = new Raycaster();
    const pointer = new Vector2(2, 2);
    const pickTargets: Mesh[] = [sun, ...planetRuntimes.map((planet) => planet.mesh)];
    let localHovered: string | null = null;
    let pointerX = 0;
    let pointerY = 0;

    const readPointer = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      pointerX = pointer.x;
      pointerY = pointer.y;
    };
    const pick = () => {
      raycaster.setFromCamera(pointer, camera);
      const target = raycaster.intersectObjects(pickTargets, false)[0]?.object.userData
        .orreryTarget as string | undefined;
      const ticker = target && target !== "portfolio" ? target : null;
      if (ticker !== localHovered) {
        localHovered = ticker;
        onHoverRef.current(ticker);
      }
      renderer.domElement.style.cursor = target ? "pointer" : "default";
      return target;
    };
    const onPointerMove = (event: PointerEvent) => {
      readPointer(event);
      pick();
    };
    const onPointerLeave = () => {
      pointer.set(2, 2);
      localHovered = null;
      onHoverRef.current(null);
      renderer.domElement.style.cursor = "default";
    };
    const onClick = (event: MouseEvent) => {
      readPointer(event as PointerEvent);
      const target = pick();
      if (target === "portfolio") onSelectPortfolioRef.current();
      else if (target) onSelectRef.current(target);
    };
    renderer.domElement.addEventListener("pointermove", onPointerMove, { passive: true });
    renderer.domElement.addEventListener("pointerleave", onPointerLeave);
    renderer.domElement.addEventListener("click", onClick);

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

      for (const planet of planetRuntimes) {
        const stabilized =
          planet.holding.ticker === selected || planet.holding.ticker === hovered;
        if (stabilized) {
          const amount = 1 - Math.exp(-delta * 7);
          planet.orbit.rotation.z +=
            (planet.initialAngle - planet.orbit.rotation.z) * amount;
        } else if (planet.direction !== "neutral") {
          planet.orbit.rotation.z +=
            (planet.direction === "clockwise" ? -1 : 1) * planet.angularSpeed * delta;
        }
        const baseRadius = radiusForWeight(planet.holding.weight);
        const targetScale = baseRadius * (stabilized ? 1.08 : 1);
        const nextScale =
          planet.mesh.scale.x + (targetScale - planet.mesh.scale.x) * (1 - Math.exp(-delta * 9));
        planet.mesh.scale.setScalar(nextScale);
        planet.mesh.material.uniforms.uActive.value +=
          ((stabilized ? 1 : 0) - planet.mesh.material.uniforms.uActive.value) *
          (1 - Math.exp(-delta * 8));
      }

      const selectedIndex = sceneHoldings.findIndex((holding) => holding.ticker === selected);
      if (selectedIndex < 0) {
        cameraTarget.set(pointerX * 0.16, 1.2 + pointerY * 0.1, 13.5);
        lookAtTarget.set(pointerX * 0.18, pointerY * 0.12, 0);
      } else {
        const radius = orbitRadiusForIndex(selectedIndex);
        const angle = selectedIndex * 2.399963;
        cameraTarget.set(
          Math.cos(angle) * radius * 0.2 + pointerX * 0.08,
          Math.sin(angle) * radius * 0.12 + pointerY * 0.06,
          9.6,
        );
        lookAtTarget.set(
          Math.cos(angle) * radius * 0.42,
          Math.sin(angle) * radius * 0.25,
          0,
        );
      }
      const cameraAmount = 1 - Math.exp(-delta * 4.8);
      camera.position.lerp(cameraTarget, cameraAmount);
      lookAt.lerp(lookAtTarget, cameraAmount);
      camera.lookAt(lookAt);

      const time = now / 1000;
      sunMaterial.uniforms.uTime.value = time;
      const pulse = 1 + Math.sin(time * 1.35) * 0.012;
      glowInner.scale.setScalar(1.2 * pulse);
      glowOuter.scale.setScalar(1.48 * (2 - pulse));
      starField.rotation.y = pointerX * 0.006 + time * 0.0007;
      starField.rotation.x = pointerY * -0.004;

      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(render);
    };
    animationFrame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerleave", onPointerLeave);
      renderer.domElement.removeEventListener("click", onClick);
      for (const planet of planetRuntimes) planet.mesh.material.dispose();
      starField.geometry.dispose();
      starField.material.dispose();
      orbitGeometry.dispose();
      orbitMaterial.dispose();
      planetGeometry.dispose();
      sunGeometry.dispose();
      sunMaterial.dispose();
      glowMaterialInner.dispose();
      glowMaterialOuter.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
    // holdingsKey deliberately represents every scene-construction input.
    // Callback and selection changes are read through refs without rebuilding WebGL.
  }, [holdingsKey]);

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} aria-hidden="true" />;
}
