# `features/`

Feature modules for the football prediction app. Each subfolder is a self-contained vertical slice.
A feature mirrors the top-level folder structure — it owns everything it needs internally
before anything gets promoted to the shared top-level folders.

Routing lives in `src/routes/` (TanStack Router). Route files stay thin: import from a feature’s
`index.ts` and render. Do not put business logic in route files.

See `src/docs/architecture.md` for the full feature map and dependency rules.

## Structure

```
features/
└── group-predictions/
    ├── components/       # UI used only within this feature
    ├── hooks/            # Hooks used only within this feature
    ├── services/         # Supabase queries and mutations for this feature
    ├── types/            # Types used only within this feature
    ├── utils/            # Pure helpers for this feature
    └── index.ts          # Public API — only export what other modules need
```

## The "promote up" rule

Start everything inside the feature. Only move something to a top-level shared folder
when a **second feature needs it**.

```
Feature-local (default)              →    Promote when shared across 2+ features
──────────────────────────────────────────────────────────────────────────────
features/auth/components/            →    components/
features/auth/hooks/                 →    hooks/
features/auth/services/              →    services/
features/auth/types/                 →    types/
features/auth/utils/                 →    utils/
```

## Rules

- **Features do not import from other features.** If two features share something, promote it to the relevant top-level folder.
- **Export via `index.ts`.** Consumers import from `#/features/group-predictions`, not deep paths like `#/features/group-predictions/components/GroupBoard`.
- **Not every subfolder is required.** Only create subfolders the feature actually uses.
- **Server state in TanStack Query, not Zustand.** Feature `services/` return query/mutation functions; caches live in TanStack Query. Use `stores/` only for client-only state (see architecture doc).
- **Mirror top-level conventions.** Each subfolder follows the same rules as its top-level counterpart — see those `README.md` files for guidance.

## Example `index.ts`

```ts
// features/group-predictions/index.ts
export { GroupStageBoard } from "./components/GroupStageBoard";
export { useGroupPrediction } from "./hooks/useGroupPrediction";
export { groupPredictionService } from "./services/groupPredictionService";
export type { GroupOrder, GroupPrediction } from "./types/group-prediction.types";
```

## Feature folders (this app)

```
features/
├── auth/                  # Microsoft OAuth, session, route guards
├── onboarding/            # Display name, team, avatar
├── dashboard/             # Today’s matches, leaderboard snapshots
├── group-predictions/     # dnd-kit group stage ordering, locks, submit
├── knockout-predictions/  # Bracket UI, winner picks, locks
├── score-predictions/     # Per-match score input, lock countdown
└── leaderboard/           # F1, F2, F3 leaderboard views
```
