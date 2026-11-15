import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { damp3, damp } from 'maath/easing';
import * as THREE from 'three';

export const CAMERA_PRESETS = {
  overview: { pos: [0, 1.9, 6.2], target: [0.4, 1.25, -0.5], fov: 40 },
  'screen-focus': { pos: [-1.9, 1.4, 2.2], target: [-1.9, 1.35, -0.6], fov: 34 },
  'briefcam-focus': { pos: [1.9, 1.38, 2.1], target: [1.9, 1.35, -0.6], fov: 32 },
  heatmap: { pos: [4.1, 1.3, 1.6], target: [4.6, 1.25, -0.9], fov: 34 },
};

// Pre-allocated vectors to avoid GC churn inside useFrame
const _targetPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();

export default function CameraRig({ focus = 'overview', enabled = true, onExit = () => {} }) {
  const currentTargetRef = useRef(new THREE.Vector3(0.4, 1.25, -0.5));
  const smoothPosRef = useRef(new THREE.Vector3(0, 1.9, 6.2));
  const lastFovRef = useRef(40);

  // Keyboard Escape listener to glide back to overview
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onExit) {
        onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit]);

  useFrame((state, delta) => {
    if (!enabled) return;

    const preset = CAMERA_PRESETS[focus] || CAMERA_PRESETS.overview;
    const isOverview = focus === 'overview';
    const clampedDelta = Math.min(delta, 0.05);

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const smoothTime = prefersReducedMotion ? 0.15 : 0.42;

    _targetPos.set(preset.pos[0], preset.pos[1], preset.pos[2]);
    _targetLookAt.set(preset.target[0], preset.target[1], preset.target[2]);

    // Subtle pointer parallax offset when hovering inside the canvas
    const parallaxAmp = isOverview ? 0.22 : 0.05;
    _targetPos.x += state.pointer.x * parallaxAmp;
    _targetPos.y += state.pointer.y * parallaxAmp;

    // Physics-damped camera position & lerp lookAt convergence
    damp3(smoothPosRef.current, _targetPos, smoothTime, clampedDelta);
    state.camera.position.copy(smoothPosRef.current);

    const targetLerpAlpha = 1 - Math.exp(-8 * clampedDelta);
    currentTargetRef.current.lerp(_targetLookAt, targetLerpAlpha);
    state.camera.lookAt(currentTargetRef.current);

    // Physics-damped FOV zoom transition
    const newFov = damp(state.camera.fov, preset.fov, smoothTime, clampedDelta);
    const fovChanged = Math.abs(newFov - lastFovRef.current) > 0.005;
    if (fovChanged) {
      state.camera.fov = newFov;
      state.camera.updateProjectionMatrix();
      lastFovRef.current = newFov;
    }

    // Subtle banking roll proportional to camera lateral travel distance
    const posDistance = smoothPosRef.current.distanceTo(_targetPos);
    const targetDistance = currentTargetRef.current.distanceTo(_targetLookAt);
    const roll = THREE.MathUtils.clamp((_targetPos.x - smoothPosRef.current.x) * 0.008, -0.015, 0.015);
    state.camera.rotation.z = THREE.MathUtils.lerp(state.camera.rotation.z, roll, targetLerpAlpha);

    // Keep requesting frames under frameloop="demand" until camera settles completely
    if (posDistance > 0.004 || targetDistance > 0.004 || Math.abs(preset.fov - newFov) > 0.02) {
      state.invalidate();
    }
  });

  return null;
}
