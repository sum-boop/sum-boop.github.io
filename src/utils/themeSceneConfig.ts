import * as THREE from 'three';
import type { ThemeMode } from '@/hooks/useTheme';

export interface SceneThemePreset {
  backgroundHex: number;
  fogHex: number;
  fogDensity: number;
  hemiSkyHex: number;
  hemiGroundHex: number;
  hemiIntensity: number;
  keyLightHex: number;
  keyLightIntensity: number;
  rimLightHex: number;
  rimLightIntensity: number;
  screenBounceHex: number;
  screenBounceIntensity: number;
  warmAccentHex: number;
  warmAccentIntensity: number;
  softboxHex: number;
  softboxIntensity: number;
  environmentIntensity: number;
  toneMappingExposure: number;
  bloomStrength: number;
  bloomThreshold: number;
  bloomRadius: number;
  grainIntensity: number;
  scanlineIntensity: number;
  vignetteDarkness: number;
  chromaticAmount: number;
  plinthHex: number;
  deskSlabHex: number;
  deskGridHex: number;
  deskGridOpacity: number;
  contactShadowOpacity: number;
  accentTrimHex: number;
  accentTrimEmissiveHex: number;
  accentTrimEmissiveIntensity: number;
  holoWireHex: number;
  holoWireOpacity: number;
  dustHex: number;
  dustOpacity: number;
  hoverHex: number;
}

export const DARK_SCENE_THEME: SceneThemePreset = {
  backgroundHex: 0x0e1218,
  fogHex: 0x0e1218,
  fogDensity: 0.03,
  hemiSkyHex: 0xdbe4f0,
  hemiGroundHex: 0x1b1f27,
  hemiIntensity: 0.5,
  keyLightHex: 0xfff4e6,
  keyLightIntensity: 2.1,
  rimLightHex: 0xa9bdd6,
  rimLightIntensity: 0.5,
  screenBounceHex: 0x7fb2e0,
  screenBounceIntensity: 0.35,
  warmAccentHex: 0xf5b45b,
  warmAccentIntensity: 0.25,
  softboxHex: 0xe6eef8,
  softboxIntensity: 1.3,
  environmentIntensity: 0.55,
  toneMappingExposure: 1,
  bloomStrength: 0.14,
  bloomThreshold: 0.92,
  bloomRadius: 0.3,
  grainIntensity: 0.012,
  scanlineIntensity: 0.012,
  vignetteDarkness: 0.3,
  chromaticAmount: 0.0007,
  plinthHex: 0x171c25,
  deskSlabHex: 0x262a31,
  deskGridHex: 0x00e5ff,
  deskGridOpacity: 0.1,
  contactShadowOpacity: 0.6,
  accentTrimHex: 0x00e5ff,
  accentTrimEmissiveHex: 0x00e5ff,
  accentTrimEmissiveIntensity: 0.4,
  holoWireHex: 0x00e5ff,
  holoWireOpacity: 0.1,
  dustHex: 0x7dd3fc,
  dustOpacity: 0.1,
  hoverHex: 0x38bdf8,
};

export const LIGHT_SCENE_THEME: SceneThemePreset = {
  backgroundHex: 0xf5f7fa,
  fogHex: 0xf5f7fa,
  fogDensity: 0.018,
  hemiSkyHex: 0xf8fbff,
  hemiGroundHex: 0xc5d2e2,
  hemiIntensity: 1.12,
  keyLightHex: 0xfffaf2,
  keyLightIntensity: 2.05,
  rimLightHex: 0x0284c7,
  rimLightIntensity: 1.28,
  screenBounceHex: 0x0e6796,
  screenBounceIntensity: 0.72,
  warmAccentHex: 0xd97706,
  warmAccentIntensity: 0.54,
  softboxHex: 0xffffff,
  softboxIntensity: 1.72,
  environmentIntensity: 0.68,
  toneMappingExposure: 1.0,
  bloomStrength: 0.11,
  bloomThreshold: 0.96,
  bloomRadius: 0.24,
  grainIntensity: 0.006,
  scanlineIntensity: 0.009,
  vignetteDarkness: 0.14,
  chromaticAmount: 0.0004,
  plinthHex: 0xe6ecf4,
  deskSlabHex: 0x162235,
  deskGridHex: 0x0e6796,
  deskGridOpacity: 0.32,
  contactShadowOpacity: 0.4,
  accentTrimHex: 0x0284c7,
  accentTrimEmissiveHex: 0x0369a1,
  accentTrimEmissiveIntensity: 0.68,
  holoWireHex: 0x0e6796,
  holoWireOpacity: 0.64,
  dustHex: 0x0284c7,
  dustOpacity: 0.68,
  hoverHex: 0x0e6796,
};

