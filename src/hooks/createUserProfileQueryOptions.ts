import { queryOptions } from '@tanstack/react-query'
import { getUserProfileApi } from '#/services/getUserProfile'

export default function createUserProfileQueryOptions(userId: string) {
  return queryOptions({
    queryKey: ['user-profile', userId],
    queryFn: () => getUserProfileApi(userId),
    staleTime: 1000 * 60 * 60,
  })
}
