# Football Predictions

Vite + React SPA with TanStack Router, TanStack Query, and PWA support.

## Getting Started

```bash
pnpm install
pnpm dev
```

Open the URL printed in the terminal (default `http://localhost:3000`). Port 3000 is fixed (`strictPort`); stop any other process using that port first.

## Scripts

```bash
pnpm dev      # development server
pnpm build    # production build + service worker
pnpm preview  # preview production build
pnpm test     # vitest
pnpm lint
pnpm format
pnpm check
```

## Routing

File-based routes live in `src/routes/`. The router plugin regenerates `src/routeTree.gen.ts` on dev/build.

Add a route by creating a file under `src/routes/`, then use `Link` from `@tanstack/react-router`.

See `src/docs/architecture.md` for folder conventions.

## PWA

[vite-plugin-pwa](https://vite-pwa-org.netlify.app/) generates the web manifest and service worker on `pnpm build`. The app registers the service worker from `src/main.tsx` with `registerType: 'autoUpdate'`.

Replace `public/favicon.svg` and extend the `manifest.icons` entry in `vite.config.ts` when you have final app icons (192×192 and 512×512 PNGs are typical).

## Shadcn

```bash
pnpm dlx shadcn@latest add button
```
