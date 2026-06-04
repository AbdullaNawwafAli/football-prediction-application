# `hooks/`

Shared custom React hooks used across two or more features or components.

Feature-specific hooks belong in `features/<name>/hooks/`. shadcn-owned hooks belong in
`hooks/shadcn/` (see `components.json` aliases).

See `src/docs/architecture.md` for dependency rules.

## What belongs here

- Hooks that abstract browser APIs: `useLocalStorage`, `useMediaQuery`, `useDebounce`
- Shared UI behaviour: `useModal`, `useIntersectionObserver`
- Cross-feature app hooks that are **not** TanStack Query wrappers (those usually live next to `services/` or inside a feature)

## What does NOT belong here

- Hooks used only within one feature — `features/<name>/hooks/`
- TanStack Query `useQuery` / `useMutation` wrappers tied to one feature — colocate with that feature’s `services/` or `hooks/`
- Hooks tightly coupled to a single component — keep them in that component file
- Auth session reads — prefer `stores/auth.store.ts` for synchronous session access across the app

## Structure

```
hooks/
├── useDebounce.ts
├── useMediaQuery.ts
└── shadcn/               # Installed by shadcn CLI — do not hand-edit casually
```

## Example

```ts
// hooks/useDebounce.ts
import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

## Conventions

- All files and exports are prefixed with `use`.
- One hook per file; filename matches the hook name.
- Hooks should not embed Supabase client setup — import from `#/lib/supabase` when needed.
- Include a brief JSDoc comment describing what the hook does and its parameters.
