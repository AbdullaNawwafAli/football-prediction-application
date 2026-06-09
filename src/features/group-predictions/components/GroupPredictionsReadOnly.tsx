import { useSuspenseQuery } from '@tanstack/react-query'
import { createGroupsQueryOptions } from '../hooks/createGroupsQueryOptions'
import { createUserPredictionsQueryOptions } from '../hooks/createUserPredictionsQueryOptions'
import { createLockStatusQueryOptions } from '../hooks/createLockStatusQueryOptions'
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
  userId: string
}

function buildOrderedTeams(
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

export function GroupPredictionsReadOnly({ userId }: Props) {
  const { data: groups } = useSuspenseQuery(createGroupsQueryOptions())
  const { data: predictionsMap } = useSuspenseQuery(createUserPredictionsQueryOptions(userId, 5 * 60 * 1000))
  const { data: isOpen } = useSuspenseQuery(createLockStatusQueryOptions())

  const hasPredictions = Object.keys(predictionsMap).length > 0
  const orderedTeams = buildOrderedTeams(groups, predictionsMap)
  const showCorrectness = !isOpen

  if (!hasPredictions) {
    return (
      <div className="h-full flex items-center justify-center px-4 py-12">
        <p className="text-sm text-muted-foreground text-center">
          This user hasn't made group predictions yet.
        </p>
      </div>
    )
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
                    teams={orderedTeams[groupName] ?? []}
                    onReorder={() => {}}
                    disabled={true}
                    showCorrectness={showCorrectness}
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
            teams={orderedTeams[groupName] ?? []}
            onReorder={() => {}}
            disabled={true}
            showCorrectness={showCorrectness}
          />
        ))}
      </div>
    </div>
  )
}
