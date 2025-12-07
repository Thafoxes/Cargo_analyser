"use client";

import { motion } from "framer-motion";
import { Plane, MapPin, Package, Weight } from "lucide-react";
import { FlightData } from "@/lib/types";
import { formatNumber, formatDate } from "@/lib/utils";

interface FlightSelectorProps {
  flights: FlightData[];
  selectedFlight: FlightData | null;
  onSelectFlight: (flight: FlightData | null) => void;
}

export default function FlightSelector({
  flights,
  selectedFlight,
  onSelectFlight,
}: FlightSelectorProps) {
  // Get unique flights by flight_number + date combination
  const uniqueFlights = flights.reduce((acc, flight) => {
    const key = `${flight.flight_number}-${flight.flight_date}`;
    const existing = acc.find((f) => `${f.flight_number}-${f.flight_date}` === key);
    if (!existing) {
      acc.push(flight);
    }
    return acc;
  }, [] as FlightData[]);

  // Create a unique key for the selected flight
  const selectedKey = selectedFlight 
    ? `${selectedFlight.flight_number}-${selectedFlight.flight_date}` 
    : "";

  return (
    <div className="cyber-card p-4">
      <h3 className="font-display text-cyber-cyan text-sm tracking-wider mb-3 flex items-center gap-2">
        <Plane size={16} />
        SELECT FLIGHT
      </h3>

      <select
        value={selectedKey}
        onChange={(e) => {
          const [flightNum, ...dateParts] = e.target.value.split("-");
          const flightDate = dateParts.join("-"); // Rejoin date parts (YYYY-MM-DD)
          const flight = flights.find((f) => 
            f.flight_number === flightNum && f.flight_date === flightDate
          );
          onSelectFlight(flight || null);
        }}
        className="cyber-select w-full text-sm mb-4"
      >
        <option value="">-- Select a flight --</option>
        {uniqueFlights.map((flight) => {
          const key = `${flight.flight_number}-${flight.flight_date}`;
          return (
            <option key={key} value={key}>
              {flight.flight_number} | {flight.origin} → {flight.destination} | {flight.aircraft_type}
            </option>
          );
        })}
      </select>

      {/* Flight Summary */}
      {selectedFlight && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {/* Aircraft Info */}
          <div className="bg-cyber-bg/50 border border-cyber-cyan/20 rounded p-3">
            <div className="flex items-center gap-2 mb-2">
              <Plane size={14} className="text-cyber-cyan" />
              <span className="font-display text-white text-sm">
                {selectedFlight.aircraft_type}
              </span>
            </div>
            <div className="text-xs text-gray-500 font-mono">
              Tail: {selectedFlight.tail_number}
            </div>
          </div>

          {/* Route */}
          <div className="bg-cyber-bg/50 border border-cyber-magenta/20 rounded p-3">
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={14} className="text-cyber-magenta" />
              <span className="font-display text-white text-sm">ROUTE</span>
            </div>
            <div className="flex items-center gap-2 text-lg">
              <span className="text-cyber-cyan font-display">{selectedFlight.origin}</span>
              <span className="text-gray-500">→</span>
              <span className="text-cyber-magenta font-display">{selectedFlight.destination}</span>
            </div>
            <div className="text-xs text-gray-500 font-mono mt-1">
              {formatDate(selectedFlight.flight_date)}
            </div>
          </div>

          {/* Cargo Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-cyber-bg/50 border border-cyber-green/20 rounded p-3">
              <div className="flex items-center gap-1 mb-1">
                <Weight size={12} className="text-cyber-green" />
                <span className="text-xs text-gray-500">WEIGHT</span>
              </div>
              <div className="font-display text-cyber-green text-lg">
                {formatNumber(selectedFlight.gross_weight_cargo_kg)} kg
              </div>
            </div>
            <div className="bg-cyber-bg/50 border border-cyber-yellow/20 rounded p-3">
              <div className="flex items-center gap-1 mb-1">
                <Package size={12} className="text-cyber-yellow" />
                <span className="text-xs text-gray-500">VOLUME</span>
              </div>
              <div className="font-display text-cyber-yellow text-lg">
                {formatNumber(selectedFlight.gross_volume_cargo_m3)} m³
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-xs text-gray-500 font-mono space-y-1">
            <p>Passengers: {selectedFlight.passenger_count}</p>
            <p>Baggage: {formatNumber(selectedFlight.baggage_weight_kg)} kg</p>
            <p>Fuel: {formatNumber(selectedFlight.fuel_weight_kg)} kg</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

