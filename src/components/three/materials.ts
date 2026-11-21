import * as THREE from 'three';
import type { VmsSiteFocus, VmsViewMode } from '@/context/VmsContext';
import type { ThemeMode } from '@/hooks/useTheme';
import type { InterpolatedSceneTheme } from '@/utils/themeSceneConfig';

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
    chassisColor: 0x182131,
    chassisMetalness: 0.84,
    chassisRoughness: 0.24,
    trimColor: 0x00e5ff,
    armColor: 0x101723,
  },
  titanium: {
    id: 'titanium',
    label: 'Brushed Titanium',
    swatch: '#94a3b8',
    chassisColor: 0x8a97aa,
    chassisMetalness: 0.92,
    chassisRoughness: 0.19,
    trimColor: 0x38bdf8,
    armColor: 0x242f40,
  },
  alabaster: {
    id: 'alabaster',
    label: 'Nordic Alabaster',
    swatch: '#e5e9f0',
    chassisColor: 0xd8dfe9,
    chassisMetalness: 0.28,
    chassisRoughness: 0.34,
    trimColor: 0x0284c7,
    armColor: 0x222d3f,
  },
};

export interface SmartClientRenderState {
  mode: VmsViewMode;
  siteId: VmsSiteFocus;
  feedId: string;
  theme: ThemeMode;
  time?: number;
}

