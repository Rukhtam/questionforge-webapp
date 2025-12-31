import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const GEMINI_MODEL = "gemini-1.5-pro"; // Current production model

export interface GeneratedQuestion {
  questionText: string;
  options?: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: string;
  explanation: string;
  marks: number;
}

export interface GenerateQuestionsParams {
  subject: string;
  topic: string;
  difficulty: string;
  questionType: string;
  quantity: number;
}

export async function generateQuestions(
  params: GenerateQuestionsParams
): Promise<GeneratedQuestion[]> {
  const { subject, topic, difficulty, questionType, quantity } = params;

  const difficultyDescriptions: Record<string, string> = {
    EASY: "simple and straightforward, suitable for beginners",
    MEDIUM: "moderately challenging, requiring good understanding",
    HARD: "complex and challenging, requiring deep understanding",
    CAMBRIDGE: "following Cambridge examination standards and patterns",
    CADET: "following Cadet College entrance exam standards",
  };

  const questionTypeInstructions: Record<string, string> = {
    MCQ: `Generate multiple choice questions with exactly 4 options (A, B, C, D). Include the options in the format: {"A": "option text", "B": "option text", "C": "option text", "D": "option text"}. The correctAnswer should be just the letter (A, B, C, or D).`,
    FILL_BLANK:
      "Generate fill-in-the-blank questions. Use _____ to indicate the blank. The correctAnswer should be the word or phrase that fills the blank.",
    SHORT_ANSWER:
      "Generate short answer questions that can be answered in 1-2 sentences. The correctAnswer should be a concise answer.",
    LONG_ANSWER:
      "Generate long answer questions that require detailed explanations. The correctAnswer should be a comprehensive answer.",
    TRUE_FALSE:
      'Generate true/false questions. The correctAnswer should be either "True" or "False".',
  };

  const prompt = `You are an expert educational content creator. Generate ${quantity} ${difficulty} level questions for the subject "${subject}" on the topic "${topic}".

${difficultyDescriptions[difficulty] || ""}

${questionTypeInstructions[questionType] || ""}

Return ONLY a valid JSON array with the following structure for each question:
${
  questionType === "MCQ"
    ? `[
  {
    "questionText": "The question text here",
    "options": {
      "A": "First option",
      "B": "Second option",
      "C": "Third option",
      "D": "Fourth option"
    },
    "correctAnswer": "A",
    "explanation": "Brief explanation of why this is correct",
    "marks": 1
  }
]`
    : `[
  {
    "questionText": "The question text here",
    "correctAnswer": "The correct answer",
    "explanation": "Brief explanation",
    "marks": ${questionType === "LONG_ANSWER" ? 5 : questionType === "SHORT_ANSWER" ? 2 : 1}
  }
]`
}

Important:
- Generate exactly ${quantity} questions
- Ensure questions are educational and age-appropriate
- Make sure all JSON is valid and properly formatted
- Do not include any text outside the JSON array`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Could not find JSON array in response");
    }

    const questions: GeneratedQuestion[] = JSON.parse(jsonMatch[0]);

    // Validate the response structure
    if (!Array.isArray(questions)) {
      throw new Error("Response is not an array");
    }

    questions.forEach((q, index) => {
      if (!q.questionText || !q.correctAnswer) {
        throw new Error(`Question ${index + 1} is missing required fields`);
      }
      if (questionType === "MCQ" && !q.options) {
        throw new Error(`Question ${index + 1} is MCQ but missing options`);
      }
    });

    return questions;
  } catch (error) {
    console.error("Error generating questions:", error);
    throw error;
  }
}

export default genAI;
