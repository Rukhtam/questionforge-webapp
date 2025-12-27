# QuestionForge

An AI-powered web application for teachers to generate custom exam questions and worksheets.

## Project Details

- **Platform**: Web (Vercel)
- **Stack**: Next.js 14, Prisma, PostgreSQL (Supabase), Anthropic API
- **Target Launch**: January 25, 2026

## Features (MVP)

- User authentication (NextAuth)
- AI-generated questions using Claude API
- Question bank management (CRUD)
- Worksheet builder with drag-drop
- PDF export with answer keys
- Search and filter questions
- Responsive design

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: NextAuth.js v5
- **AI**: Anthropic Claude API
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- PostgreSQL database (Supabase recommended)
- Anthropic API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/questionforge.git
cd questionforge
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your actual values:
- `DATABASE_URL`: Your Supabase connection string
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL`: `http://localhost:3000` for development
- `ANTHROPIC_API_KEY`: Your Anthropic API key

4. Set up the database:
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed initial data (subjects and topics)
npm run db:seed
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes to database
npm run db:push

# Create a new migration
npm run db:migrate

# Seed the database
npm run db:seed

# Open Prisma Studio
npm run db:studio

# Reset database (CAUTION: deletes all data)
npm run db:reset
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, register)
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API routes
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── forms/            # Form components
│   └── layout/           # Layout components
├── lib/                   # Utility libraries
│   ├── prisma.ts         # Prisma client
│   ├── auth.ts           # NextAuth configuration
│   ├── anthropic.ts      # Claude API client
│   └── utils.ts          # Helper functions
├── types/                 # TypeScript types
└── hooks/                 # Custom React hooks

prisma/
├── schema.prisma         # Database schema
└── seed.ts               # Seed script
```

## Subjects Supported

- Math
- English
- Science
- Urdu
- Islamiyat
- General Knowledge

## Development Timeline

See `mater-plan.md` in the root directory for the complete timeline.

## License

Private project - All rights reserved.

## Owner

Rukhtam Amin
