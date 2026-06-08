import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { Header } from '#/components/Header'
import { Button } from '#/components/shadcn/ui/button'
import { LeaderboardTable } from '#/components/LeaderboardTable'
import createLeaderboardQueryOptions from '#/hooks/createLeaderboardQueryOptions'
import { useAuthStore } from '#/stores/auth.store'

export const Route = createFileRoute('/match-prediction/')({
  beforeLoad: ({ context }) => {
    if (!context.session) throw redirect({ to: '/' })
    if (!context.profile) throw redirect({ to: '/onboarding' })
  },
  component: MatchPredictionPage,
})

function MatchPredictionPage() {
  const profile = useAuthStore((s) => s.profile)
  const currentUserId = profile?.id ?? ''

  const { data: entries, isPending } = useSuspenseQuery(createLeaderboardQueryOptions())

  return (
    <div className="page">
      <Header>Matches</Header>

      <div className="flex gap-3">
        <Button asChild>
          <Link to="/match-prediction/todays-matches">Today's Matches</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/match-prediction/all-matches">All Matches</Link>
        </Button>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <LeaderboardTable
          entries={entries}
          currentUserId={currentUserId}
          isPending={isPending}
          mode="feature2"
        />
      </div>
    </div>
  )
}
