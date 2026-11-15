import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
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

export interface SurveillanceAssembly {
  root: THREE.Group;
  displayGroup: THREE.Group;
  joystickStick: THREE.Group;
  orbitRing: THREE.Mesh;
  explodeLayers: Array<{
    object: THREE.Object3D;
    baseY: number;
    offsetY: number;
  }>;
  clickableTargets: THREE.Object3D[];
  geometries: THREE.BufferGeometry[];
}

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

function makeRoundedBox(w: number, h: number, d: number, radius = 0.03): THREE.BufferGeometry {
  const hw = w / 2 - radius;
  const hh = h / 2 - radius;
  const shape = new THREE.Shape();
  shape.moveTo(-hw, -hh - radius);
  shape.lineTo(hw, -hh - radius);
  shape.quadraticCurveTo(hw + radius, -hh - radius, hw + radius, -hh);
  shape.lineTo(hw + radius, hh);
  shape.quadraticCurveTo(hw + radius, hh + radius, hw, hh + radius);
  shape.lineTo(-hw, hh + radius);
  shape.quadraticCurveTo(-hw - radius, hh + radius, -hw - radius, hh);
  shape.lineTo(-hw - radius, -hh);
  shape.quadraticCurveTo(-hw - radius, -hh - radius, -hw, -hh - radius);

  const rawGeo = new THREE.ExtrudeGeometry(shape, {
    depth: d,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.012,
    bevelThickness: 0.012,
  });
  rawGeo.translate(0, 0, -d / 2);
  const indexedGeo = mergeVertices(rawGeo);
  rawGeo.dispose();
  if (
    indexedGeo.index &&
    indexedGeo.attributes.position &&
    indexedGeo.attributes.normal &&
    indexedGeo.attributes.uv
  ) {
    indexedGeo.computeTangents();
  }
  return indexedGeo;
}

