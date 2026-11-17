import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HERO_OVERVIEW_CAMERA,
  applyImpulse3D,
  computeParallaxOffset,
  computeScrollOrbitOffset,
  createSpring3DState,
  getPartFocusPreset,
  stepSpring,
  stepSpring3D,
} from './stagePhysics';

test('stepSpring overshoots slightly and settles back toward target without NaN', () => {
  let state = { value: 0, velocity: 1.2 };
  let sawNegative = false;
  let peak = 0;

  for (let i = 0; i < 180; i++) {
    state = stepSpring(state, 0, 140, 10, 1 / 60);
    assert.ok(Number.isFinite(state.value));
    assert.ok(Number.isFinite(state.velocity));
    if (state.value > peak) peak = state.value;
    if (state.value < -0.002) sawNegative = true;
  }

  assert.ok(peak > 0.04, 'spring should move past initial equilibrium');
  assert.ok(sawNegative, 'spring should exhibit slight physical overshoot');
  assert.ok(Math.abs(state.value) < 0.002, 'spring should settle near zero');
});

test('applyImpulse3D injects bounded physical momentum that settles cleanly', () => {
  let rig = createSpring3DState();
  rig = applyImpulse3D(rig, 0.9, -0.7, -0.35);

  for (let i = 0; i < 200; i++) {
    rig = stepSpring3D(rig, 1 / 60);
  }

  assert.ok(Math.abs(rig.rotX.value) < 0.003);
  assert.ok(Math.abs(rig.rotZ.value) < 0.003);
  assert.ok(Math.abs(rig.scale.value - 1) < 0.003);
});

test('computeScrollOrbitOffset maps hero scroll progress smoothly and clamps bounds', () => {
  const start = computeScrollOrbitOffset(-0.4);
  const mid = computeScrollOrbitOffset(0.5);
  const end = computeScrollOrbitOffset(1.4);

  assert.equal(start.azimuth, 0);
  assert.ok(mid.azimuth > start.azimuth && mid.azimuth < end.azimuth);
  assert.ok(end.azimuth > 0.5 && end.panY < 0);
});

test('computeParallaxOffset clamps out-of-range pointer coordinates', () => {
  const clamped = computeParallaxOffset(4, -5, 1);
  const edge = computeParallaxOffset(1, -1, 1);
  assert.deepEqual(clamped, edge);
});

test('getPartFocusPreset resolves clickable hardware modules and falls back to overview', () => {
  assert.equal(getPartFocusPreset('smart-client-wall').id, 'smart-client-wall');
  assert.equal(getPartFocusPreset('briefcam-telemetry').id, 'briefcam-telemetry');
  assert.equal(getPartFocusPreset('unknown-part').id, HERO_OVERVIEW_CAMERA.id);
});
