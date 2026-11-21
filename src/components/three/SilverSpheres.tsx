import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import type * as THREE from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/*
 * Chrome-silver sphere cluster for the Services band (5lab /services look).
 * No network assets: reflections come from drei Lightformers, not an HDR file.
 * Pauses when off-screen, responds to the pointer, and is skipped without WebGL.
 */

interface SphereSpec {
  position: [number, number, number];
  radius: number;
  phase: number;
}

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildSpheres(count: number): SphereSpec[] {
  const rand = mulberry32(5173);
  const specs: SphereSpec[] = [];
  let guard = 0;
  while (specs.length < count && guard < 4000) {
    guard += 1;
    const radius = 0.55 + rand() * 0.45;
    const u = rand() * 2 - 1;
    const theta = rand() * Math.PI * 2;
    const dist = 2.4 * Math.cbrt(rand());
    const flat = Math.sqrt(1 - u * u);
    const position: [number, number, number] = [
      dist * flat * Math.cos(theta) * 1.25,
      dist * u * 0.9,
      dist * flat * Math.sin(theta),
    ];
    const clear = specs.every(
      (other) =>
        Math.hypot(
          other.position[0] - position[0],
          other.position[1] - position[1],
          other.position[2] - position[2],
        ) >
        other.radius + radius - 0.05,
    );
    if (clear) {
      specs.push({ position, radius, phase: rand() * Math.PI * 2 });
    }
  }
  return specs;
}

function Cluster({ animate }: { animate: boolean }) {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const specs = useMemo(() => buildSpheres(26), []);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    if (animate) {
      g.rotation.y += delta * 0.12;
      g.rotation.x += (pointer.current.y * 0.22 - g.rotation.x) * 0.05;
    }
    g.children.forEach((child, index) => {
      const spec = specs[index];
      if (!spec) return;
      child.position.y =
        spec.position[1] + (animate ? Math.sin(state.clock.elapsedTime * 0.6 + spec.phase) * 0.08 : 0);
    });
  });

  return (
    <group ref={group}>
      {specs.map((spec, index) => (
        <mesh key={index} position={spec.position}>
          <sphereGeometry args={[spec.radius, 48, 48]} />
          <meshPhysicalMaterial
            clearcoat={0.6}
            clearcoatRoughness={0.2}
            color={index === 0 ? '#ff4a68' : '#e4e6ee'}
            envMapIntensity={1.25}
            metalness={1}
            roughness={index === 0 ? 0.22 : 0.14}
          />
        </mesh>
      ))}
    </group>
  );
}

function detectWebGL(): boolean {
  try {
    const probe = document.createElement('canvas');
    return Boolean(probe.getContext('webgl2') || probe.getContext('webgl'));
  } catch {
    return false;
  }
}

export function SilverSpheres() {
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [webgl] = useState<boolean>(() => detectWebGL());

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => setInView(entries.some((entry) => entry.isIntersecting)),
      { rootMargin: '120px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div aria-hidden="true" className="skills-spheres" ref={wrapRef}>
      {webgl ? (
        <Canvas
          camera={{ fov: 34, position: [0, 0, 9] }}
          dpr={[1, 1.5]}
          frameloop={inView ? 'always' : 'never'}
          gl={{ alpha: true, antialias: true }}
        >
          <Environment resolution={256}>
            <Lightformer form="rect" intensity={3} position={[0, 5, -5]} scale={[12, 4, 1]} />
            <Lightformer
              form="rect"
              intensity={2}
              position={[-6, 1, 2]}
              rotation={[0, Math.PI / 2, 0]}
              scale={[8, 5, 1]}
            />
            <Lightformer
              form="rect"
              intensity={2}
              position={[6, 0, 2]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={[8, 5, 1]}
            />
            <Lightformer form="circle" intensity={1.5} position={[0, -4, 3]} scale={4} />
          </Environment>
          <Cluster animate={!reduced} />
        </Canvas>
      ) : null}
    </div>
  );
}

export default SilverSpheres;
