"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { QuestionType, Difficulty } from "@prisma/client";
import { getDisplayEmoji } from "@/lib/utils/emoji";

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

// Difficulty levels with labels
const difficultyLevels: { value: Difficulty; label: string; color: string }[] = [
  { value: "EASY", label: "Easy", color: "bg-green-100 text-green-700 border-green-300" },
  { value: "MEDIUM", label: "Medium", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  { value: "HARD", label: "Hard", color: "bg-red-100 text-red-700 border-red-300" },
  { value: "CAMBRIDGE", label: "Cambridge", color: "bg-blue-100 text-blue-700 border-blue-300" },
  { value: "CADET", label: "Cadet", color: "bg-purple-100 text-purple-700 border-purple-300" },
];

// RTL subjects that need right-to-left text direction
const RTL_SUBJECTS = ["Urdu", "Islamiyat"];

// Helper function to check if a subject requires RTL direction
const isRTLSubject = (subjectName: string): boolean => {
  return RTL_SUBJECTS.includes(subjectName);
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
      setError("Please select a subject and topic");
      return;
    }

    setIsLoading(true);

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
      } else {
        setError(data.error || "Failed to generate questions");
      }
    } catch (err) {
      console.error("Error generating questions:", err);
      setError("Failed to generate questions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // Get selected subject icon
  const selectedSubjectData = subjects.find((s) => s.id === selectedSubject);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex-shrink-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Generate Questions
        </h1>
        <p className="mt-1 text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Use AI to create educational questions for your classes
        </p>
      </div>

      {/* Generation Form */}
      <form onSubmit={handleGenerate} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 space-y-5 sm:space-y-6">
          {/* Subject Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject
            </label>
            {isFetchingSubjects ? (
              <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {subjects.map((subject) => (
                  <button
                    key={subject.id}
                    type="button"
                    onClick={() => setSelectedSubject(subject.id)}
                    className={`
                      flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border-2 transition-all text-left
                      ${
                        selectedSubject === subject.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                      }
                    `}
                  >
                    <span className="text-xl sm:text-2xl flex-shrink-0">{getDisplayEmoji(subject.icon)}</span>
                    <div className="min-w-0">
                      <div className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">
                        {subject.name}
                      </div>
                      {subject.nameUrdu && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
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
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Topic
            </label>
            <select
              id="topic"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              disabled={!selectedSubject}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Question Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
              {questionTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setSelectedType(type.value)}
                  className={`
                    p-2 sm:p-3 rounded-lg border-2 transition-all text-center
                    ${
                      selectedType === type.value
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                    }
                  `}
                >
                  <div className="font-medium text-xs sm:text-sm text-gray-900 dark:text-white">
                    {type.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1 hidden sm:block">
                    {type.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Difficulty Level
            </label>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {difficultyLevels.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setSelectedDifficulty(level.value)}
                  className={`
                    px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border-2 font-medium text-sm transition-all
                    ${
                      selectedDifficulty === level.value
                        ? `${level.color} border-current`
                        : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                    }
                  `}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label
              htmlFor="quantity"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Number of Questions
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                id="quantity"
                min="1"
                max="20"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-500"
              />
              <span className="w-12 text-center font-bold text-xl text-gray-900 dark:text-white">
                {quantity}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Generate between 1 and 20 questions at a time
            </p>
          </div>

          {/* Error Message */}
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
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !selectedSubject || !selectedTopic}
            className="w-full py-3 sm:py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
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
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        </div>
      </form>

      {/* Success Message */}
      {showSuccess && generatedQuestions.length > 0 && (
        <div className="p-3 sm:p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium text-sm sm:text-base">
                Successfully generated {generatedQuestions.length} question
                {generatedQuestions.length > 1 ? "s" : ""}!
              </span>
            </div>
            <button
              onClick={() => router.push("/dashboard/questions")}
              className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300 hover:underline"
            >
              View Question Bank
            </button>
          </div>
        </div>
      )}

      {/* Generated Questions Preview */}
      {generatedQuestions.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              Generated Questions
            </h2>
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {generatedQuestions.length} question{generatedQuestions.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="space-y-3 sm:space-y-4">
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
      EASY: "bg-green-100 text-green-700",
      MEDIUM: "bg-yellow-100 text-yellow-700",
      HARD: "bg-red-100 text-red-700",
      CAMBRIDGE: "bg-blue-100 text-blue-700",
      CADET: "bg-purple-100 text-purple-700",
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
      {/* Question Header */}
      <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-xs sm:text-sm">
              {index}
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span
                className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium rounded ${getDifficultyColor(
                  question.difficulty
                )}`}
              >
                {question.difficulty}
              </span>
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                {formatQuestionType(question.questionType)}
              </span>
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                {question.marks} mark{question.marks > 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <span>{getDisplayEmoji(question.topic.subject.icon)}</span>
            <span className="truncate max-w-[150px] sm:max-w-none">{question.topic.name}</span>
          </div>
        </div>
      </div>

      {/* Question Body */}
      <div className="p-3 sm:p-4">
        <p
          className={`text-sm sm:text-base text-gray-900 dark:text-white whitespace-pre-wrap break-words ${
            isRTLSubject(question.topic.subject.name) ? "text-right" : ""
          }`}
          dir={isRTLSubject(question.topic.subject.name) ? "rtl" : "ltr"}
        >
          {question.questionText}
        </p>

        {/* MCQ Options */}
        {question.questionType === "MCQ" && question.options && (
          <div className="mt-3 sm:mt-4 space-y-2">
            {Object.entries(question.options).map(([key, value]) => {
              const isRTL = isRTLSubject(question.topic.subject.name);
              return (
                <div
                  key={key}
                  className={`
                    flex items-start sm:items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg
                    ${
                      showAnswer && question.correctAnswer === key
                        ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                        : "bg-gray-50 dark:bg-gray-700/50"
                    }
                  `}
                >
                  <span
                    className={`
                      flex-shrink-0 flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full text-xs sm:text-sm font-medium
                      ${
                        showAnswer && question.correctAnswer === key
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                      }
                    `}
                  >
                    {key}
                  </span>
                  <span
                    className={`flex-1 text-sm sm:text-base text-gray-700 dark:text-gray-200 break-words ${
                      isRTL ? "text-right" : ""
                    }`}
                    dir={isRTL ? "rtl" : "ltr"}
                  >
                    {value}
                  </span>
                  {showAnswer && question.correctAnswer === key && (
                    <svg
                      className="flex-shrink-0 ml-auto h-4 w-4 sm:h-5 sm:w-5 text-green-500"
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
      <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <button
          onClick={() => setShowAnswer(!showAnswer)}
          className="flex items-center gap-2 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          <svg
            className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform ${showAnswer ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          {showAnswer ? "Hide Answer" : "Show Answer"}
        </button>

        {showAnswer && (
          <div className="mt-3 space-y-3">
            {question.questionType !== "MCQ" && (
              <div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Correct Answer
                </span>
                <p
                  className={`mt-1 text-sm sm:text-base text-gray-900 dark:text-white font-medium break-words ${
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
                  className={`mt-1 text-sm sm:text-base text-gray-700 dark:text-gray-300 break-words ${
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
