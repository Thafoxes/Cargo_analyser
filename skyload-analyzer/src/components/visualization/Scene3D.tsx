"use client";

import { Suspense, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Grid, Stars, PerspectiveCamera } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import AircraftWireframe from "./AircraftWireframe";
import CargoContainer3D, { Container3DData } from "./CargoContainer3D";

interface Scene3DProps {
  aircraftType: string;
  containers: Container3DData[];
  onContainerSelect: (container: Container3DData | null) => void;
  selectedContainerId: string | null;
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshBasicMaterial color="#00fff5" wireframe />
    </mesh>
  );
}

// Camera controller component
function CameraController() {
  const { camera } = useThree();
  return null;
}

export default function Scene3D({
  aircraftType,
  containers,
  onContainerSelect,
  selectedContainerId,
}: Scene3DProps) {
  const placedContainers = containers.filter((c) => c.placed !== false);

  // Calculate camera position based on aircraft type
  const isWidebody = aircraftType.includes("A330");
  const cameraDistance = isWidebody ? 6 : 4;

  return (
    <div className="w-full h-full bg-cyber-bg rounded-lg overflow-hidden border border-cyber-cyan/30 relative">
      <Canvas
        camera={{ position: [cameraDistance, cameraDistance * 0.7, cameraDistance], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        onPointerMissed={() => onContainerSelect(null)}
      >
        {/* Background */}
        <color attach="background" args={["#0a0a0f"]} />
        <fog attach="fog" args={["#0a0a0f", 15, 40]} />

        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.6} color="#00fff5" />
        <pointLight position={[-10, 10, -10]} intensity={0.4} color="#ff00ff" />
        <pointLight position={[0, -5, 0]} intensity={0.2} color="#39ff14" />

        {/* Stars Background */}
        <Stars 
          radius={80} 
          depth={50} 
          count={1500} 
          factor={3} 
          saturation={0} 
          fade 
          speed={0.5} 
        />

        <Suspense fallback={<LoadingFallback />}>
          {/* Aircraft Wireframe */}
          <AircraftWireframe aircraftType={aircraftType} />

          {/* Cargo Containers */}
          {placedContainers.map((container, index) => (
            <CargoContainer3D
              key={container.id}
              container={container}
              isSelected={selectedContainerId === container.id}
              onSelect={(c) => onContainerSelect(c)}
              index={index}
            />
          ))}

          {/* Cyber Grid Floor */}
          <Grid
            position={[0, -1.2, 0]}
            args={[20, 20]}
            cellSize={0.3}
            cellThickness={0.3}
            cellColor="#00fff5"
            sectionSize={1.5}
            sectionThickness={0.8}
            sectionColor="#00fff5"
            fadeDistance={20}
            fadeStrength={1}
            infiniteGrid
          />
        </Suspense>

        {/* Post Processing Effects */}
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.3}
            luminanceSmoothing={0.9}
            intensity={0.4}
          />
        </EffectComposer>

        {/* Camera Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={15}
          autoRotate={false}
          target={[0, 0, 0]}
          maxPolarAngle={Math.PI * 0.85}
        />
      </Canvas>

      {/* Container Count Overlay */}
      <div className="absolute bottom-4 left-4 bg-cyber-bg/80 border border-cyber-cyan/30 rounded px-3 py-2">
        <p className="text-xs font-mono text-gray-400">
          Containers: <span className="text-cyber-cyan">{placedContainers.length}</span>
          {containers.length > placedContainers.length && (
            <span className="text-cyber-red ml-2">
              (+{containers.length - placedContainers.length} overflow)
            </span>
          )}
        </p>
      </div>

      {/* Instructions */}
      <div className="absolute top-4 right-4 text-xs text-gray-500 font-mono text-right">
        <p>🖱️ Drag to rotate</p>
        <p>⚲ Scroll to zoom</p>
        <p>👆 Click container for details</p>
      </div>

      {/* Selected Container Info */}
      {selectedContainerId && (
        <div className="absolute bottom-4 right-4 bg-cyber-bg/90 border border-cyber-cyan/50 rounded p-3 max-w-xs">
          {(() => {
            const container = containers.find(c => c.id === selectedContainerId);
            if (!container) return null;
            return (
              <div className="text-xs font-mono">
                <p className="text-cyber-cyan font-bold mb-1">{container.name}</p>
                <p className="text-gray-400">Weight: {container.weight}kg</p>
                <p className="text-gray-400">Volume: {container.volume}m³</p>
                <p className="text-gray-400">Section: {container.section.toUpperCase()}</p>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
