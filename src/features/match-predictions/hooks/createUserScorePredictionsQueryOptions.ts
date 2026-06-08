import { queryOptions } from '@tanstack/react-query'
import { getUserScorePredictions } from '../services/getUserScorePredictions'

export function createUserScorePredictionsQueryOptions(userId: string) {
  return queryOptions({
    queryKey: ['score-predictions', userId],
    queryFn: () => getUserScorePredictions(userId),
    enabled: !!userId,
  })
}
