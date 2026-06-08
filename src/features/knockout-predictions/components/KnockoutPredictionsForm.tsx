import { useEffect, useState } from 'react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '#/stores/auth.store'
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

type Props = {
  submitRef?: React.RefObject<(() => void) | null>
  onMutationStateChange?: (state: { isPending: boolean; canSubmit: boolean }) => void
}

export function KnockoutPredictionsForm({ submitRef, onMutationStateChange }: Props) {
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
    onSuccess: () => toast.success('Predictions saved.'),
    onError: () => toast.error('Failed to save predictions. Please try again.'),
  })

  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine
  const canSubmit = isOpen && !isOffline && !mutation.isPending

  useEffect(() => {
    if (submitRef) submitRef.current = () => mutation.mutate()
  })

  useEffect(() => {
    onMutationStateChange?.({ isPending: mutation.isPending, canSubmit })
  }, [mutation.isPending, canSubmit])

  return (
    <div className="px-3 sm:px-4 py-6 sm:py-10 space-y-6">
      <LockCountdownBanner isOpen={isOpen} firstMatchTime={firstMatchTime} />

      <KnockoutBracket
        matchesByStage={matchesByStage}
        teamById={teamById}
        feederMap={feederMap}
        picks={picks}
        onPick={handlePick}
        disabled={!isOpen}
      />
    </div>
  )
}
