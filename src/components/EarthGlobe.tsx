import { memo, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useIsTouch } from '@/motion/useIsTouch';
import { assetPath } from '@/utils/assets';

interface EarthGlobeProps {
  theme: 'dark' | 'light';
  decorative?: boolean;
}

type LonLat = readonly [number, number];

// Accurate simplified world continent polygons [longitude, latitude] in degrees
const CONTINENTS: readonly (readonly LonLat[])[] = [
  // North America
  [
    [-168, 65],
    [-156, 71],
    [-136, 69],
    [-124, 70],
    [-95, 70],
    [-80, 62],
    [-64, 60],
    [-55, 51],
    [-66, 44],
    [-75, 36],
    [-81, 25],
    [-88, 21],
    [-84, 10],
    [-78, 8],
    [-86, 11],
    [-95, 16],
    [-105, 20],
    [-112, 27],
    [-117, 32],
    [-124, 41],
    [-125, 49],
    [-136, 57],
    [-152, 60],
    [-164, 55],
    [-168, 65],
  ],
  // Greenland
  [
    [-52, 60],
    [-42, 60],
    [-22, 71],
    [-18, 81],
    [-44, 83],
    [-68, 77],
    [-56, 68],
    [-52, 60],
  ],
  // South America
  [
    [-78, 9],
    [-70, 12],
    [-60, 8],
    [-50, 1],
    [-35, -6],
    [-39, -15],
    [-42, -23],
    [-52, -33],
    [-62, -40],
    [-68, -54],
    [-74, -52],
    [-73, -41],
    [-71, -30],
    [-70, -18],
    [-78, -11],
    [-81, -4],
    [-78, 9],
  ],
  // Europe
  [
    [-9, 37],
    [-9, 43],
    [-2, 43],
    [-4, 48],
    [2, 51],
    [8, 54],
    [10, 58],
    [5, 61],
    [15, 69],
    [28, 71],
    [42, 67],
    [58, 69],
    [60, 55],
    [48, 45],
    [38, 45],
    [29, 41],
    [24, 38],
    [18, 40],
    [12, 43],
    [7, 44],
    [3, 42],
    [-5, 36],
    [-9, 37],
  ],
  // UK & Ireland
  [
    [-6, 50],
    [1, 51],
    [-1, 58],
    [-6, 57],
    [-6, 50],
  ],
  // Africa
  [
    [-17, 15],
    [-13, 28],
    [-6, 36],
    [10, 37],
    [25, 32],
    [33, 31],
    [43, 12],
    [51, 12],
    [49, 2],
    [40, -10],
    [35, -24],
    [28, -33],
    [18, -35],
    [14, -22],
    [12, -12],
    [9, -1],
    [8, 4],
    [-8, 5],
    [-16, 11],
    [-17, 15],
  ],
  // Madagascar
  [
    [44, -25],
    [47, -25],
    [50, -15],
    [49, -12],
    [44, -18],
    [44, -25],
  ],
  // Asia + Indian Subcontinent + SE Asia
  [
    [27, 41],
    [36, 36],
    [35, 30],
    [43, 13],
    [54, 17],
    [60, 23],
    [67, 25],
    [69, 22],
    [73, 19],
    [77, 8],
    [81, 16],
    [88, 22],
    [92, 21],
    [97, 16],
    [100, 13],
    [103, 2],
    [105, 10],
    [109, 13],
    [108, 21],
    [117, 24],
    [122, 31],
    [120, 39],
    [126, 38],
    [129, 35],
    [131, 43],
    [141, 52],
    [156, 51],
    [162, 60],
    [176, 66],
    [168, 70],
    [135, 72],
    [104, 77],
    [72, 72],
    [60, 69],
    [58, 55],
    [48, 45],
    [38, 45],
    [27, 41],
  ],
  // Japan
  [
    [130, 32],
    [136, 34],
    [141, 38],
    [145, 44],
    [140, 41],
    [135, 36],
    [130, 32],
  ],
  // Indonesia / Borneo / Sumatra
  [
    [96, 5],
    [105, -6],
    [108, -7],
    [114, -8],
    [109, -1],
    [102, 1],
    [96, 5],
  ],
  [
    [110, -3],
    [118, -3],
    [118, 5],
    [113, 2],
    [110, -3],
  ],
  // Australia
  [
    [114, -22],
    [122, -17],
    [131, -12],
    [137, -13],
    [142, -11],
    [146, -18],
    [153, -27],
    [150, -37],
    [141, -38],
    [132, -32],
    [122, -34],
    [115, -34],
    [114, -22],
  ],
];

