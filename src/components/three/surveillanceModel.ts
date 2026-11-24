import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { VmsViewMode } from '@/context/VmsContext';
import type { MaterialBundle } from './materials';

export interface InspectablePartInfo {
  id: string;
  label: string;
  spec: string;
  sectionId?: string;
  vmsMode?: VmsViewMode;
  actionLabel?: string;
}

export interface HoverPartHighlight {
  id: string;
  group: THREE.Object3D;
  ring: THREE.LineSegments;
}

export interface SurveillanceAssembly {
  root: THREE.Group;
  hoverHighlights: HoverPartHighlight[];
  hoverMaterial: THREE.LineBasicMaterial;
  explodeLayers: Array<{
    object: THREE.Object3D;
    baseY: number;
    offsetY: number;
  }>;
  clickableTargets: THREE.Object3D[];
  geometries: THREE.BufferGeometry[];
}

type Vec3 = readonly [number, number, number];

/** Desk surface height. Everything that sits on the desk is placed relative to this. */
const DESK_TOP = 0.78;

function tagInspectable(
  object: THREE.Object3D,
  info: InspectablePartInfo,
  targets: THREE.Object3D[],
): void {
  object.traverse((child) => {
    child.layers.enable(1);
    child.userData.partInfo = info;
  });
  targets.push(object);
}

/**
 * Builds a calm, static operator console: a desk with three monitors on real stands,
 * keyboard + mouse on a desk mat, a PTZ joystick deck, and a network rack beside the desk.
 * Nothing in here animates on its own; it only reacts to the user (hover, click, explode).
 */
