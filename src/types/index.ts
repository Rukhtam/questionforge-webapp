import type {
  User,
  Subject,
  Topic,
  Question,
  Worksheet,
  WorksheetQuestion,
  QuestionType,
  Difficulty,
} from "@prisma/client";

// Re-export Prisma types
export type {
  User,
  Subject,
  Topic,
  Question,
  Worksheet,
  WorksheetQuestion,
  QuestionType,
  Difficulty,
};

// Extended types with relations
export type SubjectWithTopics = Subject & {
  topics: Topic[];
};

export type TopicWithSubject = Topic & {
  subject: Subject;
};

export type QuestionWithRelations = Question & {
  topic: TopicWithSubject;
  user: Pick<User, "id" | "name" | "email">;
};

export type WorksheetQuestionWithQuestion = WorksheetQuestion & {
  question: Question;
};

export type WorksheetWithQuestions = Worksheet & {
  questions: WorksheetQuestionWithQuestion[];
};

// API Request/Response types
export interface GenerateQuestionsRequest {
  subjectId: string;
  topicId: string;
  difficulty: Difficulty;
  questionType: QuestionType;
  quantity: number;
}

export interface CreateQuestionRequest {
  topicId: string;
  questionText: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  options?: Record<string, string>;
  correctAnswer: string;
  explanation?: string;
  marks?: number;
}

export interface UpdateQuestionRequest {
  questionText?: string;
  options?: Record<string, string>;
  correctAnswer?: string;
  explanation?: string;
  marks?: number;
  isFavorite?: boolean;
}

export interface CreateWorksheetRequest {
  title: string;
  schoolName?: string;
  examName?: string;
  className?: string;
  date?: string;
  questionIds: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Auth types
export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name?: string;
}

// Filter types
export interface QuestionFilters {
  subjectId?: string;
  topicId?: string;
  questionType?: QuestionType;
  difficulty?: Difficulty;
  isFavorite?: boolean;
  search?: string;
}
