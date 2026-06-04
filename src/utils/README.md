# `utils/`

Pure utility and helper functions. No React, no side effects, no I/O.

See `src/docs/architecture.md` for when to keep helpers feature-local vs promote here.

## What belongs here

- Formatting: `formatKickoff`, `formatPoints`, `formatRank`
- Parsing and transformation: `parseScoreInput`, `slugify`, `truncate`
- Validation helpers: `isValidScore`, `isLocked`
- Pure calculations: `pointsForExactScore`, `paginationRange`

## What does NOT belong here

- React hooks — `hooks/`
- Supabase or HTTP calls — `services/` or `features/*/services/`
- Functions with side effects, `Date.now()` hidden in logic, or env reads

## Structure

```
utils/
├── format.ts             # Dates, scores, points display
├── validation.ts         # Input and lock-state checks
├── match.ts              # Match/prediction pure transforms
└── array.ts              # Shared array/object helpers
```

## Example

```ts
// utils/format.ts
export function formatKickoff(iso: string, timeZone = 'UTC'): string {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone,
  }).format(new Date(iso))
}

export function formatScore(home: number | null, away: number | null): string {
  if (home === null || away === null) return '–'
  return `${home}–${away}`
}
```

## Conventions

- Every function must be pure — same inputs always yield the same outputs.
- Named exports only; no default exports.
- One concern per file; split when a file grows past ~100 lines.
- Functions should be trivially unit-testable without mocks.
