import { queryOptions } from '@tanstack/react-query'
import { getKnockoutMatches } from '../services/getKnockoutMatches'

export function createKnockoutMatchesQueryOptions() {
  return queryOptions({
    queryKey: ['knockout', 'matches'],
    queryFn: () => getKnockoutMatches(),
    staleTime: 60 * 1000,
  })
}
