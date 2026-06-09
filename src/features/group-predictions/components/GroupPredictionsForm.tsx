import { useEffect, useState } from 'react'
import { useMutation, useSuspenseQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '#/stores/auth.store'
import { createGroupsQueryOptions } from '../hooks/createGroupsQueryOptions'
import { createUserPredictionsQueryOptions } from '../hooks/createUserPredictionsQueryOptions'
import { createLockStatusQueryOptions } from '../hooks/createLockStatusQueryOptions'
import { upsertGroupPredictions } from '../services/upsertGroupPredictions'
import { GroupSortableList } from './GroupSortableList'
import { Card } from '#/components/shadcn/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '#/components/shadcn/ui/carousel'
import type { TeamInGroup, GroupOrder, GroupPredictionsMap } from '../types'

type Props = {
  submitRef?: React.RefObject<(() => void) | null>
  onMutationStateChange?: (state: { isPending: boolean; canSubmit: boolean }) => void
}

function buildInitialOrder(
  groups: GroupOrder[],
  predictionsMap: GroupPredictionsMap,
): Record<string, TeamInGroup[]> {
  const result: Record<string, TeamInGroup[]> = {}

  for (const { groupName, teams } of groups) {
    const picks = predictionsMap[groupName]
    if (picks && picks.length === teams.length) {
      const teamById = new Map(teams.map((t) => [t.teamId, t]))
      const ordered = picks
        .map((p) => {
          const team = teamById.get(p.teamId)
          return team ? { ...team, isCorrect: p.isCorrect } : undefined
        })
        .filter(Boolean) as TeamInGroup[]
      result[groupName] = ordered.length === teams.length ? ordered : [...teams]
    } else {
      result[groupName] = [...teams]
    }
  }

  return result
}

export function GroupPredictionsForm({ submitRef, onMutationStateChange }: Props) {
  const queryClient = useQueryClient()
  const profile = useAuthStore((s) => s.profile)
  const userId = profile!.id

  const { data: groups } = useSuspenseQuery(createGroupsQueryOptions())
  const { data: predictionsMap } = useSuspenseQuery(createUserPredictionsQueryOptions(userId))
  const { data: isOpen } = useSuspenseQuery(createLockStatusQueryOptions())

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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['group-predictions', 'user-predictions', userId] })
      toast.success('Predictions saved.')
    },
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
    <div className="h-full flex flex-col px-4 py-6">
      {/* Mobile: one group per slide (vertical) */}
      <div className="sm:hidden flex-1 flex items-center justify-center py-14">
        <Carousel orientation="vertical" opts={{ loop: false, watchDrag: false }} className="w-full">
          <CarouselContent className="h-72">
            {groups.map(({ groupName }) => (
              <CarouselItem key={groupName} className="flex items-center justify-center">
                <Card className="w-full p-4">
                  <GroupSortableList
                    groupName={groupName}
                    teams={order[groupName] ?? []}
                    onReorder={handleReorder}
                    disabled={!isOpen}
                    showCorrectness={!isOpen}
                  />
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      {/* Desktop: all groups in grid */}
      <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-4">
        {groups.map(({ groupName }) => (
          <GroupSortableList
            key={groupName}
            groupName={groupName}
            teams={order[groupName] ?? []}
            onReorder={handleReorder}
            disabled={!isOpen}
            showCorrectness={!isOpen}
          />
        ))}
      </div>
    </div>
  )
}
