import { memo, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronDown, ChevronUp, RotateCcw, Settings, User, Zap } from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { VMS_WORKSPACE_PRESETS, useVms } from '@/context/VmsContext';
import type { ThemeMode } from '@/hooks/useTheme';
import {
  FINISH_PRESETS,
  type FinishId,
  type MaterialBundle,
  applyFinishPreset,
  createSurveillanceMaterials,
  disposeMaterialBundle,
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
    label: 'Workstation',
    position: [3.55, 2.42, 4.2],
    target: [0.06, 0.78, 0.02],
  },
  {
    id: 'smart-client',
    label: 'Smart Client',
    position: [-0.15, 1.38, 2.35],
    target: [0.08, 1.24, -0.08],
  },
  {
    id: 'rack',
    label: 'Rack & Deck',
    position: [1.85, 0.95, 2.5],
    target: [0.04, 0.42, 0.14],
  },
];

const DEFAULT_PART_INFO: InspectablePartInfo = {
  id: 'xprotect-vms',
  label: 'Milestone XProtect VMS + BriefCam L4',
  spec: 'Drag to orbit · Scroll to zoom · Click BriefCam Analytics plugin for Video Synopsis & BI',
};

const _targetCamPos = new THREE.Vector3();
const _targetLook = new THREE.Vector3();
const _pointer = new THREE.Vector2();

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
}

