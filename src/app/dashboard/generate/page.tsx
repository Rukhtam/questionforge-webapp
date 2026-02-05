"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { QuestionType, Difficulty } from "@prisma/client";
import { getDisplayEmoji } from "@/lib/utils/emoji";
import { toast } from "sonner";

// Types
interface Topic {
  id: string;
  name: string;
  gradeLevel: string | null;
}

interface Subject {
  id: string;
  name: string;
  nameUrdu: string | null;
  icon: string | null;
  topics: Topic[];
}

interface GeneratedQuestion {
  id: string;
  questionText: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  options: Record<string, string> | null;
  correctAnswer: string;
  explanation: string | null;
  marks: number;
  topic: {
    name: string;
    subject: {
      name: string;
      icon: string | null;
    };
  };
}

// Question types with labels
const questionTypes: { value: QuestionType; label: string; description: string }[] = [
  { value: "MCQ", label: "Multiple Choice", description: "4 options (A, B, C, D)" },
  { value: "FILL_BLANK", label: "Fill in the Blank", description: "Complete the sentence" },
  { value: "SHORT_ANSWER", label: "Short Answer", description: "1-2 sentence response" },
  { value: "LONG_ANSWER", label: "Long Answer", description: "Detailed explanation" },
  { value: "TRUE_FALSE", label: "True/False", description: "True or False statement" },
];

// Difficulty levels with labels - updated with icons and better styling
const difficultyLevels: { value: Difficulty; label: string; icon: string; colors: { base: string; selected: string; hover: string } }[] = [
  { value: "EASY", label: "Easy", icon: "1", colors: { base: "text-green-400", selected: "bg-green-500 text-white border-green-500", hover: "hover:bg-green-500/20 hover:border-green-500" } },
  { value: "MEDIUM", label: "Medium", icon: "2", colors: { base: "text-yellow-400", selected: "bg-yellow-500 text-white border-yellow-500", hover: "hover:bg-yellow-500/20 hover:border-yellow-500" } },
  { value: "HARD", label: "Hard", icon: "3", colors: { base: "text-red-400", selected: "bg-red-500 text-white border-red-500", hover: "hover:bg-red-500/20 hover:border-red-500" } },
  { value: "CAMBRIDGE", label: "Cambridge", icon: "C", colors: { base: "text-blue-400", selected: "bg-blue-500 text-white border-blue-500", hover: "hover:bg-blue-500/20 hover:border-blue-500" } },
  { value: "CADET", label: "Cadet", icon: "D", colors: { base: "text-purple-400", selected: "bg-purple-500 text-white border-purple-500", hover: "hover:bg-purple-500/20 hover:border-purple-500" } },
];

// RTL subjects that need right-to-left text direction
const RTL_SUBJECTS = ["Urdu", "Islamiyat"];

// Helper function to check if a subject requires RTL direction
const isRTLSubject = (subjectName: string): boolean => {
  return RTL_SUBJECTS.includes(subjectName);
};

// Helper function to format question type
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

