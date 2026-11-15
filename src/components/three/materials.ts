import * as THREE from 'three';
import type { VmsSiteFocus, VmsViewMode } from '@/context/VmsContext';
import type { ThemeMode } from '@/hooks/useTheme';

export type FinishId = 'slate' | 'titanium' | 'alabaster';

export interface FinishPreset {
  id: FinishId;
  label: string;
  swatch: string;
  chassisColor: number;
  chassisMetalness: number;
  chassisRoughness: number;
  trimColor: number;
  armColor: number;
}

export const FINISH_PRESETS: Record<FinishId, FinishPreset> = {
  slate: {
    id: 'slate',
    label: 'Obsidian Console',
    swatch: '#1c2432',
    chassisColor: 0x1e2636,
    chassisMetalness: 0.78,
    chassisRoughness: 0.28,
    trimColor: 0x38bdf8,
    armColor: 0x111722,
  },
  titanium: {
    id: 'titanium',
    label: 'Brushed Titanium',
    swatch: '#94a3b8',
    chassisColor: 0x8e9bae,
    chassisMetalness: 0.92,
    chassisRoughness: 0.19,
    trimColor: 0x60a5fa,
    armColor: 0x263142,
  },
  alabaster: {
    id: 'alabaster',
    label: 'Nordic Alabaster',
    swatch: '#e5e9f0',
    chassisColor: 0xdce2ec,
    chassisMetalness: 0.24,
    chassisRoughness: 0.36,
    trimColor: 0x0284c7,
    armColor: 0x253041,
  },
};

export interface SmartClientRenderState {
  mode: VmsViewMode;
  siteId: VmsSiteFocus;
  feedId: string;
  theme: ThemeMode;
}

export interface MaterialBundle {
  plinth: THREE.MeshStandardMaterial;
  deskGrid: THREE.MeshStandardMaterial;
  contactShadow: THREE.MeshBasicMaterial;
  chassis: THREE.MeshPhysicalMaterial;
  serverFaceplate: THREE.MeshStandardMaterial;
  armMetal: THREE.MeshStandardMaterial;
  switchBody: THREE.MeshStandardMaterial;
  portLed: THREE.MeshStandardMaterial;
  alarmKey: THREE.MeshStandardMaterial;
  accentTrim: THREE.MeshStandardMaterial;
  screenGlass: THREE.MeshPhysicalMaterial;
  primaryScreen: THREE.MeshBasicMaterial;
  auxScreen: THREE.MeshBasicMaterial;
  primaryCanvas: HTMLCanvasElement;
  primaryTexture: THREE.CanvasTexture;
  auxCanvas: HTMLCanvasElement;
  auxTexture: THREE.CanvasTexture;
  textures: THREE.Texture[];
}

function createDeskGridTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const cx = size / 2;
    const cy = size / 2;
    ctx.fillStyle = '#0c111b';
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.14)';
    ctx.lineWidth = 2;
    for (let r = 160; r <= 440; r += 90) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 160, cy + Math.sin(a) * 160);
      ctx.lineTo(cx + Math.cos(a) * 440, cy + Math.sin(a) * 440);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