export interface InterpolatedSceneTheme {
  mix: number;
  background: THREE.Color;
  fog: THREE.Color;
  fogDensity: number;
  hemiSky: THREE.Color;
  hemiGround: THREE.Color;
  hemiIntensity: number;
  keyLight: THREE.Color;
  keyLightIntensity: number;
  rimLight: THREE.Color;
  rimLightIntensity: number;
  screenBounce: THREE.Color;
  screenBounceIntensity: number;
  warmAccent: THREE.Color;
  warmAccentIntensity: number;
  softbox: THREE.Color;
  softboxIntensity: number;
  environmentIntensity: number;
  toneMappingExposure: number;
  bloomStrength: number;
  bloomThreshold: number;
  bloomRadius: number;
  grainIntensity: number;
  scanlineIntensity: number;
  vignetteDarkness: number;
  chromaticAmount: number;
  plinth: THREE.Color;
  deskSlab: THREE.Color;
  deskGrid: THREE.Color;
  deskGridOpacity: number;
  contactShadowOpacity: number;
  accentTrim: THREE.Color;
  accentTrimEmissive: THREE.Color;
  accentTrimEmissiveIntensity: number;
  holoWire: THREE.Color;
  holoWireOpacity: number;
  dust: THREE.Color;
  dustOpacity: number;
  dustUseNormalBlending: boolean;
  hover: THREE.Color;
}

const _darkColor = new THREE.Color();
const _lightColor = new THREE.Color();

function lerpNumber(a: number, b: number, t: number): number {
  if (t <= 0) return a;
  if (t >= 1) return b;
  return a + (b - a) * t;
}

function lerpHexInto(
  target: THREE.Color,
  darkHex: number,
  lightHex: number,
  t: number,
): THREE.Color {
  _darkColor.setHex(darkHex);
  _lightColor.setHex(lightHex);
  return target.copy(_darkColor).lerp(_lightColor, t);
}

export function createInterpolatedThemeBuffer(): InterpolatedSceneTheme {
  return {
    mix: 0,
    background: new THREE.Color(DARK_SCENE_THEME.backgroundHex),
    fog: new THREE.Color(DARK_SCENE_THEME.fogHex),
    fogDensity: DARK_SCENE_THEME.fogDensity,
    hemiSky: new THREE.Color(DARK_SCENE_THEME.hemiSkyHex),
    hemiGround: new THREE.Color(DARK_SCENE_THEME.hemiGroundHex),
    hemiIntensity: DARK_SCENE_THEME.hemiIntensity,
    keyLight: new THREE.Color(DARK_SCENE_THEME.keyLightHex),
    keyLightIntensity: DARK_SCENE_THEME.keyLightIntensity,
    rimLight: new THREE.Color(DARK_SCENE_THEME.rimLightHex),
    rimLightIntensity: DARK_SCENE_THEME.rimLightIntensity,
    screenBounce: new THREE.Color(DARK_SCENE_THEME.screenBounceHex),
    screenBounceIntensity: DARK_SCENE_THEME.screenBounceIntensity,
    warmAccent: new THREE.Color(DARK_SCENE_THEME.warmAccentHex),
    warmAccentIntensity: DARK_SCENE_THEME.warmAccentIntensity,
    softbox: new THREE.Color(DARK_SCENE_THEME.softboxHex),
    softboxIntensity: DARK_SCENE_THEME.softboxIntensity,
    environmentIntensity: DARK_SCENE_THEME.environmentIntensity,
    toneMappingExposure: DARK_SCENE_THEME.toneMappingExposure,
    bloomStrength: DARK_SCENE_THEME.bloomStrength,
    bloomThreshold: DARK_SCENE_THEME.bloomThreshold,
    bloomRadius: DARK_SCENE_THEME.bloomRadius,
    grainIntensity: DARK_SCENE_THEME.grainIntensity,
    scanlineIntensity: DARK_SCENE_THEME.scanlineIntensity,
    vignetteDarkness: DARK_SCENE_THEME.vignetteDarkness,
    chromaticAmount: DARK_SCENE_THEME.chromaticAmount,
    plinth: new THREE.Color(DARK_SCENE_THEME.plinthHex),
    deskSlab: new THREE.Color(DARK_SCENE_THEME.deskSlabHex),
    deskGrid: new THREE.Color(DARK_SCENE_THEME.deskGridHex),
    deskGridOpacity: DARK_SCENE_THEME.deskGridOpacity,
    contactShadowOpacity: DARK_SCENE_THEME.contactShadowOpacity,
    accentTrim: new THREE.Color(DARK_SCENE_THEME.accentTrimHex),
    accentTrimEmissive: new THREE.Color(DARK_SCENE_THEME.accentTrimEmissiveHex),
    accentTrimEmissiveIntensity: DARK_SCENE_THEME.accentTrimEmissiveIntensity,
    holoWire: new THREE.Color(DARK_SCENE_THEME.holoWireHex),
    holoWireOpacity: DARK_SCENE_THEME.holoWireOpacity,
    dust: new THREE.Color(DARK_SCENE_THEME.dustHex),
    dustOpacity: DARK_SCENE_THEME.dustOpacity,
    dustUseNormalBlending: false,
    hover: new THREE.Color(DARK_SCENE_THEME.hoverHex),
  };
}

