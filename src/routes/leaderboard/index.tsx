import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
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

  const { data: entries, isPending } = useSuspenseQuery(createLeaderboardQueryOptions())

  return (
    <div className="w-full px-3 sm:px-4 py-6 sm:py-10 space-y-6 sm:space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Leaderboard</h1>
        <p className="text-sm text-muted-foreground">
          Overall rankings across all prediction categories.
        </p>
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
