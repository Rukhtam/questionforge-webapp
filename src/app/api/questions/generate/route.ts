import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateQuestions } from "@/lib/gemini";
import type { QuestionType, Difficulty } from "@prisma/client";

// Request body type
interface GenerateQuestionsBody {
  subjectId: string;
  topicId: string;
  difficulty: Difficulty;
  questionType: QuestionType;
  quantity: number;
}

// Validate the request body
function validateRequest(body: unknown): GenerateQuestionsBody {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid request body");
  }

  const { subjectId, topicId, difficulty, questionType, quantity } = body as Record<string, unknown>;

  if (!subjectId || typeof subjectId !== "string") {
    throw new Error("Subject ID is required");
  }

  if (!topicId || typeof topicId !== "string") {
    throw new Error("Topic ID is required");
  }

  const validDifficulties = ["EASY", "MEDIUM", "HARD", "CAMBRIDGE", "CADET"];
  if (!difficulty || !validDifficulties.includes(difficulty as string)) {
    throw new Error("Valid difficulty level is required (EASY, MEDIUM, HARD, CAMBRIDGE, CADET)");
  }

  const validTypes = ["MCQ", "FILL_BLANK", "SHORT_ANSWER", "LONG_ANSWER", "TRUE_FALSE"];
  if (!questionType || !validTypes.includes(questionType as string)) {
    throw new Error("Valid question type is required");
  }

  if (!quantity || typeof quantity !== "number" || quantity < 1 || quantity > 20) {
    throw new Error("Quantity must be a number between 1 and 20");
  }

  return {
    subjectId: subjectId as string,
    topicId: topicId as string,
    difficulty: difficulty as Difficulty,
    questionType: questionType as QuestionType,
    quantity: quantity as number,
  };
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    let validatedBody: GenerateQuestionsBody;
    try {
      validatedBody = validateRequest(body);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: (error as Error).message },
        { status: 400 }
      );
    }

    const { subjectId, topicId, difficulty, questionType, quantity } = validatedBody;

    // Fetch subject and topic to validate they exist and get names for prompts
    const [subject, topic] = await Promise.all([
      prisma.subject.findUnique({ where: { id: subjectId } }),
      prisma.topic.findUnique({ where: { id: topicId }, include: { subject: true } }),
    ]);

    if (!subject) {
      return NextResponse.json(
        { success: false, error: "Subject not found" },
        { status: 404 }
      );
    }

    if (!topic) {
      return NextResponse.json(
        { success: false, error: "Topic not found" },
        { status: 404 }
      );
    }

    // Validate topic belongs to subject
    if (topic.subjectId !== subjectId) {
      return NextResponse.json(
        { success: false, error: "Topic does not belong to the selected subject" },
        { status: 400 }
      );
    }

    // Generate questions using Gemini AI
    const generatedQuestions = await generateQuestions(
      subject.name,
      topic.name,
      difficulty,
      questionType,
      quantity
    );

    // Save questions to database
    const savedQuestions = await Promise.all(
      generatedQuestions.map((q) =>
        prisma.question.create({
          data: {
            userId: session.user.id,
            topicId: topic.id,
            questionText: q.questionText,
            questionType: questionType,
            difficulty: difficulty,
            options: q.options ? q.options : undefined,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            marks: q.marks,
            isAiGenerated: true,
          },
          include: {
            topic: {
              include: {
                subject: true,
              },
            },
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      data: {
        questions: savedQuestions,
        count: savedQuestions.length,
        message: `Successfully generated ${savedQuestions.length} question(s)`,
      },
    });
  } catch (error) {
    console.error("Error in question generation:", error);

    // Handle specific errors
    if (error instanceof Error) {
      // Check for known error types
      if (error.message.includes("API")) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 503 }
        );
      }
      if (error.message.includes("parse") || error.message.includes("JSON")) {
        return NextResponse.json(
          { success: false, error: "Failed to parse AI response. Please try again." },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
