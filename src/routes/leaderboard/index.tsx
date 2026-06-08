import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { Header } from '#/components/Header'
import { LeaderboardTable } from '#/components/LeaderboardTable'
import createLeaderboardQueryOptions from '#/hooks/createLeaderboardQueryOptions'
import { useAuthStore } from '#/stores/auth.store'

export const Route = createFileRoute('/leaderboard/')({
  beforeLoad: ({ context }) => {
    if (!context.session) throw redirect({ to: '/' })
    if (!context.profile) throw redirect({ to: '/onboarding' })
  },
  component: LeaderboardPage,
})

function LeaderboardPage() {
  const profile = useAuthStore((s) => s.profile)
  const currentUserId = profile?.id ?? ''

  const { data: entries, isPending } = useSuspenseQuery(
    createLeaderboardQueryOptions(),
  )

  return (
    <div className="page">
      <Header>Leaderboard</Header>
      <div className="flex flex-wrap gap-2 py-1">
        This table will reflect how much points earned through out the
        application
      </div>
      <div className="rounded-lg border bg-card overflow-hidden">
        <LeaderboardTable
          entries={entries}
          currentUserId={currentUserId}
          isPending={isPending}
          mode="all"
        />
      </div>
    </div>
  )
}
