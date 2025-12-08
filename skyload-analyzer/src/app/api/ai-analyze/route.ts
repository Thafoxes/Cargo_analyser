import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { AIAnalysisRequest, CARGO_HOLD_SPECS, ULD_TYPES } from "@/lib/cargo-types";
import { AIRCRAFT_3D_MODELS } from "@/lib/aircraft-models";

// Lazy initialization - only create client when API key exists
function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Anthropic({ apiKey });
}

export async function POST(request: NextRequest) {
  try {
    const body: AIAnalysisRequest = await request.json();

    const cargoHold = CARGO_HOLD_SPECS[body.aircraftType] || CARGO_HOLD_SPECS["Boeing 737-800"];
    const aircraft3D = AIRCRAFT_3D_MODELS[body.aircraftType] || AIRCRAFT_3D_MODELS["Boeing 737-800"];

    // Get section positions for the AI
    const sectionInfo = aircraft3D.sections.map(s => ({
      id: s.id,
      name: s.name,
      position: s.position,
      dimensions: s.dimensions,
      maxWeight: s.maxWeight
    }));

    const systemPrompt = `You are an expert cargo loading optimization AI for aircraft. Your role is to analyze flight cargo data and provide optimal cargo placement suggestions with 3D coordinates.

You have access to these ULD (Unit Load Device) container types:
${JSON.stringify(ULD_TYPES, null, 2)}

The aircraft cargo hold specifications for ${body.aircraftType}:
${JSON.stringify(cargoHold, null, 2)}

3D Section positions for visualization:
${JSON.stringify(sectionInfo, null, 2)}

CRITICAL POSITIONING RULES:
- Use the EXACT section positions provided above for z coordinates
- Y position should be around -0.3 (inside cargo hold floor level)
- X position should spread containers within section width (e.g., -0.6, 0, 0.6 for 3 containers in a row)
- Container dimensions: width ~1.2-1.5m, height ~0.8-1.0m, depth ~1.2-1.5m

When analyzing cargo placement:
1. Split the total cargo weight into ${aircraft3D.sections.length >= 3 ? '8-12' : '4-8'} realistic ULD containers
2. Each container should be 400-2500kg depending on type
3. Distribute containers across ALL sections for balance
4. Place heavier containers near center sections
5. Mark containers as "placed: true" if they fit, "placed: false" if overflow
6. Space containers within each section (don't stack all at same position)

IMPORTANT: Generate MULTIPLE containers with DIFFERENT positions. Spread them across the cargo hold.

Respond with a JSON object in this exact format:
{
  "containers": [
    {
      "id": "CNT-001",
      "name": "LD3 Container #1",
      "weight": 850,
      "volume": 4.2,
      "width": 1.3,
      "height": 0.9,
      "depth": 1.3,
      "section": "fwd",
      "placed": true,
      "position": { "x": -0.5, "y": -0.3, "z": -3.0 }
    },
    {
      "id": "CNT-002",
      "name": "LD3 Container #2",
      "weight": 920,
      "volume": 4.2,
      "width": 1.3,
      "height": 0.9,
      "depth": 1.3,
      "section": "fwd",
      "placed": true,
      "position": { "x": 0.5, "y": -0.3, "z": -3.0 }
    }
  ],
  "balanceScore": 85,
  "suggestions": ["Place heavy cargo in forward hold first", "Use LD3 containers for optimal space usage"],
  "warnings": ["Weight distribution slightly forward-heavy"],
  "analysis": "Detailed analysis of the cargo placement...",
  "recommendations": ["Consider redistributing 200kg to aft section", "Volume utilization can be improved by 15%"],
  "efficiency": {
    "current": 75,
    "optimized": 92,
    "improvement": 17
  }
}`;

    const userPrompt = `Analyze this flight and provide optimal cargo placement:

Flight: ${body.flightNumber}
Route: ${body.origin} → ${body.destination}
Aircraft: ${body.aircraftType}
Cargo Weight: ${body.cargoWeight} kg
Cargo Volume: ${body.cargoVolume} m³
Passengers: ${body.passengerCount}
Baggage: ${body.baggageWeight} kg

Maximum cargo capacity: ${cargoHold.maxWeight} kg
Available volume: ${cargoHold.width * cargoHold.height * cargoHold.depth} m³
Number of sections: ${cargoHold.sections.length}

Please generate a realistic cargo distribution using standard ULD containers and provide placement coordinates within the cargo hold dimensions. Calculate the weight distribution across sections and provide a balance score.`;

    // Check if AI is available
    const client = getAnthropicClient();
    
    let aiResponse;
    
    if (client) {
      // Use AI for analysis
      try {
        const response = await client.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          messages: [
            {
              role: "user",
              content: userPrompt,
            },
          ],
          system: systemPrompt,
        });

        // Extract the text content from the response
        const textContent = response.content.find((block) => block.type === "text");
        if (!textContent || textContent.type !== "text") {
          throw new Error("No text response from AI");
        }

        // Parse the JSON from the response
        const jsonMatch = (textContent.text.match(/\{[\s\S]*\}/) ?? [])[0] ?? "";
        if (jsonMatch) {
          aiResponse = JSON.parse(jsonMatch);
        } else {
          throw new Error("No JSON found in response");
        }
      } catch (aiError) {
        console.log("AI analysis failed, using fallback:", aiError);
        aiResponse = null;
      }
    } else {
      console.log("No API key configured - using fallback analysis");
      aiResponse = null;
    }

    // Use fallback if AI didn't work
    if (!aiResponse) {
      aiResponse = {
        containers: [],
        balanceScore: 75,
        suggestions: ["Distribute cargo evenly across sections", "Place heavy items near center of gravity"],
        warnings: body.cargoWeight > cargoHold.maxWeight ? ["Cargo weight exceeds capacity"] : [],
        analysis: "Fallback analysis - cargo distributed based on weight optimization",
        recommendations: ["Consider using LD3 containers for optimal space usage"],
        efficiency: {
          current: (body.cargoWeight / cargoHold.maxWeight) * 100,
          optimized: Math.min((body.cargoWeight / cargoHold.maxWeight) * 100 + 15, 95),
          improvement: 15,
        },
      };
    }

    // Generate fallback containers if AI didn't return enough
    const generateFallbackContainers = () => {
      const containers = [];
      const totalWeight = body.cargoWeight;
      const sections = aircraft3D.sections;
      const containerCount = sections.length >= 3 ? 10 : 6;
      const weightPerContainer = Math.floor(totalWeight / containerCount);
      
      let containerIndex = 0;
      for (const section of sections) {
        const containersInSection = Math.ceil(containerCount / sections.length);
        for (let i = 0; i < containersInSection && containerIndex < containerCount; i++) {
          const xOffset = (i % 2 === 0 ? -0.5 : 0.5);
          const zOffset = Math.floor(i / 2) * 0.8;
          containers.push({
            id: `CNT-${String(containerIndex + 1).padStart(3, '0')}`,
            name: `LD3 Container #${containerIndex + 1}`,
            weight: weightPerContainer + Math.floor(Math.random() * 200) - 100,
            volume: 4.2,
            width: 1.2,
            height: 0.85,
            depth: 1.2,
            section: section.id,
            placed: true,
            position: {
              x: section.position.x + xOffset,
              y: section.position.y + 0.1,
              z: section.position.z + zOffset - (section.dimensions.depth / 4)
            }
          });
          containerIndex++;
        }
      }
      return containers;
    };

    // Process containers with positions
    let containers = (aiResponse.containers || []).map((c: {
      id: string;
      name: string;
      weight: number;
      volume: number;
      width: number;
      height: number;
      depth: number;
      section: string;
      placed: boolean;
      position: { x: number; y: number; z: number };
    }, index: number) => ({
      id: c.id || `CNT-${String(index + 1).padStart(3, '0')}`,
      name: c.name || `Container #${index + 1}`,
      weight: c.weight || 500,
      volume: c.volume || 3,
      width: c.width || 1.2,
      height: c.height || 0.85,
      depth: c.depth || 1.2,
      section: c.section || 'fwd',
      placed: c.placed !== false,
      position: c.position || { x: 0, y: -0.3, z: aircraft3D.sections[index % aircraft3D.sections.length].position.z }
    }));

    // If no containers or only 1, generate fallback
    if (containers.length < 2) {
      console.log("Generating fallback containers");
      containers = generateFallbackContainers();
    }

    // Add flight info to response
    const placementResponse = {
      placement: {
        flightNumber: body.flightNumber,
        aircraftType: body.aircraftType,
        containers: containers,
        totalWeight: body.cargoWeight,
        totalVolume: body.cargoVolume,
        weightUtilization: (body.cargoWeight / cargoHold.maxWeight) * 100,
        volumeUtilization: (body.cargoVolume / (cargoHold.width * cargoHold.height * cargoHold.depth)) * 100,
        balanceScore: aiResponse.balanceScore || 70,
        suggestions: aiResponse.suggestions || [],
        warnings: aiResponse.warnings || [],
      },
      analysis: aiResponse.analysis || "Analysis completed",
      recommendations: aiResponse.recommendations || [],
      efficiency: aiResponse.efficiency || {
        current: (body.cargoWeight / cargoHold.maxWeight) * 100,
        optimized: 85,
        improvement: 10,
      },
    };

    return NextResponse.json(placementResponse);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to analyze cargo" },
      { status: 500 }
    );
  }
}

