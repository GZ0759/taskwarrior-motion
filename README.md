# taskwarrior-motion

Modern Web UI for Taskwarrior with smooth animations and sound effects

---

## Features

### Core Features
- ✅ Task CRUD (Add/Edit/Delete/Complete)
- ✅ List Views (Next/Ready/Agenda/Forecast)
- ✅ Search & Filter (Real-time search)
- ✅ Dark Mode (Follow system + Manual toggle)
- ✅ Keyboard Shortcuts (j/k/x/n etc.)

### View Features
- 📋 Kanban View (Inbox/Backlog/InProgress/OnHold/Done)
- 📅 Calendar View (Month/Week/Day)
- ✅ Done View (Completed tasks list)

### Advanced Features
- 🏷️ Tags/Projects (Autocomplete, Rename)
- ⚡ Priority (H/M/L with color coding)
- 🔗 Dependencies (Task dependencies)
- 🔄 Recurring Tasks (Recur/Until support)
- 📦 Bulk Operations (Multi-select complete/delete)
- ↩️ Undo (task undo)
- ⏱️ Time Tracking (Start/Stop timer)
- 🎯 Context Management (Persistent filters)
- 📊 Timesheet (Time log view)

### Animations & Sound Effects
- ✨ Complete Animation (Checkmark → Particle explosion → Fade out)
- 🗑️ Delete Animation (Slide out → Fade out)
- ➕ Add Animation (Slide in → Fade in)
- 🔊 Sound Effects (Complete/Delete/Add sounds)

---

## Tech Stack

### Frontend
- **Vue 3** - UI Framework
- **Vite** - Build Tool
- **TypeScript** - Type System
- **Tailwind CSS v4** - Styling
- **GSAP** - Animation Library
- **Howler.js** - Sound Effects
- **Pinia** - State Management
- **pnpm** - Package Manager

### Backend
- **Rust** - Programming Language
- **Axum** - Web Framework
- **Tokio** - Async Runtime
- **serde** - Serialization

---

## Architecture

```
Vue 3 SPA (Browser)
    ↓ HTTP Requests
Rust API Service (Axum)
    ↓ Calls
taskwarrior CLI
    ↓ Read/Write
taskchampion.sqlite3
```

---

## Prerequisites

- **taskwarrior** >= 3.x
- **Rust** >= 1.75
- **Node.js** >= 18
- **pnpm** >= 8.x

---

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/GZ0759/taskwarrior-motion.git
cd taskwarrior-motion
```

### 2. Install Dependencies

```bash
make install
```

### 3. Start Development

```bash
make dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

---

## Development

### Available Commands

```bash
make help          # Show all available commands
make install       # Install dependencies
make build         # Build project
make dev           # Start development servers
make test          # Run all tests
make test-coverage # Run tests with coverage
make lint          # Check code quality
make fmt           # Format code
make clean         # Clean build files
make storybook     # Start Storybook
make run           # Run production version
```

### Project Structure

```
taskwarrior-motion/
├── README.md
├── LICENSE
├── Makefile
├── .gitignore
├── .eslintrc.cjs
├── .prettierrc
├── docs/
│   ├── plans/
│   │   └── taskwarrior-motion.md
│   └── specs/
│       ├── architecture.md
│       ├── api-spec.md
│       ├── components-spec.md
│       └── testing-spec.md
├── server/                         # Rust Backend
│   ├── Cargo.toml
│   ├── src/
│   │   ├── main.rs
│   │   ├── routes.rs
│   │   ├── taskwarrior.rs
│   │   ├── models.rs
│   │   └── errors.rs
│   └── tests/
├── client/                         # Vue Frontend
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── .storybook/
│   ├── src/
│   │   ├── main.ts
│   │   ├── App.vue
│   │   ├── api/
│   │   ├── components/
│   │   ├── views/
│   │   ├── stores/
│   │   ├── composables/
│   │   ├── types/
│   │   ├── assets/
│   │   └── utils/
│   ├── public/
│   │   └── sounds/
│   └── tests/
└── scripts/
    └── setup.sh
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `n` | New task |
| `j` | Focus next task |
| `k` | Focus previous task |
| `Enter` | Edit focused task |
| `x` | Complete focused task |
| `Escape` | Close modal |
| `?` | Show help |
| `Ctrl+Z` | Undo last action |

---

## API Documentation

See [API Specification](docs/specs/api-spec.md) for detailed API documentation.

### Base URL

```
http://localhost:3001/api
```

### Endpoints

- `GET /api/tasks` - Get tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:uuid` - Update task
- `DELETE /api/tasks/:uuid` - Delete task
- `POST /api/tasks/:uuid/done` - Complete task
- `POST /api/tasks/:uuid/start` - Start timer
- `POST /api/tasks/:uuid/stop` - Stop timer
- `POST /api/undo` - Undo last action

---

## Testing

### Run Tests

```bash
# Run all tests
make test

# Run backend tests
make test-server

# Run frontend tests
make test-client

# Run tests with coverage
make test-coverage
```

### Coverage Target

- **Overall**: 90%+
- **Unit Tests**: 95%+
- **Integration Tests**: 85%+

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- **Rust**: Follow `rustfmt` and `clippy` standards
- **TypeScript**: Follow ESLint + Prettier standards
- **Commits**: Use Conventional Commits format

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [taskwarrior](https://taskwarrior.org/) - Task management tool
- [taskwarrior-web-portal](https://github.com/furan917/taskwarrior-web-portal) - Reference implementation
- [taskwarrior-webui](https://github.com/DCsunset/taskwarrior-webui) - Reference implementation

---

## Contact

- **GitHub**: [GZ0759](https://github.com/GZ0759)

---

## Roadmap

### Phase 1: Core (Week 1) ✅
- [x] Project initialization
- [x] Rust backend implementation
- [x] Taskwarrior CLI wrapper

### Phase 2: Frontend (Week 2) ✅
- [x] Vue frontend core
- [x] Task CRUD
- [x] List view
- [x] Search & filter

### Phase 3: Views (Week 3) ✅
- [x] Kanban view
- [x] Calendar view
- [x] Done view
- [x] Advanced features

### Phase 4: Polish (Week 4) ✅
- [x] Animations
- [x] Sound effects
- [x] Testing
- [x] Documentation

---

## Support

If you have any questions or issues, please open an issue on GitHub.

---

Made with ❤️ for the taskwarrior community
