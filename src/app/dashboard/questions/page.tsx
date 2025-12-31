"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { QuestionType, Difficulty } from "@prisma/client";
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

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingFavorite, setTogglingFavorite] = useState<string | null>(null);

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

  // Fetch questions with filters
  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("page", currentPage.toString());
      params.set("limit", "10");

      if (selectedSubject) params.set("subjectId", selectedSubject);
      if (selectedTopic) params.set("topicId", selectedTopic);
      if (selectedType) params.set("questionType", selectedType);
      if (selectedDifficulty) params.set("difficulty", selectedDifficulty);
      if (showFavoritesOnly) params.set("isFavorite", "true");
      if (searchQuery) params.set("search", searchQuery);

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
    }
  }, [
    currentPage,
    selectedSubject,
    selectedTopic,
    selectedType,
    selectedDifficulty,
    showFavoritesOnly,
    searchQuery,
  ]);

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Reset topic when subject changes
  useEffect(() => {
    setSelectedTopic("");
  }, [selectedSubject]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSubject, selectedTopic, selectedType, selectedDifficulty, showFavoritesOnly, searchQuery]);

  // Toggle favorite
  async function handleToggleFavorite(questionId: string, currentValue: boolean) {
    setTogglingFavorite(questionId);
    try {
      const response = await fetch(`/api/questions/${questionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !currentValue }),
      });

      const data = await response.json();
      if (data.success) {
        setQuestions((prev) =>
          prev.map((q) => (q.id === questionId ? { ...q, isFavorite: !currentValue } : q))
        );
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    } finally {
      setTogglingFavorite(null);
    }
  }

  // Delete question
  async function handleDelete(questionId: string) {
    if (!confirm("Are you sure you want to delete this question?")) return;

    setDeletingId(questionId);
    try {
      const response = await fetch(`/api/questions/${questionId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        setQuestions((prev) => prev.filter((q) => q.id !== questionId));
        if (pagination) {
          setPagination({ ...pagination, total: pagination.total - 1 });
        }
      }
    } catch (err) {
      console.error("Error deleting question:", err);
    } finally {
      setDeletingId(null);
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
  }

  const hasActiveFilters =
    selectedSubject ||
    selectedTopic ||
    selectedType ||
    selectedDifficulty ||
    showFavoritesOnly ||
    searchQuery;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Question Bank</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {pagination ? `${pagination.total} question${pagination.total !== 1 ? "s" : ""} total` : "Loading..."}
          </p>
        </div>
        <Link
          href="/dashboard/generate"
          className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Generate New
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* Subject */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
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
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm disabled:opacity-50"
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
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
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
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
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
            className={`
              flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors
              ${
                showFavoritesOnly
                  ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600"
                  : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400"
              }
            `}
          >
            <svg
              className={`h-4 w-4 ${showFavoritesOnly ? "fill-current" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
            Favorites
          </button>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
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
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 animate-pulse"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      ) : questions.length === 0 ? (
        /* Empty State */
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="inline-flex p-4 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
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
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              Clear filters
            </button>
          ) : (
            <Link
              href="/dashboard/generate"
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Generate Questions
            </Link>
          )}
        </div>
      ) : (
        /* Questions List */
        <div className="space-y-4">
          {questions.map((question, index) => (
            <QuestionListItem
              key={question.id}
              question={question}
              index={(currentPage - 1) * 10 + index + 1}
              isExpanded={expandedQuestion === question.id}
              onToggleExpand={() =>
                setExpandedQuestion(expandedQuestion === question.id ? null : question.id)
              }
              onToggleFavorite={() => handleToggleFavorite(question.id, question.isFavorite)}
              onDelete={() => handleDelete(question.id)}
              isTogglingFavorite={togglingFavorite === question.id}
              isDeleting={deletingId === question.id}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {pagination.totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={currentPage === pagination.totalPages}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

// Question List Item Component
function QuestionListItem({
  question,
  index,
  isExpanded,
  onToggleExpand,
  onToggleFavorite,
  onDelete,
  isTogglingFavorite,
  isDeleting,
}: {
  question: Question;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
  isTogglingFavorite: boolean;
  isDeleting: boolean;
}) {
  const getDifficultyColor = (difficulty: Difficulty) => {
    const colors: Record<Difficulty, string> = {
      EASY: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      MEDIUM: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      HARD: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      CAMBRIDGE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      CADET: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    };
    return colors[difficulty];
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
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Question Header - Always Visible */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750"
        onClick={onToggleExpand}
      >
        <div className="flex items-start gap-4">
          {/* Index */}
          <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-sm">
            {index}
          </span>

          {/* Question Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`px-2 py-0.5 text-xs font-medium rounded ${getDifficultyColor(question.difficulty)}`}>
                {question.difficulty}
              </span>
              <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                {formatQuestionType(question.questionType)}
              </span>
              <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                {question.marks} mark{question.marks > 1 ? "s" : ""}
              </span>
              {question.isAiGenerated && (
                <span className="px-2 py-0.5 text-xs font-medium rounded bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                  AI
                </span>
              )}
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {getDisplayEmoji(question.topic.subject.icon)} {question.topic.subject.name} / {question.topic.name}
              </span>
            </div>

            <p
              className={`text-gray-900 dark:text-white line-clamp-2 ${
                isRTLSubject(question.topic.subject.name) ? "text-right" : ""
              }`}
              dir={isRTLSubject(question.topic.subject.name) ? "rtl" : "ltr"}
            >
              {question.questionText}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Favorite Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              disabled={isTogglingFavorite}
              className={`p-2 rounded-lg transition-colors ${
                question.isFavorite
                  ? "text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                  : "text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <svg
                className={`h-5 w-5 ${question.isFavorite ? "fill-current" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </button>

            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              disabled={isDeleting}
              className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>

            {/* Expand Arrow */}
            <svg
              className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          {/* MCQ Options */}
          {question.questionType === "MCQ" && question.options && (
            <div className="p-4 space-y-2 bg-gray-50 dark:bg-gray-800/50">
              {Object.entries(question.options).map(([key, value]) => {
                const isRTL = isRTLSubject(question.topic.subject.name);
                return (
                  <div
                    key={key}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg
                      ${
                        question.correctAnswer === key
                          ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                          : "bg-white dark:bg-gray-700"
                      }
                    `}
                  >
                    <span
                      className={`
                        flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium
                        ${
                          question.correctAnswer === key
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
                    {question.correctAnswer === key && (
                      <svg className="flex-shrink-0 ml-auto h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Answer & Explanation */}
          <div className="p-4 space-y-3">
            {question.questionType !== "MCQ" && (
              <div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Correct Answer
                </span>
                <p
                  className={`mt-1 text-gray-900 dark:text-white font-medium ${
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
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Explanation
                </span>
                <p
                  className={`mt-1 text-gray-700 dark:text-gray-300 ${
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
