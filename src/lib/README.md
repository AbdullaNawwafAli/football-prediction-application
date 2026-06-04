# `lib/`

Third-party library configuration and initialisation. Export pre-configured instances of external
SDKs and clients used across the app.

Business logic and Supabase queries belong in `features/*/services/` or `services/`, not here.

See `src/docs/architecture.md` for the full layout and stack (Supabase, TanStack Query).

## What belongs here

- `supabase.ts` — Supabase browser client singleton
- `query-client.ts` — TanStack Query client factory and router context (`getContext`)
- Any other SDK that needs one-time setup before use

Router factory may live in `src/router.tsx` until extracted to `lib/router.ts`.

## What does NOT belong here

- Supabase queries, mutations, or scoring logic — `services/` or `features/*/services/`
- Pure formatting or validation — `utils/`
- React hooks — `hooks/`
- Zustand stores — `stores/`

## Structure

```
lib/
├── supabase.ts
├── query-client.ts
└── shadcn/
    └── utils/
        └── utils.ts      # shadcn-owned cn() helper — do not move or rename
```

## Example

```ts
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query'

export function createQueryClient() {
  return new QueryClient()
}

export function getContext() {
  return { queryClient: createQueryClient() }
}
```

```ts
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '#/types/database.types'

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)
```

## Shadcn

Shadcn installs the `cn()` helper under `lib/shadcn/utils/`:

```ts
// lib/shadcn/utils/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

`components.json` maps the `utils` alias to `#/lib/shadcn/utils`. Do not move or rename this
file without updating `components.json` and reinstalling affected shadcn components.

## Conventions

- Export a single configured instance per file where appropriate, or a small factory (`createQueryClient`).
- Use singleton patterns where the library requires it (e.g. one Supabase client in the browser).
- One external library per file; keep env vars read at module scope minimal and documented.
