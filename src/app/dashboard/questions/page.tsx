"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import type { QuestionType, Difficulty } from "@prisma/client";
import { getDisplayEmoji } from "@/lib/utils/emoji";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  ArrowUpDown,
  Filter,
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

// Sort options
const sortOptions = [
  { value: "createdAt:desc", label: "Newest First" },
  { value: "createdAt:asc", label: "Oldest First" },
  { value: "difficulty:asc", label: "Difficulty: Easy to Hard" },
  { value: "difficulty:desc", label: "Difficulty: Hard to Easy" },
  { value: "marks:desc", label: "Marks: High to Low" },
  { value: "marks:asc", label: "Marks: Low to High" },
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

export default function QuestionsPage() {
  // Data state
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
  const [sortBy, setSortBy] = useState("createdAt:desc");
  const [resultsPerPage, setResultsPerPage] = useState(10);

  // Debounced search
  const debouncedSearch = useDebounce(searchQuery, 300);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingFavorite, setTogglingFavorite] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Single delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);

  // Get available topics based on selected subject
  const availableTopics = subjects.find((s) => s.id === selectedSubject)?.topics || [];

  // Selection helpers
  const allSelected = questions.length > 0 && selectedIds.size === questions.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < questions.length;

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

  // Fetch questions with filters
  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("page", currentPage.toString());
      params.set("limit", resultsPerPage.toString());

      const [sortField, sortOrder] = sortBy.split(":");
      params.set("sortBy", sortField);
      params.set("sortOrder", sortOrder);

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
        setSelectedIds(new Set()); // Clear selection on page change
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
    resultsPerPage,
    sortBy,
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
  }, [selectedSubject, selectedTopic, selectedType, selectedDifficulty, showFavoritesOnly, debouncedSearch, resultsPerPage]);

  // Toggle favorite with optimistic update
  async function handleToggleFavorite(questionId: string, currentValue: boolean) {
    // Optimistic update
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, isFavorite: !currentValue } : q))
    );
    setTogglingFavorite(questionId);

    try {
      const response = await fetch(`/api/questions/${questionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !currentValue }),
      });

      const data = await response.json();
      if (!data.success) {
        // Revert on error
        setQuestions((prev) =>
          prev.map((q) => (q.id === questionId ? { ...q, isFavorite: currentValue } : q))
        );
        toast.error("Failed to update favorite status");
      } else {
        toast.success(currentValue ? "Removed from favorites" : "Added to favorites");
      }
    } catch (err) {
      // Revert on error
      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? { ...q, isFavorite: currentValue } : q))
      );
      toast.error("Failed to update favorite status");
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
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(questionToDelete.id);
          return next;
        });
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

  // Bulk delete
  async function handleBulkDelete() {
    setIsBulkDeleting(true);
    const idsToDelete = Array.from(selectedIds);
    let successCount = 0;
    let failCount = 0;

    for (const id of idsToDelete) {
      try {
        const response = await fetch(`/api/questions/${id}`, {
          method: "DELETE",
        });
        const data = await response.json();
        if (data.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }

    // Refresh data
    await fetchQuestions();
    setSelectedIds(new Set());
    setShowBulkDeleteDialog(false);
    setIsBulkDeleting(false);

    if (successCount > 0) {
      toast.success(`Deleted ${successCount} question${successCount > 1 ? "s" : ""}`);
    }
    if (failCount > 0) {
      toast.error(`Failed to delete ${failCount} question${failCount > 1 ? "s" : ""}`);
    }
  }

  // Toggle selection
  function toggleSelection(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  // Select all
  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(questions.map((q) => q.id)));
    }
  }

  // Clear all filters
  function clearFilters() {
    setSelectedSubject("");
    setSelectedTopic("");
    setSelectedType("");
    setSelectedDifficulty("");
    setShowFavoritesOnly(false);
    setSearchQuery("");
    setSortBy("createdAt:desc");
  }

  const hasActiveFilters =
    selectedSubject ||
    selectedTopic ||
    selectedType ||
    selectedDifficulty ||
    showFavoritesOnly ||
    searchQuery;

  const activeFilterCount = [
    selectedSubject,
    selectedTopic,
    selectedType,
    selectedDifficulty,
    showFavoritesOnly,
    searchQuery,
  ].filter(Boolean).length;

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
      <Breadcrumb items={[{ label: "Question Bank" }]} />

      {/* Page Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'center' }} className="md:flex-row md:items-center md:justify-between md:text-left">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700' }} className="text-gray-900 dark:text-white">Question Bank</h1>
          <p style={{ marginTop: '0.375rem', fontSize: '0.9375rem' }} className="text-gray-600 dark:text-gray-300">
            {pagination ? `${pagination.total} question${pagination.total !== 1 ? "s" : ""} total` : "Loading..."}
          </p>
        </div>
        <Button asChild style={{ padding: '0.75rem 1.5rem', fontSize: '0.9375rem' }} className="shadow-md">
          <Link href="/dashboard/generate" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus style={{ height: '1.25rem', width: '1.25rem' }} />
            Generate New
          </Link>
        </Button>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div 
          style={{ 
            padding: '1rem 1.25rem', 
            borderRadius: '0.75rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            border: '1px solid'
          }}
          className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 animate-in slide-in-from-top-2"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Check style={{ height: '1.375rem', width: '1.375rem' }} className="text-blue-600 dark:text-blue-400" />
            <span style={{ fontWeight: '500', fontSize: '0.9375rem' }} className="text-blue-700 dark:text-blue-300">
              {selectedIds.size} question{selectedIds.size > 1 ? "s" : ""} selected
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
            >
              Clear Selection
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowBulkDeleteDialog(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Trash2 style={{ height: '1rem', width: '1rem' }} />
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div 
        style={{ 
          padding: '1.25rem', 
          borderRadius: '0.875rem',
          border: '1px solid',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
        className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
      >
        {/* Search and Sort Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search - QUICK WIN #7: Search bar accessibility (48px height) */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                width: '100%', 
                height: '3rem', 
                paddingLeft: '3rem', 
                paddingRight: '3rem', 
                borderRadius: '0.75rem',
                fontSize: '0.9375rem'
              }}
              className="border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              aria-label="Search questions"
            />
            {isSearching ? (
              <Loader2 style={{ height: '1.25rem', width: '1.25rem' }} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
            ) : (
              <Search style={{ height: '1.25rem', width: '1.25rem' }} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            )}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{ padding: '0.375rem', borderRadius: '0.5rem' }}
                className="absolute right-4 top-1/2 -translate-y-1/2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                aria-label="Clear search"
              >
                <X style={{ height: '1rem', width: '1rem' }} className="text-gray-400" />
              </button>
            )}
          </div>

          {/* Sort - QUICK WIN #7: Consistent height */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowUpDown style={{ height: '1.25rem', width: '1.25rem', flexShrink: 0 }} className="text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ 
                height: '3rem', 
                paddingLeft: '1rem', 
                paddingRight: '1rem', 
                borderRadius: '0.75rem',
                fontSize: '0.875rem'
              }}
              className="border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              aria-label="Sort by"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Toggle (Mobile) */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            className="sm:hidden"
          >
            <Filter style={{ height: '1rem', width: '1rem' }} />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="default" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Filter Dropdowns - QUICK WIN #6 & #7: Improved spacing and accessibility */}
        <div className={`grid grid-cols-2 md:grid-cols-5 gap-3 ${!showFilters ? "hidden sm:grid" : ""}`}>
          {/* Subject */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            style={{ 
              height: '3rem', 
              paddingLeft: '1rem', 
              paddingRight: '1rem', 
              borderRadius: '0.75rem',
              fontSize: '0.875rem'
            }}
            className="border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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
              paddingLeft: '1rem', 
              paddingRight: '1rem', 
              borderRadius: '0.75rem',
              fontSize: '0.875rem'
            }}
            className="border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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
              paddingLeft: '1rem', 
              paddingRight: '1rem', 
              borderRadius: '0.75rem',
              fontSize: '0.875rem'
            }}
            className="border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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
              paddingLeft: '1rem', 
              paddingRight: '1rem', 
              borderRadius: '0.75rem',
              fontSize: '0.875rem'
            }}
            className="border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            aria-label="Filter by difficulty"
          >
            {difficultyLevels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>

          {/* Favorites Toggle */}
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              height: '3rem',
              paddingLeft: '1rem',
              paddingRight: '1rem',
              borderRadius: '0.75rem',
              borderWidth: '2px',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 150ms ease'
            }}
            className={`
              ${
                showFavoritesOnly
                  ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400"
                  : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-400"
              }
            `}
            aria-pressed={showFavoritesOnly}
          >
            <Star style={{ height: '1.125rem', width: '1.125rem' }} className={showFavoritesOnly ? "fill-current" : ""} />
            Favorites
          </button>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            style={{ fontSize: '0.875rem', fontWeight: '500' }}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
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
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="inline-flex p-4 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="font-medium text-gray-900 dark:text-white mb-1">
            {hasActiveFilters ? "No questions match your filters" : "No questions yet"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {hasActiveFilters
              ? "Try adjusting your filters or clear them to see all questions"
              : "Start generating questions to build your question bank"}
          </p>
          {hasActiveFilters ? (
            <Button variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          ) : (
            <Button asChild>
              <Link href="/dashboard/generate" className="gap-2">
                <Plus className="h-5 w-5" />
                Generate Questions
              </Link>
            </Button>
          )}
        </div>
      ) : (
        /* Questions List */
        <>
          {/* Select All Header */}
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              padding: '0.875rem 1.25rem',
              borderRadius: '0.75rem',
              backgroundColor: 'rgba(31, 41, 55, 0.5)'
            }}
            className="bg-gray-50 dark:bg-gray-800/50"
          >
            <Checkbox
              checked={allSelected}
              indeterminate={someSelected}
              onChange={toggleSelectAll}
              aria-label="Select all questions"
            />
            <span style={{ fontSize: '0.9375rem', fontWeight: '500' }} className="text-gray-600 dark:text-gray-400">
              {allSelected ? "Deselect all" : "Select all"}
            </span>
          </div>

          <div className="space-y-4">
            {questions.map((question, index) => (
              <QuestionListItem
                key={question.id}
                question={question}
                index={(currentPage - 1) * resultsPerPage + index + 1}
                isExpanded={expandedQuestion === question.id}
                isSelected={selectedIds.has(question.id)}
                onToggleSelect={() => toggleSelection(question.id)}
                onToggleExpand={() =>
                  setExpandedQuestion(expandedQuestion === question.id ? null : question.id)
                }
                onToggleFavorite={() => handleToggleFavorite(question.id, question.isFavorite)}
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          {/* Results per page */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Show</span>
            <select
              value={resultsPerPage}
              onChange={(e) => setResultsPerPage(Number(e.target.value))}
              className="h-9 px-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-600 dark:text-gray-400">per page</span>
          </div>

          {/* Page Navigation */}
          <div className="flex items-center gap-1">
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

          {/* Page info */}
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Showing {(currentPage - 1) * resultsPerPage + 1}-
            {Math.min(currentPage * resultsPerPage, pagination.total)} of {pagination.total}
          </span>
        </div>
      )}

      {/* Single Delete Confirmation Dialog */}
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

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {selectedIds.size} Questions</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedIds.size} question
              {selectedIds.size > 1 ? "s" : ""}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              isLoading={isBulkDeleting}
            >
              Delete {selectedIds.size} Question{selectedIds.size > 1 ? "s" : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Question List Item Component
function QuestionListItem({
  question,
  index,
  isExpanded,
  isSelected,
  onToggleSelect,
  onToggleExpand,
  onToggleFavorite,
  onDelete,
  isTogglingFavorite,
  isDeleting,
}: {
  question: Question;
  index: number;
  isExpanded: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
  onToggleExpand: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
  isTogglingFavorite: boolean;
  isDeleting: boolean;
}) {
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

  // QUICK WIN #6: Question card layout with better borders
  return (
    <div
      style={{
        borderRadius: '0.875rem',
        borderWidth: '2px',
        overflow: 'hidden',
        transition: 'all 0.2s ease'
      }}
      className={`
        bg-white dark:bg-gray-800 card-hover
        ${isSelected
          ? "border-blue-500 ring-2 ring-blue-500/20"
          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg"
        }
      `}
    >
      {/* Question Header - Always Visible - QUICK WIN #6: Improved padding */}
      <div style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          {/* Checkbox */}
          <div 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              paddingTop: '0.625rem',
              paddingLeft: '0.25rem'
            }}
          >
            <Checkbox
              checked={isSelected}
              onChange={onToggleSelect}
              aria-label={`Select question ${index}`}
            />
          </div>

          {/* Index */}
          <span 
            style={{ 
              flexShrink: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '2.75rem', 
              height: '2.75rem', 
              borderRadius: '9999px',
              fontWeight: '700',
              fontSize: '0.9375rem'
            }}
            className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
          >
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
              <span style={{ fontSize: '0.8125rem', marginLeft: '0.25rem' }} className="text-gray-500 dark:text-gray-400">
                {getDisplayEmoji(question.topic.subject.icon)} {question.topic.subject.name} / {question.topic.name}
              </span>
            </div>

            <p
              style={{ fontSize: '0.9375rem', lineHeight: '1.5' }}
              className={`text-gray-900 dark:text-white line-clamp-2 ${
                isRTLSubject(question.topic.subject.name) ? "text-right" : ""
              }`}
              dir={isRTLSubject(question.topic.subject.name) ? "rtl" : "ltr"}
            >
              {question.questionText}
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
            {/* Favorite Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              disabled={isTogglingFavorite}
              style={{ padding: '0.625rem', borderRadius: '0.5rem', transition: 'all 0.2s ease' }}
              className={`${
                question.isFavorite
                  ? "text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 scale-110"
                  : "text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              aria-label={question.isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Star style={{ height: '1.375rem', width: '1.375rem' }} className={question.isFavorite ? "fill-current" : ""} />
            </button>

            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              disabled={isDeleting}
              style={{ padding: '0.625rem', borderRadius: '0.5rem', transition: 'all 0.2s ease' }}
              className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
              aria-label="Delete question"
            >
              <Trash2 style={{ height: '1.375rem', width: '1.375rem' }} />
            </button>

            {/* Expand Arrow */}
            <button
              onClick={onToggleExpand}
              style={{ padding: '0.625rem', borderRadius: '0.5rem', transition: 'all 0.2s ease' }}
              className="text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label={isExpanded ? "Collapse" : "Expand"}
              aria-expanded={isExpanded}
            >
              <ChevronDown 
                style={{ height: '1.375rem', width: '1.375rem', transition: 'transform 0.2s ease' }} 
                className={isExpanded ? "rotate-180" : ""} 
              />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 animate-in slide-in-from-top-2">
          {/* MCQ Options */}
          {question.questionType === "MCQ" && question.options && (
            <div className="p-4 space-y-2 bg-gray-50 dark:bg-gray-800/50">
              {Object.entries(question.options).map(([key, value]) => {
                const isRTL = isRTLSubject(question.topic.subject.name);
                const isCorrect = question.correctAnswer === key;
                return (
                  <div
                    key={key}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg transition-all
                      ${isCorrect
                        ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                        : "bg-white dark:bg-gray-700"
                      }
                    `}
                  >
                    <span
                      className={`
                        flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                        ${isCorrect
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                        }
                      `}
                    >
                      {key}
                    </span>
                    <span
                      className={`flex-1 text-gray-700 dark:text-gray-200 ${isRTL ? "text-right" : ""}`}
                      dir={isRTL ? "rtl" : "ltr"}
                    >
                      {value}
                    </span>
                    {isCorrect && (
                      <Check className="flex-shrink-0 ml-auto h-5 w-5 text-green-500" />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Answer & Explanation */}
          <div className="p-4 space-y-4">
            {question.questionType !== "MCQ" && (
              <div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Correct Answer
                </span>
                <p
                  className={`mt-2 text-gray-900 dark:text-white font-medium p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 ${
                    isRTLSubject(question.topic.subject.name) ? "text-right" : ""
                  }`}
                  dir={isRTLSubject(question.topic.subject.name) ? "rtl" : "ltr"}
                >
                  {question.correctAnswer}
                </p>
              </div>
            )}

            {question.explanation && (
              <div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Explanation
                </span>
                <p
                  className={`mt-2 text-gray-700 dark:text-gray-300 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800 ${
                    isRTLSubject(question.topic.subject.name) ? "text-right" : ""
                  }`}
                  dir={isRTLSubject(question.topic.subject.name) ? "rtl" : "ltr"}
                >
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
