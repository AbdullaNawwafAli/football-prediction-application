export type TeamInGroup = {
  teamId: number
  name: string
  tla: string | null
  crestUrl: string | null
  isCorrect?: boolean
}

export type GroupOrder = {
  groupName: string
  teams: TeamInGroup[]
}

export type GroupPick = {
  teamId: number
  isCorrect: boolean
}

export type GroupPredictionsMap = Record<string, GroupPick[]>
