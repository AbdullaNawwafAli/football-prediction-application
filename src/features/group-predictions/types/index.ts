export type TeamInGroup = {
  teamId: number
  name: string
  tla: string | null
  crestUrl: string | null
}

export type GroupOrder = {
  groupName: string
  teams: TeamInGroup[]
}

export type GroupPredictionsMap = Record<string, number[]>
