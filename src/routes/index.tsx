import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Login })

function Login() {
  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <h1 className="text-3xl font-bold text-[var(--sea-ink)]">
        Football Predictions
      </h1>
      <p className="mt-2 text-[var(--sea-ink-soft)]">Login coming soon.</p>
    </main>
  )
}
