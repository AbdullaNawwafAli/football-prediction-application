import { queryOptions } from '@tanstack/react-query'
import { getGroupStagePredictionsApi } from '../services/getGroupStagePredictions'

export default function createGroupPredictionsQueryOptions(userId: string) {
  return queryOptions({
    queryKey: ['group-stage-predictions', userId],
    queryFn: () => getGroupStagePredictionsApi(userId),
  })
}
