import { queryOptions } from '@tanstack/react-query'
import { getLeaderboardApi } from '#/services/getLeaderboard'

/**
 * Light leaderboard query for the home Top-3 card. Pulls every user (needed to
 * compute the current user's rank) but only the three headline point totals —
 * not the full per-stage breakdown the leaderboard page renders. Cached under a
 * separate key so it never collides with the detailed leaderboard query.
 */
export default function createTopLeaderboardQueryOptions() {
  return queryOptions({
    staleTime: 60 * 1000,
    queryKey: ['leaderboard', 'top'],
    queryFn: () => getLeaderboardApi(false),
  })
}
