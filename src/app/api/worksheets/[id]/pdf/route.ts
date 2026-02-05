import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createWorksheetPDF } from "@/lib/pdf/worksheet-pdf";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/worksheets/[id]/pdf - Generate and download PDF for a worksheet
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

    // Fetch worksheet with all questions and related data
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

    // Prepare worksheet data for PDF
    const worksheetData = {
      ...worksheet,
      date: worksheet.date ? worksheet.date.toISOString() : null,
      createdAt: worksheet.createdAt.toISOString(),
      questionCount,
      calculatedTotalMarks,
      questions: worksheet.questions.map((wq) => ({
        ...wq,
        question: {
          ...wq.question,
          options: wq.question.options as Record<string, string> | null,
        },
      })),
    };

    // Generate PDF buffer using the helper function
    const pdfDocument = createWorksheetPDF(worksheetData);
    const pdfBuffer = await renderToBuffer(pdfDocument);

    // Create filename (sanitize title for safe filename)
    const sanitizedTitle = worksheet.title
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase()
      .substring(0, 50);
    const filename = `${sanitizedTitle}-worksheet.pdf`;

    // Convert Buffer to Uint8Array for NextResponse
    const uint8Array = new Uint8Array(pdfBuffer);

    // Return PDF as response
    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": uint8Array.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate PDF. Please try again.",
      },
      { status: 500 }
    );
  }
}
