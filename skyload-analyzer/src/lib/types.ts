// Flight data types based on CSV structure
export interface FlightData {
  flight_number: string;
  flight_date: string;
  origin: string;
  destination: string;
  tail_number: string;
  aircraft_type: AircraftType;
  gross_weight_cargo_kg: number;
  gross_volume_cargo_m3: number;
  passenger_count: number;
  baggage_weight_kg: number;
  fuel_weight_kg: number;
  fuel_price_per_kg: number;
  cargo_price_per_kg: number;
}

export type AircraftType = 
  | "Boeing 737-800"
  | "Boeing 737-900ER"
  | "Airbus A330-200"
  | "Airbus A330-300";

// Aircraft specifications for overweight detection
export interface AircraftSpecs {
  type: AircraftType;
  maxCargoWeight: number; // kg
  maxCargoVolume: number; // m³
  maxTotalPayload: number; // kg (passengers + baggage + cargo)
  maxFuel: number; // kg
}

export const AIRCRAFT_SPECS: Record<AircraftType, AircraftSpecs> = {
  "Boeing 737-800": {
    type: "Boeing 737-800",
    maxCargoWeight: 2000,
    maxCargoVolume: 45,
    maxTotalPayload: 20000,
    maxFuel: 21000,
  },
  "Boeing 737-900ER": {
    type: "Boeing 737-900ER",
    maxCargoWeight: 2500,
    maxCargoVolume: 52,
    maxTotalPayload: 23000,
    maxFuel: 24000,
  },
  "Airbus A330-200": {
    type: "Airbus A330-200",
    maxCargoWeight: 15000,
    maxCargoVolume: 120,
    maxTotalPayload: 45000,
    maxFuel: 140000,
  },
  "Airbus A330-300": {
    type: "Airbus A330-300",
    maxCargoWeight: 18000,
    maxCargoVolume: 140,
    maxTotalPayload: 52000,
    maxFuel: 140000,
  },
};

// Analysis result types
export interface WeightAnalysis {
  flight: FlightData;
  cargoWeightUtilization: number; // percentage
  cargoVolumeUtilization: number; // percentage
  isOverweight: boolean;
  isOverVolume: boolean;
  weightStatus: "safe" | "warning" | "danger";
  volumeStatus: "safe" | "warning" | "danger";
  cargoRevenue: number;
  fuelCost: number;
  profitMargin: number;
}

// Dashboard statistics
export interface DashboardStats {
  totalFlights: number;
  overweightCount: number;
  overVolumeCount: number;
  avgWeightUtilization: number;
  avgVolumeUtilization: number;
  totalCargoRevenue: number;
  totalFuelCost: number;
  routeBreakdown: RouteStats[];
  aircraftBreakdown: AircraftStats[];
}

export interface RouteStats {
  origin: string;
  destination: string;
  flightCount: number;
  avgWeightUtilization: number;
  overweightCount: number;
}

export interface AircraftStats {
  aircraftType: AircraftType;
  flightCount: number;
  avgWeightUtilization: number;
  avgVolumeUtilization: number;
  overweightCount: number;
}

// Filter options
export interface FilterOptions {
  dateRange: {
    start: string;
    end: string;
  };
  aircraftTypes: AircraftType[];
  routes: string[];
  statusFilter: "all" | "overweight" | "safe";
}

