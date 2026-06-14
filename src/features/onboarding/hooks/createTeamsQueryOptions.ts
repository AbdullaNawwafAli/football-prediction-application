import { queryOptions } from "@tanstack/react-query"
import type { UseQueryOptions } from "@tanstack/react-query"
import type { Team } from "#/features/onboarding/types/teams"
import { getTeamsApi } from "#/features/onboarding/services/getTeams"

export default function createTeamsQueryOptions<TData = Team[], TError = Error>(
  options?: Omit<UseQueryOptions<Team[], TError, TData>, "queryKey" | "queryFn">
) {
  return queryOptions({
    // Team rosters/crests are fixed for the tournament — never auto-refetch.
    staleTime: Infinity,
    ...options,
    queryKey: ["teams"],
    queryFn: () => getTeamsApi(),
  })
}