export const SurveillanceStage3D = memo(function SurveillanceStage3D({
  theme,
}: SurveillanceStage3DProps) {
  const { viewMode, activeSiteId, selectedFeedId, setViewMode, focusSectionFromVms } = useVms();

  const stageRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);

  const [webglFailed, setWebglFailed] = useState(() => !getWebGLCapability().supported);
  const [dockOpen, setDockOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth > 640 : true,
  );
  const [explodeLevel, setExplodeLevel] = useState(0);
  const [activePreset, setActivePreset] = useState<CameraPresetId>('workstation');
  const [activeFinish, setActiveFinish] = useState<FinishId>('slate');
  const [selectedPart, setSelectedPart] = useState<InspectablePartInfo>(DEFAULT_PART_INFO);

  // BriefCam & Smart Client L4 state
  const [showBriefCam, setShowBriefCam] = useState(false);
  const [briefCamModule, setBriefCamModule] = useState<'review' | 'respond' | 'research'>('review');
  const [consoleTab, setConsoleTab] = useState<'views' | 'exports' | 'search' | 'alarms' | 'monitor'>('views');

  const explodeTargetRef = useRef(0);
  const finishRef = useRef<FinishId>('slate');
  const themeRef = useRef<ThemeMode>(theme);
  const screenStateRef = useRef({
    mode: viewMode,
    siteId: activeSiteId,
    feedId: selectedFeedId,
    theme,
  });
  const materialsRef = useRef<MaterialBundle | null>(null);
  const presetFlightRef = useRef<{
    active: boolean;
    position: [number, number, number];
    target: [number, number, number];
  }>({
    active: false,
    position: CAMERA_PRESETS[0]?.position ?? [3.55, 2.42, 4.2],
    target: CAMERA_PRESETS[0]?.target ?? [0.06, 0.78, 0.02],
  });

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
    themeRef.current = theme;
    applyThemeCallbackRef.current?.(theme);
  }, [theme]);

  useEffect(() => {
    screenStateRef.current = {
      mode: viewMode,
      siteId: activeSiteId,
      feedId: selectedFeedId,
      theme,
    };
    const bundle = materialsRef.current;
    if (!bundle) return;
    drawSmartClientPrimaryCanvas(bundle.primaryCanvas, screenStateRef.current);
    bundle.primaryTexture.needsUpdate = true;
    drawSmartClientAuxCanvas(bundle.auxCanvas, screenStateRef.current);
    bundle.auxTexture.needsUpdate = true;
    requestRenderRef.current?.();
  }, [activeSiteId, selectedFeedId, theme, viewMode]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const syncDockForViewport = (matchesMobile: boolean) => {
      setDockOpen(!matchesMobile);
    };
    syncDockForViewport(mq.matches);
    const onMqChange = (event: MediaQueryListEvent) => {
      syncDockForViewport(event.matches);
    };
    mq.addEventListener('change', onMqChange);

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
      mq.removeEventListener('change', onMqChange);
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

    const initialBgHex = themeRef.current === 'light' ? 0xeef2f7 : 0x0b1018;

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.04;
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(Math.max(window.devicePixelRatio || 1, 1), 2),
    );
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(initialBgHex, 1);

    const width = Math.max(280, mount.clientWidth || 480);
    const height = Math.max(280, mount.clientHeight || 480);
    renderer.setSize(width, height);

    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(initialBgHex);
    scene.fog = new THREE.FogExp2(initialBgHex, 0.036);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 40);
    camera.position.set(3.55, 2.42, 4.2);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0.06, 0.78, 0.02);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 2.0;
    controls.maxDistance = 6.6;
    controls.minPolarAngle = 0.18;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.update();

    const onControlStart = () => {
      presetFlightRef.current.active = false;
    };
    controls.addEventListener('start', onControlStart);

    const hemiLight = new THREE.HemisphereLight(0xa5d8ff, 0x0b1220, 0.78);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e8, 2.15);
    keyLight.position.set(3.8, 5.4, 4.2);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 16;
    keyLight.shadow.camera.left = -2.8;
    keyLight.shadow.camera.right = 2.8;
    keyLight.shadow.camera.top = 2.8;
    keyLight.shadow.camera.bottom = -2.8;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.25);
    rimLight.position.set(-4.0, 2.8, -3.5);
    scene.add(rimLight);

    if (!isSoftwareGl) {
      RectAreaLightUniformsLib.init();
      const softboxLight = new THREE.RectAreaLight(0xdbeafe, 2.6, 3.2, 1.4);
      softboxLight.position.set(-2.6, 3.4, 2.4);
      softboxLight.lookAt(0, 0.95, 0);
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
    if (themeRef.current === 'light') {
      materials.plinth.color.setHex(0xdde5ef);
      materials.contactShadow.opacity = 0.24;
    }
    const assembly = buildSurveillanceAssembly(materials);
    scene.add(assembly.root);

    applyThemeCallbackRef.current = (nextTheme: ThemeMode) => {
      if (isDisposed) return;
      const isLightTheme = nextTheme === 'light';
      const hex = isLightTheme ? 0xeef2f7 : 0x0b1018;
      renderer.setClearColor(hex, 1);
      if (scene.background instanceof THREE.Color) {
        scene.background.setHex(hex);
      }
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.setHex(hex);
      }
      hemiLight.groundColor.setHex(isLightTheme ? 0xcbd5e1 : 0x0b1220);
      materials.plinth.color.setHex(isLightTheme ? 0xdde5ef : 0x101624);
      materials.contactShadow.opacity = isLightTheme ? 0.24 : 0.45;
      renderer.render(scene, camera);
    };
    applyThemeCallbackRef.current(themeRef.current);

    applyFinishCallbackRef.current = (nextFinish: FinishId) => {
      if (isDisposed) return;
      applyFinishPreset(materials, nextFinish);
      renderer.render(scene, camera);
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
      } else {
        setSelectedPart(DEFAULT_PART_INFO);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      const now = performance.now();
      if (now - lastHoverCheck < 50) return;
      lastHoverCheck = now;
      updatePointer(event);
      raycaster.setFromCamera(_pointer, camera);
      const hits = raycaster.intersectObjects(assembly.clickableTargets, true);
      renderer.domElement.style.cursor = hits.length > 0 ? 'pointer' : 'grab';
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointermove', onPointerMove);

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
    let isVisible = true;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (isDisposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : gl.SIGNALED;
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function requestRender() {
      if (isDisposed || !isVisible || frameRequested || isRenderingTick) return;
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
      const nextWidth = Math.max(240, mount.clientWidth);
      const nextHeight = Math.max(240, mount.clientHeight);
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
      renderer.setPixelRatio(
        isSoftwareGl ? 1 : Math.min(Math.max(window.devicePixelRatio || 1, 1), 2),
      );
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

    function tick() {
      if (isDisposed || !isVisible) return;
      isRenderingTick = true;

      const now = performance.now();
      const delta = Math.min(0.1, (now - lastTickTime) / 1000);
      lastTickTime = now;
      elapsed += delta;

      const targetExplode = explodeTargetRef.current;
      currentExplode = THREE.MathUtils.damp(currentExplode, targetExplode, 9, delta);
      const explodeSettled = Math.abs(currentExplode - targetExplode) < 0.001;
      if (explodeSettled) {
        currentExplode = targetExplode;
      }

      for (const layer of assembly.explodeLayers) {
        layer.object.position.y = layer.baseY + layer.offsetY * currentExplode;
      }

      const flight = presetFlightRef.current;
      if (flight.active) {
        _targetCamPos.set(...flight.position);
        _targetLook.set(...flight.target);
        camera.position.lerp(_targetCamPos, 0.07);
        controls.target.lerp(_targetLook, 0.07);
        if (
          camera.position.distanceTo(_targetCamPos) < 0.01 &&
          controls.target.distanceTo(_targetLook) < 0.01
        ) {
          camera.position.copy(_targetCamPos);
          controls.target.copy(_targetLook);
          flight.active = false;
        }
      }

      const controlsMoved = controls.update();
      const needsNextFrame = !explodeSettled || flight.active || controlsMoved;

      if (needsNextFrame) {
        if (assembly.joystickStick) {
          assembly.joystickStick.rotation.z = Math.sin(elapsed * 1.8) * 0.06;
          assembly.joystickStick.rotation.x = Math.cos(elapsed * 1.4) * 0.05;
        }
        if (assembly.orbitRing) {
          assembly.orbitRing.rotation.z = elapsed * 0.12;
        }
      }

      renderer.render(scene, camera);
      isRenderingTick = false;

      if (needsNextFrame) {
        requestRender();
      }
    }

    // Render initial settled frame on mount (on-demand)
    requestRender();

    return () => {
      isDisposed = true;
      requestRenderRef.current = null;
      cancelAnimationFrame(frameId);
      window.clearTimeout(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      controls.removeEventListener('start', onControlStart);
      controls.removeEventListener('change', onControlChange);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
      controls.dispose();
      envTexture.dispose();
      for (const geometry of assembly.geometries) {
        geometry.dispose();
      }
      materialsRef.current = null;
      disposeMaterialBundle(materials);
      renderer.dispose();
      mount.innerHTML = '';
    };
  }, [setViewMode]);

  const handleSelectPreset = (preset: CameraPreset) => {
    setActivePreset(preset.id);
    presetFlightRef.current = {
      active: true,
      position: preset.position,
      target: preset.target,
    };
    requestRenderRef.current?.();
  };

  const handleResetView = () => {
    setActivePreset('workstation');
    presetFlightRef.current = {
      active: true,
      position: [3.55, 2.42, 4.2],
      target: [0.06, 0.78, 0.02],
    };
    requestRenderRef.current?.();
  };

  if (webglFailed) {
    return (
      <div className="stage3d-shell stage3d-skeleton">
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
    <div className="stage3d-shell" data-testid="vms-stage-3d" ref={stageRef}>
      <div className="stage3d-mount" ref={mountRef} />

      {/* Official Milestone XProtect Smart Client UI & BriefCam Overlay */}
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

      {/* Global & Workspace Top Toolbars */}
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
                label: 'Operator: Sumit Anand · Shift Lead',
                spec: 'Flipkart Kalash Mega Hub · Milestone XProtect Smart Client · 32+ Ch',
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
            onClick={() => {
              setDockOpen((prev) => !prev);
              setSelectedPart({
                id: 'client-settings',
                label: 'Smart Client Viewport Diagnostics',
                spec: `Finish: ${FINISH_PRESETS[activeFinish].label} · Active View: ${activePreset.toUpperCase()}`,
              });
            }}
            title="Workstation Controls (H)"
            type="button"
          >
            <Settings aria-hidden="true" size={15} />
          </button>
        </div>
      </div>

      <div className="stage3d-spec-badge">
        <div className="stage3d-spec-row">
          <span className="stage3d-spec-title">{selectedPart.label}</span>
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
              <ChevronDown aria-hidden="true" size={14} /> Hide Controls
            </>
          ) : (
            <>
              <ChevronUp aria-hidden="true" size={14} /> Show Controls
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
