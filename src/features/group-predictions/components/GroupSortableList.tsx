import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { SortableTeamItem } from './SortableTeamItem'
import type { TeamInGroup } from '../types'

interface Props {
  groupName: string
  teams: TeamInGroup[]
  onReorder: (groupName: string, newTeams: TeamInGroup[]) => void
  disabled?: boolean
}

export function GroupSortableList({ groupName, teams, onReorder, disabled }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const ids = teams.map((t) => String(t.teamId))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = teams.findIndex((t) => String(t.teamId) === active.id)
    const newIndex = teams.findIndex((t) => String(t.teamId) === over.id)
    onReorder(groupName, arrayMove(teams, oldIndex, newIndex))
  }

  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Group {groupName}
      </h3>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="space-y-1">
            {teams.map((team, index) => (
              <SortableTeamItem
                key={team.teamId}
                id={String(team.teamId)}
                position={index + 1}
                team={team}
                disabled={disabled}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
