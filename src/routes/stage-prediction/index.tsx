import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { LeaderboardTable } from '#/features/stage-prediction'
import { useAuthStore } from '#/stores/auth.store'
import { Button } from '#/components/shadcn/ui/button'
import createLeaderboardQueryOptions from '#/features/stage-prediction/hooks/createLeaderboardQueryOptions'

export const Route = createFileRoute('/stage-prediction/')({
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
    <div className="w-full px-3 sm:px-4 py-6 sm:py-10 space-y-6 sm:space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Group & Knockout Leaderboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Live rankings based on group and knockout stage predictions.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="default" size="sm">
          <Link to="/stage-prediction/my-group">Set Group Predictions</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to="/stage-prediction/my-knockout">Set Knockout Predictions</Link>
        </Button>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <LeaderboardTable
          entries={entries}
          currentUserId={currentUserId}
          isPending={isPending}
        />
      </div>
    </div>
  )
}
