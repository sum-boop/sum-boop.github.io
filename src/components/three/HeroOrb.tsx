import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useReducedMotion } from '@/hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

// Scales the unit sphere (radius 1) inside a 2.05x orb canvas slot with camera z=3.2, fov=40
// so the sphere's pixel diameter equals --orb-size while radius 1.3..1.9 particles remain unclipped.
const ORB_BASE_SCALE = 0.568;
const PARTICLE_COUNT = 60;
const SELF_ROTATION_SPEED = 0.05;
const POINTER_TILT_MAX = 0.15;
const POINTER_TILT_LERP = 0.06;

/*
 * Compact 3D Simplex Noise (MIT License, Ashima Arts / Stefan Gustavson / Ian McEwan)
 * https://github.com/ashima/webgl-noise
 */
const SIMPLEX_NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
  return mod289(((x * 34.0) + 1.0) * x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(
    permute(
      permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) +
      i.y + vec4(0.0, i1.y, i2.y, 1.0)
    ) +
    i.x + vec4(0.0, i1.x, i2.x, 1.0)
  );

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

const ORB_VERTEX_SHADER = /* glsl */ `
uniform float uTime;
uniform float uScroll;
uniform vec2 uMouse;

varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vObjectPos;

${SIMPLEX_NOISE_GLSL}

float sampleDisplacement(vec3 p) {
  float flow = uTime * 0.15;
  return snoise(p * 1.4 + vec3(flow, flow * 0.7, -flow * 0.5)) * 0.12;
}

void main() {
  vec3 n = normalize(normal);
  float d0 = sampleDisplacement(position);
  vec3 displaced = position + n * d0;

  // Perturb normal via local tangent frame for smooth glossy highlights on displaced blobs
  vec3 refAxis = abs(n.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  vec3 tangent = normalize(cross(refAxis, n));
  vec3 bitangent = normalize(cross(n, tangent));
  float eps = 0.015;

  vec3 p1 = normalize(position + tangent * eps);
  vec3 p2 = normalize(position + bitangent * eps);
  vec3 dPos1 = (p1 + p1 * sampleDisplacement(p1)) - displaced;
  vec3 dPos2 = (p2 + p2 * sampleDisplacement(p2)) - displaced;
  vec3 perturbedNormal = normalize(cross(dPos1, dPos2));
  if (dot(perturbedNormal, n) < 0.0) {
    perturbedNormal = -perturbedNormal;
  }

  vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
  vNormal = normalize(normalMatrix * perturbedNormal);
  vViewDir = normalize(-mvPosition.xyz);
  vObjectPos = position + vec3(uMouse.x * 0.08, uMouse.y * 0.08, uScroll * 0.1);

  gl_Position = projectionMatrix * mvPosition;
}
`;

const ORB_FRAGMENT_SHADER = /* glsl */ `
uniform float uTime;
uniform float uScroll;
uniform vec2 uMouse;
uniform float uOpacity;

varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vObjectPos;

${SIMPLEX_NOISE_GLSL}

void main() {
  vec3 darkRed = vec3(0.165, 0.016, 0.063);  // #2A0410
  vec3 violet  = vec3(0.231, 0.114, 0.561);  // #3B1D8F
  vec3 magenta = vec3(0.659, 0.016, 0.525);  // #A80486
  vec3 red     = vec3(1.000, 0.133, 0.227);  // #FF223A
  vec3 rimPink = vec3(1.000, 0.340, 0.520);

  vec3 N = normalize(vNormal);
  vec3 V = normalize(vViewDir);

  float colorNoise = snoise(
    vObjectPos * 1.15 + vec3(-uTime * 0.08, uTime * 0.1, uScroll * 0.45)
  ) * 0.5 + 0.5;
  float detailNoise = snoise(
    vObjectPos * 2.1 + vec3(uTime * 0.06, -uTime * 0.05, 1.7)
  ) * 0.5 + 0.5;

  // Key light positioned upper-right-front with subtle pointer influence
  vec3 lightDir = normalize(vec3(0.65 + uMouse.x * 0.12, 0.72 + uMouse.y * 0.12, 0.85));
  float wrapDiff = clamp(dot(N, lightDir) * 0.5 + 0.5, 0.0, 1.0);

  vec3 baseColor = mix(darkRed, violet, smoothstep(0.18, 0.58, colorNoise));
  baseColor = mix(baseColor, magenta, smoothstep(0.4, 0.78, colorNoise * 0.72 + wrapDiff * 0.38));
  baseColor = mix(baseColor, red, smoothstep(0.55, 0.92, wrapDiff * 0.65 + detailNoise * 0.42));

  // Deepen shadow patches toward #2A0410
  baseColor = mix(darkRed, baseColor, smoothstep(0.08, 0.85, wrapDiff * 0.8 + detailNoise * 0.2));

  // Fresnel rim biased slightly toward the right/top edge
  float fresnel = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 2.5);
  float topRightBias = smoothstep(-0.35, 0.85, N.x * 0.65 + N.y * 0.75);
  vec3 rimColor = mix(red, rimPink, topRightBias);
  float rimStrength = fresnel * (0.55 + 0.75 * topRightBias);

  // Soft glossy specular highlight from one fixed light
  vec3 halfVec = normalize(lightDir + V);
  float spec = pow(max(dot(N, halfVec), 0.0), 28.0) * 0.48;
  vec3 specTint = vec3(1.0, 0.82, 0.88);

  vec3 finalColor = baseColor + rimColor * rimStrength + specTint * spec;
  gl_FragColor = vec4(finalColor, uOpacity);
}
`;

