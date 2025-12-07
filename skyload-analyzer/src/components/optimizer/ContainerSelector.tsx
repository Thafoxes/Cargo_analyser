"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Package, Trash2, Box } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

// Container type definitions
export interface ContainerType {
  id: string;
  name: string;
  maxWeight: number;
  volume: number;
  width: number;
  height: number;
  depth: number;
  color: string;
  icon: string;
}

export interface SelectedContainer {
  id: string;
  typeId: string;
  name: string;
  weight: number;
  volume: number;
  width: number;
  height: number;
  depth: number;
  color: string;
}

// Available container types
export const CONTAINER_TYPES: ContainerType[] = [
  {
    id: "LD3",
    name: "LD3 Container",
    maxWeight: 1588,
    volume: 4.5,
    width: 1.56,
    height: 1.14,
    depth: 1.53,
    color: "#00fff5",
    icon: "📦",
  },
  {
    id: "LD6",
    name: "LD6 Container",
    maxWeight: 3175,
    volume: 8.9,
    width: 3.18,
    height: 1.14,
    depth: 1.53,
    color: "#ff00ff",
    icon: "📦",
  },
  {
    id: "LD11",
    name: "LD11 Container",
    maxWeight: 3176,
    volume: 7.0,
    width: 3.18,
    height: 1.14,
    depth: 1.53,
    color: "#39ff14",
    icon: "📦",
  },
  {
    id: "PALLET",
    name: "Standard Pallet",
    maxWeight: 4626,
    volume: 10.0,
    width: 3.18,
    height: 1.5,
    depth: 2.44,
    color: "#ffd700",
    icon: "📋",
  },
  {
    id: "BULK",
    name: "Bulk Cargo",
    maxWeight: 1000,
    volume: 3.0,
    width: 1.2,
    height: 0.8,
    depth: 1.2,
    color: "#ff8c00",
    icon: "📤",
  },
];

interface ContainerSelectorProps {
  selectedContainers: SelectedContainer[];
  onContainersChange: (containers: SelectedContainer[]) => void;
  maxWeight: number;
  maxVolume: number;
  flightCargoWeight?: number; // From CSV
  flightCargoVolume?: number; // From CSV
}

