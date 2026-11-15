import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';

export default function WorkstationConsole({ position = [0, 0, 0] }) {
  const ptzKnobRef = useRef();
  const keysRef = useRef();
  const ledStripRef = useRef();

  // Memoized geometries and materials
  const deskMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: 0x0B1018,
    metalness: 0.6,
    roughness: 0.25,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
  }), []);

  const steelMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0x1A2230,
    metalness: 0.8,
    roughness: 0.3,
  }), []);

  const ledMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: 0x22D3EE,
  }), []);

  const keyGeom = useMemo(() => new THREE.BoxGeometry(0.016, 0.01, 0.016), []);
  const keyMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0x0B1018,
    roughness: 0.4,
    metalness: 0.2,
  }), []);

  // Keyboard instance matrices setup
  const keyCount = 95;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  React.useEffect(() => {
    if (!keysRef.current) return;
    let idx = 0;
    // Main block 15x5
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 15; c++) {
        if (idx >= keyCount) break;
        const x = -0.65 + c * 0.019;
        const z = -0.12 + r * 0.019;
        dummy.position.set(x, 0.01, z);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        keysRef.current.setMatrixAt(idx, dummy.matrix);
        idx++;
      }
    }
    // Numpad block 4x5
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 4; c++) {
        if (idx >= keyCount) break;
        const x = 0.35 + c * 0.019;
        const z = -0.12 + r * 0.019;
        dummy.position.set(x, 0.01, z);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        keysRef.current.setMatrixAt(idx, dummy.matrix);
        idx++;
      }
    }
    // Spacebar
    if (idx < keyCount) {
      dummy.position.set(-0.2, 0.01, 0.06);
      dummy.scale.set(6, 1, 1);
      dummy.updateMatrix();
      keysRef.current.setMatrixAt(idx, dummy.matrix);
    }
    keysRef.current.instanceMatrix.needsUpdate = true;
  }, [dummy]);

  // Idle animation for joystick knob
  useFrame(({ clock }) => {
    if (ptzKnobRef.current) {
      const t = clock.getElapsedTime();
      ptzKnobRef.current.rotation.x = Math.sin(t * 1.5) * 0.04;
      ptzKnobRef.current.rotation.z = Math.cos(t * 1.2) * 0.04;
    }
    if (ledStripRef.current) {
      const t = clock.getElapsedTime();
      ledStripRef.current.material.emissiveIntensity = 2.0 + Math.sin(t * 3) * 0.5;
    }
  });

  return (
    <group position={position}>
      {/* 7. Floor with MeshReflectorMaterial & hex/ring line pattern */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[14, 64]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixStrength={40}
          roughness={0.2}
          mirror={0.7}
          color="#05070B"
          metalness={0.5}
        />
      </mesh>

      {/* Faint concentric ring grid pattern on floor */}
      <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        {[4, 7, 10].map((radius, i) => (
          <mesh key={i}>
            <ringGeometry args={[radius - 0.02, radius, 64]} />
            <meshBasicMaterial color="#22D3EE" transparent opacity={0.06} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>

      {/* 1. Command Desk */}
      <group position={[0, 0.75, 0]}>
        {/* Desk Top */}
        <RoundedBox args={[9, 0.08, 2.4]} radius={0.04} smoothness={4} castShadow receiveShadow>
          <primitive object={deskMat} attach="material" />
        </RoundedBox>

        {/* Side Panels / Legs in Brushed Steel */}
        <mesh position={[-4.3, -0.37, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.2, 0.74, 2.2]} />
          <primitive object={steelMat} attach="material" />
        </mesh>
        <mesh position={[4.3, -0.37, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.2, 0.74, 2.2]} />
          <primitive object={steelMat} attach="material" />
        </mesh>

        {/* Thin Cyan Emissive LED Strip along front bottom edge */}
        <mesh ref={ledStripRef} position={[0, -0.4, 1.18]}>
          <boxGeometry args={[8.8, 0.015, 0.015]} />
          <meshStandardMaterial color="#22D3EE" emissive="#22D3EE" emissiveIntensity={2.5} toneMapped={false} />
        </mesh>

        {/* Faint Under-Desk Glow Plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.42, 0]}>
          <planeGeometry args={[8, 2]} />
          <meshBasicMaterial color="#22D3EE" transparent opacity={0.15} />
        </mesh>
      </group>

      {/* 2. Keyboard */}
      <group position={[-1.2, 0.79, 0.3]}>
        <instancedMesh ref={keysRef} args={[keyGeom, keyMat, keyCount]} castShadow receiveShadow />
      </group>

      {/* 3. Mouse and Mousepad */}
      <group position={[-0.4, 0.79, 0.3]}>
        {/* Mousepad */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
          <planeGeometry args={[0.28, 0.22]} />
          <meshStandardMaterial color="#0B1018" roughness={0.9} />
        </mesh>
        {/* Mousepad border */}
        <lineSegments position={[0, 0.0012, 0]}>
          <edgesGeometry args={[new THREE.PlaneGeometry(0.28, 0.22)]} />
          <lineBasicMaterial color="#22D3EE" transparent opacity={0.4} />
        </lineSegments>
        {/* Ergonomic Rounded Mouse */}
        <RoundedBox args={[0.07, 0.03, 0.12]} radius={0.015} smoothness={3} position={[0, 0.015, 0]} castShadow>
          <meshStandardMaterial color="#1A2230" metalness={0.4} roughness={0.3} />
        </RoundedBox>
        {/* Tiny Cyan LED on mouse */}
        <mesh position={[0, 0.032, -0.03]}>
          <sphereGeometry args={[0.003, 16, 16]} />
          <primitive object={ledMat} attach="material" />
        </mesh>
      </group>

      {/* 4. Joystick / PTZ Controller */}
      <group position={[0.6, 0.79, 0.25]}>
        {/* Base */}
        <mesh position={[0, 0.015, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.09, 0.1, 0.03, 32]} />
          <primitive object={steelMat} attach="material" />
        </mesh>
        {/* PTZ Joystick Knob */}
        <group ref={ptzKnobRef} position={[0, 0.03, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.02, 0.025, 0.08, 16]} />
            <meshStandardMaterial color="#0B1018" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.045, 0]}>
            <sphereGeometry args={[0.025, 16, 16]} />
            <meshStandardMaterial color="#3B82F6" metalness={0.6} roughness={0.2} />
          </mesh>
        </group>
        {/* 8 Small Illuminated Buttons */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const r = 0.065;
          const bx = Math.cos(angle) * r;
          const bz = Math.sin(angle) * r;
          const isAmber = i % 2 === 0;
          return (
            <mesh key={i} position={[bx, 0.032, bz]}>
              <cylinderGeometry args={[0.006, 0.006, 0.008, 16]} />
              <meshStandardMaterial
                color={isAmber ? '#FBBF24' : '#22D3EE'}
                emissive={isAmber ? '#FBBF24' : '#22D3EE'}
                emissiveIntensity={2}
                toneMapped={false}
              />
            </mesh>
          );
        })}
      </group>

      {/* 5. Monitor Stands (Stands only, no screens) at specified coordinates */}
      {/* Main Screen Stand at [-1.9, 1.35, -0.6] */}
      <group position={[-1.9, 0.79, -0.6]}>
        <mesh position={[0, 0.01, 0]} castShadow>
          <boxGeometry args={[0.3, 0.02, 0.25]} />
          <primitive object={steelMat} attach="material" />
        </mesh>
        <mesh position={[0, 0.3, -0.08]} castShadow>
          <cylinderGeometry args={[0.03, 0.035, 0.58, 16]} />
          <primitive object={steelMat} attach="material" />
        </mesh>
      </group>

      {/* BriefCam Screen Stand at [1.9, 1.35, -0.6] */}
      <group position={[1.9, 0.79, -0.6]}>
        <mesh position={[0, 0.01, 0]} castShadow>
          <boxGeometry args={[0.3, 0.02, 0.25]} />
          <primitive object={steelMat} attach="material" />
        </mesh>
        <mesh position={[0, 0.3, -0.08]} castShadow>
          <cylinderGeometry args={[0.03, 0.035, 0.58, 16]} />
          <primitive object={steelMat} attach="material" />
        </mesh>
      </group>

      {/* Heatmap Screen Stand at [4.6, 1.25, -0.9] */}
      <group position={[4.6, 0.79, -0.9]}>
        <mesh position={[0, 0.01, 0]} castShadow>
          <boxGeometry args={[0.3, 0.02, 0.25]} />
          <primitive object={steelMat} attach="material" />
        </mesh>
        <mesh position={[0, 0.25, -0.08]} castShadow>
          <cylinderGeometry args={[0.03, 0.035, 0.48, 16]} />
          <primitive object={steelMat} attach="material" />
        </mesh>
      </group>

      {/* 6. Ergonomic Chair Silhouette behind the desk */}
      <group position={[0, 0, 1.3]}>
        {/* Chair Base / Wheels */}
        <mesh position={[0, 0.05, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 0.06, 16]} />
          <primitive object={steelMat} attach="material" />
        </mesh>
        {/* Gas Lift Cylinder */}
        <mesh position={[0, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.45, 16]} />
          <primitive object={steelMat} attach="material" />
        </mesh>
        {/* Seat Cushion */}
        <RoundedBox args={[0.55, 0.12, 0.55]} radius={0.04} smoothness={3} position={[0, 0.55, 0]} castShadow>
          <meshPhysicalMaterial color={0x0B1018} roughness={0.4} metalness={0.1} sheen={1} sheenColor={0x22D3EE} />
        </RoundedBox>
        {/* Backrest */}
        <RoundedBox args={[0.52, 0.75, 0.1]} radius={0.04} smoothness={3} position={[0, 0.98, -0.22]} rotation={[0.1, 0, 0]} castShadow>
          <meshPhysicalMaterial color={0x0B1018} roughness={0.4} metalness={0.1} sheen={1} sheenColor={0x22D3EE} />
        </RoundedBox>
        {/* Headrest */}
        <RoundedBox args={[0.26, 0.14, 0.06]} radius={0.02} smoothness={3} position={[0, 1.42, -0.25]} rotation={[0.1, 0, 0]} castShadow>
          <meshPhysicalMaterial color={0x0B1018} roughness={0.4} metalness={0.1} sheen={1} sheenColor={0x22D3EE} />
        </RoundedBox>
      </group>
    </group>
  );
}
