import { memo, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronDown, ChevronUp, RotateCcw, Settings, User, Zap } from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { VMS_WORKSPACE_PRESETS, useVms } from '@/context/VmsContext';
import type { ThemeMode } from '@/hooks/useTheme';
import { HERO_OVERVIEW_CAMERA, getPartFocusPreset } from '@/utils/stagePhysics';
import {
  createInterpolatedThemeBuffer,
  interpolateSceneTheme,
  resolveLiveTheme,
} from '@/utils/themeSceneConfig';
import {
  FINISH_PRESETS,
  type FinishId,
  type MaterialBundle,
  applyFinishPreset,
  applyInterpolatedThemeToMaterials,
  createSurveillanceMaterials,
  disposeMaterialBundle,
  drawBriefCamCanvas,
  drawSmartClientAuxCanvas,
  drawSmartClientPrimaryCanvas,
} from './materials';
import { type InspectablePartInfo, buildSurveillanceAssembly } from './surveillanceModel';
import { BriefCamOverlay } from './BriefCamModules';

type CameraPresetId = 'workstation' | 'smart-client' | 'rack';

interface CameraPreset {
  id: CameraPresetId;
  label: string;
  position: [number, number, number];
  target: [number, number, number];
}

const CAMERA_PRESETS: readonly CameraPreset[] = [
  {
    id: 'workstation',
    label: 'Overview',
    position: HERO_OVERVIEW_CAMERA.position,
    target: HERO_OVERVIEW_CAMERA.target,
  },
  {
    id: 'smart-client',
    label: 'Smart Client',
    position: [0.0, 1.32, 1.55],
    target: [0.0, 1.3, -0.3],
  },
  {
    id: 'rack',
    label: 'Rack & Deck',
    position: [1.75, 1.0, 2.3],
    target: [1.5, 0.6, 0.1],
  },
];

const DEFAULT_PART_INFO: InspectablePartInfo = {
  id: 'xprotect-vms',
  label: 'Milestone XProtect VMS + BriefCam L4',
  spec: 'Drag to look around · Click any monitor, deck or rack unit to zoom in',
};

const SurveillanceFilmShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uResolutionY: { value: 900 },
    uGrainIntensity: { value: 0.032 },
    uScanlineIntensity: { value: 0.045 },
    uVignetteDarkness: { value: 0.42 },
    uVignetteColor: { value: new THREE.Color(0x0b1018) },
    uChromaticAmount: { value: 0.0022 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uResolutionY;
    uniform float uGrainIntensity;
    uniform float uScanlineIntensity;
    uniform float uVignetteDarkness;
    uniform vec3 uVignetteColor;
    uniform float uChromaticAmount;
    varying vec2 vUv;

    float rand(vec2 co) {
      return fract(sin(dot(co.xy, vec2(12.9898, 78.233)) + uTime * 3.17) * 43758.5453);
    }

    void main() {
      vec2 centered = vUv - 0.5;
      float dist = length(centered);

      // Subtle optical edge chromatic aberration
      float shift = dist * uChromaticAmount;
      float r = texture2D(tDiffuse, vUv + vec2(shift, 0.0)).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - vec2(shift, 0.0)).b;
      vec3 color = vec3(r, g, b);

      // Scanlines
      float scan = sin(vUv.y * uResolutionY * 0.85) * 0.5 + 0.5;
      color *= 1.0 - uScanlineIntensity * (1.0 - scan);

      // Film grain
      float noise = (rand(vUv * 400.0) - 0.5) * uGrainIntensity;
      color += noise;

      // Vignette blends seamlessly into the active site background color
      float vig = smoothstep(0.88, 0.34, dist);
      color = mix(color, uVignetteColor, (1.0 - vig) * uVignetteDarkness);

      gl_FragColor = vec4(max(color, 0.0), 1.0);
    }
  `,
};

const _targetCamPos = new THREE.Vector3();
const _targetLook = new THREE.Vector3();
const _pointer = new THREE.Vector2();
const _themeBuffer = createInterpolatedThemeBuffer();

interface WebGLCapability {
  supported: boolean;
  isSoftwareGl: boolean;
}

let cachedWebGLCapability: WebGLCapability | null = null;

function getWebGLCapability(): WebGLCapability {
  if (cachedWebGLCapability) return cachedWebGLCapability;
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    if (!gl) {
      cachedWebGLCapability = { supported: false, isSoftwareGl: true };
      return cachedWebGLCapability;
    }
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) ?? '');
    const isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    cachedWebGLCapability = { supported: true, isSoftwareGl };
    return cachedWebGLCapability;
  } catch {
    cachedWebGLCapability = { supported: false, isSoftwareGl: true };
    return cachedWebGLCapability;
  }
}

interface SurveillanceStage3DProps {
  theme: ThemeMode;
  forceTheme?: ThemeMode;
}

export const SurveillanceStage3D = memo(function SurveillanceStage3D({
  theme,
  forceTheme,
}: SurveillanceStage3DProps) {
  const { viewMode, activeSiteId, selectedFeedId, setViewMode, focusSectionFromVms } = useVms();

  const stageRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);

  const [webglFailed, setWebglFailed] = useState(() => !getWebGLCapability().supported);
  const [sceneReady, setSceneReady] = useState(false);
  const [dockOpen, setDockOpen] = useState(false);
  const [explodeLevel, setExplodeLevel] = useState(0);
  const [activePreset, setActivePreset] = useState<CameraPresetId>('workstation');
  const [activeFinish, setActiveFinish] = useState<FinishId>('slate');
  const [selectedPart, setSelectedPart] = useState<InspectablePartInfo>(DEFAULT_PART_INFO);
  const [isFocusedView, setIsFocusedView] = useState(false);
  const [hoveredPartLabel, setHoveredPartLabel] = useState<string | null>(null);

  // BriefCam & Smart Client L4 state
  const [showBriefCam, setShowBriefCam] = useState(false);
  const [briefCamModule, setBriefCamModule] = useState<'review' | 'respond' | 'research'>('review');
  const [consoleTab, setConsoleTab] = useState<
    'views' | 'exports' | 'search' | 'alarms' | 'monitor'
  >('views');

  const initialResolvedTheme = forceTheme ?? resolveLiveTheme(theme);
  const explodeTargetRef = useRef(0);
  const finishRef = useRef<FinishId>('slate');
  const forceThemeRef = useRef<ThemeMode | undefined>(forceTheme);
  const themeRef = useRef<ThemeMode>(initialResolvedTheme);
  const screenStateRef = useRef({
    mode: viewMode,
    siteId: activeSiteId,
    feedId: selectedFeedId,
    theme: initialResolvedTheme,
  });
  const materialsRef = useRef<MaterialBundle | null>(null);
  const presetFlightRef = useRef<{
    active: boolean;
    position: [number, number, number];
    target: [number, number, number];
  }>({
    active: false,
    position: HERO_OVERVIEW_CAMERA.position,
    target: HERO_OVERVIEW_CAMERA.target,
  });
  const focusedModeRef = useRef(false);
  const hoveredPartIdRef = useRef<string | null>(null);

  const applyThemeCallbackRef = useRef<((nextTheme: ThemeMode) => void) | null>(null);
  const applyFinishCallbackRef = useRef<((nextFinish: FinishId) => void) | null>(null);
  const requestRenderRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    explodeTargetRef.current = explodeLevel;
    requestRenderRef.current?.();
  }, [explodeLevel]);

  useEffect(() => {
    finishRef.current = activeFinish;
    applyFinishCallbackRef.current?.(activeFinish);
  }, [activeFinish]);

  useEffect(() => {
    forceThemeRef.current = forceTheme;
    const resolved = forceTheme ?? resolveLiveTheme(theme);
    themeRef.current = resolved;
    applyThemeCallbackRef.current?.(resolved);
  }, [forceTheme, theme]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const syncLiveTheme = () => {
      const nextTheme = forceThemeRef.current ?? resolveLiveTheme(themeRef.current);
      if (nextTheme !== themeRef.current) {
        themeRef.current = nextTheme;
        applyThemeCallbackRef.current?.(nextTheme);
        screenStateRef.current = {
          ...screenStateRef.current,
          theme: nextTheme,
        };
        const bundle = materialsRef.current;
        if (bundle) {
          drawSmartClientPrimaryCanvas(bundle.primaryCanvas, screenStateRef.current);
          bundle.primaryTexture.needsUpdate = true;
          drawSmartClientAuxCanvas(bundle.auxCanvas, screenStateRef.current);
          bundle.auxTexture.needsUpdate = true;
          drawBriefCamCanvas(bundle.briefcamCanvas, screenStateRef.current);
          bundle.briefcamTexture.needsUpdate = true;
        }
        requestRenderRef.current?.();
      }
    };
    const rootObserver = new MutationObserver(syncLiveTheme);
    rootObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    });
    const mediaQuery =
      typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-color-scheme: light)')
        : null;
    mediaQuery?.addEventListener('change', syncLiveTheme);
    return () => {
      rootObserver.disconnect();
      mediaQuery?.removeEventListener('change', syncLiveTheme);
    };
  }, []);

  useEffect(() => {
    const resolvedTheme = forceTheme ?? resolveLiveTheme(theme);
    screenStateRef.current = {
      mode: viewMode,
      siteId: activeSiteId,
      feedId: selectedFeedId,
      theme: resolvedTheme,
    };
    const bundle = materialsRef.current;
    if (!bundle) return;
    drawSmartClientPrimaryCanvas(bundle.primaryCanvas, screenStateRef.current);
    bundle.primaryTexture.needsUpdate = true;
    drawSmartClientAuxCanvas(bundle.auxCanvas, screenStateRef.current);
    bundle.auxTexture.needsUpdate = true;
    drawBriefCamCanvas(bundle.briefcamCanvas, screenStateRef.current);
    bundle.briefcamTexture.needsUpdate = true;
    requestRenderRef.current?.();
  }, [activeSiteId, forceTheme, selectedFeedId, theme, viewMode]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      ) {
        return;
      }
      if (event.key.toLowerCase() === 'h') {
        setDockOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let isDisposed = false;
    const { supported, isSoftwareGl } = getWebGLCapability();
    if (!supported) {
      queueMicrotask(() => {
        if (!isDisposed) setWebglFailed(true);
      });
      return;
    }

    const isLowCoreDevice =
      typeof navigator !== 'undefined' &&
      typeof navigator.hardwareConcurrency === 'number' &&
      navigator.hardwareConcurrency <= 2;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      queueMicrotask(() => {
        if (!isDisposed) setWebglFailed(true);
      });
      return;
    }

    let currentThemeMix = themeRef.current === 'light' ? 1 : 0;
    let targetThemeMix = currentThemeMix;
    interpolateSceneTheme(currentThemeMix, _themeBuffer);

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = _themeBuffer.toneMappingExposure;
    const pixelRatio = isSoftwareGl
      ? 1
      : Math.min(Math.max(window.devicePixelRatio || 1, 1), isLowCoreDevice ? 1.5 : 2);
    renderer.setPixelRatio(pixelRatio);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(_themeBuffer.background, 1);

    const width = Math.max(320, mount.clientWidth || window.innerWidth);
    const height = Math.max(320, mount.clientHeight || window.innerHeight);
    renderer.setSize(width, height);

    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'pan-y';

    const scene = new THREE.Scene();
    scene.background = _themeBuffer.background.clone();
    scene.fog = new THREE.FogExp2(_themeBuffer.fog.getHex(), _themeBuffer.fogDensity);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    scene.environmentIntensity = _themeBuffer.environmentIntensity;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 45);
    camera.position.set(...HERO_OVERVIEW_CAMERA.position);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(...HERO_OVERVIEW_CAMERA.target);
    // The scene is static: it only moves when the visitor drags or picks a camera preset.
    // No inertia, no auto-rotation, and the view is limited to the front of the desk.
    controls.enableDamping = false;
    controls.enablePan = false;
    controls.enableZoom = false; // Keep normal page scroll smooth; camera preset clicks handle zoom
    controls.minDistance = 1.1;
    controls.maxDistance = 6.5;
    controls.minPolarAngle = 0.45;
    controls.maxPolarAngle = Math.PI * 0.5;
    controls.minAzimuthAngle = -0.6;
    controls.maxAzimuthAngle = 1.5;
    controls.update();

    const onControlStart = () => {
      presetFlightRef.current.active = false;
      focusedModeRef.current = true;
      setIsFocusedView(true);
    };

    controls.addEventListener('start', onControlStart);

    // Adaptive Lighting Rig (Dark Command Room <-> Light Architectural Studio)
    const hemiLight = new THREE.HemisphereLight(
      _themeBuffer.hemiSky.getHex(),
      _themeBuffer.hemiGround.getHex(),
      _themeBuffer.hemiIntensity,
    );
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(
      _themeBuffer.keyLight.getHex(),
      _themeBuffer.keyLightIntensity,
    );
    keyLight.position.set(4.2, 5.6, 4.4);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 16;
    keyLight.shadow.camera.left = -3.2;
    keyLight.shadow.camera.right = 3.2;
    keyLight.shadow.camera.top = 3.2;
    keyLight.shadow.camera.bottom = -3.2;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const cyanRimLight = new THREE.DirectionalLight(
      _themeBuffer.rimLight.getHex(),
      _themeBuffer.rimLightIntensity,
    );
    cyanRimLight.position.set(-4.2, 3.0, -3.6);
    scene.add(cyanRimLight);

    const screenBounceLight = new THREE.PointLight(
      _themeBuffer.screenBounce.getHex(),
      _themeBuffer.screenBounceIntensity,
      5.2,
    );
    screenBounceLight.position.set(0.0, 1.4, 0.85);
    scene.add(screenBounceLight);

    const warmDeskAccentLight = new THREE.PointLight(
      _themeBuffer.warmAccent.getHex(),
      _themeBuffer.warmAccentIntensity,
      4.2,
    );
    warmDeskAccentLight.position.set(0.75, 0.65, 0.95);
    scene.add(warmDeskAccentLight);

    let softboxLight: THREE.RectAreaLight | null = null;
    if (!isSoftwareGl) {
      RectAreaLightUniformsLib.init();
      softboxLight = new THREE.RectAreaLight(
        _themeBuffer.softbox.getHex(),
        _themeBuffer.softboxIntensity,
        3.6,
        1.6,
      );
      softboxLight.position.set(-2.4, 3.6, 2.8);
      softboxLight.lookAt(0, 1.0, 0);
      scene.add(softboxLight);
    }

    const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const materials = createSurveillanceMaterials(
      isSoftwareGl,
      maxAniso,
      finishRef.current,
      screenStateRef.current,
    );
    materialsRef.current = materials;

    const assembly = buildSurveillanceAssembly(materials);
    scene.add(assembly.root);

    // Post-Processing Composer (Bloom + Scanline/Film Grain + Vignette + OutputPass) on GPU
    let composer: EffectComposer | null = null;
    let bloomPass: UnrealBloomPass | null = null;
    let filmPass: ShaderPass | null = null;

    if (!isSoftwareGl && !isLowCoreDevice) {
      composer = new EffectComposer(renderer);
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);

      bloomPass = new UnrealBloomPass(
        new THREE.Vector2(width, height),
        _themeBuffer.bloomStrength,
        _themeBuffer.bloomRadius,
        _themeBuffer.bloomThreshold,
      );
      composer.addPass(bloomPass);

      filmPass = new ShaderPass(SurveillanceFilmShader);
      const resUniform = filmPass.material.uniforms.uResolutionY;
      if (resUniform) {
        resUniform.value = height;
      }
      composer.addPass(filmPass);

      const outputPass = new OutputPass();
      composer.addPass(outputPass);
    }

    const renderScene = () => {
      if (composer) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }
    };

    const applySceneThemeMix = (mix: number) => {
      const state = interpolateSceneTheme(mix, _themeBuffer);
      renderer.setClearColor(state.background, 1);
      renderer.toneMappingExposure = state.toneMappingExposure;

      if (scene.background instanceof THREE.Color) {
        scene.background.copy(state.background);
      }
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.copy(state.fog);
        scene.fog.density = state.fogDensity;
      }
      scene.environmentIntensity = state.environmentIntensity;

      hemiLight.color.copy(state.hemiSky);
      hemiLight.groundColor.copy(state.hemiGround);
      hemiLight.intensity = state.hemiIntensity;

      keyLight.color.copy(state.keyLight);
      keyLight.intensity = state.keyLightIntensity;

      cyanRimLight.color.copy(state.rimLight);
      cyanRimLight.intensity = state.rimLightIntensity;

      screenBounceLight.color.copy(state.screenBounce);
      screenBounceLight.intensity = state.screenBounceIntensity;

      warmDeskAccentLight.color.copy(state.warmAccent);
      warmDeskAccentLight.intensity = state.warmAccentIntensity;

      if (softboxLight) {
        softboxLight.color.copy(state.softbox);
        softboxLight.intensity = state.softboxIntensity;
      }


      if (bloomPass) {
        bloomPass.strength = state.bloomStrength;
        bloomPass.threshold = state.bloomThreshold;
        bloomPass.radius = state.bloomRadius;
      }

      if (filmPass) {
        const uGrain = filmPass.material.uniforms.uGrainIntensity;
        if (uGrain) uGrain.value = state.grainIntensity;
        const uScan = filmPass.material.uniforms.uScanlineIntensity;
        if (uScan) uScan.value = state.scanlineIntensity;
        const uVig = filmPass.material.uniforms.uVignetteDarkness;
        if (uVig) uVig.value = state.vignetteDarkness;
        const uChroma = filmPass.material.uniforms.uChromaticAmount;
        if (uChroma) uChroma.value = state.chromaticAmount;
        const uVigColor = filmPass.material.uniforms.uVignetteColor;
        if (uVigColor && uVigColor.value instanceof THREE.Color) {
          uVigColor.value.copy(state.background);
        }
      }

      applyInterpolatedThemeToMaterials(materials, state);

      assembly.hoverMaterial.color.copy(state.hover);
      for (const h of assembly.hoverHighlights) {
        const ringMat = h.ring.material as THREE.LineBasicMaterial;
        ringMat.color.copy(state.hover);
      }
    };

    applySceneThemeMix(currentThemeMix);

    applyThemeCallbackRef.current = (nextTheme: ThemeMode) => {
      if (isDisposed) return;
      targetThemeMix = nextTheme === 'light' ? 1 : 0;
      requestRender();
    };

    applyFinishCallbackRef.current = (nextFinish: FinishId) => {
      if (isDisposed) return;
      applyFinishPreset(materials, nextFinish);
      applyInterpolatedThemeToMaterials(
        materials,
        interpolateSceneTheme(currentThemeMix, _themeBuffer),
      );
      renderScene();
    };

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);

    let lastHoverCheck = 0;
    let pointerDownX = 0;
    let pointerDownY = 0;

    const updatePointer = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      _pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      _pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerDown = (event: PointerEvent) => {
      pointerDownX = event.clientX;
      pointerDownY = event.clientY;
    };

    const onPointerUp = (event: PointerEvent) => {
      const moved = Math.hypot(event.clientX - pointerDownX, event.clientY - pointerDownY);
      if (moved > 6) return;

      updatePointer(event);
      raycaster.setFromCamera(_pointer, camera);
      const hits = raycaster.intersectObjects(assembly.clickableTargets, true);
      const hitInfo = hits[0]?.object.userData.partInfo as InspectablePartInfo | undefined;

      if (hitInfo) {
        setSelectedPart(hitInfo);
        if (hitInfo.vmsMode) {
          setViewMode(hitInfo.vmsMode, { scrollToSection: false });
        }
        // Glide & zoom camera smoothly to clicked part
        const focusPreset = getPartFocusPreset(hitInfo.id);
        presetFlightRef.current = {
          active: true,
          position: focusPreset.position,
          target: focusPreset.target,
        };
        focusedModeRef.current = true;
        setIsFocusedView(true);
        requestRender();
      }
    };

    const onWindowPointerMove = (event: PointerEvent) => {
      const now = performance.now();
      if (now - lastHoverCheck < 45) return;
      lastHoverCheck = now;

      const rect = renderer.domElement.getBoundingClientRect();
      const insideCanvas =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      if (!insideCanvas) return;

      updatePointer(event);
      raycaster.setFromCamera(_pointer, camera);
      const hits = raycaster.intersectObjects(assembly.clickableTargets, true);
      const hitInfo = hits[0]?.object.userData.partInfo as InspectablePartInfo | undefined;

      if (hitInfo) {
        renderer.domElement.style.cursor = 'pointer';
        if (hoveredPartIdRef.current !== hitInfo.id) {
          hoveredPartIdRef.current = hitInfo.id;
          setHoveredPartLabel(hitInfo.label);
        }
      } else {
        renderer.domElement.style.cursor = 'grab';
        if (hoveredPartIdRef.current !== null) {
          hoveredPartIdRef.current = null;
          setHoveredPartLabel(null);
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointermove', onWindowPointerMove, { passive: true });

    const onContextLost = (event: Event) => {
      event.preventDefault();
      isVisible = false;
    };

    const onContextRestored = () => {
      if (isDisposed) return;
      isVisible = true;
      requestRender();
    };

    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

    let frameId = 0;
    let frameRequested = false;
    let isRenderingTick = false;
    let currentExplode = 0;
    let lastTickTime = performance.now();
    let elapsed = 0;
    let lastScreenDraw = -1;
    let isVisible = true;
    let isTabVisible = !document.hidden;
    let notifiedReady = false;

    // Static scene: only redraw when something actually changed (camera, theme, hover, screens)
    let dirty = true;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      let polls = 0;
      const poll = () => {
        if (isDisposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        polls += 1;
        const state = sync ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : gl.SIGNALED;
        if (state === gl.UNSIGNALED && polls < 10) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function requestRender(fromLoop = false) {
      if (!fromLoop) dirty = true;
      if (isDisposed || !isVisible || !isTabVisible || frameRequested || isRenderingTick) return;
      frameRequested = true;
      if (isSoftwareGl) {
        afterDraw(() => {
          frameRequested = false;
          tick();
        });
      } else {
        frameId = requestAnimationFrame(() => {
          frameRequested = false;
          tick();
        });
      }
    }

    requestRenderRef.current = requestRender;

    const onControlChange = () => {
      requestRender();
    };
    controls.addEventListener('change', onControlChange);

    const resizeObserver = new ResizeObserver(() => {
      if (isDisposed) return;
      const nextWidth = Math.max(300, mount.clientWidth);
      const nextHeight = Math.max(300, mount.clientHeight);
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
      composer?.setSize(nextWidth, nextHeight);
      const nextResUniform = filmPass?.material.uniforms.uResolutionY;
      if (nextResUniform) {
        nextResUniform.value = nextHeight;
      }
      requestRender();
    });
    resizeObserver.observe(mount);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        const nextVisible = entry?.isIntersecting ?? true;
        isVisible = nextVisible;
        if (nextVisible && !isDisposed) {
          lastTickTime = performance.now();
          requestRender();
        }
      },
      { threshold: 0.02 },
    );
    intersectionObserver.observe(mount);

    const onVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible && isVisible && !isDisposed) {
        lastTickTime = performance.now();
        requestRender();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    function tick(forceInitial = false) {
      if (isDisposed || (!forceInitial && (!isVisible || !isTabVisible))) return;
      isRenderingTick = true;

      const now = performance.now();
      const delta = Math.min(0.08, (now - lastTickTime) / 1000);
      lastTickTime = now;
      elapsed += delta;

      // Smooth ~0.5s transition between Dark & Light scene themes
      let themeChanged = false;
      if (Math.abs(currentThemeMix - targetThemeMix) > 0.0008) {
        themeChanged = true;
        currentThemeMix = THREE.MathUtils.damp(currentThemeMix, targetThemeMix, 8.0, delta);
        if (Math.abs(currentThemeMix - targetThemeMix) <= 0.0008) {
          currentThemeMix = targetThemeMix;
        }
        applySceneThemeMix(currentThemeMix);
      }

      // Explode layers
      const targetExplode = explodeTargetRef.current;
      const prevExplode = currentExplode;
      currentExplode = THREE.MathUtils.damp(currentExplode, targetExplode, 9, delta);
      if (Math.abs(currentExplode - targetExplode) < 0.001) {
        currentExplode = targetExplode;
      }
      for (const layer of assembly.explodeLayers) {
        layer.object.position.y = layer.baseY + layer.offsetY * currentExplode;
      }

      // Camera only moves for an explicit preset / part click (smooth glide), never on its own
      const flight = presetFlightRef.current;
      let needsDraw = dirty;
      dirty = false;
      if (flight.active) {
        _targetCamPos.set(...flight.position);
        _targetLook.set(...flight.target);
        const lerpAlpha = 1 - Math.exp(-5.5 * delta);
        camera.position.lerp(_targetCamPos, lerpAlpha);
        controls.target.lerp(_targetLook, lerpAlpha);
        if (
          camera.position.distanceTo(_targetCamPos) < 0.012 &&
          controls.target.distanceTo(_targetLook) < 0.012
        ) {
          camera.position.copy(_targetCamPos);
          controls.target.copy(_targetLook);
          flight.active = false;
        }
        needsDraw = true;
      }

      if (controls.update()) needsDraw = true;
      if (currentExplode !== prevExplode || themeChanged) needsDraw = true;

      // Hover outline: steady fade in/out, no pulsing
      for (const h of assembly.hoverHighlights) {
        const isHovered = h.id === hoveredPartIdRef.current;
        const mat = h.ring.material as THREE.LineBasicMaterial;
        const targetOp = isHovered ? 0.85 : 0;
        if (Math.abs(mat.opacity - targetOp) > 0.002) {
          mat.opacity = THREE.MathUtils.damp(mat.opacity, targetOp, 10, delta);
          needsDraw = true;
        } else if (mat.opacity !== targetOp) {
          mat.opacity = targetOp;
          needsDraw = true;
        }
      }

      // Screens refresh once per second (clock / timecode), they do not animate otherwise
      const screenInterval = isSoftwareGl ? 1.5 : 1;
      if (lastScreenDraw < 0 || elapsed - lastScreenDraw >= screenInterval) {
        lastScreenDraw = elapsed;
        const animState = { ...screenStateRef.current, time: elapsed };
        drawSmartClientPrimaryCanvas(materials.primaryCanvas, animState);
        materials.primaryTexture.needsUpdate = true;
        drawSmartClientAuxCanvas(materials.auxCanvas, animState);
        materials.auxTexture.needsUpdate = true;
        drawBriefCamCanvas(materials.briefcamCanvas, animState);
        materials.briefcamTexture.needsUpdate = true;
        needsDraw = true;
      }

      if (needsDraw) {
        renderScene();
      }
      isRenderingTick = false;

      if (!notifiedReady && !isDisposed) {
        notifiedReady = true;
        setSceneReady(true);
      }

      // Keep running smoothly while visible (pauses cleanly when off-screen!)
      if (isVisible && isTabVisible && !isDisposed) {
        requestRender(true);
      }
    }

    // Draw initial Frame 0 immediately so the workstation is visible as soon as the user scrolls into view
    tick(true);

    return () => {
      isDisposed = true;
      requestRenderRef.current = null;
      cancelAnimationFrame(frameId);
      window.clearTimeout(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      controls.removeEventListener('start', onControlStart);
      controls.removeEventListener('change', onControlChange);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointermove', onWindowPointerMove);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
      controls.dispose();
      envTexture.dispose();
      for (const h of assembly.hoverHighlights) {
        (h.ring.material as THREE.Material).dispose();
      }
      assembly.hoverMaterial.dispose();
      for (const geometry of assembly.geometries) {
        geometry.dispose();
      }
      materialsRef.current = null;
      disposeMaterialBundle(materials);
      composer?.dispose();
      renderer.dispose();
      mount.innerHTML = '';
    };
  }, [setViewMode]);

  const handleSelectPreset = (preset: CameraPreset) => {
    setActivePreset(preset.id);
    const isOverview = preset.id === 'workstation';
    focusedModeRef.current = !isOverview;
    setIsFocusedView(!isOverview);
    presetFlightRef.current = {
      active: true,
      position: preset.position,
      target: preset.target,
    };
    requestRenderRef.current?.();
  };

  const handleResetView = () => {
    setActivePreset('workstation');
    setSelectedPart(DEFAULT_PART_INFO);
    focusedModeRef.current = false;
    setIsFocusedView(false);
    presetFlightRef.current = {
      active: true,
      position: HERO_OVERVIEW_CAMERA.position,
      target: HERO_OVERVIEW_CAMERA.target,
    };
    requestRenderRef.current?.();
  };

  if (webglFailed) {
    return (
      <div className="stage3d-shell stage3d-shell--framed stage3d-skeleton">
        <div className="stage-skeleton-inner">
          <div className="stage-skeleton-grid" />
          <div className="stage-skeleton-console">
            <div className="stage-skeleton-screen" />
            <div className="stage-skeleton-base" />
          </div>
          <span className="stage-skeleton-label">3D XProtect Workstation · Standard Mode</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`stage3d-shell stage3d-shell--framed ${sceneReady ? 'stage3d-shell--ready' : ''}`}
      data-hovered-part={hoveredPartLabel ?? ''}
      data-testid="vms-stage-3d"
      ref={stageRef}
    >
      <div className="stage3d-mount" ref={mountRef} />
      <div aria-hidden="true" className="stage3d-scanline-film" />

      {/* BriefCam Analytics Modal Overlay */}
      {showBriefCam && (
        <BriefCamOverlay
          activeModule={briefCamModule}
          onClose={() => setShowBriefCam(false)}
          onInspectFeed={() => {
            setViewMode('live', { scrollToSection: false });
            const smartClientPreset = CAMERA_PRESETS.find((preset) => preset.id === 'smart-client');
            if (smartClientPreset) {
              handleSelectPreset(smartClientPreset);
            }
          }}
          onSelectModule={setBriefCamModule}
        />
      )}

      {/* Top-Right Edge HUD: Toolbar + Focused Part Telemetry */}
      <div className="stage3d-edge-top-right">
        <div className="stage3d-top-toolbars">
          <div className="stage3d-standard-tabs">
            {(['views', 'exports', 'search', 'alarms', 'monitor'] as const).map((tab) => (
              <button
                aria-pressed={consoleTab === tab}
                key={tab}
                className={`stage3d-client-tab ${consoleTab === tab ? 'stage3d-client-tab--active' : ''}`}
                onClick={() => {
                  setConsoleTab(tab);
                  if (tab === 'alarms') setViewMode('alarms');
                  else if (tab === 'search') setViewMode('playback');
                  else setViewMode('live');
                }}
                type="button"
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="stage3d-global-toolbar">
            {isFocusedView ? (
              <button
                className="stage3d-spec-action"
                data-testid="vms-reset-view"
                onClick={handleResetView}
                type="button"
              >
                <RotateCcw aria-hidden="true" size={12} /> Reset View
              </button>
            ) : null}
            <button
              aria-label="BriefCam Video Content Analytics Plugin"
              className="icon-button briefcam-plugin-btn"
              onClick={() => setShowBriefCam(true)}
              title="BriefCam Video Content Analytics Plugin"
              type="button"
            >
              <Zap aria-hidden="true" size={15} />
              <span aria-hidden="true" className="briefcam-badge-dot" />
            </button>
            <button
              aria-label="Operator profile readout"
              className="icon-button"
              onClick={() =>
                setSelectedPart({
                  id: 'operator-profile',
                  label: 'Operator: Sumit Anand · Gate Control & Surveillance',
                  spec: 'Flipkart Kalash Mega Hub · Milestone XProtect Smart Client',
                  sectionId: 'about',
                  actionLabel: 'Operator Profile',
                })
              }
              title="Operator Profile"
              type="button"
            >
              <User aria-hidden="true" size={15} />
            </button>
            <button
              aria-label="Toggle 3D workstation control dock"
              className="icon-button"
              onClick={() => setDockOpen((prev) => !prev)}
              title="Workstation Controls (H)"
              type="button"
            >
              <Settings aria-hidden="true" size={15} />
            </button>
          </div>
        </div>

        <div className="stage3d-spec-badge">
          <div className="stage3d-spec-row">
            <span className="stage3d-spec-title">
              {hoveredPartLabel ? `Hover: ${hoveredPartLabel}` : selectedPart.label}
            </span>
            {selectedPart.sectionId && selectedPart.actionLabel ? (
              <button
                className="stage3d-spec-action"
                onClick={() => focusSectionFromVms(selectedPart.sectionId!, selectedPart.vmsMode)}
                type="button"
              >
                {selectedPart.actionLabel}
                <ArrowUpRight aria-hidden="true" size={12} />
              </button>
            ) : null}
          </div>
          <span className="stage3d-spec-sub">{selectedPart.spec}</span>
        </div>
      </div>

      {/* Collapsible 3D Inspector Dock pushed cleanly to bottom-right edge */}
      <div className={`stage3d-dock-wrap ${dockOpen ? '' : 'stage3d-dock-wrap--collapsed'}`}>
        <button
          aria-expanded={dockOpen}
          aria-label={dockOpen ? 'Hide 3D workstation controls' : 'Show 3D workstation controls'}
          className="stage3d-dock-toggle"
          onClick={() => setDockOpen((open) => !open)}
          title="Toggle 3D controls (H)"
          type="button"
        >
          {dockOpen ? (
            <>
              <ChevronDown aria-hidden="true" size={14} /> Hide 3D Controls
            </>
          ) : (
            <>
              <ChevronUp aria-hidden="true" size={14} /> 3D Lab Controls
            </>
          )}
        </button>

        {dockOpen ? (
          <div className="stage3d-dock" role="toolbar" aria-label="XProtect VMS 3D controls">
            <div className="stage3d-group" role="group" aria-label="XProtect workspace mode">
              {VMS_WORKSPACE_PRESETS.map((preset) => (
                <button
                  aria-pressed={viewMode === preset.id}
                  className={
                    viewMode === preset.id ? 'stage3d-pill stage3d-pill--active' : 'stage3d-pill'
                  }
                  key={preset.id}
                  onClick={() => setViewMode(preset.id, { scrollToSection: false })}
                  title={preset.statusNote}
                  type="button"
                >
                  {preset.shortLabel}
                </button>
              ))}
            </div>

            <label className="stage3d-slider-group">
              <span>Explode</span>
              <input
                aria-label="Explode VMS rack and display layers"
                aria-valuetext={`${Math.round(explodeLevel * 100)}% exploded`}
                max={1}
                min={0}
                onChange={(event) => setExplodeLevel(Number(event.target.value))}
                step={0.01}
                type="range"
                value={explodeLevel}
              />
            </label>

            <div className="stage3d-group" role="group" aria-label="Camera views">
              {CAMERA_PRESETS.map((preset) => (
                <button
                  aria-pressed={activePreset === preset.id}
                  className={
                    activePreset === preset.id
                      ? 'stage3d-pill stage3d-pill--active'
                      : 'stage3d-pill'
                  }
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  type="button"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="stage3d-group" role="group" aria-label="Workstation finish">
              {(Object.keys(FINISH_PRESETS) as FinishId[]).map((finishId) => {
                const preset = FINISH_PRESETS[finishId];
                return (
                  <button
                    aria-label={`Select workstation finish: ${preset.label}`}
                    aria-pressed={activeFinish === finishId}
                    className={
                      activeFinish === finishId
                        ? 'stage3d-swatch stage3d-swatch--active'
                        : 'stage3d-swatch'
                    }
                    key={finishId}
                    onClick={() => setActiveFinish(finishId)}
                    style={{ backgroundColor: preset.swatch }}
                    title={preset.label}
                    type="button"
                  />
                );
              })}
            </div>

            <button
              aria-label="Reset 3D workstation view"
              className="stage3d-reset-btn"
              onClick={handleResetView}
              title="Reset view"
              type="button"
            >
              <RotateCcw aria-hidden="true" size={14} />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
});
