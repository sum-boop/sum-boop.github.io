// npm i three @react-three/fiber @react-three/drei @react-three/postprocessing postprocessing @react-spring/three maath

import React, { useState, useEffect, Suspense, lazy, Component } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { ACESFilmicToneMapping } from 'three';

import workstationHeroImg from '@/assets/images/workstation_command_hero_1794781430131.jpg';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { StageSkeleton } from '../StageSkeleton';

const LazyWorkstationScene = lazy(() => import('./WorkstationSceneContent'));

// Error Boundary for 3D scene fallback
class SceneErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Workstation3D Error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="relative w-full h-[80vh] min-h-[520px] bg-[#05070B] flex items-center justify-center overflow-hidden">
          <img
            src={workstationHeroImg}
            alt="XProtect VMS Workstation Fallback"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05070B] via-transparent to-[#05070B]/80" />
          <div className="absolute top-6 left-6 backdrop-blur-md bg-white/5 border border-white/10 px-4 py-2 rounded-full text-[11px] tracking-[0.2em] uppercase text-[#22D3EE]">
            LIVE COMMAND CENTER
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Triggers on-demand R3F invalidation on focus/tab transitions and pointer hover without idle 60fps spin
function DemandInvalidateBridge({ triggerKey }) {
  const { invalidate, gl } = useThree();

  useEffect(() => {
    let rafId = 0;
    const deadline = performance.now() + 900;
    const pumpTransition = () => {
      invalidate();
      if (performance.now() < deadline) {
        rafId = window.requestAnimationFrame(pumpTransition);
      }
    };
    pumpTransition();
    return () => window.cancelAnimationFrame(rafId);
  }, [invalidate, triggerKey]);

  useEffect(() => {
    const dom = gl.domElement;
    if (!dom) return;
    let lastMove = 0;
    const handleMove = () => {
      const now = performance.now();
      if (now - lastMove < 32) return;
      lastMove = now;
      invalidate();
    };
    dom.addEventListener('pointermove', handleMove, { passive: true });
    return () => dom.removeEventListener('pointermove', handleMove);
  }, [gl, invalidate]);

  return null;
}

export default function Workstation3D() {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [tab, setTab] = useState('REVIEW');
  const [focus, setFocus] = useState('overview');

  if (isMobile) {
    return (
      <section className="relative w-full h-[80vh] min-h-[520px] bg-[#05070B] flex items-center justify-center overflow-hidden">
        <img
          src={workstationHeroImg}
          alt="XProtect VMS Monitoring Workstation"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070B] via-transparent to-[#05070B]/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.15)_0%,transparent_70%)]" />
        <div className="absolute top-6 left-6 backdrop-blur-md bg-white/5 border border-white/10 px-4 py-2 rounded-full text-[11px] tracking-[0.2em] uppercase text-[#22D3EE] shadow-lg">
          LIVE COMMAND CENTER
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full h-[80vh] min-h-[520px] bg-[#05070B] overflow-hidden select-none">
      <SceneErrorBoundary>
        <Suspense fallback={<StageSkeleton label="Initializing XProtect Smart Client…" variant="vms" />}>
          <Canvas
            frameloop="demand"
            dpr={[1, 2]}
            shadows
            gl={{
              antialias: false,
              powerPreference: 'high-performance',
              toneMapping: ACESFilmicToneMapping,
              toneMappingExposure: 1.1,
            }}
            camera={{ position: [0, 1.9, 6.2], fov: 40 }}
            onPointerMissed={() => setFocus('overview')}
          >
            <DemandInvalidateBridge triggerKey={`${focus}:${tab}`} />
            <LazyWorkstationScene tab={tab} setTab={setTab} focus={focus} setFocus={setFocus} />
          </Canvas>
        </Suspense>
      </SceneErrorBoundary>

      {/* HTML Overlay UI */}
      <div className="absolute top-6 left-6 pointer-events-none">
        <div className="backdrop-blur-md bg-white/5 border border-white/10 px-4 py-2 rounded-full text-[11px] tracking-[0.2em] uppercase text-[#22D3EE] shadow-lg">
          SENTINEL COMMAND / LIVE
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-2 pointer-events-auto">
        <div className="flex items-center space-x-2 backdrop-blur-md bg-[#0B1018]/80 border border-white/10 p-1.5 rounded-full shadow-2xl">
          {[
            { id: 'overview', label: 'OVERVIEW' },
            { id: 'screen-focus', label: 'MAIN VIEW' },
            { id: 'briefcam-focus', label: 'BRIEFCAM' },
            { id: 'heatmap', label: 'HEATMAP' },
          ].map((item) => {
            const isActive = focus === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setFocus(item.id)}
                className={`px-4 py-2 rounded-full text-[11px] tracking-[0.2em] uppercase transition-all duration-300 ${
                  isActive
                    ? 'bg-[#22D3EE] text-[#05070B] font-bold shadow-[0_0_15px_rgba(34,211,238,0.5)]'
                    : 'text-[#E6F1FF] hover:bg-[#22D3EE]/10'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
        <span className="text-[10px] tracking-[0.15em] text-[#8892B0] uppercase">
          Click a screen to focus - Esc to exit
        </span>
      </div>
    </section>
  );
}
