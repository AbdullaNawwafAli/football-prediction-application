# `services/`

Shared data access: Supabase queries, mutations, and TanStack Query option factories used by
**two or more** features.

Feature-specific data access belongs in `features/<name>/services/`.

See `src/docs/architecture.md` for state ownership (TanStack Query for server data, not Zustand).

## What belongs here

- Query keys and `queryOptions` / `mutationOptions` reused across features
- Shared Supabase table accessors (e.g. matches list used on dashboard and score predictions)
- Invalidation helpers tied to Realtime events when multiple features share a cache key

## What does NOT belong here

- Supabase client construction — `#/lib/supabase`
- UI or React hooks — `hooks/` or feature hooks wrapping these services
- Edge Function logic — `supabase/functions/` (Deno, no `src/` imports)

## Structure

```
services/
├── matches.service.ts
├── leaderboard.service.ts
└── query-keys.ts         # Centralised TanStack Query keys
```

## Example

```ts
// services/query-keys.ts
export const queryKeys = {
  matches: ["matches"] as const,
  match: (id: string) => ["matches", id] as const,
  leaderboard: (feature: "f1" | "f2" | "f3") => ["leaderboard", feature] as const,
};
```

## Conventions

- Import the Supabase client from `#/lib/supabase`; do not create a second client.
- Return plain async functions or TanStack Query configs — keep components thin.
- On Realtime events, invalidate query keys; do not push payloads into Zustand (see architecture doc).
