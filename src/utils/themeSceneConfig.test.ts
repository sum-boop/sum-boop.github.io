import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DARK_SCENE_THEME,
  LIGHT_SCENE_THEME,
  createInterpolatedThemeBuffer,
  interpolateSceneTheme,
} from './themeSceneConfig';

test('interpolateSceneTheme returns exact dark tokens at mix=0 and light tokens at mix=1', () => {
  const buf = createInterpolatedThemeBuffer();

  interpolateSceneTheme(0, buf);
  assert.equal(buf.background.getHex(), DARK_SCENE_THEME.backgroundHex);
  assert.equal(buf.bloomStrength, DARK_SCENE_THEME.bloomStrength);
  assert.equal(buf.grainIntensity, DARK_SCENE_THEME.grainIntensity);
  assert.equal(buf.dustUseNormalBlending, false);

  interpolateSceneTheme(1, buf);
  assert.equal(buf.background.getHex(), LIGHT_SCENE_THEME.backgroundHex);
  assert.equal(buf.bloomStrength, LIGHT_SCENE_THEME.bloomStrength);
  assert.equal(buf.bloomThreshold, LIGHT_SCENE_THEME.bloomThreshold);
  assert.equal(buf.grainIntensity, LIGHT_SCENE_THEME.grainIntensity);
  assert.equal(buf.scanlineIntensity, LIGHT_SCENE_THEME.scanlineIntensity);
  assert.equal(buf.dustUseNormalBlending, true);
});

test('interpolateSceneTheme clamps out-of-range inputs and softens postprocessing in light mode', () => {
  const mid = interpolateSceneTheme(0.5);
  assert.ok(mid.bloomStrength < DARK_SCENE_THEME.bloomStrength);
  assert.ok(mid.bloomStrength > LIGHT_SCENE_THEME.bloomStrength);
  assert.ok(mid.grainIntensity < DARK_SCENE_THEME.grainIntensity);
  assert.ok(mid.scanlineIntensity < DARK_SCENE_THEME.scanlineIntensity);

  const clampedHigh = interpolateSceneTheme(1.8);
  assert.equal(clampedHigh.background.getHex(), LIGHT_SCENE_THEME.backgroundHex);

  const clampedLow = interpolateSceneTheme(-0.5);
  assert.equal(clampedLow.background.getHex(), DARK_SCENE_THEME.backgroundHex);
});
