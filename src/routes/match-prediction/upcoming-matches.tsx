import { useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { Header } from '#/components/Header'
import { MatchList } from '#/components/match-prediction/MatchList'
import { MatchPredictionDrawer } from '#/components/match-prediction/MatchPredictionDrawer'
import { createMatchesQueryOptions } from '#/hooks/createMatchesQueryOptions'
import { createUserScorePredictionsQueryOptions } from '#/hooks/createUserScorePredictionsQueryOptions'
import { useAuthStore } from '#/stores/auth.store'
import { getUpcomingMatches } from '#/utils/matchFilters'

export const Route = createFileRoute('/match-prediction/upcoming-matches')({
  beforeLoad: ({ context }) => {
    if (!context.session) throw redirect({ to: '/' })
    if (!context.profile) throw redirect({ to: '/onboarding' })
  },
  component: TodaysMatchesPage,
})

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
