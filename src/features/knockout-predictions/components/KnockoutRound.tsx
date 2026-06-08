import type { KnockoutMatchData, KnockoutTeam, KnockoutPicksMap } from '../types'
import { STAGE_LABELS } from '../types'
import { MatchPickCard } from './MatchPickCard'

type Props = {
  stage: string
  matches: KnockoutMatchData[]
  teamById: Map<number, KnockoutTeam>
  feederMap: Map<number, { home: number | null; away: number | null }>
  picks: KnockoutPicksMap
  onPick: (matchId: number, teamId: number) => void
  disabled: boolean
}

export function KnockoutRound({ stage, matches, teamById, feederMap, picks, onPick, disabled }: Props) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {STAGE_LABELS[stage] ?? stage}
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {matches.map((match) => {
          const feeders = feederMap.get(match.matchId)
          const homeTeam = feeders?.home != null
            ? (teamById.get(picks[feeders.home] ?? -1) ?? null)
            : (match.dbHomeTeamId != null ? (teamById.get(match.dbHomeTeamId) ?? null) : null)
          const awayTeam = feeders?.away != null
            ? (teamById.get(picks[feeders.away] ?? -1) ?? null)
            : (match.dbAwayTeamId != null ? (teamById.get(match.dbAwayTeamId) ?? null) : null)

          return (
            <MatchPickCard
              key={match.matchId}
              matchId={match.matchId}
              homeTeam={homeTeam}
              awayTeam={awayTeam}
              pickedTeamId={picks[match.matchId]}
              onPick={onPick}
              disabled={disabled}
            />
          )
        })}
      </div>
    </div>
  )
}