export default function ContainerSelector({
  selectedContainers,
  onContainersChange,
  maxWeight,
  maxVolume,
  flightCargoWeight,
  flightCargoVolume,
}: ContainerSelectorProps) {
  const [expandedType, setExpandedType] = useState<string | null>(null);
  const [customWeights, setCustomWeights] = useState<Record<string, number>>({});

  // Calculate totals
  const totalWeight = selectedContainers.reduce((sum, c) => sum + c.weight, 0);
  const totalVolume = selectedContainers.reduce((sum, c) => sum + c.volume, 0);
  const isOverweight = totalWeight > maxWeight;
  const isOverVolume = totalVolume > maxVolume;

  // Add a container
  const addContainer = (type: ContainerType) => {
    const weight = customWeights[type.id] || Math.floor(type.maxWeight * 0.6);
    const newContainer: SelectedContainer = {
      id: `${type.id}-${Date.now()}`,
      typeId: type.id,
      name: `${type.name} #${selectedContainers.filter(c => c.typeId === type.id).length + 1}`,
      weight: weight,
      volume: type.volume,
      width: type.width,
      height: type.height,
      depth: type.depth,
      color: type.color,
    };
    onContainersChange([...selectedContainers, newContainer]);
  };

  // Remove a container
  const removeContainer = (containerId: string) => {
    onContainersChange(selectedContainers.filter(c => c.id !== containerId));
  };

  // Update container weight
  const updateContainerWeight = (containerId: string, weight: number) => {
    onContainersChange(
      selectedContainers.map(c =>
        c.id === containerId ? { ...c, weight: Math.max(0, weight) } : c
      )
    );
  };

  // Clear all containers
  const clearAll = () => {
    onContainersChange([]);
  };

  // Auto-generate containers from CSV flight data
  const autoLoadFromCSV = () => {
    if (!flightCargoWeight || flightCargoWeight <= 0) return;
    
    const containers: SelectedContainer[] = [];
    let remainingWeight = flightCargoWeight;
    let remainingVolume = flightCargoVolume || flightCargoWeight / 300; // Estimate volume
    let containerIndex = 0;
    
    // Strategy: Fill with appropriate container types based on cargo amount
    // Use mix of container types for visual variety
    const containerMix = [
      { type: CONTAINER_TYPES[0], priority: 1 }, // LD3 - smallest
      { type: CONTAINER_TYPES[1], priority: 2 }, // LD6
      { type: CONTAINER_TYPES[3], priority: 3 }, // Pallet
      { type: CONTAINER_TYPES[4], priority: 1 }, // Bulk
    ];
    
    while (remainingWeight > 100 && containers.length < 12) {
      // Pick container type based on remaining cargo
      let selectedType = containerMix[0].type;
      
      if (remainingWeight > 3000) {
        selectedType = CONTAINER_TYPES[3]; // Pallet for heavy cargo
      } else if (remainingWeight > 1500) {
        selectedType = CONTAINER_TYPES[1]; // LD6
      } else if (remainingWeight > 800) {
        selectedType = CONTAINER_TYPES[0]; // LD3
      } else {
        selectedType = CONTAINER_TYPES[4]; // Bulk for small amounts
      }
      
      // Calculate weight for this container (fill to ~70-90%)
      const fillRatio = 0.7 + Math.random() * 0.2;
      const containerWeight = Math.min(
        remainingWeight,
        Math.floor(selectedType.maxWeight * fillRatio)
      );
      
      if (containerWeight < 50) break;
      
      containers.push({
        id: `csv-${selectedType.id}-${containerIndex}`,
        typeId: selectedType.id,
        name: `${selectedType.name} #${containerIndex + 1}`,
        weight: containerWeight,
        volume: selectedType.volume,
        width: selectedType.width,
        height: selectedType.height,
        depth: selectedType.depth,
        color: selectedType.color,
      });
      
      remainingWeight -= containerWeight;
      remainingVolume -= selectedType.volume;
      containerIndex++;
    }
    
    onContainersChange(containers);
  };

  return (
    <div className="space-y-4">
      {/* Container Types */}
      <div className="cyber-card p-4">
        <h3 className="font-display text-cyber-cyan text-sm tracking-wider mb-3 flex items-center gap-2">
          <Box size={16} />
          CONTAINER TYPES
        </h3>

        <div className="space-y-2">
          {CONTAINER_TYPES.map((type) => (
            <div key={type.id}>
              <div
                className={cn(
                  "bg-cyber-bg/50 border rounded p-3 cursor-pointer transition-all",
                  expandedType === type.id
                    ? "border-opacity-100"
                    : "border-opacity-30 hover:border-opacity-50"
                )}
                style={{ borderColor: type.color }}
                onClick={() => setExpandedType(expandedType === type.id ? null : type.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: type.color, opacity: 0.7 }}
                    />
                    <span className="font-body text-white text-sm">{type.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-mono">
                      Max: {type.maxWeight}kg
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addContainer(type);
                      }}
                      className="p-1 bg-cyber-card border border-cyber-cyan/30 rounded hover:border-cyber-cyan hover:bg-cyber-cyan/10 transition-all"
                    >
                      <Plus size={14} className="text-cyber-cyan" />
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                <AnimatePresence>
                  {expandedType === type.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-3 pt-3 border-t border-gray-700"
                    >
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono text-gray-400 mb-3">
                        <p>Volume: {type.volume} m³</p>
                        <p>Max Weight: {type.maxWeight} kg</p>
                        <p>Dimensions: {type.width}×{type.height}×{type.depth}m</p>
                      </div>
                      
                      {/* Custom weight input */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Weight:</span>
                        <input
                          type="number"
                          value={customWeights[type.id] || Math.floor(type.maxWeight * 0.6)}
                          onChange={(e) => setCustomWeights({
                            ...customWeights,
                            [type.id]: parseInt(e.target.value) || 0
                          })}
                          onClick={(e) => e.stopPropagation()}
                          className="cyber-input w-24 py-1 px-2 text-xs"
                          min={0}
                          max={type.maxWeight}
                        />
                        <span className="text-xs text-gray-500">kg</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Auto-load from CSV */}
      {flightCargoWeight && flightCargoWeight > 0 && selectedContainers.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="cyber-card p-4 border-cyber-green/30"
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs text-gray-400">Flight Cargo from CSV:</p>
              <p className="font-mono text-cyber-green text-lg">
                {formatNumber(flightCargoWeight)} kg
              </p>
            </div>
            <button
              onClick={autoLoadFromCSV}
              className="cyber-button text-sm py-2 px-4 bg-cyber-green/20 border-cyber-green hover:bg-cyber-green/30"
            >
              🚀 AUTO-LOAD
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Automatically generate containers based on CSV cargo data
          </p>
        </motion.div>
      )}

      {/* Selected Containers */}
      <div className="cyber-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-cyber-magenta text-sm tracking-wider flex items-center gap-2">
            <Package size={16} />
            CARGO TO LOAD ({selectedContainers.length})
          </h3>
          <div className="flex items-center gap-2">
            {flightCargoWeight && flightCargoWeight > 0 && selectedContainers.length > 0 && (
              <button
                onClick={autoLoadFromCSV}
                className="text-xs text-cyber-green hover:text-white transition-colors"
                title="Reload from CSV"
              >
                ↻ CSV
              </button>
            )}
            {selectedContainers.length > 0 && (
              <button
                onClick={clearAll}
                className="text-xs text-cyber-red hover:text-white transition-colors flex items-center gap-1"
              >
                <Trash2 size={12} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className={cn(
            "bg-cyber-bg/50 rounded p-2 border",
            isOverweight ? "border-cyber-red/50" : "border-cyber-cyan/20"
          )}>
            <p className="text-xs text-gray-500">Total Weight</p>
            <p className={cn(
              "font-mono font-bold",
              isOverweight ? "text-cyber-red" : "text-cyber-cyan"
            )}>
              {formatNumber(totalWeight)} / {formatNumber(maxWeight)} kg
            </p>
          </div>
          <div className={cn(
            "bg-cyber-bg/50 rounded p-2 border",
            isOverVolume ? "border-cyber-red/50" : "border-cyber-cyan/20"
          )}>
            <p className="text-xs text-gray-500">Total Volume</p>
            <p className={cn(
              "font-mono font-bold",
              isOverVolume ? "text-cyber-red" : "text-cyber-cyan"
            )}>
              {totalVolume.toFixed(1)} / {maxVolume.toFixed(1)} m³
            </p>
          </div>
        </div>

        {/* Container List */}
        {selectedContainers.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-4">
            No containers selected. Add containers from above.
          </p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {selectedContainers.map((container, index) => (
              <motion.div
                key={container.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-cyber-bg/50 border border-gray-700 rounded p-2 flex items-center gap-2"
              >
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: container.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white truncate">{container.name}</p>
                  <p className="text-xs text-gray-500">{container.volume}m³</p>
                </div>
                
                {/* Weight controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateContainerWeight(container.id, container.weight - 100)}
                    className="p-1 text-gray-500 hover:text-cyber-cyan"
                  >
                    <Minus size={12} />
                  </button>
                  <input
                    type="number"
                    value={container.weight}
                    onChange={(e) => updateContainerWeight(container.id, parseInt(e.target.value) || 0)}
                    className="w-16 bg-cyber-card border border-gray-700 rounded px-1 py-0.5 text-xs text-center font-mono"
                  />
                  <button
                    onClick={() => updateContainerWeight(container.id, container.weight + 100)}
                    className="p-1 text-gray-500 hover:text-cyber-cyan"
                  >
                    <Plus size={12} />
                  </button>
                  <span className="text-xs text-gray-500">kg</span>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeContainer(container.id)}
                  className="p-1 text-gray-500 hover:text-cyber-red transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

