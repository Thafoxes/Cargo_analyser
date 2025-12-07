"use client";

import { useRef } from "react";
import * as THREE from "three";
import { Text, Line } from "@react-three/drei";
import { AIRCRAFT_3D_MODELS, SCALE_FACTOR } from "@/lib/aircraft-models";

interface AircraftWireframeProps {
  aircraftType: string;
}

// Custom wireframe box component
function WireframeBox({ 
  position, 
  size, 
  color = "#00fff5",
  opacity = 0.1,
  lineWidth = 1
}: { 
  position: [number, number, number]; 
  size: [number, number, number]; 
  color?: string;
  opacity?: number;
  lineWidth?: number;
}) {
  const [w, h, d] = size;
  const hw = w / 2, hh = h / 2, hd = d / 2;
  
  // Define the 12 edges of a box
  const edges = [
    // Bottom face
    [[-hw, -hh, -hd], [hw, -hh, -hd]],
    [[hw, -hh, -hd], [hw, -hh, hd]],
    [[hw, -hh, hd], [-hw, -hh, hd]],
    [[-hw, -hh, hd], [-hw, -hh, -hd]],
    // Top face
    [[-hw, hh, -hd], [hw, hh, -hd]],
    [[hw, hh, -hd], [hw, hh, hd]],
    [[hw, hh, hd], [-hw, hh, hd]],
    [[-hw, hh, hd], [-hw, hh, -hd]],
    // Vertical edges
    [[-hw, -hh, -hd], [-hw, hh, -hd]],
    [[hw, -hh, -hd], [hw, hh, -hd]],
    [[hw, -hh, hd], [hw, hh, hd]],
    [[-hw, -hh, hd], [-hw, hh, hd]],
  ];

  return (
    <group position={position}>
      {/* Transparent fill */}
      <mesh>
        <boxGeometry args={size} />
        <meshBasicMaterial 
          transparent 
          opacity={opacity} 
          color={color} 
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* Wireframe edges */}
      {edges.map((edge, i) => (
        <Line
          key={i}
          points={edge as [number, number, number][]}
          color={color}
          lineWidth={lineWidth}
        />
      ))}
    </group>
  );
}

export default function AircraftWireframe({ aircraftType }: AircraftWireframeProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  const model = AIRCRAFT_3D_MODELS[aircraftType] || AIRCRAFT_3D_MODELS["Boeing 737-800"];
  const scale = SCALE_FACTOR;
  
  const fLength = model.fuselageLength * scale;
  const fWidth = model.fuselageWidth * scale;
  const fHeight = model.fuselageHeight * scale;

  return (
    <group ref={groupRef}>
      {/* Main Fuselage Body */}
      <WireframeBox
        position={[0, 0, 0]}
        size={[fWidth, fHeight, fLength]}
        color="#00fff5"
        opacity={0.05}
        lineWidth={1.5}
      />

      {/* Nose Cone */}
      <group position={[0, 0, -fLength / 2 - 0.3]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[fWidth / 2, 0.8, 8]} />
          <meshBasicMaterial transparent opacity={0.05} color="#00fff5" side={THREE.DoubleSide} />
        </mesh>
        {/* Nose wireframe lines */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const x = Math.cos(rad) * fWidth / 2;
          const y = Math.sin(rad) * fWidth / 2;
          return (
            <Line
              key={angle}
              points={[[x, y, 0], [0, 0, -0.8]]}
              color="#00fff5"
              lineWidth={1}
            />
          );
        })}
      </group>

      {/* Tail Cone */}
      <group position={[0, 0, fLength / 2 + 0.4]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[fWidth / 2, 1, 8]} />
          <meshBasicMaterial transparent opacity={0.05} color="#00fff5" side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Vertical Stabilizer (Tail Fin) */}
      <WireframeBox
        position={[0, fHeight / 2 + 0.4, fLength / 2 - 0.3]}
        size={[0.05, 0.8, 0.6]}
        color="#00fff5"
        opacity={0.1}
        lineWidth={1}
      />

      {/* Wings */}
      <WireframeBox
        position={[0, -0.1, 0]}
        size={[fWidth * 2.5, 0.08, 0.8]}
        color="#00fff5"
        opacity={0.1}
        lineWidth={1}
      />

      {/* Horizontal Stabilizers */}
      <WireframeBox
        position={[0, fHeight / 2 + 0.2, fLength / 2]}
        size={[fWidth * 0.8, 0.04, 0.3]}
        color="#00fff5"
        opacity={0.1}
        lineWidth={1}
      />

      {/* Cargo Hold Sections */}
      {model.sections.map((section, index) => {
        const sectionColors = ["#00fff5", "#39ff14", "#ff00ff"];
        const color = sectionColors[index % sectionColors.length];
        
        return (
          <group key={section.id}>
            {/* Section Box */}
            <WireframeBox
              position={[
                section.position.x * scale,
                section.position.y * scale,
                section.position.z * scale
              ]}
              size={[
                section.dimensions.width * scale,
                section.dimensions.height * scale,
                section.dimensions.depth * scale
              ]}
              color={color}
              opacity={0.15}
              lineWidth={2}
            />

            {/* Section Label */}
            <Text
              position={[
                section.position.x * scale,
                (section.position.y + section.dimensions.height / 2 + 0.15) * scale,
                section.position.z * scale
              ]}
              fontSize={0.12}
              color={color}
              anchorX="center"
              anchorY="middle"
            >
              {section.name.toUpperCase()}
            </Text>

            {/* Max Weight Label */}
            <Text
              position={[
                section.position.x * scale,
                (section.position.y - section.dimensions.height / 2 - 0.08) * scale,
                section.position.z * scale
              ]}
              fontSize={0.06}
              color="#8892b0"
              anchorX="center"
              anchorY="middle"
            >
              {`Max: ${section.maxWeight}kg`}
            </Text>
          </group>
        );
      })}

      {/* Direction Labels */}
      <Text
        position={[0, 0, -fLength / 2 - 1.2]}
        fontSize={0.15}
        color="#00fff5"
        anchorX="center"
        anchorY="middle"
      >
        ◄ NOSE (FWD)
      </Text>
      <Text
        position={[0, 0, fLength / 2 + 1.5]}
        fontSize={0.15}
        color="#ff00ff"
        anchorX="center"
        anchorY="middle"
      >
        TAIL (AFT) ►
      </Text>

      {/* Aircraft Type Label */}
      <Text
        position={[0, fHeight / 2 + 1, 0]}
        fontSize={0.18}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {aircraftType}
      </Text>

      {/* Center of Gravity Line */}
      <Line
        points={[[0, -fHeight, 0], [0, fHeight, 0]]}
        color="#ffd700"
        lineWidth={1}
        dashed
        dashSize={0.05}
        gapSize={0.05}
      />
      <Text
        position={[0.3, fHeight / 2 + 0.5, 0]}
        fontSize={0.06}
        color="#ffd700"
        anchorX="left"
        anchorY="middle"
      >
        CG LINE
      </Text>
    </group>
  );
}
