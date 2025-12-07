"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Loader2,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  TrendingUp,
  Package,
} from "lucide-react";
import { WeightAnalysis } from "@/lib/types";
import { AIAnalysisResponse } from "@/lib/cargo-types";
import { cn, formatNumber, formatPercentage } from "@/lib/utils";
import CargoVisualization from "@/components/visualization/CargoVisualization";

interface AIPlacementPanelProps {
  selectedFlight: WeightAnalysis | null;
  onClose: () => void;
}

export default function AIPlacementPanel({
  selectedFlight,
  onClose,
}: AIPlacementPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!selectedFlight) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/ai-analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          flightNumber: selectedFlight.flight.flight_number,
          aircraftType: selectedFlight.flight.aircraft_type,
          cargoWeight: selectedFlight.flight.gross_weight_cargo_kg,
          cargoVolume: selectedFlight.flight.gross_volume_cargo_m3,
          passengerCount: selectedFlight.flight.passenger_count,
          baggageWeight: selectedFlight.flight.baggage_weight_kg,
          origin: selectedFlight.flight.origin,
          destination: selectedFlight.flight.destination,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze");
      }

      const result: AIAnalysisResponse = await response.json();
      setAnalysisResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!selectedFlight) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="cyber-card w-full max-w-6xl max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-cyber-cyan/20 flex items-center justify-between sticky top-0 bg-cyber-bg/95 backdrop-blur z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Brain className="text-cyber-cyan w-8 h-8" />
              <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-cyber-magenta animate-pulse" />
            </div>
            <div>
              <h2 className="font-display text-xl text-white tracking-wider">
                AI CARGO PLACEMENT
              </h2>
              <p className="text-sm text-gray-400 font-mono">
                Flight {selectedFlight.flight.flight_number} • {selectedFlight.flight.origin} → {selectedFlight.flight.destination}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!analysisResult && !isAnalyzing && (
            <div className="text-center py-12">
              {/* Flight Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-3xl mx-auto">
                <div className="cyber-card p-4">
                  <p className="text-xs text-gray-500 font-mono mb-1">AIRCRAFT</p>
                  <p className="text-cyber-cyan font-display text-sm">
                    {selectedFlight.flight.aircraft_type}
                  </p>
                </div>
                <div className="cyber-card p-4">
                  <p className="text-xs text-gray-500 font-mono mb-1">CARGO WEIGHT</p>
                  <p className="text-white font-display text-lg">
                    {formatNumber(selectedFlight.flight.gross_weight_cargo_kg)} kg
                  </p>
                </div>
                <div className="cyber-card p-4">
                  <p className="text-xs text-gray-500 font-mono mb-1">CARGO VOLUME</p>
                  <p className="text-white font-display text-lg">
                    {formatNumber(selectedFlight.flight.gross_volume_cargo_m3)} m³
                  </p>
                </div>
                <div className="cyber-card p-4">
                  <p className="text-xs text-gray-500 font-mono mb-1">UTILIZATION</p>
                  <p className={cn(
                    "font-display text-lg",
                    selectedFlight.weightStatus === "safe" ? "text-cyber-green" :
                    selectedFlight.weightStatus === "warning" ? "text-cyber-yellow" :
                    "text-cyber-red"
                  )}>
                    {formatPercentage(selectedFlight.cargoWeightUtilization)}
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-cyber-red/10 border border-cyber-red/50 rounded max-w-lg mx-auto">
                  <div className="flex items-center gap-2 text-cyber-red">
                    <AlertTriangle size={20} />
                    <span className="font-mono text-sm">{error}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleAnalyze}
                className="cyber-button text-lg px-8 py-4 group"
              >
                <div className="flex items-center gap-3">
                  <Brain className="group-hover:animate-pulse" />
                  ANALYZE WITH AI
                  <Sparkles className="text-cyber-magenta" size={16} />
                </div>
              </button>
              <p className="text-xs text-gray-500 mt-4 font-mono">
                Claude AI will analyze optimal cargo placement
              </p>
            </div>
          )}

          {isAnalyzing && (
            <div className="text-center py-20">
              <div className="relative inline-block mb-6">
                <Loader2 className="w-16 h-16 text-cyber-cyan animate-spin" />
                <Brain className="absolute inset-0 m-auto w-8 h-8 text-cyber-magenta" />
              </div>
              <h3 className="font-display text-xl text-cyber-cyan mb-2">
                ANALYZING CARGO...
              </h3>
              <p className="text-gray-400 font-mono text-sm">
                AI is calculating optimal placement
              </p>
              <div className="mt-6 flex justify-center gap-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-cyber-cyan rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          )}

          {analysisResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Efficiency Improvement */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="cyber-card p-5 border-cyber-yellow/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="text-cyber-yellow" size={20} />
                    <span className="text-xs font-mono text-gray-400">CURRENT EFFICIENCY</span>
                  </div>
                  <p className="font-display text-3xl text-cyber-yellow">
                    {analysisResult.efficiency.current.toFixed(1)}%
                  </p>
                </div>

                <div className="cyber-card p-5 border-cyber-green/30">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="text-cyber-green" size={20} />
                    <span className="text-xs font-mono text-gray-400">OPTIMIZED</span>
                  </div>
                  <p className="font-display text-3xl text-cyber-green">
                    {analysisResult.efficiency.optimized.toFixed(1)}%
                  </p>
                </div>

                <div className="cyber-card p-5 border-cyber-cyan/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="text-cyber-cyan" size={20} />
                    <span className="text-xs font-mono text-gray-400">IMPROVEMENT</span>
                  </div>
                  <p className="font-display text-3xl text-cyber-cyan">
                    +{analysisResult.efficiency.improvement.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Visualization */}
              <div className="cyber-card p-6 border-cyber-cyan/30">
                <h3 className="font-display text-lg text-cyber-cyan mb-4 flex items-center gap-2">
                  <Package size={20} />
                  CARGO PLACEMENT VISUALIZATION
                </h3>
                <CargoVisualization
                  aircraftType={selectedFlight.flight.aircraft_type}
                  containers={analysisResult.placement.containers}
                  balanceScore={analysisResult.placement.balanceScore}
                />
              </div>

              {/* AI Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Suggestions */}
                <div className="cyber-card p-5">
                  <h4 className="font-display text-sm text-cyber-green mb-3 flex items-center gap-2">
                    <CheckCircle size={16} />
                    PLACEMENT SUGGESTIONS
                  </h4>
                  <ul className="space-y-2">
                    {analysisResult.placement.suggestions.map((suggestion, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-cyber-green mt-1">▸</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommendations */}
                <div className="cyber-card p-5">
                  <h4 className="font-display text-sm text-cyber-cyan mb-3 flex items-center gap-2">
                    <Lightbulb size={16} />
                    AI RECOMMENDATIONS
                  </h4>
                  <ul className="space-y-2">
                    {analysisResult.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-cyber-cyan mt-1">▸</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Warnings */}
              {analysisResult.placement.warnings.length > 0 && (
                <div className="cyber-card p-5 border-cyber-yellow/30">
                  <h4 className="font-display text-sm text-cyber-yellow mb-3 flex items-center gap-2">
                    <AlertTriangle size={16} />
                    WARNINGS
                  </h4>
                  <ul className="space-y-2">
                    {analysisResult.placement.warnings.map((warning, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-cyber-yellow/80">
                        <span className="mt-1">⚠</span>
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Analysis Text */}
              <div className="cyber-card p-5">
                <h4 className="font-display text-sm text-gray-400 mb-3">
                  DETAILED ANALYSIS
                </h4>
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {analysisResult.analysis}
                </p>
              </div>

              {/* Re-analyze Button */}
              <div className="text-center pt-4">
                <button
                  onClick={handleAnalyze}
                  className="cyber-button"
                >
                  <div className="flex items-center gap-2">
                    <Brain size={16} />
                    RE-ANALYZE
                  </div>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

