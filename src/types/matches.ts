export type MatchTeam = {
  id: number
  name: string
  tla: string | null
  crestUrl: string | null
}

export type MatchWithTeams = {
  matchId: number
  utcDate: string
  status: string
  stage: string
  groupName: string | null
  homeTeam: MatchTeam | null
  awayTeam: MatchTeam | null
  fullTimeHome: number | null
  fullTimeAway: number | null
  halfTimeHome: number | null
  halfTimeAway: number | null
}

export type ScorePrediction = {
  matchId: number
  predictedHome: number
  predictedAway: number
  pointsAwarded: number | null
}
