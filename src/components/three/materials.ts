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
  armColor: number;
}

/**
 * All finishes are matte (powder-coated / soft-touch plastic). Nothing here mirrors the room,
 * so the workstation reads like a real desk setup instead of a chrome render.
 */
export const FINISH_PRESETS: Record<FinishId, FinishPreset> = {
  slate: {
    id: 'slate',
    label: 'Matte Graphite',
    swatch: '#252b34',
    chassisColor: 0x181c23,
    chassisMetalness: 0.04,
    chassisRoughness: 0.82,
    armColor: 0x2c323b,
  },
  titanium: {
    id: 'titanium',
    label: 'Matte Steel',
    swatch: '#7a8594',
    chassisColor: 0x6f7a89,
    chassisMetalness: 0.06,
    chassisRoughness: 0.8,
    armColor: 0x4a5463,
  },
  alabaster: {
    id: 'alabaster',
    label: 'Matte Alabaster',
    swatch: '#d9dee6',
    chassisColor: 0xcdd3dc,
    chassisMetalness: 0.02,
    chassisRoughness: 0.86,
    armColor: 0x8a93a1,
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
  deskSlab: THREE.MeshStandardMaterial;
  deskMat: THREE.MeshStandardMaterial;
  contactShadow: THREE.MeshBasicMaterial;
  chassis: THREE.MeshStandardMaterial;
  serverFaceplate: THREE.MeshStandardMaterial;
  armMetal: THREE.MeshStandardMaterial;
  switchBody: THREE.MeshStandardMaterial;
  cable: THREE.MeshStandardMaterial;
  keycap: THREE.MeshStandardMaterial;
  portLed: THREE.MeshStandardMaterial;
  alarmKey: THREE.MeshStandardMaterial;
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

/** Radial alpha mask so the floor fades out softly instead of ending in a hard disc edge. */
function createFloorFadeTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const c = size / 2;
    const grad = ctx.createRadialGradient(c, c, size * 0.12, c, c, size * 0.5);
    // alphaMap reads the green channel, so paint an opaque grayscale mask (white = solid floor)
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.55, '#d9d9d9');
    grad.addColorStop(1, '#000000');
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
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

function formatLiveTimecode(t: number): string {
  const totalSec = Math.floor(t);
  const hh = String(19 + (Math.floor(totalSec / 3600) % 5)).padStart(2, '0');
  const mm = String((42 + Math.floor(totalSec / 60)) % 60).padStart(2, '0');
  const ss = String(totalSec % 60).padStart(2, '0');
  const ff = String(Math.floor((t % 1) * 30)).padStart(2, '0');
  return `${hh}:${mm}:${ss}:${ff}`;
}

/* ------------------------------------------------------------------------- */
/* Smart Client screen painting helpers (2D canvas → 3D monitor textures)     */
/* ------------------------------------------------------------------------- */

type Ctx = CanvasRenderingContext2D;
type Paint = string | CanvasGradient | CanvasPattern;

const UI_SANS = '"Plus Jakarta Sans", "Instrument Sans", system-ui, sans-serif';
const UI_MONO = '"JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, monospace';

const UI = {
  bgTop: '#0a1120',
  bgBottom: '#050810',
  panel: '#0e1626',
  hairline: 'rgba(148, 163, 184, 0.16)',
  text: '#eef3fb',
  textMuted: '#8b9bb5',
  cyan: '#22d3ee',
  sky: '#38bdf8',
  blue: '#2563eb',
  green: '#34d399',
  amber: '#fbbf24',
  red: '#f87171',
  violet: '#a5b4fc',
} as const;

function roundRectPath(ctx: Ctx, x: number, y: number, w: number, h: number, r: number): void {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function fillRound(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  paint: Paint,
): void {
  roundRectPath(ctx, x, y, w, h, r);
  ctx.fillStyle = paint;
  ctx.fill();
}

function strokeRound(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  paint: Paint,
  lineWidth: number,
): void {
  roundRectPath(ctx, x, y, w, h, r);
  ctx.strokeStyle = paint;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

function verticalGradient(
  ctx: Ctx,
  y0: number,
  y1: number,
  from: string,
  to: string,
): CanvasGradient {
  const grad = ctx.createLinearGradient(0, y0, 0, y1);
  grad.addColorStop(0, from);
  grad.addColorStop(1, to);
  return grad;
}

function horizontalGradient(
  ctx: Ctx,
  x0: number,
  x1: number,
  from: string,
  to: string,
): CanvasGradient {
  const grad = ctx.createLinearGradient(x0, 0, x1, 0);
  grad.addColorStop(0, from);
  grad.addColorStop(1, to);
  return grad;
}

function drawText(
  ctx: Ctx,
  text: string,
  x: number,
  y: number,
  font: string,
  color: string,
  align: CanvasTextAlign = 'left',
): void {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
  ctx.textAlign = 'left';
}

function drawCornerBrackets(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  len: number,
  color: string,
  lineWidth: number,
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y + len);
  ctx.lineTo(x, y);
  ctx.lineTo(x + len, y);
  ctx.moveTo(x + w - len, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + len);
  ctx.moveTo(x + w, y + h - len);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w - len, y + h);
  ctx.moveTo(x + len, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + h - len);
  ctx.stroke();
  ctx.lineCap = 'butt';
}

function drawLogoChip(ctx: Ctx, x: number, y: number, size: number): void {
  const grad = ctx.createLinearGradient(x, y, x + size, y + size);
  grad.addColorStop(0, UI.cyan);
  grad.addColorStop(1, UI.blue);
  fillRound(ctx, x, y, size, size, size * 0.3, grad);

  const inset = size * 0.28;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(2, size * 0.1);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x + inset, y + inset);
  ctx.lineTo(x + size - inset, y + size - inset);
  ctx.moveTo(x + size - inset, y + inset);
  ctx.lineTo(x + inset, y + size - inset);
  ctx.stroke();
  ctx.lineCap = 'butt';
}

