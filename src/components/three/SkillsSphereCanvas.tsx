import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';

function SphereCluster({ isReduced }: { isReduced: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const spheres = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      position: [Math.sin(i * 1.2) * 2.0, Math.cos(i * 1.7) * 1.2, ((i % 3) - 1) * 0.9] as [
        number,
        number,
        number,
      ],
      scale: 0.55 + (i % 3) * 0.22,
      speed: 0.4 + i * 0.15,
    }));
  }, []);

  useFrame((state) => {
    if (isReduced || !groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.12;
    groupRef.current.rotation.x = Math.sin(t * 0.08) * 0.08;
  });

  return (
    <group ref={groupRef}>
      <Environment resolution={256}>
        <Lightformer position={[0, 4, 4]} scale={8} intensity={2.5} color="#ffffff" />
        <Lightformer position={[-4, -4, -4]} scale={8} intensity={1.2} color="#ff223a" />
      </Environment>
      {spheres.map((s, idx) => (
        <mesh key={idx} position={s.position} scale={s.scale}>
          <sphereGeometry args={[1, 48, 48]} />
          <meshPhysicalMaterial
            metalness={1.0}
            roughness={0.04}
            clearcoat={1.0}
            clearcoatRoughness={0.04}
            color="#e2e8f0"
          />
        </mesh>
      ))}
    </group>
  );
}

export function SkillsSphereCanvas() {
  const reduced = useReducedMotion();
  const [webglSupported] = useState(() => {
    if (typeof window === 'undefined') return true;
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      return !!gl;
    } catch {
      return false;
    }
  });

  if (reduced || !webglSupported) {
    return <div className="skills-sphere-fallback" aria-hidden="true" />;
  }

  return (
    <div className="skills-sphere-canvas-wrap" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={1.0} />
        <directionalLight position={[4, 4, 4]} intensity={2.0} />
        <SphereCluster isReduced={reduced} />
      </Canvas>
    </div>
  );
}
