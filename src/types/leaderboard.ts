export type LeaderboardEntry = {
  rank: number
  userId: string
  displayName: string
  avatarUrl: string
  feature1Points: number
  feature2Points: number
  totalPoints: number | null
  groupStagePoints: number
  knockoutPoints: number
  matchday1: number
  matchday2: number
  matchday3: number
  last32: number
  last16: number
  qf: number
  sf: number
  final: number
  third: number
}