function drawChip(
  ctx: Ctx,
  text: string,
  x: number,
  y: number,
  font: string,
  textColor: string,
  background: string,
  anchor: 'left' | 'right',
): void {
  ctx.font = font;
  const padX = 10;
  const chipH = 24;
  const chipW = Math.ceil(ctx.measureText(text).width) + padX * 2;
  const chipX = anchor === 'left' ? x : x - chipW;
  fillRound(ctx, chipX, y, chipW, chipH, 8, background);
  drawText(ctx, text, chipX + padX, y + chipH / 2 + 0.5, font, textColor);
}

function drawScreenHeader(
  ctx: Ctx,
  w: number,
  title: string,
  subtitle: string,
  accent: string,
): void {
  ctx.fillStyle = 'rgba(15, 24, 41, 0.96)';
  ctx.fillRect(0, 0, w, 56);
  ctx.fillStyle = horizontalGradient(ctx, 0, w, accent, 'rgba(37, 99, 235, 0.12)');
  ctx.fillRect(0, 55, w, 1.5);
  drawLogoChip(ctx, 18, 12, 32);
  drawText(ctx, title, 62, 21, `700 16px ${UI_SANS}`, UI.text);
  drawText(ctx, subtitle, 62, 40, `500 11.5px ${UI_SANS}`, UI.textMuted);
}

