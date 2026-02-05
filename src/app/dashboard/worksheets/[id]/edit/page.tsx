"use client";

import { useState, useEffect, useCallback, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { QuestionType, Difficulty } from "@prisma/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  Search,
  Star,
  ChevronDown,
  ChevronUp,
  X,
  AlertTriangle,
  Check,
  Loader2,
  Trash2,
  Save,
  FileText,
  Edit2,
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
  isFavorite: boolean;
  isAiGenerated: boolean;
  createdAt: string;
  topic: Topic;
}

interface Subject {
  id: string;
  name: string;
  nameUrdu: string | null;
  icon: string | null;
  topics: { id: string; name: string }[];
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface SelectedQuestion {
  question: Question;
  customMarks?: number;
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
  questions: WorksheetQuestion[];
}

// Question types with labels
const questionTypes: { value: QuestionType | ""; label: string }[] = [
  { value: "", label: "All Types" },
  { value: "MCQ", label: "Multiple Choice" },
  { value: "FILL_BLANK", label: "Fill in the Blank" },
  { value: "SHORT_ANSWER", label: "Short Answer" },
  { value: "LONG_ANSWER", label: "Long Answer" },
  { value: "TRUE_FALSE", label: "True/False" },
];

// Difficulty levels
const difficultyLevels: { value: Difficulty | ""; label: string }[] = [
  { value: "", label: "All Levels" },
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
  { value: "CAMBRIDGE", label: "Cambridge" },
  { value: "CADET", label: "Cadet" },
];

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

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
    MCQ: "MCQ",
    FILL_BLANK: "Fill Blank",
    SHORT_ANSWER: "Short",
    LONG_ANSWER: "Long",
    TRUE_FALSE: "T/F",
  };
  return labels[type];
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditWorksheetPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  // Loading state for initial fetch
  const [isLoadingWorksheet, setIsLoadingWorksheet] = useState(true);
  const [worksheetError, setWorksheetError] = useState<string | null>(null);

  // Worksheet details state
  const [title, setTitle] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [examName, setExamName] = useState("");
  const [className, setClassName] = useState("");
  const [worksheetDate, setWorksheetDate] = useState("");

  // Selected questions state
  const [selectedQuestions, setSelectedQuestions] = useState<SelectedQuestion[]>([]);

  // Question bank state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  // Filter state
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [selectedType, setSelectedType] = useState<QuestionType | "">("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | "">("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Debounced search
  const debouncedSearch = useDebounce(searchQuery, 300);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showQuestionBank, setShowQuestionBank] = useState(true);

  // Get available topics based on selected subject
  const availableTopics = subjects.find((s) => s.id === selectedSubject)?.topics || [];

  // Calculate total marks
  const totalMarks = useMemo(() => {
    return selectedQuestions.reduce((sum, sq) => {
      return sum + (sq.customMarks ?? sq.question.marks);
    }, 0);
  }, [selectedQuestions]);

  // Fetch worksheet
  useEffect(() => {
    async function fetchWorksheet() {
      setIsLoadingWorksheet(true);
      setWorksheetError(null);

      try {
        const response = await fetch(`/api/worksheets/${id}`);
        const data = await response.json();

        if (data.success) {
          const worksheet: Worksheet = data.data;
          setTitle(worksheet.title);
          setSchoolName(worksheet.schoolName || "");
          setExamName(worksheet.examName || "");
          setClassName(worksheet.className || "");
          setWorksheetDate(worksheet.date ? new Date(worksheet.date).toISOString().split("T")[0] : "");

          // Set selected questions from worksheet
          const selected: SelectedQuestion[] = worksheet.questions.map((wq) => ({
            question: wq.question,
            customMarks: wq.customMarks ?? undefined,
          }));
          setSelectedQuestions(selected);
        } else {
          setWorksheetError(data.error || "Failed to fetch worksheet");
        }
      } catch (err) {
        console.error("Error fetching worksheet:", err);
        setWorksheetError("Failed to fetch worksheet. Please try again.");
      } finally {
        setIsLoadingWorksheet(false);
      }
    }

    fetchWorksheet();
  }, [id]);

  // Fetch subjects
  useEffect(() => {
    async function fetchSubjects() {
      try {
        const response = await fetch("/api/subjects");
        const data = await response.json();
        if (data.success) {
          setSubjects(data.data);
        }
      } catch (err) {
        console.error("Error fetching subjects:", err);
      }
    }
    fetchSubjects();
  }, []);

  // Fetch questions
  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("page", currentPage.toString());
      params.set("limit", "20");

      if (selectedSubject) params.set("subjectId", selectedSubject);
      if (selectedTopic) params.set("topicId", selectedTopic);
      if (selectedType) params.set("questionType", selectedType);
      if (selectedDifficulty) params.set("difficulty", selectedDifficulty);
      if (showFavoritesOnly) params.set("isFavorite", "true");
      if (debouncedSearch) params.set("search", debouncedSearch);

      const response = await fetch(`/api/questions?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setQuestions(data.data.questions);
        setPagination(data.data.pagination);
      } else {
        setError(data.error || "Failed to fetch questions");
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError("Failed to fetch questions. Please try again.");
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }, [
    currentPage,
    selectedSubject,
    selectedTopic,
    selectedType,
    selectedDifficulty,
    showFavoritesOnly,
    debouncedSearch,
  ]);

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Show searching indicator
  useEffect(() => {
    if (searchQuery !== debouncedSearch) {
      setIsSearching(true);
    }
  }, [searchQuery, debouncedSearch]);

  // Reset topic when subject changes
  useEffect(() => {
    setSelectedTopic("");
  }, [selectedSubject]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSubject, selectedTopic, selectedType, selectedDifficulty, showFavoritesOnly, debouncedSearch]);

  // Check if question is selected
  const isQuestionSelected = useCallback(
    (questionId: string) => {
      return selectedQuestions.some((sq) => sq.question.id === questionId);
    },
    [selectedQuestions]
  );

  // Add question to worksheet
  const addQuestion = useCallback((question: Question) => {
    setSelectedQuestions((prev) => {
      if (prev.some((sq) => sq.question.id === question.id)) {
        return prev;
      }
      return [...prev, { question }];
    });
    toast.success("Question added to worksheet");
  }, []);

  // Remove question from worksheet
  const removeQuestion = useCallback((questionId: string) => {
    setSelectedQuestions((prev) => prev.filter((sq) => sq.question.id !== questionId));
  }, []);

  // Move question up
  const moveQuestionUp = useCallback((index: number) => {
    if (index === 0) return;
    setSelectedQuestions((prev) => {
      const newQuestions = [...prev];
      [newQuestions[index - 1], newQuestions[index]] = [newQuestions[index], newQuestions[index - 1]];
      return newQuestions;
    });
  }, []);

  // Move question down
  const moveQuestionDown = useCallback((index: number) => {
    setSelectedQuestions((prev) => {
      if (index === prev.length - 1) return prev;
      const newQuestions = [...prev];
      [newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]];
      return newQuestions;
    });
  }, []);

  // Update custom marks
  const updateCustomMarks = useCallback((questionId: string, marks: number | undefined) => {
    setSelectedQuestions((prev) =>
      prev.map((sq) =>
        sq.question.id === questionId ? { ...sq, customMarks: marks } : sq
      )
    );
  }, []);

  // Save worksheet
  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Please enter a worksheet title");
      return;
    }

    if (selectedQuestions.length === 0) {
      toast.error("Please add at least one question to the worksheet");
      return;
    }

    setIsSaving(true);

    try {
      const questionIds = selectedQuestions.map((sq) => sq.question.id);
      const questionMarks: Record<string, number> = {};
      selectedQuestions.forEach((sq) => {
        if (sq.customMarks !== undefined) {
          questionMarks[sq.question.id] = sq.customMarks;
        }
      });

      const response = await fetch(`/api/worksheets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          schoolName: schoolName.trim() || null,
          examName: examName.trim() || null,
          className: className.trim() || null,
          date: worksheetDate || null,
          questionIds,
          questionMarks: Object.keys(questionMarks).length > 0 ? questionMarks : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Worksheet updated successfully");
        router.push(`/dashboard/worksheets/${id}`);
      } else {
        toast.error(data.error || "Failed to update worksheet");
      }
    } catch (err) {
      console.error("Error updating worksheet:", err);
      toast.error("Failed to update worksheet. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const hasActiveFilters =
    selectedSubject ||
    selectedTopic ||
    selectedType ||
    selectedDifficulty ||
    showFavoritesOnly ||
    searchQuery;

  const clearFilters = () => {
    setSelectedSubject("");
    setSelectedTopic("");
    setSelectedType("");
    setSelectedDifficulty("");
    setShowFavoritesOnly(false);
    setSearchQuery("");
  };

  // Loading state for worksheet
  if (isLoadingWorksheet) {
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
          <div className="space-y-4">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error state for worksheet
  if (worksheetError) {
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
            {worksheetError}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            The worksheet you're trying to edit might have been deleted or doesn't exist.
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
          { label: title || "Edit Worksheet", href: `/dashboard/worksheets/${id}` },
          { label: "Edit" },
        ]}
      />

      {/* Page Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="md:flex-row md:items-center md:justify-between">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Edit2 style={{ height: '1.75rem', width: '1.75rem', color: '#60A5FA' }} />
            Edit Worksheet
          </h1>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9375rem', color: '#D1D5DB' }}>
            Update worksheet details and modify questions
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/worksheets/${id}`}>Cancel</Link>
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || selectedQuestions.length === 0}
            isLoading={isSaving}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Save style={{ height: '1rem', width: '1rem' }} />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Worksheet Details & Selected Questions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Worksheet Details */}
          <div style={{
            backgroundColor: '#1F2937',
            borderRadius: '0.75rem',
            border: '2px solid #374151',
            padding: '1.5rem'
          }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'white', marginBottom: '1rem' }}>
              Worksheet Details
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label htmlFor="title" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#D1D5DB', marginBottom: '0.375rem' }}>
                  Title <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Math Unit Test - Chapter 5"
                  style={{
                    width: '100%',
                    height: '2.75rem',
                    padding: '0 1rem',
                    borderRadius: '0.5rem',
                    border: '2px solid #4B5563',
                    backgroundColor: '#374151',
                    color: 'white',
                    fontSize: '0.9375rem'
                  }}
                />
              </div>
              <div>
                <label htmlFor="schoolName" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#D1D5DB', marginBottom: '0.375rem' }}>
                  School Name
                </label>
                <input
                  type="text"
                  id="schoolName"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="e.g., ABC Public School"
                  style={{
                    width: '100%',
                    height: '2.75rem',
                    padding: '0 1rem',
                    borderRadius: '0.5rem',
                    border: '2px solid #4B5563',
                    backgroundColor: '#374151',
                    color: 'white',
                    fontSize: '0.9375rem'
                  }}
                />
              </div>
              <div>
                <label htmlFor="examName" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#D1D5DB', marginBottom: '0.375rem' }}>
                  Exam Name
                </label>
                <input
                  type="text"
                  id="examName"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  placeholder="e.g., Mid-Term Examination"
                  style={{
                    width: '100%',
                    height: '2.75rem',
                    padding: '0 1rem',
                    borderRadius: '0.5rem',
                    border: '2px solid #4B5563',
                    backgroundColor: '#374151',
                    color: 'white',
                    fontSize: '0.9375rem'
                  }}
                />
              </div>
              <div>
                <label htmlFor="className" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#D1D5DB', marginBottom: '0.375rem' }}>
                  Class
                </label>
                <input
                  type="text"
                  id="className"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g., Grade 8"
                  style={{
                    width: '100%',
                    height: '2.75rem',
                    padding: '0 1rem',
                    borderRadius: '0.5rem',
                    border: '2px solid #4B5563',
                    backgroundColor: '#374151',
                    color: 'white',
                    fontSize: '0.9375rem'
                  }}
                />
              </div>
              <div>
                <label htmlFor="date" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#D1D5DB', marginBottom: '0.375rem' }}>
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={worksheetDate}
                  onChange={(e) => setWorksheetDate(e.target.value)}
                  style={{
                    width: '100%',
                    height: '2.75rem',
                    padding: '0 1rem',
                    borderRadius: '0.5rem',
                    border: '2px solid #4B5563',
                    backgroundColor: '#374151',
                    color: 'white',
                    fontSize: '0.9375rem'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Selected Questions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Selected Questions
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedQuestions.length} question{selectedQuestions.length !== 1 ? "s" : ""} | {totalMarks} total marks
                </p>
              </div>
              {selectedQuestions.length > 0 && (
                <button
                  onClick={() => setSelectedQuestions([])}
                  className="text-sm text-red-500 hover:text-red-600 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            {selectedQuestions.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="h-8 w-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No questions selected yet.
                  <br />
                  Click questions from the bank to add them.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[60vh] overflow-y-auto">
                {selectedQuestions.map((sq, index) => (
                  <div
                    key={sq.question.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Order controls */}
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => moveQuestionUp(index)}
                          disabled={index === 0}
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Move up"
                        >
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        </button>
                        <span className="text-xs font-bold text-gray-400 text-center">
                          {index + 1}
                        </span>
                        <button
                          onClick={() => moveQuestionDown(index)}
                          disabled={index === selectedQuestions.length - 1}
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Move down"
                        >
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>

                      {/* Question info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                          {sq.question.questionText}
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge variant={getDifficultyVariant(sq.question.difficulty)} className="text-xs">
                            {sq.question.difficulty}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {formatQuestionType(sq.question.questionType)}
                          </Badge>
                        </div>
                        {/* Custom marks input */}
                        <div className="flex items-center gap-2 mt-2">
                          <label className="text-xs text-gray-500 dark:text-gray-400">Marks:</label>
                          <input
                            type="number"
                            min="1"
                            value={sq.customMarks ?? sq.question.marks}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if (val > 0) {
                                updateCustomMarks(sq.question.id, val);
                              }
                            }}
                            className="w-16 h-7 px-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() => removeQuestion(sq.question.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        aria-label="Remove question"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Question Bank */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Question Bank
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowQuestionBank(!showQuestionBank)}
                >
                  {showQuestionBank ? "Hide" : "Show"}
                </Button>
              </div>

              {showQuestionBank && (
                <div className="space-y-3">
                  {/* Search */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search questions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                      aria-label="Search questions"
                    />
                    {isSearching ? (
                      <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                    ) : (
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    )}
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                        aria-label="Clear search"
                      >
                        <X className="h-3 w-3 text-gray-400" />
                      </button>
                    )}
                  </div>

                  {/* Filters */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="h-9 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      aria-label="Filter by subject"
                    >
                      <option value="">All Subjects</option>
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      disabled={!selectedSubject}
                      className="h-9 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm disabled:opacity-50"
                      aria-label="Filter by topic"
                    >
                      <option value="">All Topics</option>
                      {availableTopics.map((topic) => (
                        <option key={topic.id} value={topic.id}>
                          {topic.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value as QuestionType | "")}
                      className="h-9 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      aria-label="Filter by type"
                    >
                      {questionTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value as Difficulty | "")}
                      className="h-9 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      aria-label="Filter by difficulty"
                    >
                      {difficultyLevels.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                      className={`
                        flex items-center gap-1 h-9 px-3 rounded-lg border text-sm font-medium transition-all
                        ${showFavoritesOnly
                          ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400"
                          : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-400"
                        }
                      `}
                      aria-pressed={showFavoritesOnly}
                    >
                      <Star className={`h-4 w-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
                    </button>

                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {showQuestionBank && (
              <>
                {/* Error State */}
                {error && (
                  <div className="p-4 m-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">{error}</span>
                    </div>
                  </div>
                )}

                {/* Loading State */}
                {isLoading ? (
                  <div className="p-4 space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <Skeleton className="h-4 w-4" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <div className="flex gap-2">
                            <Skeleton className="h-5 w-12" />
                            <Skeleton className="h-5 w-16" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : questions.length === 0 ? (
                  /* Empty State */
                  <div className="p-8 text-center">
                    <Search className="h-8 w-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {hasActiveFilters
                        ? "No questions match your filters"
                        : "No questions in your bank yet"}
                    </p>
                    {!hasActiveFilters && (
                      <Button asChild size="sm" className="mt-3">
                        <Link href="/dashboard/generate">Generate Questions</Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  /* Questions List */
                  <>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[60vh] overflow-y-auto">
                      {questions.map((question) => {
                        const isSelected = isQuestionSelected(question.id);
                        return (
                          <div
                            key={question.id}
                            className={`
                              p-4 cursor-pointer transition-colors
                              ${isSelected
                                ? "bg-blue-50 dark:bg-blue-900/20"
                                : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                              }
                            `}
                            onClick={() => {
                              if (isSelected) {
                                removeQuestion(question.id);
                              } else {
                                addQuestion(question);
                              }
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`
                                flex-shrink-0 mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors
                                ${isSelected
                                  ? "bg-blue-500 border-blue-500"
                                  : "border-gray-300 dark:border-gray-600"
                                }
                              `}>
                                {isSelected && <Check className="h-3 w-3 text-white" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <Badge variant={getDifficultyVariant(question.difficulty)} className="text-xs">
                                    {question.difficulty}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {formatQuestionType(question.questionType)}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {question.marks} mark{question.marks > 1 ? "s" : ""}
                                  </Badge>
                                  {question.isFavorite && (
                                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                  )}
                                </div>
                                <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                                  {question.questionText}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {getDisplayEmoji(question.topic.subject.icon)} {question.topic.subject.name} / {question.topic.name}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination info */}
                    {pagination && (
                      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Showing {(currentPage - 1) * 20 + 1}-{Math.min(currentPage * 20, pagination.total)} of {pagination.total}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                            disabled={currentPage === pagination.totalPages}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
