import { useSuspenseQuery } from '@tanstack/react-query'
import { createKnockoutMatchesQueryOptions } from '../hooks/createKnockoutMatchesQueryOptions'
import { createUserKnockoutPredictionsQueryOptions } from '../hooks/createUserKnockoutPredictionsQueryOptions'
import { createKnockoutLockStatusQueryOptions } from '../hooks/createKnockoutLockStatusQueryOptions'
import { KnockoutBracket } from './KnockoutBracket'
import { KNOCKOUT_STAGES } from '../types'
import type { KnockoutMatchData } from '../types'

type Props = {
  userId: string
}

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

export function KnockoutPredictionsReadOnly({ userId }: Props) {
  const { data: matchesResult } = useSuspenseQuery(createKnockoutMatchesQueryOptions())
  const { data: savedData } = useSuspenseQuery(createUserKnockoutPredictionsQueryOptions(userId, 5 * 60 * 1000))
  const { data: isOpen } = useSuspenseQuery(createKnockoutLockStatusQueryOptions())

  const { matches, teamById } = matchesResult
  const feederMap = buildFeederMap(matches)

  if (Object.keys(savedData.picks).length === 0) {
    return (
      <div className="h-full flex items-center justify-center px-4 py-12">
        <p className="text-sm text-muted-foreground text-center">
          This user hasn't made knockout predictions yet.
        </p>
      </div>
    )
  }

  const matchesByStage = new Map<string, KnockoutMatchData[]>()
  for (const stage of KNOCKOUT_STAGES) {
    const stageMatches = matches.filter((m) => m.stage === stage)
    if (stageMatches.length > 0) matchesByStage.set(stage, stageMatches)
  }

  return (
    <div className="px-3 sm:px-4 py-6 sm:py-10">
      <KnockoutBracket
        matchesByStage={matchesByStage}
        teamById={teamById}
        feederMap={feederMap}
        picks={savedData.picks}
        onPick={() => {}}
        disabled={true}
        correctness={!isOpen ? savedData.correctness : undefined}
      />
    </div>
  )
}
