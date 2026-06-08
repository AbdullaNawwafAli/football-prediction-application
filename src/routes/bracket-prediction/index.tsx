import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { Header } from '#/components/Header'
import { Button } from '#/components/shadcn/ui/button'
import { LeaderboardTable } from '#/components/LeaderboardTable'
import createLeaderboardQueryOptions from '#/hooks/createLeaderboardQueryOptions'
import { useAuthStore } from '#/stores/auth.store'

export const Route = createFileRoute('/bracket-prediction/')({
  beforeLoad: ({ context }) => {
    if (!context.session) throw redirect({ to: '/' })
    if (!context.profile) throw redirect({ to: '/onboarding' })
  },
  component: Feature1HomePage,
})

function Feature1HomePage() {
  const profile = useAuthStore((s) => s.profile)
  const currentUserId = profile?.id ?? ''

  const { data: entries, isPending } = useSuspenseQuery(
    createLeaderboardQueryOptions(),
  )

  return (
    <div className="page">
      <Header>Bracket</Header>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="default" size="sm">
          <Link to="/bracket-prediction/my-group">Set Group Predictions</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to="/bracket-prediction/my-knockout">Set Knockout Predictions</Link>
        </Button>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <LeaderboardTable
          entries={entries}
          currentUserId={currentUserId}
          isPending={isPending}
          mode="feature1"
        />
      </div>
    </div>
  )
}
