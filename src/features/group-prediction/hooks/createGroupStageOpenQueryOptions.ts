import { queryOptions } from '@tanstack/react-query'
import { checkGroupStageOpenApi } from '../services/checkGroupStageOpen'

export default function createGroupStageOpenQueryOptions() {
  return queryOptions({
    queryKey: ['group-stage-open'],
    queryFn: () => checkGroupStageOpenApi(),
    staleTime: 60_000,
  })
}
