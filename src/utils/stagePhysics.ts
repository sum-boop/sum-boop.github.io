export interface SpringState {
  value: number;
  velocity: number;
}

export interface Spring3DState {
  rotX: SpringState;
  rotZ: SpringState;
  scale: SpringState;
}

export interface CameraFocusTarget {
  id: string;
  label: string;
  position: [number, number, number];
  target: [number, number, number];
}

export const HERO_OVERVIEW_CAMERA: CameraFocusTarget = {
  id: 'overview',
  label: 'Command Overview',
  position: [2.55, 1.85, 3.95],
  target: [0.5, 0.86, -0.05],
};

export const PART_FOCUS_TARGETS: Record<string, CameraFocusTarget> = {
  'smart-client-wall': {
    id: 'smart-client-wall',
    label: 'Milestone XProtect Smart Client',
    position: [0.0, 1.32, 1.55],
    target: [0.0, 1.3, -0.3],
  },
  'smart-map-display': {
    id: 'smart-map-display',
    label: 'XProtect Smart Map & Alarm Queue',
    position: [0.57, 1.35, 1.42],
    target: [1.13, 1.3, -0.18],
  },
  'briefcam-telemetry': {
    id: 'briefcam-telemetry',
    label: 'BriefCam Analytics & GIGO LPR',
    position: [-0.54, 1.35, 1.42],
    target: [-1.1, 1.3, -0.18],
  },
  'recording-server': {
    id: 'recording-server',
    label: 'XProtect Recording Server',
    position: [2.0, 0.7, 1.8],
    target: [2.2, 0.46, 0.33],
  },
  'poe-switch': {
    id: 'poe-switch',
    label: '24-Port PoE+ Surveillance Switch',
    position: [1.95, 0.85, 1.7],
    target: [2.2, 0.64, 0.33],
  },
  'ptz-console': {
    id: 'ptz-console',
    label: 'PTZ Joystick & Jog-Shuttle Deck',
    position: [0.9, 1.45, 1.5],
    target: [1.04, 0.88, 0.34],
  },
  'operator-keyboard': {
    id: 'operator-keyboard',
    label: 'Operator Keyboard & Mouse',
    position: [-0.2, 1.5, 1.45],
    target: [-0.18, 0.82, 0.32],
  },
  plinth: {
    id: 'plinth',
    label: 'Operator Control Desk',
    position: [2.2, 1.7, 3.2],
    target: [0.3, 0.8, 0.0],
  },
};

export function stepSpring(
  state: SpringState,
  target: number,
  stiffness: number,
  damping: number,
  dt: number,
): SpringState {
  const clampedDt = Math.min(0.05, Math.max(0.0005, dt));
  const substeps = 2;
  const h = clampedDt / substeps;
  let value = state.value;
  let velocity = state.velocity;

  for (let i = 0; i < substeps; i++) {
    const force = (target - value) * stiffness;
    const accel = force - velocity * damping;
    velocity += accel * h;
    value += velocity * h;
  }

  return { value, velocity };
}

export function createSpring3DState(): Spring3DState {
  return {
    rotX: { value: 0, velocity: 0 },
    rotZ: { value: 0, velocity: 0 },
    scale: { value: 1, velocity: 0 },
  };
}

export function stepSpring3D(
  state: Spring3DState,
  dt: number,
  stiffness = 145,
  damping = 12,
): Spring3DState {
  return {
    rotX: stepSpring(state.rotX, 0, stiffness, damping, dt),
    rotZ: stepSpring(state.rotZ, 0, stiffness, damping, dt),
    scale: stepSpring(state.scale, 1, stiffness * 1.15, damping * 1.05, dt),
  };
}

export function applyImpulse3D(
  state: Spring3DState,
  velRotX: number,
  velRotZ: number,
  velScale = 0,
): Spring3DState {
  return {
    rotX: {
      value: state.rotX.value,
      velocity: clampNumber(state.rotX.velocity + velRotX, -1.6, 1.6),
    },
    rotZ: {
      value: state.rotZ.value,
      velocity: clampNumber(state.rotZ.velocity + velRotZ, -1.6, 1.6),
    },
    scale: {
      value: state.scale.value,
      velocity: clampNumber(state.scale.velocity + velScale, -0.8, 0.8),
    },
  };
}

export function computeScrollOrbitOffset(scrollProgress: number): {
  azimuth: number;
  elevation: number;
  panX: number;
  panY: number;
} {
  const p = clampNumber(scrollProgress, 0, 1);
  const eased = 1 - Math.pow(1 - p, 2.2);
  return {
    azimuth: eased * 0.58,
    elevation: eased * 0.28,
    panX: eased * 0.24,
    panY: -eased * 0.22,
  };
}

export function computeParallaxOffset(
  normX: number,
  normY: number,
  intensity = 1,
): { x: number; y: number } {
  const cx = clampNumber(normX, -1, 1);
  const cy = clampNumber(normY, -1, 1);
  return {
    x: cx * 0.24 * intensity,
    y: cy * 0.12 * intensity,
  };
}

export function getPartFocusPreset(partId: string): CameraFocusTarget {
  return PART_FOCUS_TARGETS[partId] ?? HERO_OVERVIEW_CAMERA;
}

export function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}
