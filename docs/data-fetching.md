# Data Fetching & TanStack Query Reference

## Query Options Factories

All factories live under `src/hooks/` (shared) or `src/features/<name>/hooks/` (feature-scoped).

### Shared (`src/hooks/`)

| Factory | Query Key | Service Fn | Stale / Refetch | Consumers |
|---------|-----------|------------|-----------------|-----------|
| `createMatchOpenQueryOptions(matchId)` | `['match-open', matchId]` | `supabase.rpc('match_open')` | 30 s | MatchPredictionDrawer (via `queryClient.fetchQuery`) |
| `createMatchesQueryOptions()` | `['matches']` | `getMatchesWithTeams` | 1 min | UpcomingMatchesCard, todays-matches route, all-matches route |
| `createUserScorePredictionsQueryOptions(userId)` | `['score-predictions', userId]` | `getUserScorePredictions` | 1 min | UpcomingMatchesCard, todays-matches route, all-matches route |
| `createLeaderboardQueryOptions()` | `['leaderboard']` | `getLeaderboardApi` | 1 min (overridable) | TopLeaderboardCard, match-prediction index, leaderboard route, bracket-prediction route, home route (via selector) |
| `createUserProfileQueryOptions(userId)` | `['user-profile', userId]` | `getUserProfileApi` | 5 min | UserHoverCard (enabled on hover) |
| `createDailyLeaderboardQueryOptions(date)` | `['leaderboard', 'daily', date.toDateString()]` | `getDailyLeaderboardApi` | default | DailyLeaderboard |

### Group Predictions feature (`src/features/group-predictions/hooks/`)

| Factory | Query Key | Service Fn | Stale / Refetch | Consumers |
|---------|-----------|------------|-----------------|-----------|
| `createGroupsQueryOptions()` | `['group-predictions', 'groups']` | `getGroupsWithTeams` | 1 min | GroupPredictionsForm, GroupPredictionsReadOnly |
| `createUserPredictionsQueryOptions(userId, staleTime?)` | `['group-predictions', 'user-predictions', userId]` | `getUserGroupPredictions` | default (own) / 5 min (other user) | GroupPredictionsForm, GroupPredictionsReadOnly |
| `createLockStatusQueryOptions()` | `['group-predictions', 'lock-status']` | `getGroupStageLockStatus` | 1 min / 60 s refetch | GroupPredictionsForm, LockStatusBadge |
| `createFirstGroupMatchQueryOptions()` | `['group-predictions', 'first-match-time']` | `getFirstGroupMatchTime` | 1 hr | LockStatusBadge |

### Knockout Predictions feature (`src/features/knockout-predictions/hooks/`)

| Factory | Query Key | Service Fn | Stale / Refetch | Consumers |
|---------|-----------|------------|-----------------|-----------|
| `createKnockoutMatchesQueryOptions()` | `['knockout', 'matches']` | `getKnockoutMatches` | 1 min | KnockoutPredictionsForm, KnockoutPredictionsReadOnly |
| `createUserKnockoutPredictionsQueryOptions(userId, staleTime?)` | `['knockout', 'picks', userId]` | `getUserKnockoutPredictions` | default (own) / 5 min (other user) | KnockoutPredictionsForm, KnockoutPredictionsReadOnly |
| `createKnockoutLockStatusQueryOptions()` | `['knockout', 'lock']` | `getKnockoutStageLockStatus` | 1 min / 60 s refetch | KnockoutPredictionsForm, KnockoutLockStatusBadge |
| `createFirstKnockoutMatchQueryOptions()` | `['knockout', 'first-match']` | `getFirstKnockoutMatchTime` | 1 hr | KnockoutLockStatusBadge |

### Onboarding feature (`src/features/onboarding/hooks/`)

| Factory | Query Key | Service Fn | Stale / Refetch | Consumers |
|---------|-----------|------------|-----------------|-----------|
| `createTeamsQueryOptions()` | `['teams']` | `getTeamsApi` | default | OnboardingFormContent |

---

## useQuery / useSuspenseQuery Usage

### `useQuery` (lazy — renders with loading state)

| Component | Factory Used | Notes |
|-----------|-------------|-------|
| `TopLeaderboardCard` | `createLeaderboardQueryOptions()` | Shows skeleton while loading |
| `UpcomingMatchesCard` | `createMatchesQueryOptions()` + `createUserScorePredictionsQueryOptions(userId)` | Both loaded independently |
| `UserHoverCard` | `createUserProfileQueryOptions(userId)` with `enabled: open` | Only fetches when popover is opened |
| `DailyLeaderboard` | `createDailyLeaderboardQueryOptions(today)` | Shows skeleton while loading |

### `useSuspenseQuery` (inside `<Suspense>` boundaries)

