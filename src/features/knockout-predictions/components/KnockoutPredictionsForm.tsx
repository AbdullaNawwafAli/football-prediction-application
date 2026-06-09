import { useEffect, useState } from 'react'
import { useMutation, useSuspenseQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '#/stores/auth.store'
import { createKnockoutMatchesQueryOptions } from '../hooks/createKnockoutMatchesQueryOptions'
import { createUserKnockoutPredictionsQueryOptions } from '../hooks/createUserKnockoutPredictionsQueryOptions'
import { createKnockoutLockStatusQueryOptions } from '../hooks/createKnockoutLockStatusQueryOptions'
import { upsertKnockoutPredictions } from '../services/upsertKnockoutPredictions'
import { KnockoutBracket } from './KnockoutBracket'
import type { KnockoutMatchData, KnockoutPicksMap } from '../types'
import { KNOCKOUT_STAGES } from '../types'

type FeederMap = Map<number, { home: number | null; away: number | null }>

function buildFeederMap(matches: KnockoutMatchData[]): FeederMap {
  const map: FeederMap = new Map()
  for (const m of matches) {
    if (m.nextMatchId == null) continue
    const entry = map.get(m.nextMatchId) ?? { home: null, away: null }
    if (m.nextMatchSlot === 'home') entry.home = m.matchId
    else if (m.nextMatchSlot === 'away') entry.away = m.matchId
    map.set(m.nextMatchId, entry)
  }
  return map
}

function buildLoserFeederMap(matches: KnockoutMatchData[]): FeederMap {
  const map: FeederMap = new Map()
  for (const m of matches) {
    if (m.nextMatchLoserId == null) continue
    const entry = map.get(m.nextMatchLoserId) ?? { home: null, away: null }
    if (m.nextMatchLoserSlot === 'home') entry.home = m.matchId
    else if (m.nextMatchLoserSlot === 'away') entry.away = m.matchId
    map.set(m.nextMatchLoserId, entry)
  }
  return map
}

function getDownstreamMatchIds(matchId: number, matchById: Map<number, KnockoutMatchData>): number[] {
  const match = matchById.get(matchId)
  if (!match) return []
  const result: number[] = []
  if (match.nextMatchId) result.push(match.nextMatchId, ...getDownstreamMatchIds(match.nextMatchId, matchById))
  if (match.nextMatchLoserId) result.push(match.nextMatchLoserId, ...getDownstreamMatchIds(match.nextMatchLoserId, matchById))
  return result
}

type Props = {
  submitRef?: React.RefObject<(() => void) | null>
  onMutationStateChange?: (state: { isPending: boolean; canSubmit: boolean }) => void
}

export function KnockoutPredictionsForm({ submitRef, onMutationStateChange }: Props) {
  const queryClient = useQueryClient()
  const profile = useAuthStore((s) => s.profile)
  const userId = profile!.id

  const { data: matchesResult } = useSuspenseQuery(createKnockoutMatchesQueryOptions())
  const { data: savedData } = useSuspenseQuery(createUserKnockoutPredictionsQueryOptions(userId))
  const { data: isOpen } = useSuspenseQuery(createKnockoutLockStatusQueryOptions())

  const { matches, teamById } = matchesResult

  const matchById = new Map(matches.map((m) => [m.matchId, m]))
  const feederMap = buildFeederMap(matches)
  const loserFeederMap = buildLoserFeederMap(matches)

  const matchesByStage = new Map<string, KnockoutMatchData[]>()
  for (const stage of KNOCKOUT_STAGES) {
    const stageMatches = matches.filter((m) => m.stage === stage)
    if (stageMatches.length > 0) matchesByStage.set(stage, stageMatches)
  }

  const [picks, setPicks] = useState<KnockoutPicksMap>(() => ({ ...savedData.picks }))

  useEffect(() => {
    setPicks({ ...savedData.picks })
  }, [savedData.picks])

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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['knockout', 'picks', userId] })
      toast.success('Predictions saved.')
    },
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
    <div className="px-3 sm:px-4 py-6 sm:py-10">
      <KnockoutBracket
        matchesByStage={matchesByStage}
        teamById={teamById}
        feederMap={feederMap}
        loserFeederMap={loserFeederMap}
        matchById={matchById}
        picks={picks}
        onPick={handlePick}
        disabled={!isOpen}
        correctness={!isOpen ? savedData.correctness : undefined}
      />
    </div>
  )
}
