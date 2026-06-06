export type TeamInGroup = {
  id: number
  name: string
  tla: string | null
  crest_url: string | null
  group_name: string
}

export type GroupData = {
  groupName: string
  teams: TeamInGroup[]
}

export type PredictionState = Record<string, number[]>

export type UpsertGroupPredictionDto = {
  userId: string
  group: string
  predictedOrder: number[]
}