export function interpolateSceneTheme(
  rawMix: number,
  out: InterpolatedSceneTheme = createInterpolatedThemeBuffer(),
): InterpolatedSceneTheme {
  const t = Math.min(1, Math.max(0, rawMix));
  const D = DARK_SCENE_THEME;
  const L = LIGHT_SCENE_THEME;

  out.mix = t;
  lerpHexInto(out.background, D.backgroundHex, L.backgroundHex, t);
  lerpHexInto(out.fog, D.fogHex, L.fogHex, t);
  out.fogDensity = lerpNumber(D.fogDensity, L.fogDensity, t);

  lerpHexInto(out.hemiSky, D.hemiSkyHex, L.hemiSkyHex, t);
  lerpHexInto(out.hemiGround, D.hemiGroundHex, L.hemiGroundHex, t);
  out.hemiIntensity = lerpNumber(D.hemiIntensity, L.hemiIntensity, t);

  lerpHexInto(out.keyLight, D.keyLightHex, L.keyLightHex, t);
  out.keyLightIntensity = lerpNumber(D.keyLightIntensity, L.keyLightIntensity, t);

  lerpHexInto(out.rimLight, D.rimLightHex, L.rimLightHex, t);
  out.rimLightIntensity = lerpNumber(D.rimLightIntensity, L.rimLightIntensity, t);

  lerpHexInto(out.screenBounce, D.screenBounceHex, L.screenBounceHex, t);
  out.screenBounceIntensity = lerpNumber(D.screenBounceIntensity, L.screenBounceIntensity, t);

  lerpHexInto(out.warmAccent, D.warmAccentHex, L.warmAccentHex, t);
  out.warmAccentIntensity = lerpNumber(D.warmAccentIntensity, L.warmAccentIntensity, t);

  lerpHexInto(out.softbox, D.softboxHex, L.softboxHex, t);
  out.softboxIntensity = lerpNumber(D.softboxIntensity, L.softboxIntensity, t);

  out.environmentIntensity = lerpNumber(D.environmentIntensity, L.environmentIntensity, t);
  out.toneMappingExposure = lerpNumber(D.toneMappingExposure, L.toneMappingExposure, t);

  out.bloomStrength = lerpNumber(D.bloomStrength, L.bloomStrength, t);
  out.bloomThreshold = lerpNumber(D.bloomThreshold, L.bloomThreshold, t);
  out.bloomRadius = lerpNumber(D.bloomRadius, L.bloomRadius, t);

  out.grainIntensity = lerpNumber(D.grainIntensity, L.grainIntensity, t);
  out.scanlineIntensity = lerpNumber(D.scanlineIntensity, L.scanlineIntensity, t);
  out.vignetteDarkness = lerpNumber(D.vignetteDarkness, L.vignetteDarkness, t);
  out.chromaticAmount = lerpNumber(D.chromaticAmount, L.chromaticAmount, t);

  lerpHexInto(out.plinth, D.plinthHex, L.plinthHex, t);
  lerpHexInto(out.deskSlab, D.deskSlabHex, L.deskSlabHex, t);
  lerpHexInto(out.deskGrid, D.deskGridHex, L.deskGridHex, t);
  out.deskGridOpacity = lerpNumber(D.deskGridOpacity, L.deskGridOpacity, t);
  out.contactShadowOpacity = lerpNumber(D.contactShadowOpacity, L.contactShadowOpacity, t);

  lerpHexInto(out.accentTrim, D.accentTrimHex, L.accentTrimHex, t);
  lerpHexInto(out.accentTrimEmissive, D.accentTrimEmissiveHex, L.accentTrimEmissiveHex, t);
  out.accentTrimEmissiveIntensity = lerpNumber(
    D.accentTrimEmissiveIntensity,
    L.accentTrimEmissiveIntensity,
    t,
  );

  lerpHexInto(out.holoWire, D.holoWireHex, L.holoWireHex, t);
  out.holoWireOpacity = lerpNumber(D.holoWireOpacity, L.holoWireOpacity, t);

  lerpHexInto(out.dust, D.dustHex, L.dustHex, t);
  out.dustOpacity = lerpNumber(D.dustOpacity, L.dustOpacity, t);
  out.dustUseNormalBlending = t >= 0.35;

  lerpHexInto(out.hover, D.hoverHex, L.hoverHex, t);

  return out;
}

export function resolveLiveTheme(fallbackTheme: ThemeMode): ThemeMode {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    const attr = root.getAttribute('data-theme');
    if (attr === 'light' || attr === 'dark') {
      return attr;
    }
    if (root.classList.contains('light') || root.classList.contains('theme-light')) {
      return 'light';
    }
    if (root.classList.contains('dark') || root.classList.contains('theme-dark')) {
      return 'dark';
    }
  }
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
  }
  return fallbackTheme;
}
