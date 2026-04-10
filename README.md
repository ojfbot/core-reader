# Core Reader

> Read-only documentation viewer for the Frame OS workflow framework.

Core Reader surfaces the `core` repo's slash commands, Architecture Decision Records, roadmap, OKRs, and documentation as a searchable dashboard. It reads the core repo filesystem directly — no database, no ETL. The `core` repo IS the source of truth.

## Features

- **Dashboard** — Skills, ADRs, Roadmap, OKRs, Docs, Changes, Activity tabs (some in progress)
- **Filesystem-driven** — reads the core repo via `CORE_REPO_PATH` environment variable
- **Module Federation remote** — renders inside the Frame OS shell alongside sibling apps
- **Carbon Design System** — consistent dark/light theming with the rest of Frame OS
- **Shared UI components** — uses `@ojfbot/frame-ui-components` (npm `^1.0.1`) for dashboard chrome

## Architecture

```
packages/
  api/           Express server (:3016) — filesystem parsers for skills, ADRs, roadmap
  browser-app/   React + Carbon DS (:3015) — 7-tab dashboard, Module Federation remote
```

The API reads `.claude/skills/`, `decisions/adr/`, and `domain-knowledge/` from the core repo path. No mutations — strictly read-only.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Build | Vite 5, Module Federation |
| UI | React 18, Carbon Design System |
| API | Express, chokidar (filesystem watch) |
| Shared | @ojfbot/frame-ui-components (npm ^1.0.1) |
| Language | TypeScript |

## Getting Started

**Prerequisites:** Node >= 24 (via `fnm use`), pnpm 9

```bash
cp .env.example .env
# Set CORE_REPO_PATH to the absolute path of your core repo checkout

pnpm install
pnpm dev:all    # API on :3016, frontend on :3015
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CORE_REPO_PATH` | Yes | Absolute path to the core repo |
| `PORT` | No | API port (default: 3016) |
| `CORS_ORIGIN` | No | Allowed origin (default: http://localhost:4000) |
| `VITE_CORE_READER_API_URL` | No | API URL for the frontend (default: http://localhost:3016) |

## Roadmap

- [x] Phase 1: Skills + ADRs tabs
- [x] Module Federation remote registered in shell
- [x] Vercel deployment
- [ ] Phase 2: OKRs, Roadmap, Docs tabs
- [ ] Phase 3: Cross-entity links (see core's ## See Also activation graph)
- [ ] Phase 4: LangGraph chat agent via frame-agent
- [ ] Phase 5: Changes + Activity tabs (git history)

## License

MIT

## Frame OS Ecosystem

Part of [Frame OS](https://github.com/ojfbot/shell) — an AI-native application OS.

| Repo | Description |
|------|-------------|
| [shell](https://github.com/ojfbot/shell) | Module Federation host + frame-agent LLM gateway |
| [core](https://github.com/ojfbot/core) | Workflow framework — 30+ slash commands + TypeScript engine |
| [cv-builder](https://github.com/ojfbot/cv-builder) | AI-powered resume builder with LangGraph agents |
| [blogengine](https://github.com/ojfbot/BlogEngine) | AI blog content creation platform |
| [TripPlanner](https://github.com/ojfbot/TripPlanner) | AI trip planner with 11-phase pipeline |
| **core-reader** | **Documentation viewer for the core framework (this repo)** |
| [lean-canvas](https://github.com/ojfbot/lean-canvas) | AI-powered lean canvas business model tool |
| [gastown-pilot](https://github.com/ojfbot/gastown-pilot) | Multi-agent coordination dashboard |
| [seh-study](https://github.com/ojfbot/seh-study) | NASA SEH spaced repetition study tool |
| [daily-logger](https://github.com/ojfbot/daily-logger) | Automated daily dev blog pipeline |
| [purefoy](https://github.com/ojfbot/purefoy) | Roger Deakins cinematography knowledge base |
| [MrPlug](https://github.com/ojfbot/MrPlug) | Chrome extension for AI UI feedback |
| [frame-ui-components](https://github.com/ojfbot/frame-ui-components) | Shared component library (Carbon DS) |