| Component / Route | Factories Used |
|-------------------|---------------|
| `home` route | `createLeaderboardQueryOptions({ select: … })` — derives user score from shared leaderboard cache |
| `match-prediction` index route | `createLeaderboardQueryOptions()` |
| `todays-matches` route | `createMatchesQueryOptions()` + `createUserScorePredictionsQueryOptions(userId)` |
| `all-matches` route | `createMatchesQueryOptions()` + `createUserScorePredictionsQueryOptions(userId)` |
| `leaderboard` route | `createLeaderboardQueryOptions()` |
| `bracket-prediction` route | `createLeaderboardQueryOptions()` |
| `GroupPredictionsForm` | `createGroupsQueryOptions()` + `createUserPredictionsQueryOptions(userId)` + `createLockStatusQueryOptions()` |
| `GroupPredictionsReadOnly` | `createGroupsQueryOptions()` + `createUserPredictionsQueryOptions(userId, 5min)` |
| `LockStatusBadge` | `createLockStatusQueryOptions()` + `createFirstGroupMatchQueryOptions()` |
| `KnockoutPredictionsForm` | `createKnockoutMatchesQueryOptions()` + `createUserKnockoutPredictionsQueryOptions(userId)` + `createKnockoutLockStatusQueryOptions()` |
| `KnockoutPredictionsReadOnly` | `createKnockoutMatchesQueryOptions()` + `createUserKnockoutPredictionsQueryOptions(userId, 5min)` |
| `KnockoutLockStatusBadge` | `createKnockoutLockStatusQueryOptions()` + `createFirstKnockoutMatchQueryOptions()` |
| `OnboardingFormContent` | `createTeamsQueryOptions()` |

---

## Mutations & Cache Invalidation

### `useMutation`

| Component | Mutation Fn | Invalidates Cache? |
|-----------|-------------|-------------------|
| `GroupPredictionsForm` | `upsertGroupPredictions(userId, predictions)` | Yes — `['group-predictions', 'user-predictions', userId]` |
| `KnockoutPredictionsForm` | `upsertKnockoutPredictions(userId, picks)` | Yes — `['knockout', 'picks', userId]` |
| `OnboardingFormContent` | `createProfileApi(dto)` | No — navigates away on success |

### `useQueryClient` (manual invalidation)

| Location | Invalidation |
|----------|-------------|
| `GroupPredictionsForm.tsx` | `invalidateQueries({ queryKey: ['group-predictions', 'user-predictions', userId] })` on save |
| `KnockoutPredictionsForm.tsx` | `invalidateQueries({ queryKey: ['knockout', 'picks', userId] })` on save |
| `MatchPredictionDrawer.tsx:83` | `invalidateQueries({ queryKey: ['score-predictions', profile.id] })` on save |

---

## Direct Supabase Calls (outside query system)

None — all data access goes through service functions or query factories.

---

## Service Functions

### `src/services/`

| Function | Operation | Table(s) |
|----------|-----------|---------|
| `getMatchesWithTeams` | SELECT + join | `matches` ⨝ `teams` |
| `getUserScorePredictions(userId)` | SELECT | `score_predictions` |
| `getLeaderboardApi` | SELECT + join | `profiles` ⨝ `user_scores` |
| `getUserProfileApi(userId)` | SELECT × 2 | `profiles`, `teams` |
| `getProfileApi(userId)` | SELECT single | `profiles` |
| `getDailyLeaderboardApi(date)` | SELECT × 2 | `matches` → `score_predictions` ⨝ `profiles` |
| `upsertScorePrediction(...)` | UPSERT | `score_predictions` |

### `src/features/group-predictions/services/`

| Function | Operation | Table(s) / RPC |
|----------|-----------|---------------|
| `getGroupsWithTeams` | SELECT + join | `groups` ⨝ `teams` |
| `getUserGroupPredictions(userId)` | SELECT | `group_stage_prediction_picks` |
| `getGroupStageLockStatus` | RPC | `group_stage_open()` |
| `getFirstGroupMatchTime` | SELECT | `matches` |
| `upsertGroupPredictions(userId, predictions)` | UPSERT | `group_stage_prediction_picks` |

### `src/features/knockout-predictions/services/`

| Function | Operation | Table(s) / RPC |
|----------|-----------|---------------|
| `getKnockoutMatches` | SELECT × 2 | `matches`, `teams` |
| `getUserKnockoutPredictions(userId)` | SELECT | `knockout_predictions` |
| `getKnockoutStageLockStatus` | RPC | `knockout_stage_open()` |
| `getFirstKnockoutMatchTime` | SELECT | `matches` |
| `upsertKnockoutPredictions(userId, picks)` | UPSERT | `knockout_predictions` |

---

## Cache Reuse — Shared Keys

All shared keys have a **1-minute stale time**. TanStack Query serves every consumer from a single network request once the cache is warm within that window.

| Key | Consumers | Stale Time |
|-----|-----------|-----------|
| `['matches']` | UpcomingMatchesCard, todays-matches, all-matches | 1 min |
| `['score-predictions', userId]` | UpcomingMatchesCard, todays-matches, all-matches | 1 min |
| `['leaderboard']` | TopLeaderboardCard, match-prediction index, leaderboard, bracket-prediction, home (selector) | 1 min |
| `['group-predictions', 'lock-status']` | GroupPredictionsForm, LockStatusBadge | 1 min + 60 s refetch |
| `['knockout', 'lock']` | KnockoutPredictionsForm, KnockoutLockStatusBadge | 1 min + 60 s refetch |
| `['knockout', 'matches']` | KnockoutPredictionsForm, KnockoutPredictionsReadOnly | 1 min |
| `['group-predictions', 'groups']` | GroupPredictionsForm, GroupPredictionsReadOnly | 1 min |

---

## `match_open` RPC Caching

`MatchPredictionDrawer` uses `queryClient.fetchQuery(createMatchOpenQueryOptions(matchId))` inside `handleSubmit`. The factory (`src/hooks/createMatchOpenQueryOptions.ts`) caches the result per match for 30 seconds.

- First submission for a given match fires the RPC and caches the boolean result.
- Any retry within 30 s (double-tap, slow-network retry) reads from cache with no extra round-trip.
- Two inflight calls for the same match are deduplicated by TanStack Query automatically.
