import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { Header } from '#/components/Header'
import { UserScoreCard, UpcomingMatchesCard, TopLeaderboardCard } from '#/features/home'
import createLeaderboardQueryOptions from '#/hooks/createLeaderboardQueryOptions'
import { useAuthStore } from '#/stores/auth.store'

export const Route = createFileRoute('/home')({
  beforeLoad: () => {
    const { session, profile } = useAuthStore.getState()
    if (!session) throw redirect({ to: '/' })
    if (!profile) throw redirect({ to: '/onboarding' })
  },
  component: DashboardPage,
})

function DashboardPage() {
  const profile = useAuthStore((s) => s.profile)

  const { data: score } = useSuspenseQuery(
    createLeaderboardQueryOptions({
      select: (entries) => {
        const entry = entries.find((e) => e.userId === profile?.id)
        return {
          feature1Points: entry?.feature1Points ?? 0,
          feature2Points: entry?.feature2Points ?? 0,
          totalPoints: entry?.totalPoints ?? null,
        }
      },
    }),
  )

  return (
    <div className="page flex flex-col space-y-4 sm:space-y-6">
      <Header>Home</Header>

      <div className="flex flex-col w-full sm:flex-row space-y-4 space-x-6 sm:space-y-0">
        <UserScoreCard
          displayName={profile?.display_name ?? ''}
          score={score}
        />

        <UpcomingMatchesCard />
      </div>

      <TopLeaderboardCard />
    </div>
  )
}