function drawFeedScene(
  ctx: Ctx,
  x: number,
  y: number,
  cw: number,
  ch: number,
  idx: number,
  t: number,
  color: string,
  subject: string,
): void {
  ctx.save();
  roundRectPath(ctx, x, y, cw, ch, 12);
  ctx.clip();

  ctx.fillStyle = verticalGradient(ctx, y, y + ch, '#111d35', '#060b15');
  ctx.fillRect(x, y, cw, ch);

  const horizon = y + ch * 0.46;
  const vanishX = x + cw * (idx % 2 === 0 ? 0.44 : 0.56);

  // Warehouse floor falling away from the horizon
  ctx.fillStyle = verticalGradient(
    ctx,
    horizon,
    y + ch,
    'rgba(148, 163, 184, 0.10)',
    'rgba(148, 163, 184, 0.02)',
  );
  ctx.fillRect(x, horizon, cw, y + ch - horizon);

  // Dock doors along the back wall
  for (let i = 0; i < 6; i++) {
    fillRound(
      ctx,
      x + cw * (0.06 + i * 0.155),
      horizon - ch * 0.24,
      cw * 0.11,
      ch * 0.2,
      3,
      'rgba(148, 163, 184, 0.09)',
    );
  }

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, horizon);
  ctx.lineTo(x + cw, horizon);
  ctx.stroke();

  // Lane perspective lines
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.15)';
  for (let i = -3; i <= 3; i++) {
    ctx.beginPath();
    ctx.moveTo(vanishX, horizon);
    ctx.lineTo(vanishX + i * cw * 0.3, y + ch);
    ctx.stroke();
  }

  // Tracked subject drifting through the frame
  const isPerson = subject === 'PERSON';
  const travel = (t * (14 + idx * 4) + idx * 90) % (cw + 120);
  const subjectW = isPerson ? 20 : 74;
  const subjectH = isPerson ? 46 : 34;
  const subjectX = x - 60 + travel;
  const subjectY = y + ch * 0.62 - subjectH / 2 + (idx % 2) * 8;
  fillRound(
    ctx,
    subjectX,
    subjectY,
    subjectW,
    subjectH,
    isPerson ? 8 : 6,
    'rgba(203, 213, 225, 0.16)',
  );
  drawCornerBrackets(ctx, subjectX - 5, subjectY - 5, subjectW + 10, subjectH + 10, 8, color, 1.8);
  drawText(ctx, subject, subjectX - 5, subjectY - 14, `700 9.5px ${UI_MONO}`, color);

  // Lens vignette
  const vignette = ctx.createRadialGradient(
    x + cw / 2,
    y + ch / 2,
    ch * 0.25,
    x + cw / 2,
    y + ch / 2,
    cw * 0.62,
  );
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
  ctx.fillStyle = vignette;
  ctx.fillRect(x, y, cw, ch);

  ctx.restore();
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

  ctx.fillStyle = verticalGradient(ctx, 0, h, UI.bgTop, UI.bgBottom);
  ctx.fillRect(0, 0, w, h);

  // Application header
  drawScreenHeader(ctx, w, 'MILESTONE XPROTECT', 'Smart Client', UI.cyan);

  const siteName = state.siteId === 'ekart' ? 'EKART LOGISTICS' : 'FLIPKART KALASH';
  drawText(
    ctx,
    `${siteName} · ${formatLiveTimecode(t)}`,
    288,
    28,
    `600 12.5px ${UI_MONO}`,
    UI.sky,
  );

  const tabs: Array<{ id: VmsViewMode; label: string }> = [
    { id: 'live', label: 'LIVE' },
    { id: 'playback', label: 'PLAYBACK' },
    { id: 'smart-map', label: 'SMART MAP' },
    { id: 'alarms', label: 'ALARMS' },
  ];
  const tabW = 94;
  const tabGap = 6;
  const tabsW = tabs.length * tabW + (tabs.length - 1) * tabGap;
  const tabsX = w - 20 - tabsW;
  fillRound(ctx, tabsX - 5, 11, tabsW + 10, 34, 11, 'rgba(6, 10, 18, 0.8)');
  strokeRound(ctx, tabsX - 5, 11, tabsW + 10, 34, 11, UI.hairline, 1);
  tabs.forEach((tab, i) => {
    const tx = tabsX + i * (tabW + tabGap);
    const active = tab.id === state.mode;
    if (active) {
      fillRound(ctx, tx, 14, tabW, 28, 8, horizontalGradient(ctx, tx, tx + tabW, UI.blue, UI.sky));
    }
    drawText(
      ctx,
      tab.label,
      tx + tabW / 2,
      28.5,
      `700 11.5px ${UI_MONO}`,
      active ? '#ffffff' : UI.textMuted,
      'center',
    );
  });

  const feeds = [
    {
      code: 'GATE · GIGO IN',
      name: 'Gate · GIGO In',
      zone: 'Flipkart Kalash · Lane A',
      feed: 'op2',
      color: UI.green,
      subject: 'VEHICLE',
    },
    {
      code: 'DOCK APRON',
      name: 'Dock Apron',
      zone: 'Loading bays',
      feed: 'op1',
      color: UI.cyan,
      subject: 'VEHICLE',
    },
    {
      code: 'HIGH-VALUE BAY',
      name: 'High-Value Bay',
      zone: 'Loss prevention zone',
      feed: 'op3',
      color: UI.amber,
      subject: 'PERSON',
    },
    {
      code: 'PERIMETER NORTH',
      name: 'Perimeter North',
      zone: state.siteId === 'ekart' ? 'Ekart Logistics' : 'Dispatch corridor',
      feed: 'op4',
      color: UI.violet,
      subject: 'VEHICLE',
    },
  ].map((cam) => ({
    ...cam,
    highlighted:
      (state.mode === 'playback' && cam.feed === 'op4') ||
      (state.mode === 'alarms' && cam.feed === 'op3') ||
      state.feedId === cam.feed,
  }));

  // Layout
  const pad = 16;
  const gap = 12;
  const bodyY = 70;
  const timelineH = 74;
  const timelineY = h - 14 - timelineH;
  const bodyH = timelineY - gap - bodyY;
  const sideW = 168;
  const gridX = pad + sideW + gap;
  const gridW = w - gridX - pad;
  const cellW = (gridW - gap) / 2;
  const cellH = (bodyH - gap) / 2;

  // Left navigation pane (views + system status)
  fillRound(ctx, pad, bodyY, sideW, bodyH, 14, UI.panel);
  strokeRound(ctx, pad, bodyY, sideW, bodyH, 14, UI.hairline, 1);
  drawText(ctx, 'VIEWS', pad + 16, bodyY + 22, `700 10.5px ${UI_MONO}`, UI.textMuted);

  feeds.forEach((cam, idx) => {
    const rowY = bodyY + 38 + idx * 42;
    if (cam.highlighted) {
      fillRound(ctx, pad + 8, rowY, sideW - 16, 34, 9, 'rgba(56, 189, 248, 0.12)');
      fillRound(ctx, pad + 8, rowY + 8, 3, 18, 2, cam.color);
    }
    ctx.fillStyle = cam.color;
    ctx.beginPath();
    ctx.arc(pad + 24, rowY + 17, 4.5, 0, Math.PI * 2);
    ctx.fill();
    drawText(
      ctx,
      cam.name,
      pad + 38,
      rowY + 17.5,
      `600 12.5px ${UI_SANS}`,
      cam.highlighted ? UI.text : '#b6c4d9',
    );
  });

  const systemTitleY = bodyY + 38 + feeds.length * 42 + 12;
  drawText(ctx, 'SYSTEM', pad + 16, systemTitleY, `700 10.5px ${UI_MONO}`, UI.textMuted);
  const systemRows = [
    { label: 'Recording', status: 'ONLINE', tone: UI.green },
    { label: 'Archive', status: 'HEALTHY', tone: UI.cyan },
    { label: 'Gate log', status: 'SYNCED', tone: UI.amber },
  ];
  systemRows.forEach((row, idx) => {
    const rowY = systemTitleY + 16 + idx * 34;
    fillRound(ctx, pad + 8, rowY, sideW - 16, 28, 8, 'rgba(148, 163, 184, 0.06)');
    drawText(ctx, row.label, pad + 20, rowY + 14.5, `600 12px ${UI_SANS}`, '#b6c4d9');
    drawText(
      ctx,
      row.status,
      pad + sideW - 18,
      rowY + 14.5,
      `700 10px ${UI_MONO}`,
      row.tone,
      'right',
    );
  });

  // 2x2 live view grid
  feeds.forEach((cam, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = gridX + col * (cellW + gap);
    const y = bodyY + row * (cellH + gap);
    const alarmCell = state.mode === 'alarms' && idx === 2;
    const boxColor = alarmCell ? UI.amber : cam.color;

    drawFeedScene(ctx, x, y, cellW, cellH, idx, t, boxColor, cam.subject);

    // Camera name tag
    ctx.font = `700 11px ${UI_MONO}`;
    const tagW = Math.ceil(ctx.measureText(cam.code).width) + 34;
    fillRound(ctx, x + 8, y + 8, tagW, 24, 8, 'rgba(6, 10, 18, 0.8)');
    ctx.fillStyle = cam.color;
    ctx.beginPath();
    ctx.arc(x + 20, y + 20, 3.5, 0, Math.PI * 2);
    ctx.fill();
    drawText(ctx, cam.code, x + 30, y + 20.5, `700 11px ${UI_MONO}`, UI.text);

    // REC badge
    const recW = 58;
    const recX = x + cellW - 8 - recW;
    fillRound(ctx, recX, y + 8, recW, 24, 8, 'rgba(6, 10, 18, 0.8)');
    if (recBlink || idx % 2 === 0) {
      ctx.fillStyle = alarmCell ? UI.amber : UI.red;
      ctx.beginPath();
      ctx.arc(recX + 15, y + 20, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
    drawText(
      ctx,
      'REC',
      recX + 25,
      y + 20.5,
      `700 10.5px ${UI_MONO}`,
      alarmCell ? UI.amber : '#fca5a5',
    );

    drawText(ctx, cam.zone, x + 14, y + cellH - 15, `500 11.5px ${UI_SANS}`, UI.textMuted);

    strokeRound(
      ctx,
      x,
      y,
      cellW,
      cellH,
      12,
      cam.highlighted ? cam.color : UI.hairline,
      cam.highlighted ? 2.5 : 1,
    );
  });

  // Timeline / sequence scrubber
  fillRound(ctx, pad, timelineY, w - pad * 2, timelineH, 14, UI.panel);
  strokeRound(ctx, pad, timelineY, w - pad * 2, timelineH, 14, UI.hairline, 1);

  const modeStatus =
    state.mode === 'playback'
      ? 'PLAYBACK · ARCHIVE LOCKED · EXPORT READY'
      : state.mode === 'alarms'
        ? 'ALARM SEQUENCE · GATE & PERIMETER TRIGGERS ACTIVE'
        : state.mode === 'smart-map'
          ? 'SMART MAP LINKED · PATLI HUB ACTIVE'
          : 'LIVE · RECORDING SERVER ONLINE · 24/7';
  drawText(ctx, modeStatus, pad + 20, timelineY + 18, `600 11.5px ${UI_MONO}`, UI.textMuted);
  drawText(
    ctx,
    formatLiveTimecode(t),
    w - pad - 20,
    timelineY + 18,
    `700 11.5px ${UI_MONO}`,
    UI.text,
    'right',
  );

  const trackX = pad + 22;
  const trackW = w - pad * 2 - 44;
  const trackY = timelineY + 34;
  const isPlayback = state.mode === 'playback';
  const headRatio = Math.min(
    0.98,
    Math.max(0.02, (isPlayback ? 0.64 : 0.84) + Math.sin(t * 0.45) * 0.04),
  );
  const headX = trackX + trackW * headRatio;

  fillRound(ctx, trackX, trackY, trackW, 8, 4, 'rgba(148, 163, 184, 0.14)');
  fillRound(
    ctx,
    trackX,
    trackY,
    trackW * headRatio,
    8,
    4,
    isPlayback
      ? horizontalGradient(ctx, trackX, headX, '#e11d48', '#fb7185')
      : horizontalGradient(ctx, trackX, headX, UI.blue, UI.cyan),
  );
  fillRound(ctx, trackX + trackW * 0.18, trackY - 5, trackW * 0.14, 4, 2, UI.green);
  fillRound(ctx, trackX + trackW * 0.5, trackY - 5, trackW * 0.06, 4, 2, UI.green);
  fillRound(ctx, trackX + trackW * 0.64 - 3, trackY - 8, 6, 24, 3, UI.amber);

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.32)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= 48; i++) {
    const tickX = trackX + (trackW * i) / 48;
    ctx.moveTo(tickX, trackY + 16);
    ctx.lineTo(tickX, trackY + (i % 6 === 0 ? 26 : 21));
  }
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.fillRect(headX - 4, trackY - 12, 8, 36);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(headX - 1.5, trackY - 12, 3, 36);
  ctx.beginPath();
  ctx.arc(headX, trackY - 12, 4.5, 0, Math.PI * 2);
  ctx.fill();
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

  ctx.fillStyle = verticalGradient(ctx, 0, h, UI.bgTop, UI.bgBottom);
  ctx.fillRect(0, 0, w, h);

  drawScreenHeader(
    ctx,
    w,
    state.mode === 'alarms' ? 'ALARM MANAGER' : 'SMART MAP · NCR',
    'XProtect Smart Client',
    UI.amber,
  );

  // Map viewport
  const mapX = 20;
  const mapY = 72;
  const mapW = w - 40;
  const mapH = 330;

  ctx.save();
  roundRectPath(ctx, mapX, mapY, mapW, mapH, 16);
  ctx.clip();

  const mapBase = ctx.createRadialGradient(
    mapX + mapW * 0.5,
    mapY + mapH * 0.45,
    20,
    mapX + mapW * 0.5,
    mapY + mapH * 0.45,
    mapW * 0.75,
  );
  mapBase.addColorStop(0, '#12213a');
  mapBase.addColorStop(1, '#070c16');
  ctx.fillStyle = mapBase;
  ctx.fillRect(mapX, mapY, mapW, mapH);

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.06)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let gx = mapX + 40; gx < mapX + mapW; gx += 40) {
    ctx.moveTo(gx, mapY);
    ctx.lineTo(gx, mapY + mapH);
  }
  for (let gy = mapY + 40; gy < mapY + mapH; gy += 40) {
    ctx.moveTo(mapX, gy);
    ctx.lineTo(mapX + mapW, gy);
  }
  ctx.stroke();

  // Road network
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.11)';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(mapX + 10, mapY + 270);
  ctx.bezierCurveTo(mapX + 150, mapY + 230, mapX + 300, mapY + 150, mapX + mapW - 10, mapY + 86);
  ctx.moveTo(mapX + 70, mapY + 20);
  ctx.lineTo(mapX + mapW - 60, mapY + mapH - 20);
  ctx.stroke();
  ctx.lineCap = 'butt';

  const flipkartActive = state.siteId === 'flipkart';
  const fx = w * 0.38;
  const fy = mapY + 130;
  const ex = w * 0.66;
  const ey = mapY + 240;

  // Corridor link between the two sites
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.55)';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);
  ctx.lineDashOffset = -t * 12;
  ctx.beginPath();
  ctx.moveTo(fx, fy);
  ctx.lineTo(ex, ey);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.lineDashOffset = 0;

  // Site pins (the active site pulses)
  const pulse = (t * 14) % 26;
  const drawPin = (px: number, py: number, color: string, active: boolean): void => {
    if (active) {
      ctx.strokeStyle = color;
      ctx.globalAlpha = Math.max(0.08, 0.6 - pulse / 40);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, 14 + pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = 'rgba(6, 10, 18, 0.9)';
    ctx.beginPath();
    ctx.arc(px, py, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(px, py, active ? 8 : 6, 0, Math.PI * 2);
    ctx.fill();
  };
  drawPin(fx, fy, UI.cyan, flipkartActive);
  drawPin(ex, ey, UI.amber, !flipkartActive);

  drawChip(
    ctx,
    'FLIPKART KALASH HUB',
    fx + 18,
    fy - 12,
    `700 11.5px ${UI_MONO}`,
    UI.text,
    'rgba(6, 10, 18, 0.82)',
    'left',
  );
  drawChip(
    ctx,
    'EKART LOGISTICS',
    ex - 18,
    ey - 12,
    `700 11.5px ${UI_MONO}`,
    UI.text,
    'rgba(6, 10, 18, 0.82)',
    'right',
  );
  ctx.restore();
  strokeRound(ctx, mapX, mapY, mapW, mapH, 16, 'rgba(34, 211, 238, 0.22)', 1.5);

  drawChip(
    ctx,
    'LIVE SITE MAP',
    mapX + 12,
    mapY + 12,
    `700 10.5px ${UI_MONO}`,
    UI.textMuted,
    'rgba(6, 10, 18, 0.72)',
    'left',
  );

  // System & gate telemetry
  const queueY = mapY + mapH + 24;
  drawText(ctx, 'SYSTEM & GATE TELEMETRY', 20, queueY, `700 11.5px ${UI_MONO}`, UI.sky);

  const rows = [
    { k: 'SERVER', v: 'XProtect VMS · Online', tone: UI.green },
    { k: 'GATE GIGO', v: 'Synced · 100% Log Accuracy', tone: UI.cyan },
    {
      k: 'ACTIVE HUB',
      v: flipkartActive ? 'Flipkart Kalash, Patli' : 'Ekart Logistics, HR',
      tone: UI.amber,
    },
    { k: 'PLAYBACK', v: 'Archive Nominal · 24/7', tone: UI.violet },
  ];

  rows.forEach((row, idx) => {
    const ry = queueY + 20 + idx * 46;
    fillRound(ctx, 20, ry, w - 40, 38, 10, UI.panel);
    strokeRound(ctx, 20, ry, w - 40, 38, 10, UI.hairline, 1);
    fillRound(ctx, 20, ry + 8, 3, 22, 2, row.tone);
    drawText(ctx, row.k, 36, ry + 19.5, `700 11px ${UI_MONO}`, row.tone);
    drawText(ctx, row.v, 134, ry + 19.5, `500 12.5px ${UI_SANS}`, UI.text);
  });
}

export function drawBriefCamCanvas(canvas: HTMLCanvasElement, state: SmartClientRenderState): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  const t = state.time ?? 0;

  ctx.fillStyle = verticalGradient(ctx, 0, h, UI.bgTop, UI.bgBottom);
  ctx.fillRect(0, 0, w, h);

  drawScreenHeader(ctx, w, 'BRIEFCAM ANALYTICS · LPR', 'Video content analytics', UI.cyan);

  // Gate bay motion spectrum
  const panelX = 20;
  const panelY = 72;
  const panelW = w - 40;
  const panelH = 172;
  fillRound(ctx, panelX, panelY, panelW, panelH, 14, UI.panel);
  strokeRound(ctx, panelX, panelY, panelW, panelH, 14, UI.hairline, 1);
  drawText(ctx, 'GATE BAY MOTION', panelX + 16, panelY + 22, `700 11.5px ${UI_MONO}`, UI.sky);

  const baseY = panelY + panelH - 18;
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const gy = baseY - 28 - i * 24;
    ctx.moveTo(panelX + 16, gy);
    ctx.lineTo(panelX + panelW - 16, gy);
  }
  ctx.stroke();

  const bars = 18;
  const barSlot = (panelW - 32) / bars;
  for (let i = 0; i < bars; i++) {
    const val = 0.25 + 0.7 * Math.abs(Math.sin(t * 2.1 + i * 0.55));
    const barH = 96 * val;
    const bx = panelX + 16 + i * barSlot + 2;
    const by = baseY - barH;
    const warm = i % 5 === 0;
    const grad = verticalGradient(
      ctx,
      by,
      baseY,
      warm ? UI.amber : UI.cyan,
      warm ? 'rgba(245, 158, 11, 0.25)' : 'rgba(37, 99, 235, 0.3)',
    );
    fillRound(ctx, bx, by, Math.max(6, barSlot - 5), barH, 3, grad);
  }

  // Live plate stream (plates are masked sample data)
  drawText(ctx, 'LIVE LPR STREAM', 20, 270, `700 11.5px ${UI_MONO}`, UI.textMuted);

  const entries = [
    { plate: 'HR-55-AK-••••', bay: 'DOCK IN', status: 'VERIFIED', tone: UI.green },
    { plate: 'HR-38-TR-••••', bay: 'GIGO GATE', status: 'CLEARED', tone: UI.cyan },
    { plate: 'DL-01-GC-••••', bay: 'PERIMETER', status: 'CHECKED', tone: UI.sky },
    { plate: 'HR-26-LP-••••', bay: 'HIGH-VALUE BAY', status: 'ALERT OK', tone: UI.amber },
  ];

  entries.forEach((item, idx) => {
    const ey = 288 + idx * 76;
    fillRound(ctx, 20, ey, w - 40, 62, 12, UI.panel);
    strokeRound(ctx, 20, ey, w - 40, 62, 12, UI.hairline, 1);
    fillRound(ctx, 20, ey + 12, 3, 38, 2, item.tone);

    drawText(ctx, item.plate, 38, ey + 22, `700 15px ${UI_MONO}`, UI.text);
    drawText(
      ctx,
      `${item.bay} · ${formatLiveTimecode(t + idx * 14)}`,
      38,
      ey + 44,
      `500 11.5px ${UI_MONO}`,
      UI.textMuted,
    );
    drawChip(
      ctx,
      item.status,
      w - 34,
      ey + 19,
      `700 10.5px ${UI_MONO}`,
      item.tone,
      'rgba(148, 163, 184, 0.1)',
      'right',
    );
  });
}

