import { queryOptions } from '@tanstack/react-query'
import { getFirstGroupMatchTime } from '../services/getFirstGroupMatchTime'

export function createFirstGroupMatchQueryOptions() {
  return queryOptions({
    queryKey: ['group-predictions', 'first-match-time'],
    queryFn: () => getFirstGroupMatchTime(),
    staleTime: 60 * 60 * 1000,
  })
}
