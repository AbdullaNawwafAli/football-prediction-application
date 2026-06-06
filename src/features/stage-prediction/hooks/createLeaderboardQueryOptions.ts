import { queryOptions } from '@tanstack/react-query'
import type { UseQueryOptions } from '@tanstack/react-query'
import type { LeaderboardEntry } from '../types/leaderboard'
import { getLeaderboardApi } from '../services/getLeaderboard'

export default function createLeaderboardQueryOptions<TData = LeaderboardEntry[], TError = Error>(
  options?: Omit<UseQueryOptions<LeaderboardEntry[], TError, TData>, 'queryKey' | 'queryFn'>
) {
  return queryOptions({
    ...options,
    queryKey: ['leaderboard'],
    queryFn: () => getLeaderboardApi(),
  })
}
