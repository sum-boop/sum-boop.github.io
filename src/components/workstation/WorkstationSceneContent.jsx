import React, { useState } from 'react';
import { Environment, ContactShadows, Sparkles, PerformanceMonitor } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

import WorkstationConsole from './WorkstationConsole';
import HolographicScreens, { HeatmapSlot, ResetViewButton3D } from './HolographicScreens';
import { BriefCamEngine, HeatmapFloorPlan } from './BriefCamEngine';
import CameraRig from './CameraRig';

export default function WorkstationSceneContent({ tab, setTab, focus, setFocus }) {
  const [degraded, setDegraded] = useState(false);

  return (
    <>
      <color attach="background" args={['#05070B']} />
      <fog attach="fog" args={['#05070B', 9, 22]} />

      <Environment preset="night" environmentIntensity={0.6} />

      <directionalLight
        position={[-4.5, 6.5, 3.5]}
        intensity={2.8}
        color="#dbeafe"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      />

      <spotLight
        position={[0, 6, 3]}
        angle={0.5}
        penumbra={1}
        intensity={120}
        color="#9fe8ff"
        castShadow
        shadow-mapSize={2048}
      />

      <pointLight position={[0, 2.2, -1.5]} color="#22D3EE" intensity={35} distance={8} />
      <pointLight position={[-1.2, 1.2, 0.5]} color="#FBBF24" intensity={8} distance={3} />

      <Sparkles count={120} scale={[12, 5, 8]} size={2} speed={0.25} opacity={0.5} color="#22D3EE" />

      <PerformanceMonitor
        onDecline={() => setDegraded(true)}
        onIncline={() => setDegraded(false)}
      />

      <WorkstationConsole />

      <HolographicScreens
        activeTab={tab}
        setActiveTab={(newTab) => {
          setTab(newTab);
          setFocus('briefcam-focus');
        }}
        onFocus={setFocus}
      >
        <BriefCamEngine activeTab={tab} />
      </HolographicScreens>

      <HeatmapSlot>
        <HeatmapFloorPlan />
      </HeatmapSlot>

      <ResetViewButton3D focus={focus} onReset={() => setFocus('overview')} />

      <CameraRig focus={focus} enabled={true} onExit={() => setFocus('overview')} />

      <ContactShadows position={[0, -0.01, 0]} opacity={0.6} scale={12} blur={2.5} far={4} />

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
