import { useEffect, useState } from 'react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useAuthStore } from '#/stores/auth.store'
import { Button } from '#/components/shadcn/ui/button'
import { LockCountdownBanner } from '#/components/LockCountdownBanner'
import { createKnockoutMatchesQueryOptions } from '../hooks/createKnockoutMatchesQueryOptions'
import { createUserKnockoutPredictionsQueryOptions } from '../hooks/createUserKnockoutPredictionsQueryOptions'
import { createKnockoutLockStatusQueryOptions } from '../hooks/createKnockoutLockStatusQueryOptions'
import { createFirstKnockoutMatchQueryOptions } from '../hooks/createFirstKnockoutMatchQueryOptions'
import { upsertKnockoutPredictions } from '../services/upsertKnockoutPredictions'
import { KnockoutBracket } from './KnockoutBracket'
import type { KnockoutMatchData, KnockoutPicksMap } from '../types'
import { KNOCKOUT_STAGES } from '../types'

function buildFeederMap(matches: KnockoutMatchData[]) {
  const map = new Map<number, { home: number | null; away: number | null }>()
  for (const m of matches) {
    if (m.nextMatchId == null) continue
    const entry = map.get(m.nextMatchId) ?? { home: null, away: null }
    if (m.nextMatchSlot === 'home') entry.home = m.matchId
    else if (m.nextMatchSlot === 'away') entry.away = m.matchId
    map.set(m.nextMatchId, entry)
  }
  return map
}

function getDownstreamMatchIds(matchId: number, matchById: Map<number, KnockoutMatchData>): number[] {
  const match = matchById.get(matchId)
  if (!match?.nextMatchId) return []
  return [match.nextMatchId, ...getDownstreamMatchIds(match.nextMatchId, matchById)]
}

export function KnockoutPredictionsForm() {
  const profile = useAuthStore((s) => s.profile)
  const userId = profile!.id

  const { data: matchesResult } = useSuspenseQuery(createKnockoutMatchesQueryOptions())
  const { data: savedPicks } = useSuspenseQuery(createUserKnockoutPredictionsQueryOptions(userId))
  const { data: isOpen } = useSuspenseQuery(createKnockoutLockStatusQueryOptions())
  const { data: firstMatchTime } = useSuspenseQuery(createFirstKnockoutMatchQueryOptions())

  const { matches, teamById } = matchesResult

  const matchById = new Map(matches.map((m) => [m.matchId, m]))
  const feederMap = buildFeederMap(matches)

  const matchesByStage = new Map<string, KnockoutMatchData[]>()
  for (const stage of KNOCKOUT_STAGES) {
    const stageMatches = matches.filter((m) => m.stage === stage)
    if (stageMatches.length > 0) matchesByStage.set(stage, stageMatches)
  }

  const [picks, setPicks] = useState<KnockoutPicksMap>(() => ({ ...savedPicks }))

  useEffect(() => {
    setPicks({ ...savedPicks })
  }, [savedPicks])

  function handlePick(matchId: number, teamId: number) {
    setPicks((prev) => {
      const next = { ...prev, [matchId]: teamId }
      for (const downstreamId of getDownstreamMatchIds(matchId, matchById)) {
        delete next[downstreamId]
      }
      return next
    })
  }

  const mutation = useMutation({
    mutationFn: () => upsertKnockoutPredictions(userId, picks),
  })

  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine
  const canSubmit = isOpen && !isOffline && !mutation.isPending

  return (
    <div className="px-3 sm:px-4 py-6 sm:py-10 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Knockout Predictions</h1>
        <p className="text-sm text-muted-foreground">
          Pick the winner of each match. Your pick advances to the next round automatically.
        </p>
      </div>

      <LockCountdownBanner isOpen={isOpen} firstMatchTime={firstMatchTime} />

      {mutation.isSuccess && (
        <div className="rounded-md border border-green-300/50 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-700/50 dark:bg-green-950/20 dark:text-green-400">
          Predictions saved.
        </div>
      )}

      {mutation.isError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Failed to save predictions. Please try again.
        </div>
      )}

      <KnockoutBracket
        matchesByStage={matchesByStage}
        teamById={teamById}
        feederMap={feederMap}
        picks={picks}
        onPick={handlePick}
        disabled={!isOpen}
      />

      <div className="flex items-center gap-3">
        <Button onClick={() => mutation.mutate()} disabled={!canSubmit}>
          {mutation.isPending ? 'Saving…' : 'Save Predictions'}
        </Button>
        {isOffline && (
          <span className="text-sm text-muted-foreground">You are offline — saving is disabled.</span>
        )}
      </div>
    </div>
  )
}
