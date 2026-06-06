import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import type { TeamInGroup } from '../types/groupPrediction'

type Props = {
  team: TeamInGroup
  position: number
  isLocked: boolean
}

export function SortableTeamRow({ team, position, isLocked }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: team.id,
    disabled: isLocked,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-md border bg-card px-3 py-2 select-none"
    >
      {!isLocked && (
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical className="size-4" />
        </button>
      )}
      <span className="w-5 text-center text-sm font-semibold text-muted-foreground">
        {position}
      </span>
      {team.crest_url ? (
        <img
          src={team.crest_url}
          alt={team.name}
          className="size-6 object-contain"
        />
      ) : (
        <div className="size-6 rounded-full bg-muted" />
      )}
      <span className="flex-1 text-sm font-medium">{team.name}</span>
      {team.tla && (
        <span className="text-xs text-muted-foreground">{team.tla}</span>
      )}
    </div>
  )
}
