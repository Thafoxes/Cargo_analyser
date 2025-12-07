// Cargo container types for placement visualization
export interface CargoContainer {
  id: string;
  name: string;
  weight: number; // kg
  volume: number; // m³
  width: number; // meters
  height: number; // meters
  depth: number; // meters
  priority: "high" | "medium" | "low";
  fragile: boolean;
  color?: string;
}

export interface CargoPosition {
  containerId: string;
  x: number; // position in cargo hold
  y: number;
  z: number;
  rotation: number; // degrees
}

export interface CargoHold {
  aircraftType: string;
  width: number; // meters
  height: number; // meters
  depth: number; // meters
  maxWeight: number; // kg
  sections: CargoSection[];
}

export interface CargoSection {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  maxWeight: number;
}

export interface PlacementSuggestion {
  flightNumber: string;
  aircraftType: string;
  containers: CargoContainer[];
  positions: CargoPosition[];
  totalWeight: number;
  totalVolume: number;
  weightUtilization: number;
  volumeUtilization: number;
  balanceScore: number; // 0-100, higher is better balanced
  suggestions: string[];
  warnings: string[];
}

export interface AIAnalysisRequest {
  flightNumber: string;
  aircraftType: string;
  cargoWeight: number;
  cargoVolume: number;
  passengerCount: number;
  baggageWeight: number;
  origin: string;
  destination: string;
}

export interface AIAnalysisResponse {
  placement: PlacementSuggestion;
  analysis: string;
  recommendations: string[];
  efficiency: {
    current: number;
    optimized: number;
    improvement: number;
  };
}

// Aircraft cargo hold specifications
export const CARGO_HOLD_SPECS: Record<string, CargoHold> = {
  "Boeing 737-800": {
    aircraftType: "Boeing 737-800",
    width: 3.5,
    height: 1.2,
    depth: 8.0,
    maxWeight: 2000,
    sections: [
      { id: "fwd", name: "Forward Hold", x: 0, y: 0, z: 0, width: 3.5, height: 1.2, depth: 3.5, maxWeight: 900 },
      { id: "aft", name: "Aft Hold", x: 0, y: 0, z: 4.5, width: 3.5, height: 1.2, depth: 3.5, maxWeight: 1100 },
    ],
  },
  "Boeing 737-900ER": {
    aircraftType: "Boeing 737-900ER",
    width: 3.5,
    height: 1.2,
    depth: 10.0,
    maxWeight: 2500,
    sections: [
      { id: "fwd", name: "Forward Hold", x: 0, y: 0, z: 0, width: 3.5, height: 1.2, depth: 4.0, maxWeight: 1000 },
      { id: "aft", name: "Aft Hold", x: 0, y: 0, z: 5.0, width: 3.5, height: 1.2, depth: 5.0, maxWeight: 1500 },
    ],
  },
  "Airbus A330-200": {
    aircraftType: "Airbus A330-200",
    width: 5.3,
    height: 1.7,
    depth: 20.0,
    maxWeight: 15000,
    sections: [
      { id: "fwd", name: "Forward Hold", x: 0, y: 0, z: 0, width: 5.3, height: 1.7, depth: 8.0, maxWeight: 6000 },
      { id: "mid", name: "Middle Hold", x: 0, y: 0, z: 8.5, width: 5.3, height: 1.7, depth: 5.0, maxWeight: 4000 },
      { id: "aft", name: "Aft Hold", x: 0, y: 0, z: 14.0, width: 5.3, height: 1.7, depth: 6.0, maxWeight: 5000 },
    ],
  },
  "Airbus A330-300": {
    aircraftType: "Airbus A330-300",
    width: 5.3,
    height: 1.7,
    depth: 24.0,
    maxWeight: 18000,
    sections: [
      { id: "fwd", name: "Forward Hold", x: 0, y: 0, z: 0, width: 5.3, height: 1.7, depth: 9.0, maxWeight: 7000 },
      { id: "mid", name: "Middle Hold", x: 0, y: 0, z: 9.5, width: 5.3, height: 1.7, depth: 7.0, maxWeight: 5000 },
      { id: "aft", name: "Aft Hold", x: 0, y: 0, z: 17.0, width: 5.3, height: 1.7, depth: 7.0, maxWeight: 6000 },
    ],
  },
};

// Standard ULD (Unit Load Device) container types
export const ULD_TYPES: CargoContainer[] = [
  { id: "LD3", name: "LD3 Container", weight: 0, volume: 4.5, width: 1.56, height: 1.14, depth: 1.53, priority: "medium", fragile: false, color: "#00fff5" },
  { id: "LD6", name: "LD6 Container", weight: 0, volume: 8.9, width: 3.18, height: 1.14, depth: 1.53, priority: "medium", fragile: false, color: "#ff00ff" },
  { id: "LD11", name: "LD11 Container", weight: 0, volume: 7.0, width: 3.18, height: 1.14, depth: 1.53, priority: "medium", fragile: false, color: "#39ff14" },
  { id: "PALLET", name: "Standard Pallet", weight: 0, volume: 10.0, width: 3.18, height: 1.5, depth: 2.44, priority: "medium", fragile: false, color: "#ffd700" },
];

