# taskwarrior-motion

Modern Web UI for Taskwarrior with glass-morphism design, smooth animations and sound effects.

---

## Features

### Core
- ✅ Task CRUD (Add/Edit/Delete/Complete/Uncomplete/Undo)
- ✅ Time Tracking (Start/Stop timer per task)
- ✅ Keyboard Shortcuts (j/k/n/x/Enter/Escape/?)
- ✅ Dark/Light/System Theme (3-mode toggle)

### Views
- 📋 **Items** — Pending tasks + collapsible completed section
- 📋 **Kanban** — 5 columns (Inbox/Backlog/InProgress/OnHold/Done)
- 📅 **Calendar** — Month/Week views

### Left Panel
- 🟩 **Heatmap** — 35-day GitHub-style, click to view daily completions
- 📊 **Project Progress** — Per-project progress bars, click to manage
- 🏷️ **Tags** — Top 8 tags by frequency, click to manage

### Modals
- ✏️ **Task Edit** — Priority/Due date/Wait date/Project/Tags
- 🏆 **Completion** — Particle burst + achievement badge + stats
- 📅 **Day Detail** — Click heatmap day to see completed tasks
- 📁 **Project Manage** — Rename/Delete/View tasks
- 🏷️ **Tag Manage** — Rename/Delete/View tasks
- ❓ **Help** — Keyboard shortcuts reference

### Design
- Glass-morphism panels (backdrop-blur + translucent backgrounds)
- Mesh gradient backgrounds (purple/blue/pink/teal/orange)
- Per-project colored task cards
- Completion animations (shake → check-pop → fade)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vue 3 + Vite + TypeScript + Tailwind CSS v4 + Pinia |
| Backend | Rust + Axum + Tokio |
| Icons | @lucide/vue |
| Sound | Web Audio API (synthesized) |
| Package | pnpm |

---

## Quick Start

```bash
# Clone
git clone https://github.com/GZ0759/taskwarrior-motion.git
cd taskwarrior-motion

# Install
make install

# Run
make dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

### Prerequisites

- taskwarrior >= 3.x
- Rust >= 1.75
- Node.js >= 18
- pnpm >= 8.x

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `n` | New task |
| `j` / `k` | Navigate tasks |
| `Enter` | Edit selected task |
| `x` | Complete selected task |
| `Escape` | Close modal |
| `?` | Show help |
| `Ctrl+Z` | Undo |

---

## API

Base URL: `http://localhost:3001/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | Get all tasks |
| POST | `/tasks` | Create task |
| PUT | `/tasks/:uuid` | Update task |
| DELETE | `/tasks/:uuid` | Delete task |
| GET | `/tasks/pending` | Pending tasks (items/kanban) |
| GET | `/tasks/completed?days=N` | Completed tasks (last N days) |
| GET | `/tasks/completed?date=YYYY-MM-DD` | Completed on specific date |
| GET | `/tasks/calendar` | Tasks with due dates |
| GET | `/stats` | Heatmap + project stats |
| POST | `/tasks/:uuid/done` | Complete task |
| POST | `/tasks/:uuid/uncomplete` | Uncomplete task |
| POST | `/tasks/:uuid/start` | Start timer |
| POST | `/tasks/:uuid/stop` | Stop timer |
| POST | `/undo` | Undo last action |

---

## License

MIT

---

## Acknowledgments

- [taskwarrior](https://taskwarrior.org/)
- [taskwarrior-web-portal](https://github.com/furan917/taskwarrior-web-portal)
- [taskwarrior-webui](https://github.com/DCsunset/taskwarrior-webui)
