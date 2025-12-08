import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { AIRCRAFT_3D_MODELS } from "@/lib/aircraft-models";
import { CARGO_HOLD_SPECS } from "@/lib/cargo-types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ContainerInput {
  id: string;
  name: string;
  weight: number;
  volume: number;
  width: number;
  height: number;
  depth: number;
  color: string;
}

interface PlacementRequest {
  flightNumber: string;
  aircraftType: string;
  containers: ContainerInput[];
}

export async function POST(request: NextRequest) {
  try {
    const body: PlacementRequest = await request.json();
    
    // Debug logging
    console.log("AI Place API - Received:", {
      flightNumber: body.flightNumber,
      aircraftType: body.aircraftType,
      containerCount: body.containers?.length,
      totalWeight: body.containers?.reduce((s, c) => s + c.weight, 0),
    });

    // Always use reliable grid-based placement for accurate 3D positioning
    // AI placement was causing overlaps due to imprecise coordinates
    console.log("Using grid-based placement for accurate positioning");
    return NextResponse.json(generateFallbackPlacement(body));

    const aircraft3D = AIRCRAFT_3D_MODELS[body.aircraftType] || AIRCRAFT_3D_MODELS["Boeing 737-800"];
    const cargoHold = CARGO_HOLD_SPECS[body.aircraftType] || CARGO_HOLD_SPECS["Boeing 737-800"];

    const sectionInfo = aircraft3D.sections.map(s => ({
      id: s.id,
      name: s.name,
      position: s.position,
      dimensions: s.dimensions,
      maxWeight: s.maxWeight
    }));

    // Build container list with explicit IDs
    const containerList = body.containers.map((c, i) => ({
      index: i,
      id: c.id,
      name: c.name,
      weight: c.weight,
      volume: c.volume
    }));

    const totalWeight = body.containers.reduce((s, c) => s + c.weight, 0);
    const hasCapacity = totalWeight <= cargoHold.maxWeight;

    const systemPrompt = `You are an expert cargo loading AI. Place containers into aircraft cargo hold.

Aircraft: ${body.aircraftType}
Total Cargo Hold Capacity: ${cargoHold.maxWeight}kg
Total Containers Weight: ${totalWeight}kg
Fits in hold: ${hasCapacity ? "YES" : "NO - some will overflow"}

Cargo Sections:
${JSON.stringify(sectionInfo, null, 2)}

Containers to place (use EXACT IDs from this list):
${JSON.stringify(containerList, null, 2)}

IMPORTANT RULES:
1. Use the EXACT container IDs from the list above
2. ${hasCapacity ? "ALL containers should fit - mark ALL as placed:true" : "Mark containers that fit as placed:true, overflow as placed:false"}
3. Distribute weight evenly between sections
4. Position containers at different x/z coordinates within each section

Respond with ONLY valid JSON:
{
  "placements": [
    {"containerId": "exact-id-from-list", "section": "fwd", "placed": true, "position": {"x": -0.3, "y": 0.2, "z": -1.5}}
  ],
  "balanceScore": 85,
  "forwardWeight": 2500,
  "aftWeight": 2300,
  "suggestions": ["Suggestion"],
  "warnings": []
}`;

    const userPrompt = `Place these containers. Total weight ${totalWeight}kg fits in ${cargoHold.maxWeight}kg capacity.
Return JSON with placements array using the exact container IDs provided.`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [{ role: "user", content: userPrompt }],
      system: systemPrompt,
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock) {
      return NextResponse.json(generateFallbackPlacement(body));
    }

    // Type assertion: find() filtered for type === "text", so if it exists, it's a text block
    const textContent = textBlock as { type: "text"; text: string };

    let aiResponse;
    try {
      const jsonString = (textContent.text.match(/\{[\s\S]*\}/) ?? [])[0] ?? "";
      if (!jsonString) {
        throw new Error("No JSON found");
      }
      aiResponse = JSON.parse(jsonString);
    } catch {
      return NextResponse.json(generateFallbackPlacement(body));
    }

    // Merge AI placements with container data
    const containers = body.containers.map((container, index) => {
      // Try to find by exact ID
      let placement = aiResponse.placements?.find(
        (p: { containerId: string }) => p.containerId === container.id
      );
      
      // If not found, try by index
      if (!placement && aiResponse.placements?.[index]) {
        placement = aiResponse.placements[index];
      }
      
      if (placement) {
        return {
          ...container,
          section: placement.section || "fwd",
          placed: placement.placed !== false,
          position: placement.position || { x: 0, y: 0.2, z: 0 },
        };
      }
      
      // Default placement if not found - still place it if capacity allows
      return {
        ...container,
        section: "fwd",
        placed: totalWeight <= cargoHold.maxWeight, // Place if total weight fits
        position: { x: (index % 2 === 0 ? -0.3 : 0.3), y: 0.2, z: -1.5 + index * 0.5 },
      };
    });

    // Check if AI returned useful placements
    const placedCount = containers.filter(c => c.placed).length;
    console.log("AI placement result:", { placedCount, total: containers.length });
    
    // If AI didn't place anything but capacity allows, use fallback
    if (placedCount === 0 && totalWeight <= cargoHold.maxWeight) {
      console.log("AI placed nothing - using fallback");
      return NextResponse.json(generateFallbackPlacement(body));
    }

    return NextResponse.json({
      containers,
      balanceScore: aiResponse.balanceScore || 70,
      forwardWeight: aiResponse.forwardWeight || 0,
      aftWeight: aiResponse.aftWeight || 0,
      suggestions: aiResponse.suggestions || [],
      warnings: aiResponse.warnings || [],
    });

  } catch (error) {
    console.error("AI Placement Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to place cargo" },
      { status: 500 }
    );
  }
}

