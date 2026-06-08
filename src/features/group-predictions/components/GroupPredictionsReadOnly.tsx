import { useSuspenseQuery } from '@tanstack/react-query'
import { createGroupsQueryOptions } from '../hooks/createGroupsQueryOptions'
import { createUserPredictionsQueryOptions } from '../hooks/createUserPredictionsQueryOptions'
import { GroupSortableList } from './GroupSortableList'
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
  const { data: predictionsMap } = useSuspenseQuery(createUserPredictionsQueryOptions(userId))

  const orderedTeams = buildOrderedTeams(groups, predictionsMap)

  return (
    <div className="px-4 py-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
