# `components/`

Shared presentational and layout UI used by **two or more** features or routes.

Feature-only UI belongs in `features/<name>/components/`. shadcn primitives live in
`components/shadcn/ui/` (installed via the CLI).

See `src/docs/architecture.md` for dependency rules — components must not import from `features/` or `routes/`.

## What belongs here

- App chrome: header, footer, nav shells
- Reusable cards, tables, badges used on multiple pages
- Shared form controls not tied to one prediction flow

## What does NOT belong here

- Feature-specific screens (group board, bracket, score sheet) — `features/<name>/components/`
- Business logic or Supabase calls — `features/*/services/` or `services/`
- Route definitions — `routes/`

## Structure

```
components/
├── Header.tsx
├── Footer.tsx
├── ThemeToggle.tsx
└── shadcn/
    └── ui/               # shadcn components — add via pnpm dlx shadcn@latest add <name>
```

## Conventions

- Prefer props and composition over importing feature modules.
- Co-locate small prop types in the same file as the component.
- Use `#/lib/shadcn/utils` (`cn()`) and shadcn/ui primitives for styling consistency.
