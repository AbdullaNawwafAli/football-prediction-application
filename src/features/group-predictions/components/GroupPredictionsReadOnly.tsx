import { useSuspenseQuery } from '@tanstack/react-query'
import { createGroupsQueryOptions } from '../hooks/createGroupsQueryOptions'
import { createUserPredictionsQueryOptions } from '../hooks/createUserPredictionsQueryOptions'
import { GroupSortableList } from './GroupSortableList'
import { Card } from '#/components/shadcn/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '#/components/shadcn/ui/carousel'
import type { TeamInGroup, GroupOrder } from '../types'

type Props = {
  userId: string
}

function buildOrderedTeams(
  groups: GroupOrder[],
  predictionsMap: Record<string, number[]>,
): Record<string, TeamInGroup[]> {
  const result: Record<string, TeamInGroup[]> = {}
  for (const { groupName, teams } of groups) {
    const pickedIds = predictionsMap[groupName]
    if (pickedIds.length === teams.length) {
      const teamById = new Map(teams.map((t) => [t.teamId, t]))
      const ordered = pickedIds.map((id) => teamById.get(id)).filter(Boolean) as TeamInGroup[]
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

  const orderedTeams = buildOrderedTeams(groups, predictionsMap)

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
          />
        ))}
      </div>
    </div>
  )
}
