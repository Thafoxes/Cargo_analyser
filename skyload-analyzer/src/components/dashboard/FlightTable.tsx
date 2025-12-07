"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { WeightAnalysis } from "@/lib/types";
import { formatNumber, formatPercentage, formatDate, cn } from "@/lib/utils";
import { ChevronUp, ChevronDown, Search, Filter, Brain, Sparkles, Box } from "lucide-react";

interface FlightTableProps {
  analyses: WeightAnalysis[];
  onAnalyzeClick?: (analysis: WeightAnalysis) => void;
}

type SortField = "flight_number" | "flight_date" | "cargoWeightUtilization" | "cargoVolumeUtilization";
type SortDirection = "asc" | "desc";

export default function FlightTable({ analyses, onAnalyzeClick }: FlightTableProps) {
  const router = useRouter();
  const [sortField, setSortField] = useState<SortField>("flight_date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "safe" | "warning" | "danger">("all");

  // Navigate to 3D optimizer with selected flight
  const handleOptimize = (analysis: WeightAnalysis) => {
    // Store the selected flight data in sessionStorage for the optimizer page
    sessionStorage.setItem("optimizer_flight", JSON.stringify(analysis.flight));
    router.push(`/optimizer?flight=${encodeURIComponent(analysis.flight.flight_number)}&date=${analysis.flight.flight_date}`);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSorted = analyses
    .filter((a) => {
      const matchesSearch =
        a.flight.flight_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.flight.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.flight.destination.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        a.weightStatus === statusFilter ||
        a.volumeStatus === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "flight_number":
          comparison = a.flight.flight_number.localeCompare(b.flight.flight_number);
          break;
        case "flight_date":
          comparison = new Date(a.flight.flight_date).getTime() - new Date(b.flight.flight_date).getTime();
          break;
        case "cargoWeightUtilization":
          comparison = a.cargoWeightUtilization - b.cargoWeightUtilization;
          break;
        case "cargoVolumeUtilization":
          comparison = a.cargoVolumeUtilization - b.cargoVolumeUtilization;
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp size={14} className="text-cyber-cyan" />
    ) : (
      <ChevronDown size={14} className="text-cyber-cyan" />
    );
  };

  const StatusBadge = ({ status }: { status: "safe" | "warning" | "danger" }) => (
    <span className={cn("status-badge", status)}>
      {status === "safe" && "✓ OK"}
      {status === "warning" && "⚠ WARN"}
      {status === "danger" && "✕ OVER"}
    </span>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="cyber-card"
    >
      {/* Header */}
      <div className="p-4 border-b border-cyber-cyan/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="font-display text-cyber-cyan text-lg tracking-wider">
            FLIGHT DATA
          </h2>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search flights..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="cyber-input pl-10 pr-4 py-2 w-48 text-sm"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="cyber-select pl-10 pr-8 py-2 text-sm appearance-none"
              >
                <option value="all">All Status</option>
                <option value="safe">Safe</option>
                <option value="warning">Warning</option>
                <option value="danger">Overweight</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="cyber-table">
          <thead>
            <tr>
              <th
                className="cursor-pointer hover:text-white"
                onClick={() => handleSort("flight_number")}
              >
                <div className="flex items-center gap-2">
                  Flight <SortIcon field="flight_number" />
                </div>
              </th>
              <th
                className="cursor-pointer hover:text-white"
                onClick={() => handleSort("flight_date")}
              >
                <div className="flex items-center gap-2">
                  Date <SortIcon field="flight_date" />
                </div>
              </th>
              <th>Route</th>
              <th>Aircraft</th>
              <th
                className="cursor-pointer hover:text-white"
                onClick={() => handleSort("cargoWeightUtilization")}
              >
                <div className="flex items-center gap-2">
                  Weight Util. <SortIcon field="cargoWeightUtilization" />
                </div>
              </th>
              <th
                className="cursor-pointer hover:text-white"
                onClick={() => handleSort("cargoVolumeUtilization")}
              >
                <div className="flex items-center gap-2">
                  Volume Util. <SortIcon field="cargoVolumeUtilization" />
                </div>
              </th>
              <th>Cargo (kg)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted.slice(0, 50).map((analysis, index) => (
              <motion.tr
                key={`${analysis.flight.flight_number}-${analysis.flight.flight_date}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
                className={cn(
                  analysis.isOverweight && "bg-cyber-red/5"
                )}
              >
                <td className="text-cyber-cyan font-semibold">
                  {analysis.flight.flight_number}
                </td>
                <td className="text-gray-400">
                  {formatDate(analysis.flight.flight_date)}
                </td>
                <td>
                  <span className="text-white">{analysis.flight.origin}</span>
                  <span className="text-cyber-cyan mx-2">→</span>
                  <span className="text-white">{analysis.flight.destination}</span>
                </td>
                <td className="text-gray-400 text-sm">
                  {analysis.flight.aircraft_type}
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="cyber-progress w-20">
                      <div
                        className={cn("cyber-progress-bar", analysis.weightStatus)}
                        style={{ width: `${Math.min(analysis.cargoWeightUtilization, 100)}%` }}
                      />
                    </div>
                    <span className={cn(
                      "text-sm font-mono",
                      analysis.weightStatus === "safe" && "text-cyber-green",
                      analysis.weightStatus === "warning" && "text-cyber-yellow",
                      analysis.weightStatus === "danger" && "text-cyber-red"
                    )}>
                      {formatPercentage(analysis.cargoWeightUtilization)}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="cyber-progress w-20">
                      <div
                        className={cn("cyber-progress-bar", analysis.volumeStatus)}
                        style={{ width: `${Math.min(analysis.cargoVolumeUtilization, 100)}%` }}
                      />
                    </div>
                    <span className={cn(
                      "text-sm font-mono",
                      analysis.volumeStatus === "safe" && "text-cyber-green",
                      analysis.volumeStatus === "warning" && "text-cyber-yellow",
                      analysis.volumeStatus === "danger" && "text-cyber-red"
                    )}>
                      {formatPercentage(analysis.cargoVolumeUtilization)}
                    </span>
                  </div>
                </td>
                <td className="font-mono">
                  {formatNumber(analysis.flight.gross_weight_cargo_kg)}
                </td>
                <td>
                  <StatusBadge status={analysis.isOverweight ? "danger" : analysis.weightStatus} />
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOptimize(analysis)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-cyber-card border border-cyber-cyan/30 hover:border-cyber-cyan hover:bg-cyber-cyan/10 rounded transition-all group"
                      title="Open 3D Optimizer"
                    >
                      <Box size={14} className="text-cyber-cyan group-hover:animate-pulse" />
                      <span className="text-xs font-mono text-cyber-cyan">3D</span>
                    </button>
                    <button
                      onClick={() => onAnalyzeClick?.(analysis)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-cyber-card border border-cyber-magenta/30 hover:border-cyber-magenta hover:bg-cyber-magenta/10 rounded transition-all group"
                      title="AI Analysis"
                    >
                      <Brain size={14} className="text-cyber-magenta group-hover:animate-pulse" />
                      <span className="text-xs font-mono text-cyber-magenta">AI</span>
                      <Sparkles size={10} className="text-cyber-cyan" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-cyber-cyan/20 flex items-center justify-between">
        <p className="text-sm text-gray-500 font-mono">
          Showing {Math.min(filteredAndSorted.length, 50)} of {filteredAndSorted.length} flights
        </p>
        <p className="text-xs text-cyber-cyan/50 font-mono">
          {analyses.filter(a => a.isOverweight).length} overweight alerts
        </p>
      </div>
    </motion.div>
  );
}

