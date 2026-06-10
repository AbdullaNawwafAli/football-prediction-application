import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '#/components/shadcn/ui/card'
import { Skeleton } from '#/components/shadcn/ui/skeleton'
import { MatchList } from '#/components/match-prediction/MatchList'
import { MatchPredictionDrawer } from '#/components/match-prediction/MatchPredictionDrawer'
import { createMatchesQueryOptions } from '#/hooks/createMatchesQueryOptions'
import { createUserScorePredictionsQueryOptions } from '#/hooks/createUserScorePredictionsQueryOptions'
import { useAuthStore } from '#/stores/auth.store'
import { getUpcomingMatches } from '#/utils/matchFilters'

export function UpcomingMatchesCard() {
  const profile = useAuthStore((s) => s.profile)
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null)

  const { data: matches, isPending: matchesPending } = useQuery(createMatchesQueryOptions())
  const { data: predictions, isPending: predictionsPending } = useQuery(
    createUserScorePredictionsQueryOptions(profile?.id ?? ''),
  )

  const isPending = matchesPending || predictionsPending
  const upcomingMatches = matches ? getUpcomingMatches(matches) : []

  return (
    <>
      <Card size="sm" className="w-full">
        <CardHeader>
          <CardTitle>
            <span className="text-xl">Upcoming Matches</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          ) : upcomingMatches.length === 0 ? (
            <p className="text-sm text-center text-muted-foreground py-4">
              No upcoming matches today or tomorrow.
            </p>
          ) : (
            <MatchList
              matches={upcomingMatches}
              predictions={predictions ?? []}
              onMatchSelect={setSelectedMatchId}
            />
          )}
        </CardContent>
      </Card>

      <MatchPredictionDrawer
        matchId={selectedMatchId}
        matches={matches ?? []}
        predictions={predictions ?? []}
        onClose={() => setSelectedMatchId(null)}
      />
    </>
  )
}
