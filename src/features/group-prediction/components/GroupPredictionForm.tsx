import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { AlertCircle, Lock } from 'lucide-react'
import { useAuthStore } from '#/stores/auth.store'
import { Button } from '#/components/shadcn/ui/button'
import { Spinner } from '#/components/shadcn/ui/spinner'
import createGroupsQueryOptions from '../hooks/createGroupsQueryOptions'
import createGroupPredictionsQueryOptions from '../hooks/createGroupPredictionsQueryOptions'
import createGroupStageOpenQueryOptions from '../hooks/createGroupStageOpenQueryOptions'
import { upsertGroupStagePredictionApi } from '../services/upsertGroupStagePrediction'
import { GroupOrderList } from './GroupOrderList'
import type { PredictionState } from '../types/groupPrediction'

export function GroupPredictionForm() {
  const profile = useAuthStore((s) => s.profile)
  const userId = profile!.id
  const queryClient = useQueryClient()

  const { data: groups } = useSuspenseQuery(createGroupsQueryOptions())
  const { data: existingPredictions } = useSuspenseQuery(
    createGroupPredictionsQueryOptions(userId),
  )
  const { data: isOpen } = useSuspenseQuery(createGroupStageOpenQueryOptions())

  const defaultOrder = (groupName: string) =>
    groups.find((g) => g.groupName === groupName)?.teams.map((t) => t.id) ?? []

  const [predictions, setPredictions] = useState<PredictionState>(() =>
    Object.fromEntries(
      groups.map((g) => [
        g.groupName,
        existingPredictions[g.groupName] ?? defaultOrder(g.groupName),
      ]),
    ),
  )

  useEffect(() => {
    setPredictions(
      Object.fromEntries(
        groups.map((g) => [
          g.groupName,
          existingPredictions[g.groupName] ?? defaultOrder(g.groupName),
        ]),
      ),
    )
  }, [existingPredictions])

  const isOffline = !navigator.onLine

  const { mutate, isPending } = useMutation({
    mutationFn: (state: PredictionState) =>
      Promise.all(
        Object.entries(state).map(([group, predictedOrder]) =>
          upsertGroupStagePredictionApi({ userId, group, predictedOrder }),
        ),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['group-stage-predictions', userId],
      })
      toast.success('Predictions saved!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  function handleOrderChange(groupName: string, newOrder: number[]) {
    setPredictions((prev) => ({ ...prev, [groupName]: newOrder }))
  }

  const canSubmit = isOpen && !isOffline && !isPending

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Group Stage Predictions
        </h1>
        <p className="text-sm text-muted-foreground">
          Drag teams into your predicted finishing order for each group.
        </p>
      </div>

      {!isOpen && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <Lock className="size-4 shrink-0" />
          <span>
            Group stage predictions are locked. The first match has started.
          </span>
        </div>
      )}

      {isOffline && (
        <div className="flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-700 dark:text-yellow-400">
          <AlertCircle className="size-4 shrink-0" />
          <span>
            You are offline. Predictions cannot be submitted until you
            reconnect.
          </span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {groups.map((group) => (
          <GroupOrderList
            key={group.groupName}
            group={group}
            order={
              predictions[group.groupName] ?? defaultOrder(group.groupName)
            }
            onOrderChange={(newOrder) =>
              handleOrderChange(group.groupName, newOrder)
            }
            isLocked={!isOpen}
          />
        ))}
      </div>

      {isOpen && (
        <Button
          onClick={() => mutate(predictions)}
          disabled={!canSubmit}
          className="w-full sm:w-auto"
        >
          {isPending && <Spinner />}
          {isPending ? 'Saving...' : 'Save Predictions'}
        </Button>
      )}
    </div>
  )
}
