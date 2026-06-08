import { useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import {
  MatchList,
  MatchPredictionDrawer,
  createMatchesQueryOptions,
  createUserScorePredictionsQueryOptions,
} from '#/features/match-predictions'
import { useAuthStore } from '#/stores/auth.store'

export const Route = createFileRoute('/match-prediction/all-matches')({
  beforeLoad: ({ context }) => {
    if (!context.session) throw redirect({ to: '/' })
    if (!context.profile) throw redirect({ to: '/onboarding' })
  },
  component: AllMatchesPage,
})

function AllMatchesPage() {
  const profile = useAuthStore((s) => s.profile)
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null)

  const { data: matches } = useSuspenseQuery(createMatchesQueryOptions())
  const { data: predictions } = useSuspenseQuery(
    createUserScorePredictionsQueryOptions(profile?.id ?? ''),
  )

  return (
    <div className="page">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">All Matches</h1>
        <p className="text-sm text-muted-foreground">
          Predict the score for each match. Tap a match to enter your prediction.
        </p>
      </div>

      <MatchList
        matches={matches}
        predictions={predictions}
        onMatchSelect={setSelectedMatchId}
      />

      <MatchPredictionDrawer
        matchId={selectedMatchId}
        matches={matches}
        predictions={predictions}
        onClose={() => setSelectedMatchId(null)}
      />
    </div>
  )
}
