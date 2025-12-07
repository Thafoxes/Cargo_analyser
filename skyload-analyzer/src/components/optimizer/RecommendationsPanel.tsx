"use client";

import { motion } from "framer-motion";
import { Lightbulb, CheckCircle, AlertTriangle, TrendingUp, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecommendationsPanelProps {
  balanceScore: number;
  suggestions: string[];
  warnings: string[];
  efficiency: {
    current: number;
    optimized: number;
    improvement: number;
  };
}

export default function RecommendationsPanel({
  balanceScore,
  suggestions,
  warnings,
  efficiency,
}: RecommendationsPanelProps) {
  return (
    <div className="space-y-4">
      {/* Balance Score */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="cyber-card p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <Scale size={18} className="text-cyber-cyan" />
          <h3 className="font-display text-cyber-cyan text-sm tracking-wider">
            BALANCE SCORE
          </h3>
        </div>

        <div className="flex items-center gap-4">
          <div
            className={cn(
              "font-display text-4xl",
              balanceScore >= 80 ? "text-cyber-green" :
              balanceScore >= 60 ? "text-cyber-yellow" :
              "text-cyber-red"
            )}
          >
            {balanceScore}%
          </div>
          <div className="flex-1">
            <div className="h-3 bg-cyber-bg rounded overflow-hidden border border-cyber-cyan/20">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${balanceScore}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={cn(
                  "h-full",
                  balanceScore >= 80 ? "bg-cyber-green" :
                  balanceScore >= 60 ? "bg-cyber-yellow" :
                  "bg-cyber-red"
                )}
                style={{
                  boxShadow: balanceScore >= 80 
                    ? "0 0 10px #39ff14" 
                    : balanceScore >= 60 
                    ? "0 0 10px #ffd700"
                    : "0 0 10px #ff073a"
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1 font-mono">
              {balanceScore >= 80 ? "Optimal CG distribution" :
               balanceScore >= 60 ? "Acceptable balance" :
               "Requires rebalancing"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Efficiency Improvement */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="cyber-card p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={18} className="text-cyber-green" />
          <h3 className="font-display text-cyber-green text-sm tracking-wider">
            EFFICIENCY
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-cyber-bg/50 rounded p-2">
            <p className="text-xs text-gray-500">Current</p>
            <p className="font-display text-cyber-yellow text-lg">
              {efficiency.current.toFixed(0)}%
            </p>
          </div>
          <div className="bg-cyber-bg/50 rounded p-2">
            <p className="text-xs text-gray-500">Optimized</p>
            <p className="font-display text-cyber-green text-lg">
              {efficiency.optimized.toFixed(0)}%
            </p>
          </div>
          <div className="bg-cyber-bg/50 rounded p-2">
            <p className="text-xs text-gray-500">Improvement</p>
            <p className="font-display text-cyber-cyan text-lg">
              +{efficiency.improvement.toFixed(0)}%
            </p>
          </div>
        </div>
      </motion.div>

      {/* AI Suggestions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="cyber-card p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={18} className="text-cyber-magenta" />
          <h3 className="font-display text-cyber-magenta text-sm tracking-wider">
            AI RECOMMENDATIONS
          </h3>
        </div>

        <ul className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-start gap-2 text-sm text-gray-300"
            >
              <CheckCircle size={14} className="text-cyber-green mt-0.5 shrink-0" />
              <span>{suggestion}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="cyber-card p-4 border-cyber-yellow/30"
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-cyber-yellow" />
            <h3 className="font-display text-cyber-yellow text-sm tracking-wider">
              WARNINGS
            </h3>
          </div>

          <ul className="space-y-2">
            {warnings.map((warning, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-cyber-yellow/80"
              >
                <span className="mt-0.5">⚠</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}

