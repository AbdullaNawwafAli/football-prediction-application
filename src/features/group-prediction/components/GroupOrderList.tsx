import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import type { GroupData } from '../types/groupPrediction'
import { SortableTeamRow } from './SortableTeamRow'

type Props = {
  group: GroupData
  order: number[]
  onOrderChange: (newOrder: number[]) => void
  isLocked: boolean
}

export function GroupOrderList({
  group,
  order,
  onOrderChange,
  isLocked,
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const orderedTeams = order
    .map((id) => group.teams.find((t) => t.id === id))
    .filter(Boolean) as typeof group.teams

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = order.indexOf(active.id as number)
      const newIndex = order.indexOf(over.id as number)
      onOrderChange(arrayMove(order, oldIndex, newIndex))
    }
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="border-b bg-muted/50 px-4 py-2">
        <h3 className="text-sm font-semibold">Group {group.groupName}</h3>
      </div>
      <div className="p-2 space-y-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={order} strategy={verticalListSortingStrategy}>
            {orderedTeams.map((team, index) => (
              <SortableTeamRow
                key={team.id}
                team={team}
                position={index + 1}
                isLocked={isLocked}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  )
}
