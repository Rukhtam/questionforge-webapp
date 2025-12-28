# Day 3 Tasks - QuestionForge Web App

**Date**: December 29, 2025
**Agent**: questionforge-fullstack-dev
**Status**: 🚀 Week 1 & 2 Features Complete - Moving to Week 3

---

## 🎉 Day 2 Recap

**INCREDIBLE PROGRESS!** You completed:
- ✅ All Week 1 features (auth, layout, dashboard)
- ✅ Week 2 features (AI question generation working!)
- ✅ Full question CRUD API
- ✅ Question bank UI with filters
- ✅ Gemini API integration

You're running **5+ days ahead of schedule!**

---

## 🎯 Today's Mission

Build the **Worksheet Builder** with drag-and-drop functionality.

---

## 📋 Day 3 Priorities

### Priority 1: Worksheet Builder - Basic Structure
**Goal**: Create the worksheet creation page and data flow

Tasks:
- [ ] Create `/app/dashboard/worksheets/new/page.tsx`
- [ ] Design worksheet form:
  - Title input
  - School name (optional)
  - Exam name (optional)
  - Class name (optional)
  - Date picker
- [ ] Create state management for:
  - Selected questions (array with order)
  - Worksheet metadata
  - Total marks calculation
- [ ] Create basic layout:
  - Left panel: Question bank (search/filter)
  - Right panel: Selected questions (ordered list)
  - Bottom: Save/Preview buttons

**Expected Outcome**: Worksheet builder page structure exists

---

### Priority 2: Question Selection & Ordering
**Goal**: Enable adding questions to worksheet and reordering

Tasks:
- [ ] Create question search component:
  - Reuse filters from question bank
  - "Add to Worksheet" button on each question
- [ ] Implement selected questions panel:
  - Show questions in order (1, 2, 3...)
  - Display marks per question
  - Allow custom marks override
  - Remove button per question
  - Total marks display
- [ ] Add drag-and-drop reordering:
  - Option A: Use `react-beautiful-dnd` or `dnd-kit`
  - Option B: Simple up/down arrow buttons
  - Update order in state
- [ ] Prevent duplicate questions

**Expected Outcome**: Can search, add, order, and remove questions

---

### Priority 3: Worksheet API Endpoints
**Goal**: Backend to save and retrieve worksheets

Tasks:
- [ ] Create `/api/worksheets/route.ts`:
  - **POST**: Create new worksheet
    - Validate user authentication
    - Validate question IDs exist and belong to user
    - Create Worksheet record
    - Create WorksheetQuestion junction records with order
    - Return worksheet ID
  - **GET**: List user's worksheets
    - Pagination support
    - Include question count
    - Sort by created date
- [ ] Create `/api/worksheets/[id]/route.ts`:
  - **GET**: Fetch single worksheet with questions
    - Include all question details
    - Ordered by WorksheetQuestion.order
  - **PATCH**: Update worksheet metadata
  - **DELETE**: Delete worksheet (cascade to questions)

**Expected Outcome**: Full worksheet CRUD via API

---

### Priority 4: Save & View Worksheets
**Goal**: Persist worksheets and show in list

Tasks:
- [ ] Implement save functionality:
  - Validate form (title required)
  - Calculate total marks
  - POST to `/api/worksheets`
  - Show success message
  - Redirect to worksheet view or list
- [ ] Create `/app/dashboard/worksheets/page.tsx`:
  - List all user worksheets
  - Show title, date, question count, marks
  - Edit and Delete buttons
  - Link to view worksheet
- [ ] Create `/app/dashboard/worksheets/[id]/page.tsx`:
  - Display worksheet metadata
  - Show questions in order
  - "Export PDF" button (placeholder for now)
  - "Edit" button to go back to builder

**Expected Outcome**: Can save, list, and view worksheets

---

### Priority 5 (Stretch): PDF Export Foundation
**Goal**: Prepare for PDF generation (implementation can be Day 4)

Tasks:
- [ ] Research PDF libraries:
  - `react-pdf` - React components for PDF
  - `jsPDF` - JavaScript PDF generation
  - `@react-pdf/renderer` - Server-side PDF
- [ ] Choose library and install
- [ ] Create basic PDF template:
  - Header with school/exam info
  - Question list with numbers
  - Answer key on separate page
- [ ] Create `/api/worksheets/[id]/export` endpoint (stub)

**Expected Outcome**: PDF library chosen, basic structure planned

---

## 🎨 Design Guidelines

