"use client";

import { motion } from "framer-motion";
import { Package, Weight, Ruler, MapPin, X } from "lucide-react";
import { Container3DData } from "@/components/visualization/CargoContainer3D";
import { formatNumber } from "@/lib/utils";
import { getContainerColor } from "@/lib/aircraft-models";

interface ContainerDetailsProps {
  container: Container3DData | null;
  onClose: () => void;
}

export default function ContainerDetails({ container, onClose }: ContainerDetailsProps) {
  if (!container) return null;

  const color = getContainerColor(container.weight);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="cyber-card p-4"
      style={{ borderColor: `${color}50` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
          />
          <h3 className="font-display text-white text-sm tracking-wider">
            CONTAINER DETAILS
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Container Info */}
      <div className="space-y-3">
        {/* Name & ID */}
        <div className="bg-cyber-bg/50 rounded p-3">
          <p className="text-xs text-gray-500 mb-1">Container</p>
          <p className="font-display text-lg" style={{ color }}>
            {container.name}
          </p>
          <p className="text-xs text-gray-500 font-mono">ID: {container.id}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-cyber-bg/50 rounded p-2">
            <div className="flex items-center gap-1 mb-1">
              <Weight size={12} className="text-cyber-cyan" />
              <span className="text-xs text-gray-500">Weight</span>
            </div>
            <p className="font-mono text-white">{formatNumber(container.weight)} kg</p>
          </div>
          <div className="bg-cyber-bg/50 rounded p-2">
            <div className="flex items-center gap-1 mb-1">
              <Package size={12} className="text-cyber-magenta" />
              <span className="text-xs text-gray-500">Volume</span>
            </div>
            <p className="font-mono text-white">{formatNumber(container.volume, 1)} m³</p>
          </div>
        </div>

        {/* Dimensions */}
        <div className="bg-cyber-bg/50 rounded p-2">
          <div className="flex items-center gap-1 mb-1">
            <Ruler size={12} className="text-cyber-yellow" />
            <span className="text-xs text-gray-500">Dimensions (W×H×D)</span>
          </div>
          <p className="font-mono text-white text-sm">
            {container.width.toFixed(1)}m × {container.height.toFixed(1)}m × {container.depth.toFixed(1)}m
          </p>
        </div>

        {/* Position */}
        <div className="bg-cyber-bg/50 rounded p-2">
          <div className="flex items-center gap-1 mb-1">
            <MapPin size={12} className="text-cyber-green" />
            <span className="text-xs text-gray-500">Position</span>
          </div>
          <p className="font-mono text-white text-sm">
            Section: <span className="text-cyber-cyan">{container.section.toUpperCase()}</span>
          </p>
          <p className="font-mono text-gray-400 text-xs">
            X: {container.position.x.toFixed(2)} | Y: {container.position.y.toFixed(2)} | Z: {container.position.z.toFixed(2)}
          </p>
        </div>

        {/* Status */}
        <div className={`rounded p-2 ${container.placed ? 'bg-cyber-green/10 border border-cyber-green/30' : 'bg-cyber-red/10 border border-cyber-red/30'}`}>
          <p className={`text-xs font-mono ${container.placed ? 'text-cyber-green' : 'text-cyber-red'}`}>
            {container.placed ? '✓ PLACED IN CARGO HOLD' : '✕ CANNOT BE PLACED'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

