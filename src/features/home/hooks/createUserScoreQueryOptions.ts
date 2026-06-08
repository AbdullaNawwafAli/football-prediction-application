import { queryOptions } from '@tanstack/react-query'
import { getUserScore } from '../services/getUserScore'

export function createUserScoreQueryOptions(userId: string) {
  return queryOptions({
    queryKey: ['user-score', userId],
    queryFn: () => getUserScore(userId),
  })
}