export function buildSurveillanceAssembly(materials: MaterialBundle): SurveillanceAssembly {
  const root = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];
  const clickableTargets: THREE.Object3D[] = [];
  const explodeLayers: SurveillanceAssembly['explodeLayers'] = [];
  const hoverHighlights: HoverPartHighlight[] = [];
  const hoverMaterial = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });

  const dummy = new THREE.Object3D();

  const roundedBox = (w: number, h: number, d: number, radius: number): THREE.BufferGeometry => {
    const geo = new RoundedBoxGeometry(w, h, d, 3, radius);
    geometries.push(geo);
    return geo;
  };

  const plainBox = (w: number, h: number, d: number): THREE.BufferGeometry => {
    const geo = new THREE.BoxGeometry(w, h, d);
    geometries.push(geo);
    return geo;
  };

  const addMesh = (
    parent: THREE.Object3D,
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    x: number,
    y: number,
    z: number,
    shadows = true,
  ): THREE.Mesh => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = shadows;
    mesh.receiveShadow = shadows;
    parent.add(mesh);
    return mesh;
  };

  const instanced = (
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    positions: readonly Vec3[],
  ): THREE.InstancedMesh => {
    const mesh = new THREE.InstancedMesh(geo, mat, positions.length);
    positions.forEach((p, i) => {
      dummy.position.set(p[0], p[1], p[2]);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
    return mesh;
  };

  const attachHoverRing = (
    partId: string,
    group: THREE.Object3D,
    w: number,
    h: number,
    y = 0,
    z = 0,
    rotX = -Math.PI / 2,
  ) => {
    const tempBox = new THREE.BoxGeometry(w + 0.04, h + 0.04, 0.014);
    const frameGeo = new THREE.EdgesGeometry(tempBox);
    tempBox.dispose();
    geometries.push(frameGeo);
    const mat = hoverMaterial.clone();
    const frame = new THREE.LineSegments(frameGeo, mat);
    frame.position.set(0, y, z);
    frame.rotation.x = rotX;
    group.add(frame);
    hoverHighlights.push({ id: partId, group, ring: frame });
  };

  // 1. Floor and a soft contact shadow under the whole workstation
  const floorGeo = new THREE.CircleGeometry(4.4, 96);
  geometries.push(floorGeo);
  const floor = new THREE.Mesh(floorGeo, materials.plinth);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  root.add(floor);

  const shadowGeo = new THREE.PlaneGeometry(5.6, 2.8);
  geometries.push(shadowGeo);
  const shadowMesh = new THREE.Mesh(shadowGeo, materials.contactShadow);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.set(0.55, 0.004, 0.05);
  root.add(shadowMesh);

  // 2. Operator desk: top, two panel legs and a rear modesty panel
  const deskGroup = new THREE.Group();
  addMesh(deskGroup, roundedBox(3.0, 0.05, 1.25, 0.012), materials.deskSlab, 0, DESK_TOP - 0.025, 0);
  addMesh(deskGroup, roundedBox(0.05, DESK_TOP - 0.05, 1.05, 0.01), materials.chassis, -1.38, (DESK_TOP - 0.05) / 2, 0);
  addMesh(deskGroup, roundedBox(0.05, DESK_TOP - 0.05, 1.05, 0.01), materials.chassis, 1.38, (DESK_TOP - 0.05) / 2, 0);
  addMesh(deskGroup, plainBox(2.7, 0.36, 0.02), materials.chassis, 0, 0.52, -0.48);
  root.add(deskGroup);

  tagInspectable(
    deskGroup,
    {
      id: 'plinth',
      label: 'Operator Control Desk',
      spec: 'Patli Sector Workstation · Click to open the site footprint map',
      sectionId: 'footprint',
      vmsMode: 'smart-map',
      actionLabel: 'Open Footprint Map',
    },
    clickableTargets,
  );
  attachHoverRing('plinth', deskGroup, 3.0, 1.25, DESK_TOP + 0.012);

  // Large desk mat that the keyboard, mouse and joystick deck rest on
  addMesh(root, roundedBox(2.2, 0.006, 0.46, 0.002), materials.deskMat, 0.25, DESK_TOP + 0.003, 0.3, false);

  // 3. Three monitors on proper desk stands (base plate, neck and VESA mount)
  const displayGroup = new THREE.Group();

  interface MonitorSpec {
    screenW: number;
    screenH: number;
    bodyBottom: number;
    x: number;
    z: number;
    rotY: number;
    screenMaterial: THREE.Material;
  }

  const buildMonitor = (spec: MonitorSpec) => {
    const bezel = 0.026;
    const chin = 0.014;
    const bodyD = 0.04;
    const bodyW = spec.screenW + bezel * 2;
    const bodyH = spec.screenH + bezel * 2 + chin;
    const centerY = spec.bodyBottom + bodyH / 2;

    const group = new THREE.Group();
    group.position.set(spec.x, DESK_TOP, spec.z);
    group.rotation.y = spec.rotY;

    addMesh(group, roundedBox(0.3, 0.016, 0.2, 0.006), materials.armMetal, 0, 0.008, 0);
    const neckH = centerY + bodyH * 0.1 - 0.016;
    addMesh(group, plainBox(0.06, neckH, 0.026), materials.armMetal, 0, 0.016 + neckH / 2, -0.065);
    addMesh(group, roundedBox(0.16, 0.12, 0.04, 0.008), materials.armMetal, 0, centerY, -0.04);
    addMesh(group, roundedBox(bodyW, bodyH, bodyD, 0.012), materials.chassis, 0, centerY, 0);

    const screenGeo = new THREE.PlaneGeometry(spec.screenW, spec.screenH);
    geometries.push(screenGeo);
    const screen = new THREE.Mesh(screenGeo, spec.screenMaterial);
    screen.position.set(0, centerY + chin / 2, bodyD / 2 + 0.0015);
    group.add(screen);

    // tiny power LED in the chin
    addMesh(group, plainBox(0.012, 0.005, 0.004), materials.portLed, bodyW / 2 - 0.05, spec.bodyBottom + chin / 2 + 0.004, bodyD / 2 + 0.002, false);

    displayGroup.add(group);
    return { group, bodyW, bodyH, centerY };
  };

  const primary = buildMonitor({
    screenW: 1.4,
    screenH: 0.7875,
    bodyBottom: 0.13,
    x: 0,
    z: -0.3,
    rotY: 0,
    screenMaterial: materials.primaryScreen,
  });
  tagInspectable(
    primary.group,
    {
      id: 'smart-client-wall',
      label: 'Milestone XProtect Smart Client',
      spec: '2x2 live view grid with timeline scrubber · multi-camera monitoring',
      sectionId: 'operations',
      vmsMode: 'live',
      actionLabel: 'View Deployments',
    },
    clickableTargets,
  );
  attachHoverRing('smart-client-wall', primary.group, primary.bodyW, primary.bodyH, primary.centerY, 0.03, 0);

  const mapMonitor = buildMonitor({
    screenW: 0.64,
    screenH: 0.756,
    bodyBottom: 0.1,
    x: 1.13,
    z: -0.18,
    rotY: -0.34,
    screenMaterial: materials.auxScreen,
  });
  tagInspectable(
    mapMonitor.group,
    {
      id: 'smart-map-display',
      label: 'XProtect Smart Map & Alarm Queue',
      spec: 'Patli Hub site map · GIGO and perimeter alarm triage',
      sectionId: 'footprint',
      vmsMode: 'smart-map',
      actionLabel: 'Focus Smart Map',
    },
    clickableTargets,
  );
  attachHoverRing('smart-map-display', mapMonitor.group, mapMonitor.bodyW, mapMonitor.bodyH, mapMonitor.centerY, 0.03, 0);

  const briefcamMonitor = buildMonitor({
    screenW: 0.57,
    screenH: 0.76,
    bodyBottom: 0.1,
    x: -1.1,
    z: -0.18,
    rotY: 0.34,
    screenMaterial: materials.briefcamScreen,
  });
  tagInspectable(
    briefcamMonitor.group,
    {
      id: 'briefcam-telemetry',
      label: 'BriefCam Analytics & GIGO LPR',
      spec: 'Video synopsis motion graph and gate vehicle log',
      sectionId: 'operations',
      vmsMode: 'alarms',
      actionLabel: 'Inspect Forensics',
    },
    clickableTargets,
  );
  attachHoverRing('briefcam-telemetry', briefcamMonitor.group, briefcamMonitor.bodyW, briefcamMonitor.bodyH, briefcamMonitor.centerY, 0.03, 0);

  root.add(displayGroup);
  explodeLayers.push({ object: displayGroup, baseY: 0, offsetY: 0.5 });

  // 4. Keyboard + mouse
  const kbGroup = new THREE.Group();
  kbGroup.position.set(-0.18, DESK_TOP + 0.006, 0.32);
  addMesh(kbGroup, roundedBox(0.92, 0.026, 0.3, 0.01), materials.chassis, 0, 0.013, 0);

  const keyPositions: Vec3[] = [];
  const kbCols = 14;
  const kbRows = 5;
  for (let r = 0; r < kbRows; r++) {
    for (let c = 0; c < kbCols; c++) {
      keyPositions.push([-0.4 + c * 0.0615, 0.033, -0.105 + r * 0.052]);
    }
  }
  kbGroup.add(instanced(plainBox(0.05, 0.014, 0.044), materials.keycap, keyPositions));

  // mouse
  addMesh(kbGroup, roundedBox(0.072, 0.03, 0.118, 0.014), materials.chassis, 0.68, 0.015, 0.02);
  addMesh(kbGroup, plainBox(0.004, 0.002, 0.04), materials.cable, 0.68, 0.031, -0.018, false);

  root.add(kbGroup);
  explodeLayers.push({ object: kbGroup, baseY: DESK_TOP + 0.006, offsetY: 0.18 });
  tagInspectable(
    kbGroup,
    {
      id: 'operator-keyboard',
      label: 'Operator Keyboard & Mouse',
      spec: 'XProtect shortcuts · GIGO gate logging and incident macros',
      sectionId: 'about',
      vmsMode: 'live',
      actionLabel: 'View Operator Profile',
    },
    clickableTargets,
  );
  attachHoverRing('operator-keyboard', kbGroup, 1.7, 0.34, 0.05);

  // 5. PTZ joystick + jog-shuttle deck
  const deckGroup = new THREE.Group();
  deckGroup.position.set(1.04, DESK_TOP + 0.006, 0.34);
  addMesh(deckGroup, roundedBox(0.46, 0.05, 0.3, 0.012), materials.chassis, 0, 0.025, 0);

  // jog-shuttle wheel
  const wheelOuter = new THREE.CylinderGeometry(0.06, 0.06, 0.02, 40);
  const wheelInner = new THREE.CylinderGeometry(0.038, 0.038, 0.012, 40);
  geometries.push(wheelOuter, wheelInner);
  addMesh(deckGroup, wheelOuter, materials.armMetal, -0.12, 0.06, 0.05);
  addMesh(deckGroup, wheelInner, materials.chassis, -0.12, 0.076, 0.05);

  // preset keys
  const deckKeyPositions: Vec3[] = [];
  for (let c = 0; c < 4; c++) {
    deckKeyPositions.push([-0.19 + c * 0.05, 0.057, -0.085]);
  }
  deckGroup.add(instanced(plainBox(0.04, 0.014, 0.036), materials.keycap, deckKeyPositions));
  addMesh(deckGroup, plainBox(0.04, 0.014, 0.036), materials.alarmKey, 0.01, 0.057, -0.085, false);

  // joystick
  const stickBase = new THREE.CylinderGeometry(0.068, 0.076, 0.024, 36);
  const stickBoot = new THREE.CylinderGeometry(0.018, 0.03, 0.09, 20);
  const stickKnob = new THREE.SphereGeometry(0.034, 24, 18);
  geometries.push(stickBase, stickBoot, stickKnob);
  addMesh(deckGroup, stickBase, materials.armMetal, 0.12, 0.062, 0.04);
  addMesh(deckGroup, stickBoot, materials.cable, 0.12, 0.119, 0.04);
  const knob = addMesh(deckGroup, stickKnob, materials.chassis, 0.12, 0.178, 0.04);
  knob.scale.set(1, 1.2, 1);

  root.add(deckGroup);
  explodeLayers.push({ object: deckGroup, baseY: DESK_TOP + 0.006, offsetY: 0.24 });
  tagInspectable(
    deckGroup,
    {
      id: 'ptz-console',
      label: 'PTZ Joystick & Jog-Shuttle Deck',
      spec: 'Camera patrol control · timeline jog-shuttle and preset keys',
      sectionId: 'experience',
      vmsMode: 'alarms',
      actionLabel: 'View Operational Logbook',
    },
    clickableTargets,
  );
  attachHoverRing('ptz-console', deckGroup, 0.46, 0.3, 0.09);

  // 6. Network rack beside the desk: UPS, recording server, PoE switch, cable manager
  const rackGroup = new THREE.Group();
  rackGroup.position.set(2.2, 0, -0.05);
  addMesh(rackGroup, roundedBox(0.7, 0.94, 0.75, 0.015), materials.chassis, 0, 0.52, 0);
  const footGeo = new THREE.CylinderGeometry(0.03, 0.035, 0.05, 16);
  geometries.push(footGeo);
  for (const fx of [-0.3, 0.3]) {
    for (const fz of [-0.3, 0.3]) {
      addMesh(rackGroup, footGeo, materials.cable, fx, 0.025, fz);
    }
  }
  root.add(rackGroup);

  const frontZ = 0.375;

  // UPS (bottom)
  const upsGroup = new THREE.Group();
  upsGroup.position.set(0, 0.2, frontZ);
  addMesh(upsGroup, roundedBox(0.6, 0.2, 0.03, 0.006), materials.serverFaceplate, 0, 0, 0);
  addMesh(upsGroup, plainBox(0.12, 0.04, 0.006), materials.cable, -0.18, 0.02, 0.018, false);
  addMesh(upsGroup, plainBox(0.01, 0.01, 0.006), materials.portLed, -0.14, -0.04, 0.018, false);
  rackGroup.add(upsGroup);

  // Recording server
  const serverGroup = new THREE.Group();
  serverGroup.position.set(0, 0.46, frontZ);
  addMesh(serverGroup, roundedBox(0.6, 0.16, 0.03, 0.006), materials.serverFaceplate, 0, 0, 0);
  const bayPositions: Vec3[] = [];
  const bayLedPositions: Vec3[] = [];
  for (let i = 0; i < 8; i++) {
    bayPositions.push([-0.262 + i * 0.0748, -0.006, 0.018]);
    bayLedPositions.push([-0.262 + i * 0.0748, 0.058, 0.018]);
  }
  serverGroup.add(instanced(plainBox(0.06, 0.1, 0.012), materials.armMetal, bayPositions));
  serverGroup.add(instanced(plainBox(0.012, 0.006, 0.006), materials.portLed, bayLedPositions));
  rackGroup.add(serverGroup);
  explodeLayers.push({ object: serverGroup, baseY: 0.46, offsetY: 0.3 });
  tagInspectable(
    serverGroup,
    {
      id: 'recording-server',
      label: 'XProtect Recording Server',
      spec: 'RAID archive storage · recording retention and playback index',
      sectionId: 'operations',
      vmsMode: 'playback',
      actionLabel: 'Open Forensics',
    },
    clickableTargets,
  );
  attachHoverRing('recording-server', serverGroup, 0.62, 0.18, 0, 0.02, 0);

  // 24-port PoE switch
  const switchGroup = new THREE.Group();
  switchGroup.position.set(0, 0.64, frontZ);
  addMesh(switchGroup, roundedBox(0.6, 0.075, 0.03, 0.005), materials.switchBody, 0, 0, 0);
  const portPositions: Vec3[] = [];
  const portLedPositions: Vec3[] = [];
  for (let i = 0; i < 24; i++) {
    const col = i % 12;
    const row = Math.floor(i / 12);
    portPositions.push([-0.255 + col * 0.0405, row === 0 ? 0.014 : -0.014, 0.017]);
    portLedPositions.push([-0.255 + col * 0.0405, row === 0 ? 0.027 : 0.0, 0.019]);
  }
  switchGroup.add(instanced(plainBox(0.026, 0.016, 0.006), materials.cable, portPositions));
  switchGroup.add(instanced(plainBox(0.01, 0.004, 0.004), materials.portLed, portLedPositions));
  rackGroup.add(switchGroup);
  explodeLayers.push({ object: switchGroup, baseY: 0.64, offsetY: 0.5 });
  tagInspectable(
    switchGroup,
    {
      id: 'poe-switch',
      label: '24-Port PoE Surveillance Switch',
      spec: 'IPv4 VLAN camera segmentation · uplink and CLI diagnostics',
      sectionId: 'skills',
      vmsMode: 'live',
      actionLabel: 'Inspect Network Skills',
    },
    clickableTargets,
  );
  attachHoverRing('poe-switch', switchGroup, 0.62, 0.095, 0, 0.02, 0);

  // Patch panel: two rows of 12 keystone jacks, with a cable manager strip above it
  const patchGroup = new THREE.Group();
  patchGroup.position.set(0, 0.8, frontZ);
  addMesh(patchGroup, roundedBox(0.6, 0.08, 0.03, 0.005), materials.serverFaceplate, 0, 0, 0);
  const jackPositions: Vec3[] = [];
  for (let i = 0; i < 24; i++) {
    const col = i % 12;
    const row = Math.floor(i / 12);
    jackPositions.push([-0.255 + col * 0.0405, row === 0 ? 0.016 : -0.016, 0.017]);
  }
  patchGroup.add(instanced(plainBox(0.024, 0.018, 0.006), materials.cable, jackPositions));
  rackGroup.add(patchGroup);
  addMesh(rackGroup, plainBox(0.6, 0.035, 0.03), materials.cable, 0, 0.88, frontZ);

  // 7. Cable run from the desk to the rack
  const cableCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(1.1, DESK_TOP - 0.02, -0.5),
    new THREE.Vector3(1.25, 0.55, -0.66),
    new THREE.Vector3(1.45, 0.05, -0.7),
    new THREE.Vector3(1.95, 0.03, -0.55),
    new THREE.Vector3(2.0, 0.35, -0.3),
    new THREE.Vector3(1.85, 0.64, 0.12),
  ]);
  const cableGeo = new THREE.TubeGeometry(cableCurve, 48, 0.013, 8, false);
  geometries.push(cableGeo);
  const cableMesh = new THREE.Mesh(cableGeo, materials.cable);
  cableMesh.castShadow = true;
  root.add(cableMesh);

  return {
    root,
    hoverHighlights,
    hoverMaterial,
    explodeLayers,
    clickableTargets,
    geometries,
  };
}