export default function GenerateQuestionsPage() {
  const router = useRouter();

  // Form state
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [selectedType, setSelectedType] = useState<QuestionType>("MCQ");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("MEDIUM");
  const [quantity, setQuantity] = useState<number>(5);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingSubjects, setIsFetchingSubjects] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  // Get topics for selected subject
  const availableTopics = subjects.find((s) => s.id === selectedSubject)?.topics || [];

  // Fetch subjects on mount
  useEffect(() => {
    async function fetchSubjects() {
      try {
        const response = await fetch("/api/subjects");
        const data = await response.json();

        if (data.success) {
          setSubjects(data.data);
        } else {
          setError(data.error || "Failed to load subjects");
        }
      } catch (err) {
        console.error("Error fetching subjects:", err);
        setError("Failed to load subjects. Please refresh the page.");
      } finally {
        setIsFetchingSubjects(false);
      }
    }

    fetchSubjects();
  }, []);

  // Reset topic when subject changes
  useEffect(() => {
    setSelectedTopic("");
  }, [selectedSubject]);

  // Handle form submission
  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGeneratedQuestions([]);
    setShowSuccess(false);

    if (!selectedSubject || !selectedTopic) {
      toast.error("Please select a subject and topic");
      setError("Please select a subject and topic");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Generating questions with AI...");

    try {
      const response = await fetch("/api/questions/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subjectId: selectedSubject,
          topicId: selectedTopic,
          difficulty: selectedDifficulty,
          questionType: selectedType,
          quantity,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedQuestions(data.data.questions);
        setShowSuccess(true);
        toast.success(`Successfully generated ${data.data.questions.length} question${data.data.questions.length > 1 ? "s" : ""}!`, {
          id: toastId,
        });
      } else {
        setError(data.error || "Failed to generate questions");
        toast.error(data.error || "Failed to generate questions", {
          id: toastId,
        });
      }
    } catch (err) {
      console.error("Error generating questions:", err);
      setError("Failed to generate questions. Please try again.");
      toast.error("Failed to generate questions. Please try again.", {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Get selected subject icon
  const selectedSubjectData = subjects.find((s) => s.id === selectedSubject);

  return (
    <div style={{ width: '100%', maxWidth: '56rem', marginLeft: 'auto', marginRight: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>
          Generate Questions
        </h1>
        <p style={{ marginTop: '0.25rem', color: '#9CA3AF' }}>
          Use AI to create educational questions for your classes
        </p>
      </div>

      {/* Generation Form */}
      <form onSubmit={handleGenerate} className="space-y-6">
        <div style={{ backgroundColor: '#1F2937', borderRadius: '1rem', border: '1px solid #374151', padding: '1.5rem' }} className="space-y-8">
          {/* Subject Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '1rem', fontWeight: '600', color: '#F3F4F6', marginBottom: '1rem' }}>
              Subject
            </label>
            {isFetchingSubjects ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} style={{ height: '5rem', backgroundColor: '#374151', borderRadius: '0.75rem' }} className="animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {subjects.map((subject) => (
                  <button
                    key={subject.id}
                    type="button"
                    onClick={() => setSelectedSubject(subject.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '1rem',
                      borderRadius: '0.75rem',
                      border: selectedSubject === subject.id ? '2px solid #3B82F6' : '2px solid #4B5563',
                      backgroundColor: selectedSubject === subject.id ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                      textAlign: 'left',
                      minHeight: '5rem',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      overflow: 'hidden'
                    }}
                    className={selectedSubject !== subject.id ? "hover:border-gray-400 hover:bg-gray-700/50" : ""}
                  >
                    <span style={{ fontSize: '2rem', flexShrink: 0 }}>{getDisplayEmoji(subject.icon)}</span>
                    <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontWeight: '600', fontSize: '1rem', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {subject.name}
                      </div>
                      {subject.nameUrdu && (
                        <div style={{ fontSize: '0.875rem', color: '#9CA3AF', marginTop: '0.125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} dir="rtl">
                          {subject.nameUrdu}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Topic Selection */}
          <div>
            <label
              htmlFor="topic"
              style={{ display: 'block', fontSize: '1rem', fontWeight: '600', color: '#F3F4F6', marginBottom: '1rem' }}
            >
              Topic
            </label>
            <select
              id="topic"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              disabled={!selectedSubject}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                borderRadius: '0.75rem',
                border: '2px solid #4B5563',
                backgroundColor: '#111827',
                color: 'white',
                fontSize: '1rem',
                cursor: selectedSubject ? 'pointer' : 'not-allowed',
                opacity: selectedSubject ? 1 : 0.5
              }}
              className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">
                {selectedSubject ? "Select a topic" : "Select a subject first"}
              </option>
              {availableTopics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                  {topic.gradeLevel && ` (${topic.gradeLevel})`}
                </option>
              ))}
            </select>
          </div>

          {/* Question Type */}
          <div>
            <label style={{ display: 'block', fontSize: '1rem', fontWeight: '600', color: '#F3F4F6', marginBottom: '1rem' }}>
              Question Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {questionTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setSelectedType(type.value)}
                  style={{
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    border: selectedType === type.value ? '2px solid #3B82F6' : '2px solid #4B5563',
                    backgroundColor: selectedType === type.value ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                    textAlign: 'center',
                    minHeight: '5rem',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                  className={selectedType !== type.value ? "hover:border-gray-400 hover:bg-gray-700/50" : ""}
                >
                  <div style={{ fontWeight: '600', fontSize: '0.9375rem', color: 'white', marginBottom: '0.25rem' }}>
                    {type.label}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#9CA3AF' }}>
                    {type.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Level */}
          <div>
            <label style={{ display: 'block', fontSize: '1rem', fontWeight: '600', color: '#F3F4F6', marginBottom: '1rem' }}>
              Difficulty Level
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {difficultyLevels.map((level) => {
                const isSelected = selectedDifficulty === level.value;
                return (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setSelectedDifficulty(level.value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.625rem 1rem',
                      borderRadius: '0.5rem',
                      border: '2px solid',
                      borderColor: isSelected ? 
                        (level.value === 'EASY' ? '#22C55E' : 
                         level.value === 'MEDIUM' ? '#EAB308' : 
                         level.value === 'HARD' ? '#EF4444' : 
                         level.value === 'CAMBRIDGE' ? '#3B82F6' : '#A855F7') : '#4B5563',
                      backgroundColor: isSelected ? 
                        (level.value === 'EASY' ? '#22C55E' : 
                         level.value === 'MEDIUM' ? '#EAB308' : 
                         level.value === 'HARD' ? '#EF4444' : 
                         level.value === 'CAMBRIDGE' ? '#3B82F6' : '#A855F7') : 'transparent',
                      color: isSelected ? 'white' : 
                        (level.value === 'EASY' ? '#4ADE80' : 
                         level.value === 'MEDIUM' ? '#FACC15' : 
                         level.value === 'HARD' ? '#F87171' : 
                         level.value === 'CAMBRIDGE' ? '#60A5FA' : '#C084FC'),
                      fontWeight: '600',
                      fontSize: '0.9375rem',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      minHeight: '2.75rem'
                    }}
                    className={!isSelected ? `hover:bg-opacity-20 ${level.colors.hover}` : ""}
                  >
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '1.5rem',
                      height: '1.5rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)'
                    }}>
                      {level.icon}
                    </span>
                    {level.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label
              htmlFor="quantity"
              style={{ display: 'block', fontSize: '1rem', fontWeight: '600', color: '#F3F4F6', marginBottom: '1rem' }}
            >
              Number of Questions
            </label>
            {/* Quick Select Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'center' }}>
              {[3, 5, 10, 15, 20].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setQuantity(num)}
                  style={{
                    padding: '0.625rem 1.25rem',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    fontSize: '0.9375rem',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    minWidth: '3rem',
                    backgroundColor: quantity === num ? '#3B82F6' : '#374151',
                    color: quantity === num ? 'white' : '#D1D5DB',
                    border: 'none'
                  }}
                  className={quantity !== num ? "hover:bg-gray-600" : ""}
                >
                  {num}
                </button>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>or</span>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  max="20"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val >= 1 && val <= 20) {
                      setQuantity(val);
                    }
                  }}
                  style={{
                    width: '4.5rem',
                    padding: '0.625rem 0.75rem',
                    borderRadius: '0.5rem',
                    border: '2px solid #4B5563',
                    backgroundColor: '#111827',
                    color: 'white',
                    textAlign: 'center',
                    fontWeight: '600',
                    fontSize: '0.9375rem'
                  }}
                  className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#6B7280' }}>
              Generate between 1 and 20 questions at a time
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{ padding: '1rem', borderRadius: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #7F1D1D' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#F87171' }}>
                <svg style={{ height: '1.25rem', width: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span style={{ fontWeight: '500' }}>{error}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div style={{ marginTop: '1.5rem' }}>
            <button
              type="submit"
              disabled={isLoading || !selectedSubject || !selectedTopic}
              style={{
                width: '100%',
                padding: '1rem 1.5rem',
                fontWeight: '600',
                fontSize: '1rem',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                transition: 'all 0.3s',
                cursor: isLoading || !selectedSubject || !selectedTopic ? 'not-allowed' : 'pointer',
                backgroundColor: isLoading || !selectedSubject || !selectedTopic ? '#374151' : '#3B82F6',
                color: isLoading || !selectedSubject || !selectedTopic ? '#9CA3AF' : 'white',
                border: 'none',
                boxShadow: isLoading || !selectedSubject || !selectedTopic ? 'none' : '0 4px 14px rgba(59, 130, 246, 0.4)'
              }}
              className={!(isLoading || !selectedSubject || !selectedTopic) ? "hover:bg-blue-600" : ""}
            >
              {isLoading ? (
                <>
                  <svg
                    style={{ height: '1.25rem', width: '1.25rem' }}
                    className="animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Generating Questions...
                </>
              ) : !selectedSubject ? (
                <>
                  <svg style={{ height: '1.25rem', width: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Select a Subject First
                </>
              ) : !selectedTopic ? (
                <>
                  <svg style={{ height: '1.25rem', width: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Select a Topic First
                </>
              ) : (
                <>
                  <svg style={{ height: '1.25rem', width: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  Generate {quantity} Question{quantity > 1 ? "s" : ""}
                </>
              )}
            </button>
            {(!selectedSubject || !selectedTopic) && (
              <p style={{ fontSize: '0.8125rem', textAlign: 'center', color: '#6B7280', marginTop: '0.5rem' }}>
                {!selectedSubject
                  ? "Choose a subject above to continue"
                  : "Choose a topic above to continue"}
              </p>
            )}
          </div>
        </div>
      </form>

      {/* Success Message */}
      {showSuccess && generatedQuestions.length > 0 && (
        <div style={{ 
          padding: '1rem', 
          borderRadius: '0.75rem', 
          backgroundColor: '#F0FDF4', 
          border: '1px solid #BBF7D0' 
        }} className="dark:bg-green-900/20 dark:border-green-800">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16A34A' }} className="dark:text-green-400">
              <svg style={{ height: '1.25rem', width: '1.25rem', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span style={{ fontWeight: '500', fontSize: '0.9375rem' }}>
                Successfully generated {generatedQuestions.length} question
                {generatedQuestions.length > 1 ? "s" : ""}!
              </span>
            </div>
            <button
              onClick={() => router.push("/dashboard/questions")}
              style={{ fontSize: '0.875rem', fontWeight: '500', color: '#15803D' }}
              className="dark:text-green-300 hover:underline"
            >
              View Question Bank
            </button>
          </div>
        </div>
      )}

      {/* Generated Questions Preview */}
      {generatedQuestions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-pink-500/20 rounded-2xl p-6 sm:p-8 lg:p-10 border border-blue-200 dark:border-blue-700 shadow-sm dark:shadow-none">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 sm:gap-8">
              <div className="flex items-center gap-5 sm:gap-6">
                <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-blue-500 dark:bg-blue-600 text-white shadow-lg shadow-blue-500/30 dark:shadow-blue-600/50">
                  <svg className="w-7 h-7 sm:w-9 sm:h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1.5 sm:mb-2">
                    Generated Questions
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 flex items-center gap-2.5">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{generatedQuestions.length} question{generatedQuestions.length > 1 ? "s" : ""}</span>
                    <span className="text-gray-400 dark:text-gray-500">•</span>
                    <span className="text-gray-700 dark:text-gray-300">{selectedSubjectData?.name}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                <span className="inline-flex items-center px-5 py-2.5 sm:px-6 sm:py-3 text-sm font-bold rounded-xl bg-blue-100 dark:bg-blue-800/50 text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-600 whitespace-nowrap shadow-sm">
                  {selectedDifficulty}
                </span>
                <span className="inline-flex items-center px-5 py-2.5 sm:px-6 sm:py-3 text-sm font-bold rounded-xl bg-purple-100 dark:bg-purple-800/50 text-purple-700 dark:text-purple-200 border border-purple-200 dark:border-purple-600 whitespace-nowrap shadow-sm">
                  {formatQuestionType(selectedType)}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {generatedQuestions.map((question, index) => (
              <QuestionCard key={question.id} question={question} index={index + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Question Card Component
function QuestionCard({
  question,
  index,
}: {
  question: GeneratedQuestion;
  index: number;
}) {
  const [showAnswer, setShowAnswer] = useState(false);

  const getDifficultyColor = (difficulty: Difficulty) => {
    const colors: Record<Difficulty, string> = {
      EASY: "bg-green-100 text-green-700 dark:bg-green-800/50 dark:text-green-200",
      MEDIUM: "bg-yellow-100 text-yellow-700 dark:bg-yellow-800/50 dark:text-yellow-200",
      HARD: "bg-red-100 text-red-700 dark:bg-red-800/50 dark:text-red-200",
      CAMBRIDGE: "bg-blue-100 text-blue-700 dark:bg-blue-800/50 dark:text-blue-200",
      CADET: "bg-purple-100 text-purple-700 dark:bg-purple-800/50 dark:text-purple-200",
    };
    return colors[difficulty];
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Question Header */}
      <div className="p-5 sm:p-6 lg:p-7 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-850">
        <div className="flex flex-col gap-4 sm:gap-5">
          {/* Question Number and Topic Row */}
          <div className="flex items-start sm:items-center gap-4">
            <span className="flex-shrink-0 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-bold text-sm">
              {index}
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-sm min-w-0 flex-1">
              <div className="flex items-center gap-2.5">
                <span className="text-lg sm:text-xl">{getDisplayEmoji(question.topic.subject.icon)}</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{question.topic.subject.name}</span>
              </div>
              <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-300">
                <span className="hidden sm:inline text-gray-400 dark:text-gray-500">•</span>
                <span className="truncate">{question.topic.name}</span>
              </div>
            </div>
          </div>
          
          {/* Badges Row */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <span
              className={`inline-flex items-center px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold rounded-lg whitespace-nowrap ${getDifficultyColor(
                question.difficulty
              )}`}
            >
              {question.difficulty}
            </span>
            <span className="inline-flex items-center px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold rounded-lg bg-gray-100 dark:bg-gray-700/70 text-gray-700 dark:text-gray-200 whitespace-nowrap">
              {formatQuestionType(question.questionType)}
            </span>
            <span className="inline-flex items-center px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 whitespace-nowrap">
              {question.marks} mark{question.marks > 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Question Body */}
      <div className="p-6 sm:p-7 lg:p-8">
        <p
          className={`text-base sm:text-lg lg:text-xl text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words leading-relaxed ${
            isRTLSubject(question.topic.subject.name) ? "text-right" : ""
          }`}
          dir={isRTLSubject(question.topic.subject.name) ? "rtl" : "ltr"}
        >
          {question.questionText}
        </p>

        {/* MCQ Options */}
        {question.questionType === "MCQ" && question.options && (
          <div className="mt-4 sm:mt-5 lg:mt-6 space-y-2 sm:space-y-3">
            {Object.entries(question.options).map(([key, value]) => {
              const isRTL = isRTLSubject(question.topic.subject.name);
              return (
                <div
                  key={key}
                  className={`
                    flex items-center gap-2.5 sm:gap-3 lg:gap-4 p-2.5 sm:p-3 lg:p-4 rounded-lg transition-all duration-200
                    ${
                      showAnswer && question.correctAnswer === key
                        ? "bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800"
                        : "bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent"
                    }
                  `}
                >
                  <span
                    className={`
                      flex-shrink-0 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-bold
                      ${
                        showAnswer && question.correctAnswer === key
                          ? "bg-green-500 dark:bg-green-600 text-white"
                          : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                      }
                    `}
                  >
                    {key}
                  </span>
                  <span
                    className={`flex-1 text-sm sm:text-base text-gray-800 dark:text-gray-200 break-words leading-relaxed ${
                      isRTL ? "text-right" : ""
                    }`}
                    dir={isRTL ? "rtl" : "ltr"}
                  >
                    {value}
                  </span>
                  {showAnswer && question.correctAnswer === key && (
                    <svg
                      className="flex-shrink-0 ml-auto h-4 w-4 sm:h-5 sm:w-5 text-green-500 dark:text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Answer Section */}
      <div className="p-5 sm:p-6 lg:p-7 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-850">
        <button
          onClick={() => setShowAnswer(!showAnswer)}
          className="flex items-center gap-2.5 text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors active:scale-95"
        >
          <svg
            className={`h-4 w-4 transition-transform duration-200 ${showAnswer ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          {showAnswer ? "Hide Answer" : "Show Answer"}
        </button>

        {showAnswer && (
          <div className="mt-4 sm:mt-5 space-y-3 sm:space-y-4">
            {question.questionType !== "MCQ" && (
              <div>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Correct Answer
                </span>
                <p
                  className={`mt-1.5 sm:mt-2 text-sm sm:text-base text-gray-900 dark:text-white font-semibold break-words leading-relaxed ${
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
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Explanation
                </span>
                <p
                  className={`mt-1.5 sm:mt-2 text-sm sm:text-base text-gray-700 dark:text-gray-300 break-words leading-relaxed ${
                    isRTLSubject(question.topic.subject.name) ? "text-right" : ""
                  }`}
                  dir={isRTLSubject(question.topic.subject.name) ? "rtl" : "ltr"}
                >
                  {question.explanation}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
