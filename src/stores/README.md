# `stores/`

Global **client** state with Zustand. Synchronous state needed across routes without waiting on a query.

Server data (matches, predictions, leaderboards) belongs in **TanStack Query**, not here.
See `src/docs/architecture.md` for the state ownership table.

## What belongs here

- `auth.store.ts` — session and user profile for guards and layout
- `realtime.store.ts` — connection status for UI banners (not match rows themselves)
- Ephemeral UI preferences that must persist across routes (e.g. sidebar open)

## What does NOT belong here

- Lists of matches, scores, predictions, or leaderboard rows — TanStack Query + `services/`
- Realtime payload caches — invalidate TanStack Query instead
- Feature-only UI state — component `useState` or a feature-local store if truly needed

## Structure

```
stores/
├── auth.store.ts
└── realtime.store.ts
```

## Conventions

- Stores may import from `#/lib/` and `#/types/` only — not from `features/` or `routes/`.
- Keep actions small; call Supabase auth APIs from actions or thin helpers, not from components.
- After auth changes, invalidate relevant TanStack Query keys rather than duplicating server data in the store.
