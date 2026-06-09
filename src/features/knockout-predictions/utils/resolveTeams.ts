import type { KnockoutMatchData, KnockoutTeam, KnockoutPicksMap } from '../types'

type FeederMap = Map<number, { home: number | null; away: number | null }>

function resolveLoserFromSemi(
  semiMatchId: number,
  feederMap: FeederMap,
  teamById: Map<number, KnockoutTeam>,
  picks: KnockoutPicksMap,
  matchById: Map<number, KnockoutMatchData>,
): KnockoutTeam | null {
  const semiMatch = matchById.get(semiMatchId)
  if (!semiMatch) return null
  if (!(semiMatchId in picks)) return null
  const pickedWinnerId = picks[semiMatchId]
  const { homeTeam, awayTeam } = resolveTeams(semiMatch, feederMap, new Map(), teamById, picks, matchById)
  if (homeTeam?.teamId === pickedWinnerId) return awayTeam
  return homeTeam
}

export function resolveTeams(
  match: KnockoutMatchData,
  feederMap: FeederMap,
  loserFeederMap: FeederMap,
  teamById: Map<number, KnockoutTeam>,
  picks: KnockoutPicksMap,
  matchById: Map<number, KnockoutMatchData>,
): { homeTeam: KnockoutTeam | null; awayTeam: KnockoutTeam | null } {
  const loserFeeders = loserFeederMap.get(match.matchId)
  if (loserFeeders) {
    return {
      homeTeam:
        loserFeeders.home != null
          ? resolveLoserFromSemi(loserFeeders.home, feederMap, teamById, picks, matchById)
          : null,
      awayTeam:
        loserFeeders.away != null
          ? resolveLoserFromSemi(loserFeeders.away, feederMap, teamById, picks, matchById)
          : null,
    }
  }

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
