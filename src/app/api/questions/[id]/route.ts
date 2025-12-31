import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/questions/[id] - Get a single question
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

    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        topic: {
          include: {
            subject: true,
          },
        },
      },
    });

    if (!question) {
      return NextResponse.json(
        { success: false, error: "Question not found" },
        { status: 404 }
      );
    }

    // Check ownership
    if (question.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error("Error fetching question:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch question" },
      { status: 500 }
    );
  }
}

// PATCH /api/questions/[id] - Update a question
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

    // Find existing question
    const existing = await prisma.question.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Question not found" },
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
      questionText,
      options,
      correctAnswer,
      explanation,
      marks,
      isFavorite,
    } = body;

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (questionText !== undefined) updateData.questionText = questionText;
    if (options !== undefined) updateData.options = options;
    if (correctAnswer !== undefined) updateData.correctAnswer = correctAnswer;
    if (explanation !== undefined) updateData.explanation = explanation;
    if (marks !== undefined) updateData.marks = marks;
    if (isFavorite !== undefined) updateData.isFavorite = isFavorite;

    const question = await prisma.question.update({
      where: { id },
      data: updateData,
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
    console.error("Error updating question:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update question" },
      { status: 500 }
    );
  }
}

// DELETE /api/questions/[id] - Delete a question
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

    // Find existing question
    const existing = await prisma.question.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Question not found" },
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

    await prisma.question.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      data: { message: "Question deleted successfully" },
    });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete question" },
      { status: 500 }
    );
  }
}
