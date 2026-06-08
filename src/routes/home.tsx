import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { Header } from '#/components/Header'
import { UserScoreCard, UpcomingMatchesCard, createUserScoreQueryOptions } from '#/features/home'
import { useAuthStore } from '#/stores/auth.store'

export const Route = createFileRoute('/home')({
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
  const profile = useAuthStore((s) => s.profile)

  const { data: score } = useSuspenseQuery(
    createUserScoreQueryOptions(profile?.id ?? ''),
  )

  return (
    <div className="page">
      <Header>Home</Header>

      <div className="flex flex-col w-full gap-2 sm:flex-row">
        <UserScoreCard
          displayName={profile?.display_name ?? ''}
          score={score}
        />

        <UpcomingMatchesCard />
      </div>
    </div>
  )
}
