// npm i three @react-three/fiber @react-three/drei @react-three/postprocessing postprocessing @react-spring/three maath

import React, { useState, useEffect, Suspense, lazy, Component } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html, Environment, ContactShadows, Sparkles, AdaptiveDpr, PerformanceMonitor } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { ACESFilmicToneMapping } from 'three';

import WorkstationConsole from './WorkstationConsole';
import HolographicScreens, { HeatmapSlot } from './HolographicScreens';
import { BriefCamEngine, HeatmapFloorPlan } from './BriefCamEngine';
import CameraRig from './CameraRig';

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
            src="/images/workstation-fallback.jpg"
            alt="Workstation Fallback"
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

// Custom hook for mobile and reduced motion detection
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 767px)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    setIsMobile(mobileQuery.matches);
    setReducedMotion(motionQuery.matches);

    const handleMobileChange = (e) => setIsMobile(e.matches);
    const handleMotionChange = (e) => setReducedMotion(e.matches);

    mobileQuery.addEventListener('change', handleMobileChange);
    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      mobileQuery.removeEventListener('change', handleMobileChange);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  return { isMobile, reducedMotion };
}

// Minimal Loader Component
function Loader() {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center space-y-3 p-6 backdrop-blur-md bg-[#0B1018]/80 border border-[#22D3EE]/30 rounded-xl">
        <div className="w-8 h-8 border-2 border-[#22D3EE] border-t-transparent rounded-full animate-spin" />
        <span className="text-[11px] tracking-[0.2em] uppercase text-[#E6F1FF]">
          INITIALIZING SMART CLIENT
        </span>
      </div>
    </Html>
  );
}

// Scene contents component
function WorkstationScene({ tab, setTab, focus, setFocus, degraded }) {
  return (
    <>
      <color attach="background" args={['#05070B']} />
      <fog attach="fog" args={['#05070B', 9, 22]} />

      <Environment preset="night" environmentIntensity={0.6} />

      {/* Key SpotLight */}
      <spotLight
        position={[0, 6, 3]}
        angle={0.5}
        penumbra={1}
        intensity={120}
        color="#9fe8ff"
        castShadow
        shadow-mapSize={2048}
      />

      {/* Cyan rim point light behind screens */}
      <pointLight position={[0, 2.2, -1.5]} color="#22D3EE" intensity={35} distance={8} />

      {/* Faint amber fill light near keyboard */}
      <pointLight position={[-1.2, 1.2, 0.5]} color="#FBBF24" intensity={8} distance={3} />

      {/* Sparkles atmospheric effect */}
      <Sparkles count={120} scale={[12, 5, 8]} size={2} speed={0.25} opacity={0.5} color="#22D3EE" />

      {/* Workstation Console */}
      <WorkstationConsole />

      {/* Holographic Screens & BriefCam Engine */}
      <HolographicScreens
        activeTab={tab}
        setActiveTab={(newTab) => {
          setTab(newTab);
          setFocus('briefcam');
        }}
        onFocus={setFocus}
      >
        <BriefCamEngine activeTab={tab} />
      </HolographicScreens>

      {/* Heatmap Slot */}
      <HeatmapSlot>
        <HeatmapFloorPlan />
      </HeatmapSlot>

      {/* Camera Rig */}
      <CameraRig focus={focus} enabled={true} onExit={() => setFocus('overview')} />

      {/* Contact Shadows under desk */}
      <ContactShadows position={[0, -0.01, 0]} opacity={0.6} scale={12} blur={2.5} far={4} />

      {/* Post Processing */}
      <EffectComposer multisampling={0} disableNormalPass>
        <Bloom luminanceThreshold={0.85} luminanceSmoothing={0.2} intensity={0.9} mipmapBlur />
        {!degraded && (
          <ChromaticAberration
            offset={[0.0006, 0.0008]}
            radialModulation
            modulationOffset={0.3}
            blendFunction={BlendFunction.NORMAL}
          />
        )}
        <Vignette eskil={false} offset={0.2} darkness={0.85} />
        {!degraded && <Noise opacity={0.03} />}
      </EffectComposer>
    </>
  );
}

export default function Workstation3D() {
  const { isMobile } = useIsMobile();
  const [tab, setTab] = useState('REVIEW');
  const [focus, setFocus] = useState('overview');
  const [degraded, setDegraded] = useState(false);
  const [dpr, setDpr] = useState(1.5);

  if (isMobile) {
    return (
      <section className="relative w-full h-[80vh] min-h-[520px] bg-[#05070B] flex items-center justify-center overflow-hidden">
        <img
          src="/images/workstation-fallback.jpg"
          alt="Workstation Fallback"
          loading="lazy"
          decoding="async"
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
        <Canvas
          shadows
          dpr={dpr}
          gl={{
            antialias: false,
            powerPreference: 'high-performance',
            toneMapping: ACESFilmicToneMapping,
            toneMappingExposure: 1.1,
          }}
          camera={{ position: [0, 1.9, 6.2], fov: 40 }}
          onPointerMissed={() => setFocus('overview')}
        >
          <PerformanceMonitor
            onDecline={() => {
              setDegraded(true);
              setDpr(1);
            }}
            onIncline={() => {
              setDegraded(false);
              setDpr(1.5);
            }}
          >
            <AdaptiveDpr pixelated />
            <Suspense fallback={<Loader />}>
              <WorkstationScene
                tab={tab}
                setTab={setTab}
                focus={focus}
                setFocus={setFocus}
                degraded={degraded}
              />
            </Suspense>
          </PerformanceMonitor>
        </Canvas>
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
            { id: 'main', label: 'MAIN VIEW' },
            { id: 'briefcam', label: 'BRIEFCAM' },
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
