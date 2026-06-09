import { queryOptions } from '@tanstack/react-query'
import { getGroupStageLockStatus } from '../services/getGroupStageLockStatus'

export function createLockStatusQueryOptions() {
  return queryOptions({
    queryKey: ['group-predictions', 'lock-status'],
    queryFn: () => getGroupStageLockStatus(),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  })
}
