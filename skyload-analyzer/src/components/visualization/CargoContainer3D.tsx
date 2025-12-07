"use client";

import { useRef, useState } from "react";
import { Html, Line } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { getContainerColor } from "@/lib/aircraft-models";

export interface Container3DData {
  id: string;
  name: string;
  weight: number;
  volume: number;
  width: number;
  height: number;
  depth: number;
  color?: string; // Container type color
  position: { x: number; y: number; z: number };
  section: string;
  placed: boolean;
}

interface CargoContainer3DProps {
  container: Container3DData;
  isSelected: boolean;
  onSelect: (container: Container3DData) => void;
  index: number;
}

// Custom wireframe box for container
function ContainerWireframe({ 
  size, 
  color,
  isSelected,
  isHovered
}: { 
  size: [number, number, number]; 
  color: string;
  isSelected: boolean;
  isHovered: boolean;
}) {
  const [w, h, d] = size;
  const hw = w / 2, hh = h / 2, hd = d / 2;
  
  const edges = [
    [[-hw, -hh, -hd], [hw, -hh, -hd]],
    [[hw, -hh, -hd], [hw, -hh, hd]],
    [[hw, -hh, hd], [-hw, -hh, hd]],
    [[-hw, -hh, hd], [-hw, -hh, -hd]],
    [[-hw, hh, -hd], [hw, hh, -hd]],
    [[hw, hh, -hd], [hw, hh, hd]],
    [[hw, hh, hd], [-hw, hh, hd]],
    [[-hw, hh, hd], [-hw, hh, -hd]],
    [[-hw, -hh, -hd], [-hw, hh, -hd]],
    [[hw, -hh, -hd], [hw, hh, -hd]],
    [[hw, -hh, hd], [hw, hh, hd]],
    [[-hw, -hh, hd], [-hw, hh, hd]],
  ];

  const lineWidth = isSelected ? 3 : isHovered ? 2 : 1.5;
  const opacity = isSelected ? 0.6 : isHovered ? 0.5 : 0.35;

  return (
    <>
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
      {edges.map((edge, i) => (
        <Line
          key={i}
          points={edge as [number, number, number][]}
          color={isSelected ? "#ffffff" : color}
          lineWidth={lineWidth}
        />
      ))}
    </>
  );
}

export default function CargoContainer3D({ 
  container, 
  isSelected, 
  onSelect,
  index 
}: CargoContainer3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  // Use container's assigned color, fallback to weight-based color
  const color = container.color || getContainerColor(container.weight);
  
  // Display scale - make containers small enough to fit nicely in cargo hold
  // Actual containers are ~1.5-3m, but we want them to display at ~0.3-0.5 units
  const DISPLAY_SCALE = 0.18; // Smaller scale for better visibility
  
  // Pulsing animation for selected container
  useFrame((state) => {
    if (groupRef.current && isSelected) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.02 + 1;
      groupRef.current.scale.setScalar(pulse);
    } else if (groupRef.current) {
      groupRef.current.scale.setScalar(1);
    }
  });

  // Container dimensions - scaled small for display
  const containerSize: [number, number, number] = [
    container.width * DISPLAY_SCALE,
    container.height * DISPLAY_SCALE,
    container.depth * DISPLAY_SCALE
  ];

  // Position - use directly (already calculated by API)
  const containerPosition: [number, number, number] = [
    container.position.x,
    container.position.y,
    container.position.z
  ];

  return (
    <group
      ref={groupRef}
      position={containerPosition}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(container);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      <ContainerWireframe 
        size={containerSize}
        color={color}
        isSelected={isSelected}
        isHovered={hovered}
      />

      {/* Hover Tooltip */}
      {hovered && !isSelected && (
        <Html position={[0, containerSize[1] / 2 + 0.15, 0]} center>
          <div 
            className="bg-cyber-bg/95 border px-3 py-2 rounded text-xs font-mono whitespace-nowrap pointer-events-none"
            style={{ borderColor: color }}
          >
            <div className="font-bold" style={{ color }}>{container.name}</div>
            <div className="text-gray-400">{container.weight}kg | {container.volume}m³</div>
            <div className="text-gray-500">Section: {container.section.toUpperCase()}</div>
          </div>
        </Html>
      )}

      {/* Weight label on container */}
      <Html position={[0, 0, containerSize[2] / 2 + 0.02]} center>
        <div 
          className="text-xs font-mono font-bold px-1 pointer-events-none"
          style={{ 
            color: color,
            textShadow: `0 0 5px ${color}, 0 0 10px ${color}`,
            fontSize: '10px'
          }}
        >
          {container.weight}kg
        </div>
      </Html>
    </group>
  );
}
