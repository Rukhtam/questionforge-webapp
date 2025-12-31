import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { QuestionType, Difficulty } from "@prisma/client";

// GET /api/questions - List user's questions with filters
export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");
    const topicId = searchParams.get("topicId");
    const questionType = searchParams.get("questionType") as QuestionType | null;
    const difficulty = searchParams.get("difficulty") as Difficulty | null;
    const isFavorite = searchParams.get("isFavorite");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build where clause
    const where: Record<string, unknown> = {
      userId: session.user.id,
    };

    if (topicId) {
      where.topicId = topicId;
    } else if (subjectId) {
      where.topic = { subjectId };
    }

    if (questionType) {
      where.questionType = questionType;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (isFavorite === "true") {
      where.isFavorite = true;
    }

    if (search) {
      where.questionText = {
        contains: search,
        mode: "insensitive",
      };
    }

    // Fetch questions with pagination
    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        include: {
          topic: {
            include: {
              subject: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.question.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        questions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

// POST /api/questions - Create a new question manually
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

    const body = await request.json();
    const {
      topicId,
      questionText,
      questionType,
      difficulty,
      options,
      correctAnswer,
      explanation,
      marks = 1,
    } = body;

    // Validate required fields
    if (!topicId || !questionText || !questionType || !difficulty || !correctAnswer) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate topic exists
    const topic = await prisma.topic.findUnique({ where: { id: topicId } });
    if (!topic) {
      return NextResponse.json(
        { success: false, error: "Topic not found" },
        { status: 404 }
      );
    }

    // Validate MCQ options
    if (questionType === "MCQ") {
      if (!options || !options.A || !options.B || !options.C || !options.D) {
        return NextResponse.json(
          { success: false, error: "MCQ questions require options A, B, C, D" },
          { status: 400 }
        );
      }
    }

    // Create question
    const question = await prisma.question.create({
      data: {
        userId: session.user.id,
        topicId,
        questionText,
        questionType,
        difficulty,
        options: questionType === "MCQ" ? options : undefined,
        correctAnswer,
        explanation,
        marks,
        isAiGenerated: false,
      },
      include: {
        topic: {
          include: {
            subject: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create question" },
      { status: 500 }
    );
  }
}
