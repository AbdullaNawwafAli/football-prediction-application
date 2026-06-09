export type KnockoutTeam = {
  teamId: number
  name: string
  tla: string | null
  crestUrl: string | null
}

export type KnockoutMatchData = {
  matchId: number
  stage: string
  dbHomeTeamId: number | null
  dbAwayTeamId: number | null
  nextMatchId: number | null
  nextMatchSlot: string | null
  nextMatchLoserId: number | null
  nextMatchLoserSlot: string | null
}

export type KnockoutPicksMap = Record<number, number>
export type KnockoutCorrectnessMap = Record<number, boolean | null>

export const KNOCKOUT_STAGES = ['LAST_32', 'LAST_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'THIRD_PLACE', 'FINAL'] as const

export const STAGE_LABELS: Record<string, string> = {
  LAST_32: 'Round of 32',
  LAST_16: 'Round of 16',
  QUARTER_FINALS: 'Quarter Finals',
  SEMI_FINALS: 'Semi Finals',
  THIRD_PLACE: 'Third Place',
  FINAL: 'Final',
}
