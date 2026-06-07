# World Cup Prediction App — Spec

> In-house (company only) Progressive Web App for predicting World Cup results and competing on leaderboards.

---

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React + Vite |
| Routing | TanStack Router |
| Data fetching | TanStack Query |
| State | Zustand |
| Styling | shadcn/ui (Tailwind) |
| Auth | Supabase Auth (Microsoft / Azure provider) |
| Backend | Supabase (Postgres, Edge Functions, Realtime) |
| Realtime | Supabase Realtime |
| Match data | football-data.org → Supabase Edge Function (cron) |
| Drag & drop | dnd-kit/core (Feature 1 group ordering) |
| Serving | nginx container |
| Type safety | Supabase CLI + `supabase gen types` |

**pnpm packages:** tanstack-router, tanstack-query, shadcn, supabase-js, zustand, dnd-kit/core

---

## Global constraints

- **Note 1 — Unique display names.** Every user's display name must be unique. Checked at onboarding.
- **Note 2 — Live scoring.** Points are awarded based on the *current* state of the match, not only when it finishes.
- **Note 3 — No offline predictions.** Predictions cannot be submitted offline. Enforced server-side (RLS checks server time at write).
- **Prediction locks:**
  - Group stage → locks 1 hour before the **first** group match.
  - Knockout stage → locks 1 hour before the **first** knockout match.
  - Score predictions (Feature 2) → lock 1 hour before **each** match.

---

## Feature map

| Feature | What it is | Pages |
|---|---|---|
| Auth & Onboarding | Sign in + profile setup | Login, Onboarding |
| Feature 1 | Group + knockout bracket predictions | Set Group, Set Knockout, My Predictions, F1 Leaderboard |
| Feature 2 | Per-match score & outcome predictions | Today's Matches, F2 Leaderboard |
| Feature 3 | Combined leaderboard (F1 + F2) | F3 Leaderboard |
| Feature 4 | Dashboard that composes everything | Dashboard |

---

## Page template

Each page below uses this structure — fill in the blanks marked **❓**:

- **Route** — the URL path
- **Purpose** — one sentence
- **Serves** — which user stories
- **Data needed** — tables / queries / realtime subscriptions
- **Components** — key UI pieces
- **States** — loading / empty / locked / offline / error
- **❓ To flesh out** — open questions and details to decide

---

# Auth & Onboarding

## Login page

- **Route:** `/`
- **Purpose:** Let a user sign in with Microsoft.
- **Serves:** "log in using Microsoft."
- **Data needed:** Supabase Auth (`signInWithOAuth({ provider: 'azure' })`).
- **Components:** App logo/title, "Sign in with Microsoft" button.
- **States:** signing-in (redirecting), auth error.
- **Behaviour:** after sign-in → if profile incomplete go to Onboarding, else Dashboard.
- **❓ To flesh out:**
  - Branding / hero copy?
  - Handle the OAuth redirect callback route?
  - What counts as "profile incomplete"?

## Onboarding page

- **Route:** `/onboarding`
- **Purpose:** Set display name, supported team, optional profile picture.
- **Serves:** "set a display name and which team they support and a profile picture (possibly)."
- **Data needed:** insert/update `profiles`; list of teams; uniqueness check on display name; profile picture → Supabase Storage.
- **Components:** display name input (live uniqueness check), team selector, avatar upload (optional), submit.
- **States:** checking name, name taken, uploading avatar, saving, error.
- **Behaviour:** on submit → seed `user_scores` row (via trigger), go to Dashboard.
- **❓ To flesh out:**
  - Team list source — static seed table, or pulled from football-data.org?
  - Is the profile picture in v1 or deferred?
  - Can users edit their profile later? Where?

---

# Feature 1 — Group & Knockout Predictions

> Predict group standings and the knockout bracket before each stage locks. Live leaderboard as results come in.

## Set Group Stage Predictions page

- **Route:** `/stage-prediction/my-group`
- **Purpose:** Drag teams into predicted finishing order for each group; submit before lock.
- **Serves:** "put in predictions for the group stage before the start of the first group stage match."
- **Data needed:** read `matches(to find the first group_stage matches start time)`/`teams(build the groups using this)` to build groups; read existing `group_stage_predictions`; upsert on submit.
- **Components:** one draggable list per group (dnd-kit), submit button, lock countdown banner.
- **States:** loading, editable, **locked** (read-only after deadline), saving, offline (block submit), error.
- **Behaviour:** editable until lock; one row per (user, group) stored as ordered team IDs.
- **❓ To flesh out:**
  - How many positions matter — full order, or just top 2 that advance?
  - Visual treatment of the lock countdown?

