"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "cyan" | "magenta" | "green" | "red" | "yellow";
  delay?: number;
}

const variantStyles = {
  cyan: {
    border: "border-cyber-cyan/30 hover:border-cyber-cyan/60",
    shadow: "hover:shadow-neon-cyan-sm",
    icon: "text-cyber-cyan",
    value: "text-cyber-cyan",
    glow: "from-cyber-cyan/20",
  },
  magenta: {
    border: "border-cyber-magenta/30 hover:border-cyber-magenta/60",
    shadow: "hover:shadow-neon-magenta",
    icon: "text-cyber-magenta",
    value: "text-cyber-magenta",
    glow: "from-cyber-magenta/20",
  },
  green: {
    border: "border-cyber-green/30 hover:border-cyber-green/60",
    shadow: "hover:shadow-neon-green",
    icon: "text-cyber-green",
    value: "text-cyber-green",
    glow: "from-cyber-green/20",
  },
  red: {
    border: "border-cyber-red/30 hover:border-cyber-red/60",
    shadow: "hover:shadow-neon-red",
    icon: "text-cyber-red",
    value: "text-cyber-red",
    glow: "from-cyber-red/20",
  },
  yellow: {
    border: "border-cyber-yellow/30 hover:border-cyber-yellow/60",
    shadow: "hover:shadow-neon-yellow",
    icon: "text-cyber-yellow",
    value: "text-cyber-yellow",
    glow: "from-cyber-yellow/20",
  },
};

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "cyan",
  delay = 0,
}: StatsCardProps) {
  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        "cyber-card p-5 relative overflow-hidden transition-all duration-300",
        styles.border,
        styles.shadow
      )}
    >
      {/* Gradient glow */}
      <div
        className={cn(
          "absolute top-0 right-0 w-32 h-32 bg-gradient-radial opacity-30 blur-2xl",
          styles.glow
        )}
      />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className={cn("p-2 bg-cyber-bg/50 rounded border border-current/20", styles.icon)}>
            <Icon size={20} />
          </div>
          {trend && (
            <span
              className={cn(
                "text-xs font-mono px-2 py-1 rounded",
                trend.isPositive
                  ? "text-cyber-green bg-cyber-green/10"
                  : "text-cyber-red bg-cyber-red/10"
              )}
            >
              {trend.isPositive ? "▲" : "▼"} {Math.abs(trend.value)}%
            </span>
          )}
        </div>

        <h3 className="text-xs font-display text-gray-400 uppercase tracking-wider mb-1">
          {title}
        </h3>

        <p className={cn("text-3xl font-display font-bold tracking-tight", styles.value)}>
          {value}
        </p>

        {subtitle && (
          <p className="text-xs font-mono text-gray-500 mt-2">{subtitle}</p>
        )}
      </div>

      {/* Bottom accent line */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-current to-transparent opacity-50",
          styles.icon
        )}
      />
    </motion.div>
  );
}

