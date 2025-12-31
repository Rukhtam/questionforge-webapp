import { GoogleGenerativeAI } from "@google/generative-ai";
import type { QuestionType, Difficulty } from "@prisma/client";

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set. AI question generation will not work.");
} else {
  console.log("Gemini API Key configured:", apiKey.substring(0, 8) + "..." + apiKey.substring(apiKey.length - 4));
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Interface for model info
interface ModelInfo {
  name: string;
  displayName?: string;
  description?: string;
  supportedGenerationMethods?: string[];
}

// List available models for debugging
export async function listAvailableModels(): Promise<ModelInfo[]> {
  if (!genAI) {
    throw new Error("Gemini API not initialized - missing GEMINI_API_KEY");
  }

  try {
    // The SDK doesn't have a direct listModels method, so we need to use fetch
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to list models:", response.status, errorText);
      throw new Error(`Failed to list models: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const models: ModelInfo[] = data.models || [];

    console.log("\n=== Available Gemini Models ===");
    models.forEach((model: ModelInfo) => {
      console.log(`\nModel: ${model.name}`);
      console.log(`  Display Name: ${model.displayName || 'N/A'}`);
      console.log(`  Description: ${model.description?.substring(0, 100) || 'N/A'}...`);
      console.log(`  Supported Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
    });
    console.log("================================\n");

    return models;
  } catch (error) {
    console.error("Error listing models:", error);
    throw error;
  }
}

