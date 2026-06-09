import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Check, X } from 'lucide-react'
import { cn } from '#/lib/shadcn/utils/utils'
import type { TeamInGroup } from '../types'

interface Props {
  id: string
  position: number
  team: TeamInGroup
  disabled?: boolean
  showCorrectness?: boolean
}

export function SortableTeamItem({ id, position, team, disabled, showCorrectness }: Props) {
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
      {...(!disabled ? { ...attributes, ...listeners } : {})}
    >
      <span className="w-5 text-center text-xs font-semibold text-muted-foreground">
        {position}
      </span>

      {team.crestUrl ? (
        <img src={team.crestUrl} alt={team.shortName ?? team.name} className="h-6 w-6 object-contain" />
      ) : (
        <div className="h-6 w-6 rounded-full bg-muted" />
      )}

      <span className="flex-1 font-medium">{team.shortName ?? team.name}</span>

      {showCorrectness && team.isCorrect !== undefined ? (
        team.isCorrect ? (
          <Check className="h-4 w-4 text-green-500 shrink-0" />
        ) : (
          <X className="h-4 w-4 text-red-500 shrink-0" />
        )
      ) : null}
    </div>
  )
}