export function createSurveillanceMaterials(
  _isSoftwareGl: boolean,
  maxAnisotropy: number,
  initialFinish: FinishId,
  initialScreenState: SmartClientRenderState,
): MaterialBundle {
  const preset = FINISH_PRESETS[initialFinish];
  const contactShadowTex = createContactShadowTexture();
  const floorFadeTex = createFloorFadeTexture();

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

  // Fully matte, non-metallic surfaces: no clearcoat, no roughness maps, no mirror-like reflections.
  const plinth = new THREE.MeshStandardMaterial({
    color: 0x151a22,
    metalness: 0,
    roughness: 0.96,
    transparent: true,
    alphaMap: floorFadeTex,
  });

  const deskSlab = new THREE.MeshStandardMaterial({
    color: 0x3a3f49,
    metalness: 0,
    roughness: 0.88,
  });

  const deskMat = new THREE.MeshStandardMaterial({
    color: 0x14181f,
    metalness: 0,
    roughness: 1,
  });

  const contactShadow = new THREE.MeshBasicMaterial({
    map: contactShadowTex,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });

  const chassis = new THREE.MeshStandardMaterial({
    color: preset.chassisColor,
    metalness: preset.chassisMetalness,
    roughness: preset.chassisRoughness,
  });

  const serverFaceplate = new THREE.MeshStandardMaterial({
    color: 0x12161c,
    metalness: 0.1,
    roughness: 0.74,
  });

  const armMetal = new THREE.MeshStandardMaterial({
    color: preset.armColor,
    metalness: 0.12,
    roughness: 0.7,
  });

  const switchBody = new THREE.MeshStandardMaterial({
    color: 0x1b2028,
    metalness: 0.08,
    roughness: 0.76,
  });

  const cable = new THREE.MeshStandardMaterial({
    color: 0x0d1016,
    metalness: 0,
    roughness: 0.92,
  });

  const keycap = new THREE.MeshStandardMaterial({
    color: 0x262b34,
    metalness: 0,
    roughness: 0.8,
  });

  const portLed = new THREE.MeshStandardMaterial({
    color: 0x34d399,
    emissive: 0x10b981,
    emissiveIntensity: 1.1,
    metalness: 0,
    roughness: 0.5,
  });

  const alarmKey = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.55,
    metalness: 0,
    roughness: 0.6,
  });

  const primaryScreen = new THREE.MeshBasicMaterial({ map: primaryTexture });
  const auxScreen = new THREE.MeshBasicMaterial({ map: auxTexture });
  const briefcamScreen = new THREE.MeshBasicMaterial({ map: briefcamTexture });

  return {
    plinth,
    deskSlab,
    deskMat,
    contactShadow,
    chassis,
    serverFaceplate,
    armMetal,
    switchBody,
    cable,
    keycap,
    portLed,
    alarmKey,
    primaryScreen,
    auxScreen,
    briefcamScreen,
    primaryCanvas,
    primaryTexture,
    auxCanvas,
    auxTexture,
    briefcamCanvas,
    briefcamTexture,
    textures: [contactShadowTex, floorFadeTex, primaryTexture, auxTexture, briefcamTexture],
  };
}