function createBrushedMetalRoughnessTexture(maxAnisotropy: number): THREE.DataTexture {
  const width = 256;
  const height = 256;
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    const streak = 142 + Math.sin(y * 0.65) * 26 + Math.cos(y * 1.9) * 14;
    for (let x = 0; x < width; x++) {
      const grain = ((x * 37 + y * 13) % 19) - 9;
      const v = Math.max(90, Math.min(228, Math.round(streak + grain)));
      const idx = (y * width + x) * 4;
      data[idx] = v;
      data[idx + 1] = v;
      data[idx + 2] = v;
      data[idx + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, width, height);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 1);
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const c = size / 2;
    const grad = ctx.createRadialGradient(c, c, size * 0.08, c, c, size * 0.48);
    grad.addColorStop(0, 'rgba(2, 6, 14, 0.92)');
    grad.addColorStop(0.55, 'rgba(2, 6, 14, 0.42)');
    grad.addColorStop(1, 'rgba(2, 6, 14, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export function drawSmartClientPrimaryCanvas(
  canvas: HTMLCanvasElement,
  state: SmartClientRenderState,
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;

  // Milestone XProtect Smart Client Dark Slate Workspace
  ctx.fillStyle = '#0b111c';
  ctx.fillRect(0, 0, w, h);

  // Top XProtect Smart Client workspace header
  ctx.fillStyle = '#121c2c';
  ctx.fillRect(0, 0, w, 58);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(0, 56, w, 2);

  ctx.fillStyle = '#f1f5f9';
  ctx.font = '700 20px sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('MILESTONE XPROTECT', 24, 29);

  ctx.fillStyle = '#7dd3fc';
  ctx.font = '600 15px monospace';
  ctx.fillText('SMART CLIENT · SECTOR 01', 268, 29);

  // Workspace tabs
  const tabs: Array<{ id: VmsViewMode; label: string }> = [
    { id: 'live', label: 'LIVE' },
    { id: 'playback', label: 'PLAYBACK' },
    { id: 'smart-map', label: 'SMART MAP' },
    { id: 'alarms', label: 'ALARMS' },
  ];

  let tabX = 560;
  for (const tab of tabs) {
    const active = tab.id === state.mode;
    const tw = 104;
    ctx.fillStyle = active ? '#0284c7' : '#182438';
    ctx.fillRect(tabX, 13, tw, 32);
    ctx.fillStyle = active ? '#ffffff' : '#94a3b8';
    ctx.font = '700 13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(tab.label, tabX + tw / 2, 29);
    tabX += tw + 8;
  }
  ctx.textAlign = 'left';

  // Camera Quad Feeds (2x2 Matrix)
  const feeds = [
    {
      code: 'CAM-01 · GATE GIGO IN',
      zone: 'Flipkart Kalash · Lane A',
      feed: 'op2',
      color: '#34d399',
    },
    { code: 'CAM-09 · DOCK APRON', zone: '32-Ch CP Plus Matrix', feed: 'op1', color: '#38bdf8' },
    {
      code: 'CAM-17 · HIGH-VALUE BAY',
      zone: 'Loss Prevention Zone',
      feed: 'op3',
      color: '#f59e0b',
    },
    {
      code: 'CAM-24 · PERIMETER NORTH',
      zone: state.siteId === 'ekart' ? 'Ekart Logistics' : 'Dispatch Corridor',
      feed: 'op4',
      color: '#818cf8',
    },
  ];

  const pad = 18;
  const topY = 74;
  const bottomBarH = 74;
  const cellW = (w - pad * 3) / 2;
  const cellH = (h - topY - bottomBarH - pad * 2) / 2;

  feeds.forEach((cam, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = pad + col * (cellW + pad);
    const y = topY + row * (cellH + pad);
    const isHighlighted =
      (state.mode === 'playback' && cam.feed === 'op4') ||
      (state.mode === 'alarms' && cam.feed === 'op3') ||
      state.feedId === cam.feed;

    // Camera viewport frame
    ctx.fillStyle = '#0f1826';
    ctx.fillRect(x, y, cellW, cellH);

    // Subtle simulated dock geometry inside camera feed
    ctx.strokeStyle = isHighlighted ? cam.color : 'rgba(148, 163, 184, 0.2)';
    ctx.lineWidth = isHighlighted ? 3 : 1.5;
    ctx.strokeRect(x, y, cellW, cellH);

    // Perspective dock wireframe inside viewport
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 28, y + cellH - 18);
    ctx.lineTo(x + cellW * 0.34, y + cellH * 0.42);
    ctx.lineTo(x + cellW * 0.66, y + cellH * 0.42);
    ctx.lineTo(x + cellW - 28, y + cellH - 18);
    ctx.stroke();

    // Detection bounding box
    ctx.strokeStyle = state.mode === 'alarms' && idx === 2 ? '#f59e0b' : cam.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + cellW * 0.42, y + cellH * 0.46, 56, 38);

    // Camera overlay header strip
    ctx.fillStyle = 'rgba(9, 14, 24, 0.85)';
    ctx.fillRect(x + 6, y + 6, cellW - 12, 28);
    ctx.fillStyle = cam.color;
    ctx.fillRect(x + 12, y + 15, 10, 10);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '700 13px monospace';
    ctx.fillText(cam.code, x + 30, y + 20);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 12px monospace';
    ctx.fillText(cam.zone, x + 14, y + cellH - 16);
  });

  // Bottom Timeline / Sequence Scrubber (Milestone Smart Client signature)
  const barY = h - bottomBarH + 8;
  ctx.fillStyle = '#111a29';
  ctx.fillRect(pad, barY, w - pad * 2, 54);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.28)';
  ctx.lineWidth = 1;
  ctx.strokeRect(pad, barY, w - pad * 2, 54);

  // Recording track (Cobalt + Jade + Amber incident markers)
  const trackX = pad + 18;
  const trackW = w - pad * 2 - 36;
  ctx.fillStyle = state.mode === 'playback' ? '#e11d48' : '#0284c7';
  ctx.fillRect(trackX, barY + 30, trackW, 10);
  ctx.fillStyle = '#34d399';
  ctx.fillRect(trackX + trackW * 0.18, barY + 30, trackW * 0.22, 10);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(trackX + trackW * 0.64, barY + 26, 8, 18);

  // Scrubber playhead
  const headX = trackX + (state.mode === 'playback' ? trackW * 0.64 : trackW * 0.88);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(headX - 2, barY + 22, 4, 26);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '600 13px monospace';
  const modeStatus =
    state.mode === 'playback'
      ? 'TIMELINE SCRUB · 1080P ARCHIVE LOCK · EXPORT READY'
      : state.mode === 'alarms'
        ? 'ALARM SEQUENCE · GIGO & PERIMETER TRIGGERS ACTIVE'
        : state.mode === 'smart-map'
          ? 'GIS CORRIDOR LINKED · PATLI HUB ACTIVE'
          : 'RECORDING SERVER · 32 CHANNELS · 24/7 UPTIME';
  ctx.fillText(modeStatus, trackX, barY + 14);
}

