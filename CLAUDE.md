# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # dev server on http://localhost:3000 (strictPort — kill anything else on 3000 first)
pnpm build        # production build + PWA service worker generation
pnpm preview      # preview production build
pnpm test         # vitest (run once)
pnpm lint
pnpm format       # prettier --write + eslint --fix
pnpm check        # prettier check only
pnpm gen:types    # regenerate src/types/database.types.ts from linked Supabase project
```

Run a single test file:

```bash
pnpm vitest run src/features/auth/utils/example.test.ts
```

Add a shadcn component:

```bash
pnpm dlx shadcn@latest add <component>
```

## Architecture

**Stack:** React 19 + Vite, TanStack Router (file-based, type-safe), TanStack Query (server state), Zustand (client state), Supabase (Postgres + Auth + Edge Functions + Realtime), Tailwind CSS v4 + shadcn/ui, PWA via `vite-plugin-pwa`.

### Routing

Routes live in `src/routes/` and are file-based. The plugin auto-generates `src/routeTree.gen.ts` — never edit this file manually. Route files must stay thin: they import from `features/` and render; no business logic.

`__root.tsx` bootstraps the auth listener (`supabase.auth.onAuthStateChange`) and writes session/profile into the Zustand auth store. It also redirects post-login: no profile → `/onboarding`, profile exists → `/dashboard`.

The `RouterContext` (defined in `src/router.tsx`) carries `queryClient`, `session`, and `profile` into `beforeLoad` on every route.

### State ownership

| Data                                                  | Owner                                |
| ----------------------------------------------------- | ------------------------------------ |
| Auth session / user profile                           | `stores/auth.store.ts` (Zustand)     |
| All Supabase data (matches, predictions, leaderboard) | TanStack Query                       |
| Realtime connection status (online/offline banner)    | `stores/realtime.store.ts` (Zustand) |
| Unsaved drag-and-drop order                           | Local component `useState`           |

**Rule:** never put server data in Zustand. On a Supabase Realtime event, invalidate the TanStack Query cache key — do not store the payload in Zustand.

### Feature modules

Business logic lives in `src/features/<name>/` with sub-folders mirroring the top-level layout (`components/`, `hooks/`, `services/`, `types/`, `utils/`). Each feature exposes its public API through `index.ts` — no deep path imports from outside.

Features never import from each other. When two or more features need the same code, promote it to the matching top-level shared folder (`src/components/`, `src/hooks/`, `src/services/`, `src/types/`, `src/utils/`).

### Supabase

- Browser client singleton: `src/lib/supabase/supabase.ts`
- DB types (auto-generated): `src/types/database.types.ts` — run `pnpm gen:types` after schema changes
- Edge Functions in `supabase/functions/` are standalone Deno modules; they cannot import from `src/`. Duplicate or inline any types they need.
  - `sync-matches` — pg_cron triggered, calls football-data.org, upserts `matches` table
  - `award-points` — Postgres webhook on `matches` row update, scores predictions, broadcasts Realtime signal

### Path aliases

Both `#/*` and `@/*` resolve to `src/*`. Prefer `#/` for new code (used throughout the codebase).

### shadcn/ui

The `cn()` helper lives at `src/lib/shadcn/utils/utils.ts`. `components.json` maps the `utils` alias there — do not move or rename this file without updating `components.json` and reinstalling affected components.
