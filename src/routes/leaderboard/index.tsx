import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { Header } from '#/components/Header'
import { LeaderboardTable } from '#/components/LeaderboardTable'
import createLeaderboardQueryOptions from '#/hooks/createLeaderboardQueryOptions'
import { useAuthStore } from '#/stores/auth.store'
import { Button } from '#/components/shadcn/ui/button'
import { supabase } from '#/lib/supabase/supabase'

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
      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm">
          <a
            href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => { void supabase.from('profiles').update({ rick_rolled: true }).eq('id', currentUserId) }}
          >
            Get More Points
          </a>
        </Button>
        <Button variant="outline" size="sm">
          <a
            href="https://youtu.be/tcn0NSq8ApA?si=NCt6U3yfX8uFUJHC"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => { void supabase.from('profiles').update({ rick_rolled: true }).eq('id', currentUserId) }}
          >
            Football Heritage
          </a>
        </Button>
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