export function drawSmartClientAuxCanvas(
  canvas: HTMLCanvasElement,
  state: SmartClientRenderState,
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;

  ctx.fillStyle = '#0b111c';
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#121c2c';
  ctx.fillRect(0, 0, w, 54);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(0, 52, w, 2);

  ctx.fillStyle = '#f1f5f9';
  ctx.font = '700 18px monospace';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    state.mode === 'alarms' ? 'XPROTECT ALARM MANAGER' : 'XPROTECT SMART MAP · NCR',
    20,
    27,
  );

  // Corridor schematic map grid
  const mapTop = 72;
  const mapH = 340;
  ctx.fillStyle = '#0f1928';
  ctx.fillRect(20, mapTop, w - 40, mapH);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(20, mapTop, w - 40, mapH);

  // Subtle vector roads
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(48, mapTop + 260);
  ctx.bezierCurveTo(180, mapTop + 220, 320, mapTop + 140, w - 50, mapTop + 80);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(80, mapTop + 60);
  ctx.lineTo(w - 70, mapTop + 290);
  ctx.stroke();

  // Patli Mega Hub Node
  const flipkartActive = state.siteId === 'flipkart';
  const fx = w * 0.42;
  const fy = mapTop + 150;
  ctx.strokeStyle = flipkartActive ? '#38bdf8' : 'rgba(56, 189, 248, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(fx, fy, flipkartActive ? 34 : 22, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(fx, fy, 9, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '700 14px monospace';
  ctx.fillText('FLIPKART KALASH HUB (32 CAM)', fx + 18, fy - 6);

  // Ekart Logistics Node
  const ex = w * 0.62;
  const ey = mapTop + 250;
  ctx.fillStyle = !flipkartActive ? '#f59e0b' : '#94a3b8';
  ctx.beginPath();
  ctx.arc(ex, ey, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '600 13px monospace';
  ctx.fillText('EKART LOGISTICS (12 CAM)', ex - 160, ey + 24);

  // Lower event queue
  const queueY = mapTop + mapH + 24;
  ctx.fillStyle = '#7dd3fc';
  ctx.font = '700 14px monospace';
  ctx.fillText('SYSTEM & GIGO TELEMETRY', 20, queueY);

  const rows = [
    { k: 'SERVER', v: 'XProtect Corporate · Online', tone: '#34d399' },
    { k: 'GATE GIGO', v: 'Synced · 100% Log Accuracy', tone: '#38bdf8' },
    {
      k: 'ACTIVE HUB',
      v: flipkartActive ? 'Flipkart Kalash, Patli' : 'Ekart Logistics, HR',
      tone: '#f59e0b',
    },
    { k: 'PLAYBACK', v: 'NVR Pool Nominal · 24/7', tone: '#818cf8' },
  ];

  rows.forEach((row, idx) => {
    const ry = queueY + 26 + idx * 48;
    ctx.fillStyle = '#131d2e';
    ctx.fillRect(20, ry, w - 40, 38);
    ctx.fillStyle = row.tone;
    ctx.fillRect(20, ry, 4, 38);
    ctx.font = '700 13px monospace';
    ctx.fillText(row.k, 36, ry + 19);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '500 13px sans-serif';
    ctx.fillText(row.v, 148, ry + 19);
  });
}

