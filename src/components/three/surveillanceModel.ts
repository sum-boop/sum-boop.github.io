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

export interface HoverPartHighlight {
  id: string;
  group: THREE.Object3D;
  ring: THREE.LineSegments;
}

export interface SurveillanceAssembly {
  root: THREE.Group;
  displayGroup: THREE.Group;
  joystickStick: THREE.Group;
  orbitRing: THREE.Mesh;
  innerOrbitRing: THREE.Mesh;
  holoNodesGroup: THREE.Group;
  dustPoints: THREE.Points;
  dustBasePositions: Float32Array;
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
  const hw = Math.max(0.01, w / 2 - radius);
  const hh = Math.max(0.01, h / 2 - radius);
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
    curveSegments: 10,
    bevelSegments: 4,
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
  const hoverHighlights: HoverPartHighlight[] = [];
  const hoverMaterial = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });

  const dummy = new THREE.Object3D();

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

  // 1. Soft studio contact shadow grounded at y = 0
  const shadowGeo = new THREE.PlaneGeometry(4.6, 4.6);
  geometries.push(shadowGeo);
  const shadowMesh = new THREE.Mesh(shadowGeo, materials.contactShadow);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = 0.004;
  root.add(shadowMesh);

  // 2. Workstation Console Plinth grounded flush at y = 0
  const plinthProfile = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(1.94, 0.0),
    new THREE.Vector2(1.94, 0.055),
    new THREE.Vector2(1.82, 0.115),
    new THREE.Vector2(1.62, 0.115),
    new THREE.Vector2(0.0, 0.115),
  ];
  const plinthGeo = new THREE.LatheGeometry(plinthProfile, 64);
  geometries.push(plinthGeo);
  const plinthMesh = new THREE.Mesh(plinthGeo, materials.plinth);
  plinthMesh.castShadow = true;
  plinthMesh.receiveShadow = true;
  root.add(plinthMesh);

  // Thin luminous lip around the plinth edge for a premium, floating-base read
  const plinthLipGeo = new THREE.TorusGeometry(1.945, 0.0055, 8, 128);
  geometries.push(plinthLipGeo);
  const plinthLip = new THREE.Mesh(plinthLipGeo, materials.accentTrim);
  plinthLip.rotation.x = Math.PI / 2;
  plinthLip.position.y = 0.04;
  root.add(plinthLip);

  const dialGeo = new THREE.CircleGeometry(1.6, 64);
  geometries.push(dialGeo);
  const dialMesh = new THREE.Mesh(dialGeo, materials.deskGrid);
  dialMesh.rotation.x = -Math.PI / 2;
  dialMesh.position.y = 0.12;
  dialMesh.receiveShadow = true;
  root.add(dialMesh);

  // Brushed-metal Command Desk Surface resting atop plinth
  const deskGroup = new THREE.Group();
  deskGroup.position.set(0, 0.155, 0.08);
  const deskSlabGeo = makeRoundedBox(2.58, 0.055, 1.56, 0.06);
  geometries.push(deskSlabGeo);
  const deskSlabMesh = new THREE.Mesh(deskSlabGeo, materials.deskSlab);
  deskSlabMesh.castShadow = true;
  deskSlabMesh.receiveShadow = true;
  deskGroup.add(deskSlabMesh);

  // Recessed glowing cyan edge strip around desk front apron
  const deskStripGeo = new THREE.BoxGeometry(2.38, 0.012, 0.018);
  geometries.push(deskStripGeo);
  const deskStripMesh = new THREE.Mesh(deskStripGeo, materials.accentTrim);
  deskStripMesh.position.set(0, 0, 0.788);
  deskGroup.add(deskStripMesh);
  root.add(deskGroup);

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
  attachHoverRing('plinth', root, 3.6, 3.6, 0.13);

  // 3. Orbital Telemetry Rings framing the workstation
  const orbitRingGeo = new THREE.TorusGeometry(1.98, 0.014, 16, 112);
  geometries.push(orbitRingGeo);
  const orbitRing = new THREE.Mesh(orbitRingGeo, materials.accentTrim);
  orbitRing.rotation.x = Math.PI / 2;
  orbitRing.position.y = 0.15;
  root.add(orbitRing);

  const innerOrbitGeo = new THREE.TorusGeometry(1.74, 0.008, 12, 96, Math.PI * 1.4);
  geometries.push(innerOrbitGeo);
  const innerOrbitRing = new THREE.Mesh(innerOrbitGeo, materials.warmAccentLed);
  innerOrbitRing.rotation.x = Math.PI / 2;
  innerOrbitRing.position.y = 0.21;
  root.add(innerOrbitRing);

  // 4. Milestone XProtect Recording Server Blade (3U Rackmount Unit under riser)
  const serverGroup = new THREE.Group();
  serverGroup.position.set(0, 0.32, -0.32);

  const serverShellGeo = makeRoundedBox(1.66, 0.26, 0.74, 0.03);
  geometries.push(serverShellGeo);
  const serverShell = new THREE.Mesh(serverShellGeo, materials.chassis);
  serverShell.castShadow = true;
  serverShell.receiveShadow = true;
  serverGroup.add(serverShell);

  const serverFaceGeo = new THREE.BoxGeometry(1.54, 0.2, 0.03);
  geometries.push(serverFaceGeo);
  const serverFace = new THREE.Mesh(serverFaceGeo, materials.serverFaceplate);
  serverFace.position.set(0, 0, 0.375);
  serverGroup.add(serverFace);

  // 8 Hot-Swap NVMe Storage Bays (InstancedMesh)
  const caddyGeo = new THREE.BoxGeometry(0.145, 0.13, 0.028);
  geometries.push(caddyGeo);
  const caddyMesh = new THREE.InstancedMesh(caddyGeo, materials.armMetal, 8);
  for (let i = 0; i < 8; i++) {
    dummy.position.set(-0.62 + i * 0.178, -0.012, 0.386);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    caddyMesh.setMatrixAt(i, dummy.matrix);
  }
  caddyMesh.instanceMatrix.needsUpdate = true;
  caddyMesh.computeBoundingSphere();
  serverGroup.add(caddyMesh);

  // 8 Warm Drive Activity LEDs
  const driveLedGeo = new THREE.BoxGeometry(0.022, 0.012, 0.015);
  geometries.push(driveLedGeo);
  const driveLeds = new THREE.InstancedMesh(driveLedGeo, materials.warmAccentLed, 8);
  for (let i = 0; i < 8; i++) {
    dummy.position.set(-0.62 + i * 0.178, 0.038, 0.398);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    driveLeds.setMatrixAt(i, dummy.matrix);
  }
  driveLeds.instanceMatrix.needsUpdate = true;
  driveLeds.computeBoundingSphere();
  serverGroup.add(driveLeds);

  // Server Milestone status trim bar
  const serverBarGeo = new THREE.BoxGeometry(1.52, 0.016, 0.02);
  geometries.push(serverBarGeo);
  const serverBar = new THREE.Mesh(serverBarGeo, materials.accentTrim);
  serverBar.position.set(0, 0.095, 0.385);
  serverGroup.add(serverBar);

  root.add(serverGroup);
  explodeLayers.push({ object: serverGroup, baseY: 0.32, offsetY: 0.16 });
  tagInspectable(
    serverGroup,
    {
      id: 'recording-server',
      label: 'XProtect Recording Server',
      spec: '8-bay RAID archiving · Dual-stream NVR retention & playback index',
      sectionId: 'operations',
      vmsMode: 'playback',
      actionLabel: 'Open Forensics',
    },
    clickableTargets,
  );
  attachHoverRing('recording-server', serverGroup, 1.5, 0.8, 0.16);

  // 5. 24-Port Managed PoE+ Network Switch stacked atop server
  const switchGroup = new THREE.Group();
  switchGroup.position.set(0, 0.54, -0.32);

  const switchGeo = makeRoundedBox(1.56, 0.11, 0.64, 0.025);
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
    dummy.position.set(-0.52 + col * 0.074, row === 0 ? 0.016 : -0.016, 0.325);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    ledMesh.setMatrixAt(i, dummy.matrix);
  }
  ledMesh.instanceMatrix.needsUpdate = true;
  ledMesh.computeBoundingSphere();
  switchGroup.add(ledMesh);

  root.add(switchGroup);
  explodeLayers.push({ object: switchGroup, baseY: 0.54, offsetY: 0.38 });
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
  attachHoverRing('poe-switch', switchGroup, 1.4, 0.7, 0.08);

  // 6. Three-Screen Curved XProtect Smart Client Command Display Wall
  const displayGroup = new THREE.Group();
  displayGroup.position.set(0, 1.38, -0.22);

  // Central machined VESA spine column
  const spineGeo = new THREE.CylinderGeometry(0.058, 0.074, 0.98, 24);
  geometries.push(spineGeo);
  const spineMesh = new THREE.Mesh(spineGeo, materials.armMetal);
  spineMesh.position.set(0, -0.3, -0.16);
  spineMesh.castShadow = true;
  displayGroup.add(spineMesh);

  // Articulated Horizontal Cross-Beam Bar
  const crossGeo = makeRoundedBox(2.26, 0.068, 0.064, 0.02);
  geometries.push(crossGeo);
  const crossMesh = new THREE.Mesh(crossGeo, materials.armMetal);
  crossMesh.position.set(0, 0.02, -0.1);
  crossMesh.castShadow = true;
  displayGroup.add(crossMesh);

  // Braided Cat6A & Power Cable Harness descending from display bar into switch/server
  const cablePaths = [
    [
      new THREE.Vector3(-0.22, -0.02, -0.14),
      new THREE.Vector3(-0.32, -0.35, -0.26),
      new THREE.Vector3(-0.28, -0.74, -0.2),
    ],
    [
      new THREE.Vector3(0.0, -0.02, -0.14),
      new THREE.Vector3(0.02, -0.4, -0.28),
      new THREE.Vector3(0.04, -0.78, -0.2),
    ],
    [
      new THREE.Vector3(0.24, -0.02, -0.14),
      new THREE.Vector3(0.36, -0.35, -0.25),
      new THREE.Vector3(0.28, -0.74, -0.2),
    ],
  ];
  for (let c = 0; c < cablePaths.length; c++) {
    const curve = new THREE.CatmullRomCurve3(cablePaths[c]!);
    const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.015, 8, false);
    geometries.push(tubeGeo);
    const tubeMesh = new THREE.Mesh(tubeGeo, c === 1 ? materials.accentTrim : materials.cable);
    displayGroup.add(tubeMesh);
  }

  // Primary XProtect Smart Client Widescreen (Center)
  const primaryMonitor = new THREE.Group();
  primaryMonitor.position.set(-0.04, 0.06, 0.02);

  const pFrameGeo = makeRoundedBox(1.48, 0.86, 0.06, 0.025);
  geometries.push(pFrameGeo);
  const pFrameMesh = new THREE.Mesh(pFrameGeo, materials.chassis);
  pFrameMesh.castShadow = true;
  pFrameMesh.receiveShadow = true;
  primaryMonitor.add(pFrameMesh);

  const pScreenGeo = new THREE.PlaneGeometry(1.4, 0.77);
  geometries.push(pScreenGeo);
  const pScreenMesh = new THREE.Mesh(pScreenGeo, materials.primaryScreen);
  pScreenMesh.position.z = 0.043;
  primaryMonitor.add(pScreenMesh);

  const pGlassGeo = new THREE.PlaneGeometry(1.42, 0.79);
  geometries.push(pGlassGeo);
  const pGlassMesh = new THREE.Mesh(pGlassGeo, materials.screenGlass);
  pGlassMesh.position.z = 0.048;
  pGlassMesh.renderOrder = 3;
  primaryMonitor.add(pGlassMesh);

  const pLedBarGeo = new THREE.BoxGeometry(0.42, 0.012, 0.018);
  geometries.push(pLedBarGeo);
  const pLedBar = new THREE.Mesh(pLedBarGeo, materials.accentTrim);
  pLedBar.position.set(0, -0.44, 0.036);
  primaryMonitor.add(pLedBar);

  displayGroup.add(primaryMonitor);
  tagInspectable(
    primaryMonitor,
    {
      id: 'smart-client-wall',
      label: 'Milestone XProtect Smart Client',
      spec: '2x2 Multi-Camera Quad + Sequence Timeline Scrubber · live feeds',
      sectionId: 'operations',
      vmsMode: 'live',
      actionLabel: 'View Deployments',
    },
    clickableTargets,
  );
  attachHoverRing('smart-client-wall', primaryMonitor, 1.35, 0.85, 0, 0.055, 0);

  // Secondary Right Angled Display: Smart Map & Alarm Queue
  const auxMonitor = new THREE.Group();
  auxMonitor.position.set(1.06, 0.06, 0.22);
  auxMonitor.rotation.y = -0.38;

  const aFrameGeo = makeRoundedBox(0.76, 0.86, 0.06, 0.025);
  geometries.push(aFrameGeo);
  const aFrameMesh = new THREE.Mesh(aFrameGeo, materials.chassis);
  aFrameMesh.castShadow = true;
  aFrameMesh.receiveShadow = true;
  auxMonitor.add(aFrameMesh);

  const aScreenGeo = new THREE.PlaneGeometry(0.68, 0.78);
  geometries.push(aScreenGeo);
  const aScreenMesh = new THREE.Mesh(aScreenGeo, materials.auxScreen);
  aScreenMesh.position.z = 0.043;
  auxMonitor.add(aScreenMesh);

  const aGlassGeo = new THREE.PlaneGeometry(0.7, 0.8);
  geometries.push(aGlassGeo);
  const aGlassMesh = new THREE.Mesh(aGlassGeo, materials.screenGlass);
  aGlassMesh.position.z = 0.048;
  aGlassMesh.renderOrder = 3;
  auxMonitor.add(aGlassMesh);

  const aLedBar = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.012, 0.018),
    materials.warmAccentLed,
  );
  geometries.push(aLedBar.geometry);
  aLedBar.position.set(0, -0.44, 0.036);
  auxMonitor.add(aLedBar);

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
  attachHoverRing('smart-map-display', auxMonitor, 0.78, 0.78, 0, 0.055, 0);

  // Third Left Angled Display: BriefCam Analytics & Gate LPR Telemetry
  const briefcamMonitor = new THREE.Group();
  briefcamMonitor.position.set(-1.12, 0.06, 0.22);
  briefcamMonitor.rotation.y = 0.38;

  const bFrameGeo = makeRoundedBox(0.72, 0.86, 0.06, 0.025);
  geometries.push(bFrameGeo);
  const bFrameMesh = new THREE.Mesh(bFrameGeo, materials.chassis);
  bFrameMesh.castShadow = true;
  bFrameMesh.receiveShadow = true;
  briefcamMonitor.add(bFrameMesh);

  const bScreenGeo = new THREE.PlaneGeometry(0.64, 0.78);
  geometries.push(bScreenGeo);
  const bScreenMesh = new THREE.Mesh(bScreenGeo, materials.briefcamScreen);
  bScreenMesh.position.z = 0.043;
  briefcamMonitor.add(bScreenMesh);

  const bGlassGeo = new THREE.PlaneGeometry(0.66, 0.8);
  geometries.push(bGlassGeo);
  const bGlassMesh = new THREE.Mesh(bGlassGeo, materials.screenGlass);
  bGlassMesh.position.z = 0.048;
  bGlassMesh.renderOrder = 3;
  briefcamMonitor.add(bGlassMesh);

  const bLedBar = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.012, 0.018), materials.accentTrim);
  geometries.push(bLedBar.geometry);
  bLedBar.position.set(0, -0.44, 0.036);
  briefcamMonitor.add(bLedBar);

  displayGroup.add(briefcamMonitor);
  tagInspectable(
    briefcamMonitor,
    {
      id: 'briefcam-telemetry',
      label: 'BriefCam Analytics & GIGO LPR',
      spec: 'Video synopsis motion spectrum & live commercial fleet LPR stream',
      sectionId: 'operations',
      vmsMode: 'alarms',
      actionLabel: 'Inspect Forensics',
    },
    clickableTargets,
  );
  attachHoverRing('briefcam-telemetry', briefcamMonitor, 0.72, 0.86, 0, 0.055, 0);

  root.add(displayGroup);
  explodeLayers.push({ object: displayGroup, baseY: 1.38, offsetY: 0.62 });

  // 7. Operator Desk Pod (Right): Precision PTZ Joystick & Jog-Shuttle Controller
  const podGroup = new THREE.Group();
  podGroup.position.set(0.56, 0.24, 0.56);
  podGroup.rotation.x = 0.1;

  const podBaseGeo = makeRoundedBox(1.06, 0.085, 0.42, 0.03);
  geometries.push(podBaseGeo);
  const podBaseMesh = new THREE.Mesh(podBaseGeo, materials.chassis);
  podBaseMesh.castShadow = true;
  podBaseMesh.receiveShadow = true;
  podGroup.add(podBaseMesh);

  // Tactile Aluminum Jog-Shuttle Playback Wheel (LatheGeometry)
  const wheelProfile = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.115, 0.0),
    new THREE.Vector2(0.115, 0.035),
    new THREE.Vector2(0.09, 0.046),
    new THREE.Vector2(0.048, 0.046),
    new THREE.Vector2(0.048, 0.035),
    new THREE.Vector2(0.0, 0.035),
  ];
  const wheelGeo = new THREE.LatheGeometry(wheelProfile, 40);
  geometries.push(wheelGeo);
  const wheelMesh = new THREE.Mesh(wheelGeo, materials.armMetal);
  wheelMesh.position.set(-0.32, 0.046, 0.02);
  wheelMesh.castShadow = true;
  podGroup.add(wheelMesh);

  // 12 Macro Alarm / Preset Hotkeys (InstancedMesh)
  const keyGeo = new THREE.BoxGeometry(0.056, 0.024, 0.056);
  geometries.push(keyGeo);
  const keysMesh = new THREE.InstancedMesh(keyGeo, materials.alarmKey, 12);
  for (let i = 0; i < 12; i++) {
    const col = i % 4;
    const row = Math.floor(i / 4);
    dummy.position.set(-0.08 + col * 0.078, 0.054, -0.08 + row * 0.078);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    keysMesh.setMatrixAt(i, dummy.matrix);
  }
  keysMesh.instanceMatrix.needsUpdate = true;
  keysMesh.computeBoundingSphere();
  podGroup.add(keysMesh);

  // Sculpted 3-Axis PTZ Joystick
  const joystickBaseGeo = new THREE.CylinderGeometry(0.09, 0.11, 0.04, 32);
  geometries.push(joystickBaseGeo);
  const joystickBase = new THREE.Mesh(joystickBaseGeo, materials.armMetal);
  joystickBase.position.set(0.34, 0.058, 0.02);
  podGroup.add(joystickBase);

  const joystickStick = new THREE.Group();
  joystickStick.position.set(0.34, 0.078, 0.02);

  const shaftGeo = new THREE.CylinderGeometry(0.017, 0.023, 0.14, 16);
  geometries.push(shaftGeo);
  const shaftMesh = new THREE.Mesh(shaftGeo, materials.armMetal);
  shaftMesh.position.y = 0.07;
  joystickStick.add(shaftMesh);

  const knobGeo = new THREE.SphereGeometry(0.044, 24, 20);
  geometries.push(knobGeo);
  const knobMesh = new THREE.Mesh(knobGeo, materials.accentTrim);
  knobMesh.position.y = 0.15;
  knobMesh.scale.set(1, 1.25, 1);
  knobMesh.castShadow = true;
  joystickStick.add(knobMesh);

  podGroup.add(joystickStick);
  root.add(podGroup);
  explodeLayers.push({ object: podGroup, baseY: 0.24, offsetY: 0.24 });

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
  attachHoverRing('ptz-console', podGroup, 1.0, 0.5, 0.08);

  // 8. Left Desk Module: Backlit Mechanical Operator Keyboard
  const kbGroup = new THREE.Group();
  kbGroup.position.set(-0.56, 0.22, 0.56);
  kbGroup.rotation.x = 0.07;

  const kbBodyGeo = makeRoundedBox(0.96, 0.052, 0.36, 0.025);
  geometries.push(kbBodyGeo);
  const kbBody = new THREE.Mesh(kbBodyGeo, materials.chassis);
  kbBody.castShadow = true;
  kbBody.receiveShadow = true;
  kbGroup.add(kbBody);

  const kbKeyGeo = new THREE.BoxGeometry(0.044, 0.018, 0.044);
  geometries.push(kbKeyGeo);
  const kbCols = 14;
  const kbRows = 4;
  const kbKeyInst = new THREE.InstancedMesh(kbKeyGeo, materials.keycap, kbCols * kbRows);
  for (let r = 0; r < kbRows; r++) {
    for (let c = 0; c < kbCols; c++) {
      const idx = r * kbCols + c;
      dummy.position.set(-0.38 + c * 0.058, 0.036, -0.095 + r * 0.058);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      kbKeyInst.setMatrixAt(idx, dummy.matrix);
    }
  }
  kbKeyInst.instanceMatrix.needsUpdate = true;
  kbKeyInst.computeBoundingSphere();
  kbGroup.add(kbKeyInst);

  root.add(kbGroup);
  explodeLayers.push({ object: kbGroup, baseY: 0.22, offsetY: 0.18 });
  tagInspectable(
    kbGroup,
    {
      id: 'operator-keyboard',
      label: 'Backlit Operator Console Deck',
      spec: 'XProtect hotkey matrix · GIGO gate logging & instant incident macro triggers',
      sectionId: 'about',
      vmsMode: 'live',
      actionLabel: 'View Operator Profile',
    },
    clickableTargets,
  );
  attachHoverRing('operator-keyboard', kbGroup, 0.9, 0.45, 0.06);

  // 9. Floating Holographic Reticle Nodes & Surveillance Icons around Workstation
  const holoNodesGroup = new THREE.Group();
  const holoNodePositions: Array<[number, number, number]> = [
    [-1.78, 1.52, 0.35],
    [1.76, 1.48, 0.42],
    [0.05, 2.08, -0.25],
    [-1.24, 0.85, 0.92],
    [1.24, 0.92, 0.92],
  ];
  const icoGeo = new THREE.OctahedronGeometry(0.07, 0);
  const frameRingGeo = new THREE.RingGeometry(0.11, 0.125, 4);
  geometries.push(icoGeo, frameRingGeo);

  for (let i = 0; i < holoNodePositions.length; i++) {
    const pos = holoNodePositions[i]!;
    const node = new THREE.Group();
    node.position.set(pos[0], pos[1], pos[2]);

    const core = new THREE.Mesh(icoGeo, materials.holoWire);
    const frame = new THREE.Mesh(frameRingGeo, materials.accentTrim);
    frame.rotation.z = Math.PI / 4;
    node.add(core, frame);
    node.userData.baseY = pos[1];
    node.userData.phase = i * 1.3;
    holoNodesGroup.add(node);
  }
  root.add(holoNodesGroup);

  // 10. Drifting Atmospheric Light Dust & Data Particles
  const dustCount = 150;
  const dustPositions = new Float32Array(dustCount * 3);
  const dustBasePositions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    const angle = (i * 2.39996) % (Math.PI * 2);
    const radius = 0.9 + ((i * 73) % 100) * 0.022;
    const x = Math.cos(angle) * radius;
    const y = 0.25 + ((i * 37) % 100) * 0.024;
    const z = Math.sin(angle) * radius;
    dustPositions[i * 3] = x;
    dustPositions[i * 3 + 1] = y;
    dustPositions[i * 3 + 2] = z;
    dustBasePositions[i * 3] = x;
    dustBasePositions[i * 3 + 1] = y;
    dustBasePositions[i * 3 + 2] = z;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  geometries.push(dustGeo);
  const dustPoints = new THREE.Points(dustGeo, materials.dustParticle);
  root.add(dustPoints);

  return {
    root,
    displayGroup,
    joystickStick,
    orbitRing,
    innerOrbitRing,
    holoNodesGroup,
    dustPoints,
    dustBasePositions,
    hoverHighlights,
    hoverMaterial,
    explodeLayers,
    clickableTargets,
    geometries,
  };
}
