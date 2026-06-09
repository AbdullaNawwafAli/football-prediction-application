import { queryOptions } from '@tanstack/react-query'
import { getGroupsWithTeams } from '../services/getGroupsWithTeams'

export function createGroupsQueryOptions() {
  return queryOptions({
    queryKey: ['group-predictions', 'groups'],
    queryFn: () => getGroupsWithTeams(),
    staleTime: 60 * 1000,
  })
}
