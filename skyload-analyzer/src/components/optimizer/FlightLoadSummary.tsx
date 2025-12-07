"use client";

import { motion } from "framer-motion";
import { Users, Briefcase, Fuel, Package, DollarSign, TrendingUp, TrendingDown, AlertTriangle, Scale } from "lucide-react";
import { FlightData, AIRCRAFT_SPECS } from "@/lib/types";
import { formatNumber, cn } from "@/lib/utils";

interface FlightLoadSummaryProps {
  flight: FlightData;
  cargoWeight: number; // Current cargo weight being loaded
}

// Average passenger weight including carry-on (IATA standard)
const AVG_PASSENGER_WEIGHT = 90; // kg

export default function FlightLoadSummary({ flight, cargoWeight }: FlightLoadSummaryProps) {
  const specs = AIRCRAFT_SPECS[flight.aircraft_type];
  
  // Weight calculations
  const passengerWeight = flight.passenger_count * AVG_PASSENGER_WEIGHT;
  const baggageWeight = flight.baggage_weight_kg;
  const fuelWeight = flight.fuel_weight_kg;
  
  // Fixed load (passengers + baggage + fuel)
  const fixedLoad = passengerWeight + baggageWeight + fuelWeight;
  
  // Available for cargo (simplified - using max payload as proxy)
  const maxPayload = specs?.maxTotalPayload || 20000;
  const availableForCargo = Math.max(0, maxPayload - passengerWeight - baggageWeight);
  
  // Financial calculations
  const fuelCost = fuelWeight * flight.fuel_price_per_kg;
  const cargoRevenue = cargoWeight * flight.cargo_price_per_kg;
  const profitLoss = cargoRevenue - fuelCost;
  const isProfitable = profitLoss >= 0;
  
  // Break-even cargo weight
  const breakEvenCargo = fuelCost / flight.cargo_price_per_kg;
  const aboveBreakEven = cargoWeight >= breakEvenCargo;
  
  // Utilization
  const cargoUtilization = (cargoWeight / availableForCargo) * 100;
  const isOverweight = cargoWeight > availableForCargo;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Weight Breakdown */}
      <div className="cyber-card p-4">
        <h3 className="font-display text-cyber-cyan text-sm tracking-wider mb-3 flex items-center gap-2">
          <Scale size={16} />
          FLIGHT LOAD BREAKDOWN
        </h3>
        
        <div className="space-y-3">
          {/* Passengers */}
          <div className="flex items-center justify-between p-2 bg-cyber-bg/50 rounded border border-blue-500/20">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-blue-400" />
              <span className="text-sm text-gray-300">Passengers</span>
            </div>
            <div className="text-right">
              <p className="font-mono text-blue-400">{flight.passenger_count} pax</p>
              <p className="text-xs text-gray-500">{formatNumber(passengerWeight)} kg</p>
            </div>
          </div>
          
          {/* Baggage */}
          <div className="flex items-center justify-between p-2 bg-cyber-bg/50 rounded border border-purple-500/20">
            <div className="flex items-center gap-2">
              <Briefcase size={16} className="text-purple-400" />
              <span className="text-sm text-gray-300">Baggage</span>
            </div>
            <div className="text-right">
              <p className="font-mono text-purple-400">{formatNumber(baggageWeight)} kg</p>
            </div>
          </div>
          
          {/* Fuel */}
          <div className="flex items-center justify-between p-2 bg-cyber-bg/50 rounded border border-orange-500/20">
            <div className="flex items-center gap-2">
              <Fuel size={16} className="text-orange-400" />
              <span className="text-sm text-gray-300">Fuel</span>
            </div>
            <div className="text-right">
              <p className="font-mono text-orange-400">{formatNumber(fuelWeight)} kg</p>
              <p className="text-xs text-gray-500">${flight.fuel_price_per_kg}/kg</p>
            </div>
          </div>
          
          {/* Cargo */}
          <div className={cn(
            "flex items-center justify-between p-2 bg-cyber-bg/50 rounded border",
            isOverweight ? "border-cyber-red/50" : "border-cyber-green/20"
          )}>
            <div className="flex items-center gap-2">
              <Package size={16} className={isOverweight ? "text-cyber-red" : "text-cyber-green"} />
              <span className="text-sm text-gray-300">Cargo</span>
            </div>
            <div className="text-right">
              <p className={cn(
                "font-mono",
                isOverweight ? "text-cyber-red" : "text-cyber-green"
              )}>
                {formatNumber(cargoWeight)} kg
              </p>
              <p className="text-xs text-gray-500">
                / {formatNumber(availableForCargo)} kg available
              </p>
            </div>
          </div>
        </div>
        
        {/* Utilization Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">Cargo Utilization</span>
            <span className={cn(
              "font-mono",
              isOverweight ? "text-cyber-red" : cargoUtilization > 80 ? "text-cyber-yellow" : "text-cyber-green"
            )}>
              {cargoUtilization.toFixed(1)}%
            </span>
          </div>
          <div className="cyber-progress h-2">
            <div
              className={cn(
                "cyber-progress-bar",
                isOverweight ? "danger" : cargoUtilization > 80 ? "warning" : "safe"
              )}
              style={{ width: `${Math.min(cargoUtilization, 100)}%` }}
            />
          </div>
          {isOverweight && (
            <p className="text-xs text-cyber-red mt-1 flex items-center gap-1">
              <AlertTriangle size={12} />
              Exceeds available capacity by {formatNumber(cargoWeight - availableForCargo)} kg
            </p>
          )}
        </div>
      </div>
      
      {/* Financial Summary */}
      <div className="cyber-card p-4">
        <h3 className="font-display text-cyber-yellow text-sm tracking-wider mb-3 flex items-center gap-2">
          <DollarSign size={16} />
          FINANCIAL SUMMARY
        </h3>
        
        <div className="space-y-3">
          {/* Fuel Cost */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Fuel Cost</span>
            <span className="font-mono text-orange-400">
              -${formatNumber(fuelCost, 2)}
            </span>
          </div>
          
          {/* Cargo Revenue */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Cargo Revenue</span>
            <span className="font-mono text-cyber-green">
              +${formatNumber(cargoRevenue, 2)}
            </span>
          </div>
          
          <div className="border-t border-gray-700 pt-2">
            {/* Profit/Loss */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-white font-semibold">Net Profit/Loss</span>
              <div className="flex items-center gap-2">
                {isProfitable ? (
                  <TrendingUp size={16} className="text-cyber-green" />
                ) : (
                  <TrendingDown size={16} className="text-cyber-red" />
                )}
                <span className={cn(
                  "font-mono font-bold text-lg",
                  isProfitable ? "text-cyber-green" : "text-cyber-red"
                )}>
                  {isProfitable ? "+" : ""}${formatNumber(profitLoss, 2)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Break-even Info */}
          <div className="mt-3 p-2 bg-cyber-bg/50 rounded border border-cyber-cyan/20">
            <p className="text-xs text-gray-400 mb-1">Break-even cargo weight:</p>
            <p className="font-mono text-cyber-cyan">
              {formatNumber(breakEvenCargo, 0)} kg
            </p>
            {!aboveBreakEven && (
              <p className="text-xs text-cyber-yellow mt-1">
                ⚠ Need {formatNumber(breakEvenCargo - cargoWeight, 0)} kg more cargo to break even
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Recommendations */}
      {!isProfitable && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="cyber-card p-4 border-cyber-red/30"
        >
          <h3 className="font-display text-cyber-red text-sm tracking-wider mb-2 flex items-center gap-2">
            <AlertTriangle size={16} />
            OPTIMIZATION ALERT
          </h3>
          <p className="text-sm text-gray-400 mb-2">
            This flight configuration results in a <span className="text-cyber-red font-semibold">loss</span>.
          </p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• Increase cargo weight to at least {formatNumber(breakEvenCargo, 0)} kg</li>
            <li>• Or reduce fuel if route allows</li>
            <li>• Consider higher-value cargo (current: ${flight.cargo_price_per_kg}/kg)</li>
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
}

