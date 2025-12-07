import Papa from "papaparse";
import { FlightData, AircraftType } from "./types";

interface RawFlightData {
  flight_number: string;
  flight_date: string;
  origin: string;
  destination: string;
  tail_number: string;
  aircraft_type: string;
  gross_weight_cargo_kg: string;
  gross_volume_cargo_m3: string;
  passenger_count: string;
  baggage_weight_kg: string;
  fuel_weight_kg: string;
  fuel_price_per_kg: string;
  cargo_price_per_kg: string;
}

export function parseCSV(csvContent: string): Promise<FlightData[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<RawFlightData>(csvContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const flights: FlightData[] = results.data.map((row) => ({
            flight_number: row.flight_number,
            flight_date: row.flight_date,
            origin: row.origin,
            destination: row.destination,
            tail_number: row.tail_number,
            aircraft_type: row.aircraft_type as AircraftType,
            gross_weight_cargo_kg: parseFloat(row.gross_weight_cargo_kg) || 0,
            gross_volume_cargo_m3: parseFloat(row.gross_volume_cargo_m3) || 0,
            passenger_count: parseInt(row.passenger_count) || 0,
            baggage_weight_kg: parseFloat(row.baggage_weight_kg) || 0,
            fuel_weight_kg: parseFloat(row.fuel_weight_kg) || 0,
            fuel_price_per_kg: parseFloat(row.fuel_price_per_kg) || 0,
            cargo_price_per_kg: parseFloat(row.cargo_price_per_kg) || 0,
          }));
          resolve(flights);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

export async function loadCSVFromFile(file: File): Promise<FlightData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const flights = await parseCSV(content);
        resolve(flights);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

