import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/worksheets - List user's worksheets
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
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build where clause
    const where: Record<string, unknown> = {
      userId: session.user.id,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { schoolName: { contains: search, mode: "insensitive" } },
        { examName: { contains: search, mode: "insensitive" } },
        { className: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch worksheets with pagination
    const [worksheets, total] = await Promise.all([
      prisma.worksheet.findMany({
        where,
        include: {
          questions: {
            include: {
              question: {
                include: {
                  topic: {
                    include: {
                      subject: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              order: "asc",
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.worksheet.count({ where }),
    ]);

    // Calculate total marks for each worksheet
    const worksheetsWithStats = worksheets.map((worksheet) => {
      const questionCount = worksheet.questions.length;
      const totalMarks = worksheet.questions.reduce((sum, wq) => {
        return sum + (wq.customMarks ?? wq.question.marks);
      }, 0);

      return {
        ...worksheet,
        questionCount,
        calculatedTotalMarks: totalMarks,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        worksheets: worksheetsWithStats,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching worksheets:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch worksheets" },
      { status: 500 }
    );
  }
}

// POST /api/worksheets - Create a new worksheet
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
      title,
      schoolName,
      examName,
      className,
      date,
      questionIds,
      questionMarks,
    } = body;

    // Validate required fields
    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: "Worksheet title is required" },
        { status: 400 }
      );
    }

    if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one question is required" },
        { status: 400 }
      );
    }

    // Verify all questions exist and belong to the user
    const questions = await prisma.question.findMany({
      where: {
        id: { in: questionIds },
        userId: session.user.id,
      },
    });

    if (questions.length !== questionIds.length) {
      return NextResponse.json(
        { success: false, error: "Some questions were not found or you don't have access to them" },
        { status: 400 }
      );
    }

    // Calculate total marks
    const totalMarks = questionIds.reduce((sum: number, qId: string, index: number) => {
      const customMark = questionMarks?.[qId];
      if (customMark !== undefined) {
        return sum + customMark;
      }
      const question = questions.find((q) => q.id === qId);
      return sum + (question?.marks || 1);
    }, 0);

    // Create worksheet with questions
    const worksheet = await prisma.worksheet.create({
      data: {
        userId: session.user.id,
        title: title.trim(),
        schoolName: schoolName?.trim() || null,
        examName: examName?.trim() || null,
        className: className?.trim() || null,
        date: date ? new Date(date) : null,
        totalMarks,
        questions: {
          create: questionIds.map((questionId: string, index: number) => ({
            questionId,
            order: index + 1,
            customMarks: questionMarks?.[questionId] ?? null,
          })),
        },
      },
      include: {
        questions: {
          include: {
            question: {
              include: {
                topic: {
                  include: {
                    subject: true,
                  },
                },
              },
            },
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: worksheet,
    });
  } catch (error) {
    console.error("Error creating worksheet:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create worksheet" },
      { status: 500 }
    );
  }
}
