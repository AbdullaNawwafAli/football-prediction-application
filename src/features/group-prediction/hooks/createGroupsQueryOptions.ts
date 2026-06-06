import { queryOptions } from '@tanstack/react-query'
import { getGroupsDataApi } from '../services/getGroupsData'

export default function createGroupsQueryOptions() {
  return queryOptions({
    queryKey: ['groups'],
    queryFn: () => getGroupsDataApi(),
  })
}
