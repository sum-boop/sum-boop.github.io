import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text } from '@react-three/drei';
import { animated, useSpring } from '@react-spring/three';
import * as THREE from 'three';

const CCTVShader = {
  uniforms: {
    uTime: { value: 0 },
    uSeed: { value: 1.0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uSeed;
    varying vec2 vUv;

    float random(vec2 st) {
      return fract(sin(dot(st.xy + uSeed, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    void main() {
      vec2 uv = vUv;
      float scanline = sin(uv.y * 350.0 + uTime * 8.0) * 0.07;
      float noise = random(uv * (mod(uTime, 10.0) + 1.0)) * 0.1;
      vec2 center = uv - 0.5;
      float vignette = 1.0 - dot(center, center) * 1.2;
      vec3 col = vec3(0.04, 0.12, 0.18) * vignette;
      col -= scanline;
      col += noise;
      gl_FragColor = vec4(col, 1.0);
    }
  `
};

function ScreenFrame({ width, height, position, rotation, onFocus, focusKey, children }) {
  const [hovered, setHovered] = useState(false);
  const bezelMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: 0x0B1018,
    metalness: 0.8,
    roughness: 0.3,
  }), []);

  const glassMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transmission: 0.9,
    roughness: 0.1,
    thickness: 0.5,
    ior: 1.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    reflectivity: 0.9,
    transparent: true,
    opacity: 0.88,
  }), []);

  return (
    <group
      position={position}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        if (onFocus && focusKey) onFocus(focusKey);
      }}
      onPointerOver={() => {
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      {/* Bezel */}
      <RoundedBox args={[width, height, 0.06]} radius={0.05} smoothness={4} castShadow receiveShadow>
        <primitive object={bezelMat} attach="material" />
      </RoundedBox>

      {/* Thin Cyan Emissive Edge Line */}
      <lineSegments position={[0, 0, 0.031]}>
        <edgesGeometry args={[new THREE.BoxGeometry(width - 0.02, height - 0.02, 0.001)]} />
        <lineBasicMaterial color="#22D3EE" transparent opacity={hovered ? 1.0 : 0.6} linewidth={2} />
      </lineSegments>

      {/* Glass Front */}
      <mesh position={[0, 0, 0.031]}>
        <planeGeometry args={[width - 0.04, height - 0.04]} />
        <primitive object={glassMat} attach="material" />
      </mesh>

      {/* Inner Content Area */}
      <group position={[0, 0, 0.035]}>
        {/* Background dark panel */}
        <mesh position={[0, 0, -0.002]}>
          <planeGeometry args={[width - 0.08, height - 0.08]} />
          <meshBasicMaterial color="#05070B" />
        </mesh>
        {children}
      </group>
    </group>
  );
}

function TabButton({ label, active, onClick, position }) {
  const [hovered, setHovered] = useState(false);
  const { scale, emissive } = useSpring({
    scale: hovered ? 1.05 : 1,
    emissive: hovered || active ? 1.8 : 0.6,
    config: { tension: 300, friction: 20 }
  });

  return (
    <animated.group
      position={position}
      scale={scale}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={() => {
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      <RoundedBox args={[0.32, 0.1, 0.02]} radius={0.02} smoothness={2}>
        <meshStandardMaterial
          color="#1A2230"
          emissive="#22D3EE"
          emissiveIntensity={emissive.get ? 1.0 : 0.6}
          toneMapped={false}
        />
      </RoundedBox>
      <Text
        position={[0, 0, 0.015]}
        fontSize={0.032}
        color="#E6F1FF"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
      {active && (
        <mesh position={[0, -0.05, 0.012]}>
          <planeGeometry args={[0.28, 0.006]} />
          <meshBasicMaterial color="#22D3EE" />
        </mesh>
      )}
    </animated.group>
  );
}

export function HeatmapSlot({ children, position = [4.6, 1.25, -0.9], rotation = [0, -0.45, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {children}
    </group>
  );
}

export default function HolographicScreens({ activeTab, setActiveTab, onFocus, children }) {
  const [timeStr, setTimeStr] = useState('');
  const [playheadX, setPlayheadX] = useState(-1.0);
  const shaderMatsRef = useRef([]);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toTimeString().split(' ')[0]);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    shaderMatsRef.current.forEach((mat) => {
      if (mat && mat.uniforms && mat.uniforms.uTime) {
        mat.uniforms.uTime.value = t;
      }
    });
    setPlayheadX(-1.0 + (t * 0.3) % 2.0);
  });

  const cwt1 = useMemo(() => {
    const m = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uSeed: { value: 1.1 } },
      vertexShader: CCTVShader.vertexShader,
      fragmentShader: CCTVShader.fragmentShader,
    });
    return m;
  }, []);

  const cwt2 = useMemo(() => {
    const m = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uSeed: { value: 2.3 } },
      vertexShader: CCTVShader.vertexShader,
      fragmentShader: CCTVShader.fragmentShader,
    });
    return m;
  }, []);

  const cwt3 = useMemo(() => {
    const m = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uSeed: { value: 3.7 } },
      vertexShader: CCTVShader.vertexShader,
      fragmentShader: CCTVShader.fragmentShader,
    });
    return m;
  }, []);

  const cwt4 = useMemo(() => {
    const m = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uSeed: { value: 4.9 } },
      vertexShader: CCTVShader.vertexShader,
      fragmentShader: CCTVShader.fragmentShader,
    });
    return m;
  }, []);

  useEffect(() => {
    shaderMatsRef.current = [cwt1, cwt2, cwt3, cwt4];
  }, [cwt1, cwt2, cwt3, cwt4]);

  return (
    <group>
      {/* 2. MAIN SCREEN (-1.9, 1.35, -0.6) */}
      <ScreenFrame
        width={3.2}
        height={1.8}
        position={[-1.9, 1.35, -0.6]}
        rotation={[0, 0.18, 0]}
        onFocus={onFocus}
        focusKey="main"
      >
        {/* Top Header */}
        <group position={[0, 0.8, 0]}>
          <Text position={[-1.3, 0, 0]} fontSize={0.04} color="#22D3EE" anchorX="left">
            XPROTECT // SMART CLIENT
          </Text>
          <Text position={[-0.4, 0, 0]} fontSize={0.035} color="#E6F1FF" anchorX="left">
            LIVE | PLAYBACK
          </Text>
          <Text position={[1.2, 0, 0]} fontSize={0.035} color="#FBBF24" anchorX="right">
            {timeStr}
          </Text>
        </group>

        {/* 4-way Grid Cameras */}
        <group position={[0, 0.1, 0]}>
          {/* Tile 1 (-0.75, 0.35) */}
          <group position={[-0.75, 0.35, 0]}>
            <mesh material={cwt1}>
              <planeGeometry args={[1.48, 0.95]} />
            </mesh>
            <Text position={[-0.68, 0.4, 0.002]} fontSize={0.028} color="#E6F1FF" anchorX="left">
              CAM 01 - LOBBY
            </Text>
            <mesh position={[0.62, 0.4, 0.002]}>
              <circleGeometry args={[0.015, 16]} />
              <meshBasicMaterial color="#FF2B4A" />
            </mesh>
            <Text position={[-0.68, -0.4, 0.002]} fontSize={0.022} color="#22D3EE" anchorX="left">
              18:53:32 UTC
            </Text>
          </group>

          {/* Tile 2 (0.75, 0.35) */}
          <group position={[0.75, 0.35, 0]}>
            <mesh material={cwt2}>
              <planeGeometry args={[1.48, 0.95]} />
            </mesh>
            <Text position={[-0.68, 0.4, 0.002]} fontSize={0.028} color="#E6F1FF" anchorX="left">
              CAM 02 - PERIMETER
            </Text>
            <mesh position={[0.62, 0.4, 0.002]}>
              <circleGeometry args={[0.015, 16]} />
              <meshBasicMaterial color="#FF2B4A" />
            </mesh>
            <Text position={[-0.68, -0.4, 0.002]} fontSize={0.022} color="#22D3EE" anchorX="left">
              18:53:32 UTC
            </Text>
          </group>

          {/* Tile 3 (-0.75, -0.65) */}
          <group position={[-0.75, -0.65, 0]}>
            <mesh material={cwt3}>
              <planeGeometry args={[1.48, 0.95]} />
            </mesh>
            <Text position={[-0.68, 0.4, 0.002]} fontSize={0.028} color="#E6F1FF" anchorX="left">
              CAM 03 - CORRIDOR B
            </Text>
            <mesh position={[0.62, 0.4, 0.002]}>
              <circleGeometry args={[0.015, 16]} />
              <meshBasicMaterial color="#FF2B4A" />
            </mesh>
            <Text position={[-0.68, -0.4, 0.002]} fontSize={0.022} color="#22D3EE" anchorX="left">
              18:53:32 UTC
            </Text>
          </group>

          {/* Tile 4 (0.75, -0.65) */}
          <group position={[0.75, -0.65, 0]}>
            <mesh material={cwt4}>
              <planeGeometry args={[1.48, 0.95]} />
            </mesh>
            <Text position={[-0.68, 0.4, 0.002]} fontSize={0.028} color="#E6F1FF" anchorX="left">
              CAM 04 - VAULT ENTRY
            </Text>
            <mesh position={[0.62, 0.4, 0.002]}>
              <circleGeometry args={[0.015, 16]} />
              <meshBasicMaterial color="#FF2B4A" />
            </mesh>
            <Text position={[-0.68, -0.4, 0.002]} fontSize={0.022} color="#22D3EE" anchorX="left">
              18:53:32 UTC
            </Text>
          </group>
        </group>

        {/* Bottom Timeline Scrubber */}
        <group position={[0, -0.75, 0]}>
          <RoundedBox args={[2.9, 0.04, 0.01]} radius={0.02} smoothness={2}>
            <meshStandardMaterial color="#1A2230" emissive="#22D3EE" emissiveIntensity={0.8} />
          </RoundedBox>
          {/* Playhead */}
          <mesh position={[playheadX, 0, 0.01]}>
            <capsuleGeometry args={[0.015, 0.08, 4, 8]} />
            <meshBasicMaterial color="#22D3EE" />
          </mesh>
          <Text position={[playheadX, 0.08, 0.01]} fontSize={0.025} color="#22D3EE">
            {timeStr}
          </Text>
        </group>
      </ScreenFrame>

      {/* 3 & 4. BRIEFCAM SCREEN (1.9, 1.35, -0.6) */}
      <ScreenFrame
        width={3.2}
        height={1.8}
        position={[1.9, 1.35, -0.6]}
        rotation={[0, -0.18, 0]}
        onFocus={onFocus}
        focusKey="briefcam"
      >
        {/* Top Header & Tabs */}
        <group position={[0, 0.78, 0]}>
          <Text position={[-1.3, 0, 0]} fontSize={0.038} color="#3B82F6" anchorX="left">
            BRIEFCAM L4 ANALYTICS
          </Text>
          <group position={[0.3, 0, 0]}>
            <TabButton
              label="REVIEW"
              active={activeTab === 'review'}
              onClick={() => {
                setActiveTab('review');
                onFocus('briefcam');
              }}
              position={[-0.5, 0, 0]}
            />
            <TabButton
              label="RESPOND"
              active={activeTab === 'respond'}
              onClick={() => {
                setActiveTab('respond');
                onFocus('briefcam');
              }}
              position={[0, 0, 0]}
            />
            <TabButton
              label="RESEARCH"
              active={activeTab === 'research'}
              onClick={() => {
                setActiveTab('research');
                onFocus('briefcam');
              }}
              position={[0.5, 0, 0]}
            />
          </group>
        </group>

        {/* Content area for BriefCamEngine */}
        <group position={[0, -0.1, 0]}>
          {children}
        </group>
      </ScreenFrame>

      {/* 5. HEATMAP SCREEN (4.6, 1.25, -0.9) */}
      <ScreenFrame
        width={2.4}
        height={1.5}
        position={[4.6, 1.25, -0.9]}
        rotation={[0, -0.45, 0]}
        onFocus={onFocus}
        focusKey="heatmap"
      >
        <group position={[0, 0.62, 0]}>
          <Text position={[-1.0, 0, 0]} fontSize={0.035} color="#FBBF24" anchorX="left">
            RESEARCH / HEATMAP
          </Text>
        </group>

        {/* Low-to-high gradient bar legend */}
        <group position={[0, -0.62, 0]}>
          <mesh position={[-0.5, 0, 0]}>
            <planeGeometry args={[1.0, 0.04]} />
            <meshBasicMaterial color="#3B82F6" />
          </mesh>
          <Text position={[-1.0, -0.05, 0]} fontSize={0.02} color="#E6F1FF" anchorX="left">
            LOW
          </Text>
          <Text position={[1.0, -0.05, 0]} fontSize={0.02} color="#FF2B4A" anchorX="right">
            HIGH
          </Text>
        </group>
      </ScreenFrame>
    </group>
  );
}