// Patli, Haryana / NCR, India coordinates
const PATLI_LON = 76.85;
const PATLI_LAT = 28.45;
const DEG_TO_RAD = Math.PI / 180;
// Start centered slightly left of India so India rotates cleanly across the front hemisphere
const INITIAL_YAW = -(PATLI_LON * DEG_TO_RAD) + 0.25;
const AXIAL_TILT = 21 * DEG_TO_RAD;

function pointInRing(lon: number, lat: number, ring: readonly LonLat[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const p1 = ring[i];
    const p2 = ring[j];
    if (!p1 || !p2) continue;
    const xi = p1[0];
    const yi = p1[1];
    const xj = p2[0];
    const yj = p2[1];
    const intersect =
      yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi || 1e-6) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

interface GlobePoint {
  x: number;
  y: number;
  z: number;
  isIndia: boolean;
}

const LAND_DOTS: GlobePoint[] = (() => {
  const dots: GlobePoint[] = [];
  const latStep = 3.6;
  for (let lat = -60; lat <= 82; lat += latStep) {
    const cosLat = Math.cos(lat * DEG_TO_RAD);
    const lonStep = Math.max(3.6, latStep / Math.max(0.28, cosLat));
    for (let lon = -180; lon < 180; lon += lonStep) {
      let onLand = false;
      for (const ring of CONTINENTS) {
        if (pointInRing(lon, lat, ring)) {
          onLand = true;
          break;
        }
      }
      if (!onLand) continue;
      const phi = lat * DEG_TO_RAD;
      const lambda = lon * DEG_TO_RAD;
      const isIndia = lon >= 68 && lon <= 90 && lat >= 7 && lat <= 36;
      dots.push({
        x: Math.cos(phi) * Math.sin(lambda),
        y: Math.sin(phi),
        z: Math.cos(phi) * Math.cos(lambda),
        isIndia,
      });
    }
  }
  return dots;
})();

function projectPoint(
  x: number,
  y: number,
  z: number,
  yaw: number,
  pitch: number,
): { px: number; py: number; pz: number } {
  const cosY = Math.cos(yaw);
  const sinY = Math.sin(yaw);
  const x1 = x * cosY + z * sinY;
  const z1 = -x * sinY + z * cosY;

  const cosP = Math.cos(pitch);
  const sinP = Math.sin(pitch);
  const y2 = y * cosP - z1 * sinP;
  const z2 = y * sinP + z1 * cosP;

  return { px: x1, py: y2, pz: z2 };
}

export const EarthGlobe = memo(function EarthGlobe({ theme, decorative = false }: EarthGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasFailed, setCanvasFailed] = useState(false);
  const isTouch = useIsTouch();
  const prefersReducedMotion = useReducedMotion();
  const pointerTiltRef = useRef({ targetX: 0, targetY: 0, currentX: 0, currentY: 0 });
  const yawRef = useRef(INITIAL_YAW);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) {
      queueMicrotask(() => setCanvasFailed(true));
      return;
    }

    let size = 480;
    let rafId = 0;
    let isVisible = true;
    let isTabHidden = document.visibilityState === 'hidden';
    let lastTime = 0;

    const isLight = theme === 'light';

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      size = Math.max(240, Math.round(rect.width || 480));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawFrame = (timeMs: number) => {
      const cx = size / 2;
      const cy = size / 2;
      const radius = size * 0.415;

      ctx.clearRect(0, 0, size, size);

      const tilt = pointerTiltRef.current;
      tilt.currentX += (tilt.targetX - tilt.currentX) * 0.08;
      tilt.currentY += (tilt.targetY - tilt.currentY) * 0.08;

      const activeYaw = yawRef.current + tilt.currentX * 0.28;
      const activePitch = AXIAL_TILT + tilt.currentY * 0.22;

      // Subtle ground shadow directly underneath sphere
      const shadowY = cy + radius * 1.11;
      const shadowGrad = ctx.createRadialGradient(
        cx,
        shadowY,
        radius * 0.05,
        cx,
        shadowY,
        radius * 0.85,
      );
      shadowGrad.addColorStop(0, isLight ? 'rgba(15, 23, 42, 0.22)' : 'rgba(2, 6, 18, 0.72)');
      shadowGrad.addColorStop(1, 'rgba(2, 6, 18, 0)');
      ctx.save();
      ctx.translate(cx, shadowY);
      ctx.scale(1, 0.22);
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.85, 0, Math.PI * 2);
      ctx.fillStyle = shadowGrad;
      ctx.fill();
      ctx.restore();

      // Soft outer atmospheric halo
      const haloGrad = ctx.createRadialGradient(cx, cy, radius * 0.86, cx, cy, radius * 1.24);
      haloGrad.addColorStop(0, isLight ? 'rgba(14, 103, 150, 0.16)' : 'rgba(77, 166, 214, 0.16)');
      haloGrad.addColorStop(0.55, isLight ? 'rgba(37, 99, 235, 0.06)' : 'rgba(97, 142, 255, 0.07)');
      haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.24, 0, Math.PI * 2);
      ctx.fillStyle = haloGrad;
      ctx.fill();

      // Ocean sphere base with directional day/night shading
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      const sphereGrad = ctx.createRadialGradient(
        cx - radius * 0.34,
        cy - radius * 0.34,
        radius * 0.08,
        cx + radius * 0.14,
        cy + radius * 0.18,
        radius * 1.22,
      );
      if (isLight) {
        sphereGrad.addColorStop(0, '#1a4978');
        sphereGrad.addColorStop(0.55, '#0f2c52');
        sphereGrad.addColorStop(1, '#07172e');
      } else {
        sphereGrad.addColorStop(0, '#13315c');
        sphereGrad.addColorStop(0.5, '#081833');
        sphereGrad.addColorStop(1, '#020712');
      }
      ctx.fillStyle = sphereGrad;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

      // Subtle latitude/longitude graticule arcs
      ctx.lineWidth = 0.75;
      ctx.strokeStyle = isLight ? 'rgba(125, 211, 252, 0.14)' : 'rgba(97, 168, 255, 0.14)';

      for (let lat = -60; lat <= 60; lat += 30) {
        const phi = lat * DEG_TO_RAD;
        const y0 = Math.sin(phi);
        const r0 = Math.cos(phi);
        ctx.beginPath();
        let started = false;
        for (let lon = -180; lon <= 180; lon += 10) {
          const lambda = lon * DEG_TO_RAD;
          const p = projectPoint(
            r0 * Math.sin(lambda),
            y0,
            r0 * Math.cos(lambda),
            activeYaw,
            activePitch,
          );
          if (p.pz > -0.02) {
            const sx = cx + p.px * radius;
            const sy = cy - p.py * radius;
            if (!started) {
              ctx.moveTo(sx, sy);
              started = true;
            } else {
              ctx.lineTo(sx, sy);
            }
          } else {
            started = false;
          }
        }
        ctx.stroke();
      }

      for (let lon = -180; lon < 180; lon += 30) {
        const lambda = lon * DEG_TO_RAD;
        ctx.beginPath();
        let started = false;
        for (let lat = -85; lat <= 85; lat += 8) {
          const phi = lat * DEG_TO_RAD;
          const p = projectPoint(
            Math.cos(phi) * Math.sin(lambda),
            Math.sin(phi),
            Math.cos(phi) * Math.cos(lambda),
            activeYaw,
            activePitch,
          );
          if (p.pz > -0.02) {
            const sx = cx + p.px * radius;
            const sy = cy - p.py * radius;
            if (!started) {
              ctx.moveTo(sx, sy);
              started = true;
            } else {
              ctx.lineTo(sx, sy);
            }
          } else {
            started = false;
          }
        }
        ctx.stroke();
      }

      // Landmass dot matrix (front hemisphere only, shaded by z depth)
      const dotBaseRadius = Math.max(1.15, size * 0.0036);
      for (const dot of LAND_DOTS) {
        const p = projectPoint(dot.x, dot.y, dot.z, activeYaw, activePitch);
        if (p.pz <= 0.02) continue;

        const sx = cx + p.px * radius;
        const sy = cy - p.py * radius;
        const depthAlpha = 0.25 + p.pz * 0.72;

        if (dot.isIndia) {
          ctx.fillStyle = `rgba(126, 194, 232, ${Math.min(0.92, depthAlpha + 0.12).toFixed(3)})`;
        } else {
          ctx.fillStyle = isLight
            ? `rgba(186, 218, 240, ${(depthAlpha * 0.82).toFixed(3)})`
            : `rgba(148, 194, 232, ${(depthAlpha * 0.78).toFixed(3)})`;
        }
        ctx.beginPath();
        ctx.arc(sx, sy, dotBaseRadius * (0.72 + p.pz * 0.42), 0, Math.PI * 2);
        ctx.fill();
      }

      // Patli, Haryana / India operator beacon
      const patliPhi = PATLI_LAT * DEG_TO_RAD;
      const patliLambda = PATLI_LON * DEG_TO_RAD;
      const patliProj = projectPoint(
        Math.cos(patliPhi) * Math.sin(patliLambda),
        Math.sin(patliPhi),
        Math.cos(patliPhi) * Math.cos(patliLambda),
        activeYaw,
        activePitch,
      );

      if (patliProj.pz > 0.08) {
        const bx = cx + patliProj.px * radius;
        const by = cy - patliProj.py * radius;
        const activeNodeAttr = canvas.dataset.activeNode;
        const hasActiveNode = activeNodeAttr !== undefined && activeNodeAttr !== '';
        const activeNodeIndex = hasActiveNode ? Number(activeNodeAttr) : -1;
        const pulse = prefersReducedMotion ? 0.5 : (Math.sin(timeMs * 0.003) + 1) * 0.5;
        const ringRadius = (hasActiveNode ? 8 : 6) + pulse * (hasActiveNode ? 12 : 9);

        ctx.beginPath();
        ctx.arc(bx, by, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = hasActiveNode
          ? `rgba(0, 229, 255, ${(0.76 - pulse * 0.34).toFixed(3)})`
          : `rgba(126, 194, 232, ${(0.56 - pulse * 0.34).toFixed(3)})`;
        ctx.lineWidth = hasActiveNode ? 1.8 : 1.4;
        ctx.stroke();

        if (hasActiveNode) {
          ctx.beginPath();
          ctx.arc(bx, by, ringRadius + 5, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0, 229, 255, ${(0.34 - pulse * 0.18).toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(bx, by, hasActiveNode ? 4.2 : 3.4, 0, Math.PI * 2);
        ctx.fillStyle = hasActiveNode ? '#00e5ff' : '#7ec2e8';
        ctx.fill();

        if (hasActiveNode && Number.isFinite(activeNodeIndex) && activeNodeIndex >= 0) {
          const labels = ['KALASH HUB', 'EKART HUB', 'NCR CORRIDOR'] as const;
          const nodeLabel = labels[activeNodeIndex] ?? `NODE 0${activeNodeIndex + 1}`;
          ctx.save();
          ctx.font = '600 9px monospace';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = isLight ? 'rgba(8, 36, 56, 0.92)' : 'rgba(224, 247, 255, 0.96)';
          ctx.fillText(`0${activeNodeIndex + 1} · ${nodeLabel}`, bx + 11, by - 1);
          ctx.restore();
        }
      }

      // Fresnel-style atmospheric inner rim lighting
      const fresnelGrad = ctx.createRadialGradient(
        cx - radius * 0.12,
        cy - radius * 0.12,
        radius * 0.64,
        cx,
        cy,
        radius,
      );
      fresnelGrad.addColorStop(0, 'rgba(77, 166, 214, 0)');
      fresnelGrad.addColorStop(0.75, 'rgba(77, 166, 214, 0.05)');
      fresnelGrad.addColorStop(0.94, 'rgba(77, 166, 214, 0.22)');
      fresnelGrad.addColorStop(1, 'rgba(182, 224, 248, 0.44)');
      ctx.fillStyle = fresnelGrad;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

      ctx.restore();

      // Crisp exterior orbital ring accent
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = isLight ? 'rgba(14, 103, 150, 0.42)' : 'rgba(126, 194, 232, 0.34)';
      ctx.lineWidth = 1.25;
      ctx.stroke();
    };

    const tick = (timeMs: number) => {
      if (!isVisible || isTabHidden) {
        rafId = 0;
        return;
      }
      const delta = lastTime === 0 ? 16 : Math.min(timeMs - lastTime, 64);
      lastTime = timeMs;
      // Near-static drift under prefers-reduced-motion, smooth orbital rotation otherwise
      const speed = prefersReducedMotion ? 0.000018 : 0.00016;
      yawRef.current += delta * speed;
      drawFrame(timeMs);
      rafId = window.requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (!rafId && isVisible && !isTabHidden) {
        lastTime = 0;
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const stopLoop = () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
      drawFrame(performance.now());
    });
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry?.isIntersecting ?? true;
        if (isVisible) startLoop();
        else stopLoop();
      },
      { threshold: 0.02 },
    );
    intersectionObserver.observe(container);

    const onVisibilityChange = () => {
      isTabHidden = document.visibilityState === 'hidden';
      if (isTabHidden) stopLoop();
      else startLoop();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Immediate synchronous draw so frame 1 is never blank
    updateSize();
    drawFrame(0);
    startLoop();

    return () => {
      stopLoop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [prefersReducedMotion, theme]);

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (isTouch || prefersReducedMotion || event.pointerType === 'touch') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    pointerTiltRef.current.targetX = nx * 2;
    pointerTiltRef.current.targetY = ny * 2;
  };

  const resetPointerTilt = () => {
    pointerTiltRef.current.targetX = 0;
    pointerTiltRef.current.targetY = 0;
  };

  return (
    <div
      aria-hidden={decorative || undefined}
      className={decorative ? 'earth-stage earth-stage--decorative' : 'earth-stage'}
      onPointerLeave={decorative ? undefined : resetPointerTilt}
      onPointerMove={decorative ? undefined : handlePointerMove}
      ref={containerRef}
    >
      <div aria-hidden="true" className="earth-halo" />
      {canvasFailed ? (
        <img
          alt={decorative ? '' : 'Illustrative Earth globe centered over India'}
          className="earth-fallback-img"
          decoding="async"
          height="640"
          loading="lazy"
          src={assetPath('assets/earth-globe-poster.png')}
          width="640"
        />
      ) : (
        <canvas
          aria-label={
            decorative ? undefined : 'Interactive 3D Earth globe highlighting Patli, Haryana, India'
          }
          className="earth-canvas"
          height={480}
          ref={canvasRef}
          role={decorative ? undefined : 'img'}
          width={480}
        />
      )}
      {!decorative ? (
        <div className="earth-telemetry-caption">
          <span className="earth-telemetry-dot" aria-hidden="true" />
          <span>PATLI, HARYANA · 28.45° N, 76.85° E</span>
        </div>
      ) : null}
    </div>
  );
});
