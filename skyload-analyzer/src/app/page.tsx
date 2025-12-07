"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plane,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Package,
  Activity,
} from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";
import StatsCard from "@/components/dashboard/StatsCard";
import FlightTable from "@/components/dashboard/FlightTable";
import FileUpload from "@/components/dashboard/FileUpload";
import AlertsPanel from "@/components/dashboard/AlertsPanel";
import AIPlacementPanel from "@/components/ai/AIPlacementPanel";

import { FlightData, WeightAnalysis, DashboardStats } from "@/lib/types";
import { parseCSV } from "@/lib/csv-parser";
import { analyzeAllFlights, calculateDashboardStats } from "@/lib/analysis";
import { formatNumber, formatCurrency, formatPercentage } from "@/lib/utils";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [flights, setFlights] = useState<FlightData[]>([]);
  const [analyses, setAnalyses] = useState<WeightAnalysis[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [selectedFlightForAI, setSelectedFlightForAI] = useState<WeightAnalysis | null>(null);

  const handleFileLoaded = async (content: string) => {
    setIsLoading(true);
    try {
      const parsedFlights = await parseCSV(content);
      setFlights(parsedFlights);

      // Save to localStorage for the optimizer page
      localStorage.setItem("skyload_flight_data", JSON.stringify(parsedFlights));

      const flightAnalyses = analyzeAllFlights(parsedFlights);
      setAnalyses(flightAnalyses);

      const dashboardStats = calculateDashboardStats(flightAnalyses);
      setStats(dashboardStats);

      setDataLoaded(true);
    } catch (error) {
      console.error("Error processing data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-cyber-bg">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="border-b border-cyber-cyan/20 bg-cyber-bg/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-2xl text-white tracking-wider"
              >
                {activeTab === "dashboard" && "COMMAND CENTER"}
                {activeTab === "flights" && "FLIGHT DATABASE"}
                {activeTab === "alerts" && "ALERT MONITOR"}
                {activeTab === "analytics" && "ANALYTICS HUB"}
                {activeTab === "upload" && "DATA UPLOAD"}
              </motion.h1>
              <p className="text-sm text-gray-500 font-mono mt-1">
                {dataLoaded
                  ? `${formatNumber(flights.length)} flights loaded`
                  : "No data loaded"}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-500 font-mono">SYSTEM STATUS</p>
                <p className="text-sm text-cyber-green font-display">● ONLINE</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {!dataLoaded ? (
            /* Upload Section */
            <div className="max-w-2xl mx-auto mt-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                <h2 className="font-display text-3xl neon-text-cyan mb-4">
                  INITIALIZE SYSTEM
                </h2>
                <p className="text-gray-400">
                  Upload your cargo flight data to begin analysis
                </p>
              </motion.div>
              <FileUpload onFileLoaded={handleFileLoaded} isLoading={isLoading} />
            </div>
          ) : (
            /* Dashboard Content */
            <>
              {activeTab === "dashboard" && stats && (
                <div className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard
                      title="Total Flights"
                      value={formatNumber(stats.totalFlights)}
                      subtitle="In database"
                      icon={Plane}
                      variant="cyan"
                      delay={0}
                    />
                    <StatsCard
                      title="Overweight Alerts"
                      value={formatNumber(stats.overweightCount)}
                      subtitle={`${formatPercentage((stats.overweightCount / stats.totalFlights) * 100)} of flights`}
                      icon={AlertTriangle}
                      variant={stats.overweightCount > 0 ? "red" : "green"}
                      delay={0.1}
                    />
                    <StatsCard
                      title="Avg Weight Util."
                      value={formatPercentage(stats.avgWeightUtilization)}
                      subtitle="Cargo capacity used"
                      icon={TrendingUp}
                      variant={stats.avgWeightUtilization > 85 ? "yellow" : "green"}
                      delay={0.2}
                    />
                    <StatsCard
                      title="Cargo Revenue"
                      value={formatCurrency(stats.totalCargoRevenue)}
                      subtitle="Total earnings"
                      icon={DollarSign}
                      variant="magenta"
                      delay={0.3}
                    />
                  </div>

                  {/* Second Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Alerts Panel */}
                    <div className="lg:col-span-1">
                      <AlertsPanel analyses={analyses} />
                    </div>

                    {/* Aircraft Breakdown */}
                    <div className="lg:col-span-2">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="cyber-card p-6"
                      >
                        <div className="flex items-center gap-3 mb-6">
                          <Package className="text-cyber-cyan" size={24} />
                          <h2 className="font-display text-cyber-cyan text-lg tracking-wider">
                            AIRCRAFT BREAKDOWN
                          </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {stats.aircraftBreakdown.map((aircraft, index) => (
                            <motion.div
                              key={aircraft.aircraftType}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                              className="bg-cyber-bg/50 border border-cyber-cyan/20 rounded p-4"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="font-body text-white font-semibold">
                                  {aircraft.aircraftType}
                                </h3>
                                <span className="text-xs font-mono text-gray-500">
                                  {aircraft.flightCount} flights
                                </span>
                              </div>

                              <div className="space-y-2">
                                <div>
                                  <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="text-gray-400">Weight Utilization</span>
                                    <span className="text-cyber-cyan font-mono">
                                      {formatPercentage(aircraft.avgWeightUtilization)}
                                    </span>
                                  </div>
                                  <div className="cyber-progress">
                                    <div
                                      className={`cyber-progress-bar ${
                                        aircraft.avgWeightUtilization >= 100
                                          ? "danger"
                                          : aircraft.avgWeightUtilization >= 85
                                          ? "warning"
                                          : "safe"
                                      }`}
                                      style={{
                                        width: `${Math.min(aircraft.avgWeightUtilization, 100)}%`,
                                      }}
                                    />
                                  </div>
                                </div>

                                <div>
                                  <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="text-gray-400">Volume Utilization</span>
                                    <span className="text-cyber-magenta font-mono">
                                      {formatPercentage(aircraft.avgVolumeUtilization)}
                                    </span>
                                  </div>
                                  <div className="cyber-progress">
                                    <div
                                      className={`cyber-progress-bar ${
                                        aircraft.avgVolumeUtilization >= 100
                                          ? "danger"
                                          : aircraft.avgVolumeUtilization >= 85
                                          ? "warning"
                                          : "safe"
                                      }`}
                                      style={{
                                        width: `${Math.min(aircraft.avgVolumeUtilization, 100)}%`,
                                      }}
                                    />
                                  </div>
                                </div>

                                {aircraft.overweightCount > 0 && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <AlertTriangle size={12} className="text-cyber-red" />
                                    <span className="text-xs text-cyber-red font-mono">
                                      {aircraft.overweightCount} overweight
                                    </span>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Flight Table */}
                  <FlightTable 
                    analyses={analyses} 
                    onAnalyzeClick={(analysis) => setSelectedFlightForAI(analysis)}
                  />
                </div>
              )}

              {activeTab === "flights" && (
                <FlightTable 
                  analyses={analyses} 
                  onAnalyzeClick={(analysis) => setSelectedFlightForAI(analysis)}
                />
              )}

              {activeTab === "alerts" && (
                <div className="max-w-4xl">
                  <AlertsPanel analyses={analyses} />
                </div>
              )}

              {activeTab === "upload" && (
                <div className="max-w-2xl mx-auto">
                  <FileUpload onFileLoaded={handleFileLoaded} isLoading={isLoading} />
                </div>
              )}

              {activeTab === "analytics" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="cyber-card p-8 text-center"
                >
                  <Activity size={48} className="text-cyber-cyan mx-auto mb-4 opacity-50" />
                  <h2 className="font-display text-xl text-gray-400 mb-2">
                    ANALYTICS MODULE
                  </h2>
                  <p className="text-gray-500">
                    Advanced analytics and charts coming soon...
                  </p>
                </motion.div>
              )}
            </>
          )}
        </div>
      </main>

      {/* AI Placement Panel */}
      {selectedFlightForAI && (
        <AIPlacementPanel
          selectedFlight={selectedFlightForAI}
          onClose={() => setSelectedFlightForAI(null)}
        />
      )}
    </div>
  );
}

