import { createFileRoute, Link, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: ({ context }) => {
    if (!context.session) {
      throw redirect({ to: '/' })
    }

    // Redirect to onboarding if profile not set up
    if (!context.profile) {
      throw redirect({ to: '/onboarding' })
    }
  },
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-3xl font-bold">World Cup 2026</h1>
        <p className="text-muted-foreground">
          Sign in to make your predictions
        </p>
        <Link to="/stage-prediction">HERE</Link>
      </div>
    </div>
  )
}
