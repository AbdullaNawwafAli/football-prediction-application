import { queryOptions } from '@tanstack/react-query'
import { getKnockoutStageLockStatus } from '../services/getKnockoutStageLockStatus'

export function createKnockoutLockStatusQueryOptions() {
  return queryOptions({
    queryKey: ['knockout', 'lock'],
    queryFn: () => getKnockoutStageLockStatus(),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  })
}