export function buildSurveillanceAssembly(materials: MaterialBundle): SurveillanceAssembly {
  const root = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];
  const clickableTargets: THREE.Object3D[] = [];
  const explodeLayers: SurveillanceAssembly['explodeLayers'] = [];

  const dummy = new THREE.Object3D();

  // 1. Soft studio contact shadow grounded at y = 0
  const shadowGeo = new THREE.PlaneGeometry(3.8, 3.8);
  geometries.push(shadowGeo);
  const shadowMesh = new THREE.Mesh(shadowGeo, materials.contactShadow);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = 0.004;
  root.add(shadowMesh);

  // 2. Workstation Console Plinth grounded flush at y = 0
  const plinthProfile = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(1.66, 0.0),
    new THREE.Vector2(1.66, 0.06),
    new THREE.Vector2(1.56, 0.12),
    new THREE.Vector2(1.4, 0.12),
    new THREE.Vector2(0.0, 0.12),
  ];
  const plinthGeo = new THREE.LatheGeometry(plinthProfile, 64);
  geometries.push(plinthGeo);
  const plinthMesh = new THREE.Mesh(plinthGeo, materials.plinth);
  plinthMesh.castShadow = true;
  plinthMesh.receiveShadow = true;
  root.add(plinthMesh);

  const dialGeo = new THREE.CircleGeometry(1.38, 64);
  geometries.push(dialGeo);
  const dialMesh = new THREE.Mesh(dialGeo, materials.deskGrid);
  dialMesh.rotation.x = -Math.PI / 2;
  dialMesh.position.y = 0.124;
  dialMesh.receiveShadow = true;
  root.add(dialMesh);

  tagInspectable(
    plinthMesh,
    {
      id: 'plinth',
      label: 'Control Desk Telemetry Base',
      spec: 'Patli Sector Workstation · Click Footprint to inspect site corridor',
      sectionId: 'footprint',
      vmsMode: 'smart-map',
      actionLabel: 'Open Footprint Map',
    },
    clickableTargets,
  );

  // 3. Orbital Telemetry Ring framing the workstation
  const orbitRingGeo = new THREE.TorusGeometry(1.72, 0.015, 16, 96);
  geometries.push(orbitRingGeo);
  const orbitRing = new THREE.Mesh(orbitRingGeo, materials.accentTrim);
  orbitRing.rotation.x = Math.PI / 2;
  orbitRing.position.y = 0.18;
  root.add(orbitRing);

  // 4. Milestone XProtect Recording Server Blade (3U Rackmount Unit under riser)
  const serverGroup = new THREE.Group();
  serverGroup.position.set(0, 0.28, -0.28);

  const serverShellGeo = makeRoundedBox(1.62, 0.26, 0.72, 0.03);
  geometries.push(serverShellGeo);
  const serverShell = new THREE.Mesh(serverShellGeo, materials.chassis);
  serverShell.castShadow = true;
  serverShell.receiveShadow = true;
  serverGroup.add(serverShell);

  const serverFaceGeo = new THREE.BoxGeometry(1.5, 0.2, 0.03);
  geometries.push(serverFaceGeo);
  const serverFace = new THREE.Mesh(serverFaceGeo, materials.serverFaceplate);
  serverFace.position.set(0, 0, 0.365);
  serverGroup.add(serverFace);

  // 8 Hot-Swap NVMe Storage Bays (InstancedMesh)
  const caddyGeo = new THREE.BoxGeometry(0.145, 0.13, 0.028);
  geometries.push(caddyGeo);
  const caddyMesh = new THREE.InstancedMesh(caddyGeo, materials.armMetal, 8);
  for (let i = 0; i < 8; i++) {
    dummy.position.set(-0.62 + i * 0.175, -0.01, 0.376);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    caddyMesh.setMatrixAt(i, dummy.matrix);
  }
  caddyMesh.instanceMatrix.needsUpdate = true;
  caddyMesh.computeBoundingSphere();
  serverGroup.add(caddyMesh);

  // Server Milestone status trim bar
  const serverBarGeo = new THREE.BoxGeometry(1.48, 0.016, 0.02);
  geometries.push(serverBarGeo);
  const serverBar = new THREE.Mesh(serverBarGeo, materials.accentTrim);
  serverBar.position.set(0, 0.095, 0.375);
  serverGroup.add(serverBar);

  root.add(serverGroup);
  explodeLayers.push({ object: serverGroup, baseY: 0.28, offsetY: 0.14 });
  tagInspectable(
    serverGroup,
    {
      id: 'recording-server',
      label: 'XProtect Recording Server (32+ Ch)',
      spec: '8-bay RAID archiving · Dual-stream NVR retention & playback index',
      sectionId: 'operations',
      vmsMode: 'playback',
      actionLabel: 'Open Forensics',
    },
    clickableTargets,
  );

  // 5. 24-Port Managed PoE+ Network Switch stacked atop server
  const switchGroup = new THREE.Group();
  switchGroup.position.set(0, 0.5, -0.28);

  const switchGeo = makeRoundedBox(1.52, 0.11, 0.62, 0.025);
  geometries.push(switchGeo);
  const switchMesh = new THREE.Mesh(switchGeo, materials.switchBody);
  switchMesh.castShadow = true;
  switchMesh.receiveShadow = true;
  switchGroup.add(switchMesh);

  // 24 Instanced PoE+ Port Link LEDs
  const ledGeo = new THREE.BoxGeometry(0.028, 0.018, 0.02);
  geometries.push(ledGeo);
  const ledCount = 24;
  const ledMesh = new THREE.InstancedMesh(ledGeo, materials.portLed, ledCount);
  for (let i = 0; i < ledCount; i++) {
    const col = i % 12;
    const row = Math.floor(i / 12);
    dummy.position.set(-0.52 + col * 0.072, row === 0 ? 0.016 : -0.016, 0.315);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    ledMesh.setMatrixAt(i, dummy.matrix);
  }
  ledMesh.instanceMatrix.needsUpdate = true;
  ledMesh.computeBoundingSphere();
  switchGroup.add(ledMesh);

  root.add(switchGroup);
  explodeLayers.push({ object: switchGroup, baseY: 0.5, offsetY: 0.36 });
  tagInspectable(
    switchGroup,
    {
      id: 'poe-switch',
      label: '24-Port PoE+ Surveillance Switch',
      spec: 'IPv4 VLAN camera segmentation · Fiber uplink & CLI diagnostics',
      sectionId: 'skills',
      vmsMode: 'live',
      actionLabel: 'Inspect Network Skills',
    },
    clickableTargets,
  );

  // 6. Dual-Monitor Articulated XProtect Smart Client Display Wall
  const displayGroup = new THREE.Group();
  displayGroup.position.set(0, 1.32, -0.22);

  // Central machined VESA spine column
  const spineGeo = new THREE.CylinderGeometry(0.055, 0.07, 0.92, 24);
  geometries.push(spineGeo);
  const spineMesh = new THREE.Mesh(spineGeo, materials.armMetal);
  spineMesh.position.set(0, -0.28, -0.14);
  spineMesh.castShadow = true;
  displayGroup.add(spineMesh);

  // Horizontal cross-beam VESA bar
  const crossGeo = makeRoundedBox(1.5, 0.065, 0.06, 0.02);
  geometries.push(crossGeo);
  const crossMesh = new THREE.Mesh(crossGeo, materials.armMetal);
  crossMesh.position.set(0, 0.02, -0.1);
  crossMesh.castShadow = true;
  displayGroup.add(crossMesh);

  // Primary XProtect Smart Client Operator Monitor (Left/Center hero display)
  const primaryMonitor = new THREE.Group();
  primaryMonitor.position.set(-0.28, 0.06, 0.02);
  primaryMonitor.rotation.y = 0.14;

  const pFrameGeo = makeRoundedBox(1.42, 0.84, 0.055, 0.025);
  geometries.push(pFrameGeo);
  const pFrameMesh = new THREE.Mesh(pFrameGeo, materials.chassis);
  pFrameMesh.castShadow = true;
  pFrameMesh.receiveShadow = true;
  primaryMonitor.add(pFrameMesh);

  const pScreenGeo = new THREE.PlaneGeometry(1.34, 0.75);
  geometries.push(pScreenGeo);
  const pScreenMesh = new THREE.Mesh(pScreenGeo, materials.primaryScreen);
  pScreenMesh.position.z = 0.041;
  primaryMonitor.add(pScreenMesh);

  const pGlassGeo = new THREE.PlaneGeometry(1.34, 0.75);
  geometries.push(pGlassGeo);
  const pGlassMesh = new THREE.Mesh(pGlassGeo, materials.screenGlass);
  pGlassMesh.position.z = 0.044;
  pGlassMesh.renderOrder = 3;
  primaryMonitor.add(pGlassMesh);

  displayGroup.add(primaryMonitor);
  tagInspectable(
    primaryMonitor,
    {
      id: 'smart-client-wall',
      label: 'Milestone XProtect Smart Client',
      spec: '2x2 Multi-Camera Quad + Sequence Timeline Scrubber · 32+ feeds',
      sectionId: 'operations',
      vmsMode: 'live',
      actionLabel: 'View Deployments',
    },
    clickableTargets,
  );

  // Secondary Auxiliary XProtect Smart Map / Alarm Manager Monitor (Angled right portrait/square)
  const auxMonitor = new THREE.Group();
  auxMonitor.position.set(0.76, 0.06, 0.14);
  auxMonitor.rotation.y = -0.34;

  const aFrameGeo = makeRoundedBox(0.74, 0.84, 0.055, 0.025);
  geometries.push(aFrameGeo);
  const aFrameMesh = new THREE.Mesh(aFrameGeo, materials.chassis);
  aFrameMesh.castShadow = true;
  aFrameMesh.receiveShadow = true;
  auxMonitor.add(aFrameMesh);

  const aScreenGeo = new THREE.PlaneGeometry(0.66, 0.76);
  geometries.push(aScreenGeo);
  const aScreenMesh = new THREE.Mesh(aScreenGeo, materials.auxScreen);
  aScreenMesh.position.z = 0.041;
  auxMonitor.add(aScreenMesh);

  const aGlassGeo = new THREE.PlaneGeometry(0.66, 0.76);
  geometries.push(aGlassGeo);
  const aGlassMesh = new THREE.Mesh(aGlassGeo, materials.screenGlass);
  aGlassMesh.position.z = 0.044;
  aGlassMesh.renderOrder = 3;
  auxMonitor.add(aGlassMesh);

  displayGroup.add(auxMonitor);
  tagInspectable(
    auxMonitor,
    {
      id: 'smart-map-display',
      label: 'XProtect Smart Map & Alarm Queue',
      spec: 'Patli Hub GIS overlay · Real-time GIGO & perimeter alarm triage',
      sectionId: 'footprint',
      vmsMode: 'smart-map',
      actionLabel: 'Focus Smart Map',
    },
    clickableTargets,
  );

  root.add(displayGroup);
  explodeLayers.push({ object: displayGroup, baseY: 1.32, offsetY: 0.62 });

  // 7. Operator Desk Pod: Precision PTZ Joystick & Jog-Shuttle Controller
  const podGroup = new THREE.Group();
  podGroup.position.set(0.12, 0.2, 0.64);
  podGroup.rotation.x = 0.12;

  const podBaseGeo = makeRoundedBox(1.18, 0.09, 0.44, 0.03);
  geometries.push(podBaseGeo);
  const podBaseMesh = new THREE.Mesh(podBaseGeo, materials.chassis);
  podBaseMesh.castShadow = true;
  podBaseMesh.receiveShadow = true;
  podGroup.add(podBaseMesh);

  // Tactile Aluminum Jog-Shuttle Playback Wheel (LatheGeometry)
  const wheelProfile = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.12, 0.0),
    new THREE.Vector2(0.12, 0.036),
    new THREE.Vector2(0.095, 0.048),
    new THREE.Vector2(0.05, 0.048),
    new THREE.Vector2(0.05, 0.036),
    new THREE.Vector2(0.0, 0.036),
  ];
  const wheelGeo = new THREE.LatheGeometry(wheelProfile, 40);
  geometries.push(wheelGeo);
  const wheelMesh = new THREE.Mesh(wheelGeo, materials.armMetal);
  wheelMesh.position.set(-0.34, 0.048, 0.02);
  wheelMesh.castShadow = true;
  podGroup.add(wheelMesh);

  // 12 Macro Alarm / Preset Hotkeys (InstancedMesh)
  const keyGeo = new THREE.BoxGeometry(0.058, 0.026, 0.058);
  geometries.push(keyGeo);
  const keysMesh = new THREE.InstancedMesh(keyGeo, materials.alarmKey, 12);
  for (let i = 0; i < 12; i++) {
    const col = i % 4;
    const row = Math.floor(i / 4);
    dummy.position.set(-0.08 + col * 0.082, 0.056, -0.08 + row * 0.082);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    keysMesh.setMatrixAt(i, dummy.matrix);
  }
  keysMesh.instanceMatrix.needsUpdate = true;
  keysMesh.computeBoundingSphere();
  podGroup.add(keysMesh);

  // Sculpted 3-Axis PTZ Joystick
  const joystickBaseGeo = new THREE.CylinderGeometry(0.095, 0.115, 0.04, 32);
  geometries.push(joystickBaseGeo);
  const joystickBase = new THREE.Mesh(joystickBaseGeo, materials.armMetal);
  joystickBase.position.set(0.36, 0.06, 0.02);
  podGroup.add(joystickBase);

  const joystickStick = new THREE.Group();
  joystickStick.position.set(0.36, 0.08, 0.02);

  const shaftGeo = new THREE.CylinderGeometry(0.018, 0.024, 0.14, 16);
  geometries.push(shaftGeo);
  const shaftMesh = new THREE.Mesh(shaftGeo, materials.armMetal);
  shaftMesh.position.y = 0.07;
  joystickStick.add(shaftMesh);

  const knobGeo = new THREE.SphereGeometry(0.046, 24, 20);
  geometries.push(knobGeo);
  const knobMesh = new THREE.Mesh(knobGeo, materials.accentTrim);
  knobMesh.position.y = 0.15;
  knobMesh.scale.set(1, 1.25, 1);
  knobMesh.castShadow = true;
  joystickStick.add(knobMesh);

  podGroup.add(joystickStick);
  root.add(podGroup);
  explodeLayers.push({ object: podGroup, baseY: 0.2, offsetY: 0.24 });

  tagInspectable(
    podGroup,
    {
      id: 'ptz-console',
      label: 'PTZ Joystick & Jog-Shuttle Deck',
      spec: 'Hall-effect camera patrol · Timeline jog-shuttle & Alarm hotkeys',
      sectionId: 'experience',
      vmsMode: 'alarms',
      actionLabel: 'View Operational Logbook',
    },
    clickableTargets,
  );

  return {
    root,
    displayGroup,
    joystickStick,
    orbitRing,
    explodeLayers,
    clickableTargets,
    geometries,
  };
}