export function createSurveillanceMaterials(
  isSoftwareGl: boolean,
  maxAnisotropy: number,
  initialFinish: FinishId,
  initialScreenState: SmartClientRenderState,
): MaterialBundle {
  const preset = FINISH_PRESETS[initialFinish];
  const deskGridTex = createDeskGridTexture(maxAnisotropy);
  const brushedRoughnessTex = createBrushedMetalRoughnessTexture(maxAnisotropy);
  const contactShadowTex = createContactShadowTexture();

  const primaryCanvas = document.createElement('canvas');
  primaryCanvas.width = 1024;
  primaryCanvas.height = 576;
  drawSmartClientPrimaryCanvas(primaryCanvas, initialScreenState);
  const primaryTexture = new THREE.CanvasTexture(primaryCanvas);
  primaryTexture.colorSpace = THREE.SRGBColorSpace;
  primaryTexture.anisotropy = maxAnisotropy;
  primaryTexture.needsUpdate = true;

  const auxCanvas = document.createElement('canvas');
  auxCanvas.width = 576;
  auxCanvas.height = 680;
  drawSmartClientAuxCanvas(auxCanvas, initialScreenState);
  const auxTexture = new THREE.CanvasTexture(auxCanvas);
  auxTexture.colorSpace = THREE.SRGBColorSpace;
  auxTexture.anisotropy = maxAnisotropy;
  auxTexture.needsUpdate = true;

  const plinth = new THREE.MeshStandardMaterial({
    color: 0x101624,
    metalness: 0.2,
    roughness: 0.8,
  });

  const deskGrid = new THREE.MeshStandardMaterial({
    map: deskGridTex,
    metalness: 0.25,
    roughness: 0.65,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });

  const contactShadow = new THREE.MeshBasicMaterial({
    map: contactShadowTex,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
  });

  const chassis = new THREE.MeshPhysicalMaterial({
    color: preset.chassisColor,
    metalness: preset.chassisMetalness,
    roughness: preset.chassisRoughness,
    roughnessMap: brushedRoughnessTex,
    anisotropy: 0.75,
    clearcoat: 0.3,
    clearcoatRoughness: 0.26,
  });

  const serverFaceplate = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.45,
    roughness: 0.55,
  });

  const armMetal = new THREE.MeshStandardMaterial({
    color: preset.armColor,
    metalness: 0.86,
    roughness: 0.24,
  });

  const switchBody = new THREE.MeshStandardMaterial({
    color: 0x1b2538,
    metalness: 0.82,
    roughness: 0.28,
  });

  const portLed = new THREE.MeshStandardMaterial({
    color: 0x3eb489,
    emissive: 0x109169,
    emissiveIntensity: 0.6,
    metalness: 0.2,
    roughness: 0.3,
  });

  const alarmKey = new THREE.MeshStandardMaterial({
    color: 0xe59820,
    emissive: 0xb97212,
    emissiveIntensity: 0.35,
    metalness: 0.25,
    roughness: 0.35,
  });

  const accentTrim = new THREE.MeshStandardMaterial({
    color: preset.trimColor,
    emissive: preset.trimColor,
    emissiveIntensity: 0.22,
    metalness: 0.88,
    roughness: 0.2,
  });

  const screenGlass = new THREE.MeshPhysicalMaterial({
    color: 0x0a1628,
    metalness: 0,
    roughness: 0.08,
    transmission: isSoftwareGl ? 0 : 0.16,
    transparent: true,
    opacity: isSoftwareGl ? 0.14 : 0.28,
    ior: 1.5,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    depthWrite: false,
  });

  const primaryScreen = new THREE.MeshBasicMaterial({
    map: primaryTexture,
  });

  const auxScreen = new THREE.MeshBasicMaterial({
    map: auxTexture,
  });

  return {
    plinth,
    deskGrid,
    contactShadow,
    chassis,
    serverFaceplate,
    armMetal,
    switchBody,
    portLed,
    alarmKey,
    accentTrim,
    screenGlass,
    primaryScreen,
    auxScreen,
    primaryCanvas,
    primaryTexture,
    auxCanvas,
    auxTexture,
    textures: [deskGridTex, brushedRoughnessTex, contactShadowTex, primaryTexture, auxTexture],
  };
}

export function applyFinishPreset(bundle: MaterialBundle, finishId: FinishId): void {
  const preset = FINISH_PRESETS[finishId];
  bundle.chassis.color.setHex(preset.chassisColor);
  bundle.chassis.metalness = preset.chassisMetalness;
  bundle.chassis.roughness = preset.chassisRoughness;
  bundle.armMetal.color.setHex(preset.armColor);
  bundle.accentTrim.color.setHex(preset.trimColor);
  bundle.accentTrim.emissive.setHex(preset.trimColor);
}

export function disposeMaterialBundle(bundle: MaterialBundle): void {
  bundle.plinth.dispose();
  bundle.deskGrid.dispose();
  bundle.contactShadow.dispose();
  bundle.chassis.dispose();
  bundle.serverFaceplate.dispose();
  bundle.armMetal.dispose();
  bundle.switchBody.dispose();
  bundle.portLed.dispose();
  bundle.alarmKey.dispose();
  bundle.accentTrim.dispose();
  bundle.screenGlass.dispose();
  bundle.primaryScreen.dispose();
  bundle.auxScreen.dispose();
  for (const tex of bundle.textures) {
    tex.dispose();
  }
}
