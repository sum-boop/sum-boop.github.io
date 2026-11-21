import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text, Edges } from '@react-three/drei';
import { animated, useSpring } from '@react-spring/three';
import * as THREE from 'three';

// --- REVIEW VIEW (Video Synopsis) ---
function ReviewSynopsis() {
  const boxesRef = useRef([]);
  const count = 12;

  // Initialize boxes data
  const boxData = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      x: (Math.random() - 0.5) * 2.4,
      y: Math.random() * 0.3 + 0.1,
      z: (Math.random() - 0.5) * 1.0,
      speed: 0.2 + Math.random() * 0.4,
      type: Math.random() > 0.6 ? 'vehicle' : Math.random() > 0.3 ? 'person' : 'object',
      confidence: (0.9 + Math.random() * 0.09).toFixed(2),
    }));
  }, []);

  useFrame((_, delta) => {
    boxData.forEach((b, i) => {
      b.x += delta * b.speed;
      if (b.x > 1.4) b.x = -1.4;
      const el = boxesRef.current[i];
      if (el) {
        el.position.x = b.x;
      }
    });
  });

  const filterChips = ['PERSON', 'VEHICLE', 'COLOR', 'TIME'];

  return (
    <group position={[0, -0.05, 0]}>
      {/* Timeline track floor */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.8, 1.2]} />
        <meshStandardMaterial color="#0B1018" roughness={0.8} />
      </mesh>
      {/* Grid lines on track */}
      <gridHelper args={[2.8, 14, 0x22d3ee, 0x1a2230]} position={[0, -0.49, 0]} />

      {/* Filter Chips */}
      <group position={[-1.2, 0.55, 0]}>
        {filterChips.map((chip, i) => (
          <FilterChip key={chip} label={chip} index={i} />
        ))}
      </group>

      {/* Floating bounding boxes */}
      {boxData.map((b, i) => {
        const color =
          b.type === 'vehicle' ? '#3B82F6' : b.type === 'person' ? '#22D3EE' : '#FBBF24';
        return (
          <group key={i} ref={(el) => (boxesRef.current[i] = el)} position={[b.x, b.y, b.z]}>
            <RoundedBox args={[0.25, 0.35, 0.2]} radius={0.02} smoothness={2}>
              <meshPhysicalMaterial
                color={color}
                transmission={0.6}
                roughness={0.2}
                transparent
                opacity={0.3}
                emissive={color}
                emissiveIntensity={0.5}
                toneMapped={false}
              />
              <Edges color={color} threshold={15} />
            </RoundedBox>
            <Text position={[0, 0.22, 0]} fontSize={0.03} color={color} anchorX="center">
              {b.type.toUpperCase()} {b.confidence}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

function FilterChip({ label, index }) {
  const [hovered, setHovered] = useState(false);
  const { scale, emissive } = useSpring({
    scale: hovered ? 1.05 : 1,
    emissive: hovered ? 1.8 : 0.8,
    config: { tension: 300, friction: 20 },
  });

  return (
    <animated.group
      position={[index * 0.65, 0, 0]}
      scale={scale}
      onPointerOver={() => {
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      <RoundedBox args={[0.6, 0.12, 0.02]} radius={0.02} smoothness={2}>
        <meshStandardMaterial
          color="#1A2230"
          emissive="#22D3EE"
          emissiveIntensity={emissive}
          toneMapped={false}
        />
      </RoundedBox>
      <Text
        position={[0, 0, 0.015]}
        fontSize={0.03}
        color="#E6F1FF"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </animated.group>
  );
}

// --- RESPOND VIEW (Alerts) ---
function RespondAlerts() {
  const borderRef = useRef();
  const scanLineRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (borderRef.current) {
      borderRef.current.material.emissiveIntensity = 1.2 + Math.sin(t * 4) * 2.0;
    }
    if (scanLineRef.current) {
      scanLineRef.current.position.y = -0.3 + ((t * 0.8) % 0.6);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Pulsing Alert Panel */}
      <group position={[-0.6, 0.05, 0]}>
        <RoundedBox args={[1.5, 1.1, 0.03]} radius={0.04} smoothness={3}>
          <meshStandardMaterial color="#0B1018" roughness={0.4} />
        </RoundedBox>
        {/* Pulsing red border */}
        <lineSegments ref={borderRef}>
          <edgesGeometry args={[new THREE.BoxGeometry(1.48, 1.08, 0.04)]} />
          <lineBasicMaterial color="#FF2B4A" linewidth={3} />
        </lineSegments>

        <Text position={[-0.68, 0.45, 0.02]} fontSize={0.04} color="#FF2B4A" anchorX="left">
          AI ALERT: FACE MATCH (96%)
        </Text>
        <Text position={[-0.68, 0.35, 0.02]} fontSize={0.028} color="#E6F1FF" anchorX="left">
          CAM 03 - PARKING B | 18:56:22
        </Text>

        {/* Suspect silhouette card */}
        <group position={[-0.45, -0.05, 0.02]}>
          <mesh>
            <planeGeometry args={[0.4, 0.5]} />
            <meshBasicMaterial color="#1A2230" />
          </mesh>
          <mesh ref={scanLineRef} position={[0, 0, 0.002]}>
            <planeGeometry args={[0.38, 0.01]} />
            <meshBasicMaterial color="#FF2B4A" toneMapped={false} />
          </mesh>
        </group>

        {/* Action Buttons */}
        <ActionButton label="ACKNOWLEDGE" position={[0.25, 0.15, 0.02]} color="#22D3EE" />
        <ActionButton label="DISPATCH" position={[0.25, -0.15, 0.02]} color="#FF2B4A" />
      </group>

      {/* Older Alerts Stack */}
      <group position={[0.85, 0, 0]}>
        {[
          { title: 'INTRUSION DETECTED', cam: 'CAM 01 - LOBBY', time: '18:50:12' },
          { title: 'UNAUTHORIZED BAG', cam: 'CAM 04 - VAULT', time: '18:42:05' },
          { title: 'LICENSE PLATE WATCH', cam: 'CAM 02 - PERIM', time: '18:31:50' },
        ].map((alert, i) => (
          <group key={i} position={[0, 0.35 - i * 0.38, 0]}>
            <RoundedBox args={[1.1, 0.32, 0.02]} radius={0.02} smoothness={2}>
              <meshStandardMaterial color="#0B1018" transparent opacity={0.7} roughness={0.5} />
            </RoundedBox>
            <Text position={[-0.5, 0.08, 0.015]} fontSize={0.025} color="#FBBF24" anchorX="left">
              {alert.title}
            </Text>
            <Text position={[-0.5, -0.02, 0.015]} fontSize={0.02} color="#E6F1FF" anchorX="left">
              {alert.cam}
            </Text>
            <Text position={[-0.5, -0.09, 0.015]} fontSize={0.018} color="#8892B0" anchorX="left">
              {alert.time}
            </Text>
          </group>
        ))}
      </group>
    </group>
  );
}

function ActionButton({ label, position, color }) {
  const [hovered, setHovered] = useState(false);
  const { scale, emissive } = useSpring({
    scale: hovered ? 1.05 : 1,
    emissive: hovered ? 2.5 : 1.0,
    config: { tension: 300, friction: 20 },
  });

  return (
    <animated.group
      position={position}
      scale={scale}
      onPointerOver={() => {
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      <RoundedBox args={[0.55, 0.18, 0.02]} radius={0.02} smoothness={2}>
        <meshStandardMaterial
          color="#1A2230"
          emissive={color}
          emissiveIntensity={emissive}
          toneMapped={false}
        />
      </RoundedBox>
      <Text
        position={[0, 0, 0.015]}
        fontSize={0.025}
        color="#E6F1FF"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </animated.group>
  );
}

// --- RESEARCH VIEW (Analytics) ---
function ResearchAnalytics() {
  const barsRef = useRef();
  const barCount = 12;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!barsRef.current) return;
    const t = clock.getElapsedTime();
    for (let i = 0; i < barCount; i++) {
      const h = 0.1 + Math.abs(Math.sin(t * 1.5 + i * 0.4)) * 0.5;
      dummy.position.set(-1.0 + i * 0.18, -0.4 + h / 2, 0);
      dummy.scale.set(1, h * 5, 1);
      dummy.updateMatrix();
      barsRef.current.setMatrixAt(i, dummy.matrix);
    }
    barsRef.current.instanceMatrix.needsUpdate = true;
  });

  const barGeom = useMemo(() => new THREE.BoxGeometry(0.12, 0.1, 0.04), []);
  const barMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#3B82F6',
        emissive: '#3B82F6',
        emissiveIntensity: 1.5,
        toneMapped: false,
      }),
    [],
  );

  return (
    <group position={[0, 0, 0]}>
      {/* Metric Readout Card */}
      <group position={[-0.7, 0.35, 0]}>
        <RoundedBox args={[1.3, 0.45, 0.02]} radius={0.02} smoothness={2}>
          <meshStandardMaterial color="#0B1018" roughness={0.5} />
        </RoundedBox>
        <Text position={[-0.55, 0.08, 0.015]} fontSize={0.035} color="#22D3EE" anchorX="left">
          1,284 OBJECTS DETECTED
        </Text>
        <Text position={[-0.55, -0.06, 0.015]} fontSize={0.022} color="#E6F1FF" anchorX="left">
          Peak hour: 14:00 - 15:00 (+14% vs avg)
        </Text>
      </group>

      {/* Instanced Bar Chart */}
      <group position={[0.1, -0.1, 0]}>
        <instancedMesh ref={barsRef} args={[barGeom, barMat, barCount]} />
        <Text position={[-1.0, -0.5, 0]} fontSize={0.025} color="#8892B0" anchorX="left">
          HOURLY OBJECT TRAJECTORY VOLUME
        </Text>
      </group>
    </group>
  );
}

// --- MAIN BriefCamEngine COMPONENT ---
export function BriefCamEngine({ activeTab }) {
  const { reviewOpacity, reviewY, respondOpacity, respondY, researchOpacity, researchY } =
    useSpring({
      reviewOpacity: activeTab === 'REVIEW' ? 1 : 0,
      reviewY: activeTab === 'REVIEW' ? 0 : -0.1,
      respondOpacity: activeTab === 'RESPOND' ? 1 : 0,
      respondY: activeTab === 'RESPOND' ? 0 : -0.1,
      researchOpacity: activeTab === 'RESEARCH' ? 1 : 0,
      researchY: activeTab === 'RESEARCH' ? 0 : -0.1,
      config: { tension: 280, friction: 24 },
    });

  return (
    <group>
      {/* REVIEW VIEW */}
      <animated.group
        style={{ opacity: reviewOpacity, positionY: reviewY }}
        visible={activeTab === 'REVIEW'}
      >
        <ReviewSynopsis />
      </animated.group>

      {/* RESPOND VIEW */}
      <animated.group
        style={{ opacity: respondOpacity, positionY: respondY }}
        visible={activeTab === 'RESPOND'}
      >
        <RespondAlerts />
      </animated.group>

      {/* RESEARCH VIEW */}
      <animated.group
        style={{ opacity: researchOpacity, positionY: researchY }}
        visible={activeTab === 'RESEARCH'}
      >
        <ResearchAnalytics />
      </animated.group>
    </group>
  );
}

// --- HEATMAP FLOOR PLAN ---
export function HeatmapFloorPlan() {
  const gridRef = useRef();
  const rows = 28;
  const cols = 16;
  const totalCells = rows * cols;

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colorArray = useMemo(() => new Float32Array(totalCells * 3), [totalCells]);

  useFrame(({ clock }) => {
    if (!gridRef.current) return;
    const t = clock.getElapsedTime() * 0.5;
    const cLow = new THREE.Color('#3B82F6');
    const cMid = new THREE.Color('#FBBF24');
    const cHigh = new THREE.Color('#FF2B4A');

    let idx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = (r - rows / 2) * 0.05;
        const z = (c - cols / 2) * 0.05;
        const noise = Math.sin(r * 0.3 + t) * Math.cos(c * 0.3 + t) * 0.5 + 0.5;
        const h = 0.02 + noise * 0.25;

        dummy.position.set(x, h / 2, z);
        dummy.scale.set(1, h * 10, 1);
        dummy.updateMatrix();
        gridRef.current.setMatrixAt(idx, dummy.matrix);

        let col = cLow;
        if (noise > 0.6) col = cHigh;
        else if (noise > 0.3) col = cMid;

        col.toArray(colorArray, idx * 3);
        idx++;
      }
    }
    gridRef.current.instanceMatrix.needsUpdate = true;
    gridRef.current.instanceColor.needsUpdate = true;
  });

  const boxGeom = useMemo(() => new THREE.BoxGeometry(0.045, 0.02, 0.045), []);

  return (
    <group rotation={[-0.9, 0.78, 0]} scale={[0.8, 0.8, 0.8]}>
      {/* Floor plan base */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.6, 1.0]} />
        <meshStandardMaterial color="#0B1018" roughness={0.7} />
      </mesh>

      {/* Instanced Heatmap Grid */}
      <instancedMesh ref={gridRef} args={[boxGeom, null, totalCells]}>
        <meshStandardMaterial roughness={0.3} toneMapped={false} />
        <instancedBufferAttribute attach="instanceColor" args={[colorArray, 3]} />
      </instancedMesh>

      {/* Room labels */}
      <Text
        position={[-0.5, 0.2, -0.3]}
        fontSize={0.04}
        color="#22D3EE"
        rotation={[Math.PI / 2, 0, 0]}
      >
        LOBBY
      </Text>
      <Text
        position={[0.4, 0.2, 0.3]}
        fontSize={0.04}
        color="#22D3EE"
        rotation={[Math.PI / 2, 0, 0]}
      >
        SERVER ROOM
      </Text>
    </group>
  );
}

export default BriefCamEngine;
