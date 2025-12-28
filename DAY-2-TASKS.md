# Day 2 Tasks - QuestionForge Web App

**Date**: December 28, 2025
**Agent**: questionforge-fullstack-dev
**Status**: 🟢 Ahead of Schedule (60% of Week 1 complete)

---

## 🎯 Today's Mission

Get the database running and start building the authentication system.

---

## ✅ Already Completed (Day 1 Recap)

- ✅ Next.js 14 project initialized
- ✅ Complete Prisma schema (7 models)
- ✅ Supabase PostgreSQL connected
- ✅ AI SDKs integrated (Anthropic + Gemini)
- ✅ Git repository synced to GitHub

---

## 📋 Day 2 Priorities

### Priority 1: Database Migration & Seeding
**Goal**: Get the database tables created and populated with initial data

Tasks:
- [ ] Run `npm run db:push` to create all tables in Supabase
- [ ] Verify tables in Supabase dashboard
- [ ] Run `npm run db:seed` to populate subjects and topics
- [ ] Open Prisma Studio (`npm run db:studio`) to verify data

**Expected Outcome**: Database has all tables with seed data

---

### Priority 2: NextAuth Setup
**Goal**: Get user registration and login working

Tasks:
- [ ] Verify NextAuth configuration in `src/lib/auth.ts`
- [ ] Create login page at `src/app/login/page.tsx`
- [ ] Create register page at `src/app/register/page.tsx`
- [ ] Test registration flow
- [ ] Test login flow
- [ ] Add logout functionality

**Expected Outcome**: Users can register, login, and logout

---

### Priority 3: Basic Layout Components
**Goal**: Create the app shell with navigation

Tasks:
- [ ] Create navbar component (`src/components/navbar.tsx`)
- [ ] Create sidebar component (`src/components/sidebar.tsx`)
- [ ] Create protected layout for authenticated routes
- [ ] Create dashboard landing page
- [ ] Test navigation between pages

**Expected Outcome**: App has consistent layout with working navigation

---

## 🔧 Technical Implementation

### Database Seed Data Structure

The seed script should populate:
- **Subjects**: Math, Science, English, Urdu, etc.
- **Topics**: For each subject (e.g., Algebra, Geometry for Math)

Example seed data:
```typescript
// prisma/seed.ts
const subjects = [
  { name: 'Mathematics', nameUrdu: 'ریاضی', icon: '🔢' },
  { name: 'Science', nameUrdu: 'سائنس', icon: '🔬' },
  { name: 'English', nameUrdu: 'انگریزی', icon: '📖' },
  // ... more subjects
];
```

### NextAuth Pages Structure

```
src/app/
├── login/
│   └── page.tsx          # Login form
├── register/
│   └── page.tsx          # Registration form
└── dashboard/
    └── page.tsx          # Protected dashboard
```

---

## 📊 Success Metrics

By end of Day 2, you should have:
- ✅ Database tables created in Supabase
- ✅ Seed data populated (subjects/topics)
- ✅ User registration working
- ✅ User login working
- ✅ Basic layout with navbar

---

## 🚀 Getting Started

```bash
# 1. Start development server
npm run dev

# 2. In another terminal, push schema to database
npm run db:push

# 3. Seed the database
npm run db:seed

# 4. Open Prisma Studio to verify
npm run db:studio

# 5. Start building auth pages
```

---

## 📝 Environment Variables Checklist

Ensure `.env` has:
- ✅ DATABASE_URL (Supabase connection string)
- ✅ ANTHROPIC_API_KEY
- ✅ NEXTAUTH_SECRET
- ✅ NEXTAUTH_URL

---

## 🔗 Useful Commands

```bash
npm run dev              # Start dev server (localhost:3000)
npm run db:push          # Push schema to database
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio
npm run db:generate      # Generate Prisma client
```

---

## 📝 Commit Message Template

```
Set up database and authentication

- Run Prisma migrations to create tables
- Seed database with subjects and topics
- Create login and register pages
- Implement NextAuth authentication flow
- Add basic navbar and layout components
```

---

**Read AGENT-PROGRESS.md for full context**
**GitHub**: https://github.com/Rukhtam/questionforge-webapp
