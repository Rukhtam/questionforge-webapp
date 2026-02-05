"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { QuestionType, Difficulty } from "@prisma/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Edit2,
  Trash2,
  Download,
  Calendar,
  School,
  BookOpen,
  FileText,
  Check,
  Printer,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import { getDisplayEmoji } from "@/lib/utils/emoji";

// Types
interface Topic {
  id: string;
  name: string;
  subject: {
    id: string;
    name: string;
    icon: string | null;
  };
}

interface Question {
  id: string;
  questionText: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  options: Record<string, string> | null;
  correctAnswer: string;
  explanation: string | null;
  marks: number;
  topic: Topic;
}

interface WorksheetQuestion {
  questionId: string;
  order: number;
  customMarks: number | null;
  question: Question;
}

interface Worksheet {
  id: string;
  title: string;
  schoolName: string | null;
  examName: string | null;
  className: string | null;
  date: string | null;
  totalMarks: number | null;
  createdAt: string;
  questions: WorksheetQuestion[];
  questionCount: number;
  calculatedTotalMarks: number;
}

// RTL subjects that need right-to-left text direction
const RTL_SUBJECTS = ["Urdu", "Islamiyat"];

// Helper function to check if a subject requires RTL direction
const isRTLSubject = (subjectName: string): boolean => {
  return RTL_SUBJECTS.includes(subjectName);
};

// Helper to get difficulty color
const getDifficultyVariant = (difficulty: Difficulty): "success" | "warning" | "danger" | "default" | "purple" => {
  const variants: Record<Difficulty, "success" | "warning" | "danger" | "default" | "purple"> = {
    EASY: "success",
    MEDIUM: "warning",
    HARD: "danger",
    CAMBRIDGE: "default",
    CADET: "purple",
  };
  return variants[difficulty];
};

