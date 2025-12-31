import { NextResponse } from "next/server";
import { listAvailableModels, checkModelAvailability } from "@/lib/gemini";

// GET /api/debug/models - List available Gemini models
export async function GET() {
  try {
    console.log("\n========================================");
    console.log("DEBUG: Listing available Gemini models");
    console.log("========================================\n");

    const models = await listAvailableModels();

    // Check which models support generateContent
    const modelsWithGenerateContent = models.filter(
      (model) => model.supportedGenerationMethods?.includes("generateContent")
    );

    // Extract model names without the "models/" prefix
    const availableModelNames = modelsWithGenerateContent.map((m) => {
      const name = m.name;
      return name.startsWith("models/") ? name.substring(7) : name;
    });

    // Also check specific models we might want to use
    const specificModels = [
      "gemini-2.0-flash",
      "gemini-1.5-flash",
      "gemini-1.5-flash-latest",
      "gemini-pro",
      "gemini-1.0-pro",
    ];

    const modelAvailability: Record<string, boolean> = {};
    for (const modelName of specificModels) {
      modelAvailability[modelName] = await checkModelAvailability(modelName);
    }

    return NextResponse.json({
      success: true,
      totalModels: models.length,
      modelsWithGenerateContent: modelsWithGenerateContent.length,
      availableModelNames,
      specificModelCheck: modelAvailability,
      allModels: models.map((m) => ({
        name: m.name,
        displayName: m.displayName,
        methods: m.supportedGenerationMethods,
      })),
    });
  } catch (error) {
    console.error("Error in debug/models route:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        hint: "Check server logs for more details",
      },
      { status: 500 }
    );
  }
}
