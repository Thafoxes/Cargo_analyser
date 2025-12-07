// 3D Aircraft Model Definitions for Cargo Hold Visualization

export interface CargoHold3D {
  aircraftType: string;
  fuselageLength: number;
  fuselageWidth: number;
  fuselageHeight: number;
  sections: CargoSection3D[];
}

export interface CargoSection3D {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  dimensions: { width: number; height: number; depth: number };
  maxWeight: number;
  color: string;
}

// Scale factor for 3D visualization
export const SCALE_FACTOR = 0.4;

// Aircraft 3D specifications (dimensions in meters)
export const AIRCRAFT_3D_MODELS: Record<string, CargoHold3D> = {
  "Boeing 737-800": {
    aircraftType: "Boeing 737-800",
    fuselageLength: 6,
    fuselageWidth: 2.8,
    fuselageHeight: 1.6,
    sections: [
      {
        id: "fwd",
        name: "Forward Hold",
        position: { x: 0, y: -0.4, z: -1.2 },
        dimensions: { width: 2.4, height: 0.8, depth: 2.0 },
        maxWeight: 900,
        color: "#00fff5",
      },
      {
        id: "aft",
        name: "Aft Hold",
        position: { x: 0, y: -0.4, z: 1.5 },
        dimensions: { width: 2.4, height: 0.8, depth: 2.2 },
        maxWeight: 1100,
        color: "#ff00ff",
      },
    ],
  },
  "Boeing 737-900ER": {
    aircraftType: "Boeing 737-900ER",
    fuselageLength: 7,
    fuselageWidth: 2.8,
    fuselageHeight: 1.6,
    sections: [
      {
        id: "fwd",
        name: "Forward Hold",
        position: { x: 0, y: -0.4, z: -1.5 },
        dimensions: { width: 2.4, height: 0.8, depth: 2.2 },
        maxWeight: 1000,
        color: "#00fff5",
      },
      {
        id: "aft",
        name: "Aft Hold",
        position: { x: 0, y: -0.4, z: 1.8 },
        dimensions: { width: 2.4, height: 0.8, depth: 2.5 },
        maxWeight: 1500,
        color: "#ff00ff",
      },
    ],
  },
  "Airbus A330-200": {
    aircraftType: "Airbus A330-200",
    fuselageLength: 10,
    fuselageWidth: 4.0,
    fuselageHeight: 2.0,
    sections: [
      {
        id: "fwd",
        name: "Forward Hold",
        position: { x: 0, y: -0.5, z: -3.0 },
        dimensions: { width: 3.5, height: 1.0, depth: 2.8 },
        maxWeight: 6000,
        color: "#00fff5",
      },
      {
        id: "mid",
        name: "Middle Hold",
        position: { x: 0, y: -0.5, z: 0 },
        dimensions: { width: 3.5, height: 1.0, depth: 2.4 },
        maxWeight: 4000,
        color: "#39ff14",
      },
      {
        id: "aft",
        name: "Aft Hold",
        position: { x: 0, y: -0.5, z: 3.0 },
        dimensions: { width: 3.5, height: 1.0, depth: 2.8 },
        maxWeight: 5000,
        color: "#ff00ff",
      },
    ],
  },
  "Airbus A330-300": {
    aircraftType: "Airbus A330-300",
    fuselageLength: 12,
    fuselageWidth: 4.0,
    fuselageHeight: 2.0,
    sections: [
      {
        id: "fwd",
        name: "Forward Hold",
        position: { x: 0, y: -0.5, z: -3.5 },
        dimensions: { width: 3.5, height: 1.0, depth: 3.0 },
        maxWeight: 7000,
        color: "#00fff5",
      },
      {
        id: "mid",
        name: "Middle Hold",
        position: { x: 0, y: -0.5, z: 0 },
        dimensions: { width: 3.5, height: 1.0, depth: 3.0 },
        maxWeight: 5000,
        color: "#39ff14",
      },
      {
        id: "aft",
        name: "Aft Hold",
        position: { x: 0, y: -0.5, z: 3.5 },
        dimensions: { width: 3.5, height: 1.0, depth: 3.0 },
        maxWeight: 6000,
        color: "#ff00ff",
      },
    ],
  },
};

// Container color based on weight
export function getContainerColor(weight: number): string {
  if (weight < 500) return "#39ff14"; // Green - Light
  if (weight < 1500) return "#ffd700"; // Yellow - Medium  
  if (weight < 2500) return "#ff8c00"; // Orange - Heavy
  return "#ff073a"; // Red - Very Heavy
}

// Generate default container positions for a section
export function generateContainerPositions(
  section: CargoSection3D,
  containerCount: number,
  containerWidth: number,
  containerDepth: number
): { x: number; y: number; z: number }[] {
  const positions: { x: number; y: number; z: number }[] = [];
  
  const availableWidth = section.dimensions.width - 0.2;
  const availableDepth = section.dimensions.depth - 0.2;
  
  const cols = Math.floor(availableWidth / containerWidth);
  const rows = Math.floor(availableDepth / containerDepth);
  
  let count = 0;
  for (let row = 0; row < rows && count < containerCount; row++) {
    for (let col = 0; col < cols && count < containerCount; col++) {
      const x = section.position.x - availableWidth / 2 + containerWidth / 2 + col * containerWidth;
      const z = section.position.z - availableDepth / 2 + containerDepth / 2 + row * containerDepth;
      positions.push({
        x,
        y: section.position.y + section.dimensions.height / 2 - 0.3,
        z
      });
      count++;
    }
  }
  
  return positions;
}
