# CLAUDE.md — core-reader

> **Before any work in this repo, read `domain-knowledge/frame-os-context.md`.**
> Then read `domain-knowledge/corereader-ux-research.md` and `decisions/core/adr/0010-corereader-metadata-dashboard.md`.

## What this repo is

`core-reader` is a Frame OS sub-app that reads the `core` repo's own filesystem and
surfaces its slash skills, ADRs, and roadmap as a queryable dashboard. It appears
in the shell's app switcher alongside cv-builder, blogengine, and tripplanner.

Port assignment (ADR-0010): browser-app :3015 (standalone) / :3015 (MF remote to shell), API :3016.

## Skills

```bash
pnpm install

# Run both servers (API + browser-app)
pnpm dev:all

# Individual packages
pnpm --filter @core-reader/api dev       # API on :3016
pnpm --filter @core-reader/browser-app dev   # browser-app on :3015

pnpm build
pnpm test
```

## Required environment

Copy `.env.example` to `.env` and set:
```
CORE_REPO_PATH=/path/to/ojfbot/core    # absolute path to the core repo
PORT=3016
CORS_ORIGIN=http://localhost:4000
VITE_CORE_READER_API_URL=http://localhost:3016
```

## Architecture

- `packages/api/` — Express :3016. Reads `CORE_REPO_PATH` filesystem. Parsers for
  skills (`.claude/skills/`), ADRs (`decisions/adr/`), roadmap (`frame-os-context.md`).
  No database — the `core` repo filesystem IS the source of truth.
- `packages/browser-app/` — React 18 + Carbon Design System + Vite MF remote.
  Seven tabs across Phases 1–5: Skills | ADRs | Roadmap | OKRs | Docs | Changes | Activity. UI primitives (`ChatShell`, `ChatMessage`, `MarkdownMessage`, `DashboardLayout`, `ErrorBoundary`, etc.) imported from `@ojfbot/frame-ui-components` — no local copies. Vite `optimizeDeps` must exclude `frame-ui-components` (symlinked source dep) and explicitly include its CJS transitive dependencies.
  Shell integration follows `domain-knowledge/shell-mf-integration.md` exactly.

## Shell MF integration invariants

Read `domain-knowledge/shell-mf-integration.md` before touching browser-app code.
Key rules:
- `Dashboard.tsx` always exports with `shellMode?: boolean` prop + double-Provider
- `vite-plugin-css-injected-by-js` before federation in vite.config.ts
- `@carbon/react` must be in shared singleton map (object form)
- Thread sidebar uses `inert=""` wrapper (Phase 4 — now present as of phases 2–5 merge)
- Never remove `isolation: isolate` from `.main-content` in the shell

## Current scope (Phases 1–5)

Seven dashboard tabs: Skills, ADRs, Roadmap (Phase 1), OKRs, Docs, Changes, Activity (Phases 2–5).
No mutations, no chat agent, no threads yet.

See `domain-knowledge/corereader-ux-research.md` for full IA spec.
