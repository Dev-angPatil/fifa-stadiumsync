import { NextResponse } from "next/server";
import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai";

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const { gates, concessions, transits, incidents } = body;

    // Validate that required fields are present and are arrays
    if (!Array.isArray(gates) || !Array.isArray(concessions) || !Array.isArray(transits) || !Array.isArray(incidents)) {
      return NextResponse.json({ error: "Telemetry parameters must be arrays" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Return simulated fallback advice if API key is not configured
      return NextResponse.json({
        alerts: [
          "⚠️ API Key Missing: Live operations advice is in simulation mode.",
          "Crowd congestion surge at Gate B (22m wait time)."
        ],
        recommendations: [
          {
            title: "Dynamic Gate Rerouting",
            description: "Gate B is experiencing elevated queue delays. Newly arriving fans should be directed to Gate A or Gate D.",
            priority: "Medium",
            impactArea: "Gate Entry & Crowd Flow",
            suggestedAction: "Update the Fan App default route recommendation to prioritize Gate A (8m wait). Adjust digital signs on the west concourse."
          },
          {
            title: "Manage Recycle Overflows",
            description: "Recycle bins are overflowing at Concession Area Sec 128, violating FIFA's zero-waste standards.",
            priority: "Low",
            impactArea: "Sustainability",
            suggestedAction: "Dispatch Eco-Squad volunteers (Unit Green) to empty the bins and inspect sorting compliance."
          }
        ]
      });
    }

    // Initialize Google GenAI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: `You are the FIFA Venue Command Center AI Decision Advisor for MetLife Stadium during the FIFA World Cup 2026.
Your job is to analyze the stadium telemetry data (gates, concessions, transits, active incidents) and provide:
1. alerts: A list of active critical anomalies, bottlenecks, or safety concerns.
2. recommendations: A list of highly structured, tactical operational advice items to assist organizers, stewards, and volunteers in maintaining optimal crowd flow, safety, sustainability, and fan satisfaction.

Key Operational Thresholds:
- Gate queue wait time > 20 mins: Trigger rerouting advisory.
- Gate status is 'Delayed' or 'Closed': Critical priority staffing/technical incident.
- Concession stands queue wait time > 15 mins: Suggest opening additional registers or promoting nearby less busy stands.
- Active safety, medical, or crowd incidents: Suggest priority dispatch corridors, security clearance, and volunteer coordination.
- Transit delays: Recommend extending concession times to hold fans inside the stadium longer to buffer egress surges.

Provide advice that is precise, actionable, and specific to the names and sections of the stadium provided.`,
    });

    const prompt = `Current MetLife Stadium Live Telemetry Data:

GATES:
${JSON.stringify(gates, null, 2)}

CONCESSIONS:
${JSON.stringify(concessions, null, 2)}

TRANSITS:
${JSON.stringify(transits, null, 2)}

ACTIVE INCIDENTS:
${JSON.stringify(incidents, null, 2)}`;

    // Define response schema
    const responseSchema: Schema = {
      type: SchemaType.OBJECT,
      properties: {
        alerts: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.STRING,
          },
          description: "List of highly critical, active, or noteworthy alerts/anomalies in the stadium logistics.",
        },
        recommendations: {
          type: SchemaType.ARRAY,
          description: "List of actionable operational recommendations.",
          items: {
            type: SchemaType.OBJECT,
            properties: {
              title: {
                type: SchemaType.STRING,
                description: "Short concise title of the suggestion, e.g. 'Reroute Crowd from Gate C'",
              },
              description: {
                type: SchemaType.STRING,
                description: "Detailed description of the issue and why it needs attention.",
              },
              priority: {
                type: SchemaType.STRING,
                description: "Priority of the issue: Low, Medium, High, or Critical.",
              },
              impactArea: {
                type: SchemaType.STRING,
                description: "Sectors, gates, or logistics channels affected, e.g. 'Gate Entry', 'Sustainability', 'Public Transit'.",
              },
              suggestedAction: {
                type: SchemaType.STRING,
                description: "Actionable specific steps stadium organizers and volunteers should take to mitigate the issue.",
              },
            },
            required: ["title", "description", "priority", "impactArea", "suggestedAction"],
          },
        },
      },
      required: ["alerts", "recommendations"],
    };

    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.1,
      },
    });

    const responseText = response.response.text();
    const result = JSON.parse(responseText);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in /api/advice:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate operational advice", details: errorMessage },
      { status: 500 }
    );
  }
}
