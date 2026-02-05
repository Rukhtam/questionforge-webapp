"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
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
  Trash2,
  Edit2,
  FileText,
  Calendar,
  School,
  BookOpen,
  X,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
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
  questionType: string;
  difficulty: string;
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

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

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

export default function WorksheetsPage() {
  // Data state
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Debounced search
  const debouncedSearch = useDebounce(searchQuery, 300);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [worksheetToDelete, setWorksheetToDelete] = useState<Worksheet | null>(null);

  // Fetch worksheets
  const fetchWorksheets = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("page", currentPage.toString());
      params.set("limit", "10");

      if (debouncedSearch) params.set("search", debouncedSearch);

      const response = await fetch(`/api/worksheets?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setWorksheets(data.data.worksheets);
        setPagination(data.data.pagination);
      } else {
        setError(data.error || "Failed to fetch worksheets");
      }
    } catch (err) {
      console.error("Error fetching worksheets:", err);
      setError("Failed to fetch worksheets. Please try again.");
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }, [currentPage, debouncedSearch]);

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchWorksheets();
  }, [fetchWorksheets]);

  // Show searching indicator when typing
  useEffect(() => {
    if (searchQuery !== debouncedSearch) {
      setIsSearching(true);
    }
  }, [searchQuery, debouncedSearch]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // Open delete dialog
  function openDeleteDialog(worksheet: Worksheet) {
    setWorksheetToDelete(worksheet);
    setDeleteDialogOpen(true);
  }

  // Delete worksheet
  async function handleDelete() {
    if (!worksheetToDelete) return;

    setDeletingId(worksheetToDelete.id);
    try {
      const response = await fetch(`/api/worksheets/${worksheetToDelete.id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        setWorksheets((prev) => prev.filter((w) => w.id !== worksheetToDelete.id));
        if (pagination) {
          setPagination({ ...pagination, total: pagination.total - 1 });
        }
        toast.success("Worksheet deleted successfully");
      } else {
        toast.error(data.error || "Failed to delete worksheet");
      }
    } catch (err) {
      toast.error("Failed to delete worksheet");
    } finally {
      setDeletingId(null);
      setDeleteDialogOpen(false);
      setWorksheetToDelete(null);
    }
  }

  // Format date
  function formatDate(dateString: string | null): string {
    if (!dateString) return "No date set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  // Get unique subjects from worksheet questions
  function getUniqueSubjects(questions: WorksheetQuestion[]): string[] {
    const subjects = new Set<string>();
    questions.forEach((wq) => {
      subjects.add(wq.question.topic.subject.name);
    });
    return Array.from(subjects);
  }

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
      <Breadcrumb items={[{ label: "Worksheets" }]} />

      {/* Page Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="md:flex-row md:items-center md:justify-between">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText style={{ height: '1.75rem', width: '1.75rem', color: '#60A5FA' }} />
            Worksheets
          </h1>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9375rem', color: '#D1D5DB' }}>
            {pagination
              ? `${pagination.total} worksheet${pagination.total !== 1 ? "s" : ""} created`
              : "Loading..."}
          </p>
        </div>
        <Button asChild className="shadow-md">
          <Link href="/dashboard/worksheets/new" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus style={{ height: '1.25rem', width: '1.25rem' }} />
            Create Worksheet
          </Link>
        </Button>
      </div>

      {/* Search Section */}
      <div style={{
        backgroundColor: '#1F2937',
        borderRadius: '0.75rem',
        border: '2px solid #374151',
        padding: '1.25rem'
      }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search worksheets by title, school, exam, or class..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '3.25rem',
              paddingLeft: '3.25rem',
              paddingRight: '3.25rem',
              borderRadius: '0.75rem',
              border: '2px solid #4B5563',
              backgroundColor: '#374151',
              color: 'white',
              fontSize: '1rem',
            }}
            aria-label="Search worksheets"
          />
          {isSearching ? (
            <svg
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                height: '1.375rem',
                width: '1.375rem',
                color: '#9CA3AF'
              }}
              className="animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                style={{ opacity: 0.25 }}
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                style={{ opacity: 0.75 }}
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <Search style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              height: '1.375rem',
              width: '1.375rem',
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
                padding: '0.5rem',
                borderRadius: '0.5rem',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
              aria-label="Clear search"
            >
              <X style={{ height: '1.125rem', width: '1.125rem', color: '#9CA3AF' }} />
            </button>
          )}
        </div>
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

      {/* Loading State - QUICK WIN #9: Loading skeleton consistency */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex-1">
                    <Skeleton className="h-6 w-3/4 mb-3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-12 rounded-lg" />
                    <Skeleton className="h-6 w-16 rounded-lg" />
                  </div>
                </div>
                <div className="space-y-2.5">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              </div>
              <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                <Skeleton className="h-10 flex-1 rounded-lg" />
                <Skeleton className="h-10 flex-1 rounded-lg" />
                <Skeleton className="h-10 w-10 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : worksheets.length === 0 ? (
        /* Empty State */
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '0.75rem',
          border: '2px dashed #4B5563',
          backgroundColor: 'rgba(31, 41, 55, 0.5)',
          padding: '4rem 1.5rem',
          textAlign: 'center'
        }}>
          <div style={{
            marginBottom: '1rem',
            display: 'flex',
            height: '4rem',
            width: '4rem',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '9999px',
            backgroundColor: '#374151'
          }}>
            <FileText style={{ height: '2rem', width: '2rem', color: '#6B7280' }} />
          </div>
          <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem', fontWeight: '600', color: 'white' }}>
            {searchQuery ? "No worksheets match your search" : "No worksheets yet"}
          </h3>
          <p style={{ marginBottom: '1.5rem', maxWidth: '24rem', fontSize: '0.875rem', color: '#9CA3AF' }}>
            {searchQuery
              ? "Try adjusting your search term"
              : "Create your first worksheet to get started"}
          </p>
          {!searchQuery && (
            <Button asChild size="lg">
              <Link href="/dashboard/worksheets/new" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus style={{ height: '1.25rem', width: '1.25rem' }} />
                Create Worksheet
              </Link>
            </Button>
          )}
        </div>
      ) : (
        /* Worksheets Grid - QUICK WIN #6: Improved gap spacing */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {worksheets.map((worksheet) => (
            <WorksheetCard
              key={worksheet.id}
              worksheet={worksheet}
              onDelete={() => openDeleteDialog(worksheet)}
              isDeleting={deletingId === worksheet.id}
              formatDate={formatDate}
              getUniqueSubjects={getUniqueSubjects}
            />
          ))}
        </div>
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
            <DialogTitle>Delete Worksheet</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this worksheet? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {worksheetToDelete && (
            <div className="my-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="font-medium text-gray-900 dark:text-white">
                {worksheetToDelete.title}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {worksheetToDelete.questionCount} question{worksheetToDelete.questionCount !== 1 ? "s" : ""} |{" "}
                {worksheetToDelete.calculatedTotalMarks} marks
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

// Worksheet Card Component
function WorksheetCard({
  worksheet,
  onDelete,
  isDeleting,
  formatDate,
  getUniqueSubjects,
}: {
  worksheet: Worksheet;
  onDelete: () => void;
  isDeleting: boolean;
  formatDate: (date: string | null) => string;
  getUniqueSubjects: (questions: WorksheetQuestion[]) => string[];
}) {
  const subjects = getUniqueSubjects(worksheet.questions);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        backgroundColor: '#1F2937',
        borderRadius: '0.75rem',
        border: isHovered ? '2px solid #3B82F6' : '2px solid #374151',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        boxShadow: isHovered ? '0 10px 25px -5px rgba(59, 130, 246, 0.2)' : 'none',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card Header */}
      <div style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontWeight: '600',
              color: isHovered ? '#60A5FA' : 'white',
              fontSize: '1rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              transition: 'color 0.2s ease'
            }}>
              {worksheet.title}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', color: '#9CA3AF', fontSize: '0.875rem' }}>
              <Calendar style={{ height: '1rem', width: '1rem', flexShrink: 0 }} />
              <span>{formatDate(worksheet.date || worksheet.createdAt)}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Badge variant="secondary">
              {worksheet.questionCount} Q{worksheet.questionCount !== 1 ? "s" : ""}
            </Badge>
            <Badge variant="default">
              {worksheet.calculatedTotalMarks} marks
            </Badge>
          </div>
        </div>

        {/* Metadata */}
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {worksheet.schoolName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#D1D5DB' }}>
              <School style={{ height: '1rem', width: '1rem', flexShrink: 0, color: '#6B7280' }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{worksheet.schoolName}</span>
            </div>
          )}
          {worksheet.examName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#D1D5DB' }}>
              <BookOpen style={{ height: '1rem', width: '1rem', flexShrink: 0, color: '#6B7280' }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{worksheet.examName}</span>
            </div>
          )}
          {worksheet.className && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#D1D5DB' }}>
              <FileText style={{ height: '1rem', width: '1rem', flexShrink: 0, color: '#6B7280' }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Class: {worksheet.className}</span>
            </div>
          )}
        </div>

        {/* Subject badges */}
        {subjects.length > 0 && (
          <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            {subjects.slice(0, 3).map((subject) => (
              <Badge key={subject} variant="secondary" className="text-xs">
                {getDisplayEmoji(subject === "Math" ? "calculator" : subject === "Science" ? "microscope" : subject === "English" ? "books" : null)} {subject}
              </Badge>
            ))}
            {subjects.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{subjects.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div style={{
        padding: '0.75rem 1.25rem',
        backgroundColor: 'rgba(17, 24, 39, 0.5)',
        borderTop: '1px solid #374151',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="flex-1"
        >
          <Link href={`/dashboard/worksheets/${worksheet.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Eye style={{ height: '1rem', width: '1rem', marginRight: '0.375rem' }} />
            View
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="flex-1"
        >
          <Link href={`/dashboard/worksheets/${worksheet.id}/edit`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Edit2 style={{ height: '1rem', width: '1rem', marginRight: '0.375rem' }} />
            Edit
          </Link>
        </Button>
        <button
          onClick={onDelete}
          disabled={isDeleting}
          style={{
            padding: '0.5rem',
            borderRadius: '0.5rem',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: isDeleting ? 'not-allowed' : 'pointer',
            opacity: isDeleting ? 0.5 : 1,
            color: '#9CA3AF',
            transition: 'all 0.2s ease',
          }}
          aria-label="Delete worksheet"
        >
          <Trash2 style={{ height: '1.125rem', width: '1.125rem' }} />
        </button>
      </div>
    </div>
  );
}
