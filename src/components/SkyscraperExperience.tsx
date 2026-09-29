'use client'

import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, OrbitControls, PerspectiveCamera, Preload, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { Suspense } from 'react'
import Tower from '@/components/tower/Tower'
import SiteEnvironment from '@/components/tower/SiteEnvironment'

function SceneLighting() {
  return (
    <>
      <hemisphereLight args={['#91afd1', '#170f0c', 1.25]} />
      <ambientLight intensity={0.28} />
      <directionalLight
        castShadow
        position={[20, 52, 24]}
        intensity={2.2}
        color="#d8e5ff"
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={120}
        shadow-camera-left={-35}
        shadow-camera-right={35}
        shadow-camera-top={70}
        shadow-camera-bottom={-10}
      />
      <directionalLight position={[-24, 24, -20]} intensity={0.65} color="#5579a8" />
      <spotLight position={[0, 8, 18]} angle={0.5} penumbra={0.9} intensity={85} distance={28} color="#ffc98d" />
    </>
  )
}

export default function SkyscraperExperience() {
  return (
    <main className="scene-shell">
      <div className="hud">
        <p className="eyebrow">Procedural landmark study</p>
        <h1>Aurelia Tower</h1>
        <p>106 occupied levels · mixed-use hotel, residences and financial offices · dusk architectural presentation</p>
      </div>

      <Canvas
        className="scene-canvas"
        shadows
        dpr={[1, 1.8]}
        gl={{ antialias: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping }}
        onCreated={({ gl }) => {
          gl.toneMappingExposure = 1.05
          gl.outputColorSpace = THREE.SRGBColorSpace
        }}
      >
        <color attach="background" args={['#07111d']} />
        <fog attach="fog" args={['#07111d', 62, 130]} />
        <PerspectiveCamera makeDefault fov={37} near={0.1} far={220} position={[34, 12, 42]} />
        <SceneLighting />
        <Stars radius={110} depth={45} count={1000} factor={2.4} saturation={0.15} fade speed={0.2} />

        <Suspense fallback={null}>
          <Tower />
          <SiteEnvironment />
        </Suspense>

        <OrbitControls
          target={[0, 29, 0]}
          enablePan={false}
          minDistance={24}
          maxDistance={82}
          minPolarAngle={Math.PI * 0.23}
          maxPolarAngle={Math.PI * 0.51}
          autoRotate
          autoRotateSpeed={0.22}
          dampingFactor={0.05}
          enableDamping
        />
        <AdaptiveDpr pixelated />
        <Preload all />
      </Canvas>

      <div className="hint">Drag to orbit · scroll to zoom</div>
    </main>
  )
}
