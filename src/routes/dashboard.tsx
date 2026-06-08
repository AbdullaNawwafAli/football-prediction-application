import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { Button } from '#/components/shadcn/ui/button'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: ({ context }) => {
    if (!context.session) {
      throw redirect({ to: '/' })
    }

    if (!context.profile) {
      throw redirect({ to: '/onboarding' })
    }
  },
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-6 text-center px-4">
        <h1 className="text-3xl font-bold">World Cup 2026</h1>
        <p className="text-muted-foreground">Make your predictions and climb the leaderboard.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button asChild>
            <Link to="/match-prediction">Today's Matches</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/leaderboard">Leaderboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/stage-prediction">Group & Knockout</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