// Helper to format question type
const formatQuestionType = (type: QuestionType) => {
  const labels: Record<QuestionType, string> = {
    MCQ: "Multiple Choice",
    FILL_BLANK: "Fill in the Blank",
    SHORT_ANSWER: "Short Answer",
    LONG_ANSWER: "Long Answer",
    TRUE_FALSE: "True/False",
  };
  return labels[type];
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function WorksheetViewPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [worksheet, setWorksheet] = useState<Worksheet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  // Fetch worksheet
  useEffect(() => {
    async function fetchWorksheet() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/worksheets/${id}`);
        const data = await response.json();

        if (data.success) {
          setWorksheet(data.data);
        } else {
          setError(data.error || "Failed to fetch worksheet");
        }
      } catch (err) {
        console.error("Error fetching worksheet:", err);
        setError("Failed to fetch worksheet. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchWorksheet();
  }, [id]);

  // Toggle question expansion
  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  // Delete worksheet
  async function handleDelete() {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/worksheets/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Worksheet deleted successfully");
        router.push("/dashboard/worksheets");
      } else {
        toast.error(data.error || "Failed to delete worksheet");
      }
    } catch (err) {
      toast.error("Failed to delete worksheet");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  }

  // Format date
  function formatDate(dateString: string | null): string {
    if (!dateString) return "No date set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // Print worksheet
  function handlePrint() {
    window.print();
  }

  // Download PDF
  async function handleDownloadPDF() {
    setIsDownloadingPDF(true);
    try {
      const response = await fetch(`/api/worksheets/${id}/pdf`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate PDF");
      }

      // Get the blob from response
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "worksheet.pdf";
      if (contentDisposition) {
        const matches = contentDisposition.match(/filename="(.+)"/);
        if (matches && matches[1]) {
          filename = matches[1];
        }
      }

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("PDF downloaded successfully");
    } catch (err) {
      console.error("Error downloading PDF:", err);
      toast.error(err instanceof Error ? err.message : "Failed to download PDF");
    } finally {
      setIsDownloadingPDF(false);
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: "Worksheets", href: "/dashboard/worksheets" },
            { label: "Loading..." },
          ]}
        />
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <Skeleton className="h-8 w-1/2 mb-4" />
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !worksheet) {
    return (
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: "Worksheets", href: "/dashboard/worksheets" },
            { label: "Error" },
          ]}
        />
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {error || "Worksheet not found"}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            The worksheet you're looking for might have been deleted or doesn't exist.
          </p>
          <Button asChild>
            <Link href="/dashboard/worksheets">Back to Worksheets</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Worksheets", href: "/dashboard/worksheets" },
          { label: worksheet.title },
        ]}
      />

      {/* Page Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText style={{ height: '1.75rem', width: '1.75rem', color: '#60A5FA' }} />
            {worksheet.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            <Badge variant="secondary">
              {worksheet.questionCount} Question{worksheet.questionCount !== 1 ? "s" : ""}
            </Badge>
            <Badge variant="default">
              {worksheet.calculatedTotalMarks} Total Marks
            </Badge>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }} className="print:hidden">
          <Button
            variant="default"
            onClick={handleDownloadPDF}
            isLoading={isDownloadingPDF}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {!isDownloadingPDF && <Download style={{ height: '1.125rem', width: '1.125rem' }} />}
            {isDownloadingPDF ? "Generating..." : "Download PDF"}
          </Button>
          <Button variant="outline" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Printer style={{ height: '1.125rem', width: '1.125rem' }} />
            Print
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowAnswerKey(!showAnswerKey)}
          >
            {showAnswerKey ? "Hide Answers" : "Show Answers"}
          </Button>
          <Button asChild variant="outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link href={`/dashboard/worksheets/${id}/edit`}>
              <Edit2 style={{ height: '1.125rem', width: '1.125rem' }} />
              Edit
            </Link>
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Trash2 style={{ height: '1.125rem', width: '1.125rem' }} />
            Delete
          </Button>
        </div>
      </div>

      {/* Worksheet Details */}
      <div style={{
        backgroundColor: '#1F2937',
        borderRadius: '0.75rem',
        border: '2px solid #374151',
        padding: '1.5rem'
      }} className="print:border-0 print:shadow-none print:p-0 print:bg-white">
        {/* Header for Print */}
        <div className="print:block hidden mb-8 border-b-2 border-gray-900 pb-4">
          <div className="text-center">
            {worksheet.schoolName && (
              <h1 className="text-xl font-bold">{worksheet.schoolName}</h1>
            )}
            {worksheet.examName && (
              <h2 className="text-lg font-semibold mt-1">{worksheet.examName}</h2>
            )}
            <div className="flex justify-between items-center mt-4 text-sm">
              {worksheet.className && (
                <span>Class: {worksheet.className}</span>
              )}
              <span>Total Marks: {worksheet.calculatedTotalMarks}</span>
              {worksheet.date && (
                <span>Date: {formatDate(worksheet.date)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Metadata Grid */}
        <div style={{
          display: 'grid',
          gap: '1rem',
          marginBottom: '1.5rem'
        }} className="md:grid-cols-2 print:hidden">
          {worksheet.schoolName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#D1D5DB' }}>
              <School style={{ height: '1.25rem', width: '1.25rem', flexShrink: 0, color: '#6B7280' }} />
              <span><strong style={{ color: 'white' }}>School:</strong> {worksheet.schoolName}</span>
            </div>
          )}
          {worksheet.examName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#D1D5DB' }}>
              <BookOpen style={{ height: '1.25rem', width: '1.25rem', flexShrink: 0, color: '#6B7280' }} />
              <span><strong style={{ color: 'white' }}>Exam:</strong> {worksheet.examName}</span>
            </div>
          )}
          {worksheet.className && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#D1D5DB' }}>
              <FileText style={{ height: '1.25rem', width: '1.25rem', flexShrink: 0, color: '#6B7280' }} />
              <span><strong style={{ color: 'white' }}>Class:</strong> {worksheet.className}</span>
            </div>
          )}
          {worksheet.date && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#D1D5DB' }}>
              <Calendar style={{ height: '1.25rem', width: '1.25rem', flexShrink: 0, color: '#6B7280' }} />
              <span><strong style={{ color: 'white' }}>Date:</strong> {formatDate(worksheet.date)}</span>
            </div>
          )}
        </div>

        {/* Questions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'white' }} className="print:hidden">
            Questions
          </h2>

          <div className="space-y-4">
            {worksheet.questions.map((wq, index) => {
              const isExpanded = expandedQuestions.has(wq.question.id);
              const marks = wq.customMarks ?? wq.question.marks;
              const isRTL = isRTLSubject(wq.question.topic.subject.name);

              return (
                <div
                  key={wq.question.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden print:border-0 print:border-b print:rounded-none"
                >
                  {/* Question Header */}
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors print:cursor-default print:hover:bg-transparent"
                    onClick={() => toggleQuestion(wq.question.id)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Question Number */}
                      <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-sm print:bg-transparent print:text-gray-900 print:border print:border-gray-900">
                        {index + 1}
                      </span>

                      {/* Question Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap print:hidden">
                          <Badge variant={getDifficultyVariant(wq.question.difficulty)} className="text-xs">
                            {wq.question.difficulty}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {formatQuestionType(wq.question.questionType)}
                          </Badge>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {getDisplayEmoji(wq.question.topic.subject.icon)} {wq.question.topic.subject.name}
                          </span>
                        </div>

                        <p
                          className={`text-gray-900 dark:text-white ${isRTL ? "text-right" : ""}`}
                          dir={isRTL ? "rtl" : "ltr"}
                        >
                          {wq.question.questionText}
                        </p>

                        {/* MCQ Options */}
                        {wq.question.questionType === "MCQ" && wq.question.options && (
                          <div className="mt-3 space-y-2">
                            {Object.entries(wq.question.options).map(([key, value]) => {
                              const isCorrect = wq.question.correctAnswer === key;
                              return (
                                <div
                                  key={key}
                                  className={`
                                    flex items-center gap-3 p-2 rounded
                                    ${showAnswerKey && isCorrect
                                      ? "bg-green-50 dark:bg-green-900/20"
                                      : ""
                                    }
                                    print:p-1
                                  `}
                                >
                                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium print:bg-transparent print:border print:border-gray-400">
                                    {key}
                                  </span>
                                  <span
                                    className={`flex-1 text-gray-700 dark:text-gray-200 ${isRTL ? "text-right" : ""}`}
                                    dir={isRTL ? "rtl" : "ltr"}
                                  >
                                    {value}
                                  </span>
                                  {showAnswerKey && isCorrect && (
                                    <Check className="h-5 w-5 text-green-500 print:hidden" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* True/False Options */}
                        {wq.question.questionType === "TRUE_FALSE" && (
                          <div className="mt-3 flex gap-4">
                            <div className={`flex items-center gap-2 ${showAnswerKey && wq.question.correctAnswer.toLowerCase() === "true" ? "text-green-600" : ""}`}>
                              <span className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 print:border-gray-600" />
                              <span>True</span>
                              {showAnswerKey && wq.question.correctAnswer.toLowerCase() === "true" && (
                                <Check className="h-4 w-4 text-green-500 print:hidden" />
                              )}
                            </div>
                            <div className={`flex items-center gap-2 ${showAnswerKey && wq.question.correctAnswer.toLowerCase() === "false" ? "text-green-600" : ""}`}>
                              <span className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 print:border-gray-600" />
                              <span>False</span>
                              {showAnswerKey && wq.question.correctAnswer.toLowerCase() === "false" && (
                                <Check className="h-4 w-4 text-green-500 print:hidden" />
                              )}
                            </div>
                          </div>
                        )}

                        {/* Fill in the Blank Line */}
                        {wq.question.questionType === "FILL_BLANK" && (
                          <div className="mt-3">
                            <div className="h-8 border-b-2 border-gray-300 dark:border-gray-600 border-dashed" />
                            {showAnswerKey && (
                              <p className="mt-2 text-green-600 dark:text-green-400 font-medium print:hidden">
                                Answer: {wq.question.correctAnswer}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Short/Long Answer Lines */}
                        {(wq.question.questionType === "SHORT_ANSWER" || wq.question.questionType === "LONG_ANSWER") && (
                          <div className="mt-3 space-y-2">
                            {[...Array(wq.question.questionType === "LONG_ANSWER" ? 6 : 3)].map((_, i) => (
                              <div key={i} className="h-6 border-b border-gray-200 dark:border-gray-700 print:border-gray-300" />
                            ))}
                            {showAnswerKey && (
                              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg print:hidden">
                                <p className="text-sm font-medium text-green-700 dark:text-green-300">
                                  Expected Answer:
                                </p>
                                <p
                                  className={`mt-1 text-green-600 dark:text-green-400 ${isRTL ? "text-right" : ""}`}
                                  dir={isRTL ? "rtl" : "ltr"}
                                >
                                  {wq.question.correctAnswer}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Marks */}
                      <div className="flex-shrink-0 text-right">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 print:text-gray-900">
                          [{marks} mark{marks > 1 ? "s" : ""}]
                        </span>
                      </div>

                      {/* Expand Arrow */}
                      <button
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 print:hidden"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleQuestion(wq.question.id);
                        }}
                      >
                        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && wq.question.explanation && (
                    <div className="px-4 pb-4 pt-0 print:hidden">
                      <div className="ml-12 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                          Explanation
                        </p>
                        <p
                          className={`text-gray-700 dark:text-gray-300 ${isRTL ? "text-right" : ""}`}
                          dir={isRTL ? "rtl" : "ltr"}
                        >
                          {wq.question.explanation}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Answer Key Section (for print) */}
        {showAnswerKey && (
          <div className="mt-8 print:page-break-before print:mt-0">
            <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6 print:border-gray-900">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 print:text-center">
                Answer Key
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 print:grid-cols-5">
                {worksheet.questions.map((wq, index) => (
                  <div
                    key={wq.question.id}
                    className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded print:bg-transparent print:p-1"
                  >
                    <span className="font-bold text-gray-900 dark:text-white">
                      Q{index + 1}:
                    </span>
                    <span className="text-green-600 dark:text-green-400 print:text-gray-900">
                      {wq.question.correctAnswer.length > 20
                        ? wq.question.correctAnswer.substring(0, 20) + "..."
                        : wq.question.correctAnswer}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Worksheet</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this worksheet? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <p className="font-medium text-gray-900 dark:text-white">
              {worksheet.title}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {worksheet.questionCount} question{worksheet.questionCount !== 1 ? "s" : ""} |{" "}
              {worksheet.calculatedTotalMarks} marks
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
