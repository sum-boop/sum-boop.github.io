import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { damp3, damp } from 'maath/easing';
import * as THREE from 'three';

const PRESETS = {
  overview: { pos: [0, 1.9, 6.2], target: [1.2, 1.2, -0.5], fov: 40 },
  main: { pos: [-1.9, 1.4, 2.2], target: [-1.9, 1.35, -0.6], fov: 34 },
  briefcam: { pos: [1.9, 1.38, 2.1], target: [1.9, 1.35, -0.6], fov: 32 },
  heatmap: { pos: [4.1, 1.3, 1.6], target: [4.6, 1.25, -0.9], fov: 34 },
};

export default function CameraRig({ focus = 'overview', enabled = true, onExit = () => {} }) {
  const currentTargetRef = useRef(new THREE.Vector3(1.2, 1.2, -0.5));
  const smoothPosRef = useRef(new THREE.Vector3(0, 1.9, 6.2));
  const lastFovRef = useRef(40);

  // Keyboard Escape listener
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

    const preset = PRESETS[focus] || PRESETS.overview;
    const isOverview = focus === 'overview';

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const smoothTime = prefersReducedMotion ? 1.2 : 0.55;

    // Target position and lookAt
    const targetPos = new THREE.Vector3(...preset.pos);
    const targetLookAt = new THREE.Vector3(...preset.target);

    // Subtle idle motion & mouse parallax
    const t = state.clock.getElapsedTime();
    const idleX = prefersReducedMotion || !isOverview ? 0 : Math.sin(t * 0.8) * 0.03;
    const idleY = prefersReducedMotion || !isOverview ? 0 : Math.cos(t * 0.6) * 0.03;
    const orbitX = prefersReducedMotion || !isOverview ? 0 : Math.sin(t * 0.2) * 0.15;

    targetPos.x += orbitX + idleX;
    targetPos.y += idleY;

    // Mouse parallax damping
    const parallaxAmp = isOverview ? 0.25 : 0.06;
    targetPos.x += state.pointer.x * parallaxAmp;
    targetPos.y += state.pointer.y * parallaxAmp;

    // Damp position
    damp3(smoothPosRef.current, targetPos, smoothTime, delta);
    state.camera.position.copy(smoothPosRef.current);

    // Damp lookAt target
    currentTargetRef.current.lerp(targetLookAt, delta * 4);
    state.camera.lookAt(currentTargetRef.current);

    // Damp FOV
    const newFov = damp(state.camera.fov, preset.fov, smoothTime, delta);
    if (Math.abs(newFov - lastFovRef.current) > 0.01) {
      state.camera.fov = newFov;
      state.camera.updateProjectionMatrix();
      lastFovRef.current = newFov;
    }

    // Cinematic roll based on movement speed/distance
    const dist = smoothPosRef.current.distanceTo(targetPos);
    const roll = Math.min(Math.max(dist * 0.02, -0.01), 0.01);
    state.camera.rotation.z = THREE.MathUtils.lerp(state.camera.rotation.z, roll, delta * 3);
  });

  return null;
}