### Worksheet Builder Layout
```
┌─────────────────────────────────────────────────────┐
│ Navbar                                              │
├──────────┬──────────────────────────────────────────┤
│ Sidebar  │ Worksheet Builder                        │
│          │                                           │
│          │ [Title Input] [School] [Date]            │
│          │                                           │
│          │ ┌──────────┬──────────────────────────┐  │
│          │ │ Question │ Selected Questions       │  │
│          │ │ Bank     │                          │  │
│          │ │          │ 1. [Question] [X] [↑↓]  │  │
│          │ │ [Search] │ 2. [Question] [X] [↑↓]  │  │
│          │ │ [Filter] │ 3. [Question] [X] [↑↓]  │  │
│          │ │          │                          │  │
│          │ │ [+] Q1   │ Total Marks: 30         │  │
│          │ │ [+] Q2   │                          │  │
│          │ └──────────┴──────────────────────────┘  │
│          │                                           │
│          │ [Save Draft] [Preview] [Save & Export]   │
└──────────┴──────────────────────────────────────────┘
```

### Question Card in Builder
```
┌─────────────────────────────────────────┐
│ Q#: What is 2+2?                        │
│ Type: MCQ | Difficulty: Easy | 2 marks  │
│                                          │
│ [✏️ Edit] [❌ Remove] [↑ Up] [↓ Down]   │
└─────────────────────────────────────────┘
```

---

## 🔧 Technical Implementation

### Drag and Drop (Option: dnd-kit)
```bash
npm install @dnd-kit/core @dnd-kit/sortable
```

```tsx
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

function WorksheetBuilder() {
  const [questions, setQuestions] = useState([]);

  function handleDragEnd(event) {
    const { active, over } = event;
    if (active.id !== over.id) {
      // Reorder logic
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <SortableContext items={questions} strategy={verticalListSortingStrategy}>
        {questions.map(q => <SortableQuestion key={q.id} question={q} />)}
      </SortableContext>
    </DndContext>
  );
}
```

### State Management
```tsx
interface WorksheetState {
  metadata: {
    title: string;
    schoolName?: string;
    examName?: string;
    className?: string;
    date?: Date;
  };
  questions: Array<{
    id: string;
    order: number;
    customMarks?: number;
  }>;
  totalMarks: number;
}
```

### API Request Example
```typescript
// Save worksheet
const response = await fetch('/api/worksheets', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: metadata.title,
    schoolName: metadata.schoolName,
    examName: metadata.examName,
    className: metadata.className,
    date: metadata.date,
    questions: questions.map((q, idx) => ({
      questionId: q.id,
      order: idx + 1,
      customMarks: q.customMarks
    }))
  })
});
```

---

## 📊 Success Metrics

By end of Day 3, you should have:
- ✅ Worksheet builder page created
- ✅ Question selection and ordering working
- ✅ Worksheet API endpoints complete
- ✅ Can save and view worksheets
- 🎯 (Stretch) PDF library chosen and basic template created

---

## 📝 Database Schema Reminder

You already have this in place:
```prisma
model Worksheet {
  id         String   @id @default(cuid())
  userId     String
  title      String
  schoolName String?
  examName   String?
  className  String?
  date       DateTime?
  totalMarks Int?
  questions  WorksheetQuestion[]
}

model WorksheetQuestion {
  worksheetId String
  questionId  String
  order       Int
  customMarks Int?
  worksheet   Worksheet @relation(...)
  question    Question @relation(...)
  @@id([worksheetId, questionId])
}
```

---

## 📝 Commit Message Template

```
Implement worksheet builder with drag-and-drop

- Create worksheet builder page with form
- Add question selection from bank
- Implement drag-and-drop reordering
- Create worksheet CRUD API endpoints
- Add worksheet list and detail pages
- Enable save, view, and delete worksheets
- Calculate total marks automatically
```

---

## 🎯 Week 2 & 3 Goals

Master plan progress:
- ✅ Week 1: Setup, auth, layout (DONE)
- ✅ Week 2: AI generation, question bank (DONE!)
- ⏳ Week 3: Worksheet builder (doing today)
- ⏳ Week 3: PDF export (Day 4-5)

You're **crushing it!** 🚀

---

## 💡 UX Tips

- **Auto-save**: Consider auto-saving as draft
- **Confirmation**: Warn before deleting questions with unsaved changes
- **Visual Feedback**: Show loading states during save
- **Marks**: Auto-calculate total when marks change
- **Search**: Make it easy to find questions in large banks

---

**Read AGENT-PROGRESS.md for full context**
**GitHub**: https://github.com/Rukhtam/questionforge-webapp