// Check if a specific model supports generateContent
export async function checkModelAvailability(modelName: string): Promise<boolean> {
  if (!genAI) {
    return false;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}?key=${apiKey}`
    );

    if (!response.ok) {
      console.log(`Model ${modelName}: NOT available (${response.status})`);
      return false;
    }

    const model = await response.json();
    const supportsGenerate = model.supportedGenerationMethods?.includes('generateContent') || false;
    console.log(`Model ${modelName}: ${supportsGenerate ? 'AVAILABLE with generateContent' : 'Available but NO generateContent support'}`);
    return supportsGenerate;
  } catch (error) {
    console.log(`Model ${modelName}: Error checking - ${error}`);
    return false;
  }
}

// Generated question structure from AI
export interface GeneratedQuestion {
  questionText: string;
  options?: Record<string, string>; // For MCQ: {"A": "text", "B": "text", "C": "text", "D": "text"}
  correctAnswer: string;
  explanation: string;
  marks: number;
}

// Difficulty descriptions for prompt construction
const difficultyDescriptions: Record<Difficulty, string> = {
  EASY: "simple and straightforward, suitable for beginners or revision",
  MEDIUM: "moderately challenging, requiring understanding of concepts",
  HARD: "difficult, requiring deep understanding and analytical thinking",
  CAMBRIDGE: "Cambridge O-Level/A-Level standard, analytical and application-based",
  CADET: "Cadet College entrance exam level, competitive and challenging",
};

// Question type instructions for prompt construction
const questionTypeInstructions: Record<QuestionType, string> = {
  MCQ: `Multiple Choice Questions with 4 options (A, B, C, D).
    Include the "options" field as an object with keys A, B, C, D.
    The correctAnswer should be just the letter (A, B, C, or D).`,
  FILL_BLANK: `Fill in the blank questions.
    Use "___" or "_____" to indicate the blank in the questionText.
    The correctAnswer should be the word or phrase that fills the blank.`,
  SHORT_ANSWER: `Short answer questions requiring 1-2 sentence answers.
    Do not include options field.
    The correctAnswer should be a concise expected answer.`,
  LONG_ANSWER: `Long answer or essay-type questions requiring detailed explanations.
    Do not include options field.
    The correctAnswer should include key points that a good answer should cover.`,
  TRUE_FALSE: `True or False statements.
    Do not include options field.
    The correctAnswer should be exactly "True" or "False".`,
};

// Construct the prompt for question generation
function constructPrompt(
  subject: string,
  topic: string,
  difficulty: Difficulty,
  questionType: QuestionType,
  quantity: number
): string {
  const diffDesc = difficultyDescriptions[difficulty];
  const typeInstructions = questionTypeInstructions[questionType];

  return `You are an expert educational content creator specializing in ${subject}.

Generate exactly ${quantity} unique ${questionType.replace("_", " ").toLowerCase()} question(s) about "${topic}" in ${subject}.

Difficulty Level: ${difficulty} - Questions should be ${diffDesc}.

Question Type Instructions:
${typeInstructions}

Requirements:
1. Each question must be unique and not repetitive
2. Questions should be educationally valuable and accurate
3. Explanations should be helpful for learning
4. Marks should be appropriate: MCQ/True-False: 1-2, Fill Blank: 1-2, Short Answer: 2-3, Long Answer: 4-5

IMPORTANT: Return ONLY a valid JSON array with no markdown formatting, no code blocks, no additional text.
The response must be a raw JSON array that can be directly parsed.

Each object in the array must have these exact fields:
- questionText: string (the question)
${questionType === "MCQ" ? '- options: object with keys A, B, C, D and string values' : ""}
- correctAnswer: string (the correct answer)
- explanation: string (explanation of the answer)
- marks: number (marks for the question)

Example response format:
[
  {
    "questionText": "Your question here?",
    ${questionType === "MCQ" ? '"options": {"A": "Option 1", "B": "Option 2", "C": "Option 3", "D": "Option 4"},' : ""}
    "correctAnswer": "The answer",
    "explanation": "Explanation of why this is correct",
    "marks": 2
  }
]

Generate the questions now:`;
}

// Parse and validate AI response
function parseAIResponse(responseText: string, questionType: QuestionType): GeneratedQuestion[] {
  // Clean the response - remove markdown code blocks if present
  let cleanedResponse = responseText.trim();

  // Remove markdown code blocks
  if (cleanedResponse.startsWith("```json")) {
    cleanedResponse = cleanedResponse.slice(7);
  } else if (cleanedResponse.startsWith("```")) {
    cleanedResponse = cleanedResponse.slice(3);
  }

  if (cleanedResponse.endsWith("```")) {
    cleanedResponse = cleanedResponse.slice(0, -3);
  }

  cleanedResponse = cleanedResponse.trim();

  // Try to find JSON array in the response
  const jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    cleanedResponse = jsonMatch[0];
  }

  let parsed: unknown[];
  try {
    parsed = JSON.parse(cleanedResponse);
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    console.error("Response text:", responseText);
    throw new Error("Failed to parse AI response as JSON. The AI may have returned invalid format.");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("AI response is not an array");
  }

  // Validate each question
  const validatedQuestions: GeneratedQuestion[] = [];

  for (let i = 0; i < parsed.length; i++) {
    const q = parsed[i] as Record<string, unknown>;

    // Validate required fields
    if (typeof q.questionText !== "string" || !q.questionText.trim()) {
      console.warn(`Question ${i + 1}: Missing or invalid questionText`);
      continue;
    }

    if (typeof q.correctAnswer !== "string" || !q.correctAnswer.trim()) {
      console.warn(`Question ${i + 1}: Missing or invalid correctAnswer`);
      continue;
    }

    // For MCQ, validate options
    if (questionType === "MCQ") {
      if (!q.options || typeof q.options !== "object") {
        console.warn(`Question ${i + 1}: MCQ missing options`);
        continue;
      }
      const options = q.options as Record<string, string>;
      if (!options.A || !options.B || !options.C || !options.D) {
        console.warn(`Question ${i + 1}: MCQ missing some options (A, B, C, D required)`);
        continue;
      }
    }

    validatedQuestions.push({
      questionText: q.questionText as string,
      options: questionType === "MCQ" ? (q.options as Record<string, string>) : undefined,
      correctAnswer: q.correctAnswer as string,
      explanation: (q.explanation as string) || "No explanation provided.",
      marks: typeof q.marks === "number" ? q.marks : (questionType === "LONG_ANSWER" ? 5 : 2),
    });
  }

  if (validatedQuestions.length === 0) {
    throw new Error("No valid questions could be extracted from AI response");
  }

  return validatedQuestions;
}

// Model names to try in order of preference
// Note: Old models (gemini-1.5-*, gemini-pro) are deprecated and return 404
// Only 2.0+ models are available on the free tier as of late 2025
const MODEL_NAMES = [
  "gemini-2.5-flash",           // Newest flash model (June 2025) - best for speed
  "gemini-2.0-flash",           // Stable 2.0 flash
  "gemini-2.0-flash-lite",      // Lighter/faster version
  "gemini-flash-latest",        // Latest flash alias
  "gemini-2.0-flash-001",       // Pinned stable version
  "gemini-flash-lite-latest",   // Lite alias
  "gemini-2.5-flash-lite",      // Lite 2.5 version
  "gemini-2.5-pro",             // Pro model (2.5) - better quality, slower
  "gemini-pro-latest",          // Pro alias
  "gemini-2.0-flash-exp",       // Experimental version
];

// Cache for available models
let cachedAvailableModels: string[] | null = null;

// Discover available models that support generateContent
async function discoverAvailableModels(): Promise<string[]> {
  if (cachedAvailableModels) {
    return cachedAvailableModels;
  }

  try {
    const models = await listAvailableModels();

    // Filter models that support generateContent
    const availableModels = models
      .filter(model => model.supportedGenerationMethods?.includes('generateContent'))
      .map(model => {
        // Extract model name without "models/" prefix
        const fullName = model.name;
        return fullName.startsWith('models/') ? fullName.substring(7) : fullName;
      });

    console.log("\nModels with generateContent support:", availableModels);
    cachedAvailableModels = availableModels;
    return availableModels;
  } catch (error) {
    console.error("Failed to discover models, will try predefined list:", error);
    return MODEL_NAMES;
  }
}