const PARTICLES_VERTEX_SHADER = /* glsl */ `
attribute vec3 aPhase;

uniform float uTime;
uniform float uPixelRatio;

void main() {
  vec3 pos = position;
  pos.x += sin(uTime * 0.25 + aPhase.x) * 0.06;
  pos.y += cos(uTime * 0.21 + aPhase.y) * 0.06;
  pos.z += sin(uTime * 0.19 + aPhase.z) * 0.06;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = 2.0 * uPixelRatio;
}
`;

const PARTICLES_FRAGMENT_SHADER = /* glsl */ `
uniform float uOpacity;

void main() {
  vec2 centered = gl_PointCoord - vec2(0.5);
  float dist = length(centered);
  if (dist > 0.5) discard;

  float softMask = 1.0 - smoothstep(0.28, 0.5, dist);
  gl_FragColor = vec4(1.0, 1.0, 1.0, 0.5 * uOpacity * softMask);
}
`;

function detectWebGLSupport(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    if (!gl) {
      return false;
    }
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

interface OrbSceneProps {
  isTouchDevice: boolean;
  pixelRatioCap: number;
}

function OrbScene({ isTouchDevice, pixelRatioCap }: OrbSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const orbMeshRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const pixelRatioRef = useRef(pixelRatioCap);
  const timeRef = useRef(0);
  const scrollProgressRef = useRef(0);
  const pointerTargetRef = useRef({ x: 0, y: 0 });
  const pointerCurrentRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    pixelRatioRef.current = pixelRatioCap;
  }, [pixelRatioCap]);

  useEffect(() => {
    const orbMesh = orbMeshRef.current;
    const pointsMesh = pointsRef.current;
    if (!orbMesh || !pointsMesh) return;

    const orbGeometry = new THREE.IcosahedronGeometry(1, 64);
    const orbMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uOpacity: { value: 1 },
      },
      vertexShader: ORB_VERTEX_SHADER,
      fragmentShader: ORB_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: true,
    });

    orbMesh.geometry = orbGeometry;
    orbMesh.material = orbMaterial;

    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const phases = new Float32Array(PARTICLE_COUNT * 3);

    // Deterministic golden-ratio shell distribution (radius 1.3..1.9)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const t = (i + 0.5) / PARTICLE_COUNT;
      const phi = Math.acos(1 - 2 * t);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const frac = Math.abs(Math.sin(i * 12.9898 + 78.233));
      const radius = 1.3 + frac * 0.6;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi);
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      phases[i * 3] = i * 0.73;
      phases[i * 3 + 1] = i * 1.17;
      phases[i * 3 + 2] = i * 1.61;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 3));

    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: pixelRatioRef.current },
        uOpacity: { value: 1 },
      },
      vertexShader: PARTICLES_VERTEX_SHADER,
      fragmentShader: PARTICLES_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
    });

    pointsMesh.geometry = particleGeometry;
    pointsMesh.material = particleMaterial;

    return () => {
      orbGeometry.dispose();
      orbMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
    };
  }, []);

  useEffect(() => {
    const heroEl = document.getElementById('hero');
    if (!heroEl) return;

    const st = ScrollTrigger.create({
      trigger: heroEl,
      start: 'top top',
      end: 'bottom 30%',
      scrub: true,
      onUpdate: (self) => {
        scrollProgressRef.current = self.progress;
      },
    });

    scrollProgressRef.current = st.progress;
    return () => {
      st.kill();
    };
  }, []);

  useEffect(() => {
    if (isTouchDevice) {
      pointerTargetRef.current.x = 0;
      pointerTargetRef.current.y = 0;
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const nx = (event.clientX / Math.max(window.innerWidth, 1)) * 2 - 1;
      const ny = (event.clientY / Math.max(window.innerHeight, 1)) * 2 - 1;
      pointerTargetRef.current.x = Math.max(-1, Math.min(1, nx));
      pointerTargetRef.current.y = Math.max(-1, Math.min(1, ny));
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [isTouchDevice]);

  useFrame((_, delta) => {
    const clampedDelta = Math.min(delta, 0.05);
    timeRef.current += clampedDelta;
    const elapsed = timeRef.current;

    const progress = scrollProgressRef.current;
    const fadeProgress = Math.max(0, Math.min(1, (progress - 0.85) / 0.15));
    const opacity = 1 - fadeProgress;

    if (isTouchDevice) {
      pointerCurrentRef.current.x = 0;
      pointerCurrentRef.current.y = 0;
    } else {
      pointerCurrentRef.current.x +=
        (pointerTargetRef.current.x - pointerCurrentRef.current.x) * POINTER_TILT_LERP;
      pointerCurrentRef.current.y +=
        (pointerTargetRef.current.y - pointerCurrentRef.current.y) * POINTER_TILT_LERP;
    }

    const tiltX = pointerCurrentRef.current.x * POINTER_TILT_MAX;
    const tiltY = pointerCurrentRef.current.y * POINTER_TILT_MAX;

    const group = groupRef.current;
    if (group) {
      const scrollScale = 1 - progress * 0.3;
      group.scale.setScalar(ORB_BASE_SCALE * scrollScale);
      group.rotation.y = elapsed * SELF_ROTATION_SPEED + tiltX;
      group.rotation.x = tiltY;

      const orbMesh = group.children[0] as THREE.Mesh | undefined;
      const orbMat = orbMesh?.material as THREE.ShaderMaterial | undefined;
      if (orbMat?.uniforms) {
        orbMat.uniforms.uTime!.value = elapsed;
        orbMat.uniforms.uScroll!.value = progress;
        orbMat.uniforms.uOpacity!.value = opacity;
        (orbMat.uniforms.uMouse!.value as THREE.Vector2).set(
          pointerCurrentRef.current.x,
          -pointerCurrentRef.current.y,
        );
      }

      const ptMesh = group.children[1] as THREE.Points | undefined;
      const ptMat = ptMesh?.material as THREE.ShaderMaterial | undefined;
      if (ptMat?.uniforms) {
        ptMat.uniforms.uTime!.value = elapsed;
        ptMat.uniforms.uPixelRatio!.value = pixelRatioRef.current;
        ptMat.uniforms.uOpacity!.value = opacity;
      }
    }
  });

  return (
    <group ref={groupRef} scale={ORB_BASE_SCALE}>
      <mesh ref={orbMeshRef} />
      <points ref={pointsRef} />
    </group>
  );
}

export function HeroOrb() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTouchDevice = useMediaQuery('(hover: none), (pointer: coarse)');
  const prefersReducedMotion = useReducedMotion();
  const [webglReady] = useState<boolean>(() => detectWebGLSupport());
  const [contextLost, setContextLost] = useState(false);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const targetEl = document.getElementById('hero') ?? containerRef.current;
    if (!targetEl || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setInView(entry.isIntersecting);
        }
      },
      { threshold: 0.01 },
    );

    observer.observe(targetEl);
    return () => observer.disconnect();
  }, []);

  if (prefersReducedMotion || !webglReady || contextLost) {
    return (
      <div className="hero-orb-slot" ref={containerRef}>
        <div className="hero-orb-fallback" />
      </div>
    );
  }

  const maxDpr = isMobile ? 1.25 : 1.75;

  return (
    <div className="hero-orb-slot hero-orb-slot--canvas" ref={containerRef}>
      <Canvas
        camera={{ fov: 40, position: [0, 0, 3.2] }}
        dpr={[1, maxDpr]}
        frameloop={inView ? 'always' : 'never'}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          const canvas = gl.domElement;
          const handleContextLost = (event: Event) => {
            event.preventDefault();
            setContextLost(true);
          };
          canvas.addEventListener('webglcontextlost', handleContextLost, { once: true });
        }}
      >
        <OrbScene isTouchDevice={isTouchDevice} pixelRatioCap={maxDpr} />
      </Canvas>
    </div>
  );
}

export default HeroOrb;
