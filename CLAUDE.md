# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QuestionForge is an AI-powered educational question and worksheet generator for teachers. It uses Google Gemini AI for question generation and NextAuth v5 for authentication. Target launch: January 25, 2026.

**Stack**: Next.js 16.1.1 (App Router), TypeScript, Tailwind CSS v4, Prisma 7.2.0, PostgreSQL (Supabase), NextAuth.js v5 (beta), Google Gemini API

## Development Commands

```bash
# Development
npm run dev              # Start development server on localhost:3000
npm run build            # Build for production (includes prisma generate)
npm run start            # Run production build
npm run lint             # Run ESLint

# Database - Prisma Workflow
npm run db:generate      # Generate Prisma client (MUST run after schema changes)
npm run db:push          # Push schema to database (for development)
npm run db:migrate       # Create migration (for production)
npm run db:seed          # Seed subjects and topics
npm run db:studio        # Open Prisma Studio on localhost:5555
npm run db:reset         # Reset database (DELETES ALL DATA)
```

**Critical**: After modifying `prisma/schema.prisma`, always run `npm run db:generate` before running the app, or you'll get Prisma client errors.

## Environment Variables

Required in `.env`:
- `DATABASE_URL`: Supabase PostgreSQL connection string (format in `.env.example`)
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL`: `http://localhost:3000` (dev) or production URL
- `GEMINI_API_KEY`: Google Gemini API key from https://aistudio.google.com/apikey

## Architecture

### Database Schema (`prisma/schema.prisma`)

**Core entities**:
- `User`: Authentication (credentials-based via NextAuth)
- `Subject`: Seeded data (Math, English, Science, Urdu, Islamiyat, General Knowledge)
- `Topic`: Belongs to Subject, has grade levels
- `Question`: Core entity with AI-generated flag, favorite status, difficulty levels (EASY, MEDIUM, HARD, CAMBRIDGE, CADET), question types (MCQ, FILL_BLANK, SHORT_ANSWER, LONG_ANSWER, TRUE_FALSE)
- `Worksheet`: Collection of questions with metadata (school name, exam name, class, date)
- `WorksheetQuestion`: Junction table with ordering and custom marks

**Important**: Database uses PostgreSQL with Prisma PG adapter (`@prisma/adapter-pg`) for connection pooling.

### App Router Structure

```
src/app/
├── (auth)/              # Route group (no auth required)
│   ├── login/
│   └── register/
├── dashboard/           # Protected routes (requires auth)
│   ├── generate/        # Question generation UI
│   ├── questions/       # Question bank
│   └── layout.tsx       # Sidebar + Navbar layout
├── api/                 # API routes
│   ├── auth/
│   │   ├── [...nextauth]/  # NextAuth handlers
│   │   └── register/       # User registration
│   ├── questions/
│   │   ├── generate/       # AI question generation endpoint
│   │   ├── [id]/           # CRUD for individual questions
│   │   └── route.ts        # List/create questions
│   ├── subjects/           # Fetch subjects and topics
│   └── worksheets/         # Worksheet CRUD (planned)
└── page.tsx             # Landing page
```

**Note**: Both `(dashboard)` and `dashboard` directories exist. The `dashboard/` directory (without parentheses) is the active protected dashboard. The `(dashboard)/` route group is legacy.

### Authentication (`src/lib/auth.ts`)

- Uses NextAuth v5 (beta) with JWT session strategy
- Credentials provider with bcryptjs password hashing
- Custom session callback adds user ID to session
- Protected routes should call `auth()` to get session
- Sign in page: `/login`

