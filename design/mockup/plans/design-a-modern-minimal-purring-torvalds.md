# Plan: taskwarrior-motion

## Context
Build a high-fidelity, local-first task management SPA called "taskwarrior-motion". The brief asks for Linear/Raycast/Things 3 aesthetic — minimal, keyboard-driven, smooth animations. The app has 4 main views (List, Kanban, Calendar, Done) with a persistent sidebar, full dark/light/system theme support, sound toggles, and task CRUD via a modal form.

## Aesthetic Stance
**Minimalist** — Apple/Linear/Teenage Engineering lineage. One strong accent, tight type, generous whitespace, hairline borders.

- **Fonts**: Inter (Google Fonts) — covers display, body, and mono-adjacent via numeric tabular figures. Clean, neutral, ubiquitous in productivity tools.
- **Canvas (light)**: True white (`#FFFFFF`) background, `#F9FAFB` sidebar, `#F3F4F6` inputs
- **Canvas (dark)**: `#111827` page, `#1F2937` sidebar, `#374151` elevated surfaces
- **Primary accent**: Blue `#3B82F6` (Tailwind blue-500)
- **Priority colors**: Red=High, Amber=Medium, Blue=Low
- **Radius**: 8px (`0.5rem`)

## Architecture

All code lives in `src/app/App.tsx` as a single self-contained file (~900-1100 lines). State is managed via React `useState`/`useReducer` — no external state library. No routing library needed; views are switched via state.

### State Shape
```ts
type Priority = 'H' | 'M' | 'L'
type Status = 'inbox' | 'backlog' | 'in-progress' | 'on-hold' | 'done'
type View = 'next' | 'ready' | 'agenda' | 'forecast' | 'kanban' | 'calendar' | 'done'

interface Task {
  id: string
  description: string
  project: string
  tags: string[]
  priority: Priority
  dueDate: string | null   // ISO date string
  status: Status
  completed: boolean
  completedAt: string | null
  createdAt: string
}
```

### Seed Data
~20 realistic tasks across 4 projects (Design System, API Migration, Marketing Site, Q3 Planning) with varied priorities, dates, tags.

## Components (all in App.tsx)

| Component | Purpose |
|---|---|
| `App` | Root: theme state, sound state, view routing |
| `Sidebar` | Left nav with view links, filter chips, project list |
| `Header` | App title, search, theme/sound toggles |
| `TaskList` | Filtered task list for list-based views |
| `TaskItem` | Single task row: checkbox, description, priority badge, project, due date, hover actions |
| `KanbanBoard` | 5-column kanban grid |
| `KanbanColumn` | Column header + task cards |
| `KanbanCard` | Card with drag-to-move via column buttons |
| `CalendarView` | Month grid with task chips |
| `TaskForm` | Create/edit modal with all fields |
| `KeyboardShortcuts` | Help modal |
| `TimerWidget` | Floating bottom-right active timer |
| Toast notifications via `sonner` |

## Theme Tokens to Update (`src/styles/theme.css`)
Update `:root` and `.dark` only — preserve all `@theme inline` mappings:

```css
:root {
  --background: #ffffff;
  --foreground: #111827;
  --card: #ffffff;
  --card-foreground: #111827;
  --primary: #3B82F6;
  --primary-foreground: #ffffff;
  --secondary: #F3F4F6;
  --secondary-foreground: #374151;
  --muted: #F9FAFB;
  --muted-foreground: #6B7280;
  --accent: #EFF6FF;
  --accent-foreground: #1D4ED8;
  --border: rgba(0,0,0,0.08);
  --ring: #3B82F6;
  --radius: 0.5rem;
  --sidebar: #F9FAFB;
}

.dark {
  --background: #111827;
  --foreground: #F9FAFB;
  --card: #1F2937;
  --card-foreground: #F9FAFB;
  --primary: #60A5FA;
  --primary-foreground: #1E3A5F;
  --secondary: #374151;
  --secondary-foreground: #E5E7EB;
  --muted: #1F2937;
  --muted-foreground: #9CA3AF;
  --accent: #1E3A5F;
  --accent-foreground: #93C5FD;
  --border: rgba(255,255,255,0.08);
  --ring: #60A5FA;
  --sidebar: #1F2937;
}
```

## Fonts (`src/styles/fonts.css`)
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
```
Then set `--font-sans: 'Inter', system-ui, sans-serif` in theme.

## Key Interactions

### Animations (using `motion/react`)
- **Task complete**: checkbox scale → green → item fades out (opacity 0, height 0) in 400ms
- **Task delete**: slide left + fade out in 300ms  
- **Task add**: slide in from right + fade in 400ms
- **View transitions**: fade in/out on view change
- **Hover**: card lifts slightly (translateY -1px), buttons fade in

### Sound Effects
- Web Audio API (no library needed) — synthesize short tones:
  - Task complete: pleasant ascending chime (~200ms)
  - Task delete: short descending whoosh
  - Task add: subtle click
- Sound toggle persisted in localStorage
- All sounds wrapped in try/catch (browser policy)

### Theme
- Three-way toggle: light → dark → system
- Applied via `.dark` class on `<html>`
- System preference via `window.matchMedia('prefers-color-scheme: dark')`
- Persisted in localStorage

### Keyboard Shortcuts
- `n` — new task
- `k` — kanban view
- `c` — calendar view
- `/` — focus search
- `Escape` — close modal
- `?` — shortcuts help

## View Logic

### List Views (Next, Ready, Agenda, Forecast, Done)
- **Next**: non-completed tasks with due date within 7 days, sorted by due date
- **Ready**: non-completed tasks with status `backlog` or `inbox`, no due date
- **Agenda**: today's tasks
- **Forecast**: next 14 days, grouped by date
- **Done**: completed tasks, grouped by completion date

### Kanban
- 5 columns: Inbox, Backlog, In Progress, On Hold, Done
- Each task card has ← → arrow buttons to move between columns
- Column headers show task count badge

### Calendar
- Month view default, week/day toggles (month only fully implemented, others show placeholder)
- Navigate prev/next month, "Today" button
- Tasks shown as colored chips on their due date
- Click chip to open task edit modal

### Task Form Modal
- Radix Dialog primitive
- Fields: description (required), project (text + datalist autocomplete), tags (comma-separated), priority radio (H/M/L), due date (date input)
- Submit creates or updates task

## Files Modified
1. `src/app/App.tsx` — full replacement with complete app (~1000 lines)
2. `src/styles/theme.css` — update `:root` and `.dark` token values only
3. `src/styles/fonts.css` — add Inter Google Fonts import

## Verification
After implementation:
- Light/dark/system theme toggle works
- Can create a task via "+" button and via `n` key
- Can complete a task (checkbox animates, item removes)
- Can delete a task (slides out)
- Kanban view shows 5 columns, tasks can be moved
- Calendar shows month grid with task chips on due dates
- Sound toggle mutes/unmutes audio feedback
- `?` key opens keyboard shortcuts modal
- Search bar filters visible tasks
