import { queryOptions } from '@tanstack/react-query'
import { getKnockoutTeamsAssigned } from '../services/getKnockoutTeamsAssigned'

export function createKnockoutTeamsAssignedQueryOptions() {
  return queryOptions({
    queryKey: ['knockout', 'teams-assigned'],
    queryFn: getKnockoutTeamsAssigned,
    staleTime: 60 * 1000,
  })
}
