import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/worksheets/[id] - Get a single worksheet with all questions
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const { id } = await params;

    const worksheet = await prisma.worksheet.findUnique({
      where: { id },
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

    if (!worksheet) {
      return NextResponse.json(
        { success: false, error: "Worksheet not found" },
        { status: 404 }
      );
    }

    // Check ownership
    if (worksheet.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    // Calculate stats
    const questionCount = worksheet.questions.length;
    const calculatedTotalMarks = worksheet.questions.reduce((sum, wq) => {
      return sum + (wq.customMarks ?? wq.question.marks);
    }, 0);

    return NextResponse.json({
      success: true,
      data: {
        ...worksheet,
        questionCount,
        calculatedTotalMarks,
      },
    });
  } catch (error) {
    console.error("Error fetching worksheet:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch worksheet" },
      { status: 500 }
    );
  }
}

// PATCH /api/worksheets/[id] - Update a worksheet
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Find existing worksheet
    const existing = await prisma.worksheet.findUnique({
      where: { id },
      include: {
        questions: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Worksheet not found" },
        { status: 404 }
      );
    }

    // Check ownership
    if (existing.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
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

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (title !== undefined) {
      if (!title.trim()) {
        return NextResponse.json(
          { success: false, error: "Worksheet title cannot be empty" },
          { status: 400 }
        );
      }
      updateData.title = title.trim();
    }

    if (schoolName !== undefined) updateData.schoolName = schoolName?.trim() || null;
    if (examName !== undefined) updateData.examName = examName?.trim() || null;
    if (className !== undefined) updateData.className = className?.trim() || null;
    if (date !== undefined) updateData.date = date ? new Date(date) : null;

    // If questionIds are provided, update the worksheet questions
    if (questionIds !== undefined) {
      if (!Array.isArray(questionIds) || questionIds.length === 0) {
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

      // Calculate new total marks
      const totalMarks = questionIds.reduce((sum: number, qId: string) => {
        const customMark = questionMarks?.[qId];
        if (customMark !== undefined) {
          return sum + customMark;
        }
        const question = questions.find((q) => q.id === qId);
        return sum + (question?.marks || 1);
      }, 0);

      updateData.totalMarks = totalMarks;

      // Delete existing worksheet questions and create new ones
      await prisma.worksheetQuestion.deleteMany({
        where: { worksheetId: id },
      });

      await prisma.worksheetQuestion.createMany({
        data: questionIds.map((questionId: string, index: number) => ({
          worksheetId: id,
          questionId,
          order: index + 1,
          customMarks: questionMarks?.[questionId] ?? null,
        })),
      });
    }

    // Update worksheet
    const worksheet = await prisma.worksheet.update({
      where: { id },
      data: updateData,
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

    // Calculate stats
    const questionCount = worksheet.questions.length;
    const calculatedTotalMarks = worksheet.questions.reduce((sum, wq) => {
      return sum + (wq.customMarks ?? wq.question.marks);
    }, 0);

    return NextResponse.json({
      success: true,
      data: {
        ...worksheet,
        questionCount,
        calculatedTotalMarks,
      },
    });
  } catch (error) {
    console.error("Error updating worksheet:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update worksheet" },
      { status: 500 }
    );
  }
}

// DELETE /api/worksheets/[id] - Delete a worksheet
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Find existing worksheet
    const existing = await prisma.worksheet.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Worksheet not found" },
        { status: 404 }
      );
    }

    // Check ownership
    if (existing.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    // Delete worksheet (cascade will delete WorksheetQuestion entries)
    await prisma.worksheet.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      data: { message: "Worksheet deleted successfully" },
    });
  } catch (error) {
    console.error("Error deleting worksheet:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete worksheet" },
      { status: 500 }
    );
  }
}
