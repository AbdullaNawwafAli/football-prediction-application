import { useEffect, useState } from 'react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '#/stores/auth.store'
import { createGroupsQueryOptions } from '../hooks/createGroupsQueryOptions'
import { createUserPredictionsQueryOptions } from '../hooks/createUserPredictionsQueryOptions'
import { createLockStatusQueryOptions } from '../hooks/createLockStatusQueryOptions'
import { createFirstGroupMatchQueryOptions } from '../hooks/createFirstGroupMatchQueryOptions'
import { upsertGroupPredictions } from '../services/upsertGroupPredictions'
import { GroupSortableList } from './GroupSortableList'
import { LockCountdownBanner } from '#/components/LockCountdownBanner'
import type { TeamInGroup, GroupOrder } from '../types'

type Props = {
  submitRef?: React.RefObject<(() => void) | null>
  onMutationStateChange?: (state: { isPending: boolean; canSubmit: boolean }) => void
}

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

export function GroupPredictionsForm({ submitRef, onMutationStateChange }: Props) {
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
    onSuccess: () => toast.success('Predictions saved.'),
    onError: () => toast.error('Failed to save predictions. Please try again.'),
  })

  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine
  const canSubmit = isOpen && !isOffline && !mutation.isPending

  useEffect(() => {
    if (submitRef) submitRef.current = () => mutation.mutate()
  })

  useEffect(() => {
    onMutationStateChange?.({ isPending: mutation.isPending, canSubmit })
  }, [mutation.isPending, canSubmit])

  function handleReorder(groupName: string, newTeams: TeamInGroup[]) {
    setOrder((prev) => ({ ...prev, [groupName]: newTeams }))
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      <LockCountdownBanner isOpen={isOpen} firstMatchTime={firstMatchTime} />

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

    </div>
  )
}
