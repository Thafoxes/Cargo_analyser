"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CARGO_HOLD_SPECS } from "@/lib/cargo-types";

// Container type that works with both old and new data formats
interface ContainerWithPosition {
  id: string;
  name: string;
  weight: number;
  volume: number;
  width: number;
  height: number;
  depth: number;
  color?: string;
  priority?: "high" | "medium" | "low";
  position?: { x: number; y: number; z: number };
  placed?: boolean;
  section?: string;
}

interface CargoVisualizationProps {
  aircraftType: string;
  containers: ContainerWithPosition[];
  balanceScore: number;
}

export default function CargoVisualization({
  aircraftType,
  containers,
  balanceScore,
}: CargoVisualizationProps) {
  const [hoveredContainer, setHoveredContainer] = useState<string | null>(null);
  const [viewAngle, setViewAngle] = useState<"top" | "side" | "3d">("top");
  
  const cargoHold = CARGO_HOLD_SPECS[aircraftType] || CARGO_HOLD_SPECS["Boeing 737-800"];
  
  // Scale factor for visualization (pixels per meter)
  const scale = 40;
  const holdWidth = cargoHold.width * scale;
  const holdDepth = cargoHold.depth * scale;
  const holdHeight = cargoHold.height * scale;

  // Filter only placed containers
  const placedContainers = containers.filter((c) => c.placed !== false);

  // Get container by ID
  const getContainer = (containerId: string) => {
    return containers.find((c) => c.id === containerId);
  };

  // Calculate weight distribution
  const calculateWeightDistribution = () => {
    let forwardWeight = 0;
    let aftWeight = 0;
    const midPoint = cargoHold.depth / 2;

    placedContainers.forEach((container) => {
      if (container.position) {
        // Convert z position to positive range for comparison
        const zPos = container.position.z + midPoint;
        if (zPos < midPoint) {
          forwardWeight += container.weight;
        } else {
          aftWeight += container.weight;
        }
      } else if (container.section) {
        // Fallback to section-based distribution
        if (container.section === "fwd") {
          forwardWeight += container.weight;
        } else {
          aftWeight += container.weight;
        }
      }
    });

    const total = forwardWeight + aftWeight;
    return {
      forward: total > 0 ? (forwardWeight / total) * 100 : 50,
      aft: total > 0 ? (aftWeight / total) * 100 : 50,
    };
  };

  const weightDist = calculateWeightDistribution();

  // Get color based on weight
  const getWeightColor = (weight: number) => {
    if (weight < 500) return "#39ff14"; // Green - Light
    if (weight < 1500) return "#ffd700"; // Yellow - Medium
    return "#ff073a"; // Red - Heavy
  };

  return (
    <div className="space-y-4">
      {/* View Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(["top", "side"] as const).map((view) => (
            <button
              key={view}
              onClick={() => setViewAngle(view)}
              className={cn(
                "px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all",
                viewAngle === view
                  ? "bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan shadow-neon-cyan-sm"
                  : "bg-cyber-card border-cyber-cyan/30 text-gray-400 hover:border-cyber-cyan/50"
              )}
              style={{ border: "1px solid" }}
            >
              {view} view
            </button>
          ))}
        </div>

        {/* Balance Indicator */}
        <div className="flex items-center gap-4">
          <div className="text-xs font-mono text-gray-400">
            BALANCE SCORE
          </div>
          <div className={cn(
            "px-3 py-1 rounded font-display text-lg",
            balanceScore >= 80 ? "text-cyber-green bg-cyber-green/10" :
            balanceScore >= 60 ? "text-cyber-yellow bg-cyber-yellow/10" :
            "text-cyber-red bg-cyber-red/10"
          )}>
            {balanceScore}%
          </div>
        </div>
      </div>

      {/* Visualization Area */}
      <div className="cyber-card p-6 overflow-hidden relative">
        <div className="relative flex justify-center">
          {/* Aircraft Outline */}
          <svg
            width={holdDepth + 100}
            height={viewAngle === "side" ? holdHeight + 100 : holdWidth + 100}
            className="overflow-visible"
          >
            {/* Grid Background */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke="rgba(0, 255, 245, 0.1)"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            
            {/* Cargo Hold Outline */}
            <g transform="translate(50, 50)">
              {/* Background */}
              <rect
                x="0"
                y="0"
                width={holdDepth}
                height={viewAngle === "side" ? holdHeight : holdWidth}
                fill="url(#grid)"
                stroke="#00fff5"
                strokeWidth="2"
                opacity="0.3"
              />

              {/* Sections */}
              {cargoHold.sections.map((section) => (
                <g key={section.id}>
                  <rect
                    x={section.z * scale}
                    y={0}
                    width={section.depth * scale}
                    height={viewAngle === "side" ? holdHeight : holdWidth}
                    fill="rgba(0, 255, 245, 0.05)"
                    stroke="rgba(0, 255, 245, 0.3)"
                    strokeWidth="1"
                    strokeDasharray="4 2"
                  />
                  <text
                    x={section.z * scale + (section.depth * scale) / 2}
                    y={viewAngle === "side" ? holdHeight + 20 : holdWidth + 20}
                    fill="#00fff5"
                    fontSize="10"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {section.name.toUpperCase()}
                  </text>
                </g>
              ))}

              {/* Containers */}
              {placedContainers.map((container, index) => {
                // Calculate position - handle both embedded and separate positions
                let posX = 0;
                let posZ = holdDepth / 2; // Default to center
                let posY = 0;

                if (container.position) {
                  // Convert 3D position to 2D visualization
                  posX = (container.position.x + cargoHold.width / 2) * scale;
                  posZ = (container.position.z + cargoHold.depth / 2) * scale;
                  posY = container.position.y * scale;
                } else if (container.section) {
                  // Use section-based positioning
                  const sectionData = cargoHold.sections.find(s => s.id === container.section);
                  if (sectionData) {
                    posZ = (sectionData.z + sectionData.depth / 2) * scale;
                    posX = holdWidth / 2;
                  }
                }

                const containerWidth = container.depth * scale;
                const containerHeight = viewAngle === "side" 
                  ? container.height * scale 
                  : container.width * scale;

                const color = container.color || getWeightColor(container.weight);

                return (
                  <motion.g
                    key={container.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    onMouseEnter={() => setHoveredContainer(container.id)}
                    onMouseLeave={() => setHoveredContainer(null)}
                    style={{ cursor: "pointer" }}
                  >
                    <rect
                      x={posZ - containerWidth / 2}
                      y={viewAngle === "side" 
                        ? (holdHeight - containerHeight) / 2 + posY
                        : posX - containerHeight / 2}
                      width={containerWidth}
                      height={containerHeight}
                      fill={color}
                      fillOpacity={hoveredContainer === container.id ? 0.8 : 0.4}
                      stroke={color}
                      strokeWidth={hoveredContainer === container.id ? 3 : 2}
                      rx="2"
                    />
                    {/* Container Label */}
                    <text
                      x={posZ}
                      y={viewAngle === "side" 
                        ? (holdHeight) / 2 + posY
                        : posX}
                      fill="white"
                      fontSize="9"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {container.weight}kg
                    </text>
                  </motion.g>
                );
              })}

              {/* Aircraft Nose Indicator */}
              <polygon
                points={`-20,${(viewAngle === "side" ? holdHeight : holdWidth) / 2} -40,${(viewAngle === "side" ? holdHeight : holdWidth) / 2 - 15} -40,${(viewAngle === "side" ? holdHeight : holdWidth) / 2 + 15}`}
                fill="none"
                stroke="#00fff5"
                strokeWidth="2"
              />
              <text
                x="-50"
                y={(viewAngle === "side" ? holdHeight : holdWidth) / 2}
                fill="#00fff5"
                fontSize="10"
                textAnchor="end"
                dominantBaseline="middle"
                fontFamily="monospace"
              >
                FWD
              </text>

              {/* Aircraft Tail Indicator */}
              <text
                x={holdDepth + 10}
                y={(viewAngle === "side" ? holdHeight : holdWidth) / 2}
                fill="#00fff5"
                fontSize="10"
                textAnchor="start"
                dominantBaseline="middle"
                fontFamily="monospace"
              >
                AFT
              </text>
            </g>
          </svg>
        </div>

        {/* Hovered Container Info */}
        {hoveredContainer && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 right-4 bg-cyber-bg/90 border border-cyber-cyan/50 p-4 rounded"
          >
            {(() => {
              const container = getContainer(hoveredContainer);
              if (!container) return null;
              return (
                <>
                  <h4 className="font-display text-cyber-cyan text-sm mb-2">
                    {container.name}
                  </h4>
                  <div className="space-y-1 text-xs font-mono">
                    <p>Weight: <span className="text-white">{container.weight} kg</span></p>
                    <p>Volume: <span className="text-white">{container.volume} m³</span></p>
                    {container.section && (
                      <p>Section: <span className="text-cyber-cyan">{container.section.toUpperCase()}</span></p>
                    )}
                  </div>
                </>
              );
            })()}
          </motion.div>
        )}
      </div>

      {/* Weight Distribution Bar */}
      <div className="cyber-card p-4">
        <h4 className="font-display text-sm text-gray-400 mb-3 tracking-wider">
          WEIGHT DISTRIBUTION
        </h4>
        <div className="relative h-8 bg-cyber-bg rounded overflow-hidden border border-cyber-cyan/20">
          {/* Center Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/50 z-10" />
          
          {/* Forward Weight */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${weightDist.forward}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-cyber-cyan/60 to-cyber-cyan/30"
          />
          
          {/* Aft Weight */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${weightDist.aft}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-cyber-magenta/60 to-cyber-magenta/30"
          />

          {/* Labels */}
          <div className="absolute inset-0 flex items-center justify-between px-4 text-xs font-mono">
            <span className="text-cyber-cyan">FWD: {weightDist.forward.toFixed(1)}%</span>
            <span className="text-cyber-magenta">AFT: {weightDist.aft.toFixed(1)}%</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2 font-mono">
          Optimal balance: 45-55% forward / 45-55% aft
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs font-mono">
        {placedContainers.map((container) => (
          <div key={container.id} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ 
                backgroundColor: container.color || getWeightColor(container.weight), 
                opacity: 0.6 
              }}
            />
            <span className="text-gray-400">{container.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
