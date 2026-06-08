import { queryOptions } from '@tanstack/react-query'
import { getFirstKnockoutMatchTime } from '../services/getFirstKnockoutMatchTime'

export function createFirstKnockoutMatchQueryOptions() {
  return queryOptions({
    queryKey: ['knockout', 'first-match'],
    queryFn: () => getFirstKnockoutMatchTime(),
    staleTime: 60 * 60 * 1000,
  })
}