export interface MaterialBundle {
  plinth: THREE.MeshStandardMaterial;
  deskSlab: THREE.MeshPhysicalMaterial;
  deskGrid: THREE.MeshStandardMaterial;
  contactShadow: THREE.MeshBasicMaterial;
  chassis: THREE.MeshPhysicalMaterial;
  serverFaceplate: THREE.MeshStandardMaterial;
  armMetal: THREE.MeshStandardMaterial;
  switchBody: THREE.MeshStandardMaterial;
  cable: THREE.MeshStandardMaterial;
  keycap: THREE.MeshStandardMaterial;
  portLed: THREE.MeshStandardMaterial;
  alarmKey: THREE.MeshStandardMaterial;
  accentTrim: THREE.MeshStandardMaterial;
  warmAccentLed: THREE.MeshStandardMaterial;
  holoWire: THREE.MeshBasicMaterial;
  dustParticle: THREE.PointsMaterial;
  screenGlass: THREE.MeshPhysicalMaterial;
  primaryScreen: THREE.MeshBasicMaterial;
  auxScreen: THREE.MeshBasicMaterial;
  briefcamScreen: THREE.MeshBasicMaterial;
  primaryCanvas: HTMLCanvasElement;
  primaryTexture: THREE.CanvasTexture;
  auxCanvas: HTMLCanvasElement;
  auxTexture: THREE.CanvasTexture;
  briefcamCanvas: HTMLCanvasElement;
  briefcamTexture: THREE.CanvasTexture;
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
    ctx.clearRect(0, 0, size, size);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.78)';
    ctx.lineWidth = 2.4;
    for (let r = 130; r <= 470; r += 85) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.42)';
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 24; i++) {
      const a = (i * Math.PI) / 12;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 130, cy + Math.sin(a) * 130);
      ctx.lineTo(cx + Math.cos(a) * 470, cy + Math.sin(a) * 470);
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
    const streak = 140 + Math.sin(y * 0.65) * 24 + Math.cos(y * 1.9) * 14;
    for (let x = 0; x < width; x++) {
      const grain = ((x * 37 + y * 13) % 19) - 9;
      const v = Math.max(88, Math.min(228, Math.round(streak + grain)));
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
    grad.addColorStop(0, 'rgba(2, 6, 14, 0.94)');
    grad.addColorStop(0.55, 'rgba(2, 6, 14, 0.45)');
    grad.addColorStop(1, 'rgba(2, 6, 14, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function createDustTexture(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const c = size / 2;
    const grad = ctx.createRadialGradient(c, c, 0, c, c, c);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.72)');
    grad.addColorStop(0.72, 'rgba(255, 255, 255, 0.18)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function formatLiveTimecode(t: number): string {
  const totalSec = Math.floor(t);
  const hh = String(19 + (Math.floor(totalSec / 3600) % 5)).padStart(2, '0');
  const mm = String((42 + Math.floor(totalSec / 60)) % 60).padStart(2, '0');
  const ss = String(totalSec % 60).padStart(2, '0');
  const ff = String(Math.floor((t % 1) * 30)).padStart(2, '0');
  return `${hh}:${mm}:${ss}:${ff}`;
}

export function drawSmartClientPrimaryCanvas(
  canvas: HTMLCanvasElement,
  state: SmartClientRenderState,
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  const t = state.time ?? 0;
  const recBlink = Math.sin(t * 5.2) > -0.15;

  ctx.fillStyle = '#090e18';
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#101929';
  ctx.fillRect(0, 0, w, 58);
  ctx.fillStyle = '#00e5ff';
  ctx.fillRect(0, 56, w, 2);

  ctx.fillStyle = '#f1f5f9';
  ctx.font = '700 20px sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('MILESTONE XPROTECT', 24, 29);

  ctx.fillStyle = '#7dd3fc';
  ctx.font = '600 14px monospace';
  ctx.fillText(`SECTOR 01 · ${formatLiveTimecode(t)}`, 264, 29);

  const tabs: Array<{ id: VmsViewMode; label: string }> = [
    { id: 'live', label: 'LIVE' },
    { id: 'playback', label: 'PLAYBACK' },
    { id: 'smart-map', label: 'SMART MAP' },
    { id: 'alarms', label: 'ALARMS' },
  ];

  let tabX = 564;
  for (const tab of tabs) {
    const active = tab.id === state.mode;
    const tw = 104;
    ctx.fillStyle = active ? '#0284c7' : '#162235';
    ctx.fillRect(tabX, 13, tw, 32);
    ctx.fillStyle = active ? '#ffffff' : '#94a3b8';
    ctx.font = '700 13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(tab.label, tabX + tw / 2, 29);
    tabX += tw + 8;
  }
  ctx.textAlign = 'left';

  const feeds = [
    {
      code: 'CAM-01 · GATE GIGO IN',
      zone: 'Flipkart Kalash · Lane A',
      feed: 'op2',
      color: '#34d399',
    },
    { code: 'CAM-09 · DOCK APRON', zone: '32-Ch CP Plus Matrix', feed: 'op1', color: '#00e5ff' },
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

    ctx.fillStyle = '#0d1524';
    ctx.fillRect(x, y, cellW, cellH);

    // Moving simulated corridor perspective & traffic box
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.22)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 28, y + cellH - 18);
    ctx.lineTo(x + cellW * 0.34, y + cellH * 0.4);
    ctx.lineTo(x + cellW * 0.66, y + cellH * 0.4);
    ctx.lineTo(x + cellW - 28, y + cellH - 18);
    ctx.stroke();

    // Animated horizontal CCTV scan sweep inside viewport
    const sweepY = y + 36 + ((t * 48 + idx * 45) % Math.max(40, cellH - 60));
    ctx.fillStyle = 'rgba(0, 229, 255, 0.08)';
    ctx.fillRect(x + 4, sweepY, cellW - 8, 8);

    // Moving detection bounding box
    const boxShiftX = Math.sin(t * 1.4 + idx * 1.7) * (cellW * 0.16);
    const boxShiftY = Math.cos(t * 1.1 + idx) * 8;
    ctx.strokeStyle = state.mode === 'alarms' && idx === 2 ? '#f59e0b' : cam.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + cellW * 0.42 + boxShiftX, y + cellH * 0.44 + boxShiftY, 58, 38);

    ctx.strokeStyle = isHighlighted ? cam.color : 'rgba(148, 163, 184, 0.22)';
    ctx.lineWidth = isHighlighted ? 3 : 1.5;
    ctx.strokeRect(x, y, cellW, cellH);

    // Camera overlay header strip + blinking REC indicator
    ctx.fillStyle = 'rgba(8, 12, 22, 0.88)';
    ctx.fillRect(x + 6, y + 6, cellW - 12, 28);
    ctx.fillStyle = cam.color;
    ctx.fillRect(x + 12, y + 15, 10, 10);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '700 13px monospace';
    ctx.fillText(cam.code, x + 30, y + 20);

    if (recBlink || idx % 2 === 0) {
      ctx.fillStyle = idx === 2 && state.mode === 'alarms' ? '#f59e0b' : '#ef4444';
      ctx.beginPath();
      ctx.arc(x + cellW - 44, y + 20, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f87171';
      ctx.font = '700 11px monospace';
      ctx.fillText('REC', x + cellW - 35, y + 20);
    }

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 12px monospace';
    ctx.fillText(cam.zone, x + 14, y + cellH - 16);
  });

  // Bottom Timeline / Sequence Scrubber
  const barY = h - bottomBarH + 8;
  ctx.fillStyle = '#0f1726';
  ctx.fillRect(pad, barY, w - pad * 2, 54);
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.28)';
  ctx.lineWidth = 1;
  ctx.strokeRect(pad, barY, w - pad * 2, 54);

  const trackX = pad + 18;
  const trackW = w - pad * 2 - 36;
  ctx.fillStyle = state.mode === 'playback' ? '#e11d48' : '#0284c7';
  ctx.fillRect(trackX, barY + 30, trackW, 10);
  ctx.fillStyle = '#34d399';
  ctx.fillRect(trackX + trackW * 0.18, barY + 30, trackW * 0.22, 10);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(trackX + trackW * 0.64, barY + 26, 8, 18);

  const baseHeadRatio = state.mode === 'playback' ? 0.64 : 0.84;
  const headX = trackX + trackW * (baseHeadRatio + Math.sin(t * 0.45) * 0.04);
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
  const t = state.time ?? 0;

  ctx.fillStyle = '#090e18';
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#101929';
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

  const mapTop = 72;
  const mapH = 340;
  ctx.fillStyle = '#0d1626';
  ctx.fillRect(20, mapTop, w - 40, mapH);
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.25)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(20, mapTop, w - 40, mapH);

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(48, mapTop + 260);
  ctx.bezierCurveTo(180, mapTop + 220, 320, mapTop + 140, w - 50, mapTop + 80);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(80, mapTop + 60);
  ctx.lineTo(w - 70, mapTop + 290);
  ctx.stroke();

  const flipkartActive = state.siteId === 'flipkart';
  const fx = w * 0.42;
  const fy = mapTop + 150;
  const pulseRadius = 22 + ((t * 18) % 26);

  ctx.strokeStyle = `rgba(0, 229, 255, ${Math.max(0.1, 0.7 - (pulseRadius - 22) / 36)})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(fx, fy, pulseRadius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#00e5ff';
  ctx.beginPath();
  ctx.arc(fx, fy, 9, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '700 14px monospace';
  ctx.fillText('FLIPKART KALASH HUB (32 CAM)', fx + 18, fy - 6);

  const ex = w * 0.62;
  const ey = mapTop + 250;
  ctx.fillStyle = !flipkartActive ? '#f59e0b' : '#94a3b8';
  ctx.beginPath();
  ctx.arc(ex, ey, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '600 13px monospace';
  ctx.fillText('EKART LOGISTICS (12 CAM)', ex - 160, ey + 24);

  const queueY = mapTop + mapH + 24;
  ctx.fillStyle = '#7dd3fc';
  ctx.font = '700 14px monospace';
  ctx.fillText('SYSTEM & GIGO TELEMETRY', 20, queueY);

  const rows = [
    { k: 'SERVER', v: 'XProtect Corporate · Online', tone: '#34d399' },
    { k: 'GATE GIGO', v: 'Synced · 100% Log Accuracy', tone: '#00e5ff' },
    {
      k: 'ACTIVE HUB',
      v: flipkartActive ? 'Flipkart Kalash, Patli' : 'Ekart Logistics, HR',
      tone: '#f59e0b',
    },
    { k: 'PLAYBACK', v: 'NVR Pool Nominal · 24/7', tone: '#818cf8' },
  ];

  rows.forEach((row, idx) => {
    const ry = queueY + 26 + idx * 48;
    ctx.fillStyle = '#121b2b';
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

export function drawBriefCamCanvas(canvas: HTMLCanvasElement, state: SmartClientRenderState): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  const t = state.time ?? 0;

  ctx.fillStyle = '#080d17';
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#0f1829';
  ctx.fillRect(0, 0, w, 54);
  ctx.fillStyle = '#00e5ff';
  ctx.fillRect(0, 52, w, 2);

  ctx.fillStyle = '#f1f5f9';
  ctx.font = '700 17px monospace';
  ctx.textBaseline = 'middle';
  ctx.fillText('BRIEFCAM ANALYTICS · LPR', 20, 27);

  // Live LPR Gate Telemetry Spectrum Bars
  ctx.fillStyle = '#0d1524';
  ctx.fillRect(20, 74, w - 40, 180);
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.24)';
  ctx.strokeRect(20, 74, w - 40, 180);

  ctx.fillStyle = '#7dd3fc';
  ctx.font = '700 13px monospace';
  ctx.fillText('GATE BAY MOTION SPECTRUM', 34, 98);

  const bars = 16;
  const barW = (w - 92) / bars;
  for (let i = 0; i < bars; i++) {
    const val = 0.25 + 0.7 * Math.abs(Math.sin(t * 2.1 + i * 0.55));
    const bh = 104 * val;
    const bx = 36 + i * barW;
    const by = 236 - bh;
    ctx.fillStyle = i % 5 === 0 ? '#f59e0b' : '#00e5ff';
    ctx.fillRect(bx, by, Math.max(6, barW - 6), bh);
  }

  // Gate Vehicle / Container ID Logs
  const entries = [
    { plate: 'HR-55-AK-4821', bay: 'DOCK 04 IN', status: 'VERIFIED', tone: '#34d399' },
    { plate: 'HR-38-TR-1094', bay: 'GIGO GATE A', status: 'CLEARED', tone: '#00e5ff' },
    { plate: 'DL-01-GC-7720', bay: 'PERIMETER E', status: 'CHECKED', tone: '#38bdf8' },
    { plate: 'HR-26-LP-9312', bay: 'HIGH-VAL BAY', status: 'ALERT OK', tone: '#f59e0b' },
  ];

  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 13px monospace';
  ctx.fillText('LIVE LPR & CONTAINER STREAM', 20, 286);

  entries.forEach((item, idx) => {
    const ey = 310 + idx * 78;
    ctx.fillStyle = '#111a2b';
    ctx.fillRect(20, ey, w - 40, 62);
    ctx.fillStyle = item.tone;
    ctx.fillRect(20, ey, 4, 62);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 15px monospace';
    ctx.fillText(item.plate, 38, ey + 22);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 12px monospace';
    ctx.fillText(`${item.bay} · ${formatLiveTimecode(t + idx * 14)}`, 38, ey + 44);

    ctx.fillStyle = item.tone;
    ctx.font = '700 12px monospace';
    ctx.fillText(item.status, w - 110, ey + 31);
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
  const dustTex = createDustTexture();

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

  const briefcamCanvas = document.createElement('canvas');
  briefcamCanvas.width = 480;
  briefcamCanvas.height = 640;
  drawBriefCamCanvas(briefcamCanvas, initialScreenState);
  const briefcamTexture = new THREE.CanvasTexture(briefcamCanvas);
  briefcamTexture.colorSpace = THREE.SRGBColorSpace;
  briefcamTexture.anisotropy = maxAnisotropy;
  briefcamTexture.needsUpdate = true;

  const plinth = new THREE.MeshStandardMaterial({
    color: 0x0b101b,
    metalness: 0.35,
    roughness: 0.72,
  });

  const deskSlab = new THREE.MeshPhysicalMaterial({
    color: 0x151e2d,
    metalness: 0.76,
    roughness: 0.28,
    roughnessMap: brushedRoughnessTex,
    anisotropy: 0.8,
    clearcoat: 0.42,
    clearcoatRoughness: 0.2,
  });

  const deskGrid = new THREE.MeshStandardMaterial({
    map: deskGridTex,
    color: 0x00e5ff,
    transparent: true,
    opacity: 0.44,
    metalness: 0.25,
    roughness: 0.55,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });

  const contactShadow = new THREE.MeshBasicMaterial({
    map: contactShadowTex,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });

  const chassis = new THREE.MeshPhysicalMaterial({
    color: preset.chassisColor,
    metalness: preset.chassisMetalness,
    roughness: preset.chassisRoughness,
    roughnessMap: brushedRoughnessTex,
    anisotropy: 0.78,
    clearcoat: 0.38,
    clearcoatRoughness: 0.22,
  });

  const serverFaceplate = new THREE.MeshStandardMaterial({
    color: 0x0c1424,
    metalness: 0.52,
    roughness: 0.48,
  });

  const armMetal = new THREE.MeshStandardMaterial({
    color: preset.armColor,
    metalness: 0.88,
    roughness: 0.22,
  });

  const switchBody = new THREE.MeshStandardMaterial({
    color: 0x162033,
    metalness: 0.84,
    roughness: 0.26,
  });

  const cable = new THREE.MeshStandardMaterial({
    color: 0x0f1a2c,
    metalness: 0.22,
    roughness: 0.52,
  });

  const keycap = new THREE.MeshStandardMaterial({
    color: 0x1e2b42,
    emissive: 0x0ea5e9,
    emissiveIntensity: 0.25,
    metalness: 0.35,
    roughness: 0.38,
  });

  const portLed = new THREE.MeshStandardMaterial({
    color: 0x34d399,
    emissive: 0x10b981,
    emissiveIntensity: 1.75,
    metalness: 0.15,
    roughness: 0.25,
  });

  const alarmKey = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.25,
    metalness: 0.2,
    roughness: 0.32,
  });

  const accentTrim = new THREE.MeshStandardMaterial({
    color: preset.trimColor,
    emissive: preset.trimColor,
    emissiveIntensity: 1.45,
    metalness: 0.82,
    roughness: 0.18,
  });

  const warmAccentLed = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.9,
    metalness: 0.2,
    roughness: 0.2,
  });

  const holoWire = new THREE.MeshBasicMaterial({
    color: 0x00e5ff,
    transparent: true,
    opacity: 0.34,
    wireframe: true,
    depthWrite: false,
  });

  const dustParticle = new THREE.PointsMaterial({
    map: dustTex,
    color: 0x7dd3fc,
    size: 0.055,
    transparent: true,
    opacity: 0.72,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const screenGlass = new THREE.MeshPhysicalMaterial({
    color: 0x0b1930,
    metalness: 0.04,
    roughness: 0.06,
    transmission: isSoftwareGl ? 0 : 0.22,
    transparent: true,
    opacity: isSoftwareGl ? 0.16 : 0.32,
    ior: 1.52,
    thickness: 0.04,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    depthWrite: false,
  });

  const primaryScreen = new THREE.MeshBasicMaterial({
    map: primaryTexture,
  });

  const auxScreen = new THREE.MeshBasicMaterial({
    map: auxTexture,
  });

  const briefcamScreen = new THREE.MeshBasicMaterial({
    map: briefcamTexture,
  });

  return {
    plinth,
    deskSlab,
    deskGrid,
    contactShadow,
    chassis,
    serverFaceplate,
    armMetal,
    switchBody,
    cable,
    keycap,
    portLed,
    alarmKey,
    accentTrim,
    warmAccentLed,
    holoWire,
    dustParticle,
    screenGlass,
    primaryScreen,
    auxScreen,
    briefcamScreen,
    primaryCanvas,
    primaryTexture,
    auxCanvas,
    auxTexture,
    briefcamCanvas,
    briefcamTexture,
    textures: [
      deskGridTex,
      brushedRoughnessTex,
      contactShadowTex,
      dustTex,
      primaryTexture,
      auxTexture,
      briefcamTexture,
    ],
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

const _trimBaseColor = new THREE.Color();

export function applyInterpolatedThemeToMaterials(
  bundle: MaterialBundle,
  themeState: InterpolatedSceneTheme,
  finishId: FinishId,
): void {
  const t = themeState.mix;
  bundle.plinth.color.copy(themeState.plinth);
  bundle.plinth.metalness = 0.08 + t * 0.04;
  bundle.plinth.roughness = 0.88 - t * 0.08;
  bundle.plinth.envMapIntensity = 0.12 + t * 0.16;

  // Keep brushed metal rich and contrasted in Light Mode without mirroring overhead white IBL
  bundle.deskSlab.color.copy(themeState.deskSlab);
  bundle.deskSlab.metalness = 0.76 - t * 0.2;
  bundle.deskSlab.roughness = 0.28 + t * 0.08;
  bundle.deskSlab.envMapIntensity = 1.0 - t * 0.45;
  bundle.deskSlab.clearcoat = 0.42 - t * 0.14;

  // Keep monitor glass reflective without washing dark feeds into milky grey under studio IBL
  bundle.screenGlass.envMapIntensity = 1.0 - t * 0.58;
  bundle.screenGlass.clearcoat = 1.0 - t * 0.28;
  bundle.chassis.envMapIntensity = 1.0 - t * 0.24;

  bundle.deskGrid.color.copy(themeState.deskGrid);
  bundle.deskGrid.opacity = themeState.deskGridOpacity;
  bundle.deskGrid.envMapIntensity = 0.12 + t * 0.22;
  bundle.contactShadow.opacity = themeState.contactShadowOpacity;

  bundle.holoWire.color.copy(themeState.holoWire);
  bundle.holoWire.opacity = themeState.holoWireOpacity;

  bundle.dustParticle.color.copy(themeState.dust);
  bundle.dustParticle.opacity = themeState.dustOpacity;
  const targetBlending = themeState.dustUseNormalBlending
    ? THREE.NormalBlending
    : THREE.AdditiveBlending;
  if (bundle.dustParticle.blending !== targetBlending) {
    bundle.dustParticle.blending = targetBlending;
    bundle.dustParticle.needsUpdate = true;
  }

  // Keep finish selection respected while ensuring strong light-mode trim contrast
  if (finishId === 'slate') {
    bundle.accentTrim.color.copy(themeState.accentTrim);
    bundle.accentTrim.emissive.copy(themeState.accentTrimEmissive);
  } else {
    _trimBaseColor.setHex(FINISH_PRESETS[finishId].trimColor);
    bundle.accentTrim.color.copy(_trimBaseColor).lerp(themeState.accentTrim, themeState.mix * 0.65);
    bundle.accentTrim.emissive.copy(bundle.accentTrim.color);
  }
  bundle.accentTrim.emissiveIntensity = themeState.accentTrimEmissiveIntensity;

  // Tone down neon bloom drivers slightly in light mode so details stay rich instead of white-hot
  bundle.portLed.emissiveIntensity = 1.75 - t * 0.72;
  bundle.alarmKey.emissiveIntensity = 1.25 - t * 0.45;
  bundle.warmAccentLed.emissiveIntensity = 1.9 - t * 0.78;
  bundle.keycap.emissiveIntensity = 0.25 - t * 0.1;
}

export function disposeMaterialBundle(bundle: MaterialBundle): void {
  bundle.plinth.dispose();
  bundle.deskSlab.dispose();
  bundle.deskGrid.dispose();
  bundle.contactShadow.dispose();
  bundle.chassis.dispose();
  bundle.serverFaceplate.dispose();
  bundle.armMetal.dispose();
  bundle.switchBody.dispose();
  bundle.cable.dispose();
  bundle.keycap.dispose();
  bundle.portLed.dispose();
  bundle.alarmKey.dispose();
  bundle.accentTrim.dispose();
  bundle.warmAccentLed.dispose();
  bundle.holoWire.dispose();
  bundle.dustParticle.dispose();
  bundle.screenGlass.dispose();
  bundle.primaryScreen.dispose();
  bundle.auxScreen.dispose();
  bundle.briefcamScreen.dispose();
  for (const tex of bundle.textures) {
    tex.dispose();
  }
}
