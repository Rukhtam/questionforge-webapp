"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import type { QuestionType, Difficulty } from "@prisma/client";
import { getDisplayEmoji } from "@/lib/utils/emoji";
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
  Plus,
  Search,
  Star,
  Trash2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
  Check,
  Loader2,
  Heart,
} from "lucide-react";

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

// RTL subjects that need right-to-left text direction
const RTL_SUBJECTS = ["Urdu", "Islamiyat"];

// Helper function to check if a subject requires RTL direction
const isRTLSubject = (subjectName: string): boolean => {
  return RTL_SUBJECTS.includes(subjectName);
};

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

export default function FavoritesPage() {
  // Data state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  // Filter state
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [selectedType, setSelectedType] = useState<QuestionType | "">("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | "">("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Debounced search
  const debouncedSearch = useDebounce(searchQuery, 300);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [togglingFavorite, setTogglingFavorite] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);

  // Get available topics based on selected subject
  const availableTopics = subjects.find((s) => s.id === selectedSubject)?.topics || [];

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

  // Fetch favorite questions with filters
  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("page", currentPage.toString());
      params.set("limit", "20");
      params.set("isFavorite", "true"); // Always filter for favorites

      if (selectedSubject) params.set("subjectId", selectedSubject);
      if (selectedTopic) params.set("topicId", selectedTopic);
      if (selectedType) params.set("questionType", selectedType);
      if (selectedDifficulty) params.set("difficulty", selectedDifficulty);
      if (debouncedSearch) params.set("search", debouncedSearch);

      const response = await fetch(`/api/questions?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setQuestions(data.data.questions);
        setPagination(data.data.pagination);
      } else {
        setError(data.error || "Failed to fetch favorites");
      }
    } catch (err) {
      console.error("Error fetching favorites:", err);
      setError("Failed to fetch favorites. Please try again.");
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
    debouncedSearch,
  ]);

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Show searching indicator when typing
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
  }, [selectedSubject, selectedTopic, selectedType, selectedDifficulty, debouncedSearch]);

  // Remove from favorites (optimistic update)
  async function handleRemoveFavorite(questionId: string) {
    // Optimistic update - remove from list
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    if (pagination) {
      setPagination({ ...pagination, total: pagination.total - 1 });
    }
    setTogglingFavorite(questionId);

    try {
      const response = await fetch(`/api/questions/${questionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: false }),
      });

      const data = await response.json();
      if (!data.success) {
        // Revert on error - refetch the list
        fetchQuestions();
        toast.error("Failed to remove from favorites");
      } else {
        toast.success("Removed from favorites");
      }
    } catch (err) {
      // Revert on error - refetch the list
      fetchQuestions();
      toast.error("Failed to remove from favorites");
    } finally {
      setTogglingFavorite(null);
    }
  }

  // Open delete dialog
  function openDeleteDialog(question: Question) {
    setQuestionToDelete(question);
    setDeleteDialogOpen(true);
  }

  // Delete question
  async function handleDelete() {
    if (!questionToDelete) return;

    setDeletingId(questionToDelete.id);
    try {
      const response = await fetch(`/api/questions/${questionToDelete.id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        setQuestions((prev) => prev.filter((q) => q.id !== questionToDelete.id));
        if (pagination) {
          setPagination({ ...pagination, total: pagination.total - 1 });
        }
        toast.success("Question deleted successfully");
      } else {
        toast.error("Failed to delete question");
      }
    } catch (err) {
      toast.error("Failed to delete question");
    } finally {
      setDeletingId(null);
      setDeleteDialogOpen(false);
      setQuestionToDelete(null);
    }
  }

  // Clear all filters
  function clearFilters() {
    setSelectedSubject("");
    setSelectedTopic("");
    setSelectedType("");
    setSelectedDifficulty("");
    setSearchQuery("");
  }

  const hasActiveFilters =
    selectedSubject ||
    selectedTopic ||
    selectedType ||
    selectedDifficulty ||
    searchQuery;

  // Generate page numbers
  const pageNumbers = useMemo(() => {
    if (!pagination) return [];
    const pages: (number | "ellipsis")[] = [];
    const totalPages = pagination.totalPages;
    const current = currentPage;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (current > 3) {
        pages.push("ellipsis");
      }
      for (let i = Math.max(2, current - 1); i <= Math.min(totalPages - 1, current + 1); i++) {
        pages.push(i);
      }
      if (current < totalPages - 2) {
        pages.push("ellipsis");
      }
      pages.push(totalPages);
    }

    return pages;
  }, [pagination, currentPage]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: "Favorites" }]} />

      {/* Page Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="md:flex-row md:items-center md:justify-between">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Star style={{ height: '1.75rem', width: '1.75rem', color: '#FBBF24', fill: '#FBBF24' }} />
            Favorite Questions
          </h1>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9375rem', color: '#D1D5DB' }}>
            {pagination
              ? `${pagination.total} favorite question${pagination.total !== 1 ? "s" : ""}`
              : "Loading..."}
          </p>
        </div>
        <Button asChild className="shadow-md">
          <Link href="/dashboard/generate" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus style={{ height: '1.25rem', width: '1.25rem' }} />
            Generate New
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div style={{
        backgroundColor: '#1F2937',
        borderRadius: '0.75rem',
        border: '2px solid #374151',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {/* Search Row */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search favorite questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '3rem',
              paddingLeft: '3rem',
              paddingRight: '3rem',
              borderRadius: '0.75rem',
              border: '2px solid #4B5563',
              backgroundColor: '#374151',
              color: 'white',
              fontSize: '0.9375rem',
            }}
            aria-label="Search favorite questions"
          />
          {isSearching ? (
            <Loader2 style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              height: '1.25rem',
              width: '1.25rem',
              color: '#9CA3AF'
            }} className="animate-spin" />
          ) : (
            <Search style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              height: '1.25rem',
              width: '1.25rem',
              color: '#9CA3AF'
            }} />
          )}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                padding: '0.375rem',
                borderRadius: '0.375rem',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
              aria-label="Clear search"
            >
              <X style={{ height: '1rem', width: '1rem', color: '#9CA3AF' }} />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.75rem'
        }} className="md:grid-cols-4">
          {/* Subject */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            style={{
              height: '3rem',
              padding: '0 0.875rem',
              borderRadius: '0.75rem',
              border: '2px solid #4B5563',
              backgroundColor: '#374151',
              color: 'white',
              fontSize: '0.875rem',
            }}
            aria-label="Filter by subject"
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {getDisplayEmoji(subject.icon)} {subject.name}
              </option>
            ))}
          </select>

          {/* Topic */}
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            disabled={!selectedSubject}
            style={{
              height: '3rem',
              padding: '0 0.875rem',
              borderRadius: '0.75rem',
              border: '2px solid #4B5563',
              backgroundColor: '#374151',
              color: 'white',
              fontSize: '0.875rem',
              opacity: !selectedSubject ? 0.5 : 1,
            }}
            aria-label="Filter by topic"
          >
            <option value="">All Topics</option>
            {availableTopics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>

          {/* Type */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as QuestionType | "")}
            style={{
              height: '3rem',
              padding: '0 0.875rem',
              borderRadius: '0.75rem',
              border: '2px solid #4B5563',
              backgroundColor: '#374151',
              color: 'white',
              fontSize: '0.875rem',
            }}
            aria-label="Filter by question type"
          >
            {questionTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          {/* Difficulty */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value as Difficulty | "")}
            style={{
              height: '3rem',
              padding: '0 0.875rem',
              borderRadius: '0.75rem',
              border: '2px solid #4B5563',
              backgroundColor: '#374151',
              color: 'white',
              fontSize: '0.875rem',
            }}
            aria-label="Filter by difficulty"
          >
            {difficultyLevels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            style={{
              fontSize: '0.875rem',
              color: '#60A5FA',
              fontWeight: '500',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div style={{
          padding: '1rem',
          borderRadius: '0.75rem',
          backgroundColor: 'rgba(127, 29, 29, 0.2)',
          border: '1px solid #991B1B'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#F87171' }}>
            <AlertTriangle style={{ height: '1.25rem', width: '1.25rem' }} />
            <span style={{ fontSize: '0.9375rem' }}>{error}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center gap-4 mb-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-16 rounded" />
                    <Skeleton className="h-5 w-20 rounded" />
                    <Skeleton className="h-5 w-14 rounded" />
                  </div>
                  <Skeleton className="h-4 w-3/4 rounded" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-10 w-10 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : questions.length === 0 ? (
        /* Empty State */
        <div style={{
          backgroundColor: '#1F2937',
          borderRadius: '0.75rem',
          border: '2px solid #374151',
          padding: '3rem',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'inline-flex',
            padding: '1rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(251, 191, 36, 0.2)',
            marginBottom: '1rem'
          }}>
            <Heart style={{ height: '2rem', width: '2rem', color: '#FBBF24' }} />
          </div>
          <h3 style={{ fontWeight: '600', color: 'white', marginBottom: '0.5rem', fontSize: '1rem' }}>
            {hasActiveFilters ? "No favorites match your filters" : "No favorite questions yet"}
          </h3>
          <p style={{ color: '#9CA3AF', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {hasActiveFilters
              ? "Try adjusting your filters or clear them to see all favorites"
              : "Star questions from your question bank to see them here"}
          </p>
          {hasActiveFilters ? (
            <Button variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          ) : (
            <Button asChild>
              <Link href="/dashboard/questions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Browse Questions
              </Link>
            </Button>
          )}
        </div>
      ) : (
        /* Questions List */
        <>
          <div className="space-y-4">
            {questions.map((question, index) => (
              <FavoriteQuestionItem
                key={question.id}
                question={question}
                index={(currentPage - 1) * 20 + index + 1}
                isExpanded={expandedQuestion === question.id}
                onToggleExpand={() =>
                  setExpandedQuestion(expandedQuestion === question.id ? null : question.id)
                }
                onRemoveFavorite={() => handleRemoveFavorite(question.id)}
                onDelete={() => openDeleteDialog(question)}
                isTogglingFavorite={togglingFavorite === question.id}
                isDeleting={deletingId === question.id}
              />
            ))}
          </div>
        </>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 border-t border-gray-200 dark:border-gray-700 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="h-9 w-9 p-0"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {pageNumbers.map((page, i) =>
            page === "ellipsis" ? (
              <span key={`ellipsis-${i}`} className="px-2 text-gray-400">
                ...
              </span>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="h-9 w-9 p-0"
              >
                {page}
              </Button>
            )
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={currentPage === pagination.totalPages}
            className="h-9 w-9 p-0"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Question</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this question? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {questionToDelete && (
            <div className="my-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                {questionToDelete.questionText}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              isLoading={!!deletingId}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Favorite Question List Item Component
function FavoriteQuestionItem({
  question,
  index,
  isExpanded,
  onToggleExpand,
  onRemoveFavorite,
  onDelete,
  isTogglingFavorite,
  isDeleting,
}: {
  question: Question;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onRemoveFavorite: () => void;
  onDelete: () => void;
  isTogglingFavorite: boolean;
  isDeleting: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

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

  const formatQuestionType = (type: QuestionType) => {
    const labels: Record<QuestionType, string> = {
      MCQ: "MCQ",
      FILL_BLANK: "Fill Blank",
      SHORT_ANSWER: "Short Answer",
      LONG_ANSWER: "Long Answer",
      TRUE_FALSE: "True/False",
    };
    return labels[type];
  };

  return (
    <div
      style={{
        backgroundColor: '#1F2937',
        borderRadius: '0.75rem',
        border: isHovered ? '2px solid #FBBF24' : '2px solid #374151',
        overflow: 'hidden',
        transition: 'border-color 0.2s ease'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Question Header */}
      <div style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          {/* Index */}
          <span style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '2.75rem',
            height: '2.75rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(251, 191, 36, 0.2)',
            color: '#FBBF24',
            fontWeight: '700',
            fontSize: '0.9375rem'
          }}>
            {index}
          </span>

          {/* Question Content */}
          <div
            style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
            onClick={onToggleExpand}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onToggleExpand()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem', flexWrap: 'wrap' }}>
              <Badge variant={getDifficultyVariant(question.difficulty)}>
                {question.difficulty}
              </Badge>
              <Badge variant="secondary">
                {formatQuestionType(question.questionType)}
              </Badge>
              <Badge variant="secondary">
                {question.marks} mark{question.marks > 1 ? "s" : ""}
              </Badge>
              {question.isAiGenerated && (
                <Badge variant="purple">AI</Badge>
              )}
              <span style={{ fontSize: '0.8125rem', color: '#9CA3AF' }}>
                {getDisplayEmoji(question.topic.subject.icon)} {question.topic.subject.name} / {question.topic.name}
              </span>
            </div>

            <p
              style={{
                color: 'white',
                fontSize: '0.9375rem',
                lineHeight: '1.5',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textAlign: isRTLSubject(question.topic.subject.name) ? 'right' : 'left'
              }}
              dir={isRTLSubject(question.topic.subject.name) ? "rtl" : "ltr"}
            >
              {question.questionText}
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
            {/* Remove from Favorites Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFavorite();
              }}
              disabled={isTogglingFavorite}
              style={{
                padding: '0.625rem',
                borderRadius: '0.5rem',
                color: '#FBBF24',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: isTogglingFavorite ? 'not-allowed' : 'pointer',
                opacity: isTogglingFavorite ? 0.5 : 1,
                transition: 'background-color 0.2s ease'
              }}
              aria-label="Remove from favorites"
              title="Remove from favorites"
            >
              <Star style={{ height: '1.375rem', width: '1.375rem', fill: '#FBBF24' }} />
            </button>

            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              disabled={isDeleting}
              style={{
                padding: '0.625rem',
                borderRadius: '0.5rem',
                color: '#9CA3AF',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: isDeleting ? 'not-allowed' : 'pointer',
                opacity: isDeleting ? 0.5 : 1,
                transition: 'color 0.2s ease'
              }}
              aria-label="Delete question"
            >
              <Trash2 style={{ height: '1.375rem', width: '1.375rem' }} />
            </button>

            {/* Expand Arrow */}
            <button
              onClick={onToggleExpand}
              style={{
                padding: '0.625rem',
                borderRadius: '0.5rem',
                color: '#9CA3AF',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              aria-label={isExpanded ? "Collapse" : "Expand"}
              aria-expanded={isExpanded}
            >
              <ChevronDown style={{
                height: '1.375rem',
                width: '1.375rem',
                transition: 'transform 0.2s ease',
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
              }} />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div style={{ borderTop: '1px solid #374151' }}>
          {/* MCQ Options */}
          {question.questionType === "MCQ" && question.options && (
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: 'rgba(17, 24, 39, 0.5)' }}>
              {Object.entries(question.options).map(([key, value]) => {
                const isRTL = isRTLSubject(question.topic.subject.name);
                const isCorrect = question.correctAnswer === key;
                return (
                  <div
                    key={key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      backgroundColor: isCorrect ? 'rgba(34, 197, 94, 0.15)' : '#374151',
                      border: isCorrect ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid transparent',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '2rem',
                      height: '2rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      backgroundColor: isCorrect ? '#22C55E' : '#4B5563',
                      color: isCorrect ? 'white' : '#D1D5DB'
                    }}>
                      {key}
                    </span>
                    <span style={{
                      flex: 1,
                      color: '#E5E7EB',
                      textAlign: isRTL ? 'right' : 'left',
                      fontSize: '0.9375rem'
                    }} dir={isRTL ? "rtl" : "ltr"}>
                      {value}
                    </span>
                    {isCorrect && (
                      <Check style={{ flexShrink: 0, marginLeft: 'auto', height: '1.25rem', width: '1.25rem', color: '#22C55E' }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Answer & Explanation */}
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {question.questionType !== "MCQ" && (
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Correct Answer
                </span>
                <p style={{
                  marginTop: '0.5rem',
                  color: 'white',
                  fontWeight: '500',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(34, 197, 94, 0.15)',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  textAlign: isRTLSubject(question.topic.subject.name) ? 'right' : 'left',
                  fontSize: '0.9375rem'
                }} dir={isRTLSubject(question.topic.subject.name) ? "rtl" : "ltr"}>
                  {question.correctAnswer}
                </p>
              </div>
            )}

            {question.explanation && (
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Explanation
                </span>
                <p style={{
                  marginTop: '0.5rem',
                  color: '#D1D5DB',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  textAlign: isRTLSubject(question.topic.subject.name) ? 'right' : 'left',
                  fontSize: '0.9375rem',
                  lineHeight: '1.5'
                }} dir={isRTLSubject(question.topic.subject.name) ? "rtl" : "ltr"}>
                  {question.explanation}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
