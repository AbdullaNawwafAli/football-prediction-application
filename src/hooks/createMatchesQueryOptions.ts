import { queryOptions } from '@tanstack/react-query'
import { getMatchesWithTeams } from '#/services/getMatchesWithTeams'

export function createMatchesQueryOptions() {
  return queryOptions({
    queryKey: ['matches'],
    queryFn: getMatchesWithTeams,
    staleTime: 60 * 1000,
  })
}
