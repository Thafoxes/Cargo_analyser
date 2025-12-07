import {
  FlightData,
  WeightAnalysis,
  DashboardStats,
  AIRCRAFT_SPECS,
  RouteStats,
  AircraftStats,
  AircraftType,
} from "./types";
import { getStatusColor } from "./utils";

export function analyzeFlightWeight(flight: FlightData): WeightAnalysis {
  const specs = AIRCRAFT_SPECS[flight.aircraft_type];

  if (!specs) {
    // Default analysis if aircraft type not found
    return {
      flight,
      cargoWeightUtilization: 0,
      cargoVolumeUtilization: 0,
      isOverweight: false,
      isOverVolume: false,
      weightStatus: "safe",
      volumeStatus: "safe",
      cargoRevenue: flight.gross_weight_cargo_kg * flight.cargo_price_per_kg,
      fuelCost: flight.fuel_weight_kg * flight.fuel_price_per_kg,
      profitMargin: 0,
    };
  }

  const cargoWeightUtilization =
    (flight.gross_weight_cargo_kg / specs.maxCargoWeight) * 100;
  const cargoVolumeUtilization =
    (flight.gross_volume_cargo_m3 / specs.maxCargoVolume) * 100;

  const isOverweight = flight.gross_weight_cargo_kg > specs.maxCargoWeight;
  const isOverVolume = flight.gross_volume_cargo_m3 > specs.maxCargoVolume;

  const cargoRevenue = flight.gross_weight_cargo_kg * flight.cargo_price_per_kg;
  const fuelCost = flight.fuel_weight_kg * flight.fuel_price_per_kg;
  const profitMargin = cargoRevenue - fuelCost;

  return {
    flight,
    cargoWeightUtilization,
    cargoVolumeUtilization,
    isOverweight,
    isOverVolume,
    weightStatus: getStatusColor(cargoWeightUtilization),
    volumeStatus: getStatusColor(cargoVolumeUtilization),
    cargoRevenue,
    fuelCost,
    profitMargin,
  };
}

export function analyzeAllFlights(flights: FlightData[]): WeightAnalysis[] {
  return flights.map(analyzeFlightWeight);
}

export function calculateDashboardStats(
  analyses: WeightAnalysis[]
): DashboardStats {
  const totalFlights = analyses.length;

  if (totalFlights === 0) {
    return {
      totalFlights: 0,
      overweightCount: 0,
      overVolumeCount: 0,
      avgWeightUtilization: 0,
      avgVolumeUtilization: 0,
      totalCargoRevenue: 0,
      totalFuelCost: 0,
      routeBreakdown: [],
      aircraftBreakdown: [],
    };
  }

  const overweightCount = analyses.filter((a) => a.isOverweight).length;
  const overVolumeCount = analyses.filter((a) => a.isOverVolume).length;

  const avgWeightUtilization =
    analyses.reduce((sum, a) => sum + a.cargoWeightUtilization, 0) / totalFlights;
  const avgVolumeUtilization =
    analyses.reduce((sum, a) => sum + a.cargoVolumeUtilization, 0) / totalFlights;

  const totalCargoRevenue = analyses.reduce((sum, a) => sum + a.cargoRevenue, 0);
  const totalFuelCost = analyses.reduce((sum, a) => sum + a.fuelCost, 0);

  // Route breakdown
  const routeMap = new Map<string, WeightAnalysis[]>();
  analyses.forEach((a) => {
    const routeKey = `${a.flight.origin}-${a.flight.destination}`;
    if (!routeMap.has(routeKey)) {
      routeMap.set(routeKey, []);
    }
    routeMap.get(routeKey)!.push(a);
  });

  const routeBreakdown: RouteStats[] = Array.from(routeMap.entries()).map(
    ([route, routeAnalyses]) => {
      const [origin, destination] = route.split("-");
      return {
        origin,
        destination,
        flightCount: routeAnalyses.length,
        avgWeightUtilization:
          routeAnalyses.reduce((sum, a) => sum + a.cargoWeightUtilization, 0) /
          routeAnalyses.length,
        overweightCount: routeAnalyses.filter((a) => a.isOverweight).length,
      };
    }
  );

  // Aircraft breakdown
  const aircraftMap = new Map<AircraftType, WeightAnalysis[]>();
  analyses.forEach((a) => {
    const type = a.flight.aircraft_type;
    if (!aircraftMap.has(type)) {
      aircraftMap.set(type, []);
    }
    aircraftMap.get(type)!.push(a);
  });

  const aircraftBreakdown: AircraftStats[] = Array.from(
    aircraftMap.entries()
  ).map(([aircraftType, aircraftAnalyses]) => ({
    aircraftType,
    flightCount: aircraftAnalyses.length,
    avgWeightUtilization:
      aircraftAnalyses.reduce((sum, a) => sum + a.cargoWeightUtilization, 0) /
      aircraftAnalyses.length,
    avgVolumeUtilization:
      aircraftAnalyses.reduce((sum, a) => sum + a.cargoVolumeUtilization, 0) /
      aircraftAnalyses.length,
    overweightCount: aircraftAnalyses.filter((a) => a.isOverweight).length,
  }));

  return {
    totalFlights,
    overweightCount,
    overVolumeCount,
    avgWeightUtilization,
    avgVolumeUtilization,
    totalCargoRevenue,
    totalFuelCost,
    routeBreakdown,
    aircraftBreakdown,
  };
}

