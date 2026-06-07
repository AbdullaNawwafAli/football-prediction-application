import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { cn } from '#/lib/shadcn/utils/utils'
import type { TeamInGroup } from '../types'

interface Props {
  id: string
  position: number
  team: TeamInGroup
  disabled?: boolean
}

export function SortableTeamItem({ id, position, team, disabled }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 rounded-md border bg-card px-3 py-2 text-sm select-none',
        isDragging && 'opacity-50 shadow-lg z-10',
        disabled ? 'cursor-default' : 'cursor-grab active:cursor-grabbing',
      )}
    >
      <span className="w-5 text-center text-xs font-semibold text-muted-foreground">
        {position}
      </span>

      {team.crestUrl ? (
        <img src={team.crestUrl} alt={team.tla ?? team.name} className="h-6 w-6 object-contain" />
      ) : (
        <div className="h-6 w-6 rounded-full bg-muted" />
      )}

      <span className="flex-1 font-medium">{team.tla ?? team.name}</span>

      {!disabled && (
        <GripVertical
          className="h-4 w-4 touch-none text-muted-foreground"
          {...attributes}
          {...listeners}
        />
      )}
    </div>
  )
}
