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

export const Route = createFileRoute('/match-prediction/todays-matches')({
  beforeLoad: ({ context }) => {
    if (!context.session) throw redirect({ to: '/' })
    if (!context.profile) throw redirect({ to: '/onboarding' })
  },
  component: TodaysMatchesPage,
})

function getTodaysMatches(matches: MatchWithTeams[]) {
  const today = new Date()
  return matches.filter((m) => {
    const d = new Date(m.utcDate)
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    )
  })
}

function TodaysMatchesPage() {
  const profile = useAuthStore((s) => s.profile)
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null)

  const { data: matches } = useSuspenseQuery(createMatchesQueryOptions())
  const { data: predictions } = useSuspenseQuery(
    createUserScorePredictionsQueryOptions(profile?.id ?? ''),
  )

  const todaysMatches = getTodaysMatches(matches)

  return (
    <div className="w-full px-3 sm:px-4 py-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Today's Matches</h1>
        <p className="text-sm text-muted-foreground">
          Predict the score for today's matches. Tap a match to enter your prediction.
        </p>
      </div>

      {todaysMatches.length === 0 ? (
        <p className="text-sm text-center text-muted-foreground py-8">
          No matches scheduled for today.
        </p>
      ) : (
        <MatchList
          matches={todaysMatches}
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