// Try to generate content with fallback models
async function tryGenerateContent(
  prompt: string
): Promise<string> {
  if (!genAI) {
    throw new Error("Gemini API is not configured. Please set GEMINI_API_KEY environment variable.");
  }

  // First, discover available models
  let modelsToTry: string[];
  try {
    const discoveredModels = await discoverAvailableModels();

    // Prefer flash models for speed, then pro models
    modelsToTry = discoveredModels.sort((a, b) => {
      // Prefer 2.0 over 1.5, flash over pro
      const score = (name: string) => {
        let s = 0;
        if (name.includes('2.0')) s += 100;
        if (name.includes('1.5')) s += 50;
        if (name.includes('flash')) s += 20;
        if (!name.includes('exp')) s += 5; // Prefer stable over experimental
        return s;
      };
      return score(b) - score(a);
    });

    console.log("Models to try (sorted by preference):", modelsToTry);
  } catch {
    console.log("Using predefined model list");
    modelsToTry = MODEL_NAMES;
  }

  if (modelsToTry.length === 0) {
    throw new Error("No Gemini models available for this API key. Please check your API key permissions.");
  }

  let lastError: Error | null = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`\n>>> Trying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });

      // Use simpler API call format - just pass the prompt string
      console.log(`    Calling generateContent...`);
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      if (!text) {
        throw new Error("Empty response from AI");
      }

      console.log(`<<< Successfully used model: ${modelName}`);
      console.log(`    Response length: ${text.length} characters`);
      return text;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`!!! Failed with model ${modelName}:`);
      console.error(`    Error: ${errorMessage}`);
      lastError = error instanceof Error ? error : new Error(String(error));

      // If it's a 404 error, try the next model
      if (errorMessage.includes("404") || errorMessage.includes("not found") || errorMessage.includes("NOT_FOUND")) {
        console.log(`    Model not found, trying next...`);
        continue;
      }

      // If model doesn't support this operation
      if (errorMessage.includes("not supported") || errorMessage.includes("INVALID_ARGUMENT")) {
        console.log(`    Model doesn't support this operation, trying next...`);
        continue;
      }

      // For API key issues, throw immediately
      if (errorMessage.includes("API key") || errorMessage.includes("API_KEY_INVALID") || errorMessage.includes("invalid")) {
        throw new Error("Invalid Gemini API key. Please check your configuration.");
      }

      // For quota/rate limit issues, check if it's a temporary limit or daily limit
      if (errorMessage.includes("quota") || errorMessage.includes("rate limit") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
        // Check if we should try another model (some models have separate quotas)
        if (errorMessage.includes("limit: 0")) {
          console.log(`    Daily quota exhausted for ${modelName}, trying next model...`);
          continue;
        }
        // Extract retry delay if provided
        const retryMatch = errorMessage.match(/retry in (\d+)/i);
        const retrySeconds = retryMatch ? parseInt(retryMatch[1]) : 60;
        throw new Error(`API rate limit exceeded. Please try again in ${retrySeconds} seconds.`);
      }

      // For permission issues
      if (errorMessage.includes("permission") || errorMessage.includes("PERMISSION_DENIED")) {
        console.log(`    Permission denied for this model, trying next...`);
        continue;
      }
    }
  }

  // If all models failed
  const errorMsg = lastError?.message || "Unknown error";
  console.error("\n=== All models failed ===");
  console.error(`Last error: ${errorMsg}`);

  throw new Error(`All Gemini models failed. Last error: ${errorMsg}. Please check your API key and try again.`);
}

// Main function to generate questions
export async function generateQuestions(
  subject: string,
  topic: string,
  difficulty: Difficulty,
  questionType: QuestionType,
  quantity: number
): Promise<GeneratedQuestion[]> {
  if (!genAI) {
    throw new Error("Gemini API is not configured. Please set GEMINI_API_KEY environment variable.");
  }

  // Validate quantity
  if (quantity < 1 || quantity > 20) {
    throw new Error("Quantity must be between 1 and 20");
  }

  const prompt = constructPrompt(subject, topic, difficulty, questionType, quantity);

  try {
    const text = await tryGenerateContent(prompt);
    const questions = parseAIResponse(text, questionType);

    // Ensure we don't return more than requested
    return questions.slice(0, quantity);
  } catch (error) {
    console.error("Error generating questions:", error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("An unexpected error occurred while generating questions.");
  }
}
