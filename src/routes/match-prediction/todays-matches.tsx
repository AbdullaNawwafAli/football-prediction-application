import { useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { Header } from '#/components/Header'
import { DailyLeaderboard } from '#/components/match-prediction/DailyLeaderboard'
import { MatchList } from '#/components/match-prediction/MatchList'
import { MatchPredictionDrawer } from '#/components/match-prediction/MatchPredictionDrawer'
import { createMatchesQueryOptions } from '#/hooks/createMatchesQueryOptions'
import { createUserScorePredictionsQueryOptions } from '#/hooks/createUserScorePredictionsQueryOptions'
import type { MatchWithTeams } from '#/types/matches'
import { useAuthStore } from '#/stores/auth.store'

export const Route = createFileRoute('/match-prediction/todays-matches')({
  beforeLoad: ({ context }) => {
    if (!context.session) throw redirect({ to: '/' })
    if (!context.profile) throw redirect({ to: '/onboarding' })
  },
  component: TodaysMatchesPage,
})

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function getUpcomingMatches(matches: MatchWithTeams[]) {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  return matches.filter((m) => {
    const d = new Date(m.utcDate)
    return isSameDay(d, today) || isSameDay(d, tomorrow)
  })
}

function TodaysMatchesPage() {
  const profile = useAuthStore((s) => s.profile)
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null)

  const { data: matches } = useSuspenseQuery(createMatchesQueryOptions())
  const { data: predictions } = useSuspenseQuery(
    createUserScorePredictionsQueryOptions(profile?.id ?? ''),
  )

  const upcomingMatches = getUpcomingMatches(matches)

  return (
    <div className="page">
      <Header>Upcoming Matches</Header>

      <DailyLeaderboard />

      {upcomingMatches.length === 0 ? (
        <p className="text-sm text-center text-muted-foreground py-8">
          No upcoming matches.
        </p>
      ) : (
        <MatchList
          matches={upcomingMatches}
          predictions={predictions}
          onMatchSelect={setSelectedMatchId}
        />
      )}

      <MatchPredictionDrawer
        matchId={selectedMatchId}
        matches={matches}
        predictions={predictions}
        onClose={() => setSelectedMatchId(null)}
      />
    </div>
  )
}
