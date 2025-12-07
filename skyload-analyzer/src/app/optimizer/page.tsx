"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Brain, Sparkles, Loader2, ArrowLeft, Download, Package, RotateCcw } from "lucide-react";
import Link from "next/link";

import FlightSelector from "@/components/optimizer/FlightSelector";
import ContainerSelector, { SelectedContainer, CONTAINER_TYPES } from "@/components/optimizer/ContainerSelector";
import UnplaceableCargo from "@/components/optimizer/UnplaceableCargo";
import RecommendationsPanel from "@/components/optimizer/RecommendationsPanel";
import ContainerDetails from "@/components/optimizer/ContainerDetails";
import FlightLoadSummary from "@/components/optimizer/FlightLoadSummary";
import { Container3DData } from "@/components/visualization/CargoContainer3D";

import { FlightData } from "@/lib/types";
import { CARGO_HOLD_SPECS } from "@/lib/cargo-types";

// Dynamically import Scene3D
const Scene3D = dynamic(() => import("@/components/visualization/Scene3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-cyber-bg">
      <Loader2 className="w-8 h-8 text-cyber-cyan animate-spin" />
    </div>
  ),
});

interface PlacementResult {
  containers: Container3DData[];
  balanceScore: number;
  forwardWeight: number;
  aftWeight: number;
  suggestions: string[];
  warnings: string[];
}

