import { NextResponse } from "next/server";
import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai";
import { KNOWLEDGE_BASE } from "@/lib/stadiumData";

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (typeof body !== "object" || body === null || !("message" in body)) {
      return NextResponse.json({ error: "Invalid request payload structure" }, { status: 400 });
    }

    const message = body.message;

    if (typeof message !== "string") {
      return NextResponse.json({ error: "Message must be a string" }, { status: 400 });
    }

    const trimmedMessage = message.trim();

    if (trimmedMessage.length === 0) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    if (trimmedMessage.length > 1000) {
      return NextResponse.json({ error: "Message exceeds maximum length of 1000 characters" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Fallback if API key is not configured yet
      return NextResponse.json({
        text: "⚠️ **Demo Mode**: The live Gemini API key is not configured. Please add `GEMINI_API_KEY` to your `.env.local` file.\n\nHere is a local knowledge lookup:\n" + 
              "• Prepaid parking passes are required for MetLife Stadium lots.\n" +
              "• Sensory bags can be requested at Guest Services booths in Sections 124 and 315.",
        detectedLanguage: "Demo / Simulation Mode",
        suggestedAction: { label: "Verify Setup", action: "accessibility" }
      });
    }

    // Initialize Google GenAI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: `You are ArenaSync AI Companion, a helpful and polite virtual assistant for the FIFA World Cup 2026 at MetLife Stadium.
Your goal is to assist fans, visitors, and volunteers.

You must answer accurately based on the official knowledge base below. If the information is not in the knowledge base, advise the user to contact stadium staff or visit Guest Services at Section 124.
Keep responses concise, welcoming, and directly helpful.

Here is the official stadium knowledge base:
${JSON.stringify(KNOWLEDGE_BASE, null, 2)}

Provide responses in the same language the user writes in (e.g. Spanish, French, Portuguese, German, Arabic, or English).`,
    });

    // Define schema for structured JSON output
    const responseSchema: Schema = {
      type: SchemaType.OBJECT,
      properties: {
        text: {
          type: SchemaType.STRING,
          description: "The helpful response text tailored to the user's query and written in their language.",
        },
        detectedLanguage: {
          type: SchemaType.STRING,
          description: "The detected language name, e.g. 'Español (Spanish)', 'Français (French)', 'English'.",
        },
        suggestedAction: {
          type: SchemaType.OBJECT,
          description: "Optional action shortcut button to display based on the context.",
          properties: {
            label: {
              type: SchemaType.STRING,
              description: "Button label, e.g. 'Open Transit Planner', 'Check Accessibility Routes'.",
            },
            action: {
              type: SchemaType.STRING,
              description: "Action type: 'transportation' for travel/parking questions, or 'accessibility' for ADA/sensory questions.",
            },
          },
          required: ["label", "action"],
        },
      },
      required: ["text", "detectedLanguage"],
    };

    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: trimmedMessage }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2,
      },
    });

    const responseText = response.response.text();
    const result = JSON.parse(responseText);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in /api/chat:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to process chat response", details: errorMessage },
      { status: 500 }
    );
  }
}