export function applyFinishPreset(bundle: MaterialBundle, finishId: FinishId): void {
  const preset = FINISH_PRESETS[finishId];
  bundle.chassis.color.setHex(preset.chassisColor);
  bundle.chassis.metalness = preset.chassisMetalness;
  bundle.chassis.roughness = preset.chassisRoughness;
  bundle.armMetal.color.setHex(preset.armColor);
}

export function applyInterpolatedThemeToMaterials(
  bundle: MaterialBundle,
  themeState: InterpolatedSceneTheme,
): void {
  const t = themeState.mix;
  bundle.plinth.color.copy(themeState.plinth);
  bundle.plinth.envMapIntensity = 0.35 + t * 0.2;

  bundle.deskSlab.color.copy(themeState.deskSlab);
  bundle.deskSlab.envMapIntensity = 0.55;

  bundle.chassis.envMapIntensity = 0.6;
  bundle.contactShadow.opacity = themeState.contactShadowOpacity;

  // Status LEDs stay small and readable instead of blooming into glow blobs
  bundle.portLed.emissiveIntensity = 1.1 - t * 0.4;
  bundle.alarmKey.emissiveIntensity = 0.55 - t * 0.2;
}

export function disposeMaterialBundle(bundle: MaterialBundle): void {
  bundle.plinth.dispose();
  bundle.deskSlab.dispose();
  bundle.deskMat.dispose();
  bundle.contactShadow.dispose();
  bundle.chassis.dispose();
  bundle.serverFaceplate.dispose();
  bundle.armMetal.dispose();
  bundle.switchBody.dispose();
  bundle.cable.dispose();
  bundle.keycap.dispose();
  bundle.portLed.dispose();
  bundle.alarmKey.dispose();
  bundle.primaryScreen.dispose();
  bundle.auxScreen.dispose();
  bundle.briefcamScreen.dispose();
  for (const tex of bundle.textures) {
    tex.dispose();
  }
}
