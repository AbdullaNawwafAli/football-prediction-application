import { useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import {
  MatchList,
  MatchPredictionDrawer,
  createMatchesQueryOptions,
  createUserScorePredictionsQueryOptions,
} from '#/features/match-predictions'
import type { MatchWithTeams } from '#/features/match-predictions/types'
import { useAuthStore } from '#/stores/auth.store'

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

function getUpcomingMatches(matches: MatchWithTeams[]) {
  const now = new Date()
  const cutoff = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  return matches.filter((m) => {
    const d = new Date(m.utcDate)
    return d > now && d <= cutoff
  })
}

function DashboardPage() {
  const profile = useAuthStore((s) => s.profile)
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null)

  const { data: matches } = useSuspenseQuery(createMatchesQueryOptions())
  const { data: predictions } = useSuspenseQuery(
    createUserScorePredictionsQueryOptions(profile?.id ?? ''),
  )

  const upcomingMatches = getUpcomingMatches(matches)

  return (
    <div className="page">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">World Cup 2026</h1>
        <p className="text-sm text-muted-foreground">
          Make your predictions and climb the leaderboard.
        </p>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Upcoming Matches
        </h2>
        {upcomingMatches.length === 0 ? (
          <p className="text-sm text-center text-muted-foreground py-6">
            No matches in the next 24 hours.
          </p>
        ) : (
          <MatchList
            matches={upcomingMatches}
            predictions={predictions}
            onMatchSelect={setSelectedMatchId}
          />
        )}
      </div>

      <MatchPredictionDrawer
        matchId={selectedMatchId}
        matches={matches}
        predictions={predictions}
        onClose={() => setSelectedMatchId(null)}
      />
    </div>
  )
}
