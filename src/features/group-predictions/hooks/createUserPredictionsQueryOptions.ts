import { queryOptions } from '@tanstack/react-query'
import { getUserGroupPredictions } from '../services/getUserGroupPredictions'

export function createUserPredictionsQueryOptions(userId: string, staleTime?: number) {
  return queryOptions({
    queryKey: ['group-predictions', 'user-predictions', userId],
    queryFn: () => getUserGroupPredictions(userId),
    ...(staleTime !== undefined && { staleTime }),
  })
}