export default function OptimizerPage() {
  const searchParams = useSearchParams();
  const [flights, setFlights] = useState<FlightData[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<FlightData | null>(null);
  const [selectedContainers, setSelectedContainers] = useState<SelectedContainer[]>([]);
  const [isPlacing, setIsPlacing] = useState(false);
  const [placementResult, setPlacementResult] = useState<PlacementResult | null>(null);
  const [selectedContainer3D, setSelectedContainer3D] = useState<Container3DData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoLoaded, setAutoLoaded] = useState(false);

  // Auto-generate containers from flight cargo data
  const autoGenerateContainers = useCallback((flight: FlightData) => {
    if (!flight.gross_weight_cargo_kg || flight.gross_weight_cargo_kg <= 0) return [];
    
    const containers: SelectedContainer[] = [];
    let remainingWeight = flight.gross_weight_cargo_kg;
    let containerIndex = 0;
    
    while (remainingWeight > 100 && containers.length < 12) {
      let selectedType = CONTAINER_TYPES[0];
      
      if (remainingWeight > 3000) {
        selectedType = CONTAINER_TYPES[3]; // Pallet
      } else if (remainingWeight > 1500) {
        selectedType = CONTAINER_TYPES[1]; // LD6
      } else if (remainingWeight > 800) {
        selectedType = CONTAINER_TYPES[0]; // LD3
      } else {
        selectedType = CONTAINER_TYPES[4]; // Bulk
      }
      
      const fillRatio = 0.7 + Math.random() * 0.2;
      const containerWeight = Math.min(
        remainingWeight,
        Math.floor(selectedType.maxWeight * fillRatio)
      );
      
      if (containerWeight < 50) break;
      
      containers.push({
        id: `auto-${selectedType.id}-${containerIndex}`,
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
      containerIndex++;
    }
    
    return containers;
  }, []);

  // Load flights from localStorage and check for URL params
  useEffect(() => {
    const savedData = localStorage.getItem("skyload_flight_data");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFlights(parsed);
        
        // Check for flight from URL params or sessionStorage
        const flightNumber = searchParams.get("flight");
        const flightDate = searchParams.get("date");
        
        if (flightNumber && !autoLoaded) {
          // First try sessionStorage (more accurate - has full flight data)
          const storedFlight = sessionStorage.getItem("optimizer_flight");
          if (storedFlight) {
            try {
              const flight = JSON.parse(storedFlight);
              setSelectedFlight(flight);
              // Auto-generate containers from CSV cargo data
              const autoContainers = autoGenerateContainers(flight);
              setSelectedContainers(autoContainers);
              setAutoLoaded(true);
              sessionStorage.removeItem("optimizer_flight"); // Clean up
              return;
            } catch (e) {
              console.error("Failed to parse stored flight");
            }
          }
          
          // Fallback: Find flight in loaded data
          const matchedFlight = parsed.find((f: FlightData) => 
            f.flight_number === flightNumber && 
            (!flightDate || f.flight_date === flightDate)
          );
          
          if (matchedFlight && !autoLoaded) {
            setSelectedFlight(matchedFlight);
            const autoContainers = autoGenerateContainers(matchedFlight);
            setSelectedContainers(autoContainers);
            setAutoLoaded(true);
          }
        }
      } catch (e) {
        console.error("Failed to load saved flight data");
      }
    }
  }, [searchParams, autoLoaded, autoGenerateContainers]);

  // Get cargo hold specs for selected aircraft
  const cargoHold = selectedFlight
    ? CARGO_HOLD_SPECS[selectedFlight.aircraft_type] || CARGO_HOLD_SPECS["Boeing 737-800"]
    : null;

  // Handle placement optimization
  const handleOptimize = async () => {
    if (!selectedFlight || selectedContainers.length === 0) return;

    setIsPlacing(true);
    setError(null);
    setPlacementResult(null);

    try {
      const response = await fetch("/api/ai-place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flightNumber: selectedFlight.flight_number,
          aircraftType: selectedFlight.aircraft_type,
          containers: selectedContainers.map(c => ({
            id: c.id,
            name: c.name,
            weight: c.weight,
            volume: c.volume,
            width: c.width,
            height: c.height,
            depth: c.depth,
            color: c.color,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Placement failed");
      }

      const result: PlacementResult = await response.json();
      setPlacementResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Placement failed");
    } finally {
      setIsPlacing(false);
    }
  };

  // Reset placement
  const handleReset = () => {
    setPlacementResult(null);
    setSelectedContainer3D(null);
  };

  // Export placement plan
  const handleExport = () => {
    if (!placementResult) return;

    const exportData = {
      flight: selectedFlight,
      placement: placementResult,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `loading-plan-${selectedFlight?.flight_number}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate efficiency
  const efficiency = placementResult
    ? {
        current: (placementResult.containers.filter(c => c.placed).reduce((s, c) => s + c.weight, 0) / (cargoHold?.maxWeight || 1)) * 100,
        optimized: 90,
        improvement: 15,
      }
    : { current: 0, optimized: 0, improvement: 0 };

  return (
    <div className="min-h-screen bg-cyber-bg cyber-grid">
      {/* Header */}
      <header className="border-b border-cyber-cyan/20 bg-cyber-bg/80 backdrop-blur sticky top-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-400 hover:text-cyber-cyan transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-mono">BACK</span>
            </Link>
            <div className="h-6 w-px bg-cyber-cyan/20" />
            <div>
              <h1 className="font-display text-xl text-white tracking-wider flex items-center gap-2">
                <Package className="text-cyber-cyan" size={24} />
                CARGO PLACEMENT OPTIMIZER
              </h1>
              <p className="text-xs text-gray-500 font-mono">
                Select containers and optimize placement
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {placementResult && (
              <>
                <button onClick={handleReset} className="cyber-button flex items-center gap-2">
                  <RotateCcw size={16} />
                  RESET
                </button>
                <button onClick={handleExport} className="cyber-button flex items-center gap-2">
                  <Download size={16} />
                  EXPORT
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        {flights.length === 0 ? (
          <div className="max-w-lg mx-auto mt-20 text-center">
            <div className="cyber-card p-8">
              <Package className="w-16 h-16 text-cyber-cyan/50 mx-auto mb-4" />
              <h2 className="font-display text-xl text-white mb-2">NO FLIGHT DATA</h2>
              <p className="text-gray-400 mb-4">
                Please upload cargo data from the dashboard first.
              </p>
              <Link href="/" className="cyber-button inline-block">
                GO TO DASHBOARD
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6">
            {/* Left Sidebar - Flight & Container Selection */}
            <div className="col-span-12 lg:col-span-3 space-y-4">
              <FlightSelector
                flights={flights}
                selectedFlight={selectedFlight}
                onSelectFlight={(flight) => {
                  setSelectedFlight(flight);
                  setPlacementResult(null);
                  setSelectedContainers([]);
                }}
              />

              {selectedFlight && !placementResult && (
                <ContainerSelector
                  selectedContainers={selectedContainers}
                  onContainersChange={setSelectedContainers}
                  maxWeight={cargoHold?.maxWeight || 10000}
                  maxVolume={(cargoHold?.width || 3) * (cargoHold?.height || 1) * (cargoHold?.depth || 10)}
                  flightCargoWeight={selectedFlight.gross_weight_cargo_kg}
                  flightCargoVolume={selectedFlight.gross_volume_cargo_m3}
                />
              )}

              {selectedFlight && selectedContainers.length > 0 && !placementResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error && (
                    <div className="cyber-card p-3 border-cyber-red/50 mb-4">
                      <p className="text-cyber-red text-sm">{error}</p>
                    </div>
                  )}
                  <button
                    onClick={handleOptimize}
                    disabled={isPlacing}
                    className="cyber-button w-full flex items-center justify-center gap-2 py-4"
                  >
                    {isPlacing ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        PLACING CARGO...
                      </>
                    ) : (
                      <>
                        <Brain size={20} />
                        OPTIMIZE PLACEMENT
                        <Sparkles size={14} className="text-cyber-magenta" />
                      </>
                    )}
                  </button>
                </motion.div>
              )}

              {placementResult && (
                <>
                  <UnplaceableCargo containers={placementResult.containers} />
                  <ContainerDetails
                    container={selectedContainer3D}
                    onClose={() => setSelectedContainer3D(null)}
                  />
                </>
              )}
            </div>

            {/* Center - 3D Visualization */}
            <div className="col-span-12 lg:col-span-6">
              <div className="h-[600px] relative">
                {!selectedFlight ? (
                  <div className="cyber-card h-full flex items-center justify-center">
                    <div className="text-center">
                      <Package className="w-12 h-12 text-cyber-cyan/30 mx-auto mb-4" />
                      <p className="text-gray-500 font-mono">
                        Select a flight to begin
                      </p>
                    </div>
                  </div>
                ) : isPlacing ? (
                  <div className="cyber-card h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="relative inline-block mb-4">
                        <Loader2 className="w-16 h-16 text-cyber-cyan animate-spin" />
                        <Brain className="absolute inset-0 m-auto w-8 h-8 text-cyber-magenta" />
                      </div>
                      <p className="font-display text-cyber-cyan text-lg mb-2">
                        OPTIMIZING PLACEMENT...
                      </p>
                      <p className="text-gray-500 font-mono text-sm">
                        Calculating optimal positions
                      </p>
                    </div>
                  </div>
                ) : placementResult ? (
                  <Scene3D
                    aircraftType={selectedFlight.aircraft_type}
                    containers={placementResult.containers}
                    onContainerSelect={setSelectedContainer3D}
                    selectedContainerId={selectedContainer3D?.id || null}
                  />
                ) : (
                  <Scene3D
                    aircraftType={selectedFlight.aircraft_type}
                    containers={[]}
                    onContainerSelect={() => {}}
                    selectedContainerId={null}
                  />
                )}
              </div>

              {/* Instructions */}
              {selectedFlight && !placementResult && selectedContainers.length === 0 && (
                <div className="mt-4 cyber-card p-4 text-center">
                  <p className="text-gray-400 text-sm">
                    👈 Add containers from the left panel, then click <span className="text-cyber-cyan">"OPTIMIZE PLACEMENT"</span>
                  </p>
                </div>
              )}
            </div>

            {/* Right Sidebar - Flight Load & Recommendations */}
            <div className="col-span-12 lg:col-span-3 space-y-4">
              {/* Flight Load Summary - always show when flight selected */}
              {selectedFlight && (
                <FlightLoadSummary
                  flight={selectedFlight}
                  cargoWeight={selectedContainers.reduce((sum, c) => sum + c.weight, 0)}
                />
              )}
              
              {/* Placement Results */}
              {placementResult && (
                <RecommendationsPanel
                  balanceScore={placementResult.balanceScore}
                  suggestions={placementResult.suggestions}
                  warnings={placementResult.warnings}
                  efficiency={efficiency}
                />
              )}
              
              {/* Instructions when no flight selected */}
              {!selectedFlight && (
                <div className="cyber-card p-6">
                  <div className="text-center">
                    <Brain className="w-10 h-10 text-cyber-cyan/30 mx-auto mb-3" />
                    <h3 className="font-display text-sm text-gray-400 mb-2">
                      HOW IT WORKS
                    </h3>
                    <ol className="text-xs text-gray-500 text-left space-y-2">
                      <li className="flex gap-2">
                        <span className="text-cyber-cyan">1.</span>
                        Select a flight from Flights tab
                      </li>
                      <li className="flex gap-2">
                        <span className="text-cyber-cyan">2.</span>
                        View passengers, baggage, fuel load
                      </li>
                      <li className="flex gap-2">
                        <span className="text-cyber-cyan">3.</span>
                        Add/remove cargo containers
                      </li>
                      <li className="flex gap-2">
                        <span className="text-cyber-cyan">4.</span>
                        Check profitability
                      </li>
                      <li className="flex gap-2">
                        <span className="text-cyber-cyan">5.</span>
                        Optimize for max profit
                      </li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
