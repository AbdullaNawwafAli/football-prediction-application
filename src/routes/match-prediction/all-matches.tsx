import { useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { Header } from '#/components/Header'
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
      <Header>All Matches</Header>

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
