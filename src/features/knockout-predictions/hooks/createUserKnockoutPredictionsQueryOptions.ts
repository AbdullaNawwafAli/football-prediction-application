import { queryOptions } from '@tanstack/react-query'
import { getUserKnockoutPredictions } from '../services/getUserKnockoutPredictions'

export function createUserKnockoutPredictionsQueryOptions(userId: string, staleTime?: number) {
  return queryOptions({
    queryKey: ['knockout', 'picks', userId],
    queryFn: () => getUserKnockoutPredictions(userId),
    ...(staleTime !== undefined && { staleTime }),
  })
}
