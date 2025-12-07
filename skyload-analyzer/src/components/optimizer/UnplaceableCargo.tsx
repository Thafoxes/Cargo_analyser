"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Info, CheckCircle } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { getContainerColor } from "@/lib/aircraft-models";

interface ContainerData {
  id: string;
  name: string;
  weight: number;
  volume: number;
  placed: boolean;
  color?: string;
}

interface UnplaceableCargoProps {
  containers: ContainerData[];
}

export default function UnplaceableCargo({ containers }: UnplaceableCargoProps) {
  const placedContainers = containers.filter((c) => c.placed);
  const unplacedContainers = containers.filter((c) => !c.placed);
  const totalPlacedWeight = placedContainers.reduce((sum, c) => sum + c.weight, 0);
  const totalUnplacedWeight = unplacedContainers.reduce((sum, c) => sum + c.weight, 0);
  const totalUnplacedVolume = unplacedContainers.reduce((sum, c) => sum + c.volume, 0);

  return (
    <div className="space-y-4">
      {/* Placed Cargo Summary */}
      <div className="cyber-card p-4 border-cyber-green/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-cyber-green">
            <CheckCircle size={18} />
            <h3 className="font-display text-sm tracking-wider">PLACED</h3>
          </div>
          <span className="bg-cyber-green/20 text-cyber-green px-2 py-0.5 rounded text-xs font-mono">
            {placedContainers.length} items
          </span>
        </div>
        <p className="text-sm text-white font-mono">
          {formatNumber(totalPlacedWeight)} kg loaded
        </p>
        {placedContainers.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {placedContainers.map((c) => (
              <div
                key={c.id}
                className="w-3 h-3 rounded"
                style={{ backgroundColor: c.color || getContainerColor(c.weight) }}
                title={c.name}
              />
            ))}
          </div>
        )}
      </div>

      {/* Unplaced Cargo */}
      {unplacedContainers.length === 0 ? (
        <div className="cyber-card p-4 border-cyber-cyan/30">
          <p className="text-xs text-gray-400 text-center">
            ✓ All containers fit in the cargo hold
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="cyber-card p-4 border-cyber-red/30"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-cyber-red">
              <AlertTriangle size={18} className="animate-pulse" />
              <h3 className="font-display text-sm tracking-wider">OVERFLOW</h3>
            </div>
            <span className="bg-cyber-red/20 text-cyber-red px-2 py-0.5 rounded text-xs font-mono">
              {unplacedContainers.length} items
            </span>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-cyber-bg/50 rounded p-2 text-center">
              <p className="text-xs text-gray-500">Weight</p>
              <p className="font-mono text-cyber-red">{formatNumber(totalUnplacedWeight)} kg</p>
            </div>
            <div className="bg-cyber-bg/50 rounded p-2 text-center">
              <p className="text-xs text-gray-500">Volume</p>
              <p className="font-mono text-cyber-red">{formatNumber(totalUnplacedVolume, 1)} m³</p>
            </div>
          </div>

          {/* Container List */}
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {unplacedContainers.map((container, index) => (
              <motion.div
                key={container.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-cyber-bg/50 border border-cyber-red/20 rounded p-2 flex items-center gap-3"
              >
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: container.color || getContainerColor(container.weight), opacity: 0.8 }}
                />
                <div className="flex-1">
                  <p className="text-xs text-white font-mono">{container.name}</p>
                  <p className="text-xs text-gray-500">
                    {container.weight}kg | {container.volume}m³
                  </p>
                </div>
                <Info size={14} className="text-gray-500" />
              </motion.div>
            ))}
          </div>

          {/* Suggestion */}
          <div className="mt-3 p-2 bg-cyber-yellow/10 border border-cyber-yellow/30 rounded">
            <p className="text-xs text-cyber-yellow flex items-center gap-1">
              <Info size={12} />
              Consider redistributing to another flight
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
