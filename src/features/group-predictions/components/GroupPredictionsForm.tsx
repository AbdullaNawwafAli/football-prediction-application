import { useEffect, useState } from 'react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useAuthStore } from '#/stores/auth.store'
import { Button } from '#/components/shadcn/ui/button'
import { createGroupsQueryOptions } from '../hooks/createGroupsQueryOptions'
import { createUserPredictionsQueryOptions } from '../hooks/createUserPredictionsQueryOptions'
import { createLockStatusQueryOptions } from '../hooks/createLockStatusQueryOptions'
import { createFirstGroupMatchQueryOptions } from '../hooks/createFirstGroupMatchQueryOptions'
import { upsertGroupPredictions } from '../services/upsertGroupPredictions'
import { GroupSortableList } from './GroupSortableList'
import { LockCountdownBanner } from '#/components/LockCountdownBanner'
import type { TeamInGroup, GroupOrder } from '../types'

function buildInitialOrder(
  groups: GroupOrder[],
  predictionsMap: Record<string, number[]>,
): Record<string, TeamInGroup[]> {
  const result: Record<string, TeamInGroup[]> = {}

  for (const { groupName, teams } of groups) {
    const pickedIds = predictionsMap[groupName]
    if (pickedIds && pickedIds.length === teams.length) {
      const teamById = new Map(teams.map((t) => [t.teamId, t]))
      const ordered = pickedIds.map((id) => teamById.get(id)).filter(Boolean) as TeamInGroup[]
      result[groupName] = ordered.length === teams.length ? ordered : [...teams]
    } else {
      result[groupName] = [...teams]
    }
  }

  return result
}

export function GroupPredictionsForm() {
  const profile = useAuthStore((s) => s.profile)
  const userId = profile!.id

  const { data: groups } = useSuspenseQuery(createGroupsQueryOptions())
  const { data: predictionsMap } = useSuspenseQuery(createUserPredictionsQueryOptions(userId))
  const { data: isOpen } = useSuspenseQuery(createLockStatusQueryOptions())
  const { data: firstMatchTime } = useSuspenseQuery(createFirstGroupMatchQueryOptions())

  const [order, setOrder] = useState<Record<string, TeamInGroup[]>>(() =>
    buildInitialOrder(groups, predictionsMap),
  )

  useEffect(() => {
    setOrder(buildInitialOrder(groups, predictionsMap))
  }, [groups, predictionsMap])

  const mutation = useMutation({
    mutationFn: () => {
      const predictions: Record<string, number[]> = {}
      for (const [groupName, teams] of Object.entries(order)) {
        predictions[groupName] = teams.map((t) => t.teamId)
      }
      return upsertGroupPredictions(userId, predictions)
    },
  })

  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine
  const canSubmit = isOpen && !isOffline && !mutation.isPending

  function handleReorder(groupName: string, newTeams: TeamInGroup[]) {
    setOrder((prev) => ({ ...prev, [groupName]: newTeams }))
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      <LockCountdownBanner isOpen={isOpen} firstMatchTime={firstMatchTime} />

      {mutation.isSuccess && (
        <div className="rounded-md border border-green-300/50 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-700/50 dark:bg-green-950/20 dark:text-green-400">
          Predictions saved.
        </div>
      )}

      {mutation.isError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Failed to save predictions. Please try again.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {groups.map(({ groupName }) => (
          <GroupSortableList
            key={groupName}
            groupName={groupName}
            teams={order[groupName] ?? []}
            onReorder={handleReorder}
            disabled={!isOpen}
          />
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={() => mutation.mutate()}
          disabled={!canSubmit}
        >
          {mutation.isPending ? 'Saving…' : 'Save Predictions'}
        </Button>
        {isOffline && (
          <span className="text-sm text-muted-foreground">You are offline — saving is disabled.</span>
        )}
      </div>
    </div>
  )
}
