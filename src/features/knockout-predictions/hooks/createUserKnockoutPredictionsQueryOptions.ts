import { queryOptions } from '@tanstack/react-query'
import { getUserKnockoutPredictions } from '../services/getUserKnockoutPredictions'

export function createUserKnockoutPredictionsQueryOptions(userId: string) {
  return queryOptions({
    queryKey: ['knockout', 'picks', userId],
    queryFn: () => getUserKnockoutPredictions(userId),
  })
}
