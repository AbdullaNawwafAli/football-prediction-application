import { queryOptions } from '@tanstack/react-query'
import { getDailyLeaderboardApi } from '#/services/getDailyLeaderboard'

export default function createDailyLeaderboardQueryOptions(date: Date) {
  return queryOptions({
    queryKey: ['leaderboard', 'daily', date.toDateString()],
    queryFn: () => getDailyLeaderboardApi(date),
  })
}