// Fallback placement without AI - grid-based non-overlapping placement
function generateFallbackPlacement(body: PlacementRequest) {
  // Validate aircraft type - check if it exists in our models
  const validAircraftTypes = Object.keys(AIRCRAFT_3D_MODELS);
  const requestedType = body.aircraftType?.trim();
  
  // Find exact match or close match
  const matchedType = validAircraftTypes.find(t => t === requestedType) 
    || validAircraftTypes.find(t => t.toLowerCase() === requestedType?.toLowerCase())
    || "Boeing 737-800";
  
  const aircraft3D = AIRCRAFT_3D_MODELS[matchedType];
  const cargoHold = CARGO_HOLD_SPECS[matchedType] || CARGO_HOLD_SPECS["Boeing 737-800"];
  const sections = aircraft3D.sections;
  
  // Debug logging
  console.log("Fallback Placement:", {
    requestedAircraft: body.aircraftType,
    matchedAircraft: matchedType,
    maxWeight: cargoHold.maxWeight,
    sectionsCount: sections.length,
  });
  
  // Total capacity check
  const totalCargoWeight = body.containers.reduce((sum, c) => sum + c.weight, 0);
  const maxCapacity = cargoHold.maxWeight;
  
  console.log("Capacity check:", { totalCargoWeight, maxCapacity, fits: totalCargoWeight <= maxCapacity });
  
  let runningWeight = 0;
  
  // Track container placement positions per section
  const sectionContainerCounts: Record<string, number> = {};
  sections.forEach(s => {
    sectionContainerCounts[s.id] = 0;
  });
  
  // SCALE_FACTOR used in 3D rendering
  const SCALE = 0.4;
  
  const containers = body.containers.map((container, index) => {
    // Check if we still have capacity
    const wouldExceedTotal = runningWeight + container.weight > maxCapacity;
    
    if (wouldExceedTotal) {
      return {
        ...container,
        section: "overflow",
        placed: false,
        position: { x: 0, y: 0, z: 0 },
      };
    }
    
    // Distribute containers evenly across sections
    const sectionIndex = index % sections.length;
    const targetSection = sections[sectionIndex];
    
    // Get count of containers already in this section
    const countInSection = sectionContainerCounts[targetSection.id];
    
    // ==============================================
    // POSITION CALCULATION (in scaled 3D units)
    // ==============================================
    // The cargo hold wireframe is rendered at:
    //   - Section position × SCALE (0.4)
    //   - Example: FWD z=-2.0 becomes z=-0.8 in 3D
    //
    // Container positions should be in FINAL 3D coordinates
    // (not scaled again in rendering anymore)
    
    // Grid layout: 2 columns per section
    const maxCols = 2;
    const col = countInSection % maxCols;
    const row = Math.floor(countInSection / maxCols);
    
    // Slot size in 3D units (small enough to fit in cargo hold)
    const slotWidth = 0.35;  // Each slot ~0.35 units wide
    const slotDepth = 0.4;   // Each slot ~0.4 units deep
    const gap = 0.08;        // Small gap between containers
    
    // X position: centered in cargo hold, 2 columns
    // col=0 -> left (-0.2), col=1 -> right (+0.2)
    const xPos = (col - 0.5) * (slotWidth + gap);
    
    // Y position: slightly above cargo hold floor
    // Section y is typically -0.5, scaled to -0.2
    const yPos = targetSection.position.y * SCALE + 0.15;
    
    // Z position: section z + row offset
    // Section z is like -2.0 (FWD) or +2.0 (AFT), scaled to -0.8 or +0.8
    const sectionZ = targetSection.position.z * SCALE;
    const zPos = sectionZ + row * (slotDepth + gap);
    
    // Update tracking
    runningWeight += container.weight;
    sectionContainerCounts[targetSection.id]++;
    
    return {
      ...container,
      section: targetSection.id,
      placed: true,
      position: {
        x: xPos,
        y: yPos,
        z: zPos,
      },
    };
  });
  
  const placedContainers = containers.filter(c => c.placed);
  const totalPlacedWeight = placedContainers.reduce((s, c) => s + c.weight, 0);
  
  const forwardWeight = placedContainers
    .filter(c => c.section === "fwd")
    .reduce((s, c) => s + c.weight, 0);
  const aftWeight = placedContainers
    .filter(c => c.section === "aft")
    .reduce((s, c) => s + c.weight, 0);
  const midWeight = totalPlacedWeight - forwardWeight - aftWeight;
  
  // Calculate balance score
  const balanceRatio = totalPlacedWeight > 0 
    ? (forwardWeight + midWeight * 0.5) / totalPlacedWeight 
    : 0.5;
  const balanceScore = Math.round(100 - Math.abs(0.5 - balanceRatio) * 100);
  
  const overflowCount = containers.filter(c => !c.placed).length;
  
  return {
    containers,
    balanceScore: Math.max(50, balanceScore),
    forwardWeight,
    aftWeight,
    aircraftType: matchedType, // Return the aircraft type actually used
    maxCapacity: cargoHold.maxWeight, // Return max capacity for verification
    suggestions: [
      `${placedContainers.length} containers placed in ${matchedType}`,
      `Capacity: ${totalCargoWeight}kg / ${cargoHold.maxWeight}kg`,
      "Weight distributed across cargo sections",
    ],
    warnings: overflowCount > 0
      ? [`${overflowCount} container(s) exceed ${cargoHold.maxWeight}kg capacity`]
      : [],
  };
}

