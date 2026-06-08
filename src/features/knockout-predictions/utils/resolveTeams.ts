import type { KnockoutMatchData, KnockoutTeam, KnockoutPicksMap } from '../types'

export function resolveTeams(
  match: KnockoutMatchData,
  feederMap: Map<number, { home: number | null; away: number | null }>,
  teamById: Map<number, KnockoutTeam>,
  picks: KnockoutPicksMap,
): { homeTeam: KnockoutTeam | null; awayTeam: KnockoutTeam | null } {
  const feeders = feederMap.get(match.matchId)

  const homeTeam =
    feeders?.home != null
      ? (teamById.get(picks[feeders.home] ?? -1) ?? null)
      : match.dbHomeTeamId != null
        ? (teamById.get(match.dbHomeTeamId) ?? null)
        : null

  const awayTeam =
    feeders?.away != null
      ? (teamById.get(picks[feeders.away] ?? -1) ?? null)
      : match.dbAwayTeamId != null
        ? (teamById.get(match.dbAwayTeamId) ?? null)
        : null

  return { homeTeam, awayTeam }
}