```typescript
// Example in API route
import { auth } from "@/lib/auth";

const session = await auth();
if (!session?.user?.id) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

### Database Client (`src/lib/prisma.ts`)

- Uses PrismaPg adapter with pg connection pool for better connection management
- Singleton pattern with `globalForPrisma` to prevent multiple instances in development
- Logging enabled in development: `["query", "error", "warn"]`
- Import: `import prisma from "@/lib/prisma"`

### AI Question Generation (`src/lib/gemini.ts`)

**Important implementation details**:
- Uses Google Gemini 2.0+ models (older 1.5 models are deprecated as of late 2025)
- Automatically tries multiple models with fallback: `gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-2.0-flash-lite`, etc.
- Model discovery caches available models to avoid repeated API calls
- Response parsing handles markdown code blocks and extracts JSON arrays
- Validates question structure based on type (MCQ requires options A-D, TRUE_FALSE requires "True" or "False")
- Error handling for API key issues, quota exhaustion, and model availability

**Difficulty descriptions in prompts**:
- EASY: Simple and straightforward
- MEDIUM: Moderately challenging
- HARD: Requires deep understanding
- CAMBRIDGE: Cambridge O-Level/A-Level standard
- CADET: Cadet College entrance exam level

**Question type validations**:
- MCQ: Must have `options` object with keys A, B, C, D; `correctAnswer` is the letter
- FILL_BLANK: Uses `___` in questionText; correctAnswer is the word/phrase
- SHORT_ANSWER: 1-2 sentence answers; no options
- LONG_ANSWER: Essay-type; correctAnswer has key points
- TRUE_FALSE: correctAnswer must be "True" or "False"

### UI Components

- **Radix UI**: Dialog, Dropdown Menu, Tooltip (with TooltipProvider)
- **Sonner**: Toast notifications (`<Toaster />` in providers)
- **Lucide React**: Icon library
- **Tailwind CSS v4**: Uses `@tailwindcss/postcss` plugin
- **Dark mode**: Implemented with Tailwind's `dark:` prefix; color palette follows WCAG AA standards
- **Path alias**: `@/*` maps to `./src/*` (tsconfig.json)

### Providers (`src/components/providers.tsx`)

Client component wrapping:
1. `SessionProvider` (NextAuth)
2. `TooltipProvider` (Radix UI, 200ms delay)
3. `Toaster` (Sonner notifications)

All children are wrapped in this component tree in `app/layout.tsx`.

## Seeded Data

The `npm run db:seed` command populates:
- 6 subjects (Math, English, Science, Urdu, Islamiyat, General Knowledge)
- 40+ topics with grade levels (1-12)
- Each subject has Urdu name and emoji icon

Seed script: `prisma/seed.ts`

## Project Status (As of Jan 2026)

**All core features complete** (97% overall):
- ✅ User registration and authentication
- ✅ AI question generation with Gemini (5 question types, 5 difficulty levels)
- ✅ Question bank CRUD with search/filter
- ✅ Worksheet builder with question selection and ordering
- ✅ Worksheets list, view, and edit pages
- ✅ Favorites page with filtering
- ✅ PDF export with RTL support for Urdu/Islamiyat
- ✅ Dark mode with WCAG AA compliance
- ✅ Responsive sidebar/navbar layout
- ✅ Toast notifications

**Remaining tasks** (3%):
1. **Deployment** - Vercel configuration and production setup
2. **Final testing** - End-to-end testing and bug fixes
3. **Minor UI polish** - Final touches on Worksheets/Favorites pages

## Development Notes

- NextAuth v5 is still in beta (v5.0.0-beta.30) - check documentation for breaking changes
- Gemini API free tier quota: Monitor usage to avoid exhaustion
- Database connection pooling is handled by PG adapter - no need for manual pool management
- TypeScript strict mode is enabled
- Tailwind CSS v4 uses new PostCSS plugin architecture (different from v3)

## Common Patterns

**Creating protected API routes**:
```typescript
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  // ... rest of logic
}
```

**Database queries with relations**:
```typescript
const question = await prisma.question.findUnique({
  where: { id },
  include: {
    topic: {
      include: { subject: true }
    }
  }
});
```

**Type-safe Prisma enums**:
```typescript
import type { QuestionType, Difficulty } from "@prisma/client";
```