## Set Knockout Stage Predictions page

- **Route:** `/stage-prediction/my-knockout`
- **Purpose:** Pick the winner of each knockout match to fill the bracket.
- **Serves:** "put my knockout stage predictions before the first knockout stage match begins."
- **Data needed:** knockout fixtures; existing `knockout_predictions`; upsert on submit.
- **Components:** bracket view, per-match winner selectors that cascade to the next round, submit, lock countdown.
- **States:** loading, editable, locked, saving, offline, error.
- **❓ To flesh out:**
  - How is the bracket seeded before group results exist? (placeholders / user's own group predictions?)
  - Does picking a winner auto-advance them to the next round selector?

---

# Feature 2 — Match Score Predictions

> Predict exact score + outcome for each match, up to 1 hour before kickoff. Scored live.

## Today's Matches page

- **Route:** `/feature2/today`
- **Purpose:** Show today's matches with time left to predict; submit via modal/sheet.
- **Serves:** "put in my match score and outcome prediction 1 hour before the match starts."
- **Data needed:** today's `matches`; existing `score_predictions`; upsert on submit.
- **Components:** match cards with countdown, open prediction modal/**sheet**, score steppers (home/away), outcome derived, submit.
- **States:** open (predictable), **closed** (past 1hr deadline), already-predicted, live (in play), offline (block submit), error.
- **❓ To flesh out:**
  - **Modal vs bottom sheet** — decide (shadcn `Sheet` works well on mobile).
  - Show other days, or strictly "today"?
  - What shows once a match is live — your prediction + live score + points so far?

## Feature 2 Leaderboard page

- **Route:** `/feature2/leaderboard`
- **Purpose:** Ranking by score-prediction points.
- **Serves:** "predictions tallied and shown on a leaderboard based on whether I got the score and outcome right."
- **Data needed:** `user_scores.feature2_points`; realtime subscription.
- **Components:** ranked list, highlight current user.
- **❓ To flesh out:**
  - Scoring values — exact score vs correct outcome (currently 3 / 1 / 0). Confirm.
  - Show per-match breakdown anywhere?

---

# Feature 3 — Combined Leaderboard

## Feature 3 Leaderboard page

- **Route:** `/feature3/leaderboard`
- **Purpose:** Ranking by total points (F1 + F2).
- **Serves:** "a leaderboard for total points from Feature 1 and 2."
- **Data needed:** `user_scores.total_points` (generated column); realtime subscription.
- **Components:** ranked list, highlight current user.
- **❓ To flesh out:**
  - Is this the default/headline leaderboard?
  - Tie-breaking — fall back to F1 or F2?

---

# Feature 4 — Dashboard

> The landing page that composes everything: today's matches + your position on all three leaderboards.

## Dashboard page

- **Route:** `/` (or `/dashboard`)
- **Purpose:** At-a-glance home — today's matches and leaderboard standings.
- **Serves:**
  - "Show today's matches and time left to submit score predictions, click to open submit modal/sheet."
  - "See Feature 1 / 2 / 3 leaderboard position — top 3 plus your position (if not in top 3)."
- **Data needed:** today's `matches`; all three slices of `user_scores`; realtime subscription.
- **Components:**
  - Today's matches strip (reuses the Feature 2 card + modal/sheet).
  - **Three "mini leaderboard" cards** (F1, F2, F3), each showing top 3 + your row if outside top 3.
  - Quick links into each full leaderboard / prediction page.
- **States:** loading, empty (no matches today), live-updating.
- **❓ To flesh out:**
  - Layout/order of the sections.
  - Is the "top 3 + your position" a single reusable component across all three cards? (recommended)
  - What shows when there are no matches today?

---

## Shared components to plan once

- **Top-3 + your-position list** — used on the Dashboard three times; takes a leaderboard slice + current user.
- **Lock countdown banner** — group / knockout / per-match variants.
- **Match card** — used on Today's Matches and Dashboard.
- **Score prediction modal/sheet** — the one undecided UI choice.
- **Offline guard** — `navigator.onLine` check that disables submit buttons (UX layer on top of the RLS enforcement).

---

## Open product decisions (collected)

1. Group-stage scoring rule (full order vs top-two advancing) and point values.
2. Modal vs bottom sheet for score submission.
3. Profile picture in v1 or deferred.
4. Tie-breaking rules for each leaderboard.
5. Team list source (seed table vs API).
6. Knockout bracket seeding before group results exist.