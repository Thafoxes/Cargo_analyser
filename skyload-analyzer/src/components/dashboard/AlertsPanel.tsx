"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Plane, TrendingUp } from "lucide-react";
import { WeightAnalysis } from "@/lib/types";
import { formatNumber, formatPercentage, formatDate, cn } from "@/lib/utils";

interface AlertsPanelProps {
  analyses: WeightAnalysis[];
}

export default function AlertsPanel({ analyses }: AlertsPanelProps) {
  const overweightFlights = analyses
    .filter((a) => a.isOverweight || a.isOverVolume)
    .sort((a, b) => b.cargoWeightUtilization - a.cargoWeightUtilization);

  if (overweightFlights.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="cyber-card p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="text-cyber-green" size={24} />
          <h2 className="font-display text-cyber-green text-lg tracking-wider">
            NO ALERTS
          </h2>
        </div>
        <p className="text-gray-400 text-sm">
          All flights are within weight and volume limits.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="cyber-card border-cyber-red/30"
    >
      {/* Header */}
      <div className="p-4 border-b border-cyber-red/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <AlertTriangle className="text-cyber-red animate-pulse" size={24} />
            <div className="absolute inset-0 bg-cyber-red/30 blur-lg" />
          </div>
          <h2 className="font-display text-cyber-red text-lg tracking-wider">
            OVERWEIGHT ALERTS
          </h2>
        </div>
        <span className="bg-cyber-red/20 text-cyber-red px-3 py-1 rounded font-mono text-sm">
          {overweightFlights.length} FLIGHTS
        </span>
      </div>

      {/* Alerts List */}
      <div className="max-h-80 overflow-y-auto">
        {overweightFlights.slice(0, 10).map((analysis, index) => (
          <motion.div
            key={`${analysis.flight.flight_number}-${analysis.flight.flight_date}-${index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={cn(
              "p-4 border-b border-cyber-red/10 hover:bg-cyber-red/5 transition-colors",
              index === 0 && "bg-cyber-red/10"
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Plane size={16} className="text-cyber-red" />
                <span className="font-display text-white">
                  {analysis.flight.flight_number}
                </span>
                <span className="text-xs text-gray-500 font-mono">
                  {formatDate(analysis.flight.flight_date)}
                </span>
              </div>
              <span className="text-cyber-red font-mono text-sm glitch-text">
                +{formatPercentage(analysis.cargoWeightUtilization - 100)}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-400">
                {analysis.flight.origin} → {analysis.flight.destination}
              </span>
              <span className="text-gray-500">|</span>
              <span className="text-gray-400">
                {analysis.flight.aircraft_type}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-4">
              {analysis.isOverweight && (
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-cyber-red" />
                  <span className="text-xs text-gray-400">
                    Weight: <span className="text-cyber-red font-mono">
                      {formatNumber(analysis.flight.gross_weight_cargo_kg)} kg
                    </span>
                  </span>
                </div>
              )}
              {analysis.isOverVolume && (
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-cyber-yellow" />
                  <span className="text-xs text-gray-400">
                    Volume: <span className="text-cyber-yellow font-mono">
                      {formatNumber(analysis.flight.gross_volume_cargo_m3)} m³
                    </span>
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {overweightFlights.length > 10 && (
        <div className="p-3 text-center border-t border-cyber-red/20">
          <p className="text-xs text-cyber-red font-mono">
            + {overweightFlights.length - 10} more alerts
          </p>
        </div>
      )}
    </motion.div>
  );
}

