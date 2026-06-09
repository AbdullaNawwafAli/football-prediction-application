import { useSuspenseQuery } from '@tanstack/react-query'
import { createKnockoutMatchesQueryOptions } from '../hooks/createKnockoutMatchesQueryOptions'
import { createUserKnockoutPredictionsQueryOptions } from '../hooks/createUserKnockoutPredictionsQueryOptions'
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
  const { data: savedPicks } = useSuspenseQuery(createUserKnockoutPredictionsQueryOptions(userId, 5 * 60 * 1000))

  const { matches, teamById } = matchesResult
  const feederMap = buildFeederMap(matches)

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
        picks={savedPicks}
        onPick={() => {}}
        disabled={true}
      />
    </div>
  )
}
